import uuid
from datetime import date, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import and_, func, select

from app.api.deps import (
    CurrentUser,
    SessionDep,
)
from app.models import (
    Attendance,
    LeaveRequest,
    LeaveStatus,
    TeamAssignment,
    User,
    UserRole,
)

router = APIRouter()


@router.get("/attendance-summary")
def get_attendance_summary(
    session: SessionDep,
    current_user: CurrentUser,
    start_date: date,
    end_date: date,
    site_location: str | None = None,
    team_name: str | None = None,
    supervisor_id: uuid.UUID | None = None,
) -> Any:
    """
    Get attendance summary report for a date range.
    """
    if current_user.role == UserRole.LABORER:
        raise HTTPException(
            status_code=403,
            detail="Laborers cannot access attendance summaries"
        )
    
    # Base query
    statement = select(Attendance).where(
        and_(
            Attendance.date >= start_date,
            Attendance.date <= end_date
        )
    )
    
    # Apply filters based on user role
    if current_user.role == UserRole.SUPERVISOR:
        # Get supervised employees
        supervised_stmt = select(User.id).where(User.supervisor_id == current_user.id)
        supervised_ids = session.exec(supervised_stmt).all()
        statement = statement.where(Attendance.employee_id.in_(supervised_ids))
    else:
        # Admin can filter by supervisor
        if supervisor_id:
            supervised_stmt = select(User.id).where(User.supervisor_id == supervisor_id)
            supervised_ids = session.exec(supervised_stmt).all()
            statement = statement.where(Attendance.employee_id.in_(supervised_ids))
    
    # Apply additional filters
    if site_location or team_name:
        # Need to join with team assignments
        team_stmt = select(TeamAssignment.laborer_id).where(TeamAssignment.is_active == True)
        if site_location:
            team_stmt = team_stmt.where(TeamAssignment.site_location == site_location)
        if team_name:
            team_stmt = team_stmt.where(TeamAssignment.team_name == team_name)
        
        team_member_ids = session.exec(team_stmt).all()
        statement = statement.where(Attendance.employee_id.in_(team_member_ids))
    
    attendance_records = session.exec(statement).all()
    
    # Calculate summary statistics
    total_records = len(attendance_records)
    total_employees = len(set(record.employee_id for record in attendance_records))
    
    # Group by date
    daily_stats = {}
    for record in attendance_records:
        record_date = record.date
        if record_date not in daily_stats:
            daily_stats[record_date] = {
                "date": record_date,
                "employees": set(),
                "total_hours": 0,
                "checked_out": 0,
            }
        
        daily_stats[record_date]["employees"].add(record.employee_id)
        
        if record.check_out:
            daily_stats[record_date]["checked_out"] += 1
            delta = record.check_out - record.check_in
            hours = delta.total_seconds() / 3600
            if record.break_duration:
                hours -= record.break_duration / 60
            daily_stats[record_date]["total_hours"] += hours
    
    # Convert sets to counts and format data
    daily_summary = []
    for date_key, stats in daily_stats.items():
        daily_summary.append({
            "date": date_key,
            "employees_present": len(stats["employees"]),
            "employees_checked_out": stats["checked_out"],
            "total_hours_worked": round(stats["total_hours"], 2),
            "average_hours_per_employee": round(
                stats["total_hours"] / len(stats["employees"]), 2
            ) if len(stats["employees"]) > 0 else 0,
        })
    
    # Sort by date
    daily_summary.sort(key=lambda x: x["date"])
    
    # Overall statistics
    total_hours = sum(day["total_hours_worked"] for day in daily_summary)
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date,
        },
        "filters": {
            "site_location": site_location,
            "team_name": team_name,
            "supervisor_id": supervisor_id,
        },
        "summary": {
            "total_attendance_records": total_records,
            "unique_employees": total_employees,
            "total_hours_worked": round(total_hours, 2),
            "average_daily_attendance": round(total_records / len(daily_summary), 2) if daily_summary else 0,
        },
        "daily_breakdown": daily_summary,
    }


@router.get("/leave-summary")
def get_leave_summary(
    session: SessionDep,
    current_user: CurrentUser,
    start_date: date,
    end_date: date,
    status: LeaveStatus | None = None,
    supervisor_id: uuid.UUID | None = None,
) -> Any:
    """
    Get leave requests summary for a date range.
    """
    if current_user.role == UserRole.LABORER:
        raise HTTPException(
            status_code=403,
            detail="Laborers cannot access leave summaries"
        )
    
    # Base query
    statement = select(LeaveRequest).where(
        and_(
            LeaveRequest.start_date <= end_date,
            LeaveRequest.end_date >= start_date
        )
    )
    
    # Apply filters based on user role
    if current_user.role == UserRole.SUPERVISOR:
        statement = statement.where(LeaveRequest.supervisor_id == current_user.id)
    else:
        # Admin can filter by supervisor
        if supervisor_id:
            statement = statement.where(LeaveRequest.supervisor_id == supervisor_id)
    
    # Apply status filter
    if status:
        statement = statement.where(LeaveRequest.status == status)
    
    leave_requests = session.exec(statement).all()
    
    # Calculate statistics
    total_requests = len(leave_requests)
    status_counts = {}
    leave_type_counts = {}
    
    for request in leave_requests:
        # Count by status
        status_counts[request.status] = status_counts.get(request.status, 0) + 1
        
        # Count by leave type
        leave_type_counts[request.leave_type] = leave_type_counts.get(request.leave_type, 0) + 1
    
    # Calculate leave days
    total_leave_days = 0
    for request in leave_requests:
        if request.status == LeaveStatus.APPROVED:
            delta = request.end_date - request.start_date
            total_leave_days += delta.days + 1
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date,
        },
        "filters": {
            "status": status,
            "supervisor_id": supervisor_id,
        },
        "summary": {
            "total_requests": total_requests,
            "approved_leave_days": total_leave_days,
            "status_breakdown": status_counts,
            "leave_type_breakdown": leave_type_counts,
        },
        "requests": leave_requests,
    }


@router.get("/team-performance")
def get_team_performance_report(
    session: SessionDep,
    current_user: CurrentUser,
    start_date: date,
    end_date: date,
) -> Any:
    """
    Get team performance report.
    """
    if current_user.role == UserRole.LABORER:
        raise HTTPException(
            status_code=403,
            detail="Laborers cannot access team performance reports"
        )
    
    # Get team assignments
    team_stmt = select(TeamAssignment).where(TeamAssignment.is_active == True)
    
    if current_user.role == UserRole.SUPERVISOR:
        team_stmt = team_stmt.where(TeamAssignment.supervisor_id == current_user.id)
    
    team_assignments = session.exec(team_stmt).all()
    
    team_performance = {}
    
    for assignment in team_assignments:
        team_key = f"{assignment.team_name}_{assignment.site_location or 'No Site'}"
        
        if team_key not in team_performance:
            team_performance[team_key] = {
                "team_name": assignment.team_name,
                "site_location": assignment.site_location,
                "supervisor_id": assignment.supervisor_id,
                "members": [],
                "total_attendance_days": 0,
                "total_hours_worked": 0,
                "total_leave_days": 0,
            }
        
        # Get laborer info
        laborer = session.get(User, assignment.laborer_id)
        if not laborer:
            continue
        
        # Get attendance for this laborer
        attendance_stmt = select(Attendance).where(
            and_(
                Attendance.employee_id == assignment.laborer_id,
                Attendance.date >= start_date,
                Attendance.date <= end_date
            )
        )
        attendance_records = session.exec(attendance_stmt).all()
        
        # Calculate hours worked
        hours_worked = 0
        for record in attendance_records:
            if record.check_out:
                delta = record.check_out - record.check_in
                hours = delta.total_seconds() / 3600
                if record.break_duration:
                    hours -= record.break_duration / 60
                hours_worked += hours
        
        # Get leave requests for this laborer
        leave_stmt = select(LeaveRequest).where(
            and_(
                LeaveRequest.employee_id == assignment.laborer_id,
                LeaveRequest.start_date <= end_date,
                LeaveRequest.end_date >= start_date,
                LeaveRequest.status == LeaveStatus.APPROVED
            )
        )
        leave_requests = session.exec(leave_stmt).all()
        
        leave_days = 0
        for leave_req in leave_requests:
            delta = leave_req.end_date - leave_req.start_date
            leave_days += delta.days + 1
        
        # Add member data
        team_performance[team_key]["members"].append({
            "employee_id": laborer.id,
            "full_name": laborer.full_name,
            "employee_number": laborer.employee_id,
            "attendance_days": len(attendance_records),
            "hours_worked": round(hours_worked, 2),
            "leave_days": leave_days,
        })
        
        # Update team totals
        team_performance[team_key]["total_attendance_days"] += len(attendance_records)
        team_performance[team_key]["total_hours_worked"] += hours_worked
        team_performance[team_key]["total_leave_days"] += leave_days
    
    # Convert to list and calculate averages
    team_list = []
    for team_data in team_performance.values():
        member_count = len(team_data["members"])
        team_data["member_count"] = member_count
        team_data["average_attendance_per_member"] = round(
            team_data["total_attendance_days"] / member_count, 2
        ) if member_count > 0 else 0
        team_data["average_hours_per_member"] = round(
            team_data["total_hours_worked"] / member_count, 2
        ) if member_count > 0 else 0
        team_data["total_hours_worked"] = round(team_data["total_hours_worked"], 2)
        
        team_list.append(team_data)
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date,
        },
        "teams": team_list,
    }


@router.get("/dashboard-stats")
def get_dashboard_statistics(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Get dashboard statistics for the current user.
    """
    today = datetime.utcnow().date()
    
    if current_user.role == UserRole.LABORER:
        # Get personal statistics
        # Today's attendance
        today_attendance_stmt = select(Attendance).where(
            and_(
                Attendance.employee_id == current_user.id,
                Attendance.date == today
            )
        )
        today_attendance = session.exec(today_attendance_stmt).first()
        
        # Pending leave requests
        pending_leaves_stmt = select(func.count()).select_from(LeaveRequest).where(
            and_(
                LeaveRequest.employee_id == current_user.id,
                LeaveRequest.status == LeaveStatus.PENDING
            )
        )
        pending_leaves = session.exec(pending_leaves_stmt).one()
        
        # This month's attendance count
        month_start = today.replace(day=1)
        month_attendance_stmt = select(func.count()).select_from(Attendance).where(
            and_(
                Attendance.employee_id == current_user.id,
                Attendance.date >= month_start
            )
        )
        month_attendance = session.exec(month_attendance_stmt).one()
        
        return {
            "role": current_user.role,
            "today_checked_in": today_attendance is not None,
            "today_checked_out": today_attendance.check_out is not None if today_attendance else False,
            "pending_leave_requests": pending_leaves,
            "month_attendance_days": month_attendance,
        }
    
    elif current_user.role == UserRole.SUPERVISOR:
        # Get team statistics
        # Team members count
        team_members_stmt = select(func.count()).select_from(User).where(
            User.supervisor_id == current_user.id
        )
        team_members = session.exec(team_members_stmt).one()
        
        # Today's team attendance
        supervised_ids_stmt = select(User.id).where(User.supervisor_id == current_user.id)
        supervised_ids = session.exec(supervised_ids_stmt).all()
        
        today_team_attendance_stmt = select(func.count()).select_from(Attendance).where(
            and_(
                Attendance.employee_id.in_(supervised_ids),
                Attendance.date == today
            )
        )
        today_team_attendance = session.exec(today_team_attendance_stmt).one()
        
        # Pending leave requests for team
        pending_team_leaves_stmt = select(func.count()).select_from(LeaveRequest).where(
            LeaveRequest.supervisor_id == current_user.id,
            LeaveRequest.status == LeaveStatus.PENDING
        )
        pending_team_leaves = session.exec(pending_team_leaves_stmt).one()
        
        return {
            "role": current_user.role,
            "team_members": team_members,
            "today_team_attendance": today_team_attendance,
            "pending_leave_approvals": pending_team_leaves,
            "team_attendance_rate": round(
                (today_team_attendance / team_members * 100), 2
            ) if team_members > 0 else 0,
        }
    
    else:  # Admin
        # Get overall statistics
        # Total users by role
        total_users_stmt = select(func.count()).select_from(User).where(User.is_active == True)
        total_users = session.exec(total_users_stmt).one()
        
        laborers_stmt = select(func.count()).select_from(User).where(
            and_(User.role == UserRole.LABORER, User.is_active == True)
        )
        total_laborers = session.exec(laborers_stmt).one()
        
        supervisors_stmt = select(func.count()).select_from(User).where(
            and_(User.role == UserRole.SUPERVISOR, User.is_active == True)
        )
        total_supervisors = session.exec(supervisors_stmt).one()
        
        # Today's overall attendance
        today_attendance_stmt = select(func.count()).select_from(Attendance).where(
            Attendance.date == today
        )
        today_attendance = session.exec(today_attendance_stmt).one()
        
        # All pending leave requests
        all_pending_leaves_stmt = select(func.count()).select_from(LeaveRequest).where(
            LeaveRequest.status == LeaveStatus.PENDING
        )
        all_pending_leaves = session.exec(all_pending_leaves_stmt).one()
        
        return {
            "role": current_user.role,
            "total_users": total_users,
            "total_laborers": total_laborers,
            "total_supervisors": total_supervisors,
            "today_attendance": today_attendance,
            "overall_attendance_rate": round(
                (today_attendance / total_laborers * 100), 2
            ) if total_laborers > 0 else 0,
            "pending_leave_requests": all_pending_leaves,
        }

import uuid
from datetime import date, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import and_, func, select

from app.api.deps import (
    CurrentUser,
    SessionDep,
)
from app.models import (
    Attendance,
    AttendanceCreate,
    AttendancePublic,
    AttendancesPublic,
    AttendanceUpdate,
    Message,
    User,
    UserRole,
)

router = APIRouter()


@router.get("/", response_model=AttendancesPublic)
def read_attendance_records(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    employee_id: uuid.UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> Any:
    """
    Retrieve attendance records.
    """
    statement = select(Attendance)
    count_statement = select(func.count()).select_from(Attendance)
    
    # Apply filters based on user role and permissions
    if current_user.role == UserRole.LABORER:
        # Laborers can only see their own attendance
        statement = statement.where(Attendance.employee_id == current_user.id)
        count_statement = count_statement.where(Attendance.employee_id == current_user.id)
    elif current_user.role == UserRole.SUPERVISOR:
        # Supervisors can see their team's attendance
        if employee_id:
            # Check if the employee is supervised by this supervisor
            employee = session.get(User, employee_id)
            if not employee or employee.supervisor_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not enough permissions")
            statement = statement.where(Attendance.employee_id == employee_id)
            count_statement = count_statement.where(Attendance.employee_id == employee_id)
        else:
            # Get all supervised employees' attendance
            supervised_stmt = select(User.id).where(User.supervisor_id == current_user.id)
            supervised_ids = session.exec(supervised_stmt).all()
            statement = statement.where(Attendance.employee_id.in_(supervised_ids))
            count_statement = count_statement.where(Attendance.employee_id.in_(supervised_ids))
    else:
        # Admin can see all attendance, optionally filtered by employee
        if employee_id:
            statement = statement.where(Attendance.employee_id == employee_id)
            count_statement = count_statement.where(Attendance.employee_id == employee_id)
    
    # Apply date filters
    if start_date:
        statement = statement.where(Attendance.date >= start_date)
        count_statement = count_statement.where(Attendance.date >= start_date)
    if end_date:
        statement = statement.where(Attendance.date <= end_date)
        count_statement = count_statement.where(Attendance.date <= end_date)
    
    # Execute queries
    count = session.exec(count_statement).one()
    statement = statement.offset(skip).limit(limit).order_by(Attendance.date.desc())
    attendance_records = session.exec(statement).all()
    
    return AttendancesPublic(data=attendance_records, count=count)


@router.get("/{id}", response_model=AttendancePublic)
def read_attendance_record(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Get attendance record by ID.
    """
    attendance = session.get(Attendance, id)
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    # Check permissions
    if current_user.role == UserRole.LABORER and attendance.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if current_user.role == UserRole.SUPERVISOR:
        employee = session.get(User, attendance.employee_id)
        if employee and employee.supervisor_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return attendance


@router.post("/", response_model=AttendancePublic)
def create_attendance_record(
    *, session: SessionDep, current_user: CurrentUser, attendance_in: AttendanceCreate
) -> Any:
    """
    Create new attendance record (check-in).
    """
    # Check if there's already an attendance record for today
    today = datetime.utcnow().date()
    existing_stmt = select(Attendance).where(
        and_(
            Attendance.employee_id == current_user.id,
            Attendance.date == today
        )
    )
    existing_attendance = session.exec(existing_stmt).first()
    
    if existing_attendance:
        raise HTTPException(
            status_code=400,
            detail="Attendance already recorded for today"
        )
    
    attendance = Attendance.model_validate(
        attendance_in,
        update={
            "employee_id": current_user.id,
            "date": today,
        },
    )
    session.add(attendance)
    session.commit()
    session.refresh(attendance)
    return attendance


@router.put("/{id}", response_model=AttendancePublic)
def update_attendance_record(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    attendance_in: AttendanceUpdate,
) -> Any:
    """
    Update attendance record (check-out, add notes, etc.).
    """
    attendance = session.get(Attendance, id)
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    # Check permissions - only the employee or admin can update
    if (
        current_user.role != UserRole.ADMIN
        and attendance.employee_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_dict = attendance_in.model_dump(exclude_unset=True)
    attendance.sqlmodel_update(update_dict)
    session.add(attendance)
    session.commit()
    session.refresh(attendance)
    return attendance


@router.post("/check-out/{id}", response_model=AttendancePublic)
def check_out(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Quick check-out for an attendance record.
    """
    attendance = session.get(Attendance, id)
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    # Check permissions
    if attendance.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if attendance.check_out:
        raise HTTPException(status_code=400, detail="Already checked out")
    
    attendance.check_out = datetime.utcnow()
    session.add(attendance)
    session.commit()
    session.refresh(attendance)
    return attendance


@router.get("/daily-summary/{date}")
def get_daily_attendance_summary(
    session: SessionDep,
    current_user: CurrentUser,
    date: date,
    site_location: str | None = None,
) -> Any:
    """
    Get daily attendance summary for reporting.
    Supervisors see their team, admins see all.
    """
    if current_user.role == UserRole.LABORER:
        raise HTTPException(
            status_code=403,
            detail="Laborers cannot access attendance summaries"
        )
    
    statement = select(Attendance).where(Attendance.date == date)
    
    if current_user.role == UserRole.SUPERVISOR:
        # Get supervised employees
        supervised_stmt = select(User.id).where(User.supervisor_id == current_user.id)
        supervised_ids = session.exec(supervised_stmt).all()
        statement = statement.where(Attendance.employee_id.in_(supervised_ids))
    
    attendance_records = session.exec(statement).all()
    
    # Calculate summary statistics
    total_employees = len(attendance_records)
    checked_out = len([a for a in attendance_records if a.check_out])
    still_working = total_employees - checked_out
    
    # Calculate total hours worked
    total_hours = 0
    for record in attendance_records:
        if record.check_out:
            delta = record.check_out - record.check_in
            hours = delta.total_seconds() / 3600
            if record.break_duration:
                hours -= record.break_duration / 60
            total_hours += hours
    
    return {
        "date": date,
        "total_employees": total_employees,
        "checked_out": checked_out,
        "still_working": still_working,
        "total_hours_worked": round(total_hours, 2),
        "average_hours_per_employee": round(total_hours / total_employees, 2) if total_employees > 0 else 0,
        "attendance_records": attendance_records,
    }

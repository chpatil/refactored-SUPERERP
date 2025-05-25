import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import and_, func, select

from app.api.deps import (
    CurrentUser,
    SessionDep,
)
from app.models import (
    Message,
    TeamAssignment,
    TeamAssignmentCreate,
    TeamAssignmentPublic,
    User,
    UserRole,
)

router = APIRouter()


@router.get("/", response_model=list[TeamAssignmentPublic])
def read_team_assignments(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    supervisor_id: uuid.UUID | None = None,
    is_active: bool = True,
) -> Any:
    """
    Retrieve team assignments.
    """
    statement = select(TeamAssignment).where(TeamAssignment.is_active == is_active)
    
    if current_user.role == UserRole.SUPERVISOR:
        # Supervisors can only see their own teams
        statement = statement.where(TeamAssignment.supervisor_id == current_user.id)
    elif current_user.role == UserRole.LABORER:
        # Laborers can only see their own assignments
        statement = statement.where(TeamAssignment.laborer_id == current_user.id)
    else:
        # Admin can see all, optionally filtered by supervisor
        if supervisor_id:
            statement = statement.where(TeamAssignment.supervisor_id == supervisor_id)
    
    statement = statement.offset(skip).limit(limit)
    team_assignments = session.exec(statement).all()
    
    return team_assignments


@router.get("/my-team", response_model=list[dict])
def get_my_team(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Get team members for a supervisor.
    """
    if current_user.role != UserRole.SUPERVISOR:
        raise HTTPException(
            status_code=403,
            detail="Only supervisors can access this endpoint"
        )
    
    # Get team assignments
    statement = select(TeamAssignment).where(
        and_(
            TeamAssignment.supervisor_id == current_user.id,
            TeamAssignment.is_active == True
        )
    )
    assignments = session.exec(statement).all()
    
    # Get laborer details
    team_members = []
    for assignment in assignments:
        laborer = session.get(User, assignment.laborer_id)
        if laborer:
            team_members.append({
                "assignment_id": assignment.id,
                "team_name": assignment.team_name,
                "site_location": assignment.site_location,
                "assigned_date": assignment.assigned_date,
                "laborer": {
                    "id": laborer.id,
                    "full_name": laborer.full_name,
                    "email": laborer.email,
                    "employee_id": laborer.employee_id,
                    "department": laborer.department,
                    "is_active": laborer.is_active,
                }
            })
    
    return team_members


@router.post("/", response_model=TeamAssignmentPublic)
def create_team_assignment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    assignment_in: TeamAssignmentCreate,
    laborer_id: uuid.UUID,
) -> Any:
    """
    Create new team assignment.
    Only admins can create team assignments.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Only admins can create team assignments"
        )
    
    # Verify laborer exists and has correct role
    laborer = session.get(User, laborer_id)
    if not laborer:
        raise HTTPException(status_code=404, detail="Laborer not found")
    
    if laborer.role != UserRole.LABORER:
        raise HTTPException(status_code=400, detail="User is not a laborer")
    
    # Check if laborer is already assigned to an active team
    existing_stmt = select(TeamAssignment).where(
        and_(
            TeamAssignment.laborer_id == laborer_id,
            TeamAssignment.is_active == True
        )
    )
    existing_assignment = session.exec(existing_stmt).first()
    
    if existing_assignment:
        raise HTTPException(
            status_code=400,
            detail="Laborer is already assigned to an active team"
        )
    
    # Get supervisor from laborer's supervisor_id
    if not laborer.supervisor_id:
        raise HTTPException(
            status_code=400,
            detail="Laborer must have a supervisor assigned"
        )
    
    assignment = TeamAssignment.model_validate(
        assignment_in,
        update={
            "supervisor_id": laborer.supervisor_id,
            "laborer_id": laborer_id,
        },
    )
    session.add(assignment)
    session.commit()
    session.refresh(assignment)
    return assignment


@router.put("/{id}", response_model=TeamAssignmentPublic)
def update_team_assignment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    assignment_in: TeamAssignmentCreate,
) -> Any:
    """
    Update team assignment.
    Only admins and the assigned supervisor can update.
    """
    assignment = session.get(TeamAssignment, id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Team assignment not found")
    
    # Check permissions
    if (
        current_user.role != UserRole.ADMIN
        and assignment.supervisor_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_dict = assignment_in.model_dump(exclude_unset=True)
    assignment.sqlmodel_update(update_dict)
    session.add(assignment)
    session.commit()
    session.refresh(assignment)
    return assignment


@router.delete("/{id}")
def deactivate_team_assignment(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Deactivate a team assignment.
    Only admins can deactivate assignments.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Only admins can deactivate team assignments"
        )
    
    assignment = session.get(TeamAssignment, id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Team assignment not found")
    
    assignment.is_active = False
    session.add(assignment)
    session.commit()
    return Message(message="Team assignment deactivated successfully")


@router.get("/team-stats/{supervisor_id}")
def get_team_statistics(
    session: SessionDep,
    current_user: CurrentUser,
    supervisor_id: uuid.UUID,
) -> Any:
    """
    Get team statistics for a supervisor.
    """
    # Check permissions
    if (
        current_user.role != UserRole.ADMIN
        and current_user.id != supervisor_id
    ):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Get active team assignments
    active_stmt = select(func.count()).select_from(TeamAssignment).where(
        and_(
            TeamAssignment.supervisor_id == supervisor_id,
            TeamAssignment.is_active == True
        )
    )
    active_count = session.exec(active_stmt).one()
    
    # Get total assignments (including inactive)
    total_stmt = select(func.count()).select_from(TeamAssignment).where(
        TeamAssignment.supervisor_id == supervisor_id
    )
    total_count = session.exec(total_stmt).one()
    
    # Get unique team names
    teams_stmt = select(TeamAssignment.team_name).where(
        and_(
            TeamAssignment.supervisor_id == supervisor_id,
            TeamAssignment.is_active == True
        )
    ).distinct()
    team_names = session.exec(teams_stmt).all()
    
    # Get unique site locations
    sites_stmt = select(TeamAssignment.site_location).where(
        and_(
            TeamAssignment.supervisor_id == supervisor_id,
            TeamAssignment.is_active == True
        )
    ).distinct()
    site_locations = session.exec(sites_stmt).all()
    
    return {
        "supervisor_id": supervisor_id,
        "active_assignments": active_count,
        "total_assignments": total_count,
        "teams": team_names,
        "sites": [site for site in site_locations if site],
        "team_count": len(team_names),
        "site_count": len([site for site in site_locations if site]),
    }

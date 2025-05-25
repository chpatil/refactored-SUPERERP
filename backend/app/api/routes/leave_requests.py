import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import and_, func, select

from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.models import (
    LeaveRequest,
    LeaveRequestCreate,
    LeaveRequestPublic,
    LeaveRequestsPublic,
    LeaveRequestUpdate,
    Message,
    User,
    UserRole,
)

router = APIRouter()


@router.get("/", response_model=LeaveRequestsPublic)
def read_leave_requests(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve leave requests.
    - Admin: can see all requests
    - Supervisor: can see their team's requests
    - Laborer: can see only their own requests
    """
    
    if current_user.role == UserRole.ADMIN:
        # Admin can see all leave requests
        count_statement = select(func.count()).select_from(LeaveRequest)
        count = session.exec(count_statement).one()
        
        statement = select(LeaveRequest).offset(skip).limit(limit)
        leave_requests = session.exec(statement).all()
        
    elif current_user.role == UserRole.SUPERVISOR:
        # Supervisor can see requests from their supervised workers
        count_statement = select(func.count()).select_from(LeaveRequest).where(
            LeaveRequest.supervisor_id == current_user.id
        )
        count = session.exec(count_statement).one()
        
        statement = (
            select(LeaveRequest)
            .where(LeaveRequest.supervisor_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        leave_requests = session.exec(statement).all()
        
    else:
        # Laborers can only see their own requests
        count_statement = select(func.count()).select_from(LeaveRequest).where(
            LeaveRequest.employee_id == current_user.id
        )
        count = session.exec(count_statement).one()
        
        statement = (
            select(LeaveRequest)
            .where(LeaveRequest.employee_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        leave_requests = session.exec(statement).all()

    return LeaveRequestsPublic(data=leave_requests, count=count)


@router.get("/{id}", response_model=LeaveRequestPublic)
def read_leave_request(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Get leave request by ID.
    """
    leave_request = session.get(LeaveRequest, id)
    if not leave_request:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    # Check permissions
    if (
        current_user.role == UserRole.LABORER
        and leave_request.employee_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if (
        current_user.role == UserRole.SUPERVISOR
        and leave_request.supervisor_id != current_user.id
        and leave_request.employee_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return leave_request


@router.post("/", response_model=LeaveRequestPublic)
def create_leave_request(
    *, session: SessionDep, current_user: CurrentUser, leave_request_in: LeaveRequestCreate
) -> Any:
    """
    Create new leave request.
    Only laborers can create leave requests for themselves.
    """
    if current_user.role not in [UserRole.LABORER, UserRole.SUPERVISOR]:
        raise HTTPException(
            status_code=403, 
            detail="Only laborers and supervisors can create leave requests"
        )
    
    # Find supervisor for the employee
    supervisor_id = current_user.supervisor_id
    if current_user.role == UserRole.SUPERVISOR:
        # If supervisor is creating for themselves, find their supervisor
        supervisor_stmt = select(User).where(
            and_(User.role == UserRole.ADMIN, User.is_active == True)
        )
        admin_user = session.exec(supervisor_stmt).first()
        supervisor_id = admin_user.id if admin_user else None
    
    leave_request = LeaveRequest.model_validate(
        leave_request_in,
        update={
            "employee_id": current_user.id,
            "supervisor_id": supervisor_id,
        },
    )
    session.add(leave_request)
    session.commit()
    session.refresh(leave_request)
    return leave_request


@router.put("/{id}", response_model=LeaveRequestPublic)
def update_leave_request(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    leave_request_in: LeaveRequestUpdate,
) -> Any:
    """
    Update leave request (approve/reject).
    Only supervisors and admins can update leave requests.
    """
    leave_request = session.get(LeaveRequest, id)
    if not leave_request:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    # Check permissions
    if current_user.role == UserRole.LABORER:
        raise HTTPException(
            status_code=403, 
            detail="Laborers cannot update leave requests"
        )
    
    if (
        current_user.role == UserRole.SUPERVISOR
        and leave_request.supervisor_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_dict = leave_request_in.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()
    leave_request.sqlmodel_update(update_dict)
    session.add(leave_request)
    session.commit()
    session.refresh(leave_request)
    return leave_request


@router.delete("/{id}")
def delete_leave_request(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a leave request.
    Only the employee who created it or admin can delete.
    """
    leave_request = session.get(LeaveRequest, id)
    if not leave_request:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    # Check permissions
    if (
        current_user.role != UserRole.ADMIN
        and leave_request.employee_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    session.delete(leave_request)
    session.commit()
    return Message(message="Leave request deleted successfully")

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel


# User Role Enum
class UserRole(str, Enum):
    ADMIN = "admin"
    SUPERVISOR = "supervisor"
    LABORER = "laborer"


# Leave Status Enum
class LeaveStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    role: UserRole = Field(default=UserRole.LABORER)
    employee_id: str | None = Field(default=None, max_length=50, index=True)
    department: str | None = Field(default=None, max_length=100)
    supervisor_id: uuid.UUID | None = Field(default=None, foreign_key="user.id")


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)
    workers: list["Worker"] = Relationship(back_populates="owner", cascade_delete=True)
    
    # Leave request relationships
    leave_requests_as_employee: list["LeaveRequest"] = Relationship(
        back_populates="employee",
        sa_relationship_kwargs={"foreign_keys": "[LeaveRequest.employee_id]"}
    )
    leave_requests_as_supervisor: list["LeaveRequest"] = Relationship(
        back_populates="supervisor",
        sa_relationship_kwargs={"foreign_keys": "[LeaveRequest.supervisor_id]"}
    )
    
    # Attendance relationship
    attendance_records: list["Attendance"] = Relationship(back_populates="employee")
    
    # Team relationships
    supervised_teams: list["TeamAssignment"] = Relationship(
        back_populates="supervisor",
        sa_relationship_kwargs={"foreign_keys": "[TeamAssignment.supervisor_id]"}
    )
    team_assignments: list["TeamAssignment"] = Relationship(
        back_populates="laborer",
        sa_relationship_kwargs={"foreign_keys": "[TeamAssignment.laborer_id]"}
    )


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)

# Add these with the other model imports/definitions

# Shared properties
class WorkerBase(SQLModel):
    name: str = Field(index=True, max_length=255)
    gender: str | None = Field(default=None, max_length=50)
    department: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=500)
    aadhar: str | None = Field(default=None, max_length=20)
    bankname: str | None = Field(default=None, max_length=255)
    ifscode: str | None = Field(default=None, max_length=20)
    accountno: str | None = Field(default=None, max_length=30)
    pfno: str | None = Field(default=None, max_length=30)
    esicno: str | None = Field(default=None, max_length=30)

# Properties to receive on worker creation
class WorkerCreate(WorkerBase):
    pass

# Properties to receive on worker update
class WorkerUpdate(WorkerBase):
    name: str | None = Field(default=None, max_length=255)

# Database model
class Worker(WorkerBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="user.id")
    owner: User | None = Relationship(back_populates="workers")

# Properties to return via API
class WorkerPublic(WorkerBase):
    id: uuid.UUID
    owner_id: uuid.UUID

# For listing workers
class WorkersPublic(SQLModel):
    data: list[WorkerPublic]
    count: int


# Leave Request Models
class LeaveRequestBase(SQLModel):
    leave_type: str = Field(max_length=50)  # "sick", "vacation", "personal", etc.
    start_date: datetime
    end_date: datetime
    reason: str = Field(max_length=500)
    status: LeaveStatus = Field(default=LeaveStatus.PENDING)


class LeaveRequestCreate(LeaveRequestBase):
    pass


class LeaveRequestUpdate(SQLModel):
    status: LeaveStatus
    supervisor_comments: str | None = Field(default=None, max_length=500)


class LeaveRequest(LeaveRequestBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    employee_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    supervisor_id: uuid.UUID | None = Field(foreign_key="user.id", nullable=True)
    supervisor_comments: str | None = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    employee: User | None = Relationship(
        back_populates="leave_requests_as_employee",
        sa_relationship_kwargs={"foreign_keys": "[LeaveRequest.employee_id]"}
    )
    supervisor: User | None = Relationship(
        back_populates="leave_requests_as_supervisor",
        sa_relationship_kwargs={"foreign_keys": "[LeaveRequest.supervisor_id]"}
    )


class LeaveRequestPublic(LeaveRequestBase):
    id: uuid.UUID
    employee_id: uuid.UUID
    supervisor_id: uuid.UUID | None
    supervisor_comments: str | None
    created_at: datetime
    updated_at: datetime


class LeaveRequestsPublic(SQLModel):
    data: list[LeaveRequestPublic]
    count: int


# Attendance Models
class AttendanceBase(SQLModel):
    check_in: datetime
    check_out: datetime | None = None
    break_duration: int | None = Field(default=0)  # in minutes
    location: str | None = Field(default=None, max_length=255)
    notes: str | None = Field(default=None, max_length=500)


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(SQLModel):
    check_out: datetime | None = None
    break_duration: int | None = None
    notes: str | None = Field(default=None, max_length=500)


class Attendance(AttendanceBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    employee_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    date: datetime = Field(default_factory=lambda: datetime.utcnow().date())
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    employee: User | None = Relationship(back_populates="attendance_records")


class AttendancePublic(AttendanceBase):
    id: uuid.UUID
    employee_id: uuid.UUID
    date: datetime
    created_at: datetime


class AttendancesPublic(SQLModel):
    data: list[AttendancePublic]
    count: int


# QR Code Login Models
class QRCodeBase(SQLModel):
    code: str = Field(unique=True, index=True, max_length=255)
    expires_at: datetime
    is_used: bool = Field(default=False)


class QRCodeCreate(QRCodeBase):
    pass


class QRCode(QRCodeBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class QRCodePublic(QRCodeBase):
    id: uuid.UUID
    created_at: datetime


# Team Assignment Models
class TeamAssignmentBase(SQLModel):
    team_name: str = Field(max_length=100)
    site_location: str | None = Field(default=None, max_length=255)


class TeamAssignmentCreate(TeamAssignmentBase):
    pass


class TeamAssignment(TeamAssignmentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    supervisor_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    laborer_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    assigned_date: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    
    supervisor: User | None = Relationship(
        back_populates="supervised_teams",
        sa_relationship_kwargs={"foreign_keys": "[TeamAssignment.supervisor_id]"}
    )
    laborer: User | None = Relationship(
        back_populates="team_assignments",
        sa_relationship_kwargs={"foreign_keys": "[TeamAssignment.laborer_id]"}
    )


class TeamAssignmentPublic(TeamAssignmentBase):
    id: uuid.UUID
    supervisor_id: uuid.UUID
    laborer_id: uuid.UUID
    assigned_date: datetime
    is_active: bool

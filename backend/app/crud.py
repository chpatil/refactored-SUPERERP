import uuid
from typing import Any

from sqlmodel import Session, select, func

from app.core.security import get_password_hash, verify_password
from app.models import Item, ItemCreate, User, UserCreate, UserUpdate ,Worker, WorkerCreate, WorkerUpdate


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_item(*, session: Session, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


def create_worker(*, session: Session, worker_in: WorkerCreate, owner_id: uuid.UUID) -> Worker:
    db_worker = Worker.model_validate(worker_in, update={"owner_id": owner_id})
    session.add(db_worker)
    session.commit()
    session.refresh(db_worker)
    return db_worker

def get_worker(*, session: Session, id: uuid.UUID) -> Worker | None:
    return session.get(Worker, id)

def get_workers(
    *, session: Session, skip: int = 0, limit: int = 100, owner_id: uuid.UUID | None = None
) -> list[Worker]:
    query = select(Worker)
    if owner_id is not None:
        query = query.where(Worker.owner_id == owner_id)
    return list(session.exec(query.offset(skip).limit(limit)))

def get_workers_count(*, session: Session, owner_id: uuid.UUID | None = None) -> int:
    query = select(Worker)
    if owner_id is not None:
        query = query.where(Worker.owner_id == owner_id)
    return session.exec(select(func.count()).select_from(query.subquery())).one()

def update_worker(*, session: Session, db_worker: Worker, worker_in: WorkerUpdate) -> Worker:
    worker_data = worker_in.model_dump(exclude_unset=True)
    db_worker.sqlmodel_update(worker_data)
    session.add(db_worker)
    session.commit()
    session.refresh(db_worker)
    return db_worker

def delete_worker(*, session: Session, id: uuid.UUID) -> Worker | None:
    worker = session.get(Worker, id)
    if not worker:
        return None
    session.delete(worker)
    session.commit()
    return worker
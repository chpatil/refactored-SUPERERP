from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.models import Worker, WorkerCreate, WorkerPublic, WorkerUpdate, WorkersPublic

router = APIRouter(prefix="/workers", tags=["workers"])


@router.get("/", response_model=WorkersPublic)
def read_workers(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve workers.
    """
    if current_user.is_superuser:
        workers = crud.get_workers(session=session, skip=skip, limit=limit)
        count = crud.get_workers_count(session=session)
    else:
        workers = crud.get_workers(
            session=session, skip=skip, limit=limit, owner_id=current_user.id
        )
        count = crud.get_workers_count(session=session, owner_id=current_user.id)
    return {"data": workers, "count": count}


@router.post("/", response_model=WorkerPublic)
def create_worker(
    *,
    session: SessionDep,
    worker_in: WorkerCreate,
    current_user: CurrentUser,
) -> Any:
    """
    Create new worker.
    """
    worker = crud.create_worker(
        session=session, worker_in=worker_in, owner_id=current_user.id
    )
    return worker


@router.get("/{id}", response_model=WorkerPublic)
def read_worker(
    *,
    session: SessionDep,
    id: str,
    current_user: CurrentUser,
) -> Any:
    """
    Get worker by ID.
    """
    worker = crud.get_worker(session=session, id=id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    if not current_user.is_superuser and (worker.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return worker


@router.put("/{id}", response_model=WorkerPublic)
def update_worker(
    *,
    session: SessionDep,
    id: str,
    worker_in: WorkerUpdate,
    current_user: CurrentUser,
) -> Any:
    """
    Update a worker.
    """
    worker = crud.get_worker(session=session, id=id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    if not current_user.is_superuser and (worker.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    worker = crud.update_worker(session=session, db_worker=worker, worker_in=worker_in)
    return worker


@router.delete("/{id}", response_model=WorkerPublic)
def delete_worker(
    *,
    session: SessionDep,
    id: str,
    current_user: CurrentUser,
) -> Any:
    """
    Delete a worker.
    """
    worker = crud.get_worker(session=session, id=id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    if not current_user.is_superuser and (worker.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    worker = crud.delete_worker(session=session, id=id)
    return worker
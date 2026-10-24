from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_super_admin
from app.models.category import Category
from app.models.user import User
from app.schemas.admin.categories import CategoryCreate, CategoryResponse, CategoryUpdate

router = APIRouter()


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    return db.query(Category).order_by(Category.name).all()


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    existing = db.query(Category).filter(Category.name == data.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="A category with this name already exists")
    cat = Category(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{cat_id}", response_model=CategoryResponse)
def update_category(
    cat_id: UUID,
    data: CategoryUpdate,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    if data.name and data.name != cat.name:
        existing = db.query(Category).filter(Category.name == data.name).first()
        if existing:
            raise HTTPException(status_code=409, detail="A category with this name already exists")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{cat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    cat_id: UUID,
    _: Annotated[User, Depends(require_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    cat.is_active = False
    db.commit()

import copy
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/api/forms", tags=["forms"])

DEFAULT_CREATOR_ID = "default-creator"


@router.get("", response_model=list[schemas.FormListItem])
def list_forms(db: Session = Depends(get_db)):
    forms = db.query(models.Form).filter(
        models.Form.creator_id == DEFAULT_CREATOR_ID
    ).order_by(models.Form.updated_at.desc()).all()

    counts = dict(
        db.query(models.Response.form_id, func.count(models.Response.id))
        .group_by(models.Response.form_id).all()
    )
    return [
        schemas.FormListItem(
            id=f.id, title=f.title, status=f.status, share_slug=f.share_slug,
            response_count=counts.get(f.id, 0), updated_at=f.updated_at,
        )
        for f in forms
    ]


@router.post("", response_model=schemas.FormWithQuestions)
def create_form(payload: schemas.FormCreate, db: Session = Depends(get_db)):
    form = models.Form(
        creator_id=DEFAULT_CREATOR_ID,
        title=payload.title,
        description=payload.description,
    )
    db.add(form)
    db.commit()
    db.refresh(form)
    return form


@router.get("/{form_id}", response_model=schemas.FormWithQuestions)
def get_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(404, "Form not found")
    return form


@router.patch("/{form_id}", response_model=schemas.FormWithQuestions)
def update_form(form_id: str, payload: schemas.FormUpdate, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(404, "Form not found")

    data = payload.model_dump(exclude_unset=True)
    for field in ("title", "description", "status"):
        if field in data:
            setattr(form, field, data[field])
    if "theme" in data and data["theme"] is not None:
        form.theme = data["theme"]
    if "welcome_screen" in data and data["welcome_screen"] is not None:
        form.welcome_screen = data["welcome_screen"]
    if "thankyou_screen" in data and data["thankyou_screen"] is not None:
        form.thankyou_screen = data["thankyou_screen"]

    db.commit()
    db.refresh(form)
    return form


@router.delete("/{form_id}")
def delete_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(404, "Form not found")
    db.delete(form)
    db.commit()
    return {"ok": True}


@router.post("/{form_id}/duplicate", response_model=schemas.FormWithQuestions)
def duplicate_form(form_id: str, db: Session = Depends(get_db)):
    original = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not original:
        raise HTTPException(404, "Form not found")

    clone = models.Form(
        creator_id=original.creator_id,
        title=f"{original.title} (copy)",
        description=original.description,
        status="draft",
        theme=copy.deepcopy(original.theme),
        welcome_screen=copy.deepcopy(original.welcome_screen),
        thankyou_screen=copy.deepcopy(original.thankyou_screen),
    )
    db.add(clone)
    db.flush()

    for q in original.questions:
        db.add(models.Question(
            form_id=clone.id, type=q.type, title=q.title, description=q.description,
            required=q.required, order_index=q.order_index,
            options=copy.deepcopy(q.options), settings=copy.deepcopy(q.settings),
            logic=copy.deepcopy(q.logic),
        ))
    db.commit()
    db.refresh(clone)
    return clone


@router.post("/{form_id}/publish", response_model=schemas.FormWithQuestions)
def publish_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(404, "Form not found")
    if not form.questions:
        raise HTTPException(400, "Cannot publish a form with no questions")
    form.status = "published"
    db.commit()
    db.refresh(form)
    return form


@router.post("/{form_id}/unpublish", response_model=schemas.FormWithQuestions)
def unpublish_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(404, "Form not found")
    form.status = "draft"
    db.commit()
    db.refresh(form)
    return form

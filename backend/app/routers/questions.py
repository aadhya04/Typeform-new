from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/api/forms/{form_id}/questions", tags=["questions"])

VALID_TYPES = {
    "short_text", "long_text", "multiple_choice", "dropdown",
    "email", "number", "yes_no", "rating", "file_upload",
}


def _get_form(db: Session, form_id: str) -> models.Form:
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(404, "Form not found")
    return form


@router.post("", response_model=schemas.QuestionOut)
def create_question(form_id: str, payload: schemas.QuestionCreate, db: Session = Depends(get_db)):
    _get_form(db, form_id)
    if payload.type not in VALID_TYPES:
        raise HTTPException(400, f"Invalid question type: {payload.type}")

    max_order = db.query(models.Question).filter(models.Question.form_id == form_id).count()
    q = models.Question(
        form_id=form_id, type=payload.type, title=payload.title,
        description=payload.description, required=payload.required,
        order_index=max_order, options=payload.options, settings=payload.settings,
        logic=payload.logic,
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


@router.patch("/{question_id}", response_model=schemas.QuestionOut)
def update_question(form_id: str, question_id: str, payload: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter(
        models.Question.id == question_id, models.Question.form_id == form_id
    ).first()
    if not q:
        raise HTTPException(404, "Question not found")

    data = payload.model_dump(exclude_unset=True)
    if "type" in data and data["type"] not in VALID_TYPES:
        raise HTTPException(400, f"Invalid question type: {data['type']}")
    for field, value in data.items():
        setattr(q, field, value)

    db.commit()
    db.refresh(q)
    return q


@router.delete("/{question_id}")
def delete_question(form_id: str, question_id: str, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter(
        models.Question.id == question_id, models.Question.form_id == form_id
    ).first()
    if not q:
        raise HTTPException(404, "Question not found")
    db.delete(q)
    db.commit()

    # Re-sequence order_index
    remaining = db.query(models.Question).filter(
        models.Question.form_id == form_id
    ).order_by(models.Question.order_index).all()
    for i, rq in enumerate(remaining):
        rq.order_index = i
    db.commit()
    return {"ok": True}


@router.post("/reorder")
def reorder_questions(form_id: str, payload: schemas.ReorderPayload, db: Session = Depends(get_db)):
    _get_form(db, form_id)
    questions = {
        q.id: q for q in db.query(models.Question).filter(models.Question.form_id == form_id).all()
    }
    if set(payload.ordered_ids) != set(questions.keys()):
        raise HTTPException(400, "ordered_ids must match the form's question ids")

    for index, qid in enumerate(payload.ordered_ids):
        questions[qid].order_index = index
    db.commit()
    return {"ok": True}

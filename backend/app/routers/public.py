import re
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/api/public", tags=["public"])

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_answer(question: models.Question, value):
    if question.required and (value is None or value == "" or value == []):
        raise HTTPException(400, f"'{question.title}' is required")
    if value in (None, "", []):
        return  # optional & empty, nothing more to check

    if question.type == "email" and not EMAIL_RE.match(str(value)):
        raise HTTPException(400, "Please enter a valid email address")
    if question.type == "number":
        try:
            float(value)
        except (TypeError, ValueError):
            raise HTTPException(400, "Please enter a valid number")
    if question.type in ("multiple_choice", "dropdown") and question.options:
        if value not in question.options:
            raise HTTPException(400, "Invalid option selected")
    if question.type == "rating":
        max_r = question.settings.get("max", 5) if question.settings else 5
        try:
            v = int(value)
        except (TypeError, ValueError):
            raise HTTPException(400, "Invalid rating")
        if v < 1 or v > max_r:
            raise HTTPException(400, f"Rating must be between 1 and {max_r}")


@router.get("/forms/{slug}", response_model=schemas.PublicFormOut)
def get_public_form(slug: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.share_slug == slug).first()
    if not form or form.status != "published":
        raise HTTPException(404, "This form is not available")
    return schemas.PublicFormOut(
        id=form.id, title=form.title, description=form.description,
        theme=form.theme, welcome_screen=form.welcome_screen,
        thankyou_screen=form.thankyou_screen,
        questions=[
            schemas.PublicQuestionOut(
                id=q.id, type=q.type, title=q.title, description=q.description,
                required=q.required, order_index=q.order_index,
                options=q.options, settings=q.settings, logic=q.logic,
            )
            for q in sorted(form.questions, key=lambda x: x.order_index)
        ],
    )


@router.post("/forms/{slug}/start")
def start_response(slug: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.share_slug == slug).first()
    if not form or form.status != "published":
        raise HTTPException(404, "This form is not available")
    response = models.Response(form_id=form.id)
    db.add(response)
    db.commit()
    db.refresh(response)
    return {"response_id": response.id}


@router.post("/responses/answer")
def submit_answer(payload: schemas.SubmitAnswerPayload, db: Session = Depends(get_db)):
    response = db.query(models.Response).filter(models.Response.id == payload.response_id).first()
    if not response:
        raise HTTPException(404, "Response not found")
    question = db.query(models.Question).filter(models.Question.id == payload.question_id).first()
    if not question or question.form_id != response.form_id:
        raise HTTPException(404, "Question not found")

    validate_answer(question, payload.value)

    answer = db.query(models.Answer).filter(
        models.Answer.response_id == response.id,
        models.Answer.question_id == question.id,
    ).first()
    if answer:
        answer.value = payload.value
    else:
        db.add(models.Answer(response_id=response.id, question_id=question.id, value=payload.value))

    response.last_question_index = payload.last_question_index
    db.commit()
    return {"ok": True}


@router.post("/responses/complete")
def complete_response(payload: schemas.CompleteResponsePayload, db: Session = Depends(get_db)):
    response = db.query(models.Response).filter(models.Response.id == payload.response_id).first()
    if not response:
        raise HTTPException(404, "Response not found")
    response.completed = True
    response.submitted_at = datetime.datetime.utcnow()
    db.commit()
    return {"ok": True}

import csv
import io
from collections import Counter
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/api/forms/{form_id}/responses", tags=["responses"])


def _get_form(db: Session, form_id: str) -> models.Form:
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(404, "Form not found")
    return form


@router.get("", response_model=list[schemas.ResponseOut])
def list_responses(form_id: str, db: Session = Depends(get_db)):
    _get_form(db, form_id)
    return db.query(models.Response).filter(
        models.Response.form_id == form_id
    ).order_by(models.Response.started_at.desc()).all()


@router.get("/{response_id}", response_model=schemas.ResponseOut)
def get_response(form_id: str, response_id: str, db: Session = Depends(get_db)):
    resp = db.query(models.Response).filter(
        models.Response.id == response_id, models.Response.form_id == form_id
    ).first()
    if not resp:
        raise HTTPException(404, "Response not found")
    return resp


@router.get("/stats/summary", response_model=schemas.FormStats)
def get_stats(form_id: str, db: Session = Depends(get_db)):
    form = _get_form(db, form_id)
    responses = db.query(models.Response).filter(models.Response.form_id == form_id).all()
    total = len(responses)
    completed = sum(1 for r in responses if r.completed)

    summaries = []
    for q in sorted(form.questions, key=lambda x: x.order_index):
        answers = [a.value for r in responses for a in r.answers if a.question_id == q.id]
        summary = schemas.QuestionSummary(
            question_id=q.id, title=q.title, type=q.type, total_answers=len(answers)
        )
        if q.type in ("multiple_choice", "dropdown", "yes_no"):
            summary.breakdown = dict(Counter(str(a) for a in answers))
        elif q.type in ("rating", "number"):
            nums = [float(a) for a in answers if a not in (None, "")]
            summary.average = round(sum(nums) / len(nums), 2) if nums else None
        summaries.append(summary)

    return schemas.FormStats(
        total_responses=total,
        completed_responses=completed,
        completion_rate=round(completed / total * 100, 1) if total else 0.0,
        question_summaries=summaries,
    )


@router.get("/export/csv")
def export_csv(form_id: str, db: Session = Depends(get_db)):
    form = _get_form(db, form_id)
    responses = db.query(models.Response).filter(models.Response.form_id == form_id).all()
    questions = sorted(form.questions, key=lambda x: x.order_index)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        ["response_id", "started_at", "submitted_at", "completed"]
        + [q.title for q in questions]
    )
    for r in responses:
        answer_map = {a.question_id: a.value for a in r.answers}
        writer.writerow(
            [r.id, r.started_at.isoformat(), r.submitted_at.isoformat() if r.submitted_at else "", r.completed]
            + [answer_map.get(q.id, "") for q in questions]
        )
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=form_{form_id}_responses.csv"},
    )

import uuid
import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, ForeignKey, DateTime, Text, JSON
)
from sqlalchemy.orm import relationship
from app.db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class Creator(Base):
    """Simplified creator - assignment allows a default logged-in creator."""
    __tablename__ = "creators"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, default="Default Creator")
    email = Column(String, unique=True, default="creator@example.com")

    forms = relationship("Form", back_populates="creator", cascade="all, delete-orphan")


class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True, default=gen_uuid)
    creator_id = Column(String, ForeignKey("creators.id"), nullable=False)
    title = Column(String, default="Untitled Form")
    description = Column(Text, default="")
    status = Column(String, default="draft")  # draft | published
    share_slug = Column(String, unique=True, default=gen_uuid, index=True)

    # Bonus: custom theme {primaryColor, background, font}
    theme = Column(JSON, default=lambda: {
        "primaryColor": "#FF3D71",
        "background": "#FFFFFF",
        "font": "Sohne, sans-serif",
    })
    welcome_screen = Column(JSON, default=lambda: {
        "enabled": True, "title": "Welcome!", "buttonText": "Start"
    })
    thankyou_screen = Column(JSON, default=lambda: {
        "title": "Thank you!", "message": "Your response has been recorded."
    })

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    creator = relationship("Creator", back_populates="forms")
    questions = relationship(
        "Question", back_populates="form", cascade="all, delete-orphan",
        order_by="Question.order_index"
    )
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=gen_uuid)
    form_id = Column(String, ForeignKey("forms.id"), nullable=False)
    type = Column(String, nullable=False)
    # short_text, long_text, multiple_choice, dropdown, email, number, yes_no, rating,
    # file_upload (placeholder)
    title = Column(String, nullable=False, default="")
    description = Column(Text, default="")
    required = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)

    # choice options for multiple_choice/dropdown: ["Option 1", "Option 2"]
    options = Column(JSON, default=list)
    # extra per-type settings e.g. {"max": 5} for rating
    settings = Column(JSON, default=dict)

    # Bonus: basic branching -> list of {condition: {op, value}, next_question_id}
    logic = Column(JSON, default=list)

    form = relationship("Form", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class Response(Base):
    __tablename__ = "responses"

    id = Column(String, primary_key=True, default=gen_uuid)
    form_id = Column(String, ForeignKey("forms.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False)  # Bonus: partial-response tracking
    last_question_index = Column(Integer, default=0)

    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=gen_uuid)
    response_id = Column(String, ForeignKey("responses.id"), nullable=False)
    question_id = Column(String, ForeignKey("questions.id"), nullable=False)
    value = Column(JSON, default=None)  # string, number, or list depending on type

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")

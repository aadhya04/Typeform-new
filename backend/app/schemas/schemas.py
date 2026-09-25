import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, ConfigDict


# ---------- Question ----------
class QuestionBase(BaseModel):
    type: str
    title: str = ""
    description: str = ""
    required: bool = False
    order_index: int = 0
    options: List[str] = []
    settings: Dict[str, Any] = {}
    logic: List[Dict[str, Any]] = []


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    required: Optional[bool] = None
    order_index: Optional[int] = None
    options: Optional[List[str]] = None
    settings: Optional[Dict[str, Any]] = None
    logic: Optional[List[Dict[str, Any]]] = None


class QuestionOut(QuestionBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    form_id: str


class ReorderPayload(BaseModel):
    ordered_ids: List[str]


# ---------- Form ----------
class ThemeModel(BaseModel):
    primaryColor: str = "#FF3D71"
    background: str = "#FFFFFF"
    font: str = "Sohne, sans-serif"


class WelcomeScreenModel(BaseModel):
    enabled: bool = True
    title: str = "Welcome!"
    buttonText: str = "Start"


class ThankyouScreenModel(BaseModel):
    title: str = "Thank you!"
    message: str = "Your response has been recorded."


class FormCreate(BaseModel):
    title: str = "Untitled Form"
    description: str = ""


class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    theme: Optional[ThemeModel] = None
    welcome_screen: Optional[WelcomeScreenModel] = None
    thankyou_screen: Optional[ThankyouScreenModel] = None


class FormOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: str
    status: str
    share_slug: str
    theme: Dict[str, Any]
    welcome_screen: Dict[str, Any]
    thankyou_screen: Dict[str, Any]
    created_at: datetime.datetime
    updated_at: datetime.datetime


class FormListItem(BaseModel):
    id: str
    title: str
    status: str
    share_slug: str
    response_count: int
    updated_at: datetime.datetime


class FormWithQuestions(FormOut):
    questions: List[QuestionOut] = []


# ---------- Public fill ----------
class PublicQuestionOut(BaseModel):
    id: str
    type: str
    title: str
    description: str
    required: bool
    order_index: int
    options: List[str]
    settings: Dict[str, Any]
    logic: List[Dict[str, Any]] = []


class PublicFormOut(BaseModel):
    id: str
    title: str
    description: str
    theme: Dict[str, Any]
    welcome_screen: Dict[str, Any]
    thankyou_screen: Dict[str, Any]
    questions: List[PublicQuestionOut]


class StartResponsePayload(BaseModel):
    pass


class AnswerPayload(BaseModel):
    question_id: str
    value: Any


class SubmitAnswerPayload(BaseModel):
    response_id: str
    question_id: str
    value: Any
    last_question_index: int = 0


class CompleteResponsePayload(BaseModel):
    response_id: str


# ---------- Responses / results ----------
class AnswerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    question_id: str
    value: Any


class ResponseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    form_id: str
    started_at: datetime.datetime
    submitted_at: Optional[datetime.datetime]
    completed: bool
    answers: List[AnswerOut]


class QuestionSummary(BaseModel):
    question_id: str
    title: str
    type: str
    total_answers: int
    breakdown: Optional[Dict[str, int]] = None  # for choice/dropdown/yes_no
    average: Optional[float] = None  # for rating/number


class FormStats(BaseModel):
    total_responses: int
    completed_responses: int
    completion_rate: float
    question_summaries: List[QuestionSummary]

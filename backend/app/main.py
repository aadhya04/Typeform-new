from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine, SessionLocal
from app.models import models
from app.routers import forms, questions, public, responses

Base.metadata.create_all(bind=engine)

# Ensure a default creator always exists (idempotent, lightweight vs full seed).
db = SessionLocal()
if not db.query(models.Creator).filter(models.Creator.id == "default-creator").first():
    db.add(models.Creator(id="default-creator", name="Default Creator", email="creator@example.com"))
    db.commit()
db.close()

app = FastAPI(title="Typeform Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "https://typeform-rho-cyan.vercel.app",
    "http://localhost:3000",
], # tighten in production to your deployed frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forms.router)
app.include_router(questions.router)
app.include_router(public.router)
app.include_router(responses.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}

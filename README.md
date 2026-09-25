Formify --- Typeform Clone

A functional Typeform-inspired form builder and response collection
platform built for the SDE Fullstack assignment.

Live Demo

Frontend: https://typeform-new.vercel.app/

Example public form:
https://typeform-new.vercel.app/f/event-registration

Backend API: https://typeform-new.onrender.com

API health: https://typeform-new.onrender.com/api/health

Swagger API docs: https://typeform-new.onrender.com/docs

Tech Stack

Frontend: Next.js 14, TypeScript, Tailwind CSS, Framer Motion,
@hello-pangea/dnd

Backend: Python, FastAPI, SQLAlchemy

Database: SQLite

Deployment: Vercel (frontend), Render (backend)

Features

Form Builder

Create forms with titles

Add, edit, reorder with drag-and-drop, and delete questions

Live preview

Required questions and description/help text

Theme customization

Settings placeholders

Question Types

Short text

Long text

Multiple choice

Dropdown

Email

Number

Yes / No

Rating

Form Management

List forms with draft/published status

Response counts

Create, rename, duplicate, and delete

Publish/unpublish

Copy public share links

Persistent form definitions

Respondent Experience

No login required

One question at a time

Full-screen conversational UI

Smooth transitions

Progress indicator

Keyboard navigation

Client and server validation

Response submission

Thank-you screen

Results

Response table

Individual response view

Question-level statistics

Completion rate

Partial-response tracking

CSV export

UX

Toast notifications

Modals

Dark mode

Responsive layouts

Seeded sample forms and responses

Architecture

Next.js Frontend
      |
      | REST API
      v
FastAPI Backend
      |
      | SQLAlchemy
      v
SQLite Database

Frontend routes include the dashboard, form builder, public form, and
results pages.

Backend routers are separated into forms, questions, public respondent
flow, and responses.


## Project Structure

```text
Typeform-new/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── seed.py
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── routers/
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── builder/[formId]/page.tsx
│   │   ├── f/[slug]/page.tsx
│   │   └── forms/[formId]/responses/page.tsx
│   ├── components/
│   ├── lib/
│   └── package.json
│
└── README.md

Database Schema

The database contains five main entities:

Creator --- default creator for the simplified no-auth
implementation.

Form --- title, status, share slug, theme, creator relationship,
and timestamps.

Question --- form relationship, type, title, description,
required flag, position, options, settings, and logic.

Response --- respondent session, form relationship, completion
state, and timestamps.

Answer --- response relationship, question relationship, and
stored value.

Relationship:

Creator 1 ─── N Form
Form    1 ─── N Question
Form    1 ─── N Response
Response 1 ── N Answer
Question 1 ── N Answer

API Overview

Forms

List forms

Create/update/delete forms

Duplicate forms

Publish/unpublish forms

Questions

Create/update/delete questions

Reorder questions

Public

Fetch published forms by slug

Start a response

Submit answers

Complete a response

Responses

List responses

View individual responses

Get summary statistics

Export CSV

FastAPI Swagger documentation is available at /docs.

Local Setup

Requirements

Node.js

Python 3.13+

npm

Backend

git clone https://github.com/aadhya04/Typeform-new.git
cd Typeform-new/backend
py -3.13 -m venv venv

Windows:

.env\Scriptsctivate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload --port 8000

Backend:

http://localhost:8000

Swagger:

http://localhost:8000/docs

Frontend

Open another terminal:

cd Typeform-new/frontend
npm install

Create frontend/.env.local:

NEXT_PUBLIC_API_URL=http://localhost:8000

Start Next.js:

npm run dev

Frontend:

http://localhost:3000

Seed Data

The seed script creates a default creator and demonstration data:

Customer Feedback Survey --- published

Event Registration --- published

Product Idea Brainstorm --- draft

The published forms contain mixed question types and sample responses.

Deployment

Vercel

The frontend directory is deployed as a Next.js application.

Production environment variable:

NEXT_PUBLIC_API_URL=https://typeform-new.onrender.com

Render

The backend directory is deployed as a Python service.

Build command:

pip install -r requirements.txt

Start command:

python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port $PORT

Design Decisions and Assumptions

Authentication is simplified to one default creator, as allowed by
the assignment.

Public respondents do not need accounts.

SQLite is used for persistence.

Answers use a flexible stored representation so multiple question
types can share the same answer model.

Advanced branching, integrations, team collaboration, payment, and
file-upload functionality are simplified or represented as
placeholders where applicable.

The respondent flow intentionally presents one question at a time to
reproduce the conversational Typeform experience.

The builder uses reusable question rendering for live preview.

Validation and Persistence

Client-side validation gives immediate feedback, while the FastAPI
backend validates submitted answers before persistence.

Form changes, question changes, publishing state, responses, and answers
are persisted through the API and SQLite database.

Assignment Notes

The implementation focuses on the required builder, public respondent
flow, form management, persistence, results, and Typeform-style UX.
Optional functionality such as CSV export, dark mode, themes, and
partial-response tracking is also included.

License

This is an assignment/demo project and is not affiliated with or
endorsed by Typeform.

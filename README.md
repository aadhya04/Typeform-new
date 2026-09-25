# Formify — Typeform Clone

A functional Typeform-style form builder and response collection app built for the SDE Fullstack assignment.

The project focuses on the main Typeform experience:

- Build forms
- Add and arrange questions
- Publish forms with a public link
- Collect responses one question at a time
- View results and statistics

## Live Demo

- **Frontend:** https://typeform-new.vercel.app/
- **Example Public Form:** https://typeform-new.vercel.app/f/event-registration
- **Backend API:** https://typeform-new.onrender.com
- **API Health:** https://typeform-new.onrender.com/api/health
- **Swagger API Docs:** https://typeform-new.onrender.com/docs
- **GitHub:** https://github.com/aadhya04/Typeform-new

---

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- @hello-pangea/dnd for drag and drop

### Backend
- Python
- FastAPI
- SQLAlchemy

### Database
- SQLite

### Deployment
- Vercel for frontend
- Render for backend

---

## Main Features

### 1. Form Builder

The builder allows the creator to:

- Create a form with a title
- Add questions
- Edit questions
- Reorder questions using drag and drop
- Delete questions
- Mark questions as required
- Add description/help text
- See a live preview
- Change the form theme
- Use settings placeholders

### Supported Question Types

- Short text
- Long text
- Multiple choice
- Dropdown
- Email
- Number
- Yes / No
- Rating

### 2. Form Management

The dashboard supports:

- View all forms
- See draft/published status
- See response count
- Create a new form
- Rename a form
- Duplicate a form
- Delete a form
- Publish a form
- Unpublish a form
- Copy the public form link

Form and question changes are saved to the backend database.

### 3. Respondent Experience

Published forms can be opened using a public link without login.

The respondent flow includes:

- Welcome screen
- One question at a time
- Full-screen conversational layout
- Smooth transitions
- Progress indicator
- Keyboard navigation
- Required-field validation
- Email validation
- Number validation
- Response saving
- Thank-you screen after submission

### 4. Results and Responses

The results page includes:

- Total responses
- Completed responses
- Partial responses
- Completion rate
- Question-level statistics
- Response list
- Individual response view
- CSV export

Partial responses are kept as `Partial` when a respondent starts a form but does not complete it. This is intentional and demonstrates partial-response tracking.

### 5. UI / UX

The interface includes:

- Typeform-inspired one-question-at-a-time experience
- Clean form builder
- Live preview
- Modals
- Toast notifications
- Dark mode
- Responsive layouts
- Smooth animations

---

## Architecture

The project uses a simple three-layer structure:

```text
Next.js Frontend
       |
       | REST API
       v
FastAPI Backend
       |
       | SQLAlchemy
       v
SQLite Database
````

The frontend handles the user interface.

The FastAPI backend handles form management, questions, public responses, validation, and results.

SQLite stores forms, questions, responses, and answers.

---

## Project Structure

```text
Typeform-new/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── seed.py
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── routers/
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── builder/[formId]/page.tsx
│   │   ├── f/[slug]/page.tsx
│   │   └── forms/[formId]/responses/page.tsx
│   │
│   ├── components/
│   ├── lib/
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Database Schema

The application uses five main tables/models.

### Creator

Stores the default creator used by the simplified no-auth setup.

### Form

Stores:

* Form title
* Draft/published status
* Public share slug
* Theme
* Creator
* Timestamps

### Question

Stores:

* Question type
* Question title
* Description
* Required status
* Position/order
* Options/settings

### Response

Stores:

* Form
* Respondent session
* Completion status
* Timestamps

### Answer

Stores:

* Response
* Question
* Answer value

### Relationships

```text
Creator 1 ─── N Form
Form    1 ─── N Question
Form    1 ─── N Response
Response 1 ── N Answer
Question 1 ── N Answer
```

---

## API Overview

### Forms

* List forms
* Create forms
* Update/rename forms
* Delete forms
* Duplicate forms
* Publish/unpublish forms

### Questions

* Create questions
* Update questions
* Delete questions
* Reorder questions

### Public Forms

* Get a published form using its slug
* Start a response
* Submit answers
* Complete a response

### Responses

* List responses
* View an individual response
* Get summary statistics
* Export responses as CSV

Swagger API documentation is available at:

[https://typeform-new.onrender.com/docs](https://typeform-new.onrender.com/docs)

---

## Local Setup

### Requirements

Install:

* Node.js
* npm
* Python 3.13+

### 1. Clone the repository

```bash
git clone https://github.com/aadhya04/Typeform-new.git
cd Typeform-new
```

### 2. Start the backend

Open a terminal:

```bash
cd backend
py -3.13 -m venv venv
```

#### Windows

```powershell
.\venv\Scripts\activate
```

Install the Python packages:

```bash
pip install -r requirements.txt
```

Seed the database:

```bash
python -m app.seed
```

Start FastAPI:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

### 3. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start Next.js:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## Seed Data

The seed script creates sample data so the application can be tested immediately.

It includes:

### Customer Feedback Survey

Published form with different question types and sample responses.

### Event Registration

Published form with different question types and sample responses.

### Product Idea Brainstorm

Draft form that can be edited and published from the dashboard.

---

## Deployment

### Frontend — Vercel

The `frontend` folder is deployed as a Next.js application.

Production API variable:

```env
NEXT_PUBLIC_API_URL=https://typeform-new.onrender.com
```

### Backend — Render

The `backend` folder is deployed as a Python service.

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

The backend health endpoint is:

```text
https://typeform-new.onrender.com/api/health
```

---

## Design Decisions and Assumptions

### Authentication

Authentication is simplified to one default creator because the assignment allows a simplified creator setup.

Respondents do not need an account to fill a published form.

### Question Answers

Answers are stored in a flexible format so different question types can use the same response system.

### One Question at a Time

The public form intentionally shows one question at a time instead of using a normal multi-field form. This is the main Typeform-style interaction.

### Live Preview

The builder uses reusable question-rendering components so the preview stays close to the actual respondent experience.

### Placeholder Features

The assignment allows the following features to be simplified or shown as placeholders:

* Advanced logic/branching
* Integrations/webhooks
* Team collaboration
* Payment questions
* File-upload questions
* Full creator authentication

---

## Validation and Persistence

Validation happens on both the frontend and backend.

Examples include:

* Required fields
* Email format
* Number input
* Valid question data

Form changes, question changes, publish status, responses, and answers are stored through the FastAPI API and SQLite database.

---

## Assignment Notes

This project implements the required Typeform-style workflow:

1. Create and manage forms
2. Build questions using drag and drop
3. Edit and reorder questions
4. Preview the form
5. Publish a public form
6. Fill the form without login
7. Move through questions one at a time
8. Validate and save responses
9. View response statistics
10. View individual responses

Additional functionality included:

* CSV export
* Dark mode
* Custom themes
* Partial-response tracking
* Completion rate
* Seeded sample forms and responses

### Partial Responses

A response can appear as `Partial` when a respondent starts filling a form but does not finish it.

These entries are intentionally retained so the application can demonstrate incomplete-response tracking.

---

## Original Work

This project was developed as an assignment implementation inspired by the Typeform user experience.

It is not affiliated with or endorsed by Typeform.

## License

This is an assignment/demo project.

```

### One important thing

After pasting it into GitHub, **don't change the README further** unless you notice an actual factual error. This version covers the assignment's required README items: setup, tech stack, architecture, database schema, API overview, and assumptions. :contentReference[oaicite:0]{index=0}

Also, your current README correctly mentions **CSV export and partial-response tracking as additional functionality**, which matches what you've actually implemented. :contentReference[oaicite:1]{index=1}
```

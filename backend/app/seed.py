import random
import datetime
from app.db.database import SessionLocal, engine, Base
from app.models import models

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        creator = db.query(models.Creator).first()

        if db.query(models.Form).first():
            print("Already seeded, skipping.")
            return

        if not creator:
            creator = models.Creator(
                id="default-creator",
                name="Default Creator",
                email="creator@example.com"
            )
            db.add(creator)
            db.flush()

        # ---------------- Form 1: Customer Feedback ----------------
        f1 = models.Form(
            creator_id=creator.id, title="Customer Feedback Survey",
            description="Help us improve our product",
            status="published", share_slug="customer-feedback",
            theme={"primaryColor": "#FF3D71", "background": "#FFFFFF", "font": "Sohne, sans-serif"},
        )
        db.add(f1)
        db.flush()

        q1 = [
            models.Question(form_id=f1.id, type="short_text", title="What's your name?",
                             description="", required=True, order_index=0),
            models.Question(form_id=f1.id, type="email", title="What's your email?",
                             description="We'll only use this to follow up", required=True, order_index=1),
            models.Question(form_id=f1.id, type="multiple_choice", title="How did you hear about us?",
                             options=["Social Media", "Friend", "Search Engine", "Advertisement"],
                             required=True, order_index=2),
            models.Question(form_id=f1.id, type="rating", title="How would you rate our product?",
                             settings={"max": 5}, required=True, order_index=3),
            models.Question(form_id=f1.id, type="yes_no", title="Would you recommend us to a friend?",
                             required=True, order_index=4),
            models.Question(form_id=f1.id, type="long_text", title="Any other feedback?",
                             required=False, order_index=5),
        ]
        db.add_all(q1)
        db.flush()

        sample_names = ["Alice Johnson", "Bob Smith", "Carla Diaz", "David Lee"]
        sources = ["Social Media", "Friend", "Search Engine", "Advertisement"]
        for i in range(4):
            r = models.Response(
                form_id=f1.id, completed=True,
                started_at=datetime.datetime.utcnow() - datetime.timedelta(days=i),
                submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=i, minutes=-5),
            )
            db.add(r)
            db.flush()
            values = [
                sample_names[i], f"{sample_names[i].split()[0].lower()}@example.com",
                random.choice(sources), random.randint(3, 5),
                random.choice(["Yes", "No"]), "Great experience overall!",
            ]
            for q, v in zip(q1, values):
                db.add(models.Answer(response_id=r.id, question_id=q.id, value=v))

        # one partial/incomplete response
        r_partial = models.Response(form_id=f1.id, completed=False, last_question_index=1)
        db.add(r_partial)
        db.flush()
        db.add(models.Answer(response_id=r_partial.id, question_id=q1[0].id, value="Incomplete User"))

        # ---------------- Form 2: Event Registration ----------------
        f2 = models.Form(
            creator_id=creator.id, title="Event Registration",
            description="Register for our annual conference",
            status="published", share_slug="event-registration",
            theme={"primaryColor": "#0F9D58", "background": "#FAFAFA", "font": "Sohne, sans-serif"},
        )
        db.add(f2)
        db.flush()

        q2 = [
            models.Question(form_id=f2.id, type="short_text", title="Full name",
                             required=True, order_index=0),
            models.Question(form_id=f2.id, type="email", title="Email address",
                             required=True, order_index=1),
            models.Question(form_id=f2.id, type="number", title="How many guests are you bringing?",
                             settings={"min": 0, "max": 5}, required=True, order_index=2),
            models.Question(form_id=f2.id, type="dropdown", title="Which session are you attending?",
                             options=["Morning Keynote", "Workshop A", "Workshop B", "Afternoon Panel"],
                             required=True, order_index=3),
            models.Question(form_id=f2.id, type="yes_no", title="Do you need vegetarian meals?",
                             required=False, order_index=4),
        ]
        db.add_all(q2)
        db.flush()

        sessions = ["Morning Keynote", "Workshop A", "Workshop B", "Afternoon Panel"]
        for i in range(3):
            r = models.Response(form_id=f2.id, completed=True,
                                 submitted_at=datetime.datetime.utcnow() - datetime.timedelta(hours=i))
            db.add(r)
            db.flush()
            values = [f"Guest {i+1}", f"guest{i+1}@example.com", random.randint(0, 3),
                      random.choice(sessions), random.choice(["Yes", "No"])]
            for q, v in zip(q2, values):
                db.add(models.Answer(response_id=r.id, question_id=q.id, value=v))

        # ---------------- Form 3: Draft form ----------------
        f3 = models.Form(
            creator_id=creator.id, title="Product Idea Brainstorm (Draft)",
            description="Internal draft - not yet published", status="draft",
        )
        db.add(f3)
        db.flush()
        db.add(models.Question(form_id=f3.id, type="long_text", title="Describe your idea",
                                required=True, order_index=0))

        db.commit()
        print("Database seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

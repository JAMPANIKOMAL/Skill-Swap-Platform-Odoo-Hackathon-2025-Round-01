from app import create_app, db
from app.models import User, Skill
from werkzeug.security import generate_password_hash

app = create_app()

# Only for demo: seed dummy users if database is empty
with app.app_context():
    if not User.query.filter_by(email="alice@example.com").first():
        u1 = User(name="Alice", email="alice@example.com", password=generate_password_hash("1234"),
                  location="Hyderabad", availability="weekends", is_public=True)
        u2 = User(name="Bob", email="bob@example.com", password=generate_password_hash("1234"),
                  location="Pune", availability="evenings", is_public=True)
        u3 = User(name="Carol", email="carol@example.com", password=generate_password_hash("1234"),
                  location="Delhi", availability="anytime", is_public=True)

        db.session.add_all([u1, u2, u3])
        db.session.commit()

        skills = [
            Skill(name="Python", type="offered", user_id=u1.id),
            Skill(name="Cooking", type="wanted", user_id=u1.id),
            Skill(name="Graphic Design", type="offered", user_id=u2.id),
            Skill(name="Video Editing", type="wanted", user_id=u2.id),
            Skill(name="Public Speaking", type="offered", user_id=u3.id),
            Skill(name="UI/UX", type="wanted", user_id=u3.id),
        ]
        db.session.add_all(skills)
        db.session.commit()

        print("✅ Dummy users added.")


if __name__ == '__main__':
    app.run(debug=True)

from . import db
from flask_login import UserMixin

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(100))
    availability = db.Column(db.String(100))
    is_public = db.Column(db.Boolean, default=True)
    profile_photo = db.Column(db.String(100))

    skills_offered = db.relationship('Skill', backref='user', lazy=True, primaryjoin="and_(User.id==Skill.user_id, Skill.type=='offered')")
    skills_wanted = db.relationship('Skill', backref='user_wanted', lazy=True, primaryjoin="and_(User.id==Skill.user_id, Skill.type=='wanted')")

class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(10), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


class SwapRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    from_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    to_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    offered_skill = db.Column(db.String(100))
    requested_skill = db.Column(db.String(100))
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='Pending')  # Pending, Accepted, Rejected

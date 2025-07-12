from flask import Blueprint, render_template, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

from .models import User, Skill
from .forms import RegisterForm, LoginForm, SkillForm
from . import db

main = Blueprint('main', __name__)

# ✅ Root route - redirect based on login status
@main.route('/')
def home():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return redirect(url_for('main.login'))

# ✅ Register route
@main.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        if User.query.filter_by(email=form.email.data).first():
            flash('Email already registered.', 'warning')
            return redirect(url_for('main.register'))
        hashed_pw = generate_password_hash(form.password.data)
        user = User(name=form.name.data, email=form.email.data,
                    password=hashed_pw, location=form.location.data,
                    availability=form.availability.data,
                    is_public=form.is_public.data)
        db.session.add(user)
        db.session.commit()
        flash('Registration successful. Please log in.', 'success')
        return redirect(url_for('main.login'))
    return render_template('register.html', form=form)

# ✅ Login route
@main.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and check_password_hash(user.password, form.password.data):
            login_user(user)
            return redirect(url_for('main.dashboard'))
        flash('Invalid email or password.', 'danger')
    return render_template('login.html', form=form)

# ✅ Logout route
@main.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully.', 'info')
    return redirect(url_for('main.login'))

# ✅ Dashboard route
@main.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=current_user)

# ✅ Add skill route
@main.route('/add_skill', methods=['GET', 'POST'])
@login_required
def add_skill():
    form = SkillForm()
    if form.validate_on_submit():
        skill = Skill(name=form.name.data, type=form.type.data, user_id=current_user.id)
        db.session.add(skill)
        db.session.commit()
        flash('Skill added successfully.', 'success')
        return redirect(url_for('main.dashboard'))
    return render_template('add_skill.html', form=form)

# ✅ Delete skill route
@main.route('/delete_skill/<int:skill_id>')
@login_required
def delete_skill(skill_id):
    skill = Skill.query.get_or_404(skill_id)
    if skill.user_id != current_user.id:
        flash('Unauthorized action.', 'danger')
        return redirect(url_for('main.dashboard'))
    db.session.delete(skill)
    db.session.commit()
    flash('Skill deleted.', 'info')
    return redirect(url_for('main.dashboard'))

@main.route('/public_profiles')
def public_profiles():
    from sqlalchemy import or_

    skill_filter = request.args.get('skill', '').lower()
    availability_filter = request.args.get('availability', '')

    users = User.query.filter_by(is_public=True)

    if availability_filter:
        users = users.filter(User.availability == availability_filter)

    users = users.all()

    if skill_filter:
        users = [u for u in users if any(skill_filter in s.name.lower() for s in u.skills_offered + u.skills_wanted)]

    return render_template('public_profiles.html', users=users)


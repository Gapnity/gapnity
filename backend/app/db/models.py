"""SQLAlchemy ORM models mirroring the Product Pack §11 data model."""
from __future__ import annotations

from datetime import datetime
from sqlalchemy import (
    Column, DateTime, Float, ForeignKey, Integer, String, Text,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Workspace(Base):
    __tablename__ = "workspaces"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, default="project")   # "project" | "team"
    description = Column(Text, nullable=True)
    color = Column(String, default="#7c3aed")   # hex colour for avatar
    created_at = Column(DateTime, default=datetime.utcnow)


class Team(Base):
    __tablename__ = "teams"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    team_id = Column(String, ForeignKey("teams.id"), nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="member")
    password_hash = Column(String, nullable=True)
    plan = Column(String, default="starter")         # starter | growth | scale
    account_type = Column(String, default="personal") # personal | company
    company = Column(String, nullable=True)
    email_verified = Column(String, default="false")  # stored as string for compat
    verification_token = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Sprint(Base):
    __tablename__ = "sprints"
    id = Column(String, primary_key=True)
    team_id = Column(String, ForeignKey("teams.id"))
    name = Column(String, nullable=False)
    start_date = Column(String)
    end_date = Column(String)
    state = Column(String, default="active")


class Meeting(Base):
    __tablename__ = "meetings"
    id = Column(String, primary_key=True)
    sprint_id = Column(String, ForeignKey("sprints.id"))
    meeting_type = Column(String, nullable=False)
    title = Column(String)
    transcript_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Theme(Base):
    __tablename__ = "themes"
    id = Column(String, primary_key=True)
    team_id = Column(String, ForeignKey("teams.id"))
    canonical_name = Column(String, nullable=False)
    description = Column(Text)


class Issue(Base):
    __tablename__ = "issues"
    id = Column(String, primary_key=True)
    sprint_id = Column(String, ForeignKey("sprints.id"))
    theme_id = Column(String, ForeignKey("themes.id"))
    description = Column(Text)
    severity = Column(String, default="medium")
    confidence_score = Column(Float, default=0.75)


class Decision(Base):
    __tablename__ = "decisions"
    id = Column(String, primary_key=True)
    sprint_id = Column(String, ForeignKey("sprints.id"))
    description = Column(Text)


class Action(Base):
    __tablename__ = "actions"
    id = Column(String, primary_key=True)
    sprint_id = Column(String, ForeignKey("sprints.id"))
    issue_id = Column(String, ForeignKey("issues.id"), nullable=True)
    description = Column(Text)
    owner_name = Column(String)
    due_date = Column(String)
    status = Column(String, default="new")
    effectiveness_score = Column(Integer)


class EvidenceLink(Base):
    __tablename__ = "evidence_links"
    id = Column(String, primary_key=True)
    sprint_id = Column(String, ForeignKey("sprints.id"))
    source_type = Column(String)   # jira|github|slack|transcript|test
    source_ref = Column(String)
    description = Column(Text)


class Outcome(Base):
    __tablename__ = "outcomes"
    id = Column(String, primary_key=True)
    action_id = Column(String, ForeignKey("actions.id"))
    next_sprint_id = Column(String, ForeignKey("sprints.id"))
    outcome_label = Column(String)    # improved|no_change|regressed
    notes = Column(Text)

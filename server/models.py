from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import check_password_hash, generate_password_hash
from flask_login import UserMixin

db = SQLAlchemy()

class User(db.Model, UserMixin, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    has_subscription = db.Column(db.Boolean, default=False)

    departments = db.relationship('Department', back_populates='user', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    serialize_rules = ('-departments.user',)

class Department(db.Model, SerializerMixin):
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', back_populates='departments')

    job_classes = db.relationship('JobClass', back_populates='department', cascade='all, delete-orphan')

    serialize_rules = ('-user.departments', '-job_classes.department',)

job_class_metrics = db.Table('job_class_metrics',
    db.Column('job_class_id', db.Integer, db.ForeignKey('job_classes.id', ondelete='CASCADE'), primary_key=True),
    db.Column('metric_id', db.Integer, db.ForeignKey('metrics.id', ondelete='CASCADE'), primary_key=True)
)

class JobClass(db.Model, SerializerMixin):
    __tablename__ = 'job_classes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)
    base_pay_rate = db.Column(db.Float)

    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    department = db.relationship('Department', back_populates='job_classes')

    employees = db.relationship('Employee', back_populates='job_class', cascade='all, delete-orphan')
    metrics = db.relationship('Metric', secondary=job_class_metrics, back_populates='job_classes')

    serialize_rules = ('-department.job_classes', '-employees.job_class', '-metrics.job_classes',)

class Metric(db.Model, SerializerMixin):
    __tablename__ = 'metrics'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)
    unit = db.Column(db.String)

    job_classes = db.relationship('JobClass', secondary=job_class_metrics, back_populates='metrics')

    serialize_rules = ('-job_classes.metrics',)

class Employee(db.Model, SerializerMixin):
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    hire_date = db.Column(db.Date, nullable=False)
    hourly_rate = db.Column(db.Float)

    job_class_id = db.Column(db.Integer, db.ForeignKey('job_classes.id'), nullable=False)
    job_class = db.relationship('JobClass', back_populates='employees')

    metric_values = db.relationship('EmployeeMetric', back_populates='employee', cascade='all, delete-orphan')
    schedule = db.relationship('Schedule', back_populates='employee', uselist=False, cascade='all, delete-orphan')

    serialize_rules = ('-job_class.employees', '-metric_values.employee', '-schedule.employee',)

class EmployeeMetric(db.Model, SerializerMixin):
    __tablename__ = 'employee_metrics'

    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)

    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    metric_id = db.Column(db.Integer, db.ForeignKey('metrics.id'), nullable=False)

    employee = db.relationship('Employee', back_populates='metric_values')
    metric = db.relationship('Metric')

    serialize_rules = ('-employee.metric_values', '-metric',)

class Schedule(db.Model, SerializerMixin):
    __tablename__ = 'schedules'

    id = db.Column(db.Integer, primary_key=True)
    monday = db.Column(db.Boolean, default=False)
    tuesday = db.Column(db.Boolean, default=False)
    wednesday = db.Column(db.Boolean, default=False)
    thursday = db.Column(db.Boolean, default=False)
    friday = db.Column(db.Boolean, default=False)
    saturday = db.Column(db.Boolean, default=False)
    sunday = db.Column(db.Boolean, default=False)

    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    employee = db.relationship('Employee', back_populates='schedule')

    serialize_rules = ('-employee.schedule',)

class DailyDemand(db.Model):
    __tablename__ = 'daily_demand'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    total_cases = db.Column(db.Float, nullable=False)
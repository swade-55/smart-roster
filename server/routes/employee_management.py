from flask import Blueprint, request, jsonify
from models import db, Employee, JobClass, Schedule, Department
from config import app
from flask_login import login_required, current_user
from datetime import datetime

employee_bp = Blueprint('employee_api', __name__, url_prefix='/labinv/api')

@employee_bp.route('/employees', methods=['GET'])
@login_required
def get_employees():
    user_departments = [dept.id for dept in current_user.departments]
    employees = Employee.query.join(JobClass).join(Department).filter(Department.id.in_(user_departments)).all()
    return jsonify([employee.to_dict() for employee in employees]), 200

@employee_bp.route('/job_classes', methods=['GET'])
@login_required
def get_job_classes():
    user_departments = [dept.id for dept in current_user.departments]
    job_classes = JobClass.query.filter(JobClass.department_id.in_(user_departments)).all()
    return jsonify([job_class.to_dict() for job_class in job_classes]), 200

@employee_bp.route('/add_employee', methods=['POST'])
@login_required
def add_employee():
    data = request.get_json()
    app.logger.info(f'Received data for new employee: {data}')

    existing_employee = Employee.query.filter_by(email=data.get('email')).first()
    if existing_employee:
        return jsonify({'error': 'Email already exists'}), 400

    job_class_id = data.get('job_class_id')
    if not job_class_id:
        return jsonify({'error': 'Job Class ID is required'}), 400

    job_class = JobClass.query.get(job_class_id)
    if not job_class or job_class.department_id not in [dept.id for dept in current_user.departments]:
        return jsonify({'error': 'Invalid Job Class ID'}), 400

    hire_date = datetime.strptime(data.get('hire_date'), '%Y-%m-%d').date()

    new_employee = Employee(
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        email=data.get('email'),
        hire_date=hire_date,
        hourly_rate=float(data.get('hourly_rate')),
        job_class_id=int(job_class_id)
    )

    db.session.add(new_employee)
    db.session.commit()

    return jsonify(new_employee.to_dict()), 201

@employee_bp.route('/update_employee/<int:employee_id>', methods=['PATCH'])
@login_required
def update_employee(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee or employee.job_class.department_id not in [dept.id for dept in current_user.departments]:
        return jsonify({'error': 'Employee not found or you do not have permission to update this employee'}), 404

    data = request.get_json()
    for field in ['first_name', 'last_name', 'email', 'hire_date', 'hourly_rate', 'job_class_id']:
        if field in data:
            if field == 'job_class_id':
                job_class = JobClass.query.get(data[field])
                if not job_class or job_class.department_id not in [dept.id for dept in current_user.departments]:
                    return jsonify({'error': 'Invalid Job Class ID'}), 400
            setattr(employee, field, data[field])

    db.session.commit()
    return jsonify(employee.to_dict()), 200

@employee_bp.route('/employees/<int:employee_id>', methods=['DELETE'])
@login_required
def delete_employee(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee or employee.job_class.department_id not in [dept.id for dept in current_user.departments]:
        return jsonify({'error': 'Employee not found or you do not have permission to delete this employee'}), 404
    
    db.session.delete(employee)
    db.session.commit()
    return jsonify({'message': 'Employee deleted successfully'}), 200

@employee_bp.route('/update_employee_schedule/<int:employee_id>', methods=['PATCH'])
@login_required
def update_employee_schedule(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee or employee.job_class.department_id not in [dept.id for dept in current_user.departments]:
        return jsonify({'error': 'Employee not found or you do not have permission to update this employee\'s schedule'}), 404

    data = request.get_json()
    schedule = Schedule.query.filter_by(employee_id=employee.id).first()
    if not schedule:
        schedule = Schedule(employee_id=employee.id)
        db.session.add(schedule)

    for day in ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']:
        if day in data:
            setattr(schedule, day, data[day])

    db.session.commit()

    return jsonify({
        'message': 'Schedule updated successfully',
        'schedule': {day: getattr(schedule, day) for day in ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']}
    }), 200

app.register_blueprint(employee_bp)
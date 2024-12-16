from models import db, User, Department, JobClass, Employee, Metric, EmployeeMetric, Schedule, DailyDemand
from config import app
import random
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

def create_user_with_validation(username, email, password, is_admin=False, has_subscription=False):
    """Helper function to create a user with password validation"""
    user = User(
        username=username,
        email=email,
        is_admin=is_admin,
        has_subscription=has_subscription,
        password_reset_token=None,
        password_reset_expires=None,
        must_change_password=False
    )
    
    # Validate password before setting
    is_valid, message = User.is_password_valid(password)
    if not is_valid:
        raise ValueError(f"Invalid password for user {username}: {message}")
    
    user.set_password(password)
    return user

def seed():
    with app.app_context():
        # Clear existing data
        DailyDemand.query.delete()
        Schedule.query.delete()
        EmployeeMetric.query.delete()
        Employee.query.delete()
        Metric.query.delete()
        JobClass.query.delete()
        Department.query.delete()
        User.query.delete()
        db.session.commit()

        # Create admin user with secure password
        try:
            admin = create_user_with_validation(
                username='admin',
                email='admin@example.com',
                password='AdminPass123!',  # Meets password requirements
                is_admin=True,
                has_subscription=True
            )
            
            dwight = create_user_with_validation(
                username='dwight',
                email='dwight@example.com',
                password='DwightPass123!',  # Meets password requirements
                is_admin=True,
                has_subscription=True
            )
            
            # Create some test users with different password states
            test_user = create_user_with_validation(
                username='testuser',
                email='test@example.com',
                password='TestUser123!',
                is_admin=False,
                has_subscription=False
            )
            # Simulate a user that needs to reset password
            test_user.must_change_password = True
            test_user.password_reset_token = test_user.generate_reset_token()
            
            db.session.add_all([admin, dwight, test_user])
            db.session.commit()

        except ValueError as e:
            print(f"Error creating users: {e}")
            return

        # Create departments
        departments = [
            Department(name='IT', description='Information Technology Department', user=admin),
            Department(name='Sales', description='Sales and Marketing Department', user=admin)
        ]
        db.session.add_all(departments)
        db.session.commit()

        # Create job classes
        job_classes = []
        for dept in departments:
            job_classes.extend([
                JobClass(name=f'Junior {dept.name} Specialist', description=f'Entry-level position in {dept.name}', base_pay_rate=25.0, department=dept),
                JobClass(name=f'Senior {dept.name} Specialist', description=f'Experienced position in {dept.name}', base_pay_rate=40.0, department=dept)
            ])
        db.session.add_all(job_classes)
        db.session.commit()

        # Create metrics
        metrics = [
            Metric(name='Productivity', description='Measure of work output', unit='tasks/hour'),
            Metric(name='Quality', description='Measure of work quality', unit='errors/task'),
            Metric(name='Customer Satisfaction', description='Measure of customer happiness', unit='rating')
        ]
        db.session.add_all(metrics)
        db.session.commit()

        # Assign metrics to job classes
        for job_class in job_classes:
            job_class.metrics = random.sample(metrics, k=2)
        db.session.commit()

        # Create employees with schedules
        employees = []
        for i in range(10):  # Create 10 employees
            employee = Employee(
                first_name=f'FirstName{i}',
                last_name=f'LastName{i}',
                email=f'employee{i}@example.com',
                hire_date=datetime.now() - timedelta(days=random.randint(1, 365)),
                hourly_rate=random.uniform(20.0, 45.0),
                job_class=random.choice(job_classes)
            )
            
            # Create schedule for the employee
            schedule = Schedule(
                employee=employee,
                monday=random.choice([True, False]),
                tuesday=random.choice([True, False]),
                wednesday=random.choice([True, False]),
                thursday=random.choice([True, False]),
                friday=random.choice([True, False]),
                saturday=False,
                sunday=False
            )
            
            employees.append(employee)
            db.session.add(employee)
            db.session.add(schedule)
        
        db.session.commit()

        # Create employee metrics
        for employee in employees:
            for metric in employee.job_class.metrics:
                for _ in range(3):  # 3 metrics per employee per metric type
                    employee_metric = EmployeeMetric(
                        employee=employee,
                        metric=metric,
                        value=random.uniform(50, 150),
                        date=datetime.now() - timedelta(days=random.randint(1, 15))
                    )
                    db.session.add(employee_metric)
        db.session.commit()

        # Create daily demand data
        start_date = datetime.now().date()
        for i in range(7):  # Create demand data for the next 7 days
            daily_demand = DailyDemand(
                date=start_date + timedelta(days=i),
                total_cases=random.uniform(500, 2000)
            )
            db.session.add(daily_demand)
        db.session.commit()

        print("Seed completed successfully!")
        print("Test users created:")
        print("1. Admin user:")
        print("   Username: admin")
        print("   Password: AdminPass123!")
        print("2. Dwight user:")
        print("   Username: dwight")
        print("   Password: DwightPass123!")
        print("3. Test user (with reset password flag):")
        print("   Username: testuser")
        print("   Password: TestUser123!")
        print("   Reset token: ", test_user.password_reset_token)

if __name__ == '__main__':
    seed()
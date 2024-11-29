from models import db, User, Department, JobClass, Employee, Metric, EmployeeMetric, Schedule, DailyDemand
from config import app
import random
from datetime import datetime, timedelta

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

        # Create admin user
        admin = User(username='admin', email='admin@example.com', is_admin=True, has_subscription=True)
        admin.set_password('adminpass')
        dwight = User(username='dwight', email='dwight@example.com', is_admin=True, has_subscription=True)
        dwight.set_password('dwightpass')
        db.session.add(dwight)
        db.session.add(admin)
        db.session.commit()

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

if __name__ == '__main__':
    seed()
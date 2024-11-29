from flask import Blueprint, request, jsonify
import numpy as np
from scipy.optimize import minimize
from collections import defaultdict
import pulp
from flask_login import login_required
from config import app
import pandas as pd
from itertools import chain, repeat
from typing import List

employee_allocation_bp = Blueprint('employee_allocation_api', __name__, url_prefix='/labinv/api')

# @employee_allocation_bp.route('/allocate_heads', methods=['POST'])
# @login_required
# def allocate_heads():
#     try:
#         data = request.get_json()

#         if 'departments' not in data or 'total_heads' not in data:
#             return jsonify({'error': 'Missing required data'}), 400

#         departments = data['departments']
#         total_heads = data['total_heads']

#         def completion_time(heads, dept):
#             return departments[dept]['total_cases'] / (heads * departments[dept]['cases_per_hour'])
        
#         def objective(heads):
#             times = [completion_time(heads[i], list(departments.keys())[i]) for i in range(len(heads))]
#             return np.std(times)

#         cons = ({'type': 'eq', 'fun': lambda heads: sum(heads) - total_heads})
#         bounds = [(0, total_heads) for _ in departments]

#         initial_guess = [total_heads / len(departments)] * len(departments)

#         result = minimize(objective, initial_guess, bounds=bounds, constraints=cons)

#         if not result.success:
#             return jsonify({'status': 'Optimization failed', 'message': result.message}), 500

#         allocation = {list(departments.keys())[i]: result.x[i] for i in range(len(departments))}
#         completion_times = {dept: completion_time(allocation[dept], dept) for dept in departments}

#         return jsonify({'status': 'Optimal', 'allocation': allocation, 'completion_times': completion_times})

#     except ValueError as e:
#         return jsonify({'error': str(e)}), 400
#     except Exception as e:
#         return jsonify({'error': 'An unexpected error occurred: ' + str(e)}), 500

def ncycles(iterable: List[int], n: int) -> chain:
    """Returns the sequence elements n times"""
    return chain.from_iterable(repeat(tuple(iterable), n))

def create_schedule(required_heads: List[int]):
    """
    Create an optimized schedule with strictly consecutive rest days
    """
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    n_days = len(days)
    
    # Define all valid shift patterns (4 work days, 2 consecutive rest days)
    patterns = [
        # Format: (work_days, rest_days)
        ([0,1,2,3], [4,5]),  # Rest Thu-Fri
        ([1,2,3,4], [5,0]),  # Rest Fri-Sun
        ([2,3,4,5], [0,1]),  # Rest Sun-Mon
        ([3,4,5,0], [1,2]),  # Rest Mon-Tue
        ([4,5,0,1], [2,3]),  # Rest Tue-Wed
        ([5,0,1,2], [3,4]),  # Rest Wed-Thu
    ]
    
    # Initialize optimization model
    model = pulp.LpProblem("Minimize_Staffing", pulp.LpMinimize)
    
    # Decision variables: number of workers assigned to each pattern
    x = pulp.LpVariable.dicts('pattern_', range(len(patterns)), lowBound=0, cat='Integer')
    
    # Objective: Minimize total number of workers
    model += pulp.lpSum(x[i] for i in range(len(patterns)))
    
    # Constraints: Meet daily requirements
    for d in range(n_days):
        model += pulp.lpSum(x[p] for p in range(len(patterns)) 
                          if d in patterns[p][0]) >= required_heads[d]
    
    # Solve model
    status = model.solve()
    
    if pulp.LpStatus[model.status] != 'Optimal':
        raise Exception("No feasible solution found")
    
    # Process results into schedule
    schedule = {}
    for p in range(len(patterns)):
        workers = int(pulp.value(x[p]))
        if workers > 0:
            pattern = {days[d]: workers if d in patterns[p][0] else 0 for d in range(n_days)}
            schedule[f"Shift: Pattern_{p+1}"] = pattern
            
    # Calculate daily totals
    daily_totals = {day: sum(shift[day] for shift in schedule.values()) 
                   for day in days}
    
    # Calculate variances
    variances = {day: daily_totals[day] - req 
                for day, req in zip(days, required_heads)}
    
    total_over = sum(v for v in variances.values() if v > 0)
    total_under = abs(sum(v for v in variances.values() if v < 0))
    
    return {
        'schedule': schedule,
        'total_staff_needed': int(pulp.value(model.objective)),
        'daily_totals': daily_totals,
        'daily_requirements': dict(zip(days, required_heads)),
        'variances': variances,
        'staffing_analysis': {
            'daily_totals': daily_totals,
            'daily_requirements': dict(zip(days, required_heads)),
            'variances': variances,
            'variance_summary': {
                'total_over_staffed': total_over,
                'total_under_staffed': total_under,
                'days_over_staffed': len([v for v in variances.values() if v > 0]),
                'days_under_staffed': len([v for v in variances.values() if v < 0]),
                'days_exactly_staffed': len([v for v in variances.values() if v == 0]),
            }
        }
    }

def are_days_consecutive(days_list, all_days):
    """Helper function to check if days are consecutive"""
    if len(days_list) != 2:
        return False
        
    day1_idx = all_days.index(days_list[0])
    day2_idx = all_days.index(days_list[1])
    
    # Check if days are consecutive, considering week wrap-around
    return (day2_idx - day1_idx) % len(all_days) == 1 or (day1_idx - day2_idx) % len(all_days) == 1

# Update the route function
@employee_allocation_bp.route('/schedule', methods=['POST'])
@login_required
def generate_schedule():
    try:
        data = request.get_json()
        required_heads = data.get('required_heads')
        
        if not required_heads or len(required_heads) != 6:
            return jsonify({
                "error": "Required heads must be provided for 6 days (Sunday through Friday)"
            }), 400
            
        if any(heads < 0 for heads in required_heads):
            return jsonify({
                "error": "Staff requirements cannot be negative"
            }), 400

        required_heads = [int(round(h)) for h in required_heads]
        
        try:
            schedule_data = create_schedule(required_heads)
            return jsonify({
                'status': 'success',
                'data': schedule_data
            })
        except Exception as e:
            return jsonify({
                'status': 'error',
                'error': f"Scheduling error: {str(e)}"
            }), 400

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'message': 'An error occurred while generating the schedule'
        }), 500

# @employee_allocation_bp.route('/schedule', methods=['POST'])
# @login_required
# def generate_schedule():
#     try:
#         data = request.get_json()
#         required_heads = data.get('required_heads')
        
#         if not required_heads or len(required_heads) != 6:
#             return jsonify({
#                 "error": "Required heads must be provided for 6 days (Sunday through Friday)"
#             }), 400
            
#         if any(heads < 0 for heads in required_heads):
#             return jsonify({
#                 "error": "Staff requirements cannot be negative"
#             }), 400

#         # Convert required_heads to integers
#         required_heads = [int(round(h)) for h in required_heads]
        
#         try:
#             schedule_data = create_schedule(required_heads)
#             return jsonify({
#                 'status': 'success',
#                 'data': schedule_data
#             })
#         except Exception as e:
#             return jsonify({
#                 'status': 'error',
#                 'error': f"Scheduling error: {str(e)}"
#             }), 400

#     except Exception as e:
#         return jsonify({
#             'status': 'error',
#             'error': str(e),
#             'message': 'An error occurred while generating the schedule'
#         }), 500

@employee_allocation_bp.route('/allocate_heads', methods=['POST'])
@login_required
def allocate_heads():
    try:
        data = request.get_json()

        if 'departments' not in data or 'total_heads' not in data:
            return jsonify({'error': 'Missing required data'}), 400

        departments = data['departments']
        total_heads = data['total_heads']

        def completion_time(heads, dept):
            return departments[dept]['total_cases'] / (heads * departments[dept]['cases_per_hour'])
        
        def objective(heads):
            times = [completion_time(heads[i], list(departments.keys())[i]) for i in range(len(heads))]
            return np.std(times)

        cons = ({'type': 'eq', 'fun': lambda heads: sum(heads) - total_heads})
        bounds = [(0, total_heads) for _ in departments]

        initial_guess = [total_heads / len(departments)] * len(departments)

        result = minimize(objective, initial_guess, bounds=bounds, constraints=cons)

        if not result.success:
            return jsonify({'status': 'Optimization failed', 'message': result.message}), 500

        allocation = {list(departments.keys())[i]: round(result.x[i], 2) for i in range(len(departments))}
        completion_times = {dept: round(completion_time(allocation[dept], dept), 2) for dept in departments}

        return jsonify({
            'status': 'Optimal', 
            'allocation': allocation, 
            'completion_times': completion_times
        })

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred: ' + str(e)}), 500
app.register_blueprint(employee_allocation_bp)
from flask import Blueprint, request, jsonify
import numpy as np
from scipy.optimize import minimize
from collections import defaultdict
import pulp
from flask_login import login_required
from config import app
import pandas as pd
from itertools import chain, repeat
from typing import List, Dict

employee_allocation_bp = Blueprint('employee_allocation_api', __name__, url_prefix='/labinv/api')

def ncycles(iterable: List[int], n: int) -> chain:
    """Returns the sequence elements n times"""
    return chain.from_iterable(repeat(tuple(iterable), n))

def create_schedule(required_heads: List[int], schedule_type: int = 4):
    """
    Create an optimized schedule with strictly consecutive rest days
    
    Args:
        required_heads: List of required staff for each day
        schedule_type: Number of working days (4 or 5)
    """
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    n_days = len(days)
    
    # Generate all possible patterns based on schedule_type
    patterns = []
    rest_days = 7 - schedule_type  # Either 3 days off (4-day schedule) or 2 days off (5-day schedule)
    
    # Generate all possible patterns ensuring consecutive rest days
    for start_day in range(n_days):
        # Calculate working and rest days ensuring consecutiveness
        work_days = []
        rest_day_list = []
        
        # Add working days
        current_day = start_day
        for _ in range(schedule_type):
            work_days.append(current_day % n_days)
            current_day = (current_day + 1) % n_days
            
        # Add rest days
        for _ in range(rest_days):
            rest_day_list.append(current_day % n_days)
            current_day = (current_day + 1) % n_days
            
        # Only add pattern if rest days are consecutive
        if are_days_consecutive(rest_day_list, list(range(n_days))):
            patterns.append((work_days, rest_day_list))
    
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
            
    # Calculate daily totals and analysis
    daily_totals = {day: sum(shift[day] for shift in schedule.values()) 
                   for day in days}
    
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
        },
        'schedule_type': f"{schedule_type}-day"
    }

def are_days_consecutive(days_list, all_days):
    """
    Helper function to check if days are consecutive, including wrap-around cases
    """
    if not days_list:
        return False
        
    # Sort the days
    days_list = sorted(days_list)
    
    # Check if days form a continuous sequence
    for i in range(len(days_list) - 1):
        diff = (days_list[i + 1] - days_list[i]) % len(all_days)
        if diff != 1:
            # Check wrap-around case
            if i == len(days_list) - 2 and days_list[-1] == len(all_days) - 1 and days_list[0] == 0:
                continue
            return False
    return True

@employee_allocation_bp.route('/schedule', methods=['POST'])
@login_required
def generate_schedule():
    try:
        data = request.get_json()
        required_heads = data.get('required_heads')
        schedule_type = data.get('schedule_type', '4')  # Default to 4-day schedule
        
        if not required_heads or len(required_heads) != 6:
            return jsonify({
                "error": "Required heads must be provided for 6 days (Sunday through Friday)"
            }), 400
            
        if any(heads < 0 for heads in required_heads):
            return jsonify({
                "error": "Staff requirements cannot be negative"
            }), 400
            
        if schedule_type not in ['4', '5']:
            return jsonify({
                "error": "Schedule type must be either 4 or 5"
            }), 400

        # Validate if schedule type can cover required days
        working_days = sum(1 for heads in required_heads if heads > 0)
        if working_days > int(schedule_type):
            return jsonify({
                "error": f"Cannot cover {working_days} days with {schedule_type}-day schedule"
            }), 400

        required_heads = [int(round(h)) for h in required_heads]
        
        try:
            schedule_data = create_schedule(required_heads, int(schedule_type))
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

app.register_blueprint(employee_allocation_bp)
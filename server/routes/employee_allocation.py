from flask import Blueprint, request, jsonify
import numpy as np
from collections import defaultdict
import pulp
from flask_login import login_required
from config import app
from itertools import combinations, permutations
from typing import List
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

employee_allocation_bp = Blueprint('employee_allocation_api', __name__, url_prefix='/labinv/api')

def has_two_consecutive_rest_days(rest_days, n_days):
    """Check if there are at least two consecutive rest days"""
    if len(rest_days) < 2:
        return False
        
    rest_days = sorted(rest_days)
    
    # Check normal consecutive pairs
    for i in range(len(rest_days) - 1):
        if rest_days[i + 1] - rest_days[i] == 1:
            return True
    
    # Check wrap-around case
    if rest_days[0] == 0 and rest_days[-1] == n_days - 1:
        return True
        
    return False

def rotate_pattern(pattern, n_days=7):
    """Rotate a pattern by one day."""
    return tuple((day + 1) % n_days for day in pattern)

def add_rotated_patterns(patterns, zero_days, n_rotations=7):
    """Add rotated versions of existing patterns, excluding zero_days as workdays."""
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    original_patterns = patterns.copy()
    for _ in range(n_rotations - 1):
        rotated = [rotate_pattern(p) for p in original_patterns]
        for p in rotated:
            # Skip patterns that assign workdays to zero_days
            if any(d in zero_days for d in p):
                continue
            # Check if pattern is unique and satisfies rest day constraints
            if p not in patterns and has_two_consecutive_rest_days([d for d in range(7) if d not in p], 7):
                patterns.append(p)
                logger.debug(f"Added rotated pattern - Work: {[days[d] for d in p]}")
    return patterns

def generate_all_patterns(required_heads, schedule_type):
    """Generate all valid work patterns based on combinations."""
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    n_days = len(days)
    work_days = [i for i, req in enumerate(required_heads) if req > 0]
    
    patterns = []
    
    # Generate all combinations of work_days with the given schedule_type
    for work_sequence in combinations(work_days, schedule_type):
        rest_sequence = [i for i in range(n_days) if i not in work_sequence]
        
        if has_two_consecutive_rest_days(rest_sequence, n_days):
            patterns.append(tuple(work_sequence))
            logger.debug(f"Added pattern - Work: {[days[d] for d in work_sequence]}")
    
    logger.info(f"Generated {len(patterns)} valid patterns from combinations")
    return patterns

def generate_permuted_patterns(required_heads, schedule_type):
    """Generate permuted patterns to increase diversity."""
    work_days = [i for i, req in enumerate(required_heads) if req > 0]
    patterns = set()
    
    # Generate unique permutations of workdays
    for p in permutations(work_days, schedule_type):
        p = tuple(sorted(p))
        if p not in patterns and has_two_consecutive_rest_days([d for d in range(7) if d not in p], 7):
            patterns.add(p)
    
    logger.info(f"Generated {len(patterns)} unique permuted patterns")
    return list(patterns)

def add_additional_patterns(patterns, required_heads, schedule_type):
    """Manually add additional diverse patterns if needed."""
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    additional_patterns = [
        (0, 2, 3, 4, 6),  # Sunday, Tuesday, Wednesday, Thursday, Saturday
        (1, 3, 4, 5, 6),  # Monday, Wednesday, Thursday, Friday, Saturday
        # Add more based on specific requirements or insights
    ]
    
    for p in additional_patterns:
        if p not in patterns and has_two_consecutive_rest_days([d for d in range(7) if d not in p], 7):
            patterns.append(p)
            logger.debug(f"Added additional pattern - Work: {[days[d] for d in p]}")
    
    logger.info(f"Total patterns after adding additional patterns: {len(patterns)}")
    return patterns

def generate_diverse_rest_patterns(required_heads, schedule_type):
    """Generate a diverse set of work patterns."""
    work_days = [i for i, req in enumerate(required_heads) if req > 0]
    zero_days = [i for i, req in enumerate(required_heads) if req == 0]
    
    comb_patterns = generate_all_patterns(required_heads, schedule_type)
    perm_patterns = generate_permuted_patterns(required_heads, schedule_type)
    
    # Combine and remove duplicates
    combined_patterns = list(set(comb_patterns + perm_patterns))
    
    # Add rotated patterns without including zero_days
    combined_patterns = add_rotated_patterns(combined_patterns, zero_days)
    
    # Add additional diverse patterns
    combined_patterns = add_additional_patterns(combined_patterns, required_heads, schedule_type)
    
    logger.info(f"Total diverse patterns generated: {len(combined_patterns)}")
    return combined_patterns

def create_schedule(required_heads: List[int], schedule_type: int = 4):
    """Create optimized schedule minimizing variance from requirements"""
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    n_days = len(days)
    
    work_days = [i for i, req in enumerate(required_heads) if req > 0]
    zero_days = [i for i, req in enumerate(required_heads) if req == 0]
    
    logger.info(f"Work days: {[days[i] for i in work_days]}")
    logger.info(f"Zero days: {[days[i] for i in zero_days]}")
    
    # Generate diverse patterns
    patterns = generate_diverse_rest_patterns(required_heads, schedule_type)
    
    if not patterns:
        raise Exception("Could not generate valid patterns with given constraints")
    
    # Initialize optimization model
    model = pulp.LpProblem("Minimize_Staffing_Variance", pulp.LpMinimize)
    
    # Decision variables for pattern assignments
    x = pulp.LpVariable.dicts('pattern_', range(len(patterns)), lowBound=0, cat='Integer')
    
    # Variables for tracking over/under staffing
    over = pulp.LpVariable.dicts('over_', work_days, lowBound=0)
    under = pulp.LpVariable.dicts('under_', work_days, lowBound=0)
    
    # Variable for maximum pattern size
    max_pattern_size = pulp.LpVariable('max_pattern_size', lowBound=0)
    
    # Assign higher weight to overstaffing to reduce variance
    over_weight = 10  # Example weight
    under_weight = 5  # Example weight
    
    # Primary objective: Minimize overstaffing, understaffing, and maximum pattern size
    model += pulp.lpSum(over[d] * over_weight + under[d] * under_weight for d in work_days) + max_pattern_size
    
    # Constraints for each working day
    for day_idx in work_days:
        workers_on_day = pulp.lpSum(x[p] for p in range(len(patterns)) 
                                  if day_idx in patterns[p])
        model += workers_on_day - over[day_idx] + under[day_idx] == required_heads[day_idx], f"Day_{day_idx}_balance"
        model += workers_on_day >= required_heads[day_idx], f"Day_{day_idx}_no_understaffing"
    
    # Constraints for zero-days: No workers should be assigned
    for day_idx in zero_days:
        workers_on_day = pulp.lpSum(x[p] for p in range(len(patterns)) 
                                  if day_idx in patterns[p])
        model += workers_on_day == 0, f"Day_{day_idx}_no_workers"
    
    # For 5-day schedules, add pattern size constraints
    if schedule_type == 5:
        max_req = max(required_heads)
        target_size = max_req // 3  # Target roughly 3 patterns minimum
        
        for p in range(len(patterns)):
            # Each pattern size is bounded by max_pattern_size
            model += x[p] <= max_pattern_size, f"Pattern_{p}_max_size"
            # Encourage smaller patterns by setting soft upper limit
            model += x[p] <= target_size + over[work_days[0]], f"Pattern_{p}_soft_limit"
    
    # Solve model
    logger.info("Solving optimization model...")
    status = model.solve()
    
    if pulp.LpStatus[model.status] != 'Optimal':
        raise Exception("No feasible solution found")
    
    # Create schedule
    schedule = {}
    daily_totals = defaultdict(int)
    
    for p in range(len(patterns)):
        workers = int(pulp.value(x[p]))
        if workers > 0:
            pattern = {days[d]: workers if d in patterns[p] else 0 
                      for d in range(n_days)}
            schedule[f"Pattern_{p+1}"] = pattern
            
            for day, count in pattern.items():
                daily_totals[day] += count
                
            logger.debug(f"Pattern_{p+1}: {workers} workers: {pattern}")
    
    # Verify schedule
    variance_sum = 0
    for day_idx, req in enumerate(required_heads):
        day = days[day_idx]
        actual = daily_totals[day]
        diff = actual - req
        variance_sum += diff * diff
        
        if req > 0 and actual < req:
            raise Exception(f"Schedule doesn't meet requirements for {day}. Need {req}, got {actual}")
        if req == 0 and actual > 0:
            raise Exception(f"Schedule has {actual} workers on zero-requirement day {day}")
    
    logger.info(f"Schedule variance: {variance_sum / len(required_heads)}")
    logger.info(f"Daily totals: {dict(daily_totals)}")
    
    return schedule

# @employee_allocation_bp.route('/schedule', methods=['POST'])
# @login_required
# def generate_schedule():
#     try:
#         data = request.get_json()
#         logger.info(f"Received schedule request with data: {data}")
        
#         required_heads = data.get('required_heads')
#         schedule_type = data.get('schedule_type', '4')
        
#         if not required_heads or len(required_heads) != 7:
#             logger.error("Invalid required_heads input")
#             return jsonify({
#                 "error": "Required heads must be provided for all 7 days"
#             }), 400
        
#         required_heads = [int(round(h)) for h in required_heads]
#         logger.info(f"Processing request for {schedule_type}-day schedule with requirements: {required_heads}")
        
#         try:
#             schedule_data = create_schedule(required_heads, int(schedule_type))
#             return jsonify({
#                 'status': 'success',
#                 'data': {
#                     'schedule': schedule_data,
#                     'schedule_type': f"{schedule_type}-day"
#                 }
#             })
#         except Exception as e:
#             logger.error(f"Schedule generation error: {str(e)}")
#             return jsonify({
#                 'status': 'error',
#                 'error': f"Scheduling error: {str(e)}"
#             }), 400

#     except Exception as e:
#         logger.error(f"Unexpected error: {str(e)}")
#         return jsonify({
#             'status': 'error',
#             'error': str(e)
#         }), 500

@employee_allocation_bp.route('/schedule', methods=['POST'])
@login_required
def generate_schedule():
    try:
        data = request.get_json()
        logger.info(f"Received schedule request with data: {data}")
        
        required_heads = data.get('required_heads')
        schedule_type = data.get('schedule_type', '4')
        package_type = data.get('package_type')
        
        # Validate package requirements
        if package_type == '7-day':
            if len([h for h in required_heads if h > 0]) < 7:
                return jsonify({
                    "error": "7-day package requires staffing for all 7 days"
                }), 400
        elif package_type == '6-day':
            if len([h for h in required_heads if h > 0]) > 6:
                return jsonify({
                    "error": "6-day package cannot have more than 6 working days"
                }), 400
            if schedule_type != '4':
                return jsonify({
                    "error": "6-day package only supports 4-day schedules"
                }), 400
        
        try:
            schedule_data = create_schedule(required_heads, int(schedule_type))
            return jsonify({
                'status': 'success',
                'data': {
                    'schedule': schedule_data,
                    'schedule_type': f"{schedule_type}-day",
                    'package_type': package_type
                }
            })
        except Exception as e:
            logger.error(f"Schedule generation error: {str(e)}")
            return jsonify({
                'status': 'error',
                'error': f"Scheduling error: {str(e)}"
            }), 400

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

app.register_blueprint(employee_allocation_bp)

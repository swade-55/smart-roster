from config import *

from flask import Flask, request, jsonify, send_file, send_from_directory
from models import db
from config import app
from pulp import *
import pulp
from itertools import chain, repeat
from scipy.optimize import minimize
import numpy as np
from collections import defaultdict
from datetime import datetime
from flask_cors import CORS
from werkzeug.utils import secure_filename
import pytz
from routes.routes import *
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import pandas as pd
from io import BytesIO

# central = pytz.timezone('America/Chicago')

# def convert_to_central(utc_dt):
#     if utc_dt is None:
#         return None
#     utc_dt = pytz.utc.localize(utc_dt)
#     return utc_dt.astimezone(central).strftime('%Y-%m-%d %H:%M:%S %Z%z')

# @app.route('/api/testlines', methods=['GET'])
# @login_required
# def get_testlines():
#     testlines = TestLine.query.all()
#     return jsonify([testline.to_dict() for testline in testlines]), 200


# @app.route('/api/add_testline', methods=['POST'])
# @login_required
# def add_testline():
#     data = request.get_json()

#     new_testline = TestLine(
#         name=data.get('name'),
#         status=data.get('status', 'available')
#     )

#     db.session.add(new_testline)
#     db.session.commit()

#     return jsonify(new_testline.to_dict()), 200


# @app.route('/api/reserve_testline', methods=['POST'])
# @login_required
# def reserve_testline():
#     data = request.get_json()
#     user_id = data.get('user_id')
#     testline_id = data.get('testline_id')

#     user = User.query.get(user_id)
#     testline = TestLine.query.get(testline_id)

#     if not user or not testline:
#         return jsonify({'error': 'User or TestLine not found'}), 404

#     existing_reservation = Reservation.query.filter_by(user_id=user_id, testline_id=testline_id, end_time=None).first()
#     if existing_reservation:
#         return jsonify({'error': 'TestLine already reserved by this user'}), 400

#     if testline.status != 'available':
#         return jsonify({'error': 'TestLine is not available'}), 400

#     reservation = Reservation(user_id=user_id, testline_id=testline_id)
#     testline.status = 'checked out'
#     testline.checked_out_by = user.username
#     testline.checked_out_time = datetime.utcnow()  # Use UTC time

#     db.session.add(reservation)
#     db.session.commit()

#     reservation_dict = reservation.to_dict()
#     reservation_dict['start_time'] = convert_to_central(reservation.start_time)
#     reservation_dict['end_time'] = convert_to_central(reservation.end_time)
#     reservation_dict['returned_time'] = convert_to_central(reservation.returned_time)

#     testline_dict = testline.to_dict()
#     testline_dict['checked_out_time'] = convert_to_central(testline.checked_out_time)
#     testline_dict['returned_time'] = convert_to_central(testline.returned_time)

#     return jsonify({
#         'reservation': reservation_dict,
#         'testline': testline_dict,
#         'user': user.to_dict()
#     }), 200


# @app.route('/api/return_testline', methods=['POST'])
# @login_required
# def return_testline():
#     data = request.get_json()
#     user_id = data.get('user_id')
#     testline_id = data.get('testline_id')

#     reservation = Reservation.query.filter_by(user_id=user_id, testline_id=testline_id, end_time=None).first()
#     if not reservation:
#         return jsonify({'error': 'Reservation not found'}), 404

#     reservation.end_time = datetime.utcnow()
#     reservation.returned_by = User.query.get(user_id).username
#     reservation.returned_time = datetime.utcnow()
#     reservation.testline.status = 'available'
#     reservation.testline.checked_out_by = None
#     reservation.testline.checked_out_time = None

#     db.session.commit()

#     reservation_dict = reservation.to_dict()
#     reservation_dict['start_time'] = convert_to_central(reservation.start_time)
#     reservation_dict['end_time'] = convert_to_central(reservation.end_time)
#     reservation_dict['returned_time'] = convert_to_central(reservation.returned_time)

#     testline_dict = reservation.testline.to_dict()
#     testline_dict['checked_out_time'] = convert_to_central(reservation.testline.checked_out_time)
#     testline_dict['returned_time'] = convert_to_central(reservation.testline.returned_time)

#     return jsonify({
#         'reservation': reservation_dict,
#         'testline': testline_dict,
#         'user': reservation.user.to_dict()
#     }), 200


if __name__=='__main__':
    app.run(port=5000,debug=True)

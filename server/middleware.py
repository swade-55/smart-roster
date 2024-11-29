from functools import wraps
from flask import request, jsonify
from flask_login import current_user

def check_origin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        origin = request.headers.get('Origin')
        if origin != "http://localhost:3000":
            return jsonify({'message': 'Origin not allowed!'}), 403

        return f(*args, **kwargs)
    return decorated

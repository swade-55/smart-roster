from flask import Flask, Blueprint, jsonify, request, session
from models import db, User
from config import app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, logout_user, current_user
from middleware import check_origin
import stripe
import os
from dotenv import load_dotenv
import logging
import json

load_dotenv()

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

api_bp = Blueprint('api', __name__, url_prefix='/labinv/api')

@api_bp.route('/users', methods=['GET'])
@login_required
@check_origin
def fetch_users():
    # Return only the current user's information
    return jsonify(current_user.to_dict()), 200

@api_bp.route('/create_user', methods=['POST'])
def create_user():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'message': 'User already exists'}), 409

    hashed_password = generate_password_hash(password)

    new_user = User(username=username, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully", "user_id": new_user.id}), 201

#@api_bp.route('/login', methods=['POST'])
#def login():
#    username = request.json.get('username')
#    password = request.json.get('password')
#    user = User.query.filter_by(username=username).first()
#    if user and user.check_password(password):
#        login_user(user)
#        return jsonify({"message": "Login successful", "user": user.to_dict()}), 200
#    else:
#        return jsonify({"message": "Invalid username or password"}), 401


@api_bp.route('/login', methods=['POST'])
def login():
    try:
        username = request.json.get('username')
        password = request.json.get('password')
        print(f"Login attempt for user: {username}")
        
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user, remember=True)
            session.permanent = True
            session['user_id'] = user.id
            
            print(f"Session after login: {dict(session)}")
            
            response = jsonify({
                "message": "Login successful",
                "user": user.to_dict(),
                "isAuthenticated": True
            })
            
            return response, 200
        else:
            print("Invalid credentials")
            return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"message": f"Login error: {str(e)}"}), 500

@api_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200


@api_bp.route('/check_session', methods=['GET'])
def check_session():
    print("Checking session...")
    print("Session data:", dict(session))
    print("Current user authenticated:", current_user.is_authenticated if hasattr(current_user, 'is_authenticated') else None)
    
    if current_user.is_authenticated:
        return jsonify({
            "isAuthenticated": True,
            "user": current_user.to_dict(),
            "message": "Session valid"
        }), 200
    else:
        return jsonify({
            "isAuthenticated": False,
            "message": "Session invalid"
        }), 401


@api_bp.route('/update-subscription', methods=['POST'])
@login_required
def update_subscription():
    data = request.json
    current_user.has_subscription = data['hasSubscription']
    db.session.commit()
    return jsonify({'hasSubscription': current_user.has_subscription}), 200

@api_bp.route('/create-checkout-session', methods=['POST'])
@login_required
def create_checkout_session():
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price': 'price_1Q9IbvInEkKEGKpmId4axDof',
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url='http://localhost:3000/labinv/subscription-success',
            cancel_url='http://localhost:3000/labinv/subscription',
            client_reference_id=current_user.username,
        )
        return jsonify({'id': checkout_session.id})
    except Exception as e:
        return jsonify(error=str(e)), 400

@api_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.data
    event = None

    try:
        event = json.loads(payload)
    except json.JSONDecodeError as e:
        return jsonify(error='Invalid payload'), 400

    if event and event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_successful_payment(session)
        return jsonify(success=True), 200
    else:
        return jsonify(success=True, message="Unhandled event type"), 200

def handle_successful_payment(session):
    client_reference_id = session.get('client_reference_id')
    if client_reference_id:
        user = User.query.filter_by(username=client_reference_id).first()
        if user:
            user.has_subscription = True
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
    else:
        print("No client_reference_id found in the session")

@api_bp.route('/pay', methods=['POST'])
@login_required
def pay():
    try:
        intent = stripe.PaymentIntent.create(
            amount=5000,  # Amount in cents
            currency='usd',
            receipt_email=current_user.email
        )
        return jsonify({"client_secret": intent.client_secret})
    except Exception as e:
        return jsonify(error=str(e)), 400

app.register_blueprint(api_bp)

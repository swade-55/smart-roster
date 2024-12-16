from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, User 
import secrets
import os
from flask_login import LoginManager
from dotenv import load_dotenv
from datetime import timedelta 

app = Flask(__name__, static_folder='../client/build')
load_dotenv()
secret_key = secrets.token_hex(16)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///roster_management.db'
#database_uri = os.environ.get('DATABASE_URL', 'postgresql://sawade:Ia26i2023@localhost/roster_management')
#app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['STRIPE_PUBLISHABLE_KEY'] = os.getenv('STRIPE_PUBLISHABLE_KEY')
app.config['STRIPE_WEBHOOK_SECRET'] = os.getenv('STRIPE_WEBHOOK_SECRET')

app.config.update(
    SESSION_COOKIE_SECURE=False,  # Set to True if using HTTPS
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_PATH='/',  # Match your app's base URL
    #SESSION_COOKIE_DOMAIN='3.141.20.174',
    PERMANENT_SESSION_LIFETIME=timedelta(days=1),
    MAIL_SERVER=os.getenv('MAIL_SERVER'),
    MAIL_PORT=int(os.getenv('MAIL_PORT',587)),
    MAIL_USE_TLS=os.getenv('MAIL_USE_TLS','True').lower()=='true',
    MAIL_USERNAME=os.getenv('MAIL_USERNAME'),
    MAIL_PASSWORD=os.getenv('MAIL_PASSWORD'),
    MAIL_DEFAULT_SENDER=os.getenv('MAIL_DEFAULT_SENDER'),
)

#config for excel spreadsheet import
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
#config for excel spreadsheet import


app.config['SECRET_KEY'] = secret_key

migrate = Migrate(app,db)

db.init_app(app)

login_manager = LoginManager(app)
login_manager.login_view = 'api.login' 

CORS(app, resources={
    r"/labinv/api/*": {
        "origins": ["http://3.141.20.174", "http://localhost:3000"],
        "supports_credentials": True,
        "allow_credentials": True,
        "expose_headers": ["Set-Cookie"],
        "allow_headers": ["Content-Type", "Authorization", "Origin"]
    }
})
#mobile
#CORS(app, resources={r"/labinv/api/*": {"origins": ["http://localhost:3000", "capacitor://localhost", "http://localhost"]}})

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

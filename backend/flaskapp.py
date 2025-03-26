from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps
import joblib
import pandas as pd
import requests
from models import db, User, Assessment

app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"], "methods": ["GET", "POST", "OPTIONS"], "expose_headers": ["Authorization"]}})
CORS(app)
# Load environment variables
from os import environ
from dotenv import load_dotenv

load_dotenv()

# Google Places API configuration
GOOGLE_API_KEY = environ.get('GOOGLE_API_KEY', '')

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = environ.get('SQLALCHEMY_DATABASE_URI', 'mysql+pymysql://asduser:asdpassword@localhost:3306/asd_prediction')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = environ.get('SECRET_KEY', 'your-secure-secret-key-here')  # Get from environment variable

# Initialize extensions
db.init_app(app)
bcrypt = Bcrypt(app)

# Custom JWT authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        return f(current_user_id, *args, **kwargs)
    return decorated

# Create database tables
with app.app_context():
    db.create_all()

# Define the questions for each age group
questions = {
    "children": [
        "Does your child avoid eye contact?",
        "Does your child show interest in other children?",
        "Does your child engage in pretend play?",
        "Does your child repeat the same actions or words?",
        "Does your child have trouble understanding others' feelings?",
        "Does your child have trouble adjusting to changes in routine?",
        "Does your child flap their hands or spin objects?",
        "Does your child have difficulty with social interactions?",
        "Does your child appear oversensitive to noises or lights?",
        "Does your child have specific interests or routines?"
    ],
    "adolescents": [
        "Do you have difficulty maintaining friendships?",
        "Do you prefer to spend time alone rather than with friends?",
        "Do you find it hard to understand what others are thinking or feeling?",
        "Do you have trouble understanding jokes or sarcasm?",
        "Do you find it difficult to adapt to changes?",
        "Do you engage in repetitive behaviors or have specific routines?",
        "Do you have intense interests in specific topics?",
        "Do you find social situations overwhelming?",
        "Do you avoid eye contact?",
        "Do you have difficulty with small talk or casual conversations?"
    ],
    "young_adults": [
        "Do you find it difficult to understand other people's emotions?",
        "Do you prefer to follow routines and find change difficult?",
        "Do you avoid social situations or find them overwhelming?",
        "Do you struggle with making eye contact during conversations?",
        "Do you have specific hobbies or interests that you focus on intensely?",
        "Do you find it challenging to engage in small talk?",
        "Do you often miss social cues, such as when someone is being sarcastic?",
        "Do you feel uncomfortable in group settings?",
        "Do you prefer to be alone rather than with others?",
        "Do you find loud noises or bright lights distressing?"
    ],
    "adults": [
        "Do you often prefer to be alone rather than with others?",
        "Do you find it challenging to understand social cues?",
        "Do you have specific routines or rituals that you prefer not to break?",
        "Do you avoid eye contact in conversations?",
        "Do you feel overwhelmed in social situations?",
        "Do you have intense interests or hobbies?",
        "Do you struggle with changes to your routine?",
        "Do you find it hard to make friends?",
        "Do you have difficulty understanding jokes or sarcasm?",
        "Do you feel uncomfortable in new situations or with unfamiliar people?"
    ]
}

# Define the function at the global scope
def get_model_and_scaler_for_age(age):
    if 0 < age <= 10:
        model_path = 'models/children_asd_model.pkl'
        age_group = 'children'
    elif 11 <= age <= 17:
        model_path = 'models/adolescent_asd_model.pkl'
        age_group = 'adolescents'
    elif 18 <= age <= 35:
        model_path = 'models/young_asd_model.pkl'
        age_group = 'young_adults'
    else:
        model_path = 'models/adult_asd_model.pkl'
        age_group = 'adults'
    
    model = joblib.load(model_path)
    scaler = joblib.load(model_path.replace('.pkl', '_scaler.pkl'))
    
    return model, scaler, age_group

@app.route('/get_questions', methods=['GET'])
def get_questions():
    age = int(request.args.get('age'))
    
    if 0 < age <= 10:
        age_group = 'children'
    elif 11 <= age <= 17:
        age_group = 'adolescents'
    elif 18 <= age <= 35:
        age_group = 'young_adults'
    else:
        age_group = 'adults'
    
    return jsonify({
        'age_group': age_group,
        'questions': questions[age_group]
    })

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    print(data)
    
    try:
        name = data['name']
        email = data['email']
        password = data['password']
    except KeyError:
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(name=name, email=email, password=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    try:
        email = data['email']
        password = data['password']
    except KeyError:
        return jsonify({'error': 'Missing required fields'}), 400
    
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=30)  # Token expires in 30 days
        }, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'access_token': token}), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/predict', methods=['POST'])
@token_required
def predict(current_user_id):
    print("[DEBUG] Entering predict endpoint")
    print("[DEBUG] Request headers:", request.headers)
    user_id = current_user_id
    
    data = request.get_json()
    print("[DEBUG] Request data:", data)
    
    try:
        age = int(data['age'])
        responses = data['responses']
    except KeyError:
        return jsonify({'error': 'Missing parameters'}), 400
    
    # Convert responses to integers
    try:
        user_responses = [int(r) for r in responses]
        print(user_responses)
    except ValueError:
        return jsonify({'error': 'Invalid response format'}), 400
    
    # Load model and scaler
    model, scaler, age_group = get_model_and_scaler_for_age(age)
    
    # Create DataFrame
    feature_names = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10_Autism_Spectrum_Quotient']
    user_responses_df = pd.DataFrame([user_responses], columns=feature_names)
    
    # Scale and predict
    user_responses_scaled = scaler.transform(user_responses_df)
    prediction = model.predict(user_responses_scaled)
    print('nex is assessment')
    print(prediction[0])
    # Save assessment result to database
    assessment = Assessment(
        user_id=user_id,
        age=age,
        age_group=age_group,
        responses=user_responses,
        prediction=bool(prediction[0])
    )
    db.session.add(assessment)
    db.session.commit()
    print('data is added to the db')
    print(prediction[0])
    return jsonify({
        'prediction': int(prediction[0]),
        'age_group': age_group
    })

@app.route('/user/assessments', methods=['GET'])
@token_required
def get_user_assessments(current_user_id):
    user_id = current_user_id
    assessments = Assessment.query.filter_by(user_id=user_id).order_by(Assessment.created_at.desc()).all()
    
    results = [{
        'id': assessment.id,
        'age': assessment.age,
        'age_group': assessment.age_group,
        'responses': assessment.responses,
        'prediction': assessment.prediction,
        'created_at': assessment.created_at.isoformat()
    } for assessment in assessments]
    print(results)
    
    return jsonify(results)

@app.route('/proxy/hospitals', methods=['GET'])
def get_nearby_hospitals():
    try:
        latitude = request.args.get('latitude')
        longitude = request.args.get('longitude')
        radius = request.args.get('radius', default=5000)

        if not latitude or not longitude:
            return jsonify({'error': 'Latitude and longitude are required'}), 400

        url = f'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
        params = {
            'location': f'{latitude},{longitude}',
            'radius': radius,
            'type': 'hospital',
            'key': 'AIzaSyBeKqZiFnQYZ8b3nUTx-R4Rm8BxcHTvcPc'
        }

        response = requests.get(url, params=params)
        data = response.json()

        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch hospitals', 'details': data.get('error_message')}), response.status_code

        return jsonify(data)

    except Exception as e:
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(environ.get('PORT', 8080)))
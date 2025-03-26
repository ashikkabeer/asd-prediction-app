# Autism Spectrum Disorder (ASD) Prediction Project

This project consists of a Flask backend API for ASD prediction and an Expo-based frontend mobile application. Follow these instructions to set up the project locally.

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm (Node Package Manager)
- Git
- Docker and Docker Compose (for containerized backend)

## Backend Setup

### Option 1: Local Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - Unix/MacOS:
     ```bash
     source venv/bin/activate
     ```

4. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the Flask server:
   ```bash
   python flaskapp.py
   ```
   The backend API will be available at `http://localhost:5000`

### Option 2: Docker Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build and start the Docker container:
   ```bash
   docker-compose up --build
   ```
   The backend API will be available at `http://localhost:5000`

3. To stop the container:
   ```bash
   docker-compose down
   ```

4. To view container logs:
   ```bash
   docker-compose logs
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Run the app:
   - Use an Android emulator
   - Use an iOS simulator
   - Scan the QR code with Expo Go app on your physical device

## Project Structure

```
├── backend/               # Flask backend
│   ├── data/             # Dataset files
│   ├── models/           # Trained ML models
│   ├── flaskapp.py       # Main Flask application
│   └── requirements.txt  # Python dependencies
│
└── frontend/             # Expo frontend
    ├── app/             # Application screens
    ├── components/      # Reusable UI components
    ├── services/        # API services
    └── questions.txt/   # ASD questionnaires
```

## Features

- ASD prediction for different age groups:
  - Adult
  - Adolescent
  - Children
  - Toddler
- User-friendly mobile interface
- Secure API endpoints
- Pre-trained machine learning models

## Development

- Backend API documentation is available in `Autism-Prediction.postman_collection.json`
- Frontend uses Expo's file-based routing system
- Environment variables can be configured in `.env` files

## License

Refer to the LICENSE file in the repository for licensing information.
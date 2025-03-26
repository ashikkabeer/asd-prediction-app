import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import os

# Function to preprocess data and train model
def train_and_save_model(csv_path, model_save_path):
    # Load the dataset
    dataset = pd.read_csv(csv_path)
    
    # Preprocess the data (applying Z-score transformation here as an example)
    dataset['Sex'] = dataset['Sex'].map({'M': 1, 'F': 0})
    dataset['Jaundice'] = dataset['Jaundice'].map({'Yes': 1, 'No': 0})
    dataset['Family_mem_with_ASD'] = dataset['Family_mem_with_ASD'].map({'Yes': 1, 'No': 0})
    dataset['ASD_traits'] = dataset['ASD_traits'].map({'Yes': 1, 'No': 0})
    
    X = dataset[['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10_Autism_Spectrum_Quotient']]
    y = dataset['ASD_traits']
    
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train the model
    model = RandomForestClassifier(random_state=42)
    model.fit(X_train, y_train)
    
    # Save the model and scaler
    joblib.dump(model, model_save_path)
    joblib.dump(scaler, model_save_path.replace('.pkl', '_scaler.pkl'))

# Define paths for CSV files and model saving
data_dir = 'data'
model_dir = 'models'

# Train models for different age groups
train_and_save_model(os.path.join(data_dir, 'Children_ASD.csv'), os.path.join(model_dir, 'children_asd_model.pkl'))
train_and_save_model(os.path.join(data_dir, 'Adolescent_ASD.csv'), os.path.join(model_dir, 'adolescent_asd_model.pkl'))
train_and_save_model(os.path.join(data_dir, 'Adult_ASD.csv'), os.path.join(model_dir, 'adult_asd_model.pkl'))
train_and_save_model(os.path.join(data_dir, 'Young_ASD.csv'), os.path.join(model_dir, 'young_asd_model.pkl'))

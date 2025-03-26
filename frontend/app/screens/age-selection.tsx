import { useRouter } from 'expo-router';
import { useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Colors, CommonStyles } from '../../constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AgeSelectionScreen() {
  const router = useRouter();
  const [age, setAge] = useState('');

  const handleContinue = async () => {
    if (!age || isNaN(Number(age)) || Number(age) <= 0) {
      Alert.alert('Invalid Age', 'Please enter a valid age');
      return;
    }

    // Ensure AsyncStorage is available
    if (typeof AsyncStorage?.getItem !== 'function') {
      Alert.alert('Error', 'Storage is not properly initialized');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.getQuestions(age), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

      const data = await response.json();
      if (response.ok) {
        try {
          // Store the questions and age using AsyncStorage
          await AsyncStorage.setItem('assessment_questions', JSON.stringify(data));
          await AsyncStorage.setItem('user_age', age);
          router.push('./questionnaire');
        } catch (storageError) {
          console.error('Error storing data:', storageError);
          Alert.alert('Storage Error', 'Failed to save assessment data. Please try again.');
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert('Error', 'Failed to connect to the server');
    }
  };

  return (
    <View style={[CommonStyles.container, styles.container]}>
      <Text style={[CommonStyles.title, styles.title]}>Enter Your Age</Text>
      <Text style={[CommonStyles.subtitle, styles.subtitle]}>This will help us provide appropriate questions for your assessment</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Enter age"
          keyboardType="numeric"
          maxLength={3}
        />
      </View>

      <TouchableOpacity
        style={[CommonStyles.button, styles.continueButton]}
        onPress={handleContinue}
      >
        <Text style={CommonStyles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[CommonStyles.button, styles.assessmentButton]}
        onPress={() => router.push('/screens/assessments')}
      >
        <Text style={CommonStyles.buttonText}>View Assessment History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: Colors.surface,
  },
  continueButton: {
    marginTop: 16,
  },
  assessmentButton: {
    marginTop: 12,
    backgroundColor: Colors.secondary,
  },
});
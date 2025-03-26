import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Switch, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native';
import { Colors, CommonStyles } from '../../constants/Theme';
import { getAccessToken } from '@/services/auth';
import { API_ENDPOINTS } from '../../config/api';


interface Question {
  id: number;
  text: string;
  answer: boolean;
}

export default function QuestionnaireScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [buttonScale] = useState(new Animated.Value(1));
  const [questions, setQuestions] = useState<Question[]>([]);
  const [age, setAge] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load questions and age from AsyncStorage
    const loadData = async () => {
      try {
        // Ensure AsyncStorage is available
        if (typeof AsyncStorage?.getItem !== 'function') {
          throw new Error('AsyncStorage is not properly initialized');
        }
        // Ensure AsyncStorage is available
        if (typeof AsyncStorage?.getItem !== 'function') {
          throw new Error('AsyncStorage is not properly initialized');
        }

        const [storedQuestions, storedAge] = await Promise.all([
          AsyncStorage.getItem('assessment_questions'),
          AsyncStorage.getItem('user_age')
        ]).catch(error => {
          throw new Error(`AsyncStorage operation failed: ${error.message}`);
        });

        if (storedQuestions && storedAge) {
          try {
            const parsedQuestions = JSON.parse(storedQuestions);
            // Handle both array and object responses
            const questionsArray = Array.isArray(parsedQuestions) ? parsedQuestions : parsedQuestions.questions || [];
            setQuestions(questionsArray.map((q: string, index: number) => ({
              id: index,
              text: q,
              answer: false
            })));
            setAge(storedAge);
          } catch (parseError) {
            console.error('Error parsing questions:', parseError);
            Alert.alert('Error', 'Invalid question format');
            router.push('./age-selection');
          }
        } else {
          Alert.alert('Error', 'No questions found');
          router.push('./age-selection');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load assessment data');
        router.push('./age-selection');
      }
    };

    loadData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleAnswer = (id: number) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, answer: !q.answer } : q
    ));
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = async () => {
    animateButton();
    setIsLoading(true);
    try {
      // Validate AsyncStorage availability
      if (typeof AsyncStorage?.getItem !== 'function') {
        throw new Error('AsyncStorage is not properly initialized');
      }

      if (!age || isNaN(Number(age)) || Number(age) <= 0) {
        Alert.alert('Invalid Age', 'Please enter a valid age');
        return;
      }

      const responses = questions.map(q => q.answer ? '1' : '0');
      console.log(responses)
      if (responses.length === 0) {
        Alert.alert('Invalid Responses', 'No responses found');
        return;
      }

      const token = await getAccessToken();
      // Import API configuration
      const response = await fetch(API_ENDPOINTS.predict, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          age: age,
          responses: responses
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Store the prediction result and age group
        await AsyncStorage.setItem('autism_prediction', data.prediction.toString());
        await AsyncStorage.setItem('age_group', data.age_group);
        router.push('/screens/result');
      } else {
        Alert.alert('Submission Failed', data.error || 'Error submitting assessment');
      }
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network or server error';
      Alert.alert('Error', `Submission failed: ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[CommonStyles.container, styles.container]}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={[CommonStyles.title, styles.title]}>Autism Assessment Questionnaire</Text>
        <Text style={[CommonStyles.subtitle, styles.subtitle]}>Please answer all questions honestly</Text>

        {questions.map((question) => (
          <Animated.View
            key={question.id}
            style={[styles.questionContainer, { opacity: fadeAnim }]}
          >
            <Text style={styles.questionText}>{question.text}</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>{question.answer ? 'Yes' : 'No'}</Text>
              <Switch
                value={question.answer}
                onValueChange={() => toggleAnswer(question.id)}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={question.answer ? Colors.primary : Colors.surface}
                ios_backgroundColor={Colors.border}
              />
            </View>
          </Animated.View>
        ))}

        <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
          <TouchableOpacity
            style={[CommonStyles.button, styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Text style={CommonStyles.buttonText}>{isLoading ? 'Submitting...' : 'Submit Assessment'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </ScrollView>
    {isLoading && (
      <View style={styles.loadingOverlay}>
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>"Your answers help us understand you better"</Text>
          <Text style={styles.loadingText}>Please wait while we process your responses...</Text>
        </View>
      </View>
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteBox: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  quoteText: {
    fontSize: 18,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  container: {
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  questionContainer: {
    ...CommonStyles.card,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  buttonContainer: {
    marginVertical: 24,
  },
  submitButton: {
    marginTop: 16,
  },
});
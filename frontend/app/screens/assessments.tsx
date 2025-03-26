import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Colors, CommonStyles } from '../../constants/Theme';
import { getAccessToken } from '../../services/auth';

type Assessment = {
  id: number;
  age: number;
  age_group: string;
  responses: string[];
  prediction: number;
  created_at: string;
};

export default function AssessmentsScreen() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch('http://192.168.1.2:8080/user/assessments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setAssessments(data);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch assessments');
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
      Alert.alert('Error', 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={[CommonStyles.container, styles.container]}>
      <Text style={[CommonStyles.title, styles.title]}>Assessment History</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : assessments.length === 0 ? (
        <Text style={styles.noAssessments}>No previous assessments found</Text>
      ) : (
        assessments.map((assessment) => (
          <View key={assessment.id} style={[styles.assessmentCard, {
            backgroundColor: assessment.prediction == 0 ? '#e8f5e9' : '#fff9c4'
          }]}>
            <Text style={styles.dateText}>{formatDate(assessment.created_at)}</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.detailText}>Age: {assessment.age}</Text>
              <Text style={styles.detailText}>Age Group: {assessment.age_group}</Text>
              <Text style={styles.predictionText}>
                Result: {assessment.prediction == 0 ? 
                  'Low likelihood of ASD' : 
                  'Indicators of ASD present'}
              </Text>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity
        style={[CommonStyles.button, styles.backButton]}
        onPress={() => router.back()}
      >
        <Text style={CommonStyles.buttonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  loader: {
    marginTop: 40,
  },
  noAssessments: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.text,
    marginTop: 40,
  },
  assessmentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  detailsContainer: {
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: Colors.text,
  },
  predictionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 4,
  },
  backButton: {
    marginTop: 24,
    marginBottom: 24,
  },
});
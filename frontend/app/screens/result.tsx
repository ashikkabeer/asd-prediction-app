import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Animated } from 'react-native';
import { Colors, CommonStyles } from '../../constants/Theme';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ResultType = {
  message: string;
};

type Hospital = {
  name: string;
  vicinity: string;
  distance: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id?: string;
};
export default function ResultScreen() {
  const router = useRouter();
  const [result, setResult] = useState<ResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [buttonScale] = useState(new Animated.Value(1));
  const [prediction, setPrediction] = useState<string | null>(null);

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return `${d.toFixed(1)} km`;
  };

  const fetchNearbyHospitals = async (latitude: number, longitude: number) => {
    try {
      setLatitude(latitude.toString());
      setLongitude(longitude.toString());
      console.log('Latitude:', latitude);
      console.log('Longitude:', longitude);
      const response = await fetch(
        // `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=8080&type=hospital&key=${googleApiKey}`
         `${API_ENDPOINTS.hospitals}?latitude=${latitude}&longitude=${longitude}&radius=8080`
      );

      const data = await response.json();
      if (data.results) {
        const hospitalList = data.results.map((place: any) => ({
          name: place.name,
          vicinity: place.vicinity,
          distance: place.geometry?.location ?
            calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng) :
            "Distance unavailable",
          geometry: place.geometry,
          place_id: place.place_id
        }));
        setHospitals(hospitalList);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const loadAssessmentResult = async () => {
      try {
        const predictionValue = await AsyncStorage.getItem('autism_prediction');
        if (predictionValue !== null) {
          setPrediction(predictionValue);
          setResult({
            message: predictionValue === '0' ?
              'Based on the assessment, there is a low likelihood of Autism Spectrum Disorder (ASD). However, this is not a clinical diagnosis. If you have concerns, please consult with a healthcare professional.' :
              'Based on the assessment, there may be indicators of Autism Spectrum Disorder (ASD). This is not a clinical diagnosis. We strongly recommend consulting with a qualified healthcare professional for a comprehensive evaluation.'
          });
        } else {
          throw new Error('No assessment result found');
        }
      } catch (error) {
        console.error('Error loading assessment result:', error);
        setResult({
          message: 'Error loading assessment result. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    const getLocationAndHospitals = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        fetchNearbyHospitals(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        setLocationError('Error getting location');
        console.error(error);
      }
    };

    loadAssessmentResult();
    getLocationAndHospitals();
  }, []);

  return (
    <ScrollView
      style={[
        CommonStyles.container,
        styles.container,
        { backgroundColor: prediction === '0' ? '#e8f5e9' : '#fff9c4' }
      ]}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={[CommonStyles.title, styles.title]}>Your Autism Assessment Result</Text>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <Text style={styles.resultText}>{result?.message}</Text>
        )}

        {prediction === '1' && (
          <>
            <Text style={[CommonStyles.subtitle, styles.subtitle]}>Nearby Hospitals</Text>
            {locationError ? (
              <Text style={styles.errorText}>{locationError}</Text>
            ) : hospitals.length > 0 ? (
              hospitals.map((hospital, index) => (
                <Animated.View
                  key={index}
                  style={[styles.hospitalContainer, { opacity: fadeAnim }]}
                >
                  <Text style={styles.hospitalName}>{hospital.name}</Text>
                  <Text style={styles.hospitalAddress}>{hospital.vicinity}</Text>
                  <Text style={styles.hospitalDistance}>{hospital.distance}</Text>
                </Animated.View>
              ))
            ) : (
              <Text style={styles.loadingText}>Loading nearby hospitals... </Text>
            )}
          </>
        )}

        <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
          <TouchableOpacity
            style={[CommonStyles.button, styles.homeButton]}
            onPress={() => {
              animateButton();
              router.push('/');
            }}
            activeOpacity={0.8}
          >
            <Text style={CommonStyles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 16,
  },
  resultText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    color: Colors.text,
    lineHeight: 24,
  },
  hospitalContainer: {
    ...CommonStyles.card,
    marginBottom: 12,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: Colors.text,
  },
  hospitalAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  hospitalDistance: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginVertical: 12,
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 12,
    color: Colors.textSecondary,
  },
  buttonContainer: {
    marginVertical: 24,
  },

  homeButton: {
    backgroundColor: Colors.secondary,
    marginTop: 8,
  },
});

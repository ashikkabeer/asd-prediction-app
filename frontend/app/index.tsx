import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useEffect, useState } from 'react';
import { Colors, CommonStyles } from '../constants/Theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [buttonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

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

  return (
    <View style={[CommonStyles.container, styles.container]}>
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <Text style={[CommonStyles.title, styles.title]}>ASD Test</Text>
          <Text style={styles.subtitle}>Autism Spectrum Disorder Assessment</Text>

          <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
            <TouchableOpacity
              style={[CommonStyles.button, styles.loginButton]}
              onPress={() => {
                animateButton();
                router.push('/screens/login');
              }}
              activeOpacity={0.8}
            >
              <Text style={CommonStyles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[CommonStyles.button, styles.signupButton]}
              onPress={() => {
                animateButton();
                router.push('/screens/signup');
              }}
              activeOpacity={0.8}
            >
              <Text style={CommonStyles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.border,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    color: Colors.surface,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.surface,
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    backgroundColor: Colors.primary,
  },
  signupButton: {
    backgroundColor: Colors.secondary,
  },
});

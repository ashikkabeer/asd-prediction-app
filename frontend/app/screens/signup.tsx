import { useRouter } from 'expo-router';
import { authenticatedFetch } from '../../services/auth';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { Colors, CommonStyles } from '../../constants/Theme';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [buttonScale] = useState(new Animated.Value(1));

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

  const handleSignup = async () => {
    animateButton();
    try {
      const response = await authenticatedFetch('http://192.168.1.2:8080/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Signup Successful', data.message);
        router.push('./login');
      } else {
        Alert.alert('Signup Failed', data.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign up.');
    }
  };

  return (
    <View style={[CommonStyles.container, styles.container]}>
      <Text style={[CommonStyles.title, styles.title]}>Create Account</Text>
      <Text style={CommonStyles.subtitle}>Join us today</Text>
      
      <TextInput 
        style={CommonStyles.input} 
        placeholder="Full Name"
        placeholderTextColor={Colors.textSecondary}
        onChangeText={setName}
      />
      <TextInput 
        style={CommonStyles.input} 
        placeholder="Email"
        placeholderTextColor={Colors.textSecondary}
        onChangeText={setEmail}
      />
      <TextInput 
        style={CommonStyles.input} 
        placeholder="Password"
        placeholderTextColor={Colors.textSecondary}
        secureTextEntry 
        onChangeText={setPassword}
      />
      
      <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
        <TouchableOpacity 
          style={[CommonStyles.button, styles.signupButton]} 
          onPress={handleSignup}
          activeOpacity={0.8}
        >
          <Text style={CommonStyles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={() => router.push('/screens/login')}
        activeOpacity={0.6}
      >
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 10,
  },
  signupButton: {
    marginTop: 20,
    width: '100%',
    backgroundColor: Colors.secondary,
  },
  loginButton: {
    marginTop: 20,
    padding: 10,
  },
  loginText: {
    color: Colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

import { useRouter } from 'expo-router';
import { setAccessToken } from '../../services/auth';
import { API_ENDPOINTS } from '../../config/api';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { Colors, CommonStyles } from '../../constants/Theme';

export default function LoginScreen() {
  const router = useRouter();
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

  const handleLogin = async () => {
    animateButton();
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log(data.access_token)
      if (response.ok && data.access_token) {
        await setAccessToken(data.access_token);
        Alert.alert('Login Successful', data.message);
        console.log('login successfull')
        router.push('./age-selection');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Try again.');
    }
  };

  return (
    <View style={[CommonStyles.container, styles.container]}>
      <Text style={[CommonStyles.title, styles.title]}>Welcome Back</Text>
      <Text style={CommonStyles.subtitle}>Sign in to continue</Text>
      
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
          style={[CommonStyles.button, styles.loginButton]} 
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={CommonStyles.buttonText}>Login</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity 
        style={styles.signupButton} 
        onPress={() => router.push('/screens/signup')}
        activeOpacity={0.6}
      >
        <Text style={styles.signupText}>Don't have an account? Sign up</Text>
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
  loginButton: {
    marginTop: 20,
    width: '100%',
  },
  signupButton: {
    marginTop: 20,
    padding: 10,
  },
  signupText: {
    color: Colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

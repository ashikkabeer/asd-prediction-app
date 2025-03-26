import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function FormScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://192.168.1.2:8080/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Form Submitted', 'Processing your results...');
        router.push('/screens/result');
      } else {
        Alert.alert('Submission Failed', data.error || 'Error submitting form');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Autism Assessment Form</Text>
      <TextInput style={styles.input} placeholder="Enter your name" onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Enter your age" keyboardType="numeric" onChangeText={setAge} />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '80%', padding: 10, marginVertical: 10, borderWidth: 1, borderRadius: 5 },
});

import { StyleSheet } from 'react-native';

export const Colors = {
  primary: '#1E88E5',
  primaryDark: '#1565C0',
  primaryLight: '#64B5F6',
  secondary: '#2962FF',
  accent: '#00B0FF',
  background: '#F5F9FF',
  surface: '#FFFFFF',
  text: '#1A237E',
  textSecondary: '#5C6BC0',
  border: '#BBDEFB',
  error: '#FF1744',
  success: '#00C853'
};

export const Animations = {
  button: {
    scale: 0.98,
    duration: 100
  },
  transition: {
    duration: 300
  }
};

export const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 30,
    textAlign: 'center'
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    width: '100%',
    fontSize: 16,
    color: Colors.text
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  }
});
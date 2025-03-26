// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import WelcomeScreen from './screens/WelcomeScreen';
// import LoginScreen from './screens/LoginScreen';
// import SignupScreen from './screens/SignupScreen';
// import FormScreen from './screens/FormScreen';
// import ResultScreen from './screens/ResultScreen';

// const Stack = createStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer> {/* ✅ Only one NavigationContainer */}
//       <Stack.Navigator initialRouteName="Welcome">
//         <Stack.Screen name="Welcome" component={WelcomeScreen} />
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="Signup" component={SignupScreen} />
//         <Stack.Screen name="Form" component={FormScreen} />
//         <Stack.Screen name="Result" component={ResultScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack />;
}
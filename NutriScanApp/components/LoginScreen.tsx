// components/LoginScreen.tsx
// @aandreu7

import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { styles, formStyles } from '@/constants/styles.tsx';
import { auth } from '@/firebaseConfig';
import GoogleSignInButton from '@/components/GoogleSignInButton';

/*
  LoginScreen Component

  - Provides a simple login form with email and password inputs.
  - Handles login via Firebase Authentication using email/password.
  - Displays status messages for success or error.
  - Includes a GoogleSignInButton component for Google-based login.
  - Offers a link to switch to the registration screen.
*/
export default function LoginScreen({ onSwitchToRegister, onLoginSuccess}: {
  onSwitchToRegister: () => void;
  onLoginSuccess: (user: User, isGoogleUser: boolean) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        onLoginSuccess(userCredential.user, false);
        setMessage(`Logged in successfully. UID: ${user.uid}`);
      })
      .catch((error) => {
        setMessage(`Error: ${error.message}`);
      });
  };

  return (
    <View style={styles.center}>
      <View style={formStyles.formContainer}>
        <Text style={styles.message}>Welcome back</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={formStyles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={formStyles.input}
        />
        <View style={styles.buttonContainer}>
          <View style={styles.customButton}>
            <Text style={styles.buttonText} onPress={handleLogin}>Login</Text>
          </View>
        </View>
        {message !== '' && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{message}</Text>
          </View>
        )}
      </View>
      <GoogleSignInButton onLoginSuccess={onLoginSuccess} />
      <Text onPress={onSwitchToRegister} style={styles.customButton}>
        Don't have an account? Register here
      </Text>
    </View>
  );
}

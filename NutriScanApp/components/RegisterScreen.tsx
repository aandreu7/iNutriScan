// components/RegisterScreen.tsx
// @aandreu7

import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile, User } from 'firebase/auth';
import { styles, formStyles } from '@/constants/styles.tsx'
import { auth } from '@/firebaseConfig';

/*
  RegisterScreen Component

  - Provides a registration form with inputs for email, username, and password.
  - Creates a new user in Firebase Authentication with email and password.
  - Updates the user's profile with the provided display name.
  - Displays status messages on successful registration or errors.
  - Includes a link to switch to the login screen.
*/
export default function RegisterScreen({ onSwitchToLogin, onRegisterSuccess }: {
  onSwitchToLogin: () => void;
  onRegisterSuccess: (user: User) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [message, setMessage] = useState('');

  // Handles register
  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return updateProfile(user, {
          displayName: userName,
        })
        .then(() => {
          onRegisterSuccess(userCredential.user);
          setMessage('Registered successfully. UID: ${user.uid}, Name: ${userName}');
         })
      })
      .catch((error) => {
        setMessage(`Error: ${error.message}`);
      });
  };

  // Shows register form
  return (
    <View style={styles.center}>
      <View style={formStyles.formContainer}>
        <Text style={styles.message}>Create your account</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={formStyles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Name"
          value={userName}
          onChangeText={setUserName}
          style={formStyles.input}
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
            <Text style={styles.buttonText} onPress={handleRegister}>Register</Text>
          </View>
        </View>
        {message !== '' && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{message}</Text>
          </View>
        )}
      </View>
      <Text onPress={onSwitchToLogin} style={styles.customButton}>
        Already have an account? Login here
      </Text>
    </View>
  );
}
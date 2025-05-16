import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    setError('');
    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('¡Registro exitoso!');
      // Aquí puedes redirigir al usuario a otra pantalla
    } catch (e) {
      setError(e.message);
      console.error('Error al registrar:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        mode="contained"
        onPress={signUp}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Registrarse
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default RegisterForm;
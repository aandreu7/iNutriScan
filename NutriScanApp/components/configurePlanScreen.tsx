// components/configurePlanScreen.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { firestore } from '@/firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { useAuthListener } from '@/hooks/useAuthListener';

export default function BioGoalsForm() {
  const { user } = useAuthListener();
  const [form, setForm] = useState({
    edad: '',
    peso: '',
    altura: '',
    objetivo: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return Alert.alert('Debes iniciar sesión');

    try {
      await addDoc(collection(firestore, 'bioGoalsForms'), {
        uid: user.uid,
        timestamp: Date.now(),
        ...form,
      });
      Alert.alert('Formulario enviado');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Edad</Text>
      <TextInput
        keyboardType="numeric"
        value={form.edad}
        onChangeText={(text) => handleChange('edad', text)}
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Text>Peso (kg)</Text>
      <TextInput
        keyboardType="numeric"
        value={form.peso}
        onChangeText={(text) => handleChange('peso', text)}
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Text>Altura (cm)</Text>
      <TextInput
        keyboardType="numeric"
        value={form.altura}
        onChangeText={(text) => handleChange('altura', text)}
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Text>Objetivo</Text>
      <TextInput
        placeholder="Ej: Bajar de peso"
        value={form.objetivo}
        onChangeText={(text) => handleChange('objetivo', text)}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />

      <Button title="Enviar" onPress={handleSubmit} />
    </View>
  );
}

// components/PlanForm.tsx
// @aandreu7

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';

type Props = {
  onBack: () => void;
  initialData?: {
    age?: number;
    height?: number;
    weight?: number;
    sex?: boolean; // true=male, false=female
    target?: string;
  };
};

type TargetType =
  | 'gain_muscle'
  | 'lose_fat'
  | 'endurance'
  | 'health'
  | 'rehab'
  | '';

export default function PlanForm({ onBack, initialData }: Props) {
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | ''>('');
  const [target, setTarget] = useState<TargetType>(null);

  useEffect(() => {
    if (initialData) {
      if (initialData.age) setAge(initialData.age.toString());
      if (initialData.height) setHeight(initialData.height.toString());
      if (initialData.weight) setWeight(initialData.weight.toString());
      if (initialData.sex !== undefined) setSex(initialData.sex ? 'male' : 'female');
      if (initialData.target) setTarget(initialData.target as TargetType);
    }
  }, [initialData]);

  const calculateKcalGoal = (
      age: number,
      height: number,
      weight: number,
      sex: 'male' | 'female',
      target: TargetType
    ): number => {
      // BMR with Mifflin-St Jeor
      const bmr =
        sex === 'male'
          ? 10 * weight + 6.25 * height - 5 * age + 5
          : 10 * weight + 6.25 * height - 5 * age - 161;

    switch (target) {
      case 'gain_muscle':
        return Math.round(bmr * 1.2 + 300);
      case 'lose_fat':
        return Math.round(bmr * 1.2 - 300);
      case 'endurance':
        return Math.round(bmr * 1.4);
      case 'health':
        return Math.round(bmr * 1.2);
      case 'rehab':
        return Math.round(bmr * 1.1);
      default:
        return Math.round(bmr);
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!age || !height || !weight || !sex || !target) {
      Alert.alert('Please, fill all fields.');
      return;
    }

    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const kcalGoal = calculateKcalGoal(ageNum, heightNum, weightNum, sex, target);

    const userRef = doc(db, 'users', user.uid);

    try {
      await updateDoc(userRef, {
        age: parseInt(age),
        height: parseFloat(height),
        weight: parseFloat(weight),
        sex: sex === 'male', // true = male, false = female
        target,
        kcal_target: kcalGoal,
      });

      Alert.alert('✅ Plan successfully saved.');
      onBack();
    } catch (error) {
      console.error("Error updating plan:", error);
      Alert.alert('❌ Error while saving plan.');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Set up your nutrition plan</Text>

      <Text>Age:</Text>
      <TextInput
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Text>Height (cm):</Text>
      <TextInput
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Text>Current weight (kg):</Text>
      <TextInput
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Text>Sex:</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Button
          title="Male"
          onPress={() => setSex('male')}
          color={sex === 'male' ? 'blue' : 'gray'}
        />
        <View style={{ width: 10 }} />
        <Button
          title="Female"
          onPress={() => setSex('female')}
          color={sex === 'female' ? 'blue' : 'gray'}
        />
      </View>

      <Text>Target:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {[
          { label: 'Gain muscle', value: 'gain_muscle' },
          { label: 'Lose fat', value: 'lose_fat' },
          { label: 'Improve endurance', value: 'improve_endurance' },
          { label: 'Stay healthy', value: 'stay_healthy' },
          { label: 'Rehabilitation', value: 'rehabilitation' },
        ].map(({ label, value }) => (
          <View key={value} style={{ marginRight: 10, marginBottom: 5 }}>
            <Button
              title={label}
              onPress={() => setTarget(value as TargetType)}
              color={target === value ? 'blue' : 'gray'}
            />
          </View>
        ))}
      </View>

      <Button title="Save plan" onPress={handleSubmit} />
      <View style={{ height: 10 }} />
      <Button title="Cancel" onPress={onBack} color="red" />
    </View>
  );
}
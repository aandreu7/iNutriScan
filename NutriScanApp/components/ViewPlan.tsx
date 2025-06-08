// components/ViewPlan.tsx
// @aandreu7

import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import PlanForm from './PlanForm';
import { styles } from '@/constants/styles';

type Props = {
  plan: any;
  onBack: () => void;
  reloadPlan: () => Promise<void>;
};

/*
  ViewPlan Component
  - Receives user's plan from ConfigurePlan component and shows it.
*/

export default function ViewPlan({ plan, onBack, reloadPlan }: Props) {
  const [editing, setEditing] = useState(false);

  const handleBackFromEdit = async () => {
    setEditing(false);
    await reloadPlan();
  };

  if (editing) {
    return (
      <PlanForm
        onBack={handleBackFromEdit}
        initialData={plan}
      />
    );
  }

  return (
    <View style={styles.containerPlan}>
      <Text style={styles.header}>Your Plan</Text>

      <View style={styles.card}>
        <Text style={styles.label}>🎯 Target</Text>
        <Text style={styles.value}>{plan.target}</Text>

        <Text style={styles.label}>🧓 Age</Text>
        <Text style={styles.value}>{plan.age} years</Text>

        <Text style={styles.label}>⚖️ Weight</Text>
        <Text style={styles.value}>{plan.weight} kg</Text>

        <Text style={styles.label}>📏 Height</Text>
        <Text style={styles.value}>{plan.height} cm</Text>

        <Text style={styles.label}>🧬 Sex</Text>
        <Text style={styles.value}>{plan.sex ? 'Male ♂️' : 'Female ♀️'}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="✏️ Edit plan" onPress={() => setEditing(true)} />
        </View>
        <View style={styles.button}>
          <Button title="⬅️ Go back" onPress={onBack} color="#666" />
        </View>
      </View>
    </View>
  );
}
// components/ViewPlan.tsx
// @aandreu7

import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import PlanForm from './PlanForm';

type Props = {
  plan: any;
  onBack: () => void;
  reloadPlan: () => Promise<void>;
};

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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18 }}>🎯 Your current target:</Text>
      <Text style={{ marginTop: 10, fontSize: 16 }}>{plan.target}</Text>
      <Text style={{ marginTop: 10 }}>Age: {plan.age}</Text>
      <Text>Weight: {plan.weight} kg</Text>
      <Text>Height: {plan.height} cm</Text>
      <Text>Sex: {plan.sex ? 'Male' : 'Female'}</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Edit plan" onPress={() => setEditing(true)} />
      </View>

      <View style={{ marginTop: 10 }}>
        <Button title="Go back" onPress={onBack} />
      </View>
    </View>
  );
};

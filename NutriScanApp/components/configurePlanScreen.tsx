// components/configurePlanScreen.tsx
// @aandreu7

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';

import PlanForm from '@/components/PlanForm';
import ViewPlan from '@/components/ViewPlan';

type Props = {
  onBack: () => void;
};

/*
  ConfigurePlan Component
  - Checks if the current user has a nutritional plan saved in Firestore.
  - Loads user data from Firestore and determines whether a plan exists.
  - Shows a loading indicator while fetching data.
  - Renders either the ViewPlan component (if a plan exists) or the PlanForm component (if not).
*/

export default function ConfigurePlan({ onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [hasPlan, setHasPlan] = useState<boolean | null>(null);
  const [planData, setPlanData] = useState<any>(null);

  const loadPlan = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // Checks if the current user has a nutritional plan saved in Firestore.
    // Loads user data from Firestore (if exists).
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.target) {
          setHasPlan(true);
          setPlanData(data);
        } else {
          setHasPlan(false);
          setPlanData(null);
        }
      } else {
        setHasPlan(false);
        setPlanData(null);
      }
    } catch (error) {
      console.error("Error checking plan:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadPlan().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return hasPlan ? (
    <ViewPlan onBack={onBack} plan={planData} reloadPlan={loadPlan} />
  ) : (
    <PlanForm onBack={onBack} />
  );
};

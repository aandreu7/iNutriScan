// components/showDailyKcalBalance.tsx
// @aandreu7

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { styles } from '@/constants/styles'
import { functions } from '@/firebaseConfig';
import { httpsCallable } from 'firebase/functions';

export default function ShowDailyKcalBalance() {
  const [loading, setLoading] = useState(true);
  const [balanceInfo, setBalanceInfo] = useState<null | {
    balance: number;
    burntKcal: number;
    kcalTarget: number;
  }>(null);

  // Fetch the daily calorie balance from Firebase on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Call getDailyKcalBalance Cloud Function
        const getBalance = httpsCallable(functions, 'getDailyKcalBalance');
        const result = await getBalance();
        setBalanceInfo(result.data as any);
      } catch (error) {
        console.error('Error fetching kcal balance:', error);
        setBalanceInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance(); // Trigger fetch
  }, []);

  // Display loading spinner while waiting for data
  if (loading) {
    return (
      <View style={styles.balanceCard}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={styles.balanceLoading}>Loading calorical balance...</Text>
      </View>
    );
  }

  // If the request failed or no data was returned
  if (!balanceInfo) {
    return (
      <View style={styles.balanceCard}>
        <Text style={styles.balanceError}>No data available.</Text>
      </View>
    );
  }

  // Destructure the calorie-related data from the response
  const { burntKcal, kcalTarget, consumedKcal } = balanceInfo;

  // Determine whether the user is in a surplus (consumed more than needed)
  const isSurplus = kcalTarget < consumedKcal - burntKcal;

  // If the target is 0 (no plan has been configured), don't render anything
  if (kcalTarget==0) {
    return;
  }

  return (
    <View style={[styles.balanceCard, isSurplus ? styles.surplusCard : styles.deficitCard]}>
      <Text style={styles.balanceTitle}>Today's balance</Text>
      <Text style={styles.balanceText}>Target: {kcalTarget} kcal</Text>
      <Text style={styles.balanceText}>Consumed: {consumedKcal} kcal</Text>
      <Text style={styles.balanceText}>Burnt: {burntKcal} kcal</Text>
      <Text style={[styles.balanceAmount, isSurplus ? styles.surplusText : styles.deficitText]}>
        {isSurplus ? 'Surplus!' : 'Deficit!'} of {Math.abs(kcalTarget + Math.abs(consumedKcal - burntKcal))} kcal
      </Text>
    </View>
  );
};
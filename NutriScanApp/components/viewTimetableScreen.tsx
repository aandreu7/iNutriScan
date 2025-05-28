// components/viewTimetableScreen.tsx
// @aandreu7

import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '@/constants/styles';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

type Props = {
  onBack: () => void;
  userId: string;
};

type Exercise = {
  name: string;
  duration: number; // in minutes
  sets: number;
  intensity: number; // 1 to 3
  kcal: number;
  completed: boolean;
};

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ViewTimetable({ onBack, userId }: Props) {
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [planStringRaw, setPlanStringRaw] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const planString = docSnap.data().exercise_plan_string as string;
          setPlanStringRaw(planString);

          const parsedExercises = planString
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map((entry) => {
              const [name, rest] = entry.trim().split(' ');
              const [durationStr, setsStr, intensityStr, kcalStr, statusChar] = rest.split('/');

              return {
                name: name,
                duration: parseInt(durationStr),
                sets: parseInt(setsStr),
                intensity: parseInt(intensityStr),
                kcal: parseInt(kcalStr),
                completed: statusChar.toLowerCase() === 'c',
              } as Exercise;
            });

          setExercises(parsedExercises);
        } else {
          console.warn('No exercise plan found for user');
        }
      } catch (error) {
        console.error('Error fetching exercise plan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [userId]);

  const markAsCompleted = async (index: number) => {
    setUpdating(true);
    try {
      const lines = planStringRaw.split('\n');
      const updatedLines = lines.map((line, i) => {
        if (i !== index) return line;

        const [name, rest] = line.trim().split(' ');
        const parts = rest.split('/');
        if (parts.length === 5) {
          parts[4] = 'c';
        }
        return `${name} ${parts.join('/')}`;
      });

      const updatedPlanString = updatedLines.join('\n');

      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        exercise_plan_string: updatedPlanString,
      });

      const updatedExercises = [...exercises];
      updatedExercises[index].completed = true;
      setExercises(updatedExercises);
      setPlanStringRaw(updatedPlanString);

    } catch (error) {
      console.error('Error updating exercise status:', error);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Your Weekly Timetable</Text>

          {exercises.map((exercise, index) => {
            const day = weekdays[index]; // one activity per day

            return (
              <View key={index} style={[styles.card, exercise.completed && styles.completedCard]}>
                <Text style={styles.day}>{day}</Text>
                <Text style={[styles.name, exercise.completed && styles.completedText]}>
                  {exercise.name}
                </Text>
                <Text style={[styles.detail, exercise.completed && styles.completedText]}>
                  Duration: {exercise.duration} min | Sets: {exercise.sets} | Intensity: {exercise.intensity} | Approx. Kcal: {exercise.kcal}
                </Text>

                {!exercise.completed && (
                    <TouchableOpacity
                      style={[styles.doneButton, updating && { backgroundColor: '#ccc' }]}
                      onPress={() => markAsCompleted(index)}
                      disabled={updating}
                    >
                      <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                )}
                {exercise.completed && <Text style={styles.doneText}>✔ Completed</Text>}
              </View>
              );
          })}

          <View style={styles.backButton}>
            <Button title="Back" onPress={onBack} />
          </View>
        </ScrollView>
    </View>
  );
}
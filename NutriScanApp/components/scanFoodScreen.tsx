// components/scanFoodScreen.tsx
// @aandreu7

import { styles } from '@/constants/styles';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

type Props = {
  onBack: () => void;
  userId: string;
};

export default function ScanFood({ onBack, userId }: Props) {
    const [permission, requestPermission] = useCameraPermissions();
    const [serverMessage, setServerMessage] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const cameraRef = useRef<any>(null);

    useEffect(() => {
        if (!permission?.granted) {
          requestPermission();
        }
    }, []);

    const takePicture = async () => {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ base64: true });
        setUploading(true);

        try {
            const base64image = photo.base64;

            const body = JSON.stringify({
                image: base64image,
                user_id: userId,
            });

            const response = await fetch("https://extract-nutrients-604265048430.europe-west1.run.app", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body,
            });

            let jsonData = await response.json();
            console.log("Response:", jsonData);

            if (response.ok && jsonData) {
              const total = jsonData.total_nutrients;
              const breakdown = jsonData.breakdown;

              let message = `📊 Total Nutrients:\n`;
              message += `• Kcal: ${total.kcal}\n`;
              message += `• Protein: ${total.protein_g}g\n`;
              message += `• Fat: ${total.fat_g}g\n`;
              message += `• Carbs: ${total.carbohydrate_g}g\n`;
              message += `• Saturated Fat: ${total.saturated_fat_g}g\n`;
              message += `• Fiber: ${total.fiber_g}g\n`;
              message += `• Cholesterol: ${total.cholesterol_mg}mg\n`;
              message += `• Sugar: ${total.sugar_g}g\n\n`;

              message += `🍎 Breakdown by Food:\n`;
              for (const [food, nutrients] of Object.entries(breakdown)) {
                message += `\n${food}:\n`;
                message += `  - Kcal: ${nutrients.kcal}\n`;
                message += `  - Protein: ${nutrients.protein_g}g\n`;
                message += `  - Fat: ${nutrients.fat_g}g\n`;
                message += `  - Carbs: ${nutrients.carbohydrate_g}g\n`;
                message += `  - Saturated Fat: ${nutrients.saturated_fat_g}g\n`;
                message += `  - Fiber: ${nutrients.fiber_g}g\n`;
                message += `  - Cholesterol: ${nutrients.cholesterol_mg}mg\n`;
                message += `  - Sugar: ${nutrients.sugar_g}g\n`;
              }
              setServerMessage(message);
            } else {
              setServerMessage('Failed to process the image.');
            }

        } catch (error) {
          console.error('Failed to send photo:', error);
          setServerMessage('Error sending the photo.');
        } finally {
          setUploading(false);
        }
      }
    };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          We need your permission to use the camera
        </Text>
        <Pressable style={styles.customButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
        <Pressable style={styles.customButton} onPress={onBack}>
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  if (uploading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.message}>Uploading photo...</Text>
      </View>
    );
  }

  // If we already have a response from server, we show it
  if (serverMessage) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.message}>{serverMessage}</Text>
          <Pressable style={styles.customButton} onPress={onBack}>
            <Text style={styles.buttonText}>Back</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Opens camera if there is no message yet
  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="environment"
      />
      <View style={styles.controls}>
        <Pressable style={styles.customButton} onPress={onBack}>
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
        <Pressable style={styles.customButton} onPress={takePicture}>
          <Text style={styles.buttonText}>Capture</Text>
        </Pressable>
      </View>
    </View>
  );
}
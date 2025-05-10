// components/getRecipeScreen.tsx
// @aandreu7

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { styles } from '@/constants/styles';
import * as FileSystem from 'expo-file-system';

type Props = {
  onBack: () => void;
};

export default function GetRecipe({ onBack }: Props) {
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
            });

            const response = await fetch("https://extract-food-from-image-604265048430.europe-southwest1.run.app", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: base64image }),
            });

            let jsonData = await response.json();
            console.log("Texto devuelto:", jsonData);


          if (response.ok && jsonData) {
            setServerMessage(`Food items detected: ${jsonData["food_items"].join(', ')}`);
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
      <View style={styles.center}>
        <Text style={styles.message}>{serverMessage}</Text>
        <Pressable style={styles.customButton} onPress={onBack}>
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
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

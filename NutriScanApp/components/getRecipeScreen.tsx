// components/getRecipeScreen.tsx
// @aandreu7

import { styles } from '@/constants/styles';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';

type Props = {
  onBack: () => void;
};

export default function GetRecipe({ onBack }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [title, setTitle] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

        const response = await fetch(
          'https://get-recipe-604265048430.europe-southwest1.run.app',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64image }),
          }
        );

        let jsonData = await response.json();
        console.log('Text returned:', jsonData);

        if (response.ok && jsonData && jsonData.recipe) {
          const { title, image, summary } = jsonData.recipe;
          const cleanSummary = summary
            ? summary.replace(/<[^>]*>?/gm, '')
            : '';

          setTitle(title);
          setSummary(cleanSummary);
          setImageUrl(image);
        } else {
          setErrorMessage('❌ Failed to process the image.');
        }
      } catch (error) {
        console.error('Failed to send photo:', error);
        setErrorMessage('Error sending the photo.');
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

  if (errorMessage || title) {
    return (
      <View style={styles.center}>
        {title && (
          <>
            <Text style={styles.titleText}>🍽️ {title}</Text>

            {imageUrl && (
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: 300,
                  height: 200,
                  borderRadius: 10,
                  marginVertical: 10,
                }}
                resizeMode="cover"
              />
            )}

            {summary && (
              <Pressable onPress={() => setShowSummary(!showSummary)}>
                <Text style={styles.toggleText}>
                  {showSummary ? '🔽 Hide description' : '🔼 Show description'}
                </Text>
              </Pressable>
            )}

            {showSummary && (
              <Text style={[styles.message, { marginTop: 10 }]}>
                {summary}
              </Text>
            )}
          </>
        )}

        {errorMessage && (
          <Text style={[styles.message, { color: 'red' }]}>{errorMessage}</Text>
        )}

        <Pressable style={styles.customButton} onPress={onBack}>
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="environment" />
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
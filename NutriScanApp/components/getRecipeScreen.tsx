// components/getRecipeScreen.tsx
// @Erdrick2210
// @damiapro8

import { styles } from '@/constants/styles';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View, ScrollView } from 'react-native';

type Props = {
  onBack: () => void;
};

/*
  GetRecipe Component
  - Requests camera permission and captures a photo.
  - Sends the captured image to a backend for OCR and recipe detection.
  - Displays the returned recipe title, image, and summary.
  - Optionally reads the summary aloud using a TTS (Text-to-Speech) service.
*/
export default function GetRecipe({ onBack }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [title, setTitle] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const cameraRef = useRef<any>(null);
  const audioRef = useRef<any>(null);

  // Asks for camera permission
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  // Take picture and send it to the backend for recipe extraction
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

  // Play the summary using Text-to-Speech
  const playSummaryTTS = async () => {
    if (!summary || ttsLoading) return;
    setTtsLoading(true);
    try {
      // Stops and downloads previous audio if exists
      if (audioRef.current) {
        await audioRef.current.stopAsync();
        await audioRef.current.unloadAsync();
        audioRef.current = null;
      }
      const response = await fetch('https://read-recipe-604265048430.europe-southwest1.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summary }),
      });
      const data = await response.json();
      if (data.audio_base64) {
        const { Audio } = require('expo-av');
        const soundObject = new Audio.Sound();
        await soundObject.loadAsync({ uri: `data:audio/mp3;base64,${data.audio_base64}` });
        audioRef.current = soundObject;
        await soundObject.playAsync();
      }
    } catch (error) {
      console.error('Error playing TTS:', error);
    } finally {
      setTtsLoading(false);
    }
  };

  // If user has not given permission, then do nothing
  if (!permission) return <View />;

  // Prompt user to grant permission
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

  // Show loading state while photo is uploading
  if (uploading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.message}>Uploading photo...</Text>
      </View>
    );
  }

  // Show result or error message if available
  if (errorMessage || title) {
    return (
      <ScrollView contentContainerStyle={styles.center}>
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
              <>
                <Text style={[styles.message, { marginTop: 10 }]}>
                  {summary}
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.customButton,
                    (pressed || ttsLoading) && { opacity: 0.5 }
                  ]}
                  onPress={playSummaryTTS}
                  disabled={ttsLoading}
                >
                  <Text style={styles.buttonText}>
                    {ttsLoading ? 'Loading audio...' : '🔊 Listen to summary'}
                  </Text>
                </Pressable>
              </>
            )}
          </>
        )}

        {errorMessage && (
          <Text style={[styles.message, { color: 'red' }]}>{errorMessage}</Text>
        )}

        <Pressable style={styles.customButton} onPress={onBack}>
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // Default view: show camera and controls
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
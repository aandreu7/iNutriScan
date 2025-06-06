// components/addActivityScreen.tsx
// @aandreu7

import { Alert, View, Text, Pressable, Image, ScrollView } from 'react-native';
import { useState } from 'react'
import { Audio } from 'expo-av';
import { styles } from '@/constants/styles'
import * as FileSystem from 'expo-file-system';

type Props = {
  onBack: () => void;
  userId: string;
};

export default function AddActivity({ onBack, userId }: Props) {
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [recording, setRecording] = useState();
    const [answer, setAnswer] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function startRecording() {
        try {
          if (permissionResponse?.status !== 'granted') {
            console.log('Requesting permission..');
            const newPermission = await requestPermission();
            if (newPermission.status !== 'granted') {
                console.warn('Permission not granted');
                return;
            }
          }

          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });

          console.log('Starting recording..');
          const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
          );

          setRecording(recording);

          console.log('Recording started');
        } catch (err) {
          console.error('Failed to start recording', err);
        }
      }

    async function stopRecording(): Promise<string | null> {
      try {
        console.log('Stopping recording..');
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
              allowsRecordingIOS: false,
        });

        const uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);

        return uri;

      } catch (err) {
          console.error('Failed to stop recording', err);
          return null;
      }
    }

    const handleDiagnosis = async () => {
      try {
        if (!recording) {
          await startRecording();
        } else {
          const uri = await stopRecording();
          const url = "https://add-activity-604265048430.europe-southwest1.run.app";
          if (uri) {
              setIsLoading(true);
              const response = await FileSystem.uploadAsync(url, uri, {
                fieldName: 'file',
                httpMethod: 'POST',
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                mimeType: 'audio/m4a',
                parameters: {
                  userId: userId,
                },
              });

              console.log(response);
              if (response.status>199 && response.status<400) {
                  const data = JSON.parse(response.body);
                  setAnswer(JSON.stringify(data));
              }
              else {
                  Alert.alert("Error", "We could not understand you.");
              }
          } else {
              Alert.alert("Error", "There was an issue with the voice recognition.");
          }
        }
      } catch (error) {
        Alert.alert("Error", "There was an issue with the voice recognition.");
      } finally {
        setIsLoading(false);
      }
    };

    const parsedAnswer = answer ? JSON.parse(answer) : null;

    return (
      <ScrollView contentContainerStyle={styles.containerCenteredPage} style={{ flex: 1 }}>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.customButton} onPress={handleDiagnosis} >
            <Text style={styles.buttonText}>
                {recording ? 'Recording...' : (isLoading ? 'Sending...' : 'Add Activity')}
            </Text>
          </Pressable>

          {parsedAnswer && (
            <View style={styles.resultContainer}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>
                Activity Summary
              </Text>
              <Text style={{ fontSize: 16, marginBottom: 6 }}>
                <Text style={{ fontWeight: 'bold' }}>Description:</Text> {parsedAnswer.activity_description}
              </Text>
              <Text style={{ fontSize: 16, color: 'green' }}>
                <Text style={{ fontWeight: 'bold' }}>Calories burned:</Text> {parsedAnswer.kcal_estimated} kcal
              </Text>
            </View>
          )}

          <Text style={{ fontSize: 14, color: '#555', marginTop: 8, marginBottom: 20, textAlign: 'center' }}>
            Explain to us everything you have done today, and we will tell you how well you did!
          </Text>

          <Pressable style={[styles.customButton, { backgroundColor: '#aaa' }]} onPress={onBack}>
            <Text style={styles.buttonText}>Go back</Text>
          </Pressable>
        </View>

      </ScrollView>
    );
}
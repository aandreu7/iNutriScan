// components/showTodayFitData.tsx
// @Erdrick2210

import { styles } from '@/constants/styles';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Button, Pressable, Text, View } from 'react-native';

type Props = {
  onBack: () => void;
  userId: string;
};

// Ensures the browser session is correctly completed if redirected from Google auth
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = Constants.expoConfig.extra.GOOGLE_CLIENT_ID;
const IOS_CLIENT_ID = Constants.expoConfig.extra.IOS_CLIENT_ID;
const EXPO_CLIENT_ID = Constants.expoConfig.extra.EXPO_CLIENT_ID;
const ANDROID_CLIENT_ID = Constants.expoConfig.extra.ANDROID_CLIENT_ID;

// Cloud Function endpoint that will handle the fitness data retrieval
const CLOUD_FUNCTION_URL = 'https://activity-tracker-604265048430.europe-southwest1.run.app';

// Converts milliseconds to a readable date string
function millisToDate(ms: number): string {
  return new Date(ms).toLocaleDateString();
}

// Extracts the numeric value from a Google Fit dataset
function getValue(dataset: any) {
  if (!dataset.point || dataset.point.length === 0) return 0;

  const value = dataset.point[0]?.value[0];
  if (!value) return 0;

  return value.fpVal || value.intVal || 0;
}

// Hook for Google authentication request
export default function GoogleAccessTokenButton({ onBack, userId }: Props) {
  const [accessRequest, accessResponse, promptAccessTokenAsync] = Google.useAuthRequest({
    clientId: EXPO_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    scopes: [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.location.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'openid',
    'profile',
    'email'
    ],
    responseType: 'token',
  });

  // State to store the fetched daily fitness data
  const [dailyData, setDailyData] = useState<any[]>([]);

  // Function to call the Cloud Function backend with the access token
  const callActivityTracker = async (accessToken: string) => {
    try {
      const res = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken, user_id: userId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Error calling Cloud Function:", errorText);
        return;
      }

      const json = await res.json();
      const buckets = json.bucket || [];

      // Process each bucket to extract and format fitness data
      const processed = buckets.map((bucket: any) => {
        const date = millisToDate(parseInt(bucket.startTimeMillis));
        const steps = getValue(bucket.dataset.find((d: any) => d.dataSourceId.includes('step_count')));
        const distance = getValue(bucket.dataset.find((d: any) => d.dataSourceId.includes('distance')));
        const calories = getValue(bucket.dataset.find((d: any) => d.dataSourceId.includes('calories')));
        const heartRate = getValue(bucket.dataset.find((d: any) => d.dataSourceId.includes('heart_rate')));

        return { date, steps, distance, calories, heartRate };
      });

      setDailyData(processed);
      console.log("✅ Activity data received:", processed);
    } catch (err) {
      console.error("❌ Network/CORS error:", err);
    }
  };

  // Trigger the OAuth2 flow and request an access token
  const handleAccessTokenRequest = async () => {
    console.log("👉 handleAccessTokenRequest has been called");
    try {
      const result = await promptAccessTokenAsync({ useProxy: true, prompt: 'consent' });

      if (result?.type === 'success') {
        const { access_token } = result.params;
        await callActivityTracker(access_token);
      } else {
        console.warn("⚠️ Authentication cancelled or failed");
      }
    } catch (err) {
      console.error("❌ Error requesting access token:", err);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Pressable
          disabled={!accessRequest}
          onPress={handleAccessTokenRequest}
          style={{
            backgroundColor: '#4285F4',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            marginBottom: 20,
            opacity: accessRequest ? 1 : 0.6
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
            Connect to Google Fit
          </Text>
        </Pressable>

        {dailyData.length > 0 && (
            <View style={styles.cardGoogleFit}>
                {dailyData.map((entry, index) => (
                    <View key={index} style={{ marginBottom: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 10 }}>
                        <Text style={{ fontWeight: 'bold' }}>📅 {entry.date}</Text>
                        <Text>🚶 Steps: {entry.steps}</Text>
                        <Text>🧭 Distance: {(entry.distance / 1000).toFixed(2)} km</Text>
                        <Text>🔥 Calories: {entry.calories.toFixed(0)} kcal</Text>
                        <Text>❤️ Heart rate: {entry.heartRate.toFixed(0)} bpm</Text>
                    </View>
                ))}
        </View>
      )}
      <Pressable style={styles.customButton} onPress={onBack}>
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>
    </View>
  );
}
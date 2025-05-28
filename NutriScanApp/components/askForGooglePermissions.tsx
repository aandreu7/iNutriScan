// components/askForGooglePermissions.tsx
// @aandreu7

import React from 'react';
import { Button, View } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = Constants.expoConfig.extra.GOOGLE_CLIENT_ID;
const IOS_CLIENT_ID = Constants.expoConfig.extra.IOS_CLIENT_ID;
const EXPO_CLIENT_ID = Constants.expoConfig.extra.EXPO_CLIENT_ID;
const ANDROID_CLIENT_ID = Constants.expoConfig.extra.ANDROID_CLIENT_ID;

export default function GoogleAccessTokenButton({ onAccessToken }: { onAccessToken: (accessToken: string) => void }) {

  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true, // TURN FALSE FOR BUILDING
    //scheme: 'nutriscanapp', // UNCOMMENT FOR BUILDING
  });

  const [accessRequest, accessResponse, promptAccessTokenAsync] = Google.useAuthRequest({
    clientId: EXPO_CLIENT_ID, // USE ANDROID_CLIENT_ID INSTEAD FOR BUILDING
    iosClientId: IOS_CLIENT_ID,
    //redirectUri, // UNCOMMENT FOR BUILDING
    scopes: ['https://www.googleapis.com/auth/calendar'],
    responseType: 'token',
  });

  const handleAccessTokenRequest = async () => {
    try {
      const result = await promptAccessTokenAsync({ useProxy: false });

      if (result?.type === 'success') {
        const { access_token } = result.params;
        onAccessToken(access_token);
      }
    } catch (err) {
      console.error("Error requesting access token:", err);
    }
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Button
        disabled={!accessRequest}
        title="Grant permissions"
        onPress={handleAccessTokenRequest}
      />
    </View>
  );
}

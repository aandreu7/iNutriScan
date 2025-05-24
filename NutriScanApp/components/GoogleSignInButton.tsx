import React from 'react';
import { Button } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';

const GOOGLE_CLIENT_ID = Constants.expoConfig.extra.GOOGLE_CLIENT_ID;
const IOS_CLIENT_ID = Constants.expoConfig.extra.IOS_CLIENT_ID;
const EXPO_CLIENT_ID = Constants.expoConfig.extra.EXPO_CLIENT_ID;

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton({ onLoginSuccess }: { onLoginSuccess: (user: any, accessToken: string) => void }) {

  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  });

  // This hook asks for ID Token (user's identity)
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: EXPO_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });

  // This hook asks for Access Token (necessary to access user's private data)
  const [accessRequest, accessResponse, promptAccessTokenAsync] = Google.useAuthRequest({
    clientId: EXPO_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/calendar'],
    responseType: 'token',
  });

  const handleGoogleSignIn = async () => {
    try {
      const idTokenResult = await promptAsync({ useProxy: true });

      if (idTokenResult?.type === 'success') {
        const { id_token } = idTokenResult.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const { user } = await signInWithCredential(auth, credential);

        const accessTokenResult = await promptAccessTokenAsync({ useProxy: true });

        if (accessTokenResult?.type === 'success') {
          const { access_token } = accessTokenResult.params;
          onLoginSuccess(user, access_token);
        }
      }
    } catch (err) {
       console.error("Error during Google Sign-In:", err);
    }
  };

  return (
    <Button
      disabled={!request}
      title="Sign in with Google"
      onPress={handleGoogleSignIn}
    />
  );
}

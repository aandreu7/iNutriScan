// components/GoogleSignInButton.tsx
// @aandreu7

import React from 'react';
import { Button } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { User } from 'firebase/auth';

const GOOGLE_CLIENT_ID = Constants.expoConfig.extra.GOOGLE_CLIENT_ID;
const IOS_CLIENT_ID = Constants.expoConfig.extra.IOS_CLIENT_ID;
const EXPO_CLIENT_ID = Constants.expoConfig.extra.EXPO_CLIENT_ID;
const ANDROID_CLIENT_ID = Constants.expoConfig.extra.ANDROID_CLIENT_ID;

WebBrowser.maybeCompleteAuthSession();

type Props = {
  onLoginSuccess: (user: User, isGoogleUser: boolean) => void;
};

export default function GoogleSignInButton({ onLoginSuccess }: Props) {

  const redirectUri = AuthSession.makeRedirectUri({
    //useProxy: false,
    scheme: 'nutriscanapp',
  });

  // This hook asks for ID Token (user's identity)
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  const handleGoogleSignIn = async () => {
    try {
      const idTokenResult = await promptAsync({ useProxy: false });

      if (idTokenResult?.type === 'success') {
        const { id_token } = idTokenResult.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const { user } = await signInWithCredential(auth, credential);
        onLoginSuccess(user, true);
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
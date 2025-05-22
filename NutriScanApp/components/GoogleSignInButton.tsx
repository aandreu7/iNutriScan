import React, { useEffect } from 'react';
import { Button } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

import Constants from 'expo-constants';

const GOOGLE_CLIENT_ID = Constants.expoConfig.extra.GOOGLE_CLIENT_ID;
const IOS_CLIENT_ID = Constants.expoConfig.extra.IOS_CLIENT_ID;
const EXPO_CLIENT_ID = Constants.expoConfig.extra.EXPO_CLIENT_ID;

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    expoClientId: EXPO_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(({ user }) => onLoginSuccess(user))
        .catch(error => console.log('Error loging in with Google:', error));
    }
  }, [response]);

  return (
    <Button
      disabled={!request}
      title="Sign in with Google"
      onPress={() => promptAsync({ useProxy: true })}
    />
  );
}

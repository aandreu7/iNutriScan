import React, { useEffect } from 'react';
import { Button } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '604265048430-rut9fhf7mhhptgb06bciid2qpkauqjj4.apps.googleusercontent.com',
    iosClientId: '604265048430-6ihrkih2sg9tmkuqjav27u17uts31ck2.apps.googleusercontent.com',
    expoClientId: '604265048430-447gsk7oqod5tbodr5lvb5ds9ats99mt.apps.googleusercontent.com',
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

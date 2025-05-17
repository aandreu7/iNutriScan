// utils/authHelpers.tsx
// @aandreu7

import { Alert } from 'react-native';
import { auth } from '@/firebaseConfig';
import { signOut } from 'firebase/auth';

export async function handleLogout(setUser: (user: null) => void, setAuthScreen: (screen: 'login') => void) {
  try {
    await signOut(auth);
    setUser(null);
    setAuthScreen('login');
  } catch (error) {
    Alert.alert('Error while logging out', (error as Error).message);
  }
}

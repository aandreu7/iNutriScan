// app/index.tsx
// @aandreu7

import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Pressable, Text, View, Image } from 'react-native';
import { styles } from '@/constants/styles';
import { auth } from '@/firebaseConfig';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

import { useAuthListener } from '@/hooks/useAuthListener';
import { handleLogout } from '@/utils/authHelpers';

import LoginScreen from '@/components/LoginScreen';
import RegisterScreen from '@/components/RegisterScreen';

import GetRecipe from '@/components/getRecipeScreen';
// import ViewTimetable from '@/components/viewTimetableScreen'
 import ScanFood from '@/components/scanFoodScreen'
import ConfigurePlan from '@/components/configurePlanScreen'

export default function App() {
  const [screen, setScreen] = useState<'home' | 'getRecipe' | 'viewTimetable' | 'scanFood' | "configurePlan">('home');
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const { user, setUser } = useAuthListener();

  function handleLogin(user: User, token?: string) {
    // onLoginSuccess can return just a User or both User and Access Token (in case user is logged in using Google)
    setUser(user);
    if (token) {
      setAccessToken(token);
    }
  }

  if (!user) {
    return authScreen === 'login' ? (
      <LoginScreen onSwitchToRegister={() => setAuthScreen('register')} onLoginSuccess={handleLogin} />
    ) : (
      <RegisterScreen onSwitchToLogin={() => setAuthScreen('login')} onRegisterSuccess={setUser} />
    );
  }

  {/* If user is logged in, show options. Else, user can either sign up or log in.*/}
  let content;

  switch (screen) {
    case 'home':
      content = (

        // Always show logo
        <View style={styles.container}>
          <Image
            source={require('@/assets/images/logo.jpg')}
            style={styles.image}
          />

          {/* Log Out option */}
          <Text style={{ fontSize: 18, marginVertical: 10 }}>
            Hello, {user.displayName || user.email}!
          </Text>
          <Button title="Log out" color="red" onPress={() => handleLogout(setUser, setAuthScreen)} />

          {/* Main options */}
          <View style={styles.buttonContainer}>
            <Button title="🍽️ Scan Food" onPress={() => setScreen('scanFood')} />
            <Button title="📋 Get a Recipe" onPress={() => setScreen('getRecipe')} />
            <Button title="📅 View your Timetable" onPress={() => setScreen('viewTimetable')} />
            <Button title="⚙️ Configure a plan" onPress={() => setScreen('configurePlan')} />
          </View>
        </View>
      );
      break;

    case 'getRecipe':
      content = <GetRecipe onBack={() => setScreen('home')} />;
      break;
    case 'scanFood':
        content = <ScanFood onBack={() => setScreen('home')} />;
        break;
    case 'viewTimetable':
      content = <ViewTimetable onBack={() => setScreen('home')} />;
      break;
    case 'configurePlan':
      content = <ConfigurePlan onBack={() => setScreen('home')} />;
      break;

    default:
      content = (
        <View style={styles.container}>
          <Text>Screen not found</Text>
        </View>
      );
  }
  
  return <View style={{ flex: 1 }}>{content}</View>;
}

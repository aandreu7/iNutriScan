// app/index.tsx
// @aandreu7

import { styles } from '@/constants/styles';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Button, Image, Text, View } from 'react-native';

import { useAuthListener } from '@/hooks/useAuthListener';
import { handleLogout } from '@/utils/authHelpers';

import LoginScreen from '@/components/LoginScreen';
import RegisterScreen from '@/components/RegisterScreen';

import GoogleAccessTokenButton from '@/components/askForGooglePermissions';
import ShowDailyKcalBalance from '@/components/showDailyKcalBalance';

import ConfigurePlan from '@/components/configurePlanScreen';
import GetRecipe from '@/components/getRecipeScreen';
import ScanFood from '@/components/scanFoodScreen';
import ShowTodayFitData from '@/components/showTodayFitData';
import ViewTimetable from '@/components/viewTimetableScreen';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'getRecipe' | 'viewTimetable' | 'scanFood' | 'configurePlan' | 'showFitData'>('home');
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState(false); // Becomes true if user is logged in with its Google account

  const { user, setUser } = useAuthListener();
  useEffect(() => {
    if (googleUser && accessToken) {
      console.log("ACCESS TOKEN: ", accessToken);
    }
  }, [accessToken, googleUser]);


  function handleLogin(user: User, isGoogleUser: boolean) {
    setUser(user);
    setGoogleUser(isGoogleUser);
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
            <Button title="📊 Show Today Fit Data" onPress={() => setScreen('showFitData')} />
          </View>

          {/*
              Only ask Google Permissions if user is logged in with a Google account.
              This button allows user to grant permissions so as to use user's Google private data.
          */}
          {googleUser && !accessToken && (
            <GoogleAccessTokenButton onAccessToken={setAccessToken} />
          )}

          <ShowDailyKcalBalance />

        </View>
      );
      break;
    case 'getRecipe':
      content = <GetRecipe onBack={() => setScreen('home')} />;
      break;
    case 'scanFood':
      content = <ScanFood onBack={() => setScreen('home')} userId={user.uid} />
        break;
    case 'viewTimetable':
      content = <ViewTimetable onBack={() => setScreen('home')} userId={user.uid} />;
      break;
    case 'configurePlan':
      content = <ConfigurePlan onBack={() => setScreen('home')} />;
      break;
    case 'showFitData':
      content = <ShowTodayFitData onBack={() => setScreen('home')} accessToken={accessToken} userId={user.uid} />;
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
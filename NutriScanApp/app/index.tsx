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

<<<<<<< Updated upstream
=======
import ShowDailyKcalBalance from '@/components/showDailyKcalBalance';
import GoogleAccessTokenButton from '@/components/askForGooglePermissions';

>>>>>>> Stashed changes
import GetRecipe from '@/components/getRecipeScreen';
// import ViewTimetable from '@/components/viewTimetableScreen'
 import ScanFood from '@/components/scanFoodScreen'
import ConfigurePlan from '@/components/configurePlanScreen'

export default function App() {
  const [screen, setScreen] = useState<'home' | 'getRecipe' | 'viewTimetable' | 'scanFood' | "configurePlan">('home');
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
          </View>
<<<<<<< Updated upstream
=======

          {/*
              Only ask Google Permissions if user is logged in with a Google account.
              This button allows user to grant permissions so as to use user's Google private data.
          */}
          {googleUser && !accessToken && (
            <GoogleAccessTokenButton onAccessToken={setAccessToken} />
          )}

          <ShowDailyKcalBalance />

>>>>>>> Stashed changes
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

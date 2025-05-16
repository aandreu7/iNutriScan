// app/index.tsx
// @aandreu7

import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Pressable, Text, View, Image } from 'react-native';
import { styles } from '@/constants/styles';
import { auth } from '@/firebase/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from 'firebase/auth';


import GetRecipe from '@/components/getRecipeScreen'
// import ViewTimetable from '@/components/viewTimetableScreen'
// import ScanFood from '@/components/scanFoodScreen'
// import ConfigurePlan from '@/components/configurePlanScreen'

export default function App() {
  const [screen, setScreen] = useState<'home' | 'getRecipe' | 'viewTimetable' | 'scanFood' | "configurePlan">('home');
  const [user, setUser] = useState<User | null>(null);
  const hasScannedRef = useRef(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Check your emails!");
    } catch (e: any) {
        Alert.alert("Registration failed: " + e.message);
    } finally {
        setLoading(false);
    }
  };

  const signIn = async () => {
    setLoading(true);
    try {
      const userCredential=await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (e: any) {
        Alert.alert("Sign in failed: " + e.message);
    } finally {
        setLoading(false);
    }
  };

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

          {/* If user is logged in, show options. Else, user can either sign up or log in.*/}
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

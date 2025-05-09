// app/(tabs)/index.tsx
// @aandreu7

import { useRef, useState } from 'react';
import { Alert, Button, Pressable, Text, View, Image } from 'react-native';
import { styles } from '@/constants/styles';

// import getRecipe from '@/components/getRecipeScreen'
// import viewTimetable from '@/components/viewTimetableScreen'
// import scanFood from '@/components/scanFoodScreen'
// import configurePlan from '@/components/configurePlanScreen'

export default function App() {
  const [screen, setScreen] = useState<'home' | 'getRecipe' | 'viewTimetable' | 'scanFood' | "configurePlan">('home');
  const hasScannedRef = useRef(false);

  let content;

  switch (screen) {
    case 'home':
      content = (
        <View style={styles.container}>
          <Image
            source={require('@/assets/images/logo.jpg')}
            style={styles.image}
          />
          <View style={styles.buttonContainer}>
            <Button title="🍽️ Scan Food" onPress={() => setScreen('scanFood')} />
            <Button title="📋 Get a Recipe" onPress={() => setScreen('getRecipe')} />
            <Button title="📅 View your Timetable" onPress={() => setScreen('viewTimetable')} />
            <Button title="⚙️ Configure a plan" onPress={() => setScreen('configurePlan')} />
          </View>
        </View>
      );
      break;

    case 'scanFood':
        content = <scanFood onBack={() => setScreen('home')} />;
        break;
  
    case 'getRecipe':
      content = <getRecipe onBack={() => setScreen('home')} />;
      break;

    case 'viewTimetable':
      content = <viewTimetable onBack={() => setScreen('home')} />;
      break;
    case 'configurePlan':
      content = <configurePlan onBack={() => setScreen('home')} />;
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

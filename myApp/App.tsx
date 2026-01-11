import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./components/HomeScreen/HomeScreen";
import CreateCakeScreen from './components/CreateCakeScreen/CreateCakeScreen';
import RecipeScreen from './components/RecipeScreen/RecepieScreen';
import AddRecipeScreen from './components/AddRecipeScreen/AddRecipeScreen';
import { supabase } from './lib/supabase';



export type RootStackParamList = {
  Home: undefined;
  AddRecipe: undefined;
  CreateCake: undefined;
  Recipe: {
    cake: string;   // selected cake type
    layer1: string;   // selected flavour for layer 1
    layer2: string;   // could be 'None'
    layer3: string;   // could be 'None'
  };
 
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {

  useEffect(() => {
  supabase.from('recipe').select('*').then(console.log);
}, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CreateCake" component={CreateCakeScreen}/>
          <Stack.Screen name="Recipe" component={RecipeScreen}/>
          <Stack.Screen name="AddRecipe" component={AddRecipeScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
//test commit

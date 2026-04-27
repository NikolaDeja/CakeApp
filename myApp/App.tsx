import 'react-native-gesture-handler';
import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from "./components/HomeScreen/HomeScreen";
import CreateCakeScreen from './components/CreateCakeScreen/CreateCakeScreen';
import RecipeScreen from './components/RecipeScreen/RecepieScreen';
import AddRecipeScreen from './components/AddRecipeScreen/AddRecipeScreen';
import { supabase } from './lib/supabase';
import { G } from 'react-native-svg';



export type RootStackParamList = {
  Home: undefined;
  AddRecipe: undefined;
  CreateCake: undefined;
  Recipe: {
    caketype: string;
    caketype2?: string;
    layers: string[];
    outerLayer?: string;
    layerCount: number;
    selectedPortionSize: 'portions' | 'size';
    portionSize: string;
    selectedShape: 'circle' | 'square' | 'rectangle' | 'heart';
    selectedAllergens: string[];
    selectedDecorations: string[];
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}


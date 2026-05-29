import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { Session } from '@supabase/supabase-js';

import HomeScreen from "./components/HomeScreen/HomeScreen";
import CreateCakeScreen from './components/CreateCakeScreen/CreateCakeScreen';
import RecipeScreen from './components/RecipeScreen/RecepieScreen';
import AddRecipeScreen from './components/AddRecipeScreen/AddRecipeScreen';
import LoginScreen from './components/LoginScreen/LoginScreen';
import { supabase } from './lib/supabase';



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

export type AuthStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <NavigationContainer>
        {authLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF7F3' }}>
            <ActivityIndicator size="large" color="#FF9ECD" />
          </View>
        ) : session ? (
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreateCake" component={CreateCakeScreen}/>
            <Stack.Screen name="Recipe" component={RecipeScreen}/>
            <Stack.Screen name="AddRecipe" component={AddRecipeScreen}/>
          </Stack.Navigator>
        ) : (
          <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

import React from 'react';
import { View, Text, Pressable} from 'react-native';
import { styles } from './HomeScreen.styles';
import Header from '../Header.tsx/Header';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }: any) {
  return (
        <LinearGradient
        //colors={[ '#FFE8DE', '#FFF7F3', '#F2D7E3']}
        colors={[ '#FFF4ED', '#FEF5EF', '#FEF6F1', '#FDF7F3', '#FCF7F4', '#FBF8F6', '#FBF9F8', '#FAFAFA', '#FBF7F9', '#FCF4F7', '#FCF1F6', '#FDEDF4', '#FEEAF3', '#FEE7F1', '#FFE4F0' ]}
        start={{ x: 0, y: 0 }}   // top-left
        end={{ x: 1, y: 1 }}     // bottom-right
        style={{ flex: 1 ,backgroundColor: '#FFF',
        shadowOpacity: 0.05}}
        >
        <View>
            <Header />
            <Text style={styles.welcomeSign}>Bake Your Dream</Text>
            <Text style={styles.welcomeSign2}>Cake Today</Text>
            <Pressable style={styles.createbutton} onPress={() => navigation.navigate("CreateCake")}>
                <Text style={styles.createbuttonText}>Create Your Cake</Text>
            </Pressable>
            <Pressable style={styles.addbutton} onPress={() => navigation.navigate("AddRecipe")}>
                <Text style={styles.addbuttonText}>Add Your Recepie</Text>
            </Pressable>
        </View>
        </LinearGradient>
    );
}


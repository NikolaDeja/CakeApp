import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './Header.styles';
import { SafeAreaView } from "react-native-safe-area-context";


export default function Header() {
    const navigation: any = useNavigation();
    return (
       <SafeAreaView style={{backgroundColor: 'transparent'}}>
        <View style={styles.header}>
            <Pressable onPress={() => navigation.navigate("Home")}>
                <View style={styles.badge}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M19.9951 20.9949V12.9968C19.9951 12.4665 19.7844 11.9579 19.4094 11.583C19.0345 11.208 18.5259 10.9973 17.9956 10.9973H5.99852C5.46822 10.9973 4.95964 11.208 4.58466 11.583C4.20968 11.9579 3.99902 12.4665 3.99902 12.9968V20.9949" stroke="white" stroke-width="1.99951" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3.99902 15.9961C3.99902 15.9961 4.49889 14.9963 5.99852 14.9963C7.49815 14.9963 8.49791 16.9958 9.99754 16.9958C11.4972 16.9958 12.4969 14.9963 13.9966 14.9963C15.4962 14.9963 16.4959 16.9958 17.9956 16.9958C19.4952 16.9958 19.9951 15.9961 19.9951 15.9961" stroke="white" stroke-width="1.99951" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M1.99951 20.9949H21.9946" stroke="white" stroke-width="1.99951" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M6.99828 7.99805V10.998" stroke="white" stroke-width="1.99951" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M11.997 7.99805V10.998" stroke="white" stroke-width="1.99951" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16.9958 7.99805V10.998" stroke="white" stroke-width="1.99951" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M6.99828 3.99902H7.00828" stroke="white" stroke-width="1.99951" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M11.997 3.99902H12.007" stroke="white" stroke-width="1.99951" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16.9958 3.99902H17.0058" stroke="white" stroke-width="1.99951" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    </View>
            </Pressable>
            <Text style={styles.headerText} onPress={() => navigation.navigate("Home")}>Cake App</Text>
            <View style={{width: 24}} />
        </View>
       </SafeAreaView>
    );
};


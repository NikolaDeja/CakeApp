import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './Footer.styles';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Footer() {
    const navigation: any = useNavigation();
    const route: any = useRoute();
    const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);

    const getColor = (targetRoute: string) => {
        const active = route.name === targetRoute;
        const hover = hoveredRoute === targetRoute;
        return active || hover ? '#FF9ECD' : '#999999';
    };

    return (
        <SafeAreaView style={{ backgroundColor: 'transparent' }}>
            <View style={styles.footer}>
                <View style={styles.buttonsContainer}>
                    <Pressable onPress={() => navigation.navigate('Home')} style={styles.buttons}>
                        <svg style={{ ...styles.icon, color: getColor('Home') }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M14.9963 20.9949V12.9968C14.9963 12.7317 14.891 12.4774 14.7035 12.2899C14.516 12.1024 14.2617 11.9971 13.9966 11.9971H9.99756C9.73241 11.9971 9.47811 12.1024 9.29062 12.2899C9.10313 12.4774 8.9978 12.7317 8.9978 12.9968V20.9949" stroke={getColor('Home')} strokeWidth="1.99951" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2.99927 9.99751C2.9992 9.70665 3.06259 9.41928 3.18501 9.15544C3.30743 8.89159 3.48595 8.65764 3.70809 8.46989L10.7064 2.47236C11.0673 2.16735 11.5245 2 11.9971 2C12.4696 2 12.9268 2.16735 13.2877 2.47236L20.286 8.46989C20.5082 8.65764 20.6867 8.89159 20.8091 9.15544C20.9315 9.41928 20.9949 9.70665 20.9948 9.99751V18.9953C20.9948 19.5256 20.7842 20.0342 20.4092 20.4092C20.0342 20.7841 19.5256 20.9948 18.9953 20.9948H4.99878C4.46847 20.9948 3.95989 20.7841 3.58491 20.4092C3.20993 20.0342 2.99927 19.5256 2.99927 18.9953V9.99751Z" stroke={getColor('Home')} strokeWidth="1.99951" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <Text style={[styles.text, { color: getColor('Home') }]}>Home</Text>
                    </Pressable>

                    <Pressable onPress={() => navigation.navigate('CreateCake')} style={styles.buttons}>
                        <svg style={{ ...styles.icon, color: getColor('CreateCake') }} xmlns="http://www.w3.org/2000/svg" width="24" height="24"viewBox="0 0 24 24" fill="none">
                            <path d="M19.9951 20.9949V12.9968C19.9951 12.4665 19.7844 11.9579 19.4094 11.583C19.0345 11.208 18.5259 10.9973 17.9956 10.9973H5.99853C5.46823 10.9973 4.95965 11.208 4.58467 11.583C4.20969 11.9579 3.99902 12.4665 3.99902 12.9968V20.9949" stroke={getColor('CreateCake')} strokeWidth="1.99951" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3.99902 15.9961C3.99902 15.9961 4.4989 14.9963 5.99853 14.9963C7.49816 14.9963 8.49792 16.9958 9.99755 16.9958C11.4972 16.9958 12.4969 14.9963 13.9966 14.9963C15.4962 14.9963 16.4959 16.9958 17.9956 16.9958C19.4952 16.9958 19.9951 15.9961 19.9951 15.9961" stroke={getColor('CreateCake')}strokeWidth="1.99951" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M1.99951 20.9949H21.9946" stroke={getColor('CreateCake')} strokeWidth="1.99951" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.99829 7.99805V10.998" stroke={getColor('CreateCake')} strokeWidth="1.99951" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M11.9971 7.99805V10.998" stroke={getColor('CreateCake')} strokeWidth="1.99951" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16.9958 7.99805V10.998" stroke={getColor('CreateCake')} strokeWidth="1.99951" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.99829 3.99902H7.00829" stroke={getColor('CreateCake')} strokeWidth="1.99951" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M11.9971 3.99902H12.0071" stroke={getColor('CreateCake')} strokeWidth="1.99951" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16.9958 3.99902H17.0058" stroke={getColor('CreateCake')} strokeWidth="1.99951" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <Text style={[styles.text, { color: getColor('CreateCake') }]}>Create Cake</Text>
                    </Pressable>

                    <Pressable onPress={() => navigation.navigate('AddRecipe')} style={styles.buttons}>
                        <svg style={{ ...styles.icon, color: getColor('AddRecipe') }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">   
                            <path d="M4.99878 11.9971H18.9953" stroke={getColor('AddRecipe')} strokeWidth="1.99951" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M11.9971 4.99878V18.9953" stroke={getColor('AddRecipe')} strokeWidth="1.99951" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <Text style={[styles.text, { color: getColor('AddRecipe') }]}>Add Recipe</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
};

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './Header.styles';
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

export default function Header() {
    const navigation: any = useNavigation();
    return (
       <SafeAreaView style={{backgroundColor: 'transparent'}}>
        <View style={styles.header}>
            <Pressable onPress={() => navigation.navigate("Home")}>
                <View style={styles.badge}>
                    <Svg
                        width={styles.icon.width}
                        height={styles.icon.height}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        {/* candles */}
                        <Path d="M8 6v3" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
                        <Path d="M12 5v4" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
                        <Path d="M16 6v3" stroke="#fff" strokeWidth={2} strokeLinecap="round" />

                        {/* cake */}
                        <Path d="M6 10h12" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
                        <Path d="M7 10v9h10v-9" stroke="#fff" strokeWidth={2} />

                        {/* plate */}
                        <Path d="M5 19h14" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
                    </Svg>
                    </View>
            </Pressable>
            <Text style={styles.headerText} onPress={() => navigation.navigate("Home")}>Cake App</Text>
            <View style={{width: 24}} />
        </View>
       </SafeAreaView>
    );
};
//test commit

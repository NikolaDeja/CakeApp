import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    header: {
        height: 80,
        backgroundColor: '#fffaf7ff',
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',

    },

    headerText: {
        fontSize: 20,
        marginLeft: 30,
        fontWeight: 'bold',
        color: 'pink',
    },

    badge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'pink',
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 20,
    },

    icon: {
    width: 36,
    height: 36,
    },
});
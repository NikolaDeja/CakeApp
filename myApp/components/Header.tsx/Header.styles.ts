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
        color: '#FF9ECD',
        fontFamily: "Segoe UI",
        fontSize: 32,
        fontStyle: 'normal',
        fontWeight: 'bold',
        lineHeight: 40,
        marginLeft: 20,
    },

    badge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFACD4',
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 20,
    },

    icon: {
    width: 36,
    height: 36,
    },
});


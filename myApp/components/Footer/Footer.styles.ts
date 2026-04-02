import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    footer: {
        display: 'flex',
        paddingVertical: 20,
        paddingHorizontal: 20,
        flexDirection: 'column',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        backgroundColor: '#FFF',
        boxShadow: '0 -2px 10px 0 rgba(0, 0, 0, 0.05)',
    },

    buttonsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 40,
        
    },

    buttons: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },  

    icon: {
        color: '#999999',
        width: 24,
        height: 24,
    },
    
    text: {
        color: '#999999',
        fontFamily: "Segoe UI",
        textAlign: 'center',
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 16,
        display: 'flex',
        alignItems: 'flex-start',
        marginTop: 4,
    },

});
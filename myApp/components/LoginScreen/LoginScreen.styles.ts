import { StyleSheet } from 'react-native';

const shadowStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
};

export const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    brand: {
        fontSize: 40,
        fontWeight: '700',
        color: '#FF9ECD',
        textAlign: 'center',
        fontFamily: 'Segoe UI',
    },
    subtitle: {
        fontSize: 16,
        color: '#6d6c6c',
        textAlign: 'center',
        fontFamily: 'Segoe UI',
        marginTop: 6,
        marginBottom: 30,
    },
    card: {
        borderRadius: 20,
        backgroundColor: '#FFF',
        marginHorizontal: 24,
        padding: 24,
        boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
    },
    label: {
        color: '#6d6c6c',
        fontFamily: 'Segoe UI',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        marginTop: 14,
    },
    input: {
        marginTop: 8,
        width: '100%',
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#FF9ECD',
        borderRadius: 15,
        padding: 12,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Segoe UI',
        backgroundColor: '#FFF',
    },
    errorText: {
        color: '#c0392b',
        fontFamily: 'Segoe UI',
        fontSize: 14,
        marginTop: 14,
        textAlign: 'center',
    },
    primaryButton: {
        marginTop: 24,
        backgroundColor: '#FF9ECD',
        borderRadius: 20,
        alignItems: 'center',
        width: '100%',
        alignSelf: 'center',
        padding: 12,
        ...shadowStyle,
    },
    primaryButtonPressed: {
        backgroundColor: '#E27DAE',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        paddingVertical: 6,
        textAlign: 'center',
        fontFamily: 'Segoe UI',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    switchModeButton: {
        marginTop: 20,
        alignSelf: 'center',
    },
    switchModeText: {
        color: '#6d6c6c',
        fontSize: 14,
        fontFamily: 'Segoe UI',
        textAlign: 'center',
    },
    switchModeLink: {
        color: '#FF9ECD',
        fontWeight: '700',
    },
});

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    topText:{
        fontSize: 24,
        fontWeight: 'bold',
        fontStyle: 'normal',
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: 'Segoe UI',
        color: '#333',
        lineHeight: 32,

    },
    stepBox:{
        borderRadius: 20,
        backgroundColor: '#FFF',
        margin: 24,
        padding: 20,
        boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
    },
    stepsText: {
        color: '#999',
        textAlign: 'center',
        fontFamily: 'Segoe UI',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: 20, 
    },

    buttonsContainer:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        alignItems: 'flex-start',
        gap: 10,
    },

    optionsButtons:{
    backgroundColor: '#FFC4E1',
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    width: '48%',
    },

    optionsButtonsHover: {
    backgroundColor: '#FF9ECD',
    //backgroundColor: '#E27D97',
    },

    optionsButtonsText:{
    color: '#FFF',
    textAlign: 'center',
    fontFamily: "Segoe UI",
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 24, 
    },

    secondCakeButton:{
        backgroundColor: '#FFC4E1',
        padding: 10,
        borderRadius: 15,
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 12,
        width: '100%',
    },

    filedBox: {
        marginTop: 20,
        width: '100%',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#FF9ECD',
        borderRadius: 15,
        padding: 10,
        display: 'flex',
        justifyContent: 'center',
    },
    fildText: {
        fontSize: 18,
        color: '#717182',
        fontFamily: 'Segoe UI',
        fontStyle: 'normal',
        fontWeight: 400,
    },

    allergenRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },

    allergenOption: {
        backgroundColor: '#FFF',
        borderColor: '#FF9ECD',
        borderWidth: 1,
        borderRadius: 15,
        padding: 10,
        alignSelf: 'center',
        marginTop: 10, 
        display: 'flex',
        width: '48%',
        gap: 10,
    },

    allergenContent: {
        flexDirection: 'row',
        alignItems: 'center',
        display: 'flex',
        gap: 10,
    },
    allergenOptionText: {
        color: '#333',
        fontSize: 14,
        fontFamily: 'Segoe UI',
        textAlign: 'left',
        fontWeight: '500',
        flexShrink: 1,
    },
    tickBox: {
        width: 20,
        height: 20,
        borderColor: '#FF9ECD',
        borderWidth: 1,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    tickMark: {
        fontSize: 14,
        color: '#FF9ECD',
        lineHeight: 16,
        fontWeight: 'bold',
    },

    getRecipeButton: {
        backgroundColor: '#FF9ECD',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        width: '60%',
        alignSelf: 'center',
        marginBottom: 20,
    },
    getRecipeButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
        alignContent: 'center',
        fontFamily: 'Segoe UI',
        textAlign: 'center',
        fontStyle: 'normal',
        lineHeight: 24,
    },
});

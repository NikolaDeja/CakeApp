import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    topText: {
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
        color: '#6d6c6c',
        fontFamily: 'Segoe UI',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: 20, 
        marginLeft: 10,
    },
    fildBox: {
        marginTop: 20,
        width: '100%',
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#FF9ECD',
        borderRadius: 15,
        padding: 10,
        display: 'flex',
        justifyContent: 'center',
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


    ingedientText:{
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 10,
        marginLeft: 10,
    },

    ingredientHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: 10,
    },

    removeButton: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#FF9ECD',
    backgroundColor: '#FF9ECD',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,     
    marginRight: 10, 
    paddingHorizontal: 6,  
    paddingVertical: 3,
    },

    removeButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    lineHeight: 13,
    },

    AddButton: {
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: '#FFC4E1',
        padding: 5,
        borderRadius: 15,
        width: '80%',
        alignSelf: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 13.996,
    },
    
    AddButtonText: {
        color: '#FFF',
        textAlign: 'center',
        fontFamily: "Segoe UI",
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 24, 
    },
    addIcon: {
        fontSize: 20,
        fontWeight: 700,
        color: 'white',
    },


    saveButton: {
        marginTop: 30,
        backgroundColor: '#FF9ECD',
        padding: 10,
        borderRadius: 25,
        alignItems: 'center',
        width: '80%',
        alignSelf: 'center',
        marginBottom: 30,
    },
    saveButtonPressed: {
        backgroundColor: '#750c23ff',
    },
    saveButtonText: {
       color: '#FFF',
        textAlign: 'center',
        fontFamily: "Segoe UI",
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 24, 
    }
});



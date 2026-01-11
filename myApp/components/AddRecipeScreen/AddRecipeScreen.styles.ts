import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    AddRecipeText: {
        fontSize: 25,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
        color: 'pink',
    },
    filedName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginLeft: 10,
    },
    fildBox: {
        borderWidth: 2,
        borderColor: 'pink',
        borderRadius: 5,
        padding: 10,
        margin: 10,
        fontSize: 12,
        color: 'gray',
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
  width: 18,
  height: 18,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#D9A0AE',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 6,     
  marginRight: 10,   
},

removeButtonText: {
  fontSize: 8,
  fontWeight: '700',
  color: '#D9A0AE',
  lineHeight: 13,
},
    AddButton: {
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: 'pink',
        padding: 5,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
        alignSelf: 'center',
    },
    AddButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        alignContent: 'center',
    },

    saveButton: {
        marginTop: 30,
        backgroundColor: '#E27D97',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
        alignSelf: 'center',
        marginBottom: 30,
    },
    saveButtonPressed: {
        backgroundColor: '#750c23ff',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        alignContent: 'center',
    }
});

//test commit

import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
    categoryText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
    noRecepieFoundText: {
        fontSize: 16,
        color: 'gray',
        marginTop: 20,  
        textAlign: 'center',
    },
    recepieNameText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
    },
    portionsAndTimeText: {
        fontSize: 14,
        color: 'gray',
        marginTop: 5,
        textAlign: 'center',
    },

    ingredientBox: {
        fontSize: 16,
        marginTop: 5,
        borderColor: 'pink',
        borderWidth: 2,
        padding: 5,
        borderRadius: 5,
        width: '80%',
        alignSelf: 'center',

    },
    ingredientHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    ingredientText: {
        fontSize: 12,
        marginLeft: 25,
        marginTop: 2,
    },
    instructiontHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'pink',
        marginTop: 10,
        marginBottom: 5,
        marginLeft: 20,
    },
    instructionText: {
        fontSize: 13,
        marginLeft: 20,
        marginTop: 5,
        marginBottom: 20,
    },

});
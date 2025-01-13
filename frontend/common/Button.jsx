import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Button = ({ title, fn, width, style }) => {
    return (
        <TouchableOpacity onPress={fn} style={[styles.button, style, { width }]}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
        marginVertical: 10,
        padding: 10,
        borderRadius: 30,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
});

export default Button;

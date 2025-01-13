import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

const Input = ({
    title,
    inTitle,
    type,
    hidden,
    value,
    error,
    setValue,
    setError,
    onChange
}) => {
    const handleTextChange = (text) => {
        if (onChange) {
            onChange(text);
        } else {
            setValue(text);
        }
        setError('');
    };

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.inputTitle}>{title}</Text>

            <TextInput
                style={[styles.input, error && styles.errorInput]}
                placeholder={inTitle}
                secureTextEntry={hidden}
                keyboardType={type === 'numeric' ? 'numeric' : 'default'}
                value={value}
                onChangeText={handleTextChange}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 20,
    },
    inputTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 30,
        paddingLeft: 8,
        fontSize: 16,
        textAlignVertical: 'center'
    },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
    },
});

export default Input;

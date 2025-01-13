import React from 'react';
import { Text, View } from 'react-native';

const Title = ({ text, color = 'black', fontSize = 24, textAlign = 'center' }) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          color: color,
          fontSize: fontSize,
          fontWeight: 'bold',
          textAlign: textAlign,
        }}
      >
        {text}
      </Text>
    </View>
  );
};

export default Title;

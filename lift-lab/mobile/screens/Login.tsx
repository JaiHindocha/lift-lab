import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';

type LoginScreenProps = {
    handleLogin: () => void;
};

const LoginScreen = ( props: LoginScreenProps ) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
        const response = await fetch('https://lift-lab.herokuapp.com/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username : username,
            password : password,
        }),
        });
        const token = await response.json()
        console.log(token.token);
        await AsyncStorage.setItem('token', token.token);
        props.handleLogin();
        setUsername('');
        setPassword('');
    } catch(e) {
        console.error(e);
        Alert.alert('Login Error', 'An error occurred during login.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/walkthrough/dumbell.png')} style={{width: 140, height: 116, marginBottom: 30}} />
      <Text style={styles.title}>Welcome Back.</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Text style={{textAlign: 'right', alignContent: 'flex-end'}}>Forgot your password?</Text>
      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>LOGIN →</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 15}}>
        <Text>Don't have an account? </Text>
        {/* <Text style={{paddingTop: 15}}>© 2021 Lift Lab</Text> */}
        <Text style={{fontWeight:'600', color:'#599e6b'}}>Sign up</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    marginBottom: 48,
  },
  input: {
    width: '90%',
    height: 50,
    borderWidth: 1,
    borderColor: '#bebebe',
    borderRadius: 5,
    marginBottom: 16,
    padding: 8,
  },
  button: {
    marginTop: 50,
    width: '90%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#599e6b',
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: 0.25,
    color: 'white',
  },
});

export default LoginScreen;

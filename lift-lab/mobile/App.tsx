import React, { useState } from 'react';
import { Button, StyleSheet, Text, View, ScrollView, Image, ImageSourcePropType } from 'react-native';
import BottomTabNavigator from './screens/BottomTabNavigator';
import LoginScreen from './screens/Login';
import { LogBox } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import WalkthroughScreen from './screens/Walkthrough';
import CreatePlan from './screens/CreatePlan';

LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();

const Stack = createStackNavigator();

type AuthStackProps = {
  handleLogin: () => void;
};

const AuthStack = ( props: AuthStackProps ) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={() => <LoginScreen handleLogin={props.handleLogin}/>}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Walkthrough" component={WalkthroughScreen} options={{headerShown: false}} />
      <Stack.Screen name="Home" component={BottomTabNavigator} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};


export default function App() {
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);

  // Function to update the login status
  const handleLogin = () => {
    setUserIsLoggedIn(true);
  };

  // Function to update the logout status
  // const handleLogout = () => {
  //   setUserIsLoggedIn(false);
  // };

  return (
    <NavigationContainer>
      {userIsLoggedIn ? (
        <AppStack />
      ) : (
        <AuthStack handleLogin={handleLogin} />
      )}
    </NavigationContainer>
  );
}


// export default function App() {
//   return (
//     <CreatePlan />
//   )
// }
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WorkoutPlanScreen } from './WorkoutPlan'
import { CategoriesScreen } from './Categories'
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import Icon from 'react-native-vector-icons/FontAwesome';
import CreatePlan from './CreatePlan';

// Function to fetch the token from AsyncStorage

const Tab = createBottomTabNavigator();

interface payload {
  user: {
    id: number,
    username: string,
    first_name: string,
    last_name: string,
  }
}

const BottomTabNavigator = () => {
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState(0);

  const fetchToken = async () => {
    try {
      const result = await AsyncStorage.getItem('token');
      setToken(result || '');
      decodeToken(result || '');
      await AsyncStorage.setItem('userId', userId.toString());
    } catch (error) {
      console.error('Error fetching token from AsyncStorage:', error);
    }
  };

  const decodeToken = (token: string) => {
    try {
      const decodedToken = jwtDecode(token) as payload;
      setUserId(decodedToken.user.id);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };
  

  useEffect(() => {
    fetchToken();
  }, [token, userId]);

  return (
      <Tab.Navigator 
        screenOptions={
          ({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName = '';
              if (route.name === 'My Plan') {
                iconName = focused ? 'tasks' : 'tasks';
              } else if (route.name === 'Discover') {
                iconName = focused ? 'search' : 'search';
              } else if (route.name === 'Create Plan') {
                iconName = focused ? 'plus' : 'plus';
              }
              return <Icon name={iconName} size={size} color={color} />;
            },
            headerShown: false,
          })
        }
        tabBarOptions={{
          activeTintColor: '#599e6b',
          inactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="My Plan" options={{tabBarLabel: "My Plan"}} component={() => <WorkoutPlanScreen userID={userId}/>} />
        <Tab.Screen name="Discover" component={CategoriesScreen} />
        <Tab.Screen name="Create Plan" component={CreatePlan} />
      </Tab.Navigator>
  );
};

export default BottomTabNavigator;
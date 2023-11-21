import React, { ReactNode, useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity, Dimensions, TextInput, Alert } from 'react-native';
import Collapsible from 'react-native-collapsible';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MultipleSelectList } from 'react-native-dropdown-select-list'

const Stack = createStackNavigator();

type ExpandableProps = {
  title: string;
  children?: ReactNode;
}

const Expandable = (props: ExpandableProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsible = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleCollapsible} style={styles.expandableCard}>
        <Text style={styles.expandableButtonText}>{props.title}</Text>
        {isCollapsed ? <Icon name="chevron-up" size={16} color="#599e6b" /> : <Icon name="chevron-down" size={16} color="#599e6b" /> }
      </TouchableOpacity>
      <Collapsible collapsed={isCollapsed}>
        <View style={styles.content}>
          {props.children}
        </View>
      </Collapsible>
    </View>
  );
}

type WeekProps = {
  weekNumber: number;
};

const Week = (props: WeekProps) => {
  const route = useRoute();
  const plan_id = route.params.plan_id;

  return (
    <Expandable title={`Week ${props.weekNumber}`} children={<Text>{plan_id}</Text>}/>
  )
}

const PlanDetailEntry = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = React.useState([]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://lift-lab.herokuapp.com/categories');
        console.log(response);
        const json = await response.json();
        setCategories(json.map((category: { category_id: any; category: any; }) => ({key: category.category_id, value: category.category})));
      } catch(e) {
        console.error(e);
        Alert.alert('Category Fetch Error', 'An error occurred during category fetch.');
      }
    }
    fetchCategories();
  }, []);

  let plan_id = 0;

  const navigation = useNavigation();

  const nextScreen = async () => {
    try {
      const user_id = await AsyncStorage.getItem('userId');
      const response = await fetch('https://lift-lab.herokuapp.com/addPlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          name: name,
          description : description,
        }),
      })
      const json = await response.json();
      console.log(await response);
      plan_id = json[0].plan_id;
      navigation.navigate('Week 1', {plan_id: plan_id});
    } catch(e) {
      console.error(e);
      Alert.alert('Plan Creation Error', 'An error occurred during plan creation.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.planDetailEntryTitle}>Create a Plan</Text>
      <TextInput
        style={styles.planDetailEntryInput}
        placeholder="Plan Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={{...styles.planDetailEntryInput, height: 100}}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />
      
      <MultipleSelectList 
        setSelected={(val) => setSelected(val)} 
        data={categories} 
        save="value"
        label="Categories"
        boxStyles={{borderColor: '#bebebe', borderWidth: 1, borderRadius: 10, width: 0.9 * Dimensions.get('window').width, height: 100}}
      />
      <TouchableOpacity style={styles.planDetailEntryButton} onPress={nextScreen}>
        <Text style={styles.planDetailEntryButtonText}>CREATE PLAN →</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function CreatePlan() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="New Plan" component={PlanDetailEntry} options={{ headerShown: false }}/>
      <Stack.Screen name="Week 1" component={() => <Week weekNumber={1}></Week>} options={{ headerShown: true }}/>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandableButton: {
    width: '90%',
    borderRadius: 10,
  },
  expandableCard: {
    backgroundColor: '#fdfdfd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 10,
    width: 0.95 * Dimensions.get('window').width,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  expandableButtonText: {
    fontSize: 22,
    fontWeight: "400",
    textAlign: 'center',
    marginRight: 10,
  },
  content: {
    padding: 10,
  },
  planDetailEntryTitle: {
    fontSize: 30,
    fontWeight: '600',
    marginBottom: 48,
  },
  planDetailEntryInput: {
    width: '90%',
    height: 50,
    borderWidth: 1,
    borderColor: '#bebebe',
    borderRadius: 5,
    marginBottom: 16,
    padding: 8,
  },
  planDetailEntryButton: {
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
  planDetailEntryButtonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: 0.25,
    color: 'white',
  }
});

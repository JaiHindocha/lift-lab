import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, TextComponent, TextInput, TouchableOpacity } from 'react-native';
import { View, Text, FlatList, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

const Divider = () => {
  return (
    <View style={{paddingTop: 10, paddingBottom: 15}} >
      <View style={styles.divider} />
    </View>
  );
};

const CategoryCard = ({ title }: { title: string }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate(title)}>
        <View style={{flex: 1.2}}><Text style={styles.categoryName}>{title}</Text></View>
      </TouchableOpacity>
    </View>
  );
};

// Same as CategoryCard but with a search icon next to the title.
const SearchCard = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Search")}>
        <View style={styles.innerContainer}>
          <Icon name="search" size={20} style={styles.searchIcon} />
          <Text style={styles.categoryName}>Search</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
  
}

type PlanDescription = {
  plan_id: number,
  name: string,
  description: string,
  fillScreenWidth?: boolean
}

const PlanCard = (plan : PlanDescription) => {

  const truncateDescription = (description: string) => {
    if (description.length > 100) {
      return description.substring(0, 100) + "..."
    } else {
      return description
    }
  }
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  

  const setPlan = async () => {
    const userId = await AsyncStorage.getItem('userId')
    fetch('https://lift-lab.herokuapp.com/setPlan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          plan_id: plan.plan_id
          }),
        })
        .then((response) => response.json())
        .then((json) => {
          console.log(json)
          closeModal()
        }
        )
        .catch((error) => console.error(error))        
  }

  return (
    <TouchableOpacity style={{alignItems: 'center', marginTop: 10}} onPress={openModal}>
      <View style={!plan.fillScreenWidth ? styles.card : styles.wideCard}>
        <Text style={styles.titleText}>{plan.name}</Text>
        <Text style={styles.itemDescription}>{truncateDescription(plan.description)}</Text>
      </View>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{plan.name}</Text>
            <Text style={styles.modalDescription}>{plan.description}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={setPlan}>
              <Text style={styles.closeButtonText}>Use this plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const CategoryScroll = ( ) => {

  const [isLoading, setLoading] = useState(true)
  const [data, setData] = useState<PlanDescription[]>([])

  const getAllPlans = async () => {
    try {
      const response = await fetch("https://lift-lab.herokuapp.com/getAllPlans")
      const json = await response.json()
      setData(json)
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => getAllPlans(), [])

  return (
    <FlatList
      data={data}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      // contentContainerStyle={styles.listContent}
      renderItem={({item}) => (
        <PlanCard plan_id={item.plan_id} name={item.name} description={item.description} fillScreenWidth={false}/>
      )}
    />
  );
};

const DiscoverPlansTitle = () => {
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.title}>Find a new plan</Text>
    </View>
  )
}

const FrontPage = () => {
  return (
    <ScrollView style={{paddingTop: 40}}>
      <DiscoverPlansTitle />
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <SearchCard />
        <CategoryCard title={"Beginner"}/>
        <CategoryCard title={"Intermediate"}/>
        <CategoryCard title={"Advanced"}/>
        <CategoryCard title={"Bodybuilding"}/>
        <CategoryCard title={"Powerlifting"}/>
      </ScrollView>
      <View style={{paddingTop: 10, paddingBottom: 15}} />
      <View style={styles.divider} />
      <View style={{paddingTop: 10, paddingBottom: 15}} />
      <Text style={styles.categoryTitle}>{"Trending Plans"}</Text>
      <CategoryScroll />
      <View style={{paddingTop: 10, paddingBottom: 15}} />
      <Text style={styles.categoryTitle}>{"New Plans"}</Text>
      <CategoryScroll />
      <View style={{paddingTop: 40, paddingBottom: 15}} />
    </ScrollView>
  );
}

type CategoryPageProps = {
  category: string
}

const CategoryPage = (props: CategoryPageProps) => {
  const [data, setData] = useState<PlanDescription[]>([])

  const getPlanByCategory = async () => {
    try {
      const response = await fetch("https://lift-lab.herokuapp.com/getPlanByCategory", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: props.category
        })
      })
      const json = await response.json()
      setData(json)
    } catch(e) {
      console.error(e)
    } 
  }

  useEffect(() => getPlanByCategory(), [])

  return (
    <FlatList
      data={data}
      renderItem={({item}) => (
        <PlanCard plan_id={item.plan_id} name={item.name} description={item.description} fillScreenWidth={true}/>
      )}
    />
  );
}

const SearchPage = () => {
  const [data, setData] = useState<PlanDescription[]>([])
  const [search, setSearch] = useState("")

  const getPlanBySearch = async () => {
    try {
      const response = await fetch("https://lift-lab.herokuapp.com/searchPlans", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          search: search
        })
      })
      const json = await response.json()
      setData(json)
    } catch(e) {
      console.error(e)
    } 
  }

  return (
    <View>
      <TextInput
        placeholder="Search"
        value={search}
        onChangeText={(text) => {setSearch(text); getPlanBySearch()}}
        style={styles.searchBar}
      />
      <FlatList
        data={data}
        renderItem={({item}) => (
          <PlanCard plan_id={item.plan_id} name={item.name} description={item.description} fillScreenWidth={true}/>
        )}
      />
    </View>
    
  );
}

const CategoriesScreen = () => {  
  return (
    <Stack.Navigator>
      <Stack.Screen name="Categories" component={FrontPage} options={{headerShown: false}}/>
      <Stack.Screen name="Beginner" component={() => <CategoryPage category='Beginner' />}/>
      <Stack.Screen name="Intermediate" component={() => <CategoryPage category='Intermediate' />}/>
      <Stack.Screen name="Advanced" component={() => <CategoryPage category='Advanced' />}/>
      <Stack.Screen name="Bodybuilding" component={() => <CategoryPage category='Bodybuilding' />}/>
      <Stack.Screen name="Powerlifting" component={() => <CategoryPage category='Powerlifting' />}/>
      <Stack.Screen name="Search" component={SearchPage}/>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    paddingTop: 50,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 30,
    flex: 1,
    alignContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 45,
    fontWeight: "600",
    alignText: 'center',
  },
  container: {
    backgroundColor: '#599e6b',
    borderRadius: 8,
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: 0.6 * Dimensions.get('window').width,
    alignSelf: 'center',
    marginHorizontal: 10,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    marginRight: 10,
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: 'white',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666666',
  },
  icon: {
    marginRight: 10,
    textAlign: 'center',
  },
  divider: {
    width: '90%',
    height: 1,
    backgroundColor: '#bebebe',
    opacity: 0.5,
    marginVertical: 10,
    alignSelf: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: "400",
    textAlign: 'center',
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: "400",
    textAlign: 'center',
    color: '#bebebe',
    paddingBottom: 15,
  },
  card: {
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
    width: 200,
    height: 175
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    marginRight: 10,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 10, // Adjust the horizontal padding as needed
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#599e6b',
    borderRadius: 5,
  },
  closeButtonText: {
    textAlign: 'center',
    color: 'white',
  },
  wideCard: {
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
    height: 110
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: 'center',
    width: 0.95 * Dimensions.get('window').width,
  },
});

export {CategoriesScreen}

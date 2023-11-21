import { ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { ReactElement, useState } from 'react';
import { ImageSourcePropType, Modal, Pressable, TextInput } from 'react-native';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';

type WalkthroughScreenProps = {
  navigation: StackNavigationProp<ParamListBase>;
};

type PopUpInfoProps = {
  titleString: string;
  description: string;
  extraInformation: string; 
  image: ReactElement;
}

const PopUpInfo = (props: PopUpInfoProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* <Image source={require('../assets/walkthrough/plan.png')} style={styles.image} /> */}
      {/* {props.image} */}
      <Text style={styles.title}>{props.titleString}</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.infoButton}>
        <Text style={styles.infoButtonText}>{props.description}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              {props.extraInformation}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.centeredContent}>
        {props.image}
      </View>
    </View>
    
  );
};

const SampleExcercise = () => {
  return (
    <View style={styles.excerciseContainer}>
      <Text style={styles.excerciseTitle}>Bench Press</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10 }}>
        <View style={{flex:1.4}}>
          <Text style={{paddingBottom:15, color: "gray", fontWeight: "300"}}>
            Lie on back on a flat bench with a barbell grasped in both hands...
          </Text>
        </View>
        <View style={{flex:0.2}}/>
        <View style={{flex:0.4, paddingRight: 16}}>
          <Image source={{uri: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/04/barbell-bench-press.gif'}} style={{width: 80, height: 80, borderRadius: 10}} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10 }}>
        <View style={{ flex: 0.8, height: 20 }}><TextInput style={styles.titles} placeholder="SET" editable={false} selectTextOnFocus={false} /></View>
        <View style={{ flex: 0.8, height: 20 }}><TextInput style={styles.titles} placeholder="REPS" editable={false} selectTextOnFocus={false} /></View>
        <View style={{ flex: 1.2, height: 20 }}><TextInput style={styles.titles} placeholder="WEIGHT" editable={false} selectTextOnFocus={false} /></View>
        <View style={{ flex: 1.2, height: 20 }}><TextInput style={styles.titles} placeholder="REPS" editable={false} selectTextOnFocus={false} /></View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom:10 }}>
        <View style={{ flex: 0.8, height: 21, paddingTop:3 }}><Text style={styles.setsAndReps}>{1}</Text></View>
        <View style={{ flex: 0.8, height: 21, paddingTop:3 }}><Text style={styles.setsAndReps}> {6}</Text></View>
        <View style={{ flex: 1.2, height: 20 }}><TextInput 
          style={styles.setsInput} 
          key={1}
          keyboardType='numeric'
          placeholder={''}
        /></View> 
        <View style={{ flex: 1.2, height: 20 }}><TextInput 
          style={styles.setsInput} 
          key={2}
          keyboardType='numeric'
          placeholder={''}
        /></View> 
        </View>
      <View style={{paddingTop: 15}}>
        <Pressable style={styles.excerciseButton} onPress={() => {}}>
          <Text style={styles.text}>+ Add Set</Text>
        </Pressable>
      </View>
    </View>

  )
}

const WalkthroughScreen = ({ navigation } : WalkthroughScreenProps) => {
  const handleContinue = () => {
      // Perform any necessary actions when the user taps the "Continue" button
      // For example, you can navigate to the next screen
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Home',
          },
        ],
      });
  };

  const slides = []
  // Welcome slide    
  slides.push(<View style={styles.container}>
    <View style={styles.centeredContent}>
      <Image source={require('../assets/walkthrough/dumbell.png')} style={styles.image} />
      <Text style={styles.title}>Welcome to Lift-Lab!</Text>
      <Text style={styles.description}>Get ready for your lifting journey. </Text>
    </View>
  </View>)

  // Planning slide
  slides.push(
    <PopUpInfo
      extraInformation={
        'A plan tells you what exercises to do, and when. ' +
        'Typically, a plan is split into days. ' +
        'Each day focuses training on a different muscle group. ' +
        'Choose a plan based on your goals and experience level, and stick to it! ' +
        'You will see results in no time. '
      }
      titleString='It is as simple as sticking to the plan...'
      description='A plan tells you what exercises to do, and when.'
      image={<Image source={require('../assets/walkthrough/plan.png')} style={styles.image} />}
    />
  )

  // Sets and reps slide
  slides.push(
    <PopUpInfo
      extraInformation={
        'Each exercise has a number of sets and reps. ' +
        'A set is a group of repetitions. ' +
        'For example, if you do 10 pushups, you\'ve done 10 reps. ' +
        'If you do 3 sets of 10 pushups, you\'ve done 30 reps. ' +
        'When training, you should do one set of the specified number of reps, then rest. ' +
        'Repeat until you\'ve done all the sets for that exercise. ' +
        'For example, if you\'re doing 3 sets of 10 pushups, you should do 10 pushups, rest, '
      }
      titleString='Pay attention to the sets and reps.'
      description='Each exercise has a number of sets and reps.'
      image={<SampleExcercise/>}
    />
  )

  // Progressively overload slide
  slides.push(
    <PopUpInfo
      extraInformation={
        'To get stronger, you need to progressively overload your muscles. ' +
        'This means you need to increase the weight you lift each time you come back to an excercise. ' +
        'Lift-Lab helps you do this by tracking the weight you lift for each exercise. ' +
        'Record your progress, and push yourself to try a higher weight next time! ' +
        'For example, lets say you manage to do 3 sets of 8 bench presses at 50kg. ' +
        'Why not try 3 sets of 8 bench presses at 52.5kg next time?'
      }
      titleString='Progressively overload.'
      description='To get stronger, you need to progressively overload your muscles.'
      image={<Image source={require('../assets/walkthrough/progress.png')} style={styles.image} />}
    />
  )

//   slides.push(<View style={styles.container}>
//     <Image source={require('../assets/walkthrough/progress.png')} style={styles.image} />
//     <Text style={styles.title}>Progressively overload.</Text>
//     <Text style={styles.description}>
//       To get stronger, you need to progressively overload your muscles. 
//       This means you need to increase the weight you lift each time you come back to an excercise.
//       Lift-Lab helps you do this by tracking the weight you lift for each exercise.
//       Record your progress, and push yourself to try a higher weight next time!
//       For example, lets say you manage to do 3 sets of 8 bench presses at 50kg.
//       Why not try 3 sets of 8 bench presses at 52.5kg next time?
//     </Text>
//   </View>)

  return (
    <View style={styles.container}>
    <Swiper key={4} showsPagination={true} loop={false}>
      {slides}
    </Swiper>
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 167,
    marginBottom: 20,
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    marginBottom: 50,
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
  excerciseTitle: {
    paddingBottom: 6,
    fontSize: 23
  },
  excerciseContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 20,
    paddingLeft: 16,
    paddingRight: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
    alignSelf: 'center',
  },
  titles: {
    fontSize: 17,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: 0.25,
    color: 'black',
  },
  excerciseButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#f5f5f5',
  },
  setsAndReps: {
    fontSize: 20,
    textAlign: 'center',
  },
  setsInput: {
    fontSize: 20,
    height: 26,
    textAlign: 'center',
    alignSelf: 'center',
    borderColor:'#bebebe', 
    width: '90%',
    borderWidth:1, 
    borderRadius:6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  infoButton: {
    paddingTop: 10,
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  infoButtonText: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  modalDescription: {
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#599e6b',
    borderRadius: 4,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20, // Add horizontal margin for spacing from screen edges
  },
  centeredContent: {
    alignItems: 'center',
  },
});

export default WalkthroughScreen;

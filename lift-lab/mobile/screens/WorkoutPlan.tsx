import Swiper from 'react-native-swiper';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Button, StyleSheet, Text, View, ActivityIndicator, FlatList, TextInput, Pressable, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';

type WorkoutPlanTitleProps = {
  name: string
}

const WorkoutPlanTitle = (workoutPlanTitle: WorkoutPlanTitleProps) => {
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.titleText}>{workoutPlanTitle.name}</Text>
    </View>
  )
}

type Week = {
  weekNumber: number,
  userID: number
}

const Week = (props: Week) => {
  const [weekNumber, setWeekNumber] = useState(props.weekNumber)
  return (
    <View>
      <WeekSelector weekNumber={weekNumber} setWeekNumber={setWeekNumber} maxWeekNumber={10}/>
      <Days weekNumber={weekNumber} userID={props.userID}/>
    </View>
  )
}

type WeekSelectorProps = {
  weekNumber: number
  maxWeekNumber: number
  setWeekNumber: (weekNumber: number) => void
}

const WeekSelector = (props: WeekSelectorProps) => {
  return (
    <View style={styles.weekSelectorContainer}>
      <Button color='#599e6b' title='←' onPress={() => props.setWeekNumber(Math.max(props.weekNumber - 1, 1))} />
      <Text style={styles.weekSelectorText}>Week {props.weekNumber}</Text>
      <Button color='#599e6b' title='→' onPress={() => props.setWeekNumber(Math.min(props.weekNumber + 1, props.maxWeekNumber))} />
    </View>
  )
}

type DaysProps = {
  userID: number,
  weekNumber: number
}

type PlanResponse = {
  day: number, 
  day_to_week_id: number, 
  sets: number, 
  reps: number, 
  name: string, 
  description: string,
  image: string
}

const Days = (props: DaysProps) => {
  const [isLoading, setLoading] = useState(true)
  const [data, setData] = useState<{ [day: number]: PlanResponse[] }>({})

  

  useEffect(() => {
    const getExcercises = async () => {
      try {
        const response = await fetch( url + '/plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id : props.userID,
            week: props.weekNumber,
          }),
        });
        const json = await response.json()
        setData(json)
      } catch(e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    getExcercises() 
  }, [props.weekNumber])

  return (
    <Swiper 
      showsPagination={false} 
      loop={false} 
      showsVerticalScrollIndicator={false}
      style={{height: 100_00}}
    >
      { isLoading ? <ActivityIndicator/> : createDays(data, props.userID) }
    </Swiper>
  )
}

const createDays = (data: { [day: number]: PlanResponse[] }, userID: number) => {
  const maxDay = Math.max(...Object.keys(data).map((key) => parseInt(key)))
  const days = []
  for (let i = 1; i <= maxDay; i++) {
    const excercises: ExcerciseProps[] = data[i].map((excercise) => {
      return {
        day_to_week_id: excercise.day_to_week_id,
        userID: userID,
        sets: excercise.sets,
        reps: excercise.reps,
        name: excercise.name,
        description: excercise.description,
        image: excercise.image
      }
    })
      
    days.push(<Day key={i} dayNumber={i} excercises={excercises} userID={userID}/>)
  }
  return days
}

const WorkoutPopUp = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{marginTop: 30, justifyContent: 'center', alignContent: 'center', flex: 1}}>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.finishWorkoutButton}>
        <Text style={styles.finishWorkoutButtonText}>✓ Complete Workout</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        style={{flex:1}}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.subtitleText}>
              Good Job!
            </Text>
            <Text style={{paddingBottom: 10}}>
              You're on a 6 day streak! Keep it up!
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.finishWorkoutButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    
  );
};

type DayProps = {
  userID: number,
  dayNumber: number,
  excercises: ExcerciseProps[]
}

const Day = (props: DayProps) => {
  return (
    <View>
      <DaySelector dayNumber={props.dayNumber}/>
      <Excercises excercises={props.excercises} userID={props.userID}/>
      <WorkoutPopUp />
    </View>
  )
}

type DaySelectorProps = {
  dayNumber: number
}

const DaySelector = (props: DaySelectorProps) => {
  return (
    <View style={styles.daySelectorContainer}>
      <Text style={styles.daySelectorText}>Day {props.dayNumber}</Text>
    </View>
  )
}

// const url = 'http://192.168.1.167:8080'
const url = 'https://lift-lab.herokuapp.com'

type ExcercisesProps = {
  userID: number,
  excercises: ExcerciseProps[]
}

const Excercises = (props: ExcercisesProps) => {
  return (
    <View>
      {
        props.excercises.map((excercise) => (
          <View style={styles.excerciseContainer}>
            <Excercise 
              day_to_week_id={excercise.day_to_week_id} 
              userID={props.userID} 
              sets={excercise.sets} 
              reps={excercise.reps} 
              name={excercise.name}
              description={excercise.description}
              image={excercise.image}
            />
          </View>
        ))
      }
    </View>
  )
}

type ExcerciseProps = {
  day_to_week_id: number,
  userID: number,
  sets: number,
  reps: number,
  name: string,
  description: string,
  image: string
}

const Excercise = (excercise: ExcerciseProps) => {
  const [weights, setWeights] = useState<string[]>([]);
  const [reps, setReps] = useState<string[]>([]);

  const getWeights = async (set: number) => {
    try {
      const response = await fetch(url + '/getUserPlanWeight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id : excercise.userID,
          day_to_week_id : excercise.day_to_week_id,
          set : set,
        }),
      });
      const json = await response.json()
      return json.length == 0 ? "" : json[0].weight
    } catch(e) {
      console.error(e)
    }
  }

  const getReps = async (set: number) => {
    try {
      const response = await fetch(url + '/getUserPlanReps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id : excercise.userID,
          day_to_week_id : excercise.day_to_week_id,
          set : set,
        }),
      });
      const json = await response.json()
      const result = json.length == 0 ? "" : json[0].reps
      return result
    } catch(e) {
      console.error(e)
    }
  }

  useEffect(() => { 
    const fetchWeightsAndReps = async () => {
      const weightInputs: string[] = [""];
      const repInputs: string[] = [""];

      for (let i = 1; i <= excercise.sets+1; i++) {
        const weight = await getWeights(i);
        const rep = await getReps(i);
        weightInputs.push(weight == null ? "" : weight.toString());
        repInputs.push(rep == null ? "" : rep.toString());
      }

      setWeights(weightInputs);
      setReps(repInputs);
    };

    fetchWeightsAndReps();
  }, [])

  const postWeightUser = async (text: string, index: number) => {
    try {
      const response = await fetch(url + '/setUserPlanWeight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weight : text,
          set : index,
          day_to_week_id : excercise.day_to_week_id,
          user_id : excercise.userID
        }),
      });
    } catch(e) {
      console.error(e)
    }
  }

  const postRepsUser = async (text: string, index: number) => {
    try {
      const response = await fetch(url + '/setUserPlanReps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reps : text,
          set : index,
          day_to_week_id : excercise.day_to_week_id,
          user_id : excercise.userID
        }),
      });
    } catch(e) {
      console.error(e)
    }
  }

  const handleWeightChange = (text: string, index: number) => {
    const weightInputs = [...weights]
    weightInputs[index] = text
    setWeights(weightInputs)
    postWeightUser(text, index)
  };

  const handleRepChange = (text: string, index: number) => {
    const repInputs = [...reps]
    repInputs[index] = text
    setReps(repInputs)
    postRepsUser(text, index)
  };

  const generateInputs = () => {
    const generatedInputs = [];
    for (let i = 1; i < excercise.sets+1; i++) {
      generatedInputs.push(
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom:10 }}>
          <View style={{ flex: 0.8, height: 20, paddingTop:3 }}><Text style={styles.setsAndReps}>{i}</Text></View>
          <View style={{ flex: 0.8, height: 20, paddingTop:3 }}><Text style={styles.setsAndReps}> {excercise.reps}</Text></View>
          <View style={{ flex: 1.2, height: 20 }}><TextInput 
            style={styles.setsInput} 
            key={i}
            keyboardType='numeric'
            value={weights[i]}
            onChangeText={weight => handleWeightChange(weight, i)}
            placeholder={''}
          /></View> 
          <View style={{ flex: 1.2, height: 20 }}><TextInput 
            style={styles.setsInput} 
            key={i}
            keyboardType='numeric'
            value={reps[i]}
            onChangeText={rep => handleRepChange(rep, i)}
            placeholder={''}
          /></View> 
        </View>
      );
    }
    return generatedInputs;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.excerciseTitle}>{excercise.name}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10 }}>
        <View style={{flex:1.4}}>
          <Text style={{paddingBottom:15, color: "gray", fontWeight: "300"}}>{excercise.description}</Text>
        </View>
        <View style={{flex:0.2}}/>
        <View style={{flex:0.4, paddingRight: 16}}>
          <Image source={{uri: excercise.image}} style={{width: 80, height: 80, borderRadius: 10}} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10 }}>
        <View style={{ flex: 0.8, height: 20 }}><TextInput style={styles.titles} placeholder="SET" editable={false} selectTextOnFocus={false} /></View>
        <View style={{ flex: 0.8, height: 20 }}><TextInput style={styles.titles} placeholder="REPS" editable={false} selectTextOnFocus={false} /></View>
        <View style={{ flex: 1.2, height: 20 }}><TextInput style={styles.titles} placeholder="WEIGHT" editable={false} selectTextOnFocus={false} /></View>
        <View style={{ flex: 1.2, height: 20 }}><TextInput style={styles.titles} placeholder="REPS" editable={false} selectTextOnFocus={false} /></View>
      </View>
      {generateInputs()}
      <View style={{paddingTop: 15}}>
        <Pressable style={styles.button} onPress={() => {}}>
          <Text style={styles.text}>+ Add Set</Text>
        </Pressable>
      </View>
    </View>
  );
};

// Displays a message in grey at the center of the screen, saying that the user has no workout plan.
const NoPlanMessage = () => {
  return (
    <View style={{alignContent: 'center', justifyContent: 'center', flex: 1}}>
      <Text style={styles.noPlanMessage}>You have no workout plan! You can find one to suit your needs in the discover tab.</Text>
    </View>
  );
}

type WorkoutPlanProps = {
  userID: number
}

const WorkoutPlanScreen = (props: WorkoutPlanProps) => {
  const currWeek = 1
  const [hasPlan, setHasPlan] = useState(false)
  const [name, setName] = useState("")
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const fetchName = async () => {
      try {
        const response = await fetch(url + '/plan/name', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: props.userID
          }),
        });
        const json = await response.json();
        if (json.length > 0) {
          setHasPlan(true)
          setName(json[0].name)
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false)
        console.log(name)
      }
    }
    fetchName()
  }, [])

  if (isLoading) {
    return (
      <ActivityIndicator />
    )
  } else if (!hasPlan) {
    return (
      <NoPlanMessage />
    )
  } else {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <WorkoutPlanTitle name={name} />
        <Week userID={props.userID} weekNumber={currWeek} />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  titleContainer: {
    paddingTop: 50,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    flex: 1,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 50,
    fontWeight: "600",
  },
  subtitleText: {
    fontSize: 24,
    fontWeight: "300",
    marginBottom: 10,
  },
  weekSelectorContainer: {
    paddingTop: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  weekSelectorText: {
    fontSize: 24
  },
  weekSelectorButton: {
    paddingRight: 30,
    paddingLeft: 100
  },
  daySelectorContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelectorText: {
    fontSize: 22
  },
  excerciseContainer: {
    padding: 20
  },
  excerciseTitle: {
    paddingBottom: 6,
    fontSize: 23
  },
  setsAndReps: {
    fontSize: 20,
    textAlign: 'center',
  },
  titles: {
    fontSize: 17,
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
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingTop: 16,
    paddingBottom: 8,
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
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: 0.25,
    color: 'black',
  },
  finishWorkoutButton: {
    alignSelf: 'center',
    width: '90%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#599e6b',
  },
  closeButton: {
    alignSelf: 'center',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#599e6b',
  },
  finishWorkoutButtonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: 0.25,
    color: 'white',
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPlanMessage: {
    fontSize: 20,
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    color: '#bebebe'
  }
});

export {WorkoutPlanScreen}
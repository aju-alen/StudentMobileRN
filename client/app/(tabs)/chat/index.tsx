import { StyleSheet, Text, View, Animated, TouchableOpacity} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State, TextInput } from 'react-native-gesture-handler';

const App = () => {
  const handlePress = () => {
    console.log('Button clicked!');
    // Perform any other actions you want when the button is clicked
  };
}

const ChatPage = () => {
  return (
    <View style={styles.container}>
     <View style={{backgroundColor:'white',borderRadius:10,width:'100%',alignContent:'center',height:45,flexDirection:'row',marginBottom:15,marginTop:10,elevation:10}}>
      <TextInput
        placeholder='Search for your chats here'
        style={{paddingLeft:10}}
       
        >
      </TextInput>
     </View>
      
      <View style={styles.checkq}>
        <View style={{backgroundColor:'#45B08C',height:75,width:'100%',
    justifyContent: 'center',borderColor:'black', borderWidth:0,borderRadius:10 ,flexDirection: 'row', }}>
          <View style={{flexDirection:'column'}}>
          <Text style={styles.name}>Teacher 2</Text>
          <Text style={styles.message}>Chat 3</Text>
          </View>
          <Text style={{color:'white', paddingTop:17,fontSize:14,alignItems:'flex-end',textAlign:'right',flex:1,paddingRight:10}}>4:20 am</Text>
        </View>
        <View style={{backgroundColor:'#45B08C',height:75,width:'100%',
    justifyContent: 'center',borderColor:'black', borderWidth:0,borderRadius:10 ,flexDirection: 'row', }}>  
          <View>
          <Text style={styles.name}>Teacher 3</Text>
          <Text style={styles.message}>Chat 3</Text>
          </View>
          <Text style={{color:'white', paddingTop:17,fontSize:14,alignItems:'flex-end',textAlign:'right',flex:1,paddingRight:10}}>7:33 pm</Text>
        </View>
        <View style={{backgroundColor:'#45B08C',height:75,width:'100%',
    justifyContent: 'center',borderColor:'black', borderWidth:0,borderRadius:10 ,flexDirection: 'row', }}>  
          <View>
          <Text style={styles.name}>Teacher 1</Text>
          <Text style={styles.message}>chat 1</Text>
          </View>
          <Text style={{color:'white', paddingTop:17,fontSize:14,alignItems:'flex-end',textAlign:'right',flex:1,paddingRight:10}}>10:45 am</Text>
        </View>
      </View>
    </View>
  )
}

export default ChatPage

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor:'#DBE8D8',
    padding:10,
    flexDirection: 'column'
  },
  checkq: {
    backgroundColor:'#45B08C',
    width: '100%',
    height:'100%',
    marginTop:10,
    borderRadius:10
  },
  chats:{
    borderRadius:9,
    backgroundColor:'#45B08C',
    height:'8%',
    width:'100%',
    flexDirection: 'row',
  },
  options:{
    borderRadius:9,
    backgroundColor:'#45B08C',
    width:'50%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    flexDirection:'row'
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    // shadowRadius: 4,
    // elevation: 5, // Android
  },
  font:{
    fontSize: 18,
    fontWeight: 'bold',
    color:'white'
  },
  name:{
    fontWeight: 'bold',
    paddingTop:9,
    paddingLeft:10,
    fontSize: 18,
    color:'white'
  },
  message:{
    paddingLeft:10,
    fontSize: 15,
    color:'lightgrey'
  }
})
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
const ChatId = () => {
  const { subjectId } = useLocalSearchParams();
  return (
    <SafeAreaView style={{flex: 1,flexDirection:'column'}}>
    <View style={{backgroundColor:'#45B08C',height:80, width:'100%', flexDirection:'row',alignItems:'center'}}>
      <Ionicons name="arrow-back-outline" size={35 } color="white" style={{paddingLeft:8}}/>
      <Ionicons name="people-circle" size={50 } color="white" style={{paddingLeft:8}}></Ionicons>
      <Text style={{paddingLeft:10,fontSize:20,color:'white'}}>Ajippan Whatsapp</Text>
      <Ionicons name="ellipsis-vertical" size={30} color="white" style={{alignItems:'flex-end',paddingRight:8,flex:1,textAlign:'right'}}></Ionicons>
    </View>
    <View style={{backgroundColor:'#93E9BE', width:'100%',height:650,flexDirection:'column',flex:1}}>
      <View style={{backgroundColor:'#81B69D', height:43, width:'40%', borderRadius:10,marginLeft:15,marginTop:10,flexDirection:'row',alignItems:'center'}}>
        <Text style={styles.message} >Eda myre</Text>
        <Text style={styles.time}>9:30PM</Text>
      </View>
      <View style={{backgroundColor:'#81B69D', height:43, width:'40%', borderRadius:10,marginLeft:15,marginTop:10,alignItems:'center', flexDirection:'row',}}>
      <Text style={styles.message} >oombeda</Text>
      <Text style={styles.time}>10:30AM</Text>
      </View>
    </View>
    <View style={{backgroundColor:'#45B08C', width:'100%',height:60,flexDirection:'row',alignItems:'center',justifyContent:'center',}}>
      <View style={{flexDirection:"row" , backgroundColor:'white',height:40,alignItems:'center',borderRadius:6, width:'97%'}}>
        <Ionicons name='happy' size={30} color="grey" style={{paddingLeft:10,}}></Ionicons>
        <TextInput placeholder='Message' placeholderTextColor='grey' style={{paddingLeft:12, fontSize:18}}></TextInput>
        <Ionicons name='camera'size={30} color="grey" style={{flex:1,paddingRight:15,alignItems:'flex-end',textAlign:"right"}}></Ionicons>
      </View>

    </View>
  </SafeAreaView>
  );
};

export default ChatId  

const styles = StyleSheet.create({
  message:{
    color: 'white',
    fontSize:18,
    paddingLeft:10,
  },
  time:{
    fontSize:10,
    color:'white',
    paddingTop:13,
    alignItems:'flex-end',
    paddingRight:8,
    flex:1,
    textAlign:'right'
  }

});
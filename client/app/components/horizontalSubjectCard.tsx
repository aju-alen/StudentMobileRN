import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics'
import { FONT } from '../../constants/theme'
import { Image } from 'expo-image';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const HorizontalSubjectCard = ({subjectData,handleItemPress,isHorizontal}) => {

  console.log(subjectData, 'this is subject data in horizontal card');
  
  return (
    <View style={{flex:1}}>
        <FlatList 
      data={subjectData}
      keyExtractor={(item)=>item._id}
      renderItem={({item}) =>(
        <TouchableOpacity onPress={() => handleItemPress(item)}>
      <View style={styles.flatlistRecommendedContainer}>
            <View style={styles.flatlistInnerContainer}>
            <Image 
              style={styles.subjectImage} 
              source={{ uri: item?.subjectImage }}
              placeholder={blurhash}
              contentFit="cover"
              transition={100}
         />
         <View style={styles.subjectBoardContainer}>
          <Text style={styles.subjectBoardText}>{item?.subjectBoard}</Text>
          <Text style={styles.subjectGradeText}>Grade: {item?.subjectGrade}</Text>
         </View>
         <Text style={styles.flatlistSubjectNameText}>{item?.subjectName}</Text>
          </View>
          <View style={styles.subjectDetailsContainer}>
            <View style={styles.imageandNameContainer} >
          <Image 
            style={styles.subjectTeacherImage} 
            source={{ uri: item?.user?.profileImage }}
            placeholder={blurhash}
            contentFit="cover"
            transition={100}
         />
         <View style={styles.subjectTeacherNameAndDesignationContainer}>
         <Text style={styles.subjectTeacherNameText}>{item?.user.name}</Text>
         <Text style={styles.subjectTeacherDesignation}>{item?.user.name}</Text>
         </View>
            </View>
            <View>
         {/* <Text style={styles.subjectPrice}>AED {item?.subjectPrice}</Text> */}
            </View>
          </View>
      </View>
      </TouchableOpacity>
      )}
      horizontal={isHorizontal}
      
      />
    </View>
  )
}

export default HorizontalSubjectCard

const styles = StyleSheet.create({
  flatlistInnerContainer:{
    marginHorizontal:horizontalScale(14),
  },
  flatlistRecommendedContainer:{
    height:verticalScale(250),
    width:horizontalScale(250),
    marginHorizontal:horizontalScale(1),
    borderColor:"gray",
    borderRadius:moderateScale(20),
    
  },
  subjectImage:{
    width:"100%",
    marginTop:verticalScale(8),
    height:verticalScale(150),
    borderRadius:moderateScale(20),
  },
  subjectBoardContainer:{
    flexDirection:"row",
    backgroundColor:"'rgba(255, 255, 255, 0.8)'",
    padding:moderateScale(5),
    height:verticalScale(29),
    maxWidth:"100%",
    borderRadius:moderateScale(40),
    marginTop:verticalScale(21),
    marginLeft:horizontalScale(20),
    justifyContent:"space-around",
    alignItems:"center",
    position:"absolute",
  },
  subjectBoardText:{
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(12),
  },
  subjectGradeText:{
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
  },
  flatlistSubjectNameText:{
    // marginTop:verticalScale(14),
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(15),

    height:verticalScale(40),
  },
  subjectDetailsContainer:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    marginHorizontal:horizontalScale(14),
    
  },
  imageandNameContainer:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    width:horizontalScale(120),
    
  },
  subjectTeacherImage:{
    height:verticalScale(31),
    width:horizontalScale(31),
    borderRadius: moderateScale(60),
  },
  subjectTeacherNameAndDesignationContainer:{
   
  },
  subjectTeacherNameText:{
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(13),
    marginLeft:horizontalScale(8),
  },
  subjectTeacherDesignation:{
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    marginLeft:horizontalScale(8),
  },
  subjectPrice:{
    fontFamily: FONT.bold,
    fontSize: moderateScale(15),
    color:"#2DCB63",
  
  }
})
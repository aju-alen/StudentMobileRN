import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics'
import { FONT } from '../../constants/theme'
import { boolean } from 'zod'

const ColumnSubjectCards = ({subjectData,handleItemPress,isHorizontal}) => {
  return (
    <View style={{flex:1}}>
        <FlatList 
      data={subjectData}
      keyExtractor={(item)=>item._id}
      renderItem={({item}) =>(
        <TouchableOpacity onPress={() => handleItemPress(item)}>
      <View style={styles.flatlistRecommendedContainer}>
            <View style={styles.flatlistInnerContainer}>
            <Image style={styles.subjectImage} 
          source={{ uri: item?.subjectImage }}
           resizeMode='cover'
         />
         <View style={styles.subjectBoardContainer}>
          <Text style={styles.subjectBoardText}>{item?.subjectBoard}</Text>
          <Text style={styles.subjectGradeText}>Grade: {item?.subjectGrade}</Text>
         </View>
         <Text style={styles.flatlistSubjectNameText}>{item?.subjectName}</Text>
          </View>
          <View style={styles.subjectDetailsContainer}>
            <View style={styles.imageandNameContainer} >
          {/* <Image style={styles.subjectTeacherImage} 
          source={{ uri: item?.user?.profileImage }}
           resizeMode='cover'
         /> */}
         <View>
         <Text style={styles.subjectTeacherNameText}>{item?.user.name}</Text>
         <Text style={styles.subjectTeacherDesignation}>{item?.user.name}</Text>
         </View>
            </View>
            <View>
         <Text style={styles.subjectPrice}>AED {item?.subjectPrice}</Text>
            </View>
          </View>
      </View>
      </TouchableOpacity>
      )}
      horizontal={isHorizontal}
      scrollEnabled={false}
      numColumns={2}
      />
    </View>
  )
}

export default ColumnSubjectCards

const styles = StyleSheet.create({
  flatlistInnerContainer:{
    marginHorizontal:horizontalScale(0),
    height:verticalScale(169),
    justifyContent:"space-between",

  
  },
  flatlistRecommendedContainer:{
    height:verticalScale(210),
    width:horizontalScale(160),
    marginHorizontal:horizontalScale(15),
    marginTop:verticalScale(10),
    borderRadius:moderateScale(20),
    justifyContent:"space-between",
   
  },
  subjectImage:{
    width:"100%",
    height:'70%',
    borderRadius:moderateScale(10),
  },
  subjectBoardContainer:{
    flexDirection:"row",
    backgroundColor:"'rgba(255, 255, 255, 0.9)'",
    padding:moderateScale(2),
    height:verticalScale(29),
    width:horizontalScale(70),
    borderRadius:moderateScale(40),
    marginTop:verticalScale(11),
    marginLeft:horizontalScale(10),
    justifyContent:"space-around",
    alignItems:"center",
    position:"absolute",
   
  },
  subjectBoardText:{
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(9),
  },
  subjectGradeText:{
    fontFamily: FONT.regular,
    fontSize: moderateScale(10),
  },
  flatlistSubjectNameText:{
    marginTop:verticalScale(2),
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(15),
    

  },
  subjectDetailsContainer:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    marginHorizontal:horizontalScale(0),
    // marginTop:verticalScale(5),
   
   
  },
  imageandNameContainer:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    width:horizontalScale(80),
  },
  subjectTeacherImage:{
    height:verticalScale(31),
    width:horizontalScale(31),
    borderRadius: moderateScale(60),
  },
  subjectTeacherNameText:{
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(12),
    marginLeft:horizontalScale(8),
  
  },
  subjectTeacherDesignation:{
    fontFamily: FONT.regular,
    fontSize: moderateScale(10),
    marginLeft:horizontalScale(8),
  },
  subjectPrice:{
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color:"#2DCB63",
  
  }
})
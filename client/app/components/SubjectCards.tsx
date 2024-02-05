import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics'
import { FONT } from '../../constants/theme'
import { boolean } from 'zod'

const SubjectCards = ({subjectData,handleItemPress,isHorizontal}) => {
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
          <Image style={styles.subjectTeacherImage} 
          source={{ uri: item?.user?.profileImage }}
           resizeMode='cover'
         />
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
      />
    </View>
  )
}

export default SubjectCards

const styles = StyleSheet.create({
  flatlistInnerContainer:{
    marginHorizontal:horizontalScale(14),
  },
  flatlistRecommendedContainer:{
    height:verticalScale(309),
    width:horizontalScale(339),
    marginHorizontal:horizontalScale(15),
    marginTop:verticalScale(10),
    borderColor:"gray",
    borderRadius:moderateScale(40),
    borderWidth:1,
  },
  subjectImage:{
    width:"100%",
    marginTop:verticalScale(16),
    height:verticalScale(189),
    borderRadius:moderateScale(40),
  },
  subjectBoardContainer:{
    flexDirection:"row",
    backgroundColor:"'rgba(255, 255, 255, 0.8)'",
    padding:moderateScale(5),
    height:verticalScale(29),
    width:horizontalScale(110),
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
    marginTop:verticalScale(14),
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(20),


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
    justifyContent:"space-around",
    width:horizontalScale(120),
  },
  subjectTeacherImage:{
    height:verticalScale(51),
    width:horizontalScale(51),
    borderRadius: moderateScale(60),
  },
  subjectTeacherNameText:{
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(15),
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
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics'
import { FONT } from '../../constants/theme'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const ColumnSubjectCards = ({subjectData, handleItemPress, isHorizontal}) => {
  const renderItem = ({item}) => (
    <TouchableOpacity 
      onPress={() => handleItemPress(item)}
      style={styles.cardTouchable}
      activeOpacity={0.7}
    >
      <View style={styles.flatlistRecommendedContainer}>
        <View style={styles.flatlistInnerContainer}>
          <Image 
            style={styles.subjectImage} 
            source={{ uri: item?.subjectImage }}
            placeholder={blurhash}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
          <View style={styles.subjectBoardContainer}>
            <Text style={styles.subjectBoardText}>{item?.subjectBoard}</Text>
            <View style={styles.gradePill}>
              <Text style={styles.subjectGradeText}>Grade {item?.subjectGrade}</Text>
            </View>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.flatlistSubjectNameText} numberOfLines={2}>
              {item?.subjectName}
            </Text>
            
            <View style={styles.subjectDetailsContainer}>
              <View style={styles.imageAndNameContainer}>
                <View style={styles.teacherInfo}>
                  <Text style={styles.subjectTeacherNameText} numberOfLines={1}>
                    {item?.user.name}
                  </Text>
                  <Text style={styles.subjectTeacherDesignation} numberOfLines={1}>
                    {item?.user.name}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList 
        data={subjectData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal={isHorizontal}
        scrollEnabled={false}
        numColumns={2}
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

export default ColumnSubjectCards;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: verticalScale(10),
  },
  flatListContent: {
    paddingHorizontal: horizontalScale(8),
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardTouchable: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    //shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  flatlistInnerContainer: {
    position: 'relative',
    height: verticalScale(169),
    maxHeight: verticalScale(169),
  },
  flatlistRecommendedContainer: {
    height: verticalScale(210),
    maxHeight: verticalScale(210),
    width: horizontalScale(160),
    marginHorizontal: horizontalScale(7),
    marginBottom: verticalScale(15),
    borderRadius: moderateScale(20),
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  subjectImage: {
    width: '100%',
    height: '70%',
    maxHeight: verticalScale(147),
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
  },
  subjectBoardContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    position: 'absolute',
    top: verticalScale(8),
    left: horizontalScale(8),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    //shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradePill: {
    backgroundColor: 'rgba(45, 203, 99, 0.15)',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(12),
    marginLeft: horizontalScale(6),
  },
  subjectBoardText: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(10),
    color: '#333',
  },
  subjectGradeText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(10),
    color: '#2DCB63',
  },
  contentContainer: {
    padding: moderateScale(12),
    backgroundColor: '#FFFFFF',
    maxHeight: verticalScale(63),
  },
  flatlistSubjectNameText: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(14),
    color: '#1A1A1A',
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(20),
    maxHeight: verticalScale(40),
  },
  subjectDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageAndNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teacherInfo: {
    flex: 1,
  },
  subjectTeacherNameText: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(12),
    color: '#444',
  },
  subjectTeacherDesignation: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(10),
    color: '#888',
    marginTop: verticalScale(2),
  }
});
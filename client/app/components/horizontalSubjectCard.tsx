import { FlatList, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native'
import React, { useState, useRef } from 'react'
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics'
import { FONT } from '../../constants/theme'
import { Image } from 'expo-image'

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const HorizontalSubjectCard = ({ subjectData, handleItemPress, isHorizontal }) => {
  // Animation value for card hover effect
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const renderSubjectCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleItemPress(item)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View style={[
        styles.flatlistRecommendedContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <View style={styles.flatlistInnerContainer}>
          <Image
            style={styles.subjectImage}
            source={{ uri: item?.subjectImage }}
            placeholder={blurhash}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.subjectBoardContainer}>
            <View style={styles.boardChip}>
              <Text style={styles.subjectBoardText}>{item?.subjectBoard}</Text>
              <View style={styles.divider} />
              <Text style={styles.subjectGradeText}>Grade {item?.subjectGrade}</Text>
            </View>
          </View>
          <Text numberOfLines={1} style={styles.flatlistSubjectNameText}>
            {item?.subjectName}
          </Text>
          <View style={styles.subjectDetailsContainer}>
            <View style={styles.imageandNameContainer}>
              <Image
                style={styles.subjectTeacherImage}
                source={{ uri: item?.user?.profileImage }}
                placeholder={blurhash}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.subjectTeacherNameAndDesignationContainer}>
                <Text numberOfLines={1} style={styles.subjectTeacherNameText}>
                  {item?.user.name}
                </Text>
                <Text numberOfLines={1} style={styles.subjectTeacherDesignation}>
                  {item?.user.designation || 'Senior Teacher'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={subjectData}
        keyExtractor={(item) => item.id}
        renderItem={renderSubjectCard}
        horizontal={isHorizontal}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        snapToInterval={horizontalScale(270)}
        decelerationRate="fast"
        snapToAlignment="center"
      />
    </View>
  );
};

export default HorizontalSubjectCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(10),
  },
  flatlistInnerContainer: {
    flex: 1,
    padding: moderateScale(12),
  },
  flatlistRecommendedContainer: {
    height: verticalScale(280),
    width: horizontalScale(270),
    marginHorizontal: horizontalScale(8),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  subjectImage: {
    width: '100%',
    height: verticalScale(160),
    borderRadius: moderateScale(16),
  },
  subjectBoardContainer: {
    position: 'absolute',
    top: verticalScale(24),
    left: horizontalScale(24),
    right: horizontalScale(24),
  },
  boardChip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: verticalScale(6),
    paddingHorizontal: horizontalScale(12),
    borderRadius: moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#DDD',
    marginHorizontal: horizontalScale(8),
  },
  subjectBoardText: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(12),
    color: '#333',
  },
  subjectGradeText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#666',
  },
  flatlistSubjectNameText: {
    marginTop: verticalScale(12),
    marginBottom: verticalScale(8),
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(16),
    color: '#222',
    lineHeight: verticalScale(22),
  },
  subjectDetailsContainer: {
    marginTop: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageandNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectTeacherImage: {
    height: verticalScale(40),
    width: horizontalScale(40),
    borderRadius: moderateScale(20),
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subjectTeacherNameAndDesignationContainer: {
    marginLeft: horizontalScale(10),
    flex: 1,
  },
  subjectTeacherNameText: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(14),
    color: '#333',
  },
  subjectTeacherDesignation: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#666',
    marginTop: verticalScale(2),
  },
});
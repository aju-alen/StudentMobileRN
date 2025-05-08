import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import React from 'react';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { FONT } from '../../constants/theme';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const UserSubjectCards = ({ subjectData, handleItemPress, isHorizontal }) => {
  console.log('subjectData', subjectData);
  
  const renderSubjectCard = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleItemPress(item.subject)}
      style={styles.cardContainer}
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>
        <Image 
          style={styles.subjectImage} 
          source={{ uri: item.subject?.subjectImage }}
          placeholder={blurhash}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.imageOverlay} />
        
        <View style={styles.topBadgeContainer}>
          <View style={styles.boardBadge}>
            <Text style={styles.boardText}>{item.subject?.subjectBoard}</Text>
          </View>
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeText}>Grade {item.subject?.subjectGrade}</Text>
          </View>
        </View>

        <View style={styles.priceTag}>
          <Text style={styles.priceValue}>AED {item.subject?.subjectPrice}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.subjectName} numberOfLines={2}>
          {item.subject?.subjectName}
        </Text>

        <View style={styles.divider} />

       
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList 
        data={subjectData}
        keyExtractor={(item) => item.id}
        renderItem={renderSubjectCard}
        horizontal={isHorizontal}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    gap: moderateScale(20),
    padding: moderateScale(4),
  },
  cardContainer: {
    width: horizontalScale(340),
    backgroundColor: 'white',
    borderRadius: moderateScale(28),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: verticalScale(200),
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 1,
  },
  subjectImage: {
    width: '100%',
    height: '100%',
  },
  topBadgeContainer: {
    position: 'absolute',
    top: verticalScale(16),
    left: horizontalScale(16),
    flexDirection: 'row',
    gap: horizontalScale(8),
    zIndex: 2,
  },
  boardBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(30),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  gradeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(30),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  boardText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(13),
    color: '#1A4C6E',
  },
  gradeText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(13),
    color: '#1A4C6E',
  },
  priceTag: {
    position: 'absolute',
    bottom: verticalScale(16),
    right: horizontalScale(16),
    backgroundColor: '#2DCB63',
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 2,
  },
  priceValue: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: 'white',
  },
  contentContainer: {
    padding: moderateScale(20),
  },
  subjectName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A4C6E',
    marginBottom: verticalScale(16),
    lineHeight: moderateScale(28),
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: verticalScale(16),
  },
  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherImageContainer: {
    position: 'relative',
  },
  teacherImage: {
    width: horizontalScale(48),
    height: horizontalScale(48),
    borderRadius: moderateScale(24),
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: horizontalScale(12),
    height: horizontalScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: '#2DCB63',
    borderWidth: 2,
    borderColor: 'white',
  },
  teacherInfo: {
    marginLeft: horizontalScale(12),
    flex: 1,
  },
  teacherName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A4C6E',
    marginBottom: verticalScale(4),
  },
  expertBadge: {
    backgroundColor: '#F0F7FF',
    paddingVertical: verticalScale(4),
    paddingHorizontal: horizontalScale(10),
    borderRadius: moderateScale(12),
    alignSelf: 'flex-start',
  },
  expertText: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(12),
    color: '#2563EB',
  },
});

export default UserSubjectCards; 
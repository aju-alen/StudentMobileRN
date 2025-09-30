import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import React from 'react';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { FONT } from '../../constants/theme';
import { COLORS } from '../../constants';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const SubjectCards = ({ subjectData, handleItemPress, isHorizontal }) => {
  console.log('subjectData', subjectData);
  
  const renderSubjectCard = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleItemPress(item)}
      style={styles.cardContainer}
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>
        <Image 
          style={styles.subjectImage} 
          source={{ uri: item?.subjectImage }}
          placeholder={blurhash}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.imageOverlay} />
        
        <View style={styles.topBadgeContainer}>
          <View style={styles.boardBadge}>
            <Text style={styles.boardText}>{item?.subjectBoard}</Text>
          </View>
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeText}>Grade {item?.subjectGrade}</Text>
          </View>
        </View>

        <View style={styles.priceTag}>
          <Text style={styles.priceValue}>AED {(item?.subjectPrice) / 100}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.subjectName} numberOfLines={2}>
          {item?.subjectName}
        </Text>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{item?.subjectDuration} hours</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Language</Text>
            <Text style={styles.detailValue}>{item?.subjectLanguage}</Text>
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
    gap: moderateScale(24),
    padding: moderateScale(4),
  },
  cardContainer: {
    width: horizontalScale(340),
    backgroundColor: 'white',
    borderRadius: moderateScale(24),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    //shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: verticalScale(220),
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
    borderRadius: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    //shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(20),
     shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    //shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boardText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: COLORS.primary,
  },
  gradeText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: COLORS.primary,
  },
  priceTag: {
    position: 'absolute',
    bottom: verticalScale(16),
    right: horizontalScale(16),
    backgroundColor: COLORS.primary,
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
    borderRadius: moderateScale(24),
     shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    //shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 2,
  },
  priceValue: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: 'white',
  },
  contentContainer: {
    padding: moderateScale(24),
  },
  subjectName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(22),
    color: '#1A4C6E',
    marginBottom: verticalScale(20),
    lineHeight: moderateScale(30),
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: verticalScale(20),
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: horizontalScale(16),
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginBottom: verticalScale(4),
  },
  detailValue: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(16),
    color: '#1A4C6E',
  },
});

export default SubjectCards;
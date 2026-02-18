import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import React from 'react';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { FONT } from '../../constants/theme';
import { COLORS } from '../../constants';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const SubjectCards = ({ subjectData, handleItemPress, isHorizontal }) => {
  
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

        {!item?.subjectVerification && (
          <View style={styles.verificationBadge}>
            <Text style={styles.verificationText}>Pending Verification</Text>
          </View>
        )}

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
    gap: moderateScale(16),
    padding: moderateScale(2),
  },
  cardContainer: {
    width: horizontalScale(340),
    backgroundColor: 'white',
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    //shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: verticalScale(180),
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
    paddingVertical: verticalScale(6),
    paddingHorizontal: horizontalScale(12),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    //shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gradeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: verticalScale(6),
    paddingHorizontal: horizontalScale(12),
    borderRadius: moderateScale(12),
     shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    //shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  boardText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(12),
    color: COLORS.primary,
  },
  gradeText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(12),
    color: COLORS.primary,
  },
  verificationBadge: {
    position: 'absolute',
    top: verticalScale(60),
    left: horizontalScale(16),
    backgroundColor: '#FFA000',
    paddingVertical: verticalScale(6),
    paddingHorizontal: horizontalScale(12),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 2,
    elevation: 2,
    zIndex: 2,
  },
  verificationText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(12),
    color: 'white',
  },
  priceTag: {
    position: 'absolute',
    bottom: verticalScale(16),
    right: horizontalScale(16),
    backgroundColor: COLORS.primary,
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(16),
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
    padding: moderateScale(20),
  },
  subjectName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A4C6E',
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(30),
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: verticalScale(12),
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
    fontSize: moderateScale(12),
    color: '#6B7280',
    marginBottom: verticalScale(4),
  },
  detailValue: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(14),
    color: '#1A4C6E',
  },
});

export default SubjectCards;
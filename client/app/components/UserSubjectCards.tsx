import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { FONT } from '../../constants/theme';
import CoverImage from './CoverImage';

const formatPrice = (subjectPrice) => {
  if (subjectPrice == null || Number.isNaN(Number(subjectPrice))) return null;
  return `AED ${Number(subjectPrice) / 100}`;
};

const UserSubjectCards = ({ subjectData, handleItemPress, isHorizontal }) => {
  const renderSubjectCard = ({ item }) => {
    const subject = item.subject;
    const price = formatPrice(subject?.subjectPrice);

    return (
      <TouchableOpacity
        onPress={() => handleItemPress(subject)}
        style={[styles.card, isHorizontal && styles.horizontalCard]}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={subject?.subjectName}
      >
        <CoverImage uri={subject?.subjectImage} style={styles.cover} />

        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text style={styles.meta} numberOfLines={1}>
              {[subject?.subjectBoard, subject?.subjectGrade != null ? `Grade ${subject.subjectGrade}` : null]
                .filter(Boolean)
                .join(' · ')}
            </Text>
            {price ? <Text style={styles.price}>{price}</Text> : null}
          </View>

          <Text style={styles.subjectName} numberOfLines={2}>
            {subject?.subjectName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={subjectData}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderSubjectCard}
      horizontal={isHorizontal}
      scrollEnabled={isHorizontal}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    gap: verticalScale(12),
    paddingBottom: verticalScale(8),
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    overflow: 'hidden',
    minHeight: verticalScale(108),
  },
  cover: {
    width: horizontalScale(128),
  },
  horizontalCard: {
    width: horizontalScale(320),
    marginRight: horizontalScale(12),
  },
  body: {
    flex: 1,
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(12),
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: horizontalScale(8),
  },
  meta: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#1A4C6E',
  },
  price: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(13),
    color: '#12263A',
  },
  subjectName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#12263A',
    lineHeight: moderateScale(22),
    marginTop: verticalScale(6),
  },
});

export default UserSubjectCards;

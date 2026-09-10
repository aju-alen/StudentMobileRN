import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { FONT } from '../../constants/theme';
import { COLORS } from '../../constants';
import CoverImage from './CoverImage';

const formatPrice = (subjectPrice) => {
  if (subjectPrice == null || Number.isNaN(Number(subjectPrice))) return null;
  return `AED ${Number(subjectPrice) / 100}`;
};

const SubjectCards = ({ subjectData, handleItemPress, isHorizontal }) => {
  const renderSubjectCard = ({ item }) => {
    const price = formatPrice(item?.subjectPrice);

    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        style={[styles.card, isHorizontal && styles.horizontalCard]}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={item?.subjectName}
      >
        <CoverImage uri={item?.subjectImage} style={styles.cover} />

        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text style={styles.meta} numberOfLines={1}>
              {[item?.subjectBoard, item?.subjectGrade != null ? `Grade ${item.subjectGrade}` : null]
                .filter(Boolean)
                .join(' · ')}
            </Text>
            {price ? <Text style={styles.price}>{price}</Text> : null}
          </View>

          <Text style={styles.subjectName} numberOfLines={2}>
            {item?.subjectName}
          </Text>

          <View style={styles.footer}>
            {item?.user?.name ? (
              <Text style={styles.tutor} numberOfLines={1}>
                {item.user.name}
              </Text>
            ) : (
              <View style={styles.detailPair}>
                {item?.subjectDuration != null && (
                  <Text style={styles.detail}>{item.subjectDuration} hrs</Text>
                )}
                {!!item?.subjectLanguage && (
                  <Text style={styles.detail}>{item.subjectLanguage}</Text>
                )}
              </View>
            )}
            {!item?.subjectVerification && (
              <Text style={styles.pending}>Pending verification</Text>
            )}
          </View>
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
    borderRadius: moderateScale(16),
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
    color: COLORS.primary,
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
  footer: {
    marginTop: verticalScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: horizontalScale(8),
  },
  tutor: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#5C6B76',
  },
  detailPair: {
    flex: 1,
    flexDirection: 'row',
    gap: horizontalScale(10),
  },
  detail: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#5C6B76',
  },
  pending: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(11),
    color: '#B45309',
  },
});

export default SubjectCards;

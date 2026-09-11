import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { FONT } from '../../constants/theme';
import CoverImage from './CoverImage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.min(horizontalScale(268), SCREEN_WIDTH * 0.72);
const META_INSET = 16;
const GRADE_RESERVE = 82;

const HorizontalSubjectCard = ({ subjectData, handleItemPress, isHorizontal }) => {
  const renderSubjectCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleItemPress(item)}
      activeOpacity={0.88}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${item?.subjectName}, ${item?.subjectBoard}, Grade ${item?.subjectGrade}`}
    >
      <CoverImage uri={item?.subjectImage}>
        <View style={styles.metaRow}>
          {!!item?.subjectBoard && (
            <View
              style={[
                styles.chip,
                {
                  maxWidth:
                    item?.subjectGrade != null && item?.subjectGrade !== ''
                      ? CARD_WIDTH - META_INSET - GRADE_RESERVE
                      : CARD_WIDTH - META_INSET,
                },
              ]}
            >
              <Text style={styles.chipText} numberOfLines={1}>
                {item.subjectBoard}
              </Text>
            </View>
          )}
          {item?.subjectGrade != null && item?.subjectGrade !== '' && (
            <View style={[styles.chip, styles.gradeChip]}>
              <Text style={styles.chipText} numberOfLines={1}>
                Grade {item.subjectGrade}
              </Text>
            </View>
          )}
        </View>
      </CoverImage>

      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.subjectName}>
          {item?.subjectName}
        </Text>
        <Text numberOfLines={1} style={styles.tutorName}>
          {item?.user?.name || 'Tutor'}
        </Text>
        {item?.maxCapacity > 1 && (
          <Text style={styles.enrollment}>
            {(item?.currentEnrollment ?? 0)} / {item.maxCapacity} enrolled
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={subjectData}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderSubjectCard}
      horizontal={isHorizontal}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      snapToInterval={CARD_WIDTH + horizontalScale(12)}
      decelerationRate="fast"
      snapToAlignment="start"
    />
  );
};

export default HorizontalSubjectCard;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(4),
  },
  card: {
    width: CARD_WIDTH,
    marginRight: horizontalScale(12),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(18),
    borderWidth: 1,
    borderColor: '#E6EBF0',
    overflow: 'hidden',
  },
  metaRow: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    flexShrink: 1,
    minWidth: 0,
    backgroundColor: 'rgba(18, 38, 58, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minHeight: 22,
    justifyContent: 'center',
  },
  gradeChip: {
    flexShrink: 0,
  },
  chipText: {
    fontFamily: FONT.medium,
    fontSize: SCREEN_WIDTH < 375 ? 10 : 11,
    color: '#FFFFFF',
  },
  body: {
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(12),
    minHeight: verticalScale(88),
  },
  subjectName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#12263A',
    lineHeight: moderateScale(22),
  },
  tutorName: {
    marginTop: verticalScale(6),
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#5C6B76',
  },
  enrollment: {
    marginTop: verticalScale(6),
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#1F8A4C',
  },
});

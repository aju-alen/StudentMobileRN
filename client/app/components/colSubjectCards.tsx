import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { FONT } from '../../constants/theme';
import CoverImage from './CoverImage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PAD = horizontalScale(20);
const GAP = horizontalScale(12);
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - GAP) / 2;

const ColumnSubjectCards = ({ subjectData, handleItemPress, isHorizontal }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleItemPress(item)}
      style={styles.card}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${item?.subjectName}, ${item?.subjectBoard}, Grade ${item?.subjectGrade}`}
    >
      <CoverImage uri={item?.subjectImage} />
      <View style={styles.body}>
        <Text style={styles.meta} numberOfLines={1}>
          {[item?.subjectBoard, item?.subjectGrade != null ? `Grade ${item.subjectGrade}` : null]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        <Text style={styles.subjectName} numberOfLines={2}>
          {item?.subjectName}
        </Text>
        <Text style={styles.tutorName} numberOfLines={1}>
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
      renderItem={renderItem}
      horizontal={isHorizontal}
      scrollEnabled={false}
      numColumns={isHorizontal ? 1 : 2}
      columnWrapperStyle={isHorizontal ? undefined : styles.columnWrapper}
      contentContainerStyle={styles.list}
    />
  );
};

export default ColumnSubjectCards;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: H_PAD,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E6EBF0',
    overflow: 'hidden',
  },
  body: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(10),
    minHeight: verticalScale(92),
  },
  meta: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(11),
    color: '#1A4C6E',
    marginBottom: verticalScale(4),
  },
  subjectName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: '#12263A',
    lineHeight: moderateScale(19),
    minHeight: verticalScale(38),
  },
  tutorName: {
    marginTop: verticalScale(4),
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#5C6B76',
  },
  enrollment: {
    marginTop: verticalScale(4),
    fontFamily: FONT.medium,
    fontSize: moderateScale(11),
    color: '#1F8A4C',
  },
});

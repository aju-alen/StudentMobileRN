import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { FONT } from '../../constants/theme';
import { COLORS } from '../../constants';
import CoverImage from './CoverImage';

const formatPrice = (subjectPrice) => {
  if (subjectPrice == null || Number.isNaN(Number(subjectPrice))) return null;
  return `AED ${Number(subjectPrice) / 100}`;
};

const SubjectCards = ({
  subjectData,
  handleItemPress,
  isHorizontal,
  interactive = true,
  isOwner = false,
  onEdit,
  onResubmit,
  resubmittingId,
}) => {
  const renderSubjectCard = ({ item }) => {
    const price = formatPrice(item?.subjectPrice);
    const isRejected = Boolean(item?.rejectedAt);
    const isPending = !item?.subjectVerification && !isRejected;
    const ownerNeedsAction = isOwner && isRejected;
    const Wrapper = interactive && !ownerNeedsAction ? TouchableOpacity : View;
    const wrapperProps = interactive && !ownerNeedsAction
      ? {
          onPress: () => handleItemPress(item),
          activeOpacity: 0.88,
          accessibilityRole: 'button' as const,
          accessibilityLabel: item?.subjectName,
        }
      : {
          accessibilityLabel: item?.subjectName,
        };

    return (
      <Wrapper
        {...wrapperProps}
        style={[styles.card, isHorizontal && styles.horizontalCard]}
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
                  <Text style={styles.detail} numberOfLines={1}>
                    {item.subjectLanguage}
                  </Text>
                )}
              </View>
            )}
            {isRejected ? (
              <Text style={styles.rejected}>Rejected</Text>
            ) : isPending ? (
              <Text style={styles.pending}>Pending verification</Text>
            ) : null}
          </View>

          {isOwner && isRejected && item?.rejectionReason ? (
            <Text style={styles.reason} numberOfLines={3}>
              {item.rejectionReason}
            </Text>
          ) : null}

          {isOwner && isRejected ? (
            <View style={styles.ownerActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => onEdit?.(item)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              {isRejected ? (
                <TouchableOpacity
                  style={styles.resubmitButton}
                  onPress={() => onResubmit?.(item)}
                  disabled={resubmittingId === item.id}
                >
                  {resubmittingId === item.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.resubmitButtonText}>Resubmit</Text>
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
      </Wrapper>
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
    gap: verticalScale(4),
  },
  tutor: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#5C6B76',
  },
  detailPair: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(10),
  },
  detail: {
    flexShrink: 1,
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#5C6B76',
  },
  pending: {
    alignSelf: 'flex-start',
    fontFamily: FONT.medium,
    fontSize: moderateScale(11),
    color: '#B45309',
  },
  rejected: {
    alignSelf: 'flex-start',
    fontFamily: FONT.medium,
    fontSize: moderateScale(11),
    color: '#B91C1C',
  },
  reason: {
    marginTop: verticalScale(8),
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#7F1D1D',
    lineHeight: moderateScale(16),
  },
  ownerActions: {
    flexDirection: 'row',
    gap: horizontalScale(8),
    marginTop: verticalScale(10),
  },
  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1A2B4B',
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(8),
    alignItems: 'center',
  },
  editButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#1A2B4B',
  },
  resubmitButton: {
    flex: 1,
    backgroundColor: '#1A2B4B',
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(32),
  },
  resubmitButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#FFFFFF',
  },
});

export default SubjectCards;

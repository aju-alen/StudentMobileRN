import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { FONT } from '../../constants';

interface CourseTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSingle: () => void;
  onSelectMulti: () => void;
  onSelectSinglePackage: () => void;
  onSelectMultiPackage: () => void;
  isMultiStudentSubscribed?: boolean;
  isSinglePackageSubscribed?: boolean;
  isMultiPackageSubscribed?: boolean;
  hasSingleStudentDraft?: boolean;
  hasMultiStudentDraft?: boolean;
  hasSinglePackageDraft?: boolean;
  hasMultiPackageDraft?: boolean;
}

const CourseTypeModal: React.FC<CourseTypeModalProps> = ({
  visible,
  onClose,
  onSelectSingle,
  onSelectMulti,
  onSelectSinglePackage,
  onSelectMultiPackage,
  isMultiStudentSubscribed = false,
  isSinglePackageSubscribed = false,
  isMultiPackageSubscribed = false,
  hasSingleStudentDraft = false,
  hasMultiStudentDraft = false,
  hasSinglePackageDraft = false,
  hasMultiPackageDraft = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Course Type</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.subtitle}>
              Choose how you want to teach: quick 1–2 hour live sessions or longer 3–20 hour packages.
            </Text>

            <View style={styles.optionsContainer}>
              <Text style={styles.sectionLabel}>Quick live sessions (1–2 hours)</Text>

              {/* Single Student Option */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  onSelectSingle();
                  onClose();
                }}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name="person" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.planTypeFree}>Free plan</Text>
                <Text style={styles.optionTitle}>Single Student (1–2h Live)</Text>
                <Text style={styles.optionDescription}>
                  Teach one student in a single live session. Choose between 1–2 hours. No subscription required.
                </Text>
                {hasSingleStudentDraft && (
                  <View style={styles.draftBadge}>
                    <Text style={styles.draftBadgeText}>Draft saved</Text>
                  </View>
                )}
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              </TouchableOpacity>

              {/* Multi Student Option */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  onSelectMulti();
                  onClose();
                }}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name="people" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.planTypePremium}>
                  {isMultiStudentSubscribed ? 'Subscribed plan' : 'Premium plan'}
                </Text>
                <Text style={styles.optionTitle}>Multi Student (1–2h Live)</Text>
                <Text style={styles.optionDescription}>
                  Teach many students together in one live session (1–2 hours). Requires subscription.
                </Text>
                {hasMultiStudentDraft && (
                  <View style={styles.draftBadge}>
                    <Text style={styles.draftBadgeText}>Draft saved</Text>
                  </View>
                )}
                {isMultiStudentSubscribed ? (
                  <View style={styles.subscribedBadge}>
                    <Text style={styles.subscribedBadgeText}>SUBSCRIBED</Text>
                  </View>
                ) : (
                  <View style={styles.premiumBadge}>
                    <Ionicons name="lock-closed" size={12} color="#FFA500" />
                    <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.sectionLabelPackages}>
                Course packages (3–20 hours)
              </Text>

              {/* Single Course Package Option */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  onSelectSinglePackage();
                  onClose();
                }}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name="person" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.planTypePremium}>
                  {isSinglePackageSubscribed ? 'Subscribed plan' : 'Premium plan'}
                </Text>
                <Text style={styles.optionTitle}>Single Student Package (3–20h)</Text>
                <Text style={styles.optionDescription}>
                  Create a package for one student between 3–20 total hours. You set the topics and hours per topic (max 3h each). Student chooses when to book sessions.
                </Text>
                {hasSinglePackageDraft && (
                  <View style={styles.draftBadge}>
                    <Text style={styles.draftBadgeText}>Draft saved</Text>
                  </View>
                )}
                {isSinglePackageSubscribed ? (
                  <View style={styles.subscribedBadge}>
                    <Text style={styles.subscribedBadgeText}>SUBSCRIBED</Text>
                  </View>
                ) : (
                  <View style={styles.premiumBadge}>
                    <Ionicons name="lock-closed" size={12} color="#FFA500" />
                    <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Multi Course Package Option */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  onSelectMultiPackage();
                  onClose();
                }}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name="people" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.planTypePremium}>
                  {isMultiPackageSubscribed ? 'Subscribed plan' : 'Premium plan'}
                </Text>
                <Text style={styles.optionTitle}>Multi Student Package (3–20h)</Text>
                <Text style={styles.optionDescription}>
                  Create a package for multiple students between 3–20 total hours. You set the topics and assign date & time for each (max 3h per topic).
                </Text>
                {hasMultiPackageDraft && (
                  <View style={styles.draftBadge}>
                    <Text style={styles.draftBadgeText}>Draft saved</Text>
                  </View>
                )}
                {isMultiPackageSubscribed ? (
                  <View style={styles.subscribedBadge}>
                    <Text style={styles.subscribedBadgeText}>SUBSCRIBED</Text>
                  </View>
                ) : (
                  <View style={styles.premiumBadge}>
                    <Ionicons name="lock-closed" size={12} color="#FFA500" />
                    <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: moderateScale(16),
    width: '100%',
    maxWidth: moderateScale(360),
    maxHeight: '80%',
    padding: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContent: {
    paddingBottom: verticalScale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  title: {
    fontSize: moderateScale(20),
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  closeButton: {
    padding: moderateScale(4),
  },
  subtitle: {
    fontSize: moderateScale(12),
    color: '#666',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  optionsContainer: {
    gap: verticalScale(10),
  },
  sectionLabel: {
    fontSize: moderateScale(12),
    fontFamily: FONT.bold,
    color: '#444',
    marginBottom: verticalScale(6),
  },
  sectionLabelPackages: {
    fontSize: moderateScale(12),
    fontFamily: FONT.bold,
    color: '#444',
    marginTop: verticalScale(14),
    marginBottom: verticalScale(6),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    paddingTop: verticalScale(10),
  },
  optionCard: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    backgroundColor: '#fafafa',
    position: 'relative',
  },
  optionIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  optionTitle: {
    fontSize: moderateScale(15),
    fontFamily: FONT.bold,
    color: COLORS.primary,
    marginBottom: verticalScale(4),
  },
  optionDescription: {
    fontSize: moderateScale(12),
    color: '#666',
    lineHeight: moderateScale(16),
    marginBottom: verticalScale(6),
  },
  planTypeFree: {
    fontSize: moderateScale(11),
    fontFamily: FONT.bold,
    color: '#4CAF50',
    marginBottom: verticalScale(4),
  },
  planTypePremium: {
    fontSize: moderateScale(11),
    fontFamily: FONT.bold,
    color: '#FFA500',
    marginBottom: verticalScale(4),
  },
  freeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(4),
  },
  freeBadgeText: {
    color: 'white',
    fontSize: moderateScale(10),
    fontFamily: FONT.bold,
    fontWeight: '700',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    gap: horizontalScale(4),
    marginTop: verticalScale(4),
  },
  subscribedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2F1',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(4),
  },
  subscribedBadgeText: {
    color: '#00796B',
    fontSize: moderateScale(10),
    fontFamily: FONT.bold,
    fontWeight: '700',
  },
  premiumBadgeText: {
    color: '#FFA500',
    fontSize: moderateScale(10),
    fontFamily: FONT.bold,
    fontWeight: '700',
  },
  draftBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(4),
  },
  draftBadgeText: {
    color: COLORS.primary,
    fontSize: moderateScale(10),
    fontFamily: FONT.bold,
    fontWeight: '700',
  },
});

export default CourseTypeModal;




import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
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
}

const CourseTypeModal: React.FC<CourseTypeModalProps> = ({
  visible,
  onClose,
  onSelectSingle,
  onSelectMulti,
  onSelectSinglePackage,
  onSelectMultiPackage,
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

          <Text style={styles.subtitle}>
            Select the type of course you want to create
          </Text>

          <View style={styles.optionsContainer}>
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
              <Text style={styles.optionTitle}>Single Student Course</Text>
              <Text style={styles.optionDescription}>
                One-on-one sessions with individual students. Hours cap at 2.
              </Text>
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
              <Text style={styles.optionTitle}>Multi Student Course</Text>
              <Text style={styles.optionDescription}>
                Host courses for multiple students at once. Hours cap at 2. Requires subscription.
              </Text>
              <View style={styles.premiumBadge}>
                <Ionicons name="lock-closed" size={12} color="#FFA500" />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
            </TouchableOpacity>

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
              <Text style={styles.optionTitle}>Single Course Package</Text>
              <Text style={styles.optionDescription}>
                Duration 3–20 hours. You set topics and hours per topic (max 3h each). Student chooses when to book.
              </Text>
              <View style={styles.premiumBadge}>
                <Ionicons name="lock-closed" size={12} color="#FFA500" />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
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
              <Text style={styles.optionTitle}>Multi Course Package</Text>
              <Text style={styles.optionDescription}>
                Duration 3–20 hours. You set topics and assign date & time for each (max 3h per topic).
              </Text>
              <View style={styles.premiumBadge}>
                <Ionicons name="lock-closed" size={12} color="#FFA500" />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
            </TouchableOpacity>
          </View>
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
    padding: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  optionsContainer: {
    gap: verticalScale(10),
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
    marginBottom: verticalScale(8),
  },
  freeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
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
  },
  premiumBadgeText: {
    color: '#FFA500',
    fontSize: moderateScale(10),
    fontFamily: FONT.bold,
    fontWeight: '700',
  },
});

export default CourseTypeModal;




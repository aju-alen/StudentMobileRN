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
}

const CourseTypeModal: React.FC<CourseTypeModalProps> = ({
  visible,
  onClose,
  onSelectSingle,
  onSelectMulti,
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
              <Ionicons name="close" size={24} color={COLORS.primary} />
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
                <Ionicons name="person" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.optionTitle}>Single Student Course</Text>
              <Text style={styles.optionDescription}>
                One-on-one sessions with individual students. Free to create.
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
                <Ionicons name="people" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.optionTitle}>Multi Student Course</Text>
              <Text style={styles.optionDescription}>
                Host courses for multiple students at once. Requires subscription.
              </Text>
              <View style={styles.premiumBadge}>
                <Ionicons name="lock-closed" size={16} color="#FFA500" />
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
    borderRadius: moderateScale(20),
    width: '100%',
    maxWidth: moderateScale(400),
    padding: moderateScale(24),
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
    marginBottom: verticalScale(12),
  },
  title: {
    fontSize: moderateScale(24),
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  closeButton: {
    padding: moderateScale(4),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#666',
    marginBottom: verticalScale(24),
    textAlign: 'center',
  },
  optionsContainer: {
    gap: verticalScale(16),
  },
  optionCard: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    backgroundColor: '#fafafa',
    position: 'relative',
  },
  optionIconContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  optionTitle: {
    fontSize: moderateScale(18),
    fontFamily: FONT.bold,
    color: COLORS.primary,
    marginBottom: verticalScale(8),
  },
  optionDescription: {
    fontSize: moderateScale(14),
    color: '#666',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(12),
  },
  freeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
  },
  freeBadgeText: {
    color: 'white',
    fontSize: moderateScale(12),
    fontFamily: FONT.bold,
    fontWeight: '700',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
    gap: horizontalScale(6),
  },
  premiumBadgeText: {
    color: '#FFA500',
    fontSize: moderateScale(12),
    fontFamily: FONT.bold,
    fontWeight: '700',
  },
});

export default CourseTypeModal;




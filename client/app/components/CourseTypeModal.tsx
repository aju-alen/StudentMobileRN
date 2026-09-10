import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../utils/metrics';
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

type Audience = 'one' | 'group';
type Format = 'session' | 'package';

const ChoiceCard = ({
  icon,
  title,
  subtitle,
  badge,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  badge?: string;
  selected?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.choiceCard, selected && styles.choiceCardSelected]}
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    <View style={styles.choiceIcon}>
      <Ionicons name={icon} size={22} color="#1A4C6E" />
    </View>
    <View style={styles.choiceCopy}>
      <Text style={styles.choiceTitle}>{title}</Text>
      <Text style={styles.choiceSubtitle}>{subtitle}</Text>
      {!!badge && <Text style={styles.choiceBadge}>{badge}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={18} color="#5C6B76" />
  </TouchableOpacity>
);

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
  const insets = useSafeAreaInsets();
  const [audience, setAudience] = useState<Audience | null>(null);

  useEffect(() => {
    if (!visible) setAudience(null);
  }, [visible]);

  const finish = (format: Format) => {
    if (audience === 'one' && format === 'session') onSelectSingle();
    if (audience === 'group' && format === 'session') onSelectMulti();
    if (audience === 'one' && format === 'package') onSelectSinglePackage();
    if (audience === 'group' && format === 'package') onSelectMultiPackage();
    onClose();
  };

  const sessionDraft = audience === 'one' ? hasSingleStudentDraft : hasMultiStudentDraft;
  const packageDraft = audience === 'one' ? hasSinglePackageDraft : hasMultiPackageDraft;
  const packageUnlocked = audience === 'one' ? isSinglePackageSubscribed : isMultiPackageSubscribed;
  const groupSessionUnlocked = isMultiStudentSubscribed;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            {audience ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setAudience(null)}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <Ionicons name="chevron-back" size={22} color="#12263A" />
              </TouchableOpacity>
            ) : (
              <View style={styles.iconButton} />
            )}
            <Text style={styles.stepLabel}>{audience ? 'Step 2 of 2' : 'Step 1 of 2'}</Text>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color="#12263A" />
            </TouchableOpacity>
          </View>

          {!audience ? (
            <>
              <Text style={styles.title}>Who is this course for?</Text>
              <Text style={styles.subtitle}>Pick one. You can create another course later.</Text>
              <ChoiceCard
                icon="person-outline"
                title="One student"
                subtitle="Private 1-on-1 teaching"
                badge={hasSingleStudentDraft || hasSinglePackageDraft ? 'Draft saved' : undefined}
                onPress={() => setAudience('one')}
              />
              <ChoiceCard
                icon="people-outline"
                title="A group"
                subtitle="Several students in the same class"
                badge={hasMultiStudentDraft || hasMultiPackageDraft ? 'Draft saved' : undefined}
                onPress={() => setAudience('group')}
              />
            </>
          ) : (
            <>
              <Text style={styles.title}>How do you want to teach?</Text>
              <Text style={styles.subtitle}>
                {audience === 'one' ? 'For one student' : 'For a group'}
              </Text>
              <ChoiceCard
                icon="time-outline"
                title="One live class"
                subtitle="1–2 hours, taught in a single session"
                badge={
                  audience === 'one'
                    ? (sessionDraft ? 'Draft saved · Free' : 'Free')
                    : (sessionDraft
                      ? `Draft saved · ${groupSessionUnlocked ? 'Unlocked' : 'Paid plan'}`
                      : (groupSessionUnlocked ? 'Unlocked' : 'Paid plan'))
                }
                onPress={() => finish('session')}
              />
              <ChoiceCard
                icon="calendar-outline"
                title="A series of classes"
                subtitle="3–20 hours, split into topics"
                badge={
                  packageDraft
                    ? `Draft saved · ${packageUnlocked ? 'Unlocked' : 'Paid plan'}`
                    : (packageUnlocked ? 'Unlocked' : 'Paid plan')
                }
                onPress={() => finish('package')}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 38, 58, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    backgroundColor: '#F4F6F8',
    borderRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#5C6B76',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(22),
    color: '#12263A',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#5C6B76',
    marginBottom: 16,
    lineHeight: 20,
  },
  choiceCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: 12,
    marginBottom: 10,
  },
  choiceCardSelected: {
    borderColor: '#1A4C6E',
  },
  choiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF3F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  choiceTitle: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(16),
    color: '#12263A',
  },
  choiceSubtitle: {
    marginTop: 2,
    fontFamily: FONT.regular,
    fontSize: moderateScale(13),
    color: '#5C6B76',
  },
  choiceBadge: {
    marginTop: 6,
    fontFamily: FONT.medium,
    fontSize: moderateScale(11),
    color: '#1A4C6E',
  },
});

export default CourseTypeModal;

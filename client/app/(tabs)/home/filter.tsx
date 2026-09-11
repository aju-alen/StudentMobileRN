import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { COLORS, FONT } from '../../../constants';
import { horizontalScale, verticalScale, moderateScale } from '../../utils/metrics';
import { SafeAreaView } from "react-native-safe-area-context";

const Filter = () => {
  const [grade, setGrade] = React.useState('');
  const [board, setBoard] = React.useState('');
  const [tags, setTags] = React.useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={24} color="#12263A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Advanced search</Text>
          <View style={styles.closeButton} />
        </View>

        <View style={styles.searchSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Grade</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input}
                placeholder="Enter grade (e.g., 10, 11, 12)"
                placeholderTextColor="#999"
                value={grade}
                onChangeText={setGrade}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Curricula</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input}
                placeholder="Enter curricula (e.g., CBSE, ICSE)"
                placeholderTextColor="#999"
                value={board}
                onChangeText={setBoard}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Subject Tags</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input}
                placeholder="Enter subjects (e.g., Maths, Science)"
                placeholderTextColor="#999"
                value={tags}
                onChangeText={setTags}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => {
            router.replace({
              pathname: "/(tabs)/home/allSubject",
              params: {
                ...(grade && { subjectGrade: grade }),
                ...(board && { subjectBoard: board }),
                ...(tags && { subjectTags: tags }),
              },
            });
          }}
        >
          <Text style={styles.searchButtonText}>Search Courses</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Filter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(30),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(12),
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(10),
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#12263A',
  },
  searchSection: {
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(8),
  },
  inputContainer: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#12263A',
    marginBottom: verticalScale(8),
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    paddingHorizontal: horizontalScale(15),
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6EBF0',
  },
  input: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(16),
    color: '#12263A',
    height: 48,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(14),
    minHeight: 52,
    paddingHorizontal: horizontalScale(20),
    marginHorizontal: horizontalScale(20),
    marginTop: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    marginRight: horizontalScale(10),
  },
});
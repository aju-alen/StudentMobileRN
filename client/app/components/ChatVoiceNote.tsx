import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { FONT } from '../../constants';
import { moderateScale } from '../utils/metrics';

const formatDuration = (ms?: number) => {
  const total = Math.max(0, Math.round((ms || 0) / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const ChatVoiceNote = ({
  uri,
  durationMs,
  isOwn,
}: {
  uri?: string;
  durationMs?: number;
  isOwn?: boolean;
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const toggle = async () => {
    if (!uri) return;
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await sound.pauseAsync();
          setPlaying(false);
          return;
        }
        await sound.playAsync();
        setPlaying(true);
        return;
      }
      setLoading(true);
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false });
      const { sound: next } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      next.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        setPlaying(status.isPlaying);
        if (status.didJustFinish) {
          setPlaying(false);
        }
      });
      setSound(next);
      setPlaying(true);
    } catch (error) {
      console.error('Voice note playback failed', error);
    } finally {
      setLoading(false);
    }
  };

  const color = isOwn ? '#FFFFFF' : '#1A4C6E';

  return (
    <TouchableOpacity style={styles.row} onPress={toggle} accessibilityRole="button" accessibilityLabel="Play voice note">
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Ionicons name={playing ? 'pause' : 'play'} size={18} color={color} />
      )}
      <View style={styles.copy}>
        <Text style={[styles.label, isOwn && styles.labelOwn]}>Voice note</Text>
        <Text style={[styles.time, isOwn && styles.timeOwn]}>{formatDuration(durationMs)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    minWidth: 160,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  copy: {
    flex: 1,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#12263A',
  },
  labelOwn: {
    color: '#FFFFFF',
  },
  time: {
    marginTop: 2,
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#5C6B76',
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.75)',
  },
});

export default ChatVoiceNote;

import * as React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, DeviceEventEmitter } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native'; // to detect focus/unfocus

const { width } = Dimensions.get('window');

interface VideoPlayerProps {
  videoUrl: string;
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});
  const [isPaused, setIsPaused] = React.useState(false);
  const id = React.useMemo(() => videoUrl, [videoUrl]);

  React.useEffect(() => {
    // Listen for other videos starting playback so we can pause this one
    const subscription = DeviceEventEmitter.addListener('VIDEO_PLAY', (payload) => {
      if (payload?.id !== id && video.current) {
        // Pause this video if another one started playing
        video.current.pauseAsync();
      }
    });

    return () => {
      if (video.current) {
        video.current.stopAsync();
      }
      subscription.remove();
    };
  }, [id]);

  // Stop video playback when screen is unfocused
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (video.current) {
          video.current.stopAsync();
        }
      };
    }, [])
  );

  // Handle play/pause toggle
  const togglePlayPause = () => {
    if (isPaused) {
      video.current.playAsync();
    } else {
      video.current.pauseAsync();
    }
    setIsPaused(!isPaused);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: videoUrl,
        }}
        useNativeControls
        resizeMode={ResizeMode.COVER}
        isLooping
        onPlaybackStatusUpdate={playbackStatus => {
          setStatus(playbackStatus);
          // When this video starts playing, notify others to pause
          if (playbackStatus.isLoaded && playbackStatus.isPlaying) {
            DeviceEventEmitter.emit('VIDEO_PLAY', { id });
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.8,
    height: 200,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

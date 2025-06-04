import * as React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
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

  React.useEffect(() => {
    return () => {
      if (video.current) {
        video.current.stopAsync();
      }
    };
  }, []);

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
        onPlaybackStatusUpdate={status => setStatus(status)}
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

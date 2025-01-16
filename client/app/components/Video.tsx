import * as React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native'; // to detect focus/unfocus

export default function VideoPlayer() {
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    console.log('mounting');
    
    return () => {
      // Stop video playback when the component unmounts
      console.log('unmounting');
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
          uri: 'https://coachacademic.s3.ap-southeast-1.amazonaws.com/VIDEO-2024-02-06-19-22-24+(1).mp4',
        }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onPlaybackStatusUpdate={status => setStatus(status)}
      />
      <View style={styles.controls}>
        <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
          <Text style={styles.buttonText}>{isPaused ? 'Play' : 'Pause'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    alignSelf: 'center',
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    opacity: 0.8,
  },
  buttonText: {
    fontFamily: 'Roboto',
    fontSize: 18,
    color: '#fff',
  },
});

import * as React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { verticalScale,horizontalScale } from '../utils/metrics';
import { Redirect } from 'expo-router';

export default function video() {
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});
  const [isPlaying, setIsPlaying] = React.useState(true);

  React.useEffect(() => {
    if (isPlaying) {
      video.current.playAsync();
    } else {
      video.current.pauseAsync();
    }
    setTimeout(() => {
        setIsPlaying(false);
        console.log('video ended');
        return(
            <Redirect href={'/(authenticate)/login'} />
        )
    }, 8000);
  }, []);

  return (
    
    <View style={styles.container}>
     {isPlaying? <Video
        ref={video}
        shouldPlay
        isMuted
        style={styles.video}
        source={{
          uri: 'https://coachacademic.s3.ap-southeast-1.amazonaws.com/splash.mp4',
        }}
        // useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onPlaybackStatusUpdate={status => setStatus(() => status)}
      />:(<Redirect href={'/(authenticate)/login'} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  video: {
    alignSelf: 'center',
    width: horizontalScale(500),
    height: verticalScale(810),
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

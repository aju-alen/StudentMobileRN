// import * as React from 'react';
// import { View, StyleSheet } from 'react-native';
// import { VideoView, useVideoPlayer } from 'expo-video';
// import { verticalScale,horizontalScale } from '../utils/metrics';
// import { Redirect } from 'expo-router';

// export default function video() {
//   const [isPlaying, setIsPlaying] = React.useState(true);
//   const player = useVideoPlayer('https://coachacademic.s3.ap-southeast-1.amazonaws.com/splash.mp4', (player) => {
//     player.loop = true;
//     player.muted = true;
//   });

//   React.useEffect(() => {
//     if (isPlaying) {
//       player.play();
//     } else {
//       player.pause();
//     }
//   }, [isPlaying, player]);

//   React.useEffect(() => {
//     const checkVideoEnd = setInterval(() => {
//       if (player.duration > 0 && player.currentTime >= player.duration) {
//         setIsPlaying(false);
//         console.log('video ended');
//         clearInterval(checkVideoEnd);
//       }
//     }, 100);

//     const timeout = setTimeout(() => {
//       setIsPlaying(false);
//       console.log('video ended');
//       clearInterval(checkVideoEnd);
//     }, 8000);

//     return () => {
//       clearInterval(checkVideoEnd);
//       clearTimeout(timeout);
//     };
//   }, [player]);

//   return (
    
//     <View style={styles.container}>
//      {isPlaying? <VideoView
//         player={player}
//         style={styles.video}
//         contentFit="contain"
//       />:(<Redirect href={'/(authenticate)/login'} />)}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: '#ffffff',
//   },
//   video: {
//     alignSelf: 'center',
//     width: horizontalScale(500),
//     height: verticalScale(810),
//   },
//   buttons: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

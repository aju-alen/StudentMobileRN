// import * as React from 'react';
// import { View, StyleSheet, Dimensions, DeviceEventEmitter } from 'react-native';
// import { VideoView, useVideoPlayer } from 'expo-video';
// import { useFocusEffect } from '@react-navigation/native'; // to detect focus/unfocus

// const { width } = Dimensions.get('window');

// // Module-level variable to track currently playing video
// let currentlyPlayingVideoId: string | null = null;
// const videoPlayers = new Map<string, { pause: () => void }>();

// interface VideoPlayerProps {
//   videoUrl: string;
// }

// export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
//   const id = React.useMemo(() => videoUrl, [videoUrl]);
//   const player = useVideoPlayer(videoUrl, (player) => {
//     player.loop = true;
//   });
  
//   // Safe helper to check if player is playing
//   const isPlayerPlaying = React.useCallback(() => {
//     try {
//       if (!player) return false;
//       // Access playing property with try-catch to handle native object errors
//       const playing = (player as any).playing;
//       return playing === true;
//     } catch (error) {
//       // If native object is not ready, return false
//       return false;
//     }
//   }, [player]);

//   // Safe helper to pause player
//   const safePause = React.useCallback(() => {
//     try {
//       if (player && isPlayerPlaying()) {
//         player.pause();
//       }
//     } catch (error) {
//       // Silently fail if player is not ready
//     }
//   }, [player, isPlayerPlaying]);

//   // Register this player in the global map
//   React.useEffect(() => {
//     videoPlayers.set(id, {
//       pause: safePause
//     });

//     return () => {
//       videoPlayers.delete(id);
//       if (currentlyPlayingVideoId === id) {
//         currentlyPlayingVideoId = null;
//       }
//     };
//   }, [id, safePause]);

//   // Listen for play requests from other videos
//   React.useEffect(() => {
//     const subscription = DeviceEventEmitter.addListener('VIDEO_PLAY_REQUEST', (payload) => {
//       if (payload?.id !== id && currentlyPlayingVideoId === id) {
//         // Another video wants to play, pause this one
//         safePause();
//         currentlyPlayingVideoId = null;
//       }
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, [id, safePause]);

//   // Monitor player.playing state and handle play/pause
//   const prevPlayingRef = React.useRef(false);
//   React.useEffect(() => {
//     if (!player) return;
    
//     const checkPlayingState = () => {
//       try {
//         const playing = isPlayerPlaying();
//         const wasPlaying = prevPlayingRef.current;
        
//         // Only act on state changes
//         if (playing !== wasPlaying) {
//           if (playing) {
//             // This video just started playing
//             if (currentlyPlayingVideoId !== id) {
//               // Pause all other videos first
//               videoPlayers.forEach((videoPlayer, videoId) => {
//                 if (videoId !== id) {
//                   videoPlayer.pause();
//                 }
//               });
//               // Emit event to notify others
//               DeviceEventEmitter.emit('VIDEO_PLAY_REQUEST', { id });
//               // Set this as the currently playing video
//               currentlyPlayingVideoId = id;
//             }
//           } else {
//             // This video stopped playing
//             if (currentlyPlayingVideoId === id) {
//               currentlyPlayingVideoId = null;
//             }
//           }
//           prevPlayingRef.current = playing;
//         }
//       } catch (error) {
//         // Silently handle errors if player is not ready
//       }
//     };
    
//     // Check state periodically to catch changes
//     const interval = setInterval(checkPlayingState, 100);
//     checkPlayingState(); // Check immediately
    
//     return () => {
//       clearInterval(interval);
//     };
//   }, [player, id, isPlayerPlaying]);

//   // Pause video playback when screen is unfocused
//   useFocusEffect(
//     React.useCallback(() => {
//       return () => {
//         safePause();
//       };
//     }, [safePause])
//   );

//   // Cleanup on unmount
//   React.useEffect(() => {
//     return () => {
//       safePause();
//       if (currentlyPlayingVideoId === id) {
//         currentlyPlayingVideoId = null;
//       }
//     };
//   }, [id, safePause]);

//   return (
//     <View style={styles.container}>
//       <VideoView
//         player={player}
//         style={styles.video}
//         nativeControls
//         contentFit="cover"
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     width: width * 0.8,
//     height: 200,
//     marginRight: 12,
//     borderRadius: 12,
//     overflow: 'hidden',
//     backgroundColor: '#000',
//   },
//   video: {
//     width: '100%',
//     height: '100%',
//   },
// });

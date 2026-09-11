import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Image } from 'expo-image';
import { COVER_ASPECT, COVER_BACKGROUND } from '../utils/coverImage';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

type CoverImageProps = {
  uri?: string | null;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  accessibilityLabel?: string;
};

const CoverImage = ({ uri, style, children, accessibilityLabel }: CoverImageProps) => (
  <View style={[styles.frame, style]}>
    {uri ? (
      <Image
        source={{ uri }}
        style={styles.image}
        placeholder={blurhash}
        contentFit="contain"
        transition={200}
        accessibilityLabel={accessibilityLabel || 'Course cover'}
      />
    ) : (
      <View style={styles.image} />
    )}
    {children}
  </View>
);

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: COVER_ASPECT,
    backgroundColor: COVER_BACKGROUND,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default CoverImage;

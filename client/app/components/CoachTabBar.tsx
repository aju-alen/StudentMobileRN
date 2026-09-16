import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE = '#1A4C6E';
const INACTIVE = '#8A97A3';
const ICON_SIZE = 26;

const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; idle: keyof typeof Ionicons.glyphMap }> = {
  home: { focused: 'grid', idle: 'grid-outline' },
  community: { focused: 'people', idle: 'people-outline' },
  chat: { focused: 'chatbubble-ellipses', idle: 'chatbubble-ellipses-outline' },
  profile: { focused: 'person-circle', idle: 'person-circle-outline' },
  verification: { focused: 'shield', idle: 'shield-outline' },
};

const getLabel = (options: BottomTabBarProps['descriptors'][string]['options'], routeName: string) => {
  if (typeof options.tabBarLabel === 'string') return options.tabBarLabel;
  if (typeof options.title === 'string') return options.title;
  return routeName.charAt(0).toUpperCase() + routeName.slice(1);
};

type CoachTabBarProps = BottomTabBarProps & { isAdmin?: boolean; isParent?: boolean };

const CoachTabBar = ({ state, descriptors, navigation, isAdmin = false, isParent = false }: CoachTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        if ((options as { href?: unknown }).href === null) return null;
        if (route.name === 'verification' && !isAdmin) return null;
        if (route.name === 'community' && isParent) return null;

        const focused = state.index === index;
        const color = focused ? ACTIVE : INACTIVE;
        const icons = TAB_ICONS[route.name] || { focused: 'ellipse', idle: 'ellipse-outline' };
        const label = getLabel(options, route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            if (Platform.OS !== 'web') {
              Haptics.selectionAsync();
            }
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.item}
            android_ripple={{ color: '#D7E3EC', borderless: true }}
          >
            <View style={[styles.iconWell, focused && styles.iconWellActive]}>
              <Ionicons
                name={focused ? icons.focused : icons.idle}
                size={ICON_SIZE}
                color={color}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E6EBF0',
    paddingTop: 6,
  },
  item: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  iconWell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWellActive: {
    backgroundColor: '#E8F0F5',
  },
});

export default CoachTabBar;

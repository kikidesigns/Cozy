import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';

export function ExternalLink(props: {
  href: string;
  children: React.ReactNode;
  style?: React.ComponentProps<typeof Link>['style'];
}) {
  return (
    <Link
      style={props.style}
      onPress={() => {
        if (Platform.OS !== 'web') {
          WebBrowser.openBrowserAsync(props.href);
        }
      }}
      href={props.href as any}
    >
      {props.children}
    </Link>
  );
}
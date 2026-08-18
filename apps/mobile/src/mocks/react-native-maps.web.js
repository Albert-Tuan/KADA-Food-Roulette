import React from 'react';
import { View, Text } from 'react-native';

export const MapView = React.forwardRef((props, ref) => (
  <View style={props.style} className={props.className}>
    {props.children}
  </View>
));

export const Marker = (props) => null;
export const Callout = (props) => null;
export const Polygon = (props) => null;
export const Polyline = (props) => null;
export const Circle = (props) => null;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

export default MapView;

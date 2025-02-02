import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleProp, TextStyle } from 'react-native';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  // Add other mappings as needed
} as const;

type IconName = keyof typeof MAPPING;

interface IconSymbolProps {
  name: IconName;
  color: string;
  size: number;
  style?: StyleProp<TextStyle>;
  weight?: 'medium' | 'regular' | 'bold'; // Added weight prop
}

export function IconSymbol({ name, color, size, style, weight }: IconSymbolProps) {
  return (
    <MaterialIcons 
      color={color} 
      size={size} 
      name={MAPPING[name]} 
      style={style as StyleProp<TextStyle>} 
    />
  );
}
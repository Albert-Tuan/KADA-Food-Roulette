import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export function Card({ children, variant = 'elevated', style, ...props }: CardProps) {
  const variantStyles = {
    elevated: {
      backgroundColor: '#ffffff', // Clean white surface
      borderWidth: 1,
      borderColor: '#e2bebc',
      shadowColor: '#b52330',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
    },
    outlined: {
      backgroundColor: '#fff8ef',
      borderWidth: 1.5,
      borderColor: '#e2bebc',
    },
    filled: {
      backgroundColor: '#fbf3e4',
      borderWidth: 1,
      borderColor: '#e9e2d3',
    },
  };

  return (
    <View style={[styles.card, variantStyles[variant], style]} {...props}>
      {children}
    </View>
  );
}

interface CardHeaderProps extends ViewProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action, style, ...props }: CardHeaderProps) {
  return (
    <View style={[styles.header, style]} {...props}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}

const styles = {
  card: {
    borderRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: '800' as const,
    color: '#b52330',
  },
  subtitle: {
    fontSize: 13,
    color: '#5a403f',
    marginTop: 3,
  },
};

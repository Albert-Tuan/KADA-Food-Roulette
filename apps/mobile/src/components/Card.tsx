import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export function Card({ children, variant = 'elevated', style, ...props }: CardProps) {
  const variantStyles = {
    elevated: {
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    outlined: {
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#E7E5E4',
    },
    filled: {
      backgroundColor: '#F5F5F4',
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
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}

const styles = {
  card: {
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#292524',
  },
  subtitle: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 4,
  },
};

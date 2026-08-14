import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: object;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const variantStyles = {
    primary: styles.primary,
    secondary: styles.secondary,
    outline: styles.outline,
    ghost: styles.ghost,
  };

  const sizeStyles = {
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
  };

  const textStyles = {
    primary: styles.textPrimary,
    secondary: styles.textSecondary,
    outline: styles.textOutline,
    ghost: styles.textGhost,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FDF5E6' : '#C68E17'}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.text, textStyles[variant]]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 999,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    fontWeight: '600',
  },
  // Variants according to Stitch Soft Red spec
  primary: {
    backgroundColor: '#b52330', // Brand Primary Red
    borderBottomWidth: 3,
    borderBottomColor: '#61000e', // Darker red 3D game press effect
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: '#fbf3e4', // Cream surface container low
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    borderBottomWidth: 3,
    borderBottomColor: '#8e706f',
  },
  outline: {
    borderWidth: 2,
    borderColor: '#b52330', // Primary Red border
    backgroundColor: '#fff8ef',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  // Sizes
  sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  md: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 18,
  },
  lg: {
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 22,
  },
  // Text colors
  textPrimary: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  textSecondary: {
    color: '#8e4e14',
    fontWeight: '800',
    fontSize: 15,
  },
  textOutline: {
    color: '#b52330',
    fontWeight: '800',
    fontSize: 15,
  },
  textGhost: {
    color: '#b52330',
    fontWeight: '700',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.5,
  },
});

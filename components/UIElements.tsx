import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { createThemeStyles } from '../utils/themeStyles';
import { useTheme } from '../hooks/use-theme';

interface PrimaryCardProps {
  children: React.ReactNode | undefined
  style?: StyleProp<ViewStyle>
}

const PrimaryCard = ({ children, style }: PrimaryCardProps) => {
  const theme = useTheme()
  const styles = createStyles(theme)
  return (
    <View style={[styles.primaryCard, style]}>
      {children}
    </View>
  )
}

const SecondaryCard = ({ children, style }: PrimaryCardProps) => {
  const theme = useTheme()
  const styles = createStyles(theme)
  return (
    <View style={[styles.secondaryCard, style]}>
      {children}
    </View>
  )
}

export { PrimaryCard, SecondaryCard };

function createStyles(theme: ReturnType<typeof useTheme>) {
  // Cards
  return createThemeStyles(theme, {
    primaryCard: {
      backgroundColor: theme.bgElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      padding: 16,
      marginBottom: 16,
    },
    secondaryCard: {
      backgroundColor: theme.backgroundSelected,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      padding: 16,
      marginBottom: 16,
    }
  })

  // Buttons
}
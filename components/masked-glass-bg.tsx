import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { MaskedView } from '@expo/ui/community/masked-view';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface MaskedGlassBGProps {
  style?: StyleProp<ViewStyle>
  isMasked?: boolean
}

const MaskedGlassBG = ({ style, isMasked = true }: MaskedGlassBGProps) => {
  const scheme = useColorScheme();
  const isLiquidable = isLiquidGlassAvailable()

  return (
    <MaskedView
      style={[{ position: "absolute", inset: 0 }, style]}
      maskElement={isMasked ? (
        <LinearGradient
          colors={['black', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "black" }]} />
      )}>
      {isLiquidable ? (
        <GlassView
          // tintColor={scheme === "dark" ? "#00000088" : "#fff"}
          style={{ flex: 1 }}
          glassEffectStyle={{
            style: "regular",
          }}
        />
      ) : (
        <BlurView
          tint={scheme === "dark" ? "dark" : "light"}
          style={{ flex: 1 }}
        />
      )}
    </MaskedView>
  )
}

export default MaskedGlassBG;
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet } from "react-native";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../theme";

/**
 * JS-side splash overlay shown while the JS bundle is bootstrapping.
 *
 * This complements the native splash from `expo-splash-screen` so the user
 * sees the same branded screen (water blue gradient + drop logo + brand text)
 * during the brief window between JS load and the first navigation render.
 */
export default function Splash() {
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslate, {
          toValue: 0,
          duration: 360,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [logoOpacity, logoScale, titleOpacity, titleTranslate]);

  return (
    <View style={styles.root} pointerEvents="none">
      <View style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.skyMid]} />

      <View style={styles.bubbleTL} />
      <View style={styles.bubbleTR} />
      <View style={styles.bubbleBL} />
      <View style={styles.bubbleBR} />

      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require("../../../assets/splash-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.titleWrap,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslate }],
          },
        ]}
      >
        <Text variant="headlineSmall" style={styles.title}>
          Cikaret Setra
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Pembayaran Air Bersih
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#d9f0fa",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  skyMid: {
    backgroundColor: "#bee5f4",
    opacity: 0.65,
  },
  bubbleTL: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  bubbleTR: {
    position: "absolute",
    top: 80,
    right: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  bubbleBL: {
    position: "absolute",
    bottom: 120,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  bubbleBR: {
    position: "absolute",
    bottom: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  logoWrap: {
    width: "70%",
    maxWidth: 320,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  titleWrap: {
    position: "absolute",
    bottom: "22%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  title: {
    color: colors.textPrimary,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
});

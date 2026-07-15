import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../theme";

/**
 * JS-side branded splash overlay shown while the JS bundle is bootstrapping.
 *
 * Rendered as a sibling of <RootNavigator /> inside <SafeAreaProvider>, with
 * an absolute wrapper in App.tsx so it sits on top of the navigator until the
 * app signals it's ready.
 *
 * Animations:
 *   - Logo fades in and gently scales up (fade-only first to avoid spring
 *     native-driver crashes seen on some Android release builds).
 *   - Title fades in shortly after.
 *   - When `visible` flips false the whole overlay fades out cleanly.
 */
export default function Splash({ visible = true }: { visible?: boolean }) {
  const [mounted, setMounted] = useState(visible);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(10)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
      return;
    }
    setMounted(true);
    // Logo: fade in + small scale, both with timing (spring is skipped to
    // avoid native-driver edge cases on Android release builds).
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    const titleTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslate, {
          toValue: 0,
          duration: 360,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 280);

    return () => clearTimeout(titleTimer);
  }, [logoOpacity, logoScale, titleOpacity, titleTranslate, overlayOpacity, visible]);

  if (!mounted) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.root, { opacity: overlayOpacity }]}
    >
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
          fadeDuration={0}
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
    </Animated.View>
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
    borderRadius: 160 / 2,
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

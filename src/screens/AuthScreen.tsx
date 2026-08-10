import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  // Pulse animation for the logo
  const pulseAnim = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = isLogin
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else if (!isLogin) {
      Alert.alert('Almost there! 🏔️', 'Check your email for a confirmation link, then sign in.');
      setIsLogin(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background layers */}
      <View style={styles.bgBase} />

      {/* Mountain silhouette shapes */}
      <View style={styles.mountainBg}>
        {/* Far mountain */}
        <View style={[styles.mountain, { left: -40, bottom: 0, width: 300, height: 200, backgroundColor: 'rgba(15,23,42,1)', transform: [{ skewX: '20deg' }] }]} />
        {/* Mid mountain */}
        <View style={[styles.mountain, { right: -30, bottom: 0, width: 280, height: 240, backgroundColor: 'rgba(10,16,35,1)', transform: [{ skewX: '-15deg' }] }]} />
        {/* Front mountain */}
        <View style={[styles.mountain, { left: 20, bottom: 0, width: 240, height: 160, backgroundColor: 'rgba(8,13,28,1)', transform: [{ skewX: '10deg' }] }]} />
      </View>

      {/* Stars */}
      {[...Array(20)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              top: Math.random() * (height * 0.4),
              left: Math.random() * width,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              opacity: 0.3 + Math.random() * 0.5,
            },
          ]}
        />
      ))}

      {/* Glow behind logo */}
      <View style={styles.logoGlow} />

      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Animated.View style={[styles.logoOrb, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.logoIcon}>⛰️</Text>
          </Animated.View>
          <Text style={styles.appName}>PrecisionTrack</Text>
          <Text style={styles.tagline}>NAVIGATE · CLIMB · CONQUER</Text>
          <View style={styles.taglineLine} />
        </View>

        {/* Auth Card */}
        <View style={styles.card}>
          {/* Tab switcher */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.tabActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.tabActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="rgba(255,255,255,0.2)"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.2)"
                secureTextEntry
                autoComplete="password"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.ctaBtn, loading && { opacity: 0.7 }]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.ctaBtnText}>
                  {isLogin ? 'Begin Expedition' : 'Join the Climb'}
                </Text>
                <Text style={styles.ctaBtnArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Footer note */}
          <Text style={styles.footerNote}>
            {isLogin
              ? 'No account? '
              : 'Already tracking? '}
            <Text
              style={styles.footerLink}
              onPress={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </Text>
          </Text>
        </View>

        {/* Feature pills */}
        <View style={styles.pillsRow}>
          {['⛰️ Offline Maps', '📍 ArcGIS GPS', '🏔️ Climb Tracker'].map((p) => (
            <View key={p} style={styles.pill}>
              <Text style={styles.pillText}>{p}</Text>
            </View>
          ))}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060912' },

  bgBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#060912',
  },

  mountainBg: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 260,
    overflow: 'hidden',
  },

  mountain: {
    position: 'absolute',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 80,
  },

  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 50,
  },

  logoGlow: {
    position: 'absolute',
    top: height * 0.12,
    alignSelf: 'center',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59,130,246,0.06)',
  },

  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
  },

  // ── Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoOrb: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(30,58,138,0.5)',
    borderWidth: 1.5,
    borderColor: 'rgba(96,165,250,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  logoIcon: { fontSize: 44 },
  appName: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60a5fa',
    letterSpacing: 3,
    marginTop: 6,
  },
  taglineLine: {
    width: 40,
    height: 1.5,
    backgroundColor: '#3b82f6',
    marginTop: 10,
    borderRadius: 2,
  },

  // ── Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },

  // ── Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 22,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: 'rgba(59,130,246,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.3)',
  },
  tabText: { color: '#4b5563', fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: '#60a5fa' },

  // ── Fields
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4b5563',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 14,
  },

  // ── CTA
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    paddingVertical: 18,
    marginTop: 4,
    gap: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.3)',
  },
  ctaBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ctaBtnArrow: { color: '#93c5fd', fontSize: 18, fontWeight: '900' },

  // ── Footer
  footerNote: {
    textAlign: 'center',
    color: '#4b5563',
    fontSize: 13,
    marginTop: 16,
  },
  footerLink: { color: '#60a5fa', fontWeight: '700' },

  // ── Feature pills
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
});

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
  StatusBar, Dimensions, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Record your\nown routes',
    subtitle: 'Use GPS and compass to capture your trek, even without a signal.',
    step: '1/3',
    pinIcon: 'location' as const,
  },
  {
    title: 'Explore trusted\nroutes',
    subtitle: 'Find treks, view maps and terrain, and follow with confidence.',
    step: '2/3',
    pinIcon: 'compass' as const,
  },
  {
    title: 'Share your\njourney',
    subtitle: 'Save, publish and help the community grow.',
    step: '3/3',
    pinIcon: 'share-social' as const,
  },
];

export default function AuthScreen() {
  const [phase, setPhase] = useState<'onboarding' | 'auth'>('onboarding');
  const [slide, setSlide] = useState(0);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { signIn, signUp } = useAuth();

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
    if (error) Alert.alert('Error', error.message);
  };

  if (phase === 'onboarding') {
    const current = SLIDES[slide];
    const isLast = slide === SLIDES.length - 1;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F2ED" />

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <Text style={styles.stepText}>{current.step}</Text>
          <TouchableOpacity onPress={() => setPhase('auth')}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Illustration */}
        <View style={styles.illustrationBox}>
          <View style={styles.mountainIllustration}>
            {/* Simple geometric mountain shapes */}
            <View style={[styles.mtn, { width: 180, height: 130, backgroundColor: '#D4E8E6', bottom: 0, left: 20 }]} />
            <View style={[styles.mtn, { width: 140, height: 100, backgroundColor: '#2D7D78', bottom: 0, right: 10 }]} />
            <View style={[styles.mtn, { width: 160, height: 140, backgroundColor: '#1A5C57', bottom: 0, left: 60 }]} />
            <View style={[styles.pin, { bottom: 115, left: 100 }]}>
              <Ionicons name={current.pinIcon} size={28} color="#D4522A" />
            </View>
          </View>
        </View>

        {/* Text */}
        <View style={styles.textArea}>
          <Text style={styles.slideTitle}>{current.title}</Text>
          <Text style={styles.slideSubtitle}>{current.subtitle}</Text>
        </View>

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          {!isLast ? (
            <TouchableOpacity style={styles.nextBtn} onPress={() => setSlide(s => s + 1)}>
              <Text style={styles.nextBtnText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={() => setPhase('auth')}>
              <Text style={styles.nextBtnText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // AUTH FORM
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F2ED" />
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="triangle" size={22} color="#fff" />
          </View>
          <Text style={styles.logoText}>Nirdesh</Text>
        </View>

        <Text style={styles.authTitle}>Welcome back</Text>
        <Text style={styles.authSubtitle}>Sign in to continue your journey.</Text>

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Email or phone number"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.pwWrap}>
            <TextInput
              style={styles.pwInput}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
            />
            <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.eyeBtn}>
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign In */}
        <TouchableOpacity style={styles.signInBtn} onPress={handleAuth} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.signInBtnText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialBtnText}>G  Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Ionicons name="logo-apple" size={18} color="#1C1C1E" />
            <Text style={styles.socialBtnText}> Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle */}
        <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsLogin(v => !v)}>
          <Text style={styles.toggleText}>
            {isLogin ? 'Create a new account' : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },

  // Onboarding
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 12,
  },
  stepText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  skipText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  illustrationBox: { height: 240, justifyContent: 'center', alignItems: 'center' },
  mountainIllustration: { width: 280, height: 180, position: 'relative', justifyContent: 'flex-end' },
  mtn: {
    position: 'absolute',
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
  pin: { position: 'absolute' },
  textArea: { paddingHorizontal: 32, marginTop: 24 },
  slideTitle: { fontSize: 28, fontWeight: '700', color: '#1C1C1E', lineHeight: 36, marginBottom: 12 },
  slideSubtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 32 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotActive: { backgroundColor: '#2D7D78', width: 20 },
  btnRow: { paddingHorizontal: 32, marginTop: 32 },
  nextBtn: { backgroundColor: '#2D7D78', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Auth
  authScroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 36 },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2D7D78',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  authTitle: { fontSize: 26, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 },
  authSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 32 },
  inputGroup: { gap: 12, marginBottom: 16 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0D8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1C1C1E',
  },
  pwWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0D8',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  pwInput: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
    paddingVertical: 14,
  },
  eyeBtn: { padding: 4 },
  signInBtn: {
    backgroundColor: '#2D7D78',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  signInBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  forgotBtn: { alignItems: 'center', marginBottom: 24 },
  forgotText: { color: '#2D7D78', fontSize: 14, fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E0D8' },
  dividerText: { fontSize: 13, color: '#9CA3AF' },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0D8',
    borderRadius: 12,
    paddingVertical: 13,
    gap: 6,
  },
  socialBtnText: { fontSize: 14, color: '#1C1C1E', fontWeight: '500' },
  toggleBtn: { alignItems: 'center' },
  toggleText: { fontSize: 14, color: '#2D7D78', fontWeight: '500' },
});

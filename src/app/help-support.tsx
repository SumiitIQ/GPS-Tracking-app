import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, TextInput, Alert, Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HelpSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);

  const faqs = [
    {
      q: 'How does offline tracking work without network?',
      a: 'Nirdesh uses your phone hardware GPS chip and cached satellite/topographic elevation data stored locally. You do not need active mobile data to record routes or follow offline downloaded maps.'
    },
    {
      q: 'How do I download a trek for offline use?',
      a: 'Open any trek details page (e.g. Pandavleni Caves) and tap "Download for Offline", or go to Profile → Offline Maps and download popular trails directly.'
    },
    {
      q: 'What is a Round Trek?',
      a: 'A Round Trek (Loop Route) is a trail that starts and finishes at the exact same location without requiring you to backtrack over the same path.'
    },
    {
      q: 'Can I export my recorded trail to other devices?',
      a: 'Yes, after completing any trek you can export your path as a standard .GPX file or upload it directly to share with the trekking community.'
    }
  ];

  const handleSendFeedback = () => {
    if (!feedback.trim()) {
      Alert.alert('Required', 'Please write your question or issue description.');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setFeedback('');
      Alert.alert('Message Sent 🚀', 'Thank you! Our support team will review your report shortly.');
    }, 800);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F2ED" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* EMERGENCY BANNER */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyIconBox}>
            <Ionicons name="warning" size={22} color="#D4522A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>Trail Emergency SOS</Text>
            <Text style={styles.emergencySub}>In case of severe mountain distress or injury</Text>
            <TouchableOpacity
              style={styles.sosBtn}
              onPress={() => Linking.openURL('tel:112')}
            >
              <Text style={styles.sosBtnText}>Call Emergency (112)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqList}>
          {faqs.map((faq, idx) => (
            <View key={idx} style={styles.faqCard}>
              <View style={styles.qRow}>
                <Ionicons name="help-circle" size={18} color="#2D7D78" />
                <Text style={styles.faqQuestion}>{faq.q}</Text>
              </View>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
        </View>

        {/* CONTACT / FEEDBACK */}
        <Text style={styles.sectionTitle}>CONTACT SUPPORT</Text>
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Have an issue or bug to report?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe what happened or request a new trail..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={feedback}
            onChangeText={setFeedback}
          />
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSendFeedback}
            disabled={sending}
          >
            <Ionicons name="paper-plane" size={16} color="#fff" />
            <Text style={styles.submitBtnText}>{sending ? 'Sending...' : 'Send Message'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  scroll: { padding: 20, paddingBottom: 60 },
  emergencyCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF2EE',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FCDDD4',
    marginBottom: 20,
  },
  emergencyIconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FDE4DC',
    alignItems: 'center', justifyContent: 'center',
  },
  emergencyTitle: { fontSize: 15, fontWeight: '700', color: '#D4522A', marginBottom: 2 },
  emergencySub: { fontSize: 12, color: '#6B7280', marginBottom: 10 },
  sosBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#D4522A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sosBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#6B7280',
    letterSpacing: 0.8, marginBottom: 10, marginTop: 10, marginLeft: 4,
  },
  faqList: { gap: 12, marginBottom: 20 },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  qRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  faqQuestion: { fontSize: 14, fontWeight: '700', color: '#1C1C1E', flex: 1 },
  faqAnswer: { fontSize: 13, color: '#6B7280', lineHeight: 19 },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  contactTitle: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', marginBottom: 10 },
  textInput: {
    backgroundColor: '#F5F2ED',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1C1C1E',
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 14,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D7D78',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

import React from 'react';
import { View, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../theme/Theme';
import { Typography } from '../../components/ui/Typography';
import { MetricTile } from '../../components/ui/MetricTile';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Greeting */}
        <View style={styles.header}>
          <View>
            <Typography variant="headlineLgMobile" color={Theme.colors.primary}>Good morning, Alex</Typography>
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={16} color={Theme.colors.onSurfaceVariant} />
              <Typography variant="bodyMd" color={Theme.colors.onSurfaceVariant}>Kedarkantha, Uttarakhand</Typography>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <MaterialIcons name="notifications" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero: Recommended Route */}
        <View style={styles.section}>
          <Typography variant="labelCaps" color={Theme.colors.outline} style={styles.sectionHeader}>Recommended for you</Typography>
          <TouchableOpacity activeOpacity={0.9} style={styles.heroCard}>
            <ImageBackground 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACoVRplcSJGPeJRT4fVqRQhHI1xaDOTocZwO5FXackRN7iJf8s5YjBN5sbD58_te85wqrjf8oOrJ7qnFkUq6PAEAeJ6_85O9PnsOtdJ1lqMBYtZnWObppKfrDOClIrzAiw-LxDB-SIZReWzOYvC2UwnLL_1_FIPVT98z6MOjbjfekoKnpcSZl9VGRKJxqIzoybecis-8Y2P-uLsKiZ5gkjvbivideI9WVS_XOZkKvsBs1OXS_4ogu5cA' }} 
              style={styles.heroImage}
            >
              {/* Gradient Overlay */}
              <View style={styles.gradientOverlay} />
              <View style={styles.heroContent}>
                <View style={styles.heroHeaderRow}>
                  <View>
                    <Typography variant="headlineMd" color={Theme.colors.onPrimary} style={{ marginBottom: 4 }}>Kalsubai Peak</Typography>
                    <View style={styles.difficultyBadge}>
                      <Typography variant="labelCaps" color={Theme.colors.secondaryContainer}>Difficulty: Medium</Typography>
                    </View>
                  </View>
                  <View style={styles.startBtn}>
                    <Typography variant="labelCaps" color={Theme.colors.onSecondary}>START ROUTE</Typography>
                  </View>
                </View>
                {/* Metric Tiles for Route */}
                <View style={styles.heroMetrics}>
                  <View style={styles.heroMetricItem}>
                    <Typography variant="labelCaps" color={Theme.colors.outlineVariant}>DISTANCE</Typography>
                    <Typography variant="metricSm" color={Theme.colors.onPrimary}>8.6 km</Typography>
                  </View>
                  <View style={styles.heroMetricItem}>
                    <Typography variant="labelCaps" color={Theme.colors.outlineVariant}>ELEVATION</Typography>
                    <Typography variant="metricSm" color={Theme.colors.onPrimary}>620 m</Typography>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* Your Progress */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Typography variant="labelCaps" color={Theme.colors.outline}>YOUR PROGRESS</Typography>
            <MaterialIcons name="arrow-forward" size={16} color={Theme.colors.primary} />
          </View>
          <View style={styles.progressGrid}>
            <MetricTile label="TOTAL DIST" value="120" unit="km" style={styles.flexHalf} />
            <MetricTile label="ELEVATION GAIN" value="4,500" unit="m" style={styles.flexHalf} />
          </View>
        </View>

        {/* Nearby Treks */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Typography variant="labelCaps" color={Theme.colors.outline}>NEARBY TREKS</Typography>
            <MaterialIcons name="more-horiz" size={16} color={Theme.colors.primary} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            <View style={styles.trekCard}>
              <ImageBackground source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALSNLs85Ll8qkLhX-4LwPhjdhKJc29A4L2fUqPK1hMYpOJTUvD9A2ofnzWauZZyOxLPp9FE5ZmwpRTjHV4a_qs7Gu1HUlaC86kUXXMq-92hb8rrRcZuAhHSdmEB4K5IjnNNd-XvBxOGxTzaD0nCrO3rjoU3b736EVcv6bx4PCvHPMkk4aozXPQ2SgdeQtz0Z5cqBllOujHiR_vjR8XNbYupUrYSvghECKngyNxi4hTb5EdjJK6UlqlrQ' }} style={styles.trekImg} />
              <View style={styles.trekCardContent}>
                <Typography variant="bodyMd" style={{ fontWeight: 'bold' }}>Har Ki Dun</Typography>
                <View style={styles.trekCardRow}>
                  <Typography variant="metricSm" color={Theme.colors.onSurfaceVariant}>47 km</Typography>
                  <View style={styles.trekBadge}><Typography variant="labelCaps" color={Theme.colors.onSurface}>HARD</Typography></View>
                </View>
              </View>
            </View>
            <View style={styles.trekCard}>
              <ImageBackground source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPnOkIbz2U_tQipGSmMWcK5vIsd8U267KfanlQlK3NuzvLNiAXfwhJadCUkAUeUJh2NUFyCHdwD_vNN18xhCnXetMtqKJQnrN4_9hH19xAylGNTkt5LJCeuFZyObTt0kg-dhLXm6dT-bztQSqjiPnjhZfBHW5e_nevVXFLuJRhEXT8TMaB80LAYPwKetbGNuHs_ZCFG5M_PcUWZznmUWmbKqlcjiXLST6dfacNDfZ98J5aQu6M91SOuQ' }} style={styles.trekImg} />
              <View style={styles.trekCardContent}>
                <Typography variant="bodyMd" style={{ fontWeight: 'bold' }}>Roopkund</Typography>
                <View style={styles.trekCardRow}>
                  <Typography variant="metricSm" color={Theme.colors.onSurfaceVariant}>53 km</Typography>
                  <View style={styles.trekBadge}><Typography variant="labelCaps" color={Theme.colors.onSurface}>HARD</Typography></View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Typography variant="labelCaps" color={Theme.colors.outline} style={styles.sectionHeader}>RECENT ACTIVITY</Typography>
          <View style={styles.activityItem}>
            <View style={styles.activityMap}>
               <ImageBackground source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGg4SNPzkgRkOQS_-js5LqSLlMwGO8HC22_GZ0rk-JMEhWCsPqoYN-mjnvhCmsOgBtfTZEfJMtg91hydA7xJDWeXNRnEarp5fBRYx-4EPqPCqnRxL6XR10vONVsANV9WU_AsjxA_IBkGqjRvmAh3JViaosXz2Qjs93RTfCXkLMwkXRBmVN0KHs8mGPEchjXbt7mKTEqUnqBa9paw722rcaYrdIJ0491ZYOtaQeBsJy6R-XtIGpJYGQ3Q' }} style={{ flex: 1, opacity: 0.6 }} />
            </View>
            <View style={styles.activityContent}>
              <Typography variant="bodyMd" style={{ fontWeight: 'bold' }}>Morning Hike - Neer Garh</Typography>
              <Typography variant="metricSm" color={Theme.colors.onSurfaceVariant}>12.4 km • 3h 15m</Typography>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Theme.colors.outline} />
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityMap}>
               <ImageBackground source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxU7jqUOmqgyJlb4cLjlvzaoaEZsM6UuodQqSK1Nli7ZWT5F1VuNPDmxBS6BlwMWVlab1Vg5JleRIVZn5htH6P33t8k7tDjjIkUK4qv9QeGrdF6vTm4o1MQSS32iJHUHByHAyccCPONaP5PDYZbOnu0QEbsoKKB0bTKI7OAL9zRTNf6tQre3TdrEcJBKfvsSOM_zsgl7co1zpiwV7DpANX550HNArOiDLo1JoMNRfvn_kWJNa5OkUs7g' }} style={{ flex: 1, opacity: 0.6 }} />
            </View>
            <View style={styles.activityContent}>
              <Typography variant="bodyMd" style={{ fontWeight: 'bold' }}>George Everest Peak</Typography>
              <Typography variant="metricSm" color={Theme.colors.onSurfaceVariant}>5.2 km • 1.5h</Typography>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Theme.colors.outline} />
          </View>
        </View>

        <View style={{ height: 100 }} /> {/* Bottom Tab spacing */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingTop: Theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Theme.spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.base,
    marginTop: Theme.spacing.base,
  },
  notificationBtn: {
    padding: Theme.spacing.base,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(197, 198, 202, 0.3)',
  },
  section: {
    marginTop: Theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: Theme.spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  heroCard: {
    width: '100%',
    height: 320,
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(197, 198, 202, 0.3)',
    backgroundColor: Theme.colors.surfaceContainerLow,
  },
  heroImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    padding: Theme.spacing.sm,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(205, 72, 0, 0.2)', // secondaryContainer with opacity
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: Theme.spacing.base,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(163, 56, 0, 0.3)', // secondary with opacity
    alignSelf: 'flex-start',
  },
  startBtn: {
    backgroundColor: Theme.colors.secondary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.DEFAULT,
  },
  heroMetrics: {
    flexDirection: 'row',
    marginTop: Theme.spacing.sm,
    backgroundColor: 'rgba(0, 1, 1, 0.4)', // primary/40
    borderColor: 'rgba(197, 198, 202, 0.2)',
    borderWidth: 1,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xs,
    gap: Theme.spacing.xs,
  },
  heroMetricItem: {
    flex: 1,
  },
  progressGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  flexHalf: {
    flex: 1,
  },
  hScroll: {
    gap: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xs,
  },
  trekCard: {
    width: 240,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(197, 198, 202, 0.3)',
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
  },
  trekImg: {
    height: 96,
  },
  trekCardContent: {
    padding: Theme.spacing.xs,
    gap: Theme.spacing.base,
  },
  trekCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trekBadge: {
    backgroundColor: Theme.colors.surfaceVariant,
    paddingHorizontal: Theme.spacing.base,
    borderRadius: Theme.radius.DEFAULT,
  },
  activityItem: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.xs,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(197, 198, 202, 0.3)',
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  activityMap: {
    width: 64,
    height: 64,
    borderRadius: Theme.radius.DEFAULT,
    backgroundColor: Theme.colors.surfaceVariant,
    overflow: 'hidden',
  },
  activityContent: {
    flex: 1,
  },
});

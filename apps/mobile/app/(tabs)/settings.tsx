import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/ui/AppScreen';
import { FadeIn } from '@/components/ui/FadeIn';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { TabScreenHeader } from '@/components/ui/TabScreenHeader';
import { COLORS, FONT, RADIUS } from '@/lib/theme/tokens';
import { useAppData } from '@/lib/state/app-data';
import { useSession } from '@/lib/state/session';

function toBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useSession();
  const { profile, loading, refreshing, error, refreshAll, saveSettings } = useAppData();

  const settings = (profile?.settings ?? {}) as Record<string, unknown>;

  const [pushEnabled, setPushEnabled] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);
  const [availability, setAvailability] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    setPushEnabled(toBool(settings.pushNotifications, true));
    setPrivateMode(toBool(settings.privateMode, false));
    setAvailability(toBool(settings.acceptingIntros, true));
  }, [settings.acceptingIntros, settings.privateMode, settings.pushNotifications]);

  async function persistSettings(nextPatch: Record<string, unknown>) {
    setSaving(true);
    setLocalError(null);
    try {
      await saveSettings(nextPatch);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppScreen>
      <FadeIn>
        <TabScreenHeader
          title="Settings"
          subtitle="Control privacy, notifications, account access, and your matchmaking availability."
        />
      </FadeIn>

      <FadeIn delay={110}>
        <GlassCard>
          <SettingRow
            icon="bell-ring-outline"
            label="Push notifications"
            detail="Receive intro requests and conversation updates."
            value={pushEnabled}
            disabled={saving}
            onValueChange={(next) => {
              setPushEnabled(next);
              void persistSettings({ pushNotifications: next });
            }}
          />
          <Divider />
          <SettingRow
            icon="incognito"
            label="Private mode"
            detail="Hide your profile from broad discovery surfaces."
            value={privateMode}
            disabled={saving}
            onValueChange={(next) => {
              setPrivateMode(next);
              void persistSettings({ privateMode: next });
            }}
          />
          <Divider />
          <SettingRow
            icon="calendar-clock-outline"
            label="Available for intros"
            detail="Allow your profile to receive new curated intros."
            value={availability}
            disabled={saving}
            onValueChange={(next) => {
              setAvailability(next);
              void persistSettings({ acceptingIntros: next });
            }}
          />

          {saving || refreshing || loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={COLORS.goldGlow} />
              <Text style={styles.loadingText}>Syncing settings...</Text>
            </View>
          ) : null}

          {localError ? <Text style={styles.errorText}>{localError}</Text> : null}
          {error && !localError ? <Text style={styles.errorText}>{error}</Text> : null}
        </GlassCard>
      </FadeIn>

      <FadeIn delay={220}>
        <GlassCard>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.actionGroup}>
            <RowAction
              icon="account-outline"
              title={profile?.fullName || user?.fullName || 'Account'}
              onPress={() => router.push('/(tabs)/profile')}
            />
            <RowAction
              icon="email-outline"
              title={profile?.email || user?.email || 'Email unavailable'}
              onPress={async () => {
                const email = profile?.email || user?.email;
                if (!email) return;
                try {
                  await Linking.openURL(`mailto:${email}`);
                  setActionMessage(null);
                } catch {
                  setActionMessage(`Email: ${email}`);
                }
              }}
            />
            <RowAction
              icon="crown-outline"
              title={`Tier: ${(profile?.tier || user?.tier || 'standard').toUpperCase()}`}
              onPress={() => router.push('/(tabs)/subscription')}
            />
            <RowAction
              icon="lifebuoy"
              title="Help Centre"
              onPress={() => router.push('/(tabs)/help')}
            />
            <RowAction
              icon="message-text-outline"
              title="Contact Us"
              onPress={() => router.push('/(tabs)/contact')}
            />
          </View>
          {actionMessage ? <Text style={styles.actionMessage}>{actionMessage}</Text> : null}
        </GlassCard>
      </FadeIn>

      <FadeIn delay={300}>
        <View style={styles.bottomActions}>
          <GoldButton label="Refresh data" outlined style={styles.bottomButton} onPress={refreshAll} />
          <GoldButton label="Sign out" style={styles.bottomButton} onPress={signOut} />
        </View>
      </FadeIn>
    </AppScreen>
  );
}

type SettingRowProps = {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  detail: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (nextValue: boolean) => void;
};

function SettingRow({ icon, label, detail, value, disabled = false, onValueChange }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIconWrap}>
        <MaterialCommunityIcons name={icon} size={18} color={COLORS.goldChampagne} />
      </View>
      <View style={styles.settingTextWrap}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDetail}>{detail}</Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255,255,255,0.16)', true: 'rgba(212,175,55,0.45)' }}
        thumbColor={value ? COLORS.goldGlow : 'rgba(255,255,255,0.75)'}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

type RowActionProps = {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  onPress?: () => void;
};

function RowAction({ icon, title, onPress }: RowActionProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionRow, pressed && onPress ? styles.actionRowPressed : null]}>
      <MaterialCommunityIcons name={icon} size={18} color={COLORS.goldChampagne} />
      <Text style={styles.actionTitle} numberOfLines={1}>{title}</Text>
      {onPress ? <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  settingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextWrap: {
    flex: 1,
  },
  settingLabel: {
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 14,
  },
  settingDetail: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
    marginTop: 1,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginVertical: 12,
    backgroundColor: COLORS.strokeSoft,
  },
  loadingRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  errorText: {
    marginTop: 8,
    color: COLORS.danger,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  actionMessage: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  sectionTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.display,
    fontSize: 24,
    marginBottom: 8,
  },
  actionGroup: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.strokeSoft,
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.08)',
  },
  actionRowPressed: {
    opacity: 0.8,
  },
  actionTitle: {
    flex: 1,
    color: COLORS.textBody,
    fontFamily: FONT.body,
    fontSize: 13,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomButton: {
    flex: 1,
  },
});

// apps/mobile/components/ui/CheckoutSheet.tsx
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useSession } from '@/lib/state/session';
import { usePayment, type PaymentPurpose } from '@/hooks/usePayment';
import { COLORS, FONT, RADIUS } from '@/lib/theme/tokens';
import { GoldButton } from '@/components/ui/GoldButton';

type Stage = 'method-select' | 'mpesa-phone' | 'waiting' | 'done' | 'error';

export type CheckoutPlan = {
  purpose: PaymentPurpose;
  label: string;
  price: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan: CheckoutPlan;
};

export function CheckoutSheet({ visible, onClose, onSuccess, plan }: Props) {
  const { user } = useSession();
  const { initiate, pollStatus, cancelPoll } = usePayment();

  const [stage, setStage] = useState<Stage>('method-select');
  const [phone, setPhone] = useState('');
  const [reference, setReference] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill phone from user profile
  useEffect(() => {
    if (visible && user?.phone) {
      setPhone(user.phone);
    }
  }, [visible, user?.phone]);

  function reset() {
    setStage('method-select');
    setPhone(user?.phone ?? '');
    setReference(null);
    setStatusText('');
    setErrorMsg('');
    setLoading(false);
    cancelPoll();
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function startMpesaFlow() {
    const cleaned = phone.trim().replace(/\s+/g, '');
    if (!cleaned) {
      setErrorMsg('Enter your M-Pesa phone number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await initiate({ purpose: plan.purpose, method: 'mpesa', phone: cleaned });
      setReference(result.reference);
      setStatusText(result.type === 'mpesa' ? (result as any).message : 'Processing…');
      setStage('waiting');

      await pollStatus(
        result.reference,
        (status) => {
          if (status === 'completed') {
            setStage('done');
            onSuccess();
          } else if (status === 'failed') {
            setErrorMsg('Payment was not completed. Please try again.');
            setStage('error');
          }
        },
        { maxMs: 90000 }
      );
    } catch (e: any) {
      setErrorMsg(e?.message || 'Something went wrong. Please try again.');
      setStage('error');
    } finally {
      setLoading(false);
    }
  }

  async function startCardFlow() {
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await initiate({ purpose: plan.purpose, method: 'stripe' });

      if (result.type === 'redirect') {
        const browserResult = await WebBrowser.openAuthSessionAsync(
          result.url,
          'kujuana://'
        );

        // After returning from browser, poll once for status
        setReference(result.reference);
        setStage('waiting');
        setStatusText('Verifying your payment…');

        await pollStatus(
          result.reference,
          (status) => {
            if (status === 'completed') {
              setStage('done');
              onSuccess();
            } else if (status === 'failed') {
              setErrorMsg('Payment was not confirmed. If charged, contact support.');
              setStage('error');
            }
          },
          { maxMs: 30000, intervalMs: 3000 }
        );
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Could not open payment page. Please try again.');
      setStage('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
      >
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Plan summary */}
          <View style={styles.planSummary}>
            <Text style={styles.planLabel}>{plan.label}</Text>
            <Text style={styles.planPrice}>{plan.price}</Text>
          </View>

          {/* ── Stage: Method selection ── */}
          {stage === 'method-select' && (
            <View style={styles.content}>
              <Text style={styles.sectionTitle}>Choose payment method</Text>

              <View style={styles.methodGrid}>
                <GoldButton
                  label="Pay with M-Pesa"
                  onPress={() => setStage('mpesa-phone')}
                />
                <View style={styles.methodSpacer} />
                <GoldButton
                  label="Pay by Card (Stripe)"
                  outlined
                  onPress={startCardFlow}
                />
                <View style={styles.methodSpacer} />
                <View style={styles.comingSoonRow}>
                  <Text style={styles.comingSoonLabel}>Flutterwave</Text>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonBadgeText}>Coming soon</Text>
                  </View>
                </View>
              </View>

              {loading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={COLORS.goldGlow} />
                  <Text style={styles.loadingText}>Opening payment…</Text>
                </View>
              )}

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

              <Pressable onPress={handleClose} style={styles.cancelLink}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          )}

          {/* ── Stage: M-Pesa phone entry ── */}
          {stage === 'mpesa-phone' && (
            <View style={styles.content}>
              <Text style={styles.sectionTitle}>Your M-Pesa number</Text>
              <Text style={styles.hint}>We'll send a payment prompt to this number.</Text>

              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. 0712 345 678"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                returnKeyType="done"
              />

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

              <View style={styles.methodGrid}>
                <GoldButton
                  label={loading ? 'Sending…' : 'Send M-Pesa Prompt'}
                  onPress={startMpesaFlow}
                />
                <View style={styles.methodSpacer} />
                <GoldButton
                  label="Back"
                  outlined
                  onPress={() => { setStage('method-select'); setErrorMsg(''); }}
                />
              </View>
            </View>
          )}

          {/* ── Stage: Waiting / polling ── */}
          {stage === 'waiting' && (
            <View style={styles.content}>
              <View style={styles.centeredContent}>
                <ActivityIndicator size="large" color={COLORS.goldGlow} />
                <Text style={styles.waitingTitle}>
                  {statusText || 'Waiting for payment…'}
                </Text>
                {reference ? (
                  <Text style={styles.referenceText}>Ref: {reference}</Text>
                ) : null}
                <Text style={styles.hint}>This can take up to 90 seconds.</Text>
              </View>

              <Pressable onPress={handleClose} style={styles.cancelLink}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          )}

          {/* ── Stage: Done ── */}
          {stage === 'done' && (
            <View style={styles.content}>
              <View style={styles.centeredContent}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.waitingTitle}>Payment confirmed!</Text>
                <Text style={styles.hint}>Your plan has been updated.</Text>
              </View>

              <GoldButton label="Done" onPress={handleClose} />
            </View>
          )}

          {/* ── Stage: Error ── */}
          {stage === 'error' && (
            <View style={styles.content}>
              <View style={styles.centeredContent}>
                <Text style={styles.errorIcon}>✕</Text>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>

              <View style={styles.methodGrid}>
                <GoldButton label="Try Again" onPress={reset} />
                <View style={styles.methodSpacer} />
                <GoldButton label="Close" outlined onPress={handleClose} />
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(24,2,31,0.72)',
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1E0628',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.18)',
    paddingBottom: 36,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 20,
  },
  planSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.12)',
    marginBottom: 20,
  },
  planLabel: {
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 15,
    flex: 1,
    marginRight: 12,
  },
  planPrice: {
    color: COLORS.goldChampagne,
    fontFamily: FONT.bodySemiBold,
    fontSize: 16,
  },
  content: {
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 14,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  hint: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
    lineHeight: 18,
  },
  methodGrid: {
    gap: 0,
  },
  methodSpacer: {
    height: 10,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.offWhite,
    fontFamily: FONT.body,
    fontSize: 15,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 12,
  },
  errorText: {
    color: COLORS.danger,
    fontFamily: FONT.body,
    fontSize: 13,
  },
  cancelLink: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  cancelText: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 13,
  },
  centeredContent: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  waitingTitle: {
    color: COLORS.offWhite,
    fontFamily: FONT.bodySemiBold,
    fontSize: 16,
    textAlign: 'center',
  },
  referenceText: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 11,
  },
  successIcon: {
    color: '#4ADE80',
    fontSize: 40,
    fontFamily: FONT.bodySemiBold,
  },
  errorIcon: {
    color: COLORS.danger,
    fontSize: 40,
    fontFamily: FONT.bodySemiBold,
  },
  comingSoonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    opacity: 0.5,
  },
  comingSoonLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.bodySemiBold,
    fontSize: 14,
    flex: 1,
  },
  comingSoonBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  comingSoonBadgeText: {
    color: COLORS.textMuted,
    fontFamily: FONT.body,
    fontSize: 10,
  },
});

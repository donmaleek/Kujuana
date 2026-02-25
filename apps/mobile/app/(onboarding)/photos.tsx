import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ApiError } from '@/lib/api/types';
import {
  confirmUpload,
  deleteUpload,
  getUploadSignature,
  saveOnboardingStep,
  submitOnboarding,
} from '@/lib/api/endpoints';
import { refreshProfile } from '@/lib/auth/bootstrap';
import { useAuthStore } from '@/store/auth-store';
import { DeviceShell } from '@/components/common/DeviceShell';

const GOLD = '#FFD700';

type Slot = { uri?: string; publicId?: string } | null;

export default function UploadPhotosStepScreen() {
  const profile = useAuthStore((state) => state.profile);
  const profilePhotos = useMemo(() => profile?.photos ?? [], [profile]);

  const [photos, setPhotos] = useState<Slot[]>([null, null, null]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const seeded: Slot[] = [null, null, null];
    profilePhotos.slice(0, 3).forEach((photo, idx) => {
      seeded[idx] = { publicId: photo.publicId, uri: photo.url };
    });
    setPhotos(seeded);
  }, [profilePhotos]);

  const filledCount = useMemo(() => photos.filter(Boolean).length, [photos]);
  const canContinue = filledCount >= 3;

  async function pickForIndex(index: number) {
    setError('');

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload images.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.9,
      allowsEditing: true,
      aspect: [4, 5],
    });

    if (res.canceled) return;

    const uri = res.assets?.[0]?.uri;
    if (!uri) return;

    setUploadingIndex(index);

    try {
      const existing = photos[index];
      if (existing?.publicId) {
        await deleteUpload(existing.publicId);
      }

      const signed = await getUploadSignature();

      const form = new FormData();
      form.append('file', {
        uri,
        name: `kujuana-${Date.now()}.jpg`,
        type: res.assets?.[0]?.mimeType ?? 'image/jpeg',
      } as any);
      form.append('api_key', signed.api_key);
      form.append('timestamp', String(signed.timestamp));
      form.append('folder', signed.folder);
      form.append('signature', signed.signature);
      form.append('type', 'private');

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.cloud_name}/image/upload`,
        {
          method: 'POST',
          body: form,
        },
      );

      if (!cloudinaryRes.ok) {
        throw new Error('Image upload failed.');
      }

      const cloudinaryPayload = (await cloudinaryRes.json()) as { public_id?: string };
      if (!cloudinaryPayload.public_id) {
        throw new Error('Upload completed but missing public id.');
      }

      await confirmUpload({
        publicId: cloudinaryPayload.public_id,
        order: index + 1,
      });

      setPhotos((prev) => {
        const next = [...prev];
        next[index] = { uri, publicId: cloudinaryPayload.public_id };
        return next;
      });

      await refreshProfile();
    } catch (err) {
      if (err instanceof ApiError || err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to upload photo.');
      }
    } finally {
      setUploadingIndex(null);
    }
  }

  async function removeIndex(index: number) {
    const slot = photos[index];
    if (!slot?.publicId) {
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      return;
    }

    setError('');

    try {
      await deleteUpload(slot.publicId);
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      await refreshProfile();
    } catch (err) {
      if (err instanceof ApiError || err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to remove photo.');
      }
    }
  }

  async function continueToNext() {
    if (!canContinue || saving) return;

    setError('');
    setSaving(true);

    try {
      const uploaded = photos.filter((slot): slot is NonNullable<Slot> => Boolean(slot && slot.publicId));

      await saveOnboardingStep(4, {
        photos: uploaded.map((slot, index) => ({
          publicId: slot.publicId!,
          order: index + 1,
          isPrivate: true,
        })),
      });

      await submitOnboarding();
      await refreshProfile();
      router.replace('/(tabs)/home');
    } catch (err) {
      if (err instanceof ApiError || err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to continue right now.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <LinearGradient
      colors={['#140321', '#2A0B46', '#4B165E', '#2A0B46', '#140321']}
      start={{ x: 0.12, y: 0.08 }}
      end={{ x: 0.9, y: 0.98 }}
      style={styles.bg}
    >
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />

      <DeviceShell>
      <View style={styles.container}>
        <Text style={styles.stepCorner}>Step 5 of 5</Text>

        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/kujuana_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brand}>KUJUANA</Text>
        </View>

        <Text style={styles.title}>Upload profile photos</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.boxOuter}>
          <LinearGradient
            colors={['rgba(230,196,106,0.60)', 'rgba(230,196,106,0.18)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.boxBorder}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.boxInner}
            >
              <View style={styles.gloss} />

              <View style={styles.uploadIconWrap}>
                <Ionicons name="cloud-upload-outline" size={44} color={GOLD} />
              </View>

              <View style={styles.slotsRow}>
                {photos.map((slot, idx) => (
                  <PhotoSlot
                    key={idx}
                    photo={slot}
                    uploading={uploadingIndex === idx}
                    onAdd={() => pickForIndex(idx)}
                    onRemove={() => removeIndex(idx)}
                  />
                ))}
              </View>

              <Text style={styles.requirement}>3-photo requirement</Text>
            </LinearGradient>
          </LinearGradient>
        </View>

        <Text style={styles.privateText}>Private. Never public.</Text>

        <Pressable
          style={{ width: '100%', marginTop: 18 }}
          onPress={continueToNext}
          disabled={!canContinue || saving}
        >
          <LinearGradient
            colors={['#FFE680', '#FFD700', '#D9A300']}
            start={{ x: 0.1, y: 0.2 }}
            end={{ x: 0.9, y: 0.8 }}
            style={[styles.continueBtn, (!canContinue || saving) && { opacity: 0.55 }]}
          >
            <Text style={styles.continueText}>{saving ? 'Saving...' : 'Continue'}</Text>
            <View style={styles.sparkle}>
              <Ionicons name="sparkles" size={18} color="rgba(255,255,255,0.75)" />
            </View>
          </LinearGradient>
        </Pressable>

        <Text style={styles.counterHint}>{filledCount}/3 photos selected</Text>
      </View>
      </DeviceShell>
    </LinearGradient>
  );
}

function PhotoSlot({
  photo,
  uploading,
  onAdd,
  onRemove,
}: {
  photo: Slot;
  uploading: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.slotOuter}>
      <View style={styles.slotBorder}>
        <View style={styles.slotInner}>
          {photo ? (
            <>
              {photo.uri ? (
                <Image source={{ uri: photo.uri }} style={styles.slotImage} />
              ) : (
                <View style={styles.uploadedPlaceholder}>
                  <Ionicons name="image-outline" size={24} color={GOLD} />
                  <Text style={styles.uploadedPlaceholderText}>Uploaded</Text>
                </View>
              )}
              <Pressable onPress={onRemove} style={styles.removeBtn} hitSlop={10}>
                <Ionicons name="close" size={16} color="#1C0C2A" />
              </Pressable>
            </>
          ) : (
            <Pressable onPress={onAdd} style={styles.plusBtn} hitSlop={10}>
              <LinearGradient
                colors={['#FFE680', '#FFD700', '#D9A300']}
                start={{ x: 0.1, y: 0.2 }}
                end={{ x: 0.9, y: 0.8 }}
                style={styles.plusCircle}
              >
                <Ionicons name={uploading ? 'time-outline' : 'add'} size={22} color="#1C0C2A" />
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  error: {
    color: '#f3b0b0',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 280,
    backgroundColor: 'rgba(233,197,108,0.16)',
    opacity: 0.9,
  },
  glowTop: { top: -90, right: -120 },
  glowBottom: { bottom: -150, left: -140, opacity: 0.55 },
  stepCorner: {
    position: 'absolute',
    top: 22,
    right: 16,
    color: 'rgba(230,196,106,0.85)',
    fontSize: 16,
    fontWeight: '900',
  },
  logoWrap: { alignItems: 'center', marginTop: 8 },
  logoImage: {
    width: 124,
    height: 124,
    marginBottom: 12,
    borderRadius: 18,
    shadowColor: 'rgba(255, 215, 0, 0.9)',
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  brand: {
    color: GOLD,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 215, 0, 0.65)',
    textShadowRadius: 10,
  },
  title: {
    marginTop: 20,
    color: GOLD,
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 48,
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowRadius: 12,
  },
  boxOuter: {
    width: '100%',
    marginTop: 18,
    borderRadius: 22,
    overflow: 'hidden',
  },
  boxBorder: {
    borderRadius: 22,
    padding: 1.6,
  },
  boxInner: {
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.14)',
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 310,
    justifyContent: 'center',
  },
  gloss: {
    position: 'absolute',
    top: -40,
    left: -30,
    width: 160,
    height: 400,
    backgroundColor: 'rgba(255,255,255,0.10)',
    transform: [{ rotate: '18deg' }],
  },
  uploadIconWrap: {
    marginBottom: 18,
    opacity: 0.95,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 14,
  },
  slotOuter: { flex: 1 },
  slotBorder: {
    borderRadius: 18,
    padding: 1.2,
    backgroundColor: 'rgba(230,196,106,0.30)',
  },
  slotInner: {
    height: 140,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(230,196,106,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  uploadedPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadedPlaceholderText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    fontSize: 12,
  },
  slotImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  plusBtn: { alignItems: 'center', justifyContent: 'center' },
  plusCircle: {
    width: 46,
    height: 46,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
    shadowColor: GOLD,
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 26,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  requirement: {
    marginTop: 18,
    color: 'rgba(230,196,106,0.92)',
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowRadius: 10,
  },
  privateText: {
    marginTop: 18,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 18,
    fontWeight: '800',
  },
  continueBtn: {
    height: 70,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: GOLD,
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0.8,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  continueText: {
    color: '#1C0C2A',
    fontSize: 22,
    fontWeight: '900',
  },
  sparkle: {
    position: 'absolute',
    right: 16,
    top: 16,
    opacity: 0.9,
  },
  counterHint: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12.5,
    fontWeight: '700',
  },
});

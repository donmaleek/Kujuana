import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ProgressHeader } from '@/components/ui/ProgressHeader';
import { Button } from '@/components/ui/Button';

interface OnboardingScaffoldProps extends PropsWithChildren {
  step: number;
  title: string;
  subtitle: string;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  onBack?: () => void;
}

export function OnboardingScaffold({
  step,
  title,
  subtitle,
  children,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled,
  continueLoading,
  onBack,
}: OnboardingScaffoldProps) {
  return (
    <Screen>
      <ProgressHeader step={step} total={7} title={title} subtitle={subtitle} />
      {children}
      <View style={{ gap: 10, marginTop: 8 }}>
        {onContinue ? (
          <Button
            label={continueLabel}
            onPress={onContinue}
            disabled={continueDisabled}
            loading={continueLoading}
          />
        ) : null}
        {onBack ? <Button label="Back" variant="ghost" onPress={onBack} /> : null}
      </View>
    </Screen>
  );
}

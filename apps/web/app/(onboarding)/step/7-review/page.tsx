import { ReviewSubmit } from '@/components/onboarding/ReviewSubmit';

export default function ReviewPage() {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
      <p className="text-muted-foreground mb-8">
        Please review your profile before submitting. You can edit any section afterwards.
      </p>
      <ReviewSubmit />
    </div>
  );
}

import { PhotosUploader } from '@/components/onboarding/PhotosUploader';

export default function PhotosStep() {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-2">Upload Photos</h2>
      <p className="text-muted-foreground mb-2">
        Upload at least 3 private photos. Photos are confidential and only shared per platform policy.
      </p>
      <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-3 mb-8">
        🔒 All photos are stored privately. Only matches with appropriate tier access can view them.
      </p>
      <PhotosUploader />
    </div>
  );
}

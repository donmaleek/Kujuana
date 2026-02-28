// kujuana/apps/web/app/components/onboarding/PhotosUploader.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/components/ui/utils";

const schema = z.object({
  photos: z.array(z.string()).min(1, "Upload at least 1 photo.").max(3, "Max 3 photos."),
});

export type PhotosData = z.infer<typeof schema>;

// Expects your API to support:
// 1) GET  /upload/photos/signature  -> { uploadUrl, fields } OR signed params (Cloudinary)
// 2) POST /profile/photos          -> save publicId list
//
// For now we keep it flexible: `onUpload` receives the file and must return a publicId string.
export function PhotosUploader({
  initial,
  onBack,
  onNext,
  onUpload,
}: {
  initial?: Partial<PhotosData>;
  onBack?: () => void;
  onNext: (data: PhotosData) => Promise<void> | void;
  onUpload: (file: File) => Promise<string>; // returns Cloudinary publicId
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>(() => initial?.photos ?? []);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const canAdd = photos.length < 3;

  const previewUrls = useMemo(() => {
    // If you later store signed URLs instead of publicIds, this will still work.
    return photos.map((p) => p);
  }, [photos]);

  const pick = () => inputRef.current?.click();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErr(null);

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setErr("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErr("Max 10MB per photo.");
      return;
    }
    if (!canAdd) {
      setErr("You can upload up to 3 photos.");
      return;
    }

    setLoading(true);
    try {
      const publicId = await onUpload(file);
      setPhotos((s) => [...s, publicId]);
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (idx: number) => {
    setPhotos((s) => s.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    setErr(null);
    const parsed = schema.safeParse({ photos });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Invalid photos.");
      return;
    }
    setLoading(true);
    try {
      await onNext(parsed.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-5">
        <div>
          <Label>Upload Photos (1–3)</Label>
          <p className="mt-1 text-sm text-white/60">
            Use clear photos. Private storage. Shared only via expiring signed links.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="grid grid-cols-3 gap-3">
          {previewUrls.map((src, i) => (
            <div key={src + i} className="relative">
              <div
                className={cn(
                  "aspect-square rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden",
                  "shadow-sm"
                )}
              >
                {/* If src is a Cloudinary publicId, you will swap this to a signed URL loader */}
                {/* For now: show a placeholder style */}
                <div className="h-full w-full flex items-center justify-center text-xs text-white/60 p-2 text-center">
                  Photo {i + 1}
                  <div className="mt-2 break-all opacity-60">{src}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -right-2 -top-2 rounded-full border border-white/10 bg-[#18021F] px-2 py-1 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5"
              >
                Remove
              </button>
            </div>
          ))}

          {canAdd ? (
            <button
              type="button"
              onClick={pick}
              className="aspect-square rounded-2xl border border-[#E8D27C]/20 bg-white/[0.02] text-white/70 hover:text-white hover:bg-white/[0.04] transition"
            >
              <div className="h-full w-full flex flex-col items-center justify-center gap-2">
                <div className="h-10 w-10 rounded-full bg-[#E8D27C]/15 border border-[#E8D27C]/30 flex items-center justify-center text-[#E8D27C] font-black">
                  +
                </div>
                <div className="text-xs font-semibold">Add photo</div>
              </div>
            </button>
          ) : null}
        </div>

        {err ? <p className="text-sm text-red-300">{err}</p> : null}

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={onBack} type="button">
            Back
          </Button>
          <Button variant="gold" loading={loading} onClick={submit} type="button">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
// kujuana/apps/web/components/shared/PrivacyBanner.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const KEY = "kujuana_privacy_ack_v1";

export function PrivacyBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      setShow(v !== "1");
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
      <div className="mx-auto max-w-3xl">
        <Card className="border-[#E8D27C]/20 bg-[#18021F]/90 backdrop-blur">
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-[#F5E6B3]">Privacy-first by design</div>
              <div className="text-sm text-white/70">
                Your photos stay private and are only shared via expiring signed links.
              </div>
            </div>
            <Button
              variant="gold"
              onClick={() => {
                try {
                  localStorage.setItem(KEY, "1");
                } catch {}
                setShow(false);
              }}
            >
              Got it
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
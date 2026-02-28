// kujuana/apps/web/components/shared/PaymentModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentStatus } from "@/components/billing/PaymentStatus";
import { apiClient } from "@/lib/api-client";

type InitiateResponse =
  | { method: "mpesa"; reference: string; message: string }
  | { method: "redirect"; reference: string; url: string };

export function PaymentModal({
  open,
  onOpenChange,
  title = "Complete Payment",
  payload,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  payload: Record<string, any>; // { method, phone?, purpose, ... }
}) {
  const [stage, setStage] = useState<"init" | "poll">("init");
  const [reference, setReference] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post<InitiateResponse>("/payments/initiate", payload);
      setReference(res.reference);

      if (res.method === "redirect") {
        window.location.href = res.url;
        return;
      }

      setMessage(res.message ?? "Check your phone to complete M-Pesa payment.");
      setStage("poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={title}
        description="Secure payment. Kujuana never stores card details."
        className="max-w-xl"
      >
        {stage === "init" ? (
          <div className="space-y-4">
            <div className="text-sm text-white/70">
              When you proceed, we’ll initiate payment and confirm automatically.
            </div>

            <div className="flex items-center justify-between gap-3">
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button variant="gold" loading={loading} onClick={start}>
                Pay Now
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {message ? <div className="text-sm text-white/70">{message}</div> : null}
            {reference ? (
              <PaymentStatus
                reference={reference}
                onDone={(final) => {
                  // you can trigger refetch of subscription status here
                  if (final === "completed") {
                    setTimeout(() => onOpenChange(false), 900);
                  }
                }}
              />
            ) : null}

            <div className="flex justify-end">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
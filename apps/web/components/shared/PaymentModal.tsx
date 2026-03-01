// kujuana/apps/web/components/shared/PaymentModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentStatus } from "@/components/billing/PaymentStatus";
import { apiClient } from "@/lib/api-client";

type PaymentMethod = "mpesa" | "paystack" | "pesapal" | "stripe";

type InitiateResponse =
  | { method: "mpesa"; reference: string; message: string }
  | { method: "redirect"; reference: string; url: string };

const METHODS: { id: PaymentMethod; label: string; desc: string; comingSoon?: boolean }[] = [
  { id: "mpesa", label: "M-Pesa", desc: "STK push to your Safaricom number" },
  { id: "paystack", label: "Paystack", desc: "Card or mobile money" },
  { id: "pesapal", label: "Pesapal", desc: "Card payments (Kenya)" },
  { id: "stripe", label: "Stripe", desc: "International card payments" },
];

export function PaymentModal({
  open,
  onOpenChange,
  title = "Complete Payment",
  basePayload,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  basePayload: Record<string, any>; // { purpose, currency?, tier?, ... }
  onSuccess?: () => void;
}) {
  const [stage, setStage] = useState<"method-select" | "mpesa-phone" | "poll">("method-select");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStage("method-select");
    setSelectedMethod(null);
    setPhone("");
    setReference(null);
    setMessage(null);
    setError(null);
    setLoading(false);
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  function selectMethod(method: PaymentMethod) {
    setSelectedMethod(method);
    setError(null);
    if (method === "mpesa") {
      setStage("mpesa-phone");
    }
  }

  async function initiatePayment(method: PaymentMethod, mpesaPhone?: string) {
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, any> = { ...basePayload, method };
      if (mpesaPhone) payload.phone = mpesaPhone;

      const res = await apiClient.post<InitiateResponse>("/payments/initiate", payload);
      setReference(res.reference);

      if (res.method === "redirect") {
        window.location.href = (res as any).url;
        return;
      }

      setMessage((res as any).message ?? "Check your phone for the M-Pesa prompt.");
      setStage("poll");
    } catch (e: any) {
      setError(e?.message || "Payment failed to start. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirmMpesa() {
    const cleaned = phone.trim().replace(/\s+/g, "");
    if (!cleaned) {
      setError("Enter your M-Pesa phone number.");
      return;
    }
    initiatePayment("mpesa", cleaned);
  }

  function handleMethodProceed() {
    if (!selectedMethod) {
      setError("Select a payment method.");
      return;
    }
    initiatePayment(selectedMethod);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        title={title}
        description="Secure payment. Kujuana never stores card details."
        className="max-w-xl"
      >
        {/* ── Stage: Method selection ── */}
        {stage === "method-select" && (
          <div className="space-y-4">
            <p className="text-sm text-white/60">Choose how you would like to pay:</p>

            <div className="grid gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => selectMethod(m.id)}
                  className={[
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                    selectedMethod === m.id
                      ? "border-[rgba(212,175,55,0.5)] bg-[rgba(212,175,55,0.10)] text-[var(--gold-champagne,#E8D27C)]"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="font-medium">{m.label}</span>
                  <span className="text-xs text-white/50">{m.desc}</span>
                </button>
              ))}

              {/* Flutterwave — coming soon */}
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-left text-sm opacity-50 cursor-not-allowed">
                <span className="font-medium text-white/40">Flutterwave</span>
                <span className="text-xs text-white/30">International card or mobile money</span>
                <span className="ml-auto shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium text-white/40">
                  Coming soon
                </span>
              </div>
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}

            <div className="flex items-center justify-between gap-3">
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button
                variant="gold"
                loading={loading}
                disabled={!selectedMethod}
                onClick={handleMethodProceed}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ── Stage: M-Pesa phone ── */}
        {stage === "mpesa-phone" && (
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Enter the Safaricom number to receive the M-Pesa STK push:
            </p>

            <input
              type="tel"
              placeholder="e.g. 0712 345 678 or +254712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/90 placeholder:text-white/35 focus:border-[rgba(212,175,55,0.4)] focus:outline-none"
            />

            {error && <p className="text-sm text-red-300">{error}</p>}

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => { setStage("method-select"); setError(null); }}>
                Back
              </Button>
              <Button variant="gold" loading={loading} onClick={handleConfirmMpesa}>
                Send M-Pesa Prompt
              </Button>
            </div>
          </div>
        )}

        {/* ── Stage: Polling ── */}
        {stage === "poll" && (
          <div className="space-y-4">
            {message && <p className="text-sm text-white/70">{message}</p>}

            {reference && (
              <PaymentStatus
                reference={reference}
                onDone={(final) => {
                  if (final === "completed") {
                    onSuccess?.();
                    setTimeout(() => handleOpenChange(false), 900);
                  }
                }}
              />
            )}

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

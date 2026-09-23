"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Smartphone, KeyRound, ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toFaDigits } from "@/lib/format";

export function AuthModal() {
  const { isLoginOpen, closeLogin, requestOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Reset state on close
  useEffect(() => {
    if (!isLoginOpen) {
      setTimeout(() => {
        setStep("phone");
        setPhone("");
        setOtp(["", "", "", ""]);
        setError(null);
        setLoading(false);
      }, 300);
    }
  }, [isLoginOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isLoginOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isLoginOpen]);

  const handleSendPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.trim();
    // Validate Iranian mobile (09...)
    const iranPhoneRegex = /^09[0-9]{9}$/;
    if (!iranPhoneRegex.test(cleanPhone)) {
      setError("لطفاً یک شماره موبایل معتبر ایران (مثلاً ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.");
      return;
    }

    try {
      setLoading(true);
      const res = await requestOtp(cleanPhone);
      setCountdown(res.expires_in || 120);
      setStep("otp");
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || "خطا در ارسال کد تایید. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance focus to next input
    if (digit && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if 4 digits filled
    const fullCode = newOtp.join("");
    if (fullCode.length === 4 && newOtp.every((d) => d !== "")) {
      submitVerify(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const submitVerify = async (code: string) => {
    try {
      setLoading(true);
      setError(null);
      await verifyOtp(phone.trim(), code);
    } catch (err: any) {
      setError(err.message || "کد وارد شده صحیح نمی‌باشد.");
      setOtp(["", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${toFaDigits(m)}:${s < 10 ? "۰" : ""}${toFaDigits(s)}`;
  };

  if (!isLoginOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeLogin}
          className="absolute inset-0 bg-[#050507]/90 backdrop-blur-xl"
          aria-hidden
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="glass-panel relative w-full max-w-[420px] overflow-hidden rounded-[28px] border border-white/10 p-6 shadow-[0_16px_48px_rgba(0,0,0,0.8)] sm:p-8"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLogin}
            className="text-ink-4 hover:text-white absolute top-5 left-5 grid size-8 place-items-center rounded-full bg-white/5 transition-colors"
          >
            <X className="size-4" />
          </button>

          {/* Ambient Glow */}
          <div
            className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-brand/20 blur-2xl"
            aria-hidden
          />

          {step === "phone" ? (
            <form onSubmit={handleSendPhone} className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-brand/10 border border-brand/20 text-brand">
                  <Smartphone className="size-6" />
                </div>
                <div>
                  <h2 className="text-[19px] font-black text-white">ورود / عضویت</h2>
                  <p className="text-ink-4 text-[12px] mt-0.5">شماره موبایل خود را وارد کنید</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-ink-3 block text-[12px] mb-2 font-medium">
                  شماره موبایل
                </label>
                <div className="glass flex items-center rounded-2xl px-4 py-3 border border-white/10 focus-within:border-brand/50 transition-colors">
                  <input
                    type="tel"
                    dir="ltr"
                    autoFocus
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="text-ink-1 placeholder:text-ink-5 w-full bg-transparent text-[16px] font-bold tracking-wider outline-none text-right"
                    disabled={loading}
                  />
                </div>
                {error && (
                  <p className="text-brand text-[11.5px] mt-2 leading-relaxed">
                    {error}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading || !phone}
                whileTap={{ scale: 0.98 }}
                className="glass-brand mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-bold text-white shadow-[0_4px_20px_rgba(255,45,60,0.3)] disabled:opacity-50"
              >
                {loading ? (
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>دریافت کد تایید</span>
                    <ArrowLeft className="size-4" strokeWidth={2.4} />
                  </>
                )}
              </motion.button>

              <p className="text-ink-5 mt-4 text-center text-[11px] leading-relaxed">
                با ورود به فروشگاه، قوانین و مقررات حریم خصوصی را می‌پذیرید.
              </p>
            </form>
          ) : (
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-2xl bg-brand/10 border border-brand/20 text-brand">
                    <KeyRound className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-[19px] font-black text-white">کد تایید پیامکی</h2>
                    <p className="text-ink-4 text-[12px] mt-0.5">
                      ارسال شده به {toFaDigits(phone)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-center gap-3 dir-ltr" dir="ltr">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpInputRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i]}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="glass size-13 text-center text-[22px] font-black text-white rounded-2xl border border-white/10 focus:border-brand/70 focus:bg-white/10 outline-none transition-all"
                      disabled={loading}
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-brand text-center text-[11.5px] mt-3">
                    {error}
                  </p>
                )}
              </div>

              {/* Timer / Resend */}
              <div className="mt-6 flex items-center justify-between text-[12px]">
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-ink-4 hover:text-white transition-colors"
                >
                  تغییر شماره
                </button>

                {countdown > 0 ? (
                  <span className="text-ink-4">
                    ارسال مجدد کد تا {formatTimer(countdown)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      requestOtp(phone.trim()).then((r) => setCountdown(r.expires_in || 120));
                    }}
                    className="text-brand hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>ارسال مجدد کد</span>
                  </button>
                )}
              </div>

              <motion.button
                type="button"
                onClick={() => submitVerify(otp.join(""))}
                disabled={loading || otp.some((d) => d === "")}
                whileTap={{ scale: 0.98 }}
                className="glass-brand mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-bold text-white shadow-[0_4px_20px_rgba(255,45,60,0.3)] disabled:opacity-50"
              >
                {loading ? (
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>تایید و ورود</span>
                    <CheckCircle2 className="size-4" strokeWidth={2.4} />
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

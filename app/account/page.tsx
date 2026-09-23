"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  UserRound,
  Package,
  Sparkles,
  Gift,
  Share2,
  LogOut,
  ChevronLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Edit3,
  Copy,
  Check,
  Ticket,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { formatIrrAsToman } from "@/lib/api";
import { toFaDigits } from "@/lib/format";
import type { ClubDashboard, ClubReward, CustomerCoupon, CustomerOrder } from "@/lib/types";

export default function AccountPage() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState<"orders" | "club" | "profile">("orders");

  // Orders State
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Club State
  const [clubDashboard, setClubDashboard] = useState<ClubDashboard | null>(null);
  const [rewards, setRewards] = useState<ClubReward[]>([]);
  const [coupons, setCoupons] = useState<CustomerCoupon[]>([]);
  const [clubLoading, setClubLoading] = useState(false);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Profile Edit State
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (auth.customer) {
      setDisplayName(auth.customer.display_name || "");
      setEmail(auth.customer.email || "");
    }
  }, [auth.customer]);

  // Load orders when orders tab active
  useEffect(() => {
    if (auth.token && activeTab === "orders") {
      setOrdersLoading(true);
      auth
        .fetchOrders()
        .then((res) => setOrders(res.data || []))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [auth.token, activeTab]);

  // Load club when club tab active
  useEffect(() => {
    if (auth.token && activeTab === "club") {
      setClubLoading(true);
      Promise.all([
        auth.fetchClubDashboard(),
        auth.fetchClubRewards(),
        auth.fetchClubCoupons(),
      ])
        .then(([dash, rew, coup]) => {
          setClubDashboard(dash);
          setRewards(rew);
          setCoupons(coup);
        })
        .finally(() => setClubLoading(false));
    }
  }, [auth.token, activeTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileSuccess(false);
      await auth.updateProfile({
        display_name: displayName.trim() || null,
        email: email.trim() || null,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error("Profile save error:", err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleRedeem = async (rewardId: number) => {
    try {
      setRedeemingId(rewardId);
      await auth.redeemReward(rewardId);
      // Reload club data
      const [dash, rew, coup] = await Promise.all([
        auth.fetchClubDashboard(),
        auth.fetchClubRewards(),
        auth.fetchClubCoupons(),
      ]);
      setClubDashboard(dash);
      setRewards(rew);
      setCoupons(coup);
    } catch (err: any) {
      alert(err.message || "خطا در دریافت پاداش");
    } finally {
      setRedeemingId(null);
    }
  };

  const handleCopyReferral = () => {
    if (!clubDashboard?.referral.code) return;
    navigator.clipboard.writeText(clubDashboard.referral.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!auth.isLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-9 border-2 border-white/20 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  // If user is not logged in
  if (!auth.customer) {
    return (
      <div className="mx-auto max-w-[560px] px-5 pt-8 pb-20 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-8 text-center border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="mx-auto grid size-18 place-items-center rounded-2xl bg-brand/15 border border-brand/30 text-brand shadow-[0_0_24px_rgba(255,45,60,0.25)]">
            <UserRound className="size-8 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-[22px] font-black text-white mt-5">ورود به حساب کاربری</h1>
          <p className="text-ink-3 text-[13px] mt-2 max-w-[360px] mx-auto leading-relaxed">
            برای پیگیری سفارش‌ها، مشاهده کدهای تخفیف و امتیازات باشگاه مشتریان وارد شوید.
          </p>

          <motion.button
            type="button"
            onClick={() => auth.openLogin("/account")}
            whileTap={{ scale: 0.98 }}
            className="glass-brand mt-6 w-full rounded-2xl py-4 text-[14.5px] font-bold text-white shadow-[0_4px_24px_rgba(255,45,60,0.35)]"
          >
            ورود سریع با شماره موبایل
          </motion.button>
        </motion.div>

        <div className="mt-8 text-center">
          <Link href="/shop" className="text-brand text-[13px] font-bold hover:underline">
            بازگشت به فروشگاه و محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[880px] px-5 pt-6 pb-20 lg:pt-10">
      {/* Profile Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-7 border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.4)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="glass-brand grid size-16 place-items-center rounded-2xl text-white shadow-[0_0_20px_rgba(255,45,60,0.3)]">
              <UserRound className="size-7" strokeWidth={1.8} />
            </span>
            <div>
              <div className="text-[19px] font-black text-white">
                {auth.customer.display_name || "کاربر گرامی"}
              </div>
              <div className="text-ink-4 text-[12.5px] mt-0.5" dir="ltr">
                {toFaDigits(auth.customer.phone)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => auth.logout()}
            className="glass inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-bold text-rose-300 hover:bg-rose-500/15 transition-colors self-start sm:self-auto"
          >
            <LogOut className="size-4" />
            <span>خروج از حساب</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex gap-2 border-t border-white/8 pt-5 overflow-x-auto no-scrollbar">
          {[
            { key: "orders", label: "سفارش‌های من", icon: Package },
            { key: "club", label: "باشگاه مشتریان و پاداش‌ها", icon: Sparkles },
            { key: "profile", label: "ویرایش پروفایل", icon: Edit3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold whitespace-nowrap transition-all ${
                  active ? "text-white bg-white/12 shadow-[0_0_16px_rgba(255,255,255,0.08)]" : "text-ink-4 hover:text-ink-2"
                }`}
              >
                <Icon className={`size-4 ${active ? "text-brand" : "text-ink-4"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Contents */}
      <div className="mt-6">
        {/* TAB 1: ORDERS */}
        {activeTab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3.5">
            {ordersLoading ? (
              <div className="py-16 text-center text-ink-4 text-[13px]">در حال بارگذاری سفارش‌ها...</div>
            ) : orders.length === 0 ? (
              <div className="glass-panel rounded-3xl p-10 text-center border border-white/6">
                <Package className="size-12 text-ink-5 mx-auto mb-3" />
                <p className="text-ink-2 text-[14.5px] font-bold">هنوز هیچ سفارشی ثبت نکرده‌اید</p>
                <p className="text-ink-4 text-[12px] mt-1">محصولات مورد نظرتان را انتخاب و خرید کنید.</p>
                <Link
                  href="/shop"
                  className="glass-brand inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-[13px] font-bold text-white mt-5"
                >
                  <span>مشاهده فروشگاه</span>
                  <ChevronLeft className="size-4" />
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <Link
                  key={order.reference_number}
                  href={`/order/${order.reference_number}`}
                  className="glass-panel block rounded-2xl p-4 sm:p-5 border border-white/8 hover:border-white/18 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[13.5px] font-black text-white">
                          {order.reference_number}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            order.payment_status === "paid"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {order.status_label || (order.payment_status === "paid" ? "پرداخت شده" : "در انتظار پرداخت")}
                        </span>
                      </div>
                      <div className="text-ink-4 text-[12px] mt-1">
                        {toFaDigits(order.items_count)} قلم کالا · {new Date(order.created_at).toLocaleDateString("fa-IR")}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-white/6 pt-2 sm:border-0 sm:pt-0">
                      <div className="text-left">
                        <span className="text-white text-[15px] font-black">{formatIrrAsToman(order.total_amount)}</span>
                      </div>
                      <ChevronLeft className="size-4 text-ink-4" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </motion.div>
        )}

        {/* TAB 2: CLUB & LOYALTY */}
        {activeTab === "club" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {clubLoading ? (
              <div className="py-16 text-center text-ink-4 text-[13px]">در حال دریافت اطلاعات باشگاه...</div>
            ) : (
              <>
                {/* Points & Tier Card */}
                <div className="glass-panel relative overflow-hidden rounded-3xl p-6 border border-brand/25 bg-gradient-to-br from-brand/10 via-white/[0.02] to-transparent shadow-[0_8px_32px_rgba(255,45,60,0.15)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-ink-4 text-[12px] font-medium">موجودی امتیاز باشگاه مشتریان</div>
                      <div className="text-[34px] font-black text-white mt-0.5 flex items-baseline gap-2">
                        {toFaDigits(clubDashboard?.points_balance || 0)}
                        <span className="text-brand text-[14px] font-bold">امتیاز</span>
                      </div>
                    </div>
                    {clubDashboard?.current_tier && (
                      <div className="glass rounded-2xl px-4 py-2.5 border border-white/10 self-start sm:self-auto">
                        <div className="text-ink-4 text-[10.5px]">سطح عضویت شما</div>
                        <div className="text-white text-[14px] font-bold mt-0.5">
                          {clubDashboard.current_tier.display_name} (ضریب {toFaDigits(clubDashboard.current_tier.point_multiplier)}x)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Next Tier Progress Bar */}
                  {clubDashboard?.next_tier && (
                    <div className="mt-5 pt-4 border-t border-white/8">
                      <div className="flex justify-between text-[11.5px] text-ink-3 mb-1.5">
                        <span>ارتقا به سطح {clubDashboard.next_tier.display_name}</span>
                        <span>{toFaDigits(clubDashboard.next_tier.points_needed)} امتیاز دیگر</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full transition-all duration-500"
                          style={{ width: `${clubDashboard.next_tier.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Referral Code Box */}
                {clubDashboard?.referral?.code && (
                  <div className="glass-panel rounded-3xl p-5 border border-white/8">
                    <div className="flex items-center gap-2.5 text-[14px] font-bold text-white mb-2">
                      <Share2 className="size-4 text-brand" />
                      <span>دعوت از دوستان و دریافت پاداش</span>
                    </div>
                    <p className="text-ink-4 text-[12px] leading-relaxed mb-3.5">
                      کد معرف اختصاصی خود را با دوستانتان به اشتراک بگذارید تا پس از اولین خرید آنها، امتیاز هدیه بگیرید.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="glass font-mono flex-1 rounded-xl px-4 py-2.5 text-[14px] font-black text-brand tracking-widest text-center">
                        {clubDashboard.referral.code}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyReferral}
                        className="glass rounded-xl px-4 py-2.5 text-[12.5px] font-bold text-white hover:bg-white/10 inline-flex items-center gap-1.5"
                      >
                        {copiedCode ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                        <span>{copiedCode ? "کپی شد" : "کپی کد"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Active Coupons */}
                {coupons.length > 0 && (
                  <div>
                    <h3 className="text-white text-[15px] font-bold mb-3 flex items-center gap-2">
                      <Ticket className="size-4 text-brand" />
                      <span>کوپن‌های تخفیف فعال شما ({toFaDigits(coupons.length)})</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {coupons.map((c) => (
                        <div key={c.id} className="glass-panel rounded-2xl p-4 border border-white/8">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-brand font-black text-[14px] bg-brand/10 px-2.5 py-1 rounded-lg border border-brand/20">
                              {c.code}
                            </span>
                            <span className="text-white font-bold text-[13px]">
                              {c.type === "percentage" ? `${toFaDigits(c.value)}٪ تخفیف` : `${toFaDigits(c.value)} ریال`}
                            </span>
                          </div>
                          {c.description && <div className="text-ink-4 text-[11.5px] mt-2">{c.description}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Redeemable Rewards Catalog */}
                <div>
                  <h3 className="text-white text-[15px] font-bold mb-3 flex items-center gap-2">
                    <Gift className="size-4 text-brand" />
                    <span>پاداش‌های قابل دریافت</span>
                  </h3>
                  {rewards.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-6 text-center text-ink-4 text-[12.5px]">
                      در حال حاضر پاداش فعالی وجود ندارد.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {rewards.map((r) => (
                        <div key={r.id} className="glass-panel rounded-2xl p-4 border border-white/8 flex flex-col justify-between">
                          <div>
                            <div className="text-white font-bold text-[14px]">{r.name}</div>
                            {r.description && <div className="text-ink-4 text-[11.5px] mt-1">{r.description}</div>}
                          </div>
                          <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/6">
                            <span className="text-brand font-bold text-[13px]">
                              {toFaDigits(r.points_cost)} امتیاز
                            </span>
                            <button
                              type="button"
                              disabled={!r.is_redeemable || redeemingId === r.id}
                              onClick={() => handleRedeem(r.id)}
                              className="glass-brand rounded-xl px-3.5 py-1.5 text-[12px] font-bold text-white disabled:opacity-40"
                            >
                              {redeemingId === r.id ? "در حال دریافت..." : "دریافت پاداش"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* TAB 3: EDIT PROFILE */}
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <form onSubmit={handleSaveProfile} className="glass-panel rounded-3xl p-6 border border-white/8 space-y-4 max-w-[500px]">
              <h3 className="text-white text-[15px] font-bold mb-2">اطلاعات کاربری</h3>

              <div>
                <label className="text-ink-3 block text-[12px] mb-1.5 font-medium">نام و نام خانوادگی</label>
                <div className="glass rounded-2xl px-4">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="مثلاً سارا محمدی"
                    className="text-ink-1 h-12 w-full bg-transparent text-[13.5px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-ink-3 block text-[12px] mb-1.5 font-medium">آدرس ایمیل</label>
                <div className="glass rounded-2xl px-4">
                  <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="text-ink-1 h-12 w-full bg-transparent text-[13.5px] outline-none text-right"
                  />
                </div>
              </div>

              <div>
                <label className="text-ink-4 block text-[12px] mb-1.5">شماره موبایل (تایید شده)</label>
                <div className="glass rounded-2xl px-4 bg-white/[0.02] cursor-not-allowed">
                  <input
                    disabled
                    value={auth.customer.phone}
                    className="text-ink-4 h-12 w-full bg-transparent text-[13.5px] outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {profileSuccess && (
                <div className="text-emerald-400 text-[12px] flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" />
                  <span>اطلاعات پروفایل با موفقیت ذخیره شد.</span>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={profileSaving}
                whileTap={{ scale: 0.98 }}
                className="glass-brand mt-4 rounded-2xl px-6 py-3 text-[13.5px] font-bold text-white shadow-[0_4px_16px_rgba(255,45,60,0.3)] disabled:opacity-50"
              >
                {profileSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

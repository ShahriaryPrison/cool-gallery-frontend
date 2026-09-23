"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type {
  ClubDashboard,
  ClubReward,
  Customer,
  CustomerCoupon,
  CustomerOrder,
  Paginated,
} from "./types";
import { DEFAULT_STORE_SLUG } from "./api";

const proxyBase = (slug: string) => `/api/customer/${slug}`;

export interface AuthContextType {
  slug: string;
  customer: Customer | null;
  token: string | null;
  isLoaded: boolean;
  isLoginOpen: boolean;
  returnPath: string | null;
  openLogin: (returnPath?: string) => void;
  closeLogin: () => void;
  requestOtp: (phone: string) => Promise<{ expires_in: number }>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  setCustomer: (c: Customer | null) => void;
  updateProfile: (updates: {
    display_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  }) => Promise<Customer>;
  fetchOrders: (page?: number) => Promise<Paginated<CustomerOrder>>;
  fetchClubDashboard: () => Promise<ClubDashboard | null>;
  fetchClubRewards: () => Promise<ClubReward[]>;
  fetchClubCoupons: () => Promise<CustomerCoupon[]>;
  redeemReward: (rewardId: number) => Promise<{
    redemption_code: string;
    reward_name: string;
    points_spent: number;
    remaining_balance: number;
  }>;
  applyReferral: (code: string) => Promise<{ referrer_name?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function CustomerAuthProvider({
  slug = DEFAULT_STORE_SLUG,
  children,
}: {
  slug?: string;
  children: React.ReactNode;
}) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [returnPath, setReturnPath] = useState<string | null>(null);
  const router = useRouter();
  const storageKey = `auth:${slug}`;

  // Load profile on initial mount if token is stored
  useEffect(() => {
    const storedToken = localStorage.getItem(storageKey);
    if (!storedToken) {
      setIsLoaded(true);
      return;
    }

    fetchCustomerProfile(slug, storedToken)
      .then((profile) => {
        setToken(storedToken);
        setCustomer(profile);
      })
      .catch(() => {
        localStorage.removeItem(storageKey);
        setToken(null);
        setCustomer(null);
      })
      .finally(() => setIsLoaded(true));
  }, [slug, storageKey]);

  const openLogin = (path?: string) => {
    setReturnPath(path ?? null);
    setIsLoginOpen(true);
  };

  const closeLogin = () => {
    setIsLoginOpen(false);
    setReturnPath(null);
  };

  const requestOtp = async (phone: string): Promise<{ expires_in: number }> => {
    const res = await fetch(`${proxyBase(slug)}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    if (res.status === 429) {
      throw new Error("تعداد تلاش‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.");
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "خطا در ارسال کد تایید.");
    }

    const { data } = (await res.json()) as { data: { expires_in: number } };
    return { expires_in: data.expires_in || 120 };
  };

  const verifyOtp = async (phone: string, otp: string): Promise<void> => {
    const res = await fetch(`${proxyBase(slug)}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });

    if (res.status === 429) {
      throw new Error("تعداد تلاش‌های ناموفق بیش از حد مجاز بود. لطفاً مجدداً کد دریافت کنید.");
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "کد وارد شده اشتباه یا منقضی شده است.");
    }

    const { data } = (await res.json()) as {
      data: { token: string; customer: Customer };
    };

    setToken(data.token);
    setCustomer(data.customer);
    localStorage.setItem(storageKey, data.token);
    setIsLoginOpen(false);

    if (returnPath) {
      router.push(returnPath);
    }
    setReturnPath(null);
  };

  const logout = async (): Promise<void> => {
    if (token) {
      await fetch(`${proxyBase(slug)}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setToken(null);
    setCustomer(null);
    localStorage.removeItem(storageKey);
  };

  const updateProfile = async (updates: {
    display_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  }): Promise<Customer> => {
    if (!token) throw new Error("unauthorized");
    const updated = await updateCustomerProfile(slug, token, updates);
    setCustomer(updated);
    return updated;
  };

  const fetchOrders = async (page = 1): Promise<Paginated<CustomerOrder>> => {
    if (!token) throw new Error("unauthorized");
    return fetchCustomerOrders(slug, token, page);
  };

  const fetchClubDashboard = async (): Promise<ClubDashboard | null> => {
    if (!token) return null;
    const res = await fetch(`${proxyBase(slug)}/club`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  };

  const fetchClubRewards = async (): Promise<ClubReward[]> => {
    if (!token) return [];
    const res = await fetch(`${proxyBase(slug)}/club/rewards`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  };

  const fetchClubCoupons = async (): Promise<CustomerCoupon[]> => {
    if (!token) return [];
    const res = await fetch(`${proxyBase(slug)}/club/coupons`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  };

  const redeemReward = async (rewardId: number) => {
    if (!token) throw new Error("unauthorized");
    const res = await fetch(`${proxyBase(slug)}/club/rewards/${rewardId}/redeem`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "خطا در دریافت پاداش");
    }
    const json = await res.json();
    return json.data;
  };

  const applyReferral = async (code: string) => {
    if (!token) throw new Error("unauthorized");
    const res = await fetch(`${proxyBase(slug)}/club/referrals/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ referral_code: code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "کد معرف نامعتبر است");
    }
    const json = await res.json();
    return json.data;
  };

  return (
    <AuthContext.Provider
      value={{
        slug,
        customer,
        token,
        isLoaded,
        isLoginOpen,
        returnPath,
        openLogin,
        closeLogin,
        requestOtp,
        verifyOtp,
        logout,
        setCustomer,
        updateProfile,
        fetchOrders,
        fetchClubDashboard,
        fetchClubRewards,
        fetchClubCoupons,
        redeemReward,
        applyReferral,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within CustomerAuthProvider");
  }
  return ctx;
}

// ─── Direct Helper Calls through Proxy ───────────────────────────────────────

export async function fetchCustomerProfile(
  slug: string,
  token: string
): Promise<Customer> {
  const res = await fetch(`${proxyBase(slug)}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("unauthorized");
  const { data } = (await res.json()) as { data: Customer };
  return data;
}

export async function updateCustomerProfile(
  slug: string,
  token: string,
  updates: {
    display_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  }
): Promise<Customer> {
  const res = await fetch(`${proxyBase(slug)}/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.message ?? "update_failed"), {
      status: res.status,
      body,
    });
  }
  const { data } = (await res.json()) as { data: Customer };
  return data;
}

export async function fetchCustomerOrders(
  slug: string,
  token: string,
  page = 1
): Promise<Paginated<CustomerOrder>> {
  const res = await fetch(`${proxyBase(slug)}/orders?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("unauthorized");
  return res.json() as Promise<Paginated<CustomerOrder>>;
}

import type { Metadata } from "next";
import SamanAutoSubmitForm from "./SamanAutoSubmitForm";

export const metadata: Metadata = {
  title: "در حال اتصال به درگاه پرداخت سامان",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function SamanRedirectPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-24 text-center" dir="rtl">
        <p className="text-sm text-red-400">توکن پرداخت یافت نشد. لطفاً به سبد خرید بازگردید و دوباره تلاش کنید.</p>
      </div>
    );
  }

  return <SamanAutoSubmitForm token={token} />;
}

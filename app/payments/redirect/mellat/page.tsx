import type { Metadata } from "next";
import MellatAutoSubmitForm from "./MellatAutoSubmitForm";

export const metadata: Metadata = {
  title: "در حال اتصال به درگاه پرداخت ملت",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ ref_id?: string }>;
}

export default async function MellatRedirectPage({ searchParams }: Props) {
  const { ref_id } = await searchParams;

  if (!ref_id) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-24 text-center" dir="rtl">
        <p className="text-sm text-red-400">شناسه مرجع پرداخت یافت نشد. لطفاً به سبد خرید بازگردید و دوباره تلاش کنید.</p>
      </div>
    );
  }

  return <MellatAutoSubmitForm refId={ref_id} />;
}

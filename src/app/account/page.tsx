import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { AccountView } from "@/components/account/account-view";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "حساب کاربری", robots: PRIVATE_ROBOTS };

export default function AccountPage() {
  return (
    <div className="container-page pt-5 md:pt-8">
      <PageHeader
        title="حساب کاربری"
        crumbs={[{ label: "حساب کاربری" }]}
        description="نسخه‌ی نمایشی حساب کاربری؛ ورود و ثبت‌نام پس از اتصال به سرویس احراز هویت فعال می‌شود."
      />
      <AccountView />
    </div>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { DemoBadge } from "@/components/ui/demo-badge";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "تکمیل سفارش (نمایشی)", robots: PRIVATE_ROBOTS };

export default function CheckoutPage() {
  return (
    <div className="container-page pt-5 md:pt-8">
      <PageHeader
        title="تکمیل سفارش"
        crumbs={[{ href: "/cart", label: "سبد خرید" }, { label: "تکمیل سفارش" }]}
        description="اطلاعات گیرنده و نشانی را وارد کنید. این فرایند نمایشی است و هیچ پرداخت یا سفارش واقعی ثبت نمی‌شود."
      >
        <DemoBadge className="mt-4">تسویه‌حساب نمایشی</DemoBadge>
      </PageHeader>
      <CheckoutForm />
    </div>
  );
}

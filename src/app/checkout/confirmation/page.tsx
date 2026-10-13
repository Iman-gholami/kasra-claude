import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmationView } from "@/components/checkout/confirmation-view";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "تأیید سفارش آزمایشی", robots: PRIVATE_ROBOTS };

export default function ConfirmationPage() {
  return (
    <div className="container-page pt-10 md:pt-16">
      <Suspense fallback={<div className="mx-auto h-96 max-w-2xl animate-pulse rounded-sm bg-sand-soft" />}>
        <ConfirmationView />
      </Suspense>
    </div>
  );
}

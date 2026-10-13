"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Hook for future error monitoring (e.g. a self-hosted Sentry/GlitchTip instance).
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <h1 className="text-2xl font-extrabold">مشکلی پیش آمد</h1>
      <p className="mt-3 max-w-md leading-8 text-ink-soft">بارگذاری این بخش با خطا مواجه شد. لطفاً دوباره تلاش کنید.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>تلاش دوباره</Button>
        <ButtonLink href="/" variant="secondary">
          صفحه‌ی اصلی
        </ButtonLink>
      </div>
    </div>
  );
}

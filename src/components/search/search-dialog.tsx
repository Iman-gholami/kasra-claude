"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SearchSuggestions } from "@/types/catalog";
import { uiActions, useUi } from "@/features/ui/ui-store";
import { formatNumber } from "@/lib/persian";
import { Price } from "@/components/ui/price";
import { cn } from "@/lib/cn";

const POPULAR = ["مانتو لینن", "شومیز ساتن", "تیشرت اورسایز", "بارانی", "کرپ", "یقه‌اسکی"];
const QUICK_CATEGORIES = [
  { href: "/category/shomiz", label: "شومیز" },
  { href: "/category/manto", label: "مانتو" },
  { href: "/category/tshirt", label: "تیشرت" },
];
const DEBOUNCE_MS = 180;

interface Option {
  id: string;
  href: string;
}

/**
 * Search overlay with typeahead suggestions (combobox + listbox pattern).
 * Suggestions come from /api/search, so only a handful of lightweight results
 * ever reach the browser — there is no client-side search index.
 */
export default function SearchDialog() {
  const open = useUi((s) => s.searchOpen);
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchSuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const trimmed = query.trim();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.select();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!trimmed) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        if (res.ok) setResult((await res.json()) as SearchSuggestions);
      } catch {
        // Aborted or offline: keep the previous suggestions.
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [trimmed]);

  const visible = trimmed && result?.query === trimmed ? result : null;
  const allResultsHref = `/search?q=${encodeURIComponent(trimmed)}`;

  const options = useMemo<Option[]>(() => {
    if (!visible) return [];
    return [
      ...visible.categories.map((c) => ({ id: `cat-${c.slug}`, href: `/category/${c.slug}` })),
      ...visible.products.map((p) => ({ id: `prod-${p.id}`, href: `/product/${p.slug}` })),
      ...(visible.total > 0 ? [{ id: "all", href: allResultsHref }] : []),
    ];
  }, [visible, allResultsHref]);

  const close = () => {
    uiActions.closeSearch();
    setActive(-1);
  };

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      // A search input swallows Escape to clear itself; close the overlay instead.
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" && options.length) {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp" && options.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && options[active]) go(options[active].href);
      else if (trimmed) go(allResultsHref);
    }
  };

  const optionProps = (id: string) => {
    const index = options.findIndex((o) => o.id === id);
    return {
      id: `${listboxId}-${id}`,
      role: "option" as const,
      "aria-selected": index === active,
      onMouseEnter: () => setActive(index),
      className: cn("flex items-center gap-3 rounded-sm px-3 py-2.5 transition-colors", index === active ? "bg-sand-soft" : "hover:bg-sand-soft"),
    };
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="جستجوی محصولات"
      onClose={close}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="fixed inset-x-0 top-0 z-50 m-0 h-dvh w-full overflow-hidden bg-canvas opacity-0 outline-none transition-[opacity,translate,display,overlay] transition-discrete duration-200 open:opacity-100 starting:open:-translate-y-2 starting:open:opacity-0 md:h-auto md:max-h-[85dvh] md:shadow-lift"
    >
      <div className="container-page flex h-full max-w-3xl flex-col py-3 md:py-5">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed) go(allResultsHref);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input
              ref={inputRef}
              type="search"
              name="q"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(-1);
              }}
              onKeyDown={onKeyDown}
              placeholder="جستجوی شومیز، مانتو، تیشرت…"
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-label="عبارت جستجو"
              aria-expanded={options.length > 0}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 && options[active] ? `${listboxId}-${options[active].id}` : undefined}
              className="h-13 w-full rounded-full border border-line-strong bg-surface ps-12 pe-12 text-base outline-none transition-[border-color,box-shadow] placeholder:text-ink-muted focus:border-ink focus:ring-2 focus:ring-ink/10"
            />
            {loading ? (
              <LoaderCircle className="absolute top-1/2 left-4 size-5 -translate-y-1/2 animate-spin text-ink-muted" aria-hidden />
            ) : query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute top-1/2 left-2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-sand-soft hover:text-ink"
                aria-label="پاک کردن عبارت جستجو"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
          <button type="button" onClick={close} className="h-11 shrink-0 rounded-full px-3 text-sm font-medium text-ink-soft hover:text-ink">
            انصراف
          </button>
        </form>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
          {!trimmed ? (
            <div className="space-y-7 px-1">
              <section>
                <h2 className="text-sm font-bold text-ink-soft">جستجوهای پیشنهادی</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {POPULAR.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(term);
                          inputRef.current?.focus();
                        }}
                        className="h-10 rounded-full border border-line bg-surface px-4 text-sm transition-colors hover:border-ink"
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="text-sm font-bold text-ink-soft">دسته‌بندی‌ها</h2>
                <ul className="mt-3 grid grid-cols-3 gap-2">
                  {QUICK_CATEGORIES.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href} onClick={close} className="flex h-12 items-center justify-center rounded-sm bg-sand-soft text-[0.9375rem] font-semibold hover:bg-sand">
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : visible && visible.total === 0 ? (
            <div className="px-1 py-8 text-center">
              <p className="font-semibold">نتیجه‌ای برای «{trimmed}» پیدا نشد.</p>
              <p className="mt-2 text-sm text-ink-soft">املای کلمه را بررسی کنید یا عبارت کوتاه‌تری مثل «مانتو» یا «لینن» را امتحان کنید.</p>
            </div>
          ) : (
            <div id={listboxId} role="listbox" aria-label="پیشنهادهای جستجو" className="space-y-4">
              {visible?.categories.length ? (
                <div role="group" aria-label="دسته‌بندی‌ها">
                  <p className="px-3 pb-1 text-xs font-bold text-ink-muted" aria-hidden>
                    دسته‌بندی‌ها
                  </p>
                  {visible.categories.map((c) => (
                    <Link key={c.slug} href={`/category/${c.slug}`} onClick={close} {...optionProps(`cat-${c.slug}`)}>
                      <span className="text-[0.9375rem] font-semibold">{c.name}</span>
                      <ArrowLeft className="ms-auto size-4 text-ink-muted" aria-hidden />
                    </Link>
                  ))}
                </div>
              ) : null}
              {visible?.products.length ? (
                <div role="group" aria-label="محصولات">
                  <p className="px-3 pb-1 text-xs font-bold text-ink-muted" aria-hidden>
                    محصولات
                  </p>
                  {visible.products.map((p) => (
                    <Link key={p.id} href={`/product/${p.slug}`} onClick={close} {...optionProps(`prod-${p.id}`)}>
                      <span className="relative block aspect-[3/4] w-12 shrink-0 overflow-hidden rounded-xs bg-sand-soft">
                        <Image src={p.image.src} alt="" fill sizes="48px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.9375rem] font-medium">{p.name}</span>
                        <Price price={p.price} compareAtPrice={p.compareAtPrice} showDiscount={false} className="mt-0.5" />
                      </span>
                      {!p.inStock ? <span className="shrink-0 text-xs text-ink-muted">ناموجود</span> : null}
                    </Link>
                  ))}
                </div>
              ) : null}
              {visible && visible.total > 0 ? (
                <Link href={allResultsHref} onClick={close} {...optionProps("all")}>
                  <span className="text-[0.9375rem] font-semibold">
                    نمایش همه‌ی نتایج برای «{trimmed}» ({formatNumber(visible.total)})
                  </span>
                  <ArrowLeft className="ms-auto size-4" aria-hidden />
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}

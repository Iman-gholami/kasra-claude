import type { Metadata } from "next";
import Form from "next/form";
import { Search } from "lucide-react";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CatalogSkeleton, CatalogView } from "@/components/catalog/catalog-view";
import { queryCatalog } from "@/lib/catalog";
import { parseCatalogSearchParams } from "@/lib/catalog/search-params";

export const metadata: Metadata = {
  title: "جستجو",
  description: "جستجو در محصولات بوتیک کسرا",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="container-page pt-5 md:pt-8">
      <Breadcrumbs items={[{ label: "جستجو" }]} />
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function SearchForm({ defaultValue }: { defaultValue?: string }) {
  return (
    <Form action="/search" role="search" className="relative mt-6 max-w-2xl">
      <label htmlFor="search-page-q" className="sr-only">
        عبارت جستجو
      </label>
      <Search className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink-muted" aria-hidden />
      <input
        id="search-page-q"
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="جستجوی شومیز، مانتو، تیشرت…"
        enterKeyHint="search"
        className="h-13 w-full rounded-full border border-line-strong bg-surface ps-12 pe-28 text-base outline-none placeholder:text-ink-muted focus:border-ink focus:ring-2 focus:ring-ink/10"
      />
      <button type="submit" className="absolute top-1.5 left-1.5 h-10 rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-[#3a3633]">
        جستجو
      </button>
    </Form>
  );
}

function SearchSkeleton() {
  return (
    <>
      <div className="mt-8 h-10 w-56 rounded-xs bg-sand-soft" aria-hidden />
      <div className="mt-6 mb-10 h-13 max-w-2xl rounded-full bg-sand-soft" aria-hidden />
      <CatalogSkeleton />
    </>
  );
}

async function SearchResults({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const query = parseCatalogSearchParams(await searchParams);
  if (!query.q) {
    return (
      <>
        <h1 className="mt-8 text-[1.75rem] font-extrabold tracking-tight md:text-4xl">جستجو</h1>
        <SearchForm />
        <p className="mt-6 text-ink-soft">نام محصول، دسته‌بندی، جنس پارچه یا رنگ موردنظرتان را جستجو کنید.</p>
      </>
    );
  }
  const result = await queryCatalog(query);
  return (
    <>
      <h1 className="mt-8 text-[1.75rem] font-extrabold tracking-tight md:text-4xl">
        نتایج جستجو برای «<span className="text-rose-deep">{query.q}</span>»
      </h1>
      <SearchForm defaultValue={query.q} />
      <div className="mt-10">
        <CatalogView basePath="/search" query={query} result={result} showCategories />
      </div>
    </>
  );
}

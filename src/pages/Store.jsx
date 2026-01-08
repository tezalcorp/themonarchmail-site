// components/Store.jsx — Sidebar filters + OR logic + selected chips + extra categories

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, ExternalLink, X, Filter } from "lucide-react";

// ---- helpers ----
function stripHtml(html, maxLen = 180) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = (div.textContent || "").replace(/\s+/g, " ").trim();
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
}
function formatMoney(value) {
  const n = Number(value ?? 0);
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
const norm = (s) => {
  if (s == null) return "";
  if (typeof s === "string") return s.toLowerCase();
  if (Array.isArray(s)) return s.join(" ").toLowerCase();
  try { return String(s).toLowerCase(); } catch { return ""; }
};
const getTags = (p) => {
  const t = p?.tags;
  if (!t) return [];
  if (Array.isArray(t)) return t.map((x) => norm(x)).filter(Boolean);
  return String(t).split(",").map((x) => norm(x).trim()).filter(Boolean);
};

// Category keywords (extend as you like)
const CATEGORY_KEYWORDS = {
  cards:   ["card", "cards", "greeting", "note card", "notecard", "stationery"],
  soap:    ["soap", "handmade soap", "bar soap"],
  flowers: ["flower", "flowers", "floral", "bouquet", "arrangement", "botanical"],
  boards:  ["board", "charcuterie", "cutting board", "serving board", "cheese board"],
  candles: ["candle", "candles", "soy candle", "scented candle"],
  mugs:    ["mug", "mugs", "coffee mug", "tea mug"],
  puzzles: ["puzzle", "puzzles", "jigsaw"],
};

const CATEGORY_LIST = ["cards", "soap", "flowers", "boards", "candles", "mugs", "puzzles"];

const productMatchesCategory = (p, cat) => {
  const keys = CATEGORY_KEYWORDS[cat] || [];
  const hay = [norm(p?.title), norm(p?.product_type), norm(p?.handle), ...getTags(p)].join(" ");
  return keys.some((k) => hay.includes(k));
};

export default function Store() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [page, setPage]         = useState(1);

  // sidebar UI
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // filters
  const [query, setQuery]               = useState("");
  const [inStockOnly, setInStockOnly]   = useState(false);
  const [selectedCats, setSelectedCats] = useState(new Set());
  const [sortKey, setSortKey]           = useState("none"); // none | price-asc | price-desc | discount-desc

  // data fetch
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `https://groupoutfitters.com/collections/holiday-gifts/products.json?page=${encodeURIComponent(page)}&limit=30`;
        const res = await fetch(url, { signal: controller.signal, headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [page]);

  const discountedAmount = (p) => {
    const v0 = p.variants?.[0];
    if (!v0) return 0;
    const price = Number(v0.price || 0);
    const compare = Number(v0.compare_at_price || 0);
    return compare > price ? compare - price : 0;
  };

  const toggleCat = (c) => {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };
  const removeCat = (c) => {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      next.delete(c);
      return next;
    });
  };
  const clearFilters = () => {
    setSelectedCats(new Set());
    setQuery("");
    setInStockOnly(false);
    setSortKey("none");
  };

  const filteredSorted = useMemo(() => {
    let out = [...products];

    // Search
    if (query.trim()) {
      const q = norm(query);
      out = out.filter((p) => {
        const hay = `${norm(p.title)} ${norm(p.product_type)} ${norm(p.handle)} ${getTags(p).join(" ")}`;
        return hay.includes(q);
      });
    }

    // Categories — OR (match ANY)
    if (selectedCats.size > 0) {
      out = out.filter((p) => {
        for (const c of selectedCats) if (productMatchesCategory(p, c)) return true;
        return false;
      });
    }

    // In-stock
    if (inStockOnly) out = out.filter((p) => !!(p.variants?.[0]?.available ?? true));

    // Sort
    if (sortKey === "price-asc" || sortKey === "price-desc") {
      out.sort((a, b) => {
        const pa = Number(a.variants?.[0]?.price || 0);
        const pb = Number(b.variants?.[0]?.price || 0);
        return sortKey === "price-asc" ? pa - pb : pb - pa;
      });
    } else if (sortKey === "discount-desc") {
      out.sort((a, b) => discountedAmount(b) - discountedAmount(a));
    }

    return out;
  }, [products, query, selectedCats, inStockOnly, sortKey]);

  const chips = useMemo(() => {
    const c = [];

    // category chips
    for (const cat of selectedCats) {
      c.push(
        <button
          key={`cat-${cat}`}
          onClick={() => removeCat(cat)}
          className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
          title="Remove"
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
          <X className="w-3 h-3" />
        </button>
      );
    }

    // search chip
    if (query.trim()) {
      c.push(
        <button
          key="chip-search"
          onClick={() => setQuery("")}
          className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
          title="Clear search"
        >
          Search: “{query}”
          <X className="w-3 h-3" />
        </button>
      );
    }

    // stock chip
    if (inStockOnly) {
      c.push(
        <button
          key="chip-stock"
          onClick={() => setInStockOnly(false)}
          className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
          title="Show all stock"
        >
          In stock
          <X className="w-3 h-3" />
        </button>
      );
    }

    return c;
  }, [selectedCats, query, inStockOnly]);

  const cards = useMemo(() => {
    return filteredSorted.map((p) => {
      const v0 = p.variants?.[0];
      const price = v0 ? Number(v0.price) : 0;
      const compare = v0?.compare_at_price ? Number(v0.compare_at_price) : null;
      const mainImage = p.images?.[0]?.src || p.image?.src || "";
      const inStock = !!(v0?.available ?? true);
      const url = `https://groupoutfitters.com/products/${p.handle}`;

      return (
        <Card key={p.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
          {mainImage && (
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img
                loading="lazy"
                src={mainImage}
                alt={p.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-xl line-clamp-2">{p.title}</CardTitle>
              {!inStock && <Badge variant="destructive">Out of Stock</Badge>}
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-purple-700">{formatMoney(price)}</div>
              {compare && compare > price && (
                <div className="text-sm text-gray-500 line-through">{formatMoney(compare)}</div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {p.body_html && <p className="text-gray-600 text-sm mb-4 line-clamp-3">{stripHtml(p.body_html)}</p>}
            <a href={url} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled={!inStock}>
                {inStock ? <>Buy Now<ExternalLink className="w-4 h-4 ml-2" /></> : "Out of Stock"}
              </Button>
            </a>
          </CardContent>
        </Card>
      );
    });
  }, [filteredSorted]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-br from-purple-900 to-purple-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Holiday Gifts</h1>
          <p className="text-lg text-purple-100 max-w-3xl mx-auto">
            Perfect gifts for everyone on your list
          </p>
        </div>
      </section>

      {/* CONTENT: sidebar + grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            {/* SIDEBAR */}
            <aside className="w-full md:w-72 md:shrink-0">
              {/* Mobile toggle */}
              <div className="md:hidden mb-4">
                <Button variant="outline" className="w-full" onClick={() => setSidebarOpen((s) => !s)}>
                  <Filter className="w-4 h-4 mr-2" />
                  {sidebarOpen ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>

              <div className={`rounded-xl border bg-white p-4 ${sidebarOpen ? "" : "hidden md:block"} md:sticky md:top-6`}>
                {/* Search */}
                <div className="mb-5">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    id="search"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Search by name, tags, type…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {/* Categories */}
                <div className="mb-5">
                  <div className="text-sm font-semibold text-gray-800 mb-2">Categories</div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_LIST.map((cat) => (
                      <Button
                        key={cat}
                        type="button"
                        variant={selectedCats.has(cat) ? "default" : "outline"}
                        onClick={() => toggleCat(cat)}
                        className="rounded-full"
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Button>
                    ))}
                  </div>
                  {selectedCats.size > 0 && (
                    <p className="mt-2 text-xs text-gray-500">Matching any selected category (OR)</p>
                  )}
                </div>

                {/* In-stock */}
                <div className="mb-5">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    In stock only
                  </label>
                </div>

                {/* Sort */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="none">None</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                    <option value="discount-desc">Best Discount</option>
                  </select>
                </div>

                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1">
              {/* Selected filter chips */}
              {(chips.length > 0) && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {chips}
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
                    title="Clear all"
                  >
                    Clear all
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse rounded-xl border bg-white overflow-hidden">
                      <div className="aspect-square bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-5 bg-gray-200 rounded w-1/3" />
                        <div className="h-10 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Couldn’t load products</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
                  <Button onClick={() => setPage((p) => p)} variant="outline">Try Again</Button>
                </div>
              ) : filteredSorted.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-600">
                      Showing {filteredSorted.length} item{filteredSorted.length === 1 ? "" : "s"} (page {page})
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                        Prev
                      </Button>
                      <span className="text-sm text-gray-700">Page {page}</span>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
                        Next
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{cards}</div>
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Products Found</h3>
                  <p className="text-gray-600 mb-8">Try clearing or changing your filters.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* FOOTER NOTE */}
      {products.length > 0 && (
        <section className="py-12 bg-purple-50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Shopping on Group Outfitters</h3>
            <p className="text-gray-600 mb-6">
              When you click "Buy Now", you'll be taken to Group Outfitters' secure checkout.
            </p>
            <a href="https://groupoutfitters.com/collections/holiday-gifts" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg">
                <ExternalLink className="w-5 h-5 mr-2" />
                Browse Full Collection
              </Button>
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

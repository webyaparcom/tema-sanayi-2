/* zaman-buyume-egri — Zaman Büyüme Eğrisi — değer eğrisi üzerinde kilometre taşları (16 Kas 2026 · mcp:webmaker/20261116-181132-t332 · D17).
   Üstte SVG büyüme eğrisi (alan dolgulu, kesik yatay ızgara): her dönem eğri üzerinde yıl etiketli bir nokta; altta aynı sırayla numaralı kartlar — yıl, büyük değer + birim (sayfa diliyle), başlık, metin. Karta ya da noktaya gelince ikisi birlikte vurgulanır; görünür olunca eğri soldan çizilir. Veride `deger` (+ `birim`) yoksa eğri yalnız biçimsel yükselir, değer satırı basılmaz. RTL'de eğri aynalanır.
   Üretici: scripts/modul-fabrika (aile timeline) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: data: [{ etiket (yıl/tarih), baslik, metin?, ikon?, img?, url? }] — metinler dil sözlüğü; başlıksız satır atlanır. */
const P = "modulex-zaman-buyume-egri";
const IMG_KOK = "/img/";
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: timeline --- */
const kayitlar = veri.map((o) => ({
  etiket: metinAl(o, ["etiket", "year", "yil", "tarih", "date"]), baslik: metinAl(o, ["baslik", "title", "name"]),
  metin: metinAl(o, ["metin", "text", "description", "aciklama"]), ikon: ikonAd(ilk(o, ["ikon", "icon"])),
  img: medyaUrl(ilk(o, ["img", "image"])), url: href(ilk(o, ["url", "link"])),
})).filter((k) => k.baslik);
const bH = (k, s, t) => `<${t || "h3"} class="${P}-${s || "kbaslik"}">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</${t || "h3"}>`;
const mH = (k, s) => (k.metin ? `<p class="${P}-${s || "kmetin"}">${satirlar(k.metin)}</p>` : "");
const yH = (k, s) => (k.etiket ? `<p class="${P}-${s || "yil"}">${esc(k.etiket)}</p>` : "");
const gH = (k, s) => (k.img ? `<img class="${P}-${s || "gorsel"}" src="${esc(k.img)}" alt="" width="800" height="560" loading="lazy" decoding="async" />` : "");
/* --- modül: zaman-buyume-egri --- */
const kart = () => "";
const sar = (ic, A) => {
    const R = veri.filter((o) => metinAl(o, ["baslik", "title", "name"]));
    const n = A.length;
    const D = A.map((k, i) => { const o = R[i] || {}; const h = ilk(o, ["deger", "value"]); const v = Number(String(h).replace(",", ".")); return { k, v: h !== "" && Number.isFinite(v) ? v : NaN, b: metinAl(o, ["birim", "unit"]) }; });
    const tam = D.every((d) => Number.isFinite(d.v));
    const Y = D.map((d, i) => (tam ? d.v : Math.pow(i + 1, 1.5)));
    const lo = Math.min(0, ...Y);
    const hi = Math.max(...Y);
    const pt = Y.map((y, i) => ({ x: n > 1 ? 7 + (86 * i) / (n - 1) : 50, y: 86 - ((y - lo) / (hi - lo || 1)) * 66 }));
    const f = (v) => v.toFixed(2);
    let yol = `M ${f(pt[0].x)} ${f(pt[0].y)}`;
    for (let i = 1; i < n; i++) { const a = pt[i - 1]; const b = pt[i]; const c = (a.x + b.x) / 2; yol += ` C ${f(c)} ${f(a.y)} ${f(c)} ${f(b.y)} ${f(b.x)} ${f(b.y)}`; }
    const alan = `${yol} L ${f(pt[n - 1].x)} 100 L ${f(pt[0].x)} 100 Z`;
    const izgara = [20, 40, 60, 80].map((y) => `<line x1="0" x2="100" y1="${y}" y2="${y}" />`).join("");
    const nokta = D.map((d, i) => `<span class="${P}-nokta" data-egri="${i}" style="--x: ${f(pt[i].x)}%; --y: ${f(pt[i].y)}%">${d.k.etiket ? `<span class="${P}-netiket"><bdi dir="ltr">${esc(d.k.etiket)}</bdi></span>` : ""}</span>`).join("");
    const kartlar = D.map((d, i) => `<li class="${P}-kart" data-egri="${i}"><p class="${P}-kust"><span class="${P}-sira">${no(i)}</span>${d.k.etiket ? `<span class="${P}-kyil"><bdi dir="ltr">${esc(d.k.etiket)}</bdi></span>` : ""}</p>${tam ? `<p class="${P}-deger">${esc(sayiBicim(d.v, d.v % 1 ? 1 : 0))}${d.b ? `<span class="${P}-birim">${esc(d.b)}</span>` : ""}</p>` : ""}${bH(d.k)}${mH(d.k)}</li>`).join("");
    return `<div class="${P}-grafik" aria-hidden="true"><svg class="${P}-svg" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false"><g class="${P}-izgara">${izgara}</g><path class="${P}-alan" d="${alan}" /><path class="${P}-hat" d="${yol}" /></svg>${nokta}</div><ol class="${P}-kartlar">${kartlar}</ol>`;
  };
const B = { ust: metinAl(des, ["ust","badge","kicker"]), baslik: metinAl(des, ["baslik","title"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !kayitlar.length;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = basHtml(B, "");
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";

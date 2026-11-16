/* sayac-donem-kiyas — Sayaç Dönem Kıyas — iki dönemli karne tablosu + dönem düğmesi (16 Kas 2026 · mcp:webmaker/20261116-113510-tlwf · D17).
   Rakamlar bir karne tablosunda: gösterge (ikon, etiket, not, oran çubuğu) | önceki dönem | güncel dönem | Δ değişim rozeti. Dönem düğmesi (önceki ↔ güncel) çubukları ve sütun vurgusunu çevirir. Satırda `onceki` (önceki dönem sayısı) ve desing `donem_a` / `donem_b` (dil sözlüğü) verilirse kıyas açılır; yoksa tek sütunlu karne.
   Üretici: scripts/modul-fabrika (aile stats) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: data: [{ sayi, onek?, sonek?, etiket, metin?, ikon?, ondalik?, max? }] — metinler dil sözlüğü; sayı geçersizse satır atlanır. */
const P = "modulex-sayac-donem-kiyas";
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
/* --- aile: stats --- */
const sayiAl = (v) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v ?? "").trim().replace(/\s/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null;
};
const ham = veri.map((o) => {
  const sv = ilk(o, ["sayi", "deger", "number", "value"]);
  const od = ilk(o, ["ondalik"]);
  const ondalik = od !== "" && Number.isInteger(Number(od)) ? Number(od) : (String(sv).split(".")[1] || "").length;
  return {
    sayi: sayiAl(sv), ondalik: Math.min(3, Math.max(0, ondalik)),
    onek: metinAl(o, ["onek", "prefix"]), sonek: metinAl(o, ["sonek", "suffix"]),
    etiket: metinAl(o, ["etiket", "label", "baslik", "title"]), metin: metinAl(o, ["metin", "aciklama", "description", "text"]),
    ikon: ikonAd(ilk(o, ["ikon", "icon"])), max: sayiAl(ilk(o, ["max", "hedef"])),
  };
}).filter((k) => k.sayi !== null && k.etiket);
const enBuyuk = Math.max(1, ...ham.map((k) => Math.abs(k.sayi)));
/* oran (0…1): max alanı > yüzde işareti (100) > listedeki en büyük sayı */
const kayitlar = ham.map((k) => {
  const tavan = k.max && k.max > 0 ? k.max : (/%/.test(k.onek + k.sonek) ? 100 : enBuyuk);
  return Object.assign(k, { oran: Math.min(1, Math.max(0, k.sayi / tavan)), bicimli: sayiBicim(k.sayi, k.ondalik) });
});
const sayiHtml = (k, s) => `<span class="${P}-${s || "sayi"}">`
  + (k.onek ? `<span class="${P}-ek">${esc(k.onek)}</span>` : "")
  + `<span data-hedef="${k.sayi}" data-ondalik="${k.ondalik}">${esc(k.bicimli)}</span>`
  + (k.sonek ? `<span class="${P}-ek">${esc(k.sonek)}</span>` : "") + "</span>";
const notH = (k) => (k.metin ? `<p class="${P}-not">${satirlar(k.metin)}</p>` : "");
/* --- modül: sayac-donem-kiyas --- */
const kart = () => "";
const sar = (ic, A, B) => {
    const R = veri.filter((o) => sayiAl(ilk(o, ["sayi", "deger", "number", "value"])) !== null && metinAl(o, ["etiket", "label", "baslik", "title"]));
    const da = metinAl(des, ["donem_a"]);
    const db = metinAl(des, ["donem_b"]);
    const S = A.map((k, i) => {
      const on = sayiAl(ilk(R[i] || {}, ["onceki", "previous"]));
      return { k, on, oa: on === null ? k.oran : (k.sayi ? Math.min(1, Math.max(0, (k.oran * on) / k.sayi)) : 0) };
    });
    const kiyas = S.some((x) => x.on !== null);
    const ekli = (k, v) => `${k.onek ? `<span class="${P}-ek">${esc(k.onek)}</span>` : ""}${v}${k.sonek ? `<span class="${P}-ek">${esc(k.sonek)}</span>` : ""}`;
    const deg = (x) => {
      if (x.on === null) return `<td class="${P}-h-f"></td>`;
      const d = x.k.sayi - x.on;
      const yon = d > 0 ? "art" : d < 0 ? "az" : "sabit";
      return `<td class="${P}-h-f" data-baslik="Δ"><span class="${P}-fark ${P}-fark--${yon}">${ikonH(d > 0 ? "trending_up" : d < 0 ? "trending_down" : "trending_flat", "")}${d > 0 ? "+" : d < 0 ? "−" : "±"}${esc(sayiBicim(Math.abs(d), x.k.ondalik))}</span></td>`;
    };
    const th = (t, c) => `<th scope="col" class="${P}-h-${c}">${t}</th>`;
    const ust = kiyas || db ? `<thead><tr>${th(B.baslik ? `<span class="${P}-gizli">${esc(B.baslik)}</span>` : "", "e")}${kiyas ? th(esc(da), "a") : ""}${th(esc(db), "b")}${kiyas ? th("Δ", "f") : ""}</tr></thead>` : "";
    const satir = S.map((x) => `<tr class="${P}-satir" style="--b: ${x.k.oran.toFixed(3)}; --a: ${x.oa.toFixed(3)}"><th scope="row" class="${P}-h-e"><span class="${P}-gosterge">${ikonH(x.k.ikon, `${P}-ikon`)}<span class="${P}-etiket">${esc(x.k.etiket)}</span></span>${notH(x.k)}<span class="${P}-iz" aria-hidden="true"><span class="${P}-dolu"></span></span></th>${kiyas ? `<td class="${P}-h-a" data-baslik="${esc(da)}">${x.on === null ? "" : `<span class="${P}-deger">${ekli(x.k, esc(sayiBicim(x.on, x.k.ondalik)))}</span>`}</td>` : ""}<td class="${P}-h-b" data-baslik="${esc(db)}">${sayiHtml(x.k, "deger")}</td>${kiyas ? deg(x) : ""}</tr>`).join("");
    const dug = kiyas && da && db ? `<div class="${P}-donem" role="group"${B.baslik ? ` aria-labelledby="${P}-{{id}}-b"` : ""} data-donem-grup hidden><button type="button" class="${P}-donem-d" data-donem="a" aria-pressed="false">${esc(da)}</button><button type="button" class="${P}-donem-d" data-donem="b" aria-pressed="true">${esc(db)}</button></div>` : "";
    return `<div class="${P}-karne">${dug}<table class="${P}-tablo">${ust}<tbody>${satir}</tbody></table></div>`;
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

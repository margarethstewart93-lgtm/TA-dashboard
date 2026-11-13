/* Fine print tools: read a supplier PDF in the browser and turn its terms
 * into a short, plain-English TL;DR that is easy to translate.
 * Exposes window.FinePrint.
 */
(() => {
  'use strict';

  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  let pdfjsPromise = null;
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    pdfjsPromise ||= new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = PDFJS;
      s.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        resolve(window.pdfjsLib);
      };
      s.onerror = () => { pdfjsPromise = null; reject(new Error('Could not load the PDF reader. Check your internet connection.')); };
      document.head.appendChild(s);
    });
    return pdfjsPromise;
  }

  /** Extract text from a PDF File. Resolves {text, pages}. */
  async function extractPdfText(file) {
    const pdfjsLib = await loadPdfJs();
    const data = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const out = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      let line = '';
      tc.items.forEach((it) => {
        line += it.str;
        line += it.hasEOL ? '\n' : (it.str && !/\s$/.test(it.str) ? ' ' : '');
      });
      out.push(line);
    }
    const text = out.join('\n\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    return { text, pages: pdf.numPages };
  }

  // ---------- Built-in (rule-based) summarizer ----------
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MON_RE = '(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';

  const CATEGORIES = [
    { key: 'payment', heading: 'DEPOSIT AND PAYMENT', re: /deposit|final payment|payment (is )?due|paid in full|balance due|installment/i },
    { key: 'cancel', heading: 'CANCELLATION AND CHANGES', re: /cancel|refund|non-?refundable|penalt|change fee|forfeit|name change|amendment/i },
    { key: 'dates', heading: 'KEY DATES', re: /\bbook(ed|ings?)? (by|between|from|no later|through|before)|valid (for|on) (new )?bookings|offer (is )?(valid|expires|ends)|expires?|sail(ings?)? (between|from|on)|travel (between|by|dates|from)|departures? (between|from|on)/i },
    { key: 'extra', heading: 'EXTRA COSTS (NOT INCLUDED)', re: /not included|does not include|do not include|excludes?|exclusive of|additional (cost|charge|fee)s?|extra (cost|charge|fee)s?|surcharge|fuel supplement|gratuit|plus (taxes|tax|fees|port)|(taxes|fees)[^.]{0,40}\b(additional|extra|apply)\b/i },
    { key: 'included', heading: 'PRICE AND WHAT IS INCLUDED', re: /includ|complimentary|\bfree\b|bonus|on-?board credit|\bOBC\b|upgrade|perk|amenit|\bfares?\b|per person|double occupancy|starting (at|from)|savings?|discount|\$\s?\d/i },
    { key: 'limits', heading: 'WHO QUALIFIES AND LIMITS', re: /combinable|combined with|eligib|restrict|blackout|capacity[- ]controlled|subject to availability|limited|first (and|&) second guests?|3rd|third|residents?|\bage\b|minimum|maximum|new (individual )?bookings|cannot be|may not|not (valid|applicable|available)|only|withdraw|change without notice|at any time/i },
  ];

  const GLOSSARY = [
    [/double occupancy/i, 'Double occupancy', 'Prices are for each person when 2 people share 1 room or cabin.'],
    [/(single|solo) (supplement|occupancy)/i, 'Single supplement', 'An extra charge for 1 person staying alone in a room or cabin.'],
    [/non-?refundable deposit|\bNRD\b/i, 'Non-refundable deposit', 'A deposit you do not get back if you cancel.'],
    [/on-?board credit|\bOBC\b/i, 'Onboard credit', 'Money you can spend on the ship. Usually it cannot be exchanged for cash.'],
    [/port (charges|fees|expenses)/i, 'Port charges', 'Fees from the ports the ship visits. Often not included in the price.'],
    [/gratuit/i, 'Gratuities', 'Tips for the crew or staff.'],
    [/capacity[- ]controlled/i, 'Capacity controlled', 'Only a limited number are available. The offer can end early.'],
    [/combinable|combined with/i, 'Combinable', 'Whether this offer can be used together with other offers.'],
    [/blackout/i, 'Blackout dates', 'Dates when the offer does not apply.'],
    [/final payment/i, 'Final payment', 'The date when the full price must be paid.'],
    [/(3rd|third) (and|&) (4th|fourth)/i, '3rd and 4th guests', 'Extra people who share the same room or cabin.'],
    [/air credit/i, 'Air credit', 'Money back if you book your own flights instead of the supplier\'s flights.'],
    [/deviation/i, 'Deviation', 'A change to the standard flights or dates. Usually there is a fee.'],
    [/fuel supplement/i, 'Fuel supplement', 'An extra charge the supplier may add if fuel prices go up.'],
    [/cruise[- ]only|cruise fare/i, 'Cruise fare / cruise only', 'The price for the cruise. It does not include flights.'],
    [/embark/i, 'Embarkation', 'The day and port where you get on the ship.'],
    [/disembark/i, 'Disembarkation', 'The day and port where you leave the ship.'],
    [/land (package|program|tour)/i, 'Land package', 'Hotels and tours on land before or after the cruise.'],
    [/price protection|price drop/i, 'Price protection', 'If the price goes down, you may get the lower price or a credit.'],
    [/\bcategory\b|stateroom category|cabin category/i, 'Category', 'The type and location of the room or cabin. Price depends on it.'],
  ];

  const pad = (n) => String(n).padStart(2, '0');
  function plain(s) {
    let t = s
      .replace(/\bpp\b\.?/gi, 'per person')
      .replace(/\bppdo\b/gi, 'per person, double occupancy')
      .replace(/\bw\/\s?/gi, 'with ')
      .replace(/\bincl\.?\b/gi, 'including')
      .replace(/\bapprox\.?\b/gi, 'about')
      .replace(/\s*[*†‡§¹²³]+\s*/g, ' ')
      .replace(/,?\s*(in|at) (its|their) sole discretion,?/gi, '')
      .replace(/\bprior to\b/gi, 'before')
      .replace(/\bin the event that\b/gi, 'if')
      .replace(/\bshall\b/gi, 'will')
      .replace(/\bcommence(s|d)?\b/gi, 'start$1')
      .replace(/\butiliz(e|es|ed)\b/gi, 'us$1')
      .replace(/\bpursuant to\b/gi, 'under')
      .replace(/\bnotwithstanding\b/gi, 'despite')
      .replace(/\bin addition to\b/gi, 'plus')
      .replace(/\ba minimum of\b/gi, 'at least')
      .replace(/\bUS\s?\$\s?/g, 'USD ')
      .replace(/\$\s?(\d)/g, 'USD $1')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (t.length > 260) {
      const cut = t.slice(0, 250);
      const at = Math.max(cut.lastIndexOf('; '), cut.lastIndexOf(', '));
      t = (at > 120 ? cut.slice(0, at) : cut.replace(/\s+\S*$/, '')) + ' …';
    }
    if (!/[.!?…]$/.test(t)) t += '.';
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function sentences(text) {
    const flat = text
      .replace(/ /g, ' ')
      .replace(/-\n(?=[a-z])/g, '')
      .replace(/\n\s*[•▪●◦■□➢✓*-]\s+/g, '. ')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\.\s*\./g, '.');
    const seen = new Set();
    return flat.split(/(?<=[.!?;])\s+(?=[A-Z0-9"“(*†‡§$])/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 25 && s.length <= 700 && /[a-z]{3}/.test(s))
      .filter((s) => { const k = s.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  }

  function fmtDate(y, m, d) {
    if (y < 100) y += 2000;
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    return { iso: `${y}-${pad(m)}-${pad(d)}`, text: `${d} ${MONTHS[m - 1]} ${y}` };
  }

  const DATE_LABELS = [
    ['Cancellation deadline', /cancel|refund|penalt/gi],
    ['Final payment due', /final payment|balance|paid in full/gi],
    ['Deposit due', /deposit/gi],
    ['Booking window', /\bbook(ed|ings?)?\b|reserv|made\b/gi],
    ['Offer ends', /expire|valid until|ends?\b/gi],
    ['Travel dates', /sail|depart|travel|embark|voyages?\b|cruises?\b|stays?\b|check-?in/gi],
  ];
  function labelFor(before, sentence) {
    // nearest keyword before the date wins; fall back to the whole sentence
    let best = null; let bestPos = -1;
    DATE_LABELS.forEach(([name, re]) => {
      for (const m of before.matchAll(re)) if (m.index > bestPos) { bestPos = m.index; best = name; }
    });
    if (best) return best;
    const hit = DATE_LABELS.find(([, re]) => { re.lastIndex = 0; return re.test(sentence); });
    return hit ? hit[0] : 'Date mentioned';
  }

  function findDates(sents) {
    const out = [];
    const named = new RegExp(`\\b${MON_RE}\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b`, 'gi');
    sents.forEach((s) => {
      const found = [];
      for (const m of s.matchAll(named)) {
        const mi = MONTHS.findIndex((x) => x.toLowerCase().startsWith(m[1].slice(0, 3).toLowerCase())) + 1;
        const d = fmtDate(+m[3], mi, +m[2]); if (d) found.push({ ...d, start: m.index, end: m.index + m[0].length });
      }
      for (const m of s.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g)) {
        const d = fmtDate(+m[3], +m[1], +m[2]); if (d) found.push({ ...d, start: m.index, end: m.index + m[0].length });
      }
      found.sort((a, b) => a.start - b.start);
      for (let i = 0; i < found.length; i++) {
        const d = found[i];
        const prevEnd = i ? found[i - 1].end : 0;
        const before = s.slice(Math.max(prevEnd, d.start - 60), d.start);
        const next = found[i + 1];
        if (next && /^\s*(through|thru|to|until|till|-|–|—|and)\s*$/i.test(s.slice(d.end, next.start))) {
          out.push({ iso: d.iso, text: `${d.text} to ${next.text}`, label: labelFor(before, s) });
          i++;
        } else {
          out.push({ iso: d.iso, text: d.text, label: labelFor(before, s) });
        }
      }
    });
    const seen = new Set();
    return out.filter((d) => { const k = d.text + d.label; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => a.iso.localeCompare(b.iso)).slice(0, 10);
  }

  function score(s, re) {
    let n = (s.match(re) || []).length;
    if (/\d/.test(s)) n += 2;
    if (/\$|USD|%/.test(s)) n += 1;
    if (/not|must|only|cannot|non-?refundable/i.test(s)) n += 1;
    return n;
  }

  /** Rule-based TL;DR. ctx = offer form values (optional). Returns plain text. */
  function summarize(text, ctx = {}) {
    const sents = sentences(text);
    if (!sents.length) return '';
    const buckets = Object.fromEntries(CATEGORIES.map((c) => [c.key, []]));
    sents.forEach((s, i) => {
      const cat = CATEGORIES.find((c) => c.re.test(s));
      if (cat) buckets[cat.key].push({ s, i, score: score(s, cat.re) });
    });

    const lines = [];
    const title = [ctx.supplier, ctx.title].filter(Boolean).join(': ');
    lines.push(`TL;DR${title ? ' — ' + title : ''}`);
    if (ctx.perk) lines.push(`The offer: ${plain(ctx.perk)}`);
    lines.push('');

    const dates = findDates(sents);
    if (dates.length) {
      lines.push('KEY DATES');
      dates.forEach((d) => lines.push(`- ${d.text}: ${d.label}.`));
      lines.push('');
    }

    const money = [...new Set((text.match(/(?:US\s?)?\$\s?\d[\d,]*(?:\.\d{2})?|\bUSD\s?\d[\d,]*(?:\.\d{2})?/g) || [])
      .map((m) => 'USD ' + m.replace(/US|USD|\$|\s/g, '')))].slice(0, 8);
    const pct = [...new Set((text.match(/\b\d+(?:\.\d+)?\s?%/g) || []).map((p) => p.replace(/\s/g, '')))].slice(0, 6);
    const code = text.match(/\b(?:promo(?:tion(?:al)?)?|offer|booking|discount)\s+code[:\s]+["“]?([A-Z0-9][A-Z0-9-]{2,})/i);
    if (money.length || pct.length || code) {
      lines.push('NUMBERS TO KNOW');
      if (money.length) lines.push(`- Amounts in the terms: ${money.join(', ')}.`);
      if (pct.length) lines.push(`- Percentages in the terms: ${pct.join(', ')}.`);
      if (code) lines.push(`- Promo code: ${code[1]}.`);
      lines.push('');
    }

    const order = ['included', 'payment', 'cancel', 'limits', 'extra'];
    order.forEach((k) => {
      const cat = CATEGORIES.find((c) => c.key === k);
      const picks = buckets[k].sort((a, b) => b.score - a.score).slice(0, 4).sort((a, b) => a.i - b.i);
      if (!picks.length) return;
      lines.push(cat.heading);
      picks.forEach((p) => lines.push(`- ${plain(p.s)}`));
      lines.push('');
    });

    const gloss = GLOSSARY.filter(([re]) => re.test(text));
    if (gloss.length) {
      lines.push('WORDS EXPLAINED');
      gloss.forEach(([, term, meaning]) => lines.push(`- ${term}: ${meaning}`));
      lines.push('');
    }
    lines.push(`This is a short summary. Always check the full terms${ctx.supplier ? ' from ' + ctx.supplier : ''} before booking.`);
    return lines.join('\n');
  }

  // ---------- Claude-powered (available inside the claude.ai preview) ----------
  const AI_HEADINGS = ['Key dates', 'Price and what is included', 'Deposit and payment', 'Cancellation and changes', 'Who qualifies and limits', 'Extra costs not included', 'Watch out for'];

  function aiPrompt(text, ctx) {
    return `You help a travel advisor understand supplier fine print. Read the supplier offer text below and write a TL;DR that is accurate and easy to translate into other languages.

Writing rules:
- Plain English. Short sentences (about 15 words or fewer). One fact per bullet.
- No idioms, slang, emojis, or abbreviations. Write "per person", not "pp".
- Write dates like "31 December 2026". Write money like "USD 500".
- Never invent facts. If something important is unclear or missing, add a bullet like "Not stated: ..." under "Watch out for".

Reply with only JSON in this shape:
{"oneLine": "one sentence: what the offer is",
 "sections": [{"heading": "Key dates", "bullets": ["..."]}],
 "glossary": [{"term": "Double occupancy", "meaning": "Prices are for each person when 2 people share 1 room."}],
 "fields": {"supplier": "", "title": "", "destination": "", "travelDates": "", "deadline": "YYYY-MM-DD or empty", "price": "", "perk": "", "highlights": ["up to 5 short selling points"]}}
Use these section headings, in this order, and leave out any with nothing to say: ${AI_HEADINGS.join('; ')}.
Glossary: only travel-industry terms that actually appear in the text, max 8.

What the advisor already typed (may be empty): ${JSON.stringify({ supplier: ctx.supplier || '', title: ctx.title || '', destination: ctx.destination || '' })}

SUPPLIER TEXT:
"""
${text.slice(0, 80000)}
"""`;
  }

  function renderAi(obj, ctx) {
    const lines = [];
    const title = [obj.fields?.supplier || ctx.supplier, obj.fields?.title || ctx.title].filter(Boolean).join(': ');
    lines.push(`TL;DR${title ? ' — ' + title : ''}`);
    if (obj.oneLine) lines.push(String(obj.oneLine));
    lines.push('');
    (obj.sections || []).forEach((sec) => {
      if (!sec?.bullets?.length) return;
      lines.push(String(sec.heading || '').toUpperCase());
      sec.bullets.forEach((b) => lines.push(`- ${b}`));
      lines.push('');
    });
    if (obj.glossary?.length) {
      lines.push('WORDS EXPLAINED');
      obj.glossary.forEach((g) => lines.push(`- ${g.term}: ${g.meaning}`));
      lines.push('');
    }
    lines.push('This is a short summary. Always check the full terms before booking.');
    return lines.join('\n');
  }

  async function aiSummarize(sample, text, ctx, opts = {}) {
    const obj = await sample.json(aiPrompt(text, ctx), { signal: opts.signal });
    if (!obj || typeof obj !== 'object') throw { code: 'invalid_json', message: 'Unexpected reply' };
    return { text: renderAi(obj, ctx), fields: obj.fields || null };
  }

  async function aiTranslate(sample, text, language, opts = {}) {
    const prompt = `Translate this travel offer summary into ${language}. Keep the same structure, headings, bullets, numbers, dates, prices, and promo codes. Use simple, clear, natural ${language}. Reply with only the translation.\n\n${text}`;
    const { text: out } = await sample(prompt, { signal: opts.signal, onText: opts.onText });
    return out;
  }

  window.FinePrint = { extractPdfText, summarize, aiSummarize, aiTranslate, loadPdfJs };
})();

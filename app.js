/* Seasoned Voyages — Advisor HQ
 * Single-file vanilla JS app. All data is stored in this browser's localStorage.
 */
(() => {
  'use strict';

  const STORE_KEY = 'sv-advisor-hq-v1';
  const STAGES = ['Lead', 'Consultation', 'Proposal Sent', 'Booked', 'Traveled'];
  const uid = () => Math.random().toString(36).slice(2, 10);

  // ---------- Defaults ----------
  const DEFAULTS = () => ({
    settings: {
      brand: 'Seasoned Voyages',
      owner: '',
      website: 'https://seasoned-voyages.com',
      bookingLink: 'https://seasoned-voyages.com',
      instagram: '',
      signupLink: '',
      niche: 'Thoughtfully planned, unhurried travel for seasoned travelers who value comfort, culture, and having an expert handle the details.',
      audiences: [
        'Empty nesters ready to travel again',
        'Couples celebrating a milestone',
        'Newly retired travelers',
        'Multigenerational family trips',
        'Solo travelers who want it all handled',
      ].join('\n'),
      voice: 'Warm, knowledgeable, never pushy. "Travel well, not just often."',
      hashtags: '#SeasonedVoyages #TravelAdvisor #TravelWithAnAdvisor',
    },
    resources: [
      { id: uid(), name: 'Seasoned Voyages', url: 'https://seasoned-voyages.com', category: 'My Business', note: 'My website — blog, inquiries, about me', icon: '🌍' },
      { id: uid(), name: 'Squarespace', url: 'https://account.squarespace.com', category: 'My Business', note: 'Edit site, publish blog posts', icon: '◼️' },
      { id: uid(), name: 'Gmail', url: 'https://mail.google.com', category: 'My Business', note: 'travel@seasoned-voyages.com', icon: '✉️' },
      { id: uid(), name: 'Google Drive', url: 'https://drive.google.com', category: 'My Business', note: 'Itineraries, client docs, contracts', icon: '📁' },
      { id: uid(), name: 'Google Calendar', url: 'https://calendar.google.com', category: 'My Business', note: 'Consultations & client travel dates', icon: '📅' },
      { id: uid(), name: 'Canva Pro', url: 'https://www.canva.com', category: 'Marketing', note: 'Carousels, Reels, flyers, brand kit', icon: '🎨' },
      { id: uid(), name: 'Mailchimp', url: 'https://mailchimp.com', category: 'Marketing', note: 'Newsletter & email campaigns', icon: '📬' },
      { id: uid(), name: 'Instagram', url: 'https://www.instagram.com', category: 'Marketing', note: 'Feed, Reels, Stories', icon: '📸' },
      { id: uid(), name: 'Meta Business Suite', url: 'https://business.facebook.com', category: 'Marketing', note: 'Schedule Instagram posts ahead', icon: '🗓️' },
      { id: uid(), name: 'WorldVia', url: 'https://worldvia.pro', category: 'Agency', note: 'Host agency portal — training, suppliers, commissions', icon: '🧭' },
      { id: uid(), name: 'Travel Advisories', url: 'https://travel.state.gov', category: 'Research', note: 'US State Dept. destination advisories & entry rules', icon: '🛂' },
      { id: uid(), name: 'Google Flights', url: 'https://www.google.com/travel/flights', category: 'Research', note: 'Quick fare & route research', icon: '✈️' },
    ],
    suppliers: [],
    pillars: [
      { id: uid(), name: 'Destination Inspiration', mix: 30, desc: 'Dreamy places, why now, what it feels like' },
      { id: uid(), name: 'Insider Tips & Know-How', mix: 25, desc: 'Packing, timing, cabin picks, what to skip' },
      { id: uid(), name: 'Supplier Offers', mix: 20, desc: 'Promos & perks, framed for your niche' },
      { id: uid(), name: 'Meet Your Advisor', mix: 15, desc: 'Behind the scenes, FAMs, why use an advisor' },
      { id: uid(), name: 'Client Stories', mix: 10, desc: 'Testimonials, trip recaps, real moments' },
    ],
    ideas: [
      { id: uid(), text: '5 things I wish every first-time cruiser knew', pillar: 'Insider Tips & Know-How' },
      { id: uid(), text: '"What does a travel advisor actually cost?" (spoiler: often nothing)', pillar: 'Meet Your Advisor' },
      { id: uid(), text: 'Best places for a milestone anniversary trip', pillar: 'Destination Inspiration' },
      { id: uid(), text: 'River cruise vs. ocean cruise — which suits you?', pillar: 'Insider Tips & Know-How' },
      { id: uid(), text: 'A day in my life planning a client trip', pillar: 'Meet Your Advisor' },
    ],
    posts: [],
    offers: [],
    clients: [],
    todos: [
      { id: uid(), text: 'Fill in Brand & Settings (name, Instagram handle, booking link)', done: false },
      { id: uid(), text: 'Add my suppliers to the Supplier Hub', done: false },
      { id: uid(), text: 'Plug in my first supplier offer in the Content Studio', done: false },
    ],
    crmChecks: {},
  });

  // ---------- State ----------
  let state = load();
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return { ...DEFAULTS(), ...JSON.parse(raw) };
    } catch (e) { /* storage unavailable */ }
    return DEFAULTS();
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // ---------- Helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const fmtShort = (s) => s ? parseYmd(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : '';
  const fmtLong = (s) => s ? parseYmd(s).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : '';
  const money = (n) => '$' + Math.round(Number(n) || 0).toLocaleString();
  const lowerFirst = (s) => s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
  const tagify = (s) => '#' + String(s).replace(/[^A-Za-z0-9]+/g, ' ').trim().split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const formToObj = (form) => Object.fromEntries(new FormData(form).entries());
  const platformColor = (p) => p === 'Blog' ? 'var(--c-blog)' : p === 'Email' ? 'var(--c-email)' : p === 'Instagram Story' ? 'var(--c-story)' : 'var(--c-ig)';
  const audiences = () => state.settings.audiences.split('\n').map((s) => s.trim()).filter(Boolean);

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 1800);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    toast('Copied to clipboard');
  }

  // ---------- Navigation ----------
  function goto(tab) {
    $$('.nav button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    $$('.tab').forEach((t) => t.classList.toggle('active', t.id === 'tab-' + tab));
    try { localStorage.setItem(STORE_KEY + ':tab', tab); } catch { /* ignore */ }
    render();
    window.scrollTo({ top: 0 });
  }
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-tab]');
    if (nav) return goto(nav.dataset.tab);
    const g = e.target.closest('[data-goto]');
    if (g) { e.preventDefault(); goto(g.dataset.goto); }
  });

  // ---------- Render all ----------
  function render() {
    $$('[data-bind="brand"]').forEach((el) => (el.textContent = state.settings.brand || 'Advisor HQ'));
    $('.brand-mark').textContent = (state.settings.brand || 'SV').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    document.title = (state.settings.brand || 'Advisor') + ' HQ';
    renderHome();
    renderResources();
    renderStudioSelects();
    renderSavedOffers();
    renderCalendar();
    renderPostTable();
    renderIdeas();
    renderClients();
    renderCommission();
  }

  // ---------- Home ----------
  function renderHome() {
    const h = new Date().getHours();
    const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    $('#greeting').textContent = state.settings.owner ? `${part}, ${state.settings.owner}` : part;
    $('#today').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const today = ymd(new Date());
    const weekEnd = ymd(addDays(new Date(), 7));
    const upcoming = state.posts.filter((p) => p.date >= today && p.date <= weekEnd && p.status !== 'Published').sort((a, b) => a.date.localeCompare(b.date));
    const active = state.clients.filter((c) => c.stage !== 'Traveled');
    const pipeline = active.reduce((s, c) => s + (Number(c.value) || 0), 0);
    const stats = [
      [upcoming.length, 'Posts due this week'],
      [state.posts.filter((p) => p.status === 'Scheduled').length, 'Scheduled posts'],
      [state.ideas.length, 'Ideas in the bank'],
      [active.length, 'Active clients'],
      [money(pipeline), 'Pipeline value'],
    ];
    $('#home-stats').innerHTML = stats.map(([n, l]) => `<div class="stat"><div class="num">${esc(n)}</div><div class="lbl">${esc(l)}</div></div>`).join('');

    $('#home-upcoming').innerHTML = upcoming.length
      ? upcoming.map((p) => `<li data-post="${p.id}" style="cursor:pointer"><span class="when">${esc(fmtShort(p.date))}</span><span class="tag" style="background:${platformColor(p.platform)}">${esc(p.platform.replace('Instagram ', 'IG '))}</span><span class="grow">${esc(p.title)}</span><span class="status ${esc(p.status)}">${esc(p.status)}</span></li>`).join('')
      : `<li class="muted">Nothing due in the next 7 days. <button class="link" data-goto="studio">Create something →</button></li>`;

    $('#todo-list').innerHTML = state.todos.map((t) => `<li class="${t.done ? 'done' : ''}"><input type="checkbox" data-todo="${t.id}" ${t.done ? 'checked' : ''}/><span class="grow">${esc(t.text)}</span><button class="x" data-del-todo="${t.id}" title="Remove">×</button></li>`).join('') || '<li class="muted">All clear ✨</li>';

    const quick = state.resources.slice(0, 10);
    $('#home-quick').innerHTML = quick.map((r) => `<a href="${esc(r.url)}" target="_blank" rel="noopener"><span>${esc(r.icon || '🔗')}</span>${esc(r.name)}</a>`).join('');
  }
  $('#todo-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.todos.push({ id: uid(), text: e.target.text.value.trim(), done: false });
    e.target.reset(); save(); renderHome();
  });
  $('#todo-list').addEventListener('change', (e) => {
    const t = state.todos.find((x) => x.id === e.target.dataset.todo);
    if (t) { t.done = e.target.checked; save(); renderHome(); }
  });
  $('#todo-list').addEventListener('click', (e) => {
    const id = e.target.dataset.delTodo;
    if (id) { state.todos = state.todos.filter((t) => t.id !== id); save(); renderHome(); }
  });
  $('#home-upcoming').addEventListener('click', (e) => {
    const li = e.target.closest('[data-post]');
    if (li) openPost(state.posts.find((p) => p.id === li.dataset.post));
  });

  // ---------- Resources ----------
  function renderResources() {
    const groups = {};
    state.resources.forEach((r) => (groups[r.category] ||= []).push(r));
    const order = ['My Business', 'Marketing', 'Agency', 'Research', 'Booking'];
    const cats = Object.keys(groups).sort((a, b) => (order.indexOf(a) + 99) % 99 - (order.indexOf(b) + 99) % 99);
    $('#resource-groups').innerHTML = cats.map((c) => `
      <div class="res-group"><h3>${esc(c)}</h3><div class="res-grid">
        ${groups[c].map((r) => `
          <div class="res">
            <button class="x" data-del-res="${r.id}" title="Remove">×</button>
            <div class="res-top"><span class="ico">${esc(r.icon || '🔗')}</span><a class="name" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.name)}</a></div>
            <div class="url">${esc(r.url.replace(/^https?:\/\//, ''))}</div>
            ${r.note ? `<div class="note">${esc(r.note)}</div>` : ''}
          </div>`).join('')}
      </div></div>`).join('');

    $('#supplier-list').innerHTML = state.suppliers.length
      ? state.suppliers.map((s) => `<span class="chip">${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>` : esc(s.name)}<button class="x" data-del-sup="${s.id}">×</button></span>`).join('')
      : '<span class="muted" style="font-size:13px">No suppliers yet.</span>';
  }
  $('#resource-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const r = formToObj(e.target);
    state.resources.push({ id: uid(), ...r, icon: '🔗' });
    e.target.reset(); save(); renderResources(); toast('Resource added');
  });
  $('#supplier-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const s = formToObj(e.target);
    state.suppliers.push({ id: uid(), name: s.name.trim(), url: s.url });
    e.target.reset(); save(); render(); toast('Supplier added');
  });
  $('#tab-resources').addEventListener('click', (e) => {
    if (e.target.dataset.delRes && confirm('Remove this resource?')) {
      state.resources = state.resources.filter((r) => r.id !== e.target.dataset.delRes); save(); render();
    }
    if (e.target.dataset.delSup) {
      state.suppliers = state.suppliers.filter((s) => s.id !== e.target.dataset.delSup); save(); render();
    }
  });

  // ---------- Content Studio ----------
  function pillarOptions(selected) {
    return state.pillars.map((p) => `<option ${p.name === selected ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
  }
  function renderStudioSelects() {
    const aud = $('#audience-select'); const cur = aud.value;
    aud.innerHTML = audiences().map((a) => `<option ${a === cur ? 'selected' : ''}>${esc(a)}</option>`).join('');
    const pil = $('#pillar-select'); const curP = pil.value || 'Supplier Offers';
    pil.innerHTML = pillarOptions(curP);
    $('#supplier-options').innerHTML = state.suppliers.map((s) => `<option value="${esc(s.name)}">`).join('');
  }

  const HOOKS = {
    warm: [
      (o) => `${o.destination} has been on your "someday" list long enough. 💛`,
      (o) => `Picture this: ${lowerFirst(o.h[0] || `waking up in ${o.destination}`)}.`,
      (o) => `You've earned this one. ✨ ${o.title}`,
      (o) => `If ${o.destination} keeps popping into your daydreams, read this.`,
    ],
    luxe: [
      (o) => `${o.destination}, the way it was meant to be experienced.`,
      (o) => `Quiet luxury, ${o.destination} edition.`,
      (o) => `For those who'd rather savor than rush: ${o.title}.`,
      (o) => `The details make the journey. This one has all of them. ✨`,
    ],
    adventure: [
      (o) => `Still collecting passport stamps? ${o.destination} is calling. 🧭`,
      (o) => `New year, new horizon: ${o.destination}.`,
      (o) => `Curiosity doesn't retire. Neither should your travel plans.`,
      (o) => `${o.h[0] || o.destination} — and that's just day one.`,
    ],
    practical: [
      (o) => `Let's talk real value 👇 ${o.title}`,
      (o) => `${o.perk || 'This offer'} — here's why it matters.`,
      (o) => `Perk alert from ${o.supplier}! 🎁`,
      (o) => `Smart travelers book early. Here's one worth booking.`,
    ],
  };
  const BODY = {
    warm: (o) => `This one's for ${o.audLower} 💛 ${o.supplier} just released something special — and as your advisor, I make sure you get every perk without lifting a finger.`,
    luxe: (o) => `For ${o.audLower} who expect every detail to be right: ${o.supplier}'s ${o.title} delivers ${o.destination} at its most refined — and I'll make sure it's tailored to you.`,
    adventure: (o) => `Calling ${o.audLower} with a long list of places still to see. ${o.destination} with ${o.supplier} is equal parts discovery and ease — you bring the curiosity, I'll handle the logistics.`,
    practical: (o) => `Here's the value for ${o.audLower}: ${o.supplier} is offering ${o.perk ? lowerFirst(o.perk) : 'special savings'} on ${o.title}. Booking through an advisor typically costs you nothing extra — and you get someone in your corner before, during, and after your trip.`,
  };

  function buildContext(o) {
    const s = state.settings;
    const h = (o.highlights || '').split('\n').map((x) => x.trim()).filter(Boolean);
    const keyword = (o.destination || 'TRIP').split(/[\s,]+/)[0].toUpperCase();
    return {
      ...o, h, keyword,
      audLower: lowerFirst(o.audience || 'travelers'),
      deadlineStr: fmtLong(o.deadline),
      owner: s.owner, brand: s.brand, ig: s.instagram,
      link: s.bookingLink || s.website,
    };
  }

  function hashtags(o) {
    const base = (state.settings.hashtags || '').split(/\s+/).filter((t) => t.startsWith('#'));
    const extra = [tagify(o.destination), tagify(o.destination + ' Travel'), tagify(o.supplier)];
    const all = `${o.title} ${o.supplier}`.toLowerCase();
    if (/cruise|voyage|sail|ship|river/.test(all)) extra.push('#CruiseVacation', '#CruiseLife');
    if (/river/.test(all)) extra.push('#RiverCruise');
    extra.push({ warm: '#TravelInspiration', luxe: '#LuxuryTravel', adventure: '#AdventureTravel', practical: '#TravelDeals' }[o.tone]);
    extra.push('#BucketListTravel', '#TravelPlanning', '#MilestoneTravel', '#SlowTravel', '#TravelMore');
    return [...new Set([...base, ...extra].filter(Boolean))].slice(0, 18).join(' ');
  }

  function generate(raw, v = 0) {
    const o = buildContext(raw);
    const hooks = HOOKS[o.tone] || HOOKS.warm;
    const hook = hooks[v % hooks.length](o);
    const ctas = [
      `Comment "${o.keyword}" and I'll send you the details 💌`,
      `Tap the link in bio to start planning — I'll handle every detail so you don't have to.`,
      `DM me "${o.keyword}" to hold your spot before it's gone.`,
    ];
    const cta = ctas[v % ctas.length];
    const lines = (arr) => arr.filter((x) => x != null && x !== false).join('\n').replace(/\n{3,}/g, '\n\n');
    const tags = hashtags(o);

    const caption = lines([
      hook, '',
      BODY[o.tone](o), '',
      o.h.length ? '✨ Highlights:' : null,
      ...o.h.map((x) => `• ${x}`),
      o.perk ? `🎁 ${o.perk}` : null,
      o.price ? `💫 ${o.price}` : null,
      o.travelDates ? `🗓️ Travel: ${o.travelDates}` : null,
      o.deadlineStr ? `⏳ Book by ${o.deadlineStr}` : null,
      o.personal ? `\n${o.personal}` : null,
      '', cta, '', '.', '.', tags,
    ]).replace(/\n{3,}/g, '\n\n');

    let n = 1;
    const slide = (title, body, art) => `SLIDE ${n++} — ${title}\n${body}${art ? `\n  📷 Visual: ${art}` : ''}`;
    const carousel = [
      'Canva: Instagram Post (Portrait) 1080×1350 · use your Brand Kit fonts & colors',
      '',
      slide('Cover', `"${o.destination}"\nSubtext: ${o.title}`, `hero shot of ${o.destination}`),
      slide('Hook', `"${hook.replace(/[✨💛🧭👇🎁]/gu, '').trim()}"`, 'close-up / texture shot'),
      ...o.h.map((x) => slide('Highlight', x, `photo showing: ${x}`)),
      o.perk ? slide('The perk', `${o.perk}${o.price ? `\n${o.price}` : ''}`, 'clean branded background, big text') : null,
      slide('Perfect for…', `${o.audience}`, 'travelers like your audience enjoying the destination'),
      slide('Why book with me', '• Exclusive advisor perks\n• One point of contact, start to finish\n• I handle the details — you enjoy the trip', 'photo of you / your workspace'),
      slide('Call to action', `${o.deadlineStr ? `Book by ${o.deadlineStr}\n` : ''}${cta}${o.ig ? `\n${o.ig}` : ''}`, 'brand logo'),
    ].filter(Boolean).join('\n\n');

    const reel = lines([
      'REEL (15–25 sec) · Canva: Instagram Reel 1080×1920 · trending soft/cinematic audio',
      '',
      `0–3s   HOOK — on-screen text: "${hook.replace(/[✨💛🧭👇🎁]/gu, '').trim()}"`,
      `        Visual: most stunning ${o.destination} clip`,
      ...o.h.slice(0, 4).map((x, i) => `${3 + i * 3}–${6 + i * 3}s  Text: "${x}"  · B-roll matching it`),
      o.perk ? `+3s    Text: "${o.perk}"` : null,
      `+4s    You on camera (or text): "${o.owner ? `I'm ${o.owner}, ` : ''}your travel advisor — I'll plan every detail."`,
      `END    Text: "${cta}"`,
      '',
      'STORY SEQUENCE (same day as the post)',
      `1. Photo of ${o.destination} + poll sticker: "Would you go?" Yes! / Already packing`,
      `2. Share the feed post + "${o.perk || 'New offer'} 👀"`,
      `3. Link sticker → ${o.link || 'your booking page'} · "${o.deadlineStr ? `Book by ${o.deadlineStr}` : 'Let\'s plan it'}"`,
    ]);

    const slug = `${o.destination}-${o.title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
    const titles = [
      `${o.title}: Why ${o.destination} Belongs on Your ${o.travelDates ? o.travelDates + ' ' : ''}Travel List`,
      `A Seasoned Traveler's Guide to ${o.destination} with ${o.supplier}`,
      `${o.destination}, Done Right${o.perk ? ` (Plus ${o.perk})` : ': A Travel Advisor\'s Take'}`,
    ];
    let meta = `Planning ${o.destination}? Here's why ${o.supplier}'s ${o.title} is a standout for ${o.audLower}${o.perk ? ` — plus ${lowerFirst(o.perk)}` : ''}.`;
    if (meta.length > 155) meta = meta.slice(0, 152).replace(/\s+\S*$/, '') + '…';
    const blog = lines([
      'SEO',
      `Title options:\n  1. ${titles[0]}\n  2. ${titles[1]}\n  3. ${titles[2]}`,
      `URL slug: /blog/${slug}`,
      `Meta description (${meta.length}/155): ${meta}`,
      `Focus keyword: ${o.destination.toLowerCase()} ${/cruise|voyage|sail/i.test(o.title) ? 'cruise' : 'vacation'}`,
      '',
      '———— DRAFT (paste into a Squarespace Markdown or Text block) ————',
      '',
      `# ${titles[v % 3]}`,
      '',
      o.personal || `[Open with a personal moment — a memory, a client's reaction, or what first drew you to ${o.destination}.]`,
      '',
      `If ${o.destination} has been on your list, ${o.travelDates ? o.travelDates : 'this coming season'} may be the moment. ${o.supplier} has a new offer that caught my attention — and as someone who helps ${o.audLower} travel well, here's my honest take.`,
      '',
      `## Why ${o.destination}, why now`,
      `[2–3 sentences: season, crowds, what's new, what it feels like to be there.]`,
      '',
      `## What makes this ${o.supplier} offer special`,
      ...o.h.map((x) => `- **${x}** — [one sentence on why it matters]`),
      o.perk ? `- **${o.perk}**` : null,
      o.price ? `\n${o.price}.` : null,
      '',
      `## Who this trip is perfect for`,
      `This is an especially good fit for ${o.audLower}. ${state.settings.niche}`,
      '',
      `## My insider tips`,
      `1. [Best time of day / season tip]`,
      `2. [Cabin, room, or seat choice that makes a difference]`,
      `3. [Something most travelers miss — or should skip]`,
      '',
      `## The details`,
      o.travelDates ? `- **Travel window:** ${o.travelDates}` : null,
      o.price ? `- **Pricing:** ${o.price}` : null,
      o.deadlineStr ? `- **Book by:** ${o.deadlineStr}` : null,
      `- Offers are subject to availability and supplier terms.`,
      '',
      `## Let's plan it together`,
      `Booking through me means advisor-only perks, one person to call, and every detail handled. [Start planning your ${o.destination} trip](${o.link || '#'})${state.settings.signupLink ? ` — or [join my newsletter](${state.settings.signupLink}) for offers like this first.` : '.'}`,
      '',
      o.owner ? `Travel well,\n${o.owner}` : null,
    ]);

    const subjects = [
      `${o.destination} is calling ✨`,
      o.perk ? `${o.perk} — for a limited time` : `A ${o.destination} offer I had to share`,
      o.deadlineStr ? `Book by ${o.deadlineStr}: ${o.title}` : `Your next trip? ${o.title}`,
    ];
    const email = lines([
      `Subject lines:\n  1. ${subjects[0]}\n  2. ${subjects[1]}\n  3. ${subjects[2]}`,
      `Preview text: ${o.h[0] ? o.h[0] + ' — and so much more.' : `A ${o.destination} offer from ${o.supplier}.`}`,
      '',
      '———— BODY ————',
      '',
      `Hi *|FNAME|*,`,
      '',
      `${hook.replace(/[✨💛🧭👇🎁]/gu, '').trim()}`,
      '',
      `${o.supplier} just released ${o.title}${o.perk ? `, and it comes with ${lowerFirst(o.perk)}` : ''}. Here's what caught my eye:`,
      '',
      ...o.h.map((x) => `• ${x}`),
      '',
      o.price ? `${o.price}${o.travelDates ? ` · ${o.travelDates}` : ''}` : (o.travelDates ? `Travel: ${o.travelDates}` : ''),
      o.deadlineStr ? `This offer ends ${o.deadlineStr}.` : null,
      '',
      `[BUTTON: Plan my ${o.destination} trip → ${o.link || 'your booking link'}]`,
      '',
      `Want the full scoop? I wrote all about it on the blog: [link to blog post]`,
      '',
      o.owner ? `Travel well,\n${o.owner}` : 'Travel well,',
      o.brand,
    ]);

    return { caption, carousel, reel, blog, email, title: o.title, destination: o.destination };
  }

  const OUTPUTS = [
    { key: 'caption', label: 'Instagram caption', platform: 'Instagram Post', tag: 'IG', color: 'var(--c-ig)', limit: 2200, offset: 1 },
    { key: 'carousel', label: 'Carousel outline (Canva)', platform: 'Instagram Carousel', tag: 'IG', color: 'var(--c-ig)', open: ['Open Canva', 'https://www.canva.com'], offset: 1 },
    { key: 'reel', label: 'Reel script + Stories', platform: 'Instagram Reel', tag: 'IG', color: 'var(--c-ig)', open: ['Open Canva', 'https://www.canva.com'], offset: 3 },
    { key: 'blog', label: 'Blog post (website)', platform: 'Blog', tag: 'Blog', color: 'var(--c-blog)', open: ['Open Squarespace', 'https://account.squarespace.com'], offset: 2 },
    { key: 'email', label: 'Email newsletter (Mailchimp)', platform: 'Email', tag: 'Email', color: 'var(--c-email)', open: ['Open Mailchimp', 'https://mailchimp.com'], offset: 4 },
  ];

  let lastOffer = null; let variant = 0; let lastGen = null;
  function renderOutputs() {
    const g = lastGen;
    $('#outputs').innerHTML = `
      <div class="card">
        <div class="out-head">
          <div><h2>Campaign: ${esc(g.title)}</h2><div class="meta">Edit any draft below — your changes are what gets copied or scheduled.</div></div>
          <div class="actions">
            <button class="btn ghost" id="shuffle">🔀 New hooks</button>
            <button class="btn primary" id="schedule-all">📅 Add whole campaign to calendar</button>
          </div>
        </div>
      </div>
      ${OUTPUTS.map((out) => `
        <div class="card out" data-out="${out.key}">
          <div class="out-head">
            <h2><span class="tag" style="background:${out.color}">${out.tag}</span>${esc(out.label)}</h2>
            <div class="actions">
              ${out.open ? `<a class="btn sm ghost" href="${out.open[1]}" target="_blank" rel="noopener">${out.open[0]} ↗</a>` : ''}
              <button class="btn sm" data-copy="${out.key}">Copy</button>
              <button class="btn sm" data-sched="${out.key}">Schedule</button>
            </div>
          </div>
          <textarea rows="${Math.min(22, g[out.key].split('\n').length + 1)}" data-text="${out.key}">${esc(g[out.key])}</textarea>
          ${out.limit ? `<div class="meta" data-count="${out.key}"></div>` : ''}
        </div>`).join('')}`;
    updateCounts();
  }
  function updateCounts() {
    const ta = $('[data-text="caption"]'); const m = $('[data-count="caption"]');
    if (!ta || !m) return;
    const len = ta.value.length; const tags = (ta.value.match(/#\w+/g) || []).length;
    m.textContent = `${len.toLocaleString()} / 2,200 characters · ${tags} / 30 hashtags`;
    m.classList.toggle('warn', len > 2200 || tags > 30);
  }
  function currentText(key) { return $(`[data-text="${key}"]`)?.value ?? lastGen[key]; }
  function nextDate(offset) { return ymd(addDays(new Date(), offset)); }

  $('#offer-form').addEventListener('submit', (e) => {
    e.preventDefault();
    lastOffer = formToObj(e.target); variant = 0;
    lastGen = generate(lastOffer, variant); renderOutputs();
    if (window.innerWidth < 1000) $('#outputs').scrollIntoView({ behavior: 'smooth' });
  });
  $('#outputs').addEventListener('input', (e) => { if (e.target.dataset.text === 'caption') updateCounts(); });
  $('#outputs').addEventListener('click', (e) => {
    const t = e.target;
    if (t.id === 'shuffle') { variant++; lastGen = generate(lastOffer, variant); renderOutputs(); toast('Fresh hooks & CTAs'); }
    if (t.dataset.copy) copy(currentText(t.dataset.copy));
    if (t.dataset.sched) {
      const out = OUTPUTS.find((o) => o.key === t.dataset.sched);
      openPost({ title: `${lastGen.destination} — ${out.label.split(' (')[0]}`, platform: out.platform, date: nextDate(out.offset), status: 'Draft', pillar: lastOffer.pillar, content: currentText(out.key) });
    }
    if (t.id === 'schedule-all') {
      OUTPUTS.forEach((out) => state.posts.push({ id: uid(), title: `${lastGen.destination} — ${out.label.split(' (')[0]}`, platform: out.platform, date: nextDate(out.offset), status: 'Draft', pillar: lastOffer.pillar, content: currentText(out.key) }));
      save(); render(); toast(`Added ${OUTPUTS.length} drafts over the next few days`);
    }
  });

  $('#save-offer').addEventListener('click', () => {
    const f = $('#offer-form');
    if (!f.reportValidity()) return;
    const o = formToObj(f);
    state.offers.unshift({ id: uid(), savedAt: ymd(new Date()), ...o });
    save(); renderSavedOffers(); toast('Offer saved');
  });
  function renderSavedOffers() {
    $('#saved-offers').innerHTML = state.offers.length
      ? `<div class="saved-offers"><div class="hint">Saved offers</div>${state.offers.map((o) => `
          <div class="saved-offer"><span>${esc(o.title)} <span class="hint">· ${esc(o.supplier)}</span></span>
          <span class="actions"><button type="button" class="link" data-load-offer="${o.id}">Load</button><button type="button" class="x" data-del-offer="${o.id}">×</button></span></div>`).join('')}</div>`
      : '';
  }
  function fillOffer(o) {
    const f = $('#offer-form');
    Object.entries(o).forEach(([k, v]) => { if (f.elements[k]) f.elements[k].value = v; });
  }
  $('#saved-offers').addEventListener('click', (e) => {
    const id = e.target.dataset.loadOffer;
    if (id) { fillOffer(state.offers.find((o) => o.id === id)); toast('Offer loaded'); }
    const del = e.target.dataset.delOffer;
    if (del) { state.offers = state.offers.filter((o) => o.id !== del); save(); renderSavedOffers(); }
  });
  $('#load-sample').addEventListener('click', () => {
    fillOffer({
      supplier: 'Sample Cruise Line', title: '10-Night Greek Isles Voyage', destination: 'Greek Isles',
      travelDates: 'Spring 2027', deadline: ymd(addDays(new Date(), 30)), price: 'From $3,299 per person',
      perk: 'Free beverage package + $300 onboard credit',
      highlights: 'Sunset sail-away from Santorini\nSmaller ship, uncrowded ports\nOvernight in Mykonos\nShore excursions included',
      tone: 'warm', personal: '',
    });
  });

  // ---------- Posts / Calendar ----------
  const postDialog = $('#post-dialog');
  function openPost(p = {}) {
    const f = $('#post-form');
    $('#post-pillar').innerHTML = '<option value="">—</option>' + pillarOptions(p.pillar);
    const el = f.elements;
    el.id.value = p.id || '';
    el.title.value = p.title || '';
    el.platform.value = p.platform || 'Instagram Post';
    el.date.value = p.date || ymd(new Date());
    el.status.value = p.status || 'Draft';
    el.pillar.value = p.pillar || '';
    el.content.value = p.content || '';
    $('#post-dialog-title').textContent = p.id ? 'Edit post' : 'New post';
    $('#delete-post').style.visibility = p.id ? 'visible' : 'hidden';
    postDialog.showModal();
  }
  $('#post-form').addEventListener('submit', (e) => {
    if (e.submitter?.value !== 'save') return;
    const d = formToObj(e.target);
    if (d.id) Object.assign(state.posts.find((p) => p.id === d.id), d);
    else state.posts.push({ ...d, id: uid() });
    save(); render(); toast('Post saved');
  });
  $('#delete-post').addEventListener('click', () => {
    const id = $('#post-form').elements.id.value;
    if (id && confirm('Delete this post?')) { state.posts = state.posts.filter((p) => p.id !== id); save(); render(); postDialog.close(); }
  });
  $('#copy-post').addEventListener('click', () => copy($('#post-form').elements.content.value));
  $('#new-post').addEventListener('click', () => openPost());

  let calMonth = new Date(); calMonth.setDate(1);
  $('#cal-prev').addEventListener('click', () => { calMonth.setMonth(calMonth.getMonth() - 1); renderCalendar(); });
  $('#cal-next').addEventListener('click', () => { calMonth.setMonth(calMonth.getMonth() + 1); renderCalendar(); });
  $('#cal-today').addEventListener('click', () => { calMonth = new Date(); calMonth.setDate(1); renderCalendar(); });

  function renderCalendar() {
    $('#cal-title').textContent = calMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    $('#cal-legend').innerHTML = [['Instagram', 'var(--c-ig)'], ['Story', 'var(--c-story)'], ['Blog', 'var(--c-blog)'], ['Email', 'var(--c-email)']]
      .map(([l, c]) => `<span style="--c:${c}">${l}</span>`).join('');
    const start = addDays(calMonth, -calMonth.getDay());
    const today = ymd(new Date());
    const byDate = {};
    state.posts.forEach((p) => (byDate[p.date] ||= []).push(p));
    let html = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<div class="cal-dow">${d}</div>`).join('');
    for (let i = 0; i < 42; i++) {
      const d = addDays(start, i); const key = ymd(d);
      if (i >= 35 && d.getMonth() !== calMonth.getMonth()) break;
      const posts = byDate[key] || [];
      html += `<div class="cal-day ${d.getMonth() !== calMonth.getMonth() ? 'other' : ''} ${key === today ? 'today' : ''}" data-day="${key}">
        <span class="dnum">${d.getDate()}</span>
        ${posts.map((p) => `<div class="cal-post ${esc(p.status)}" style="--c:${platformColor(p.platform)}" data-post="${p.id}" title="${esc(p.platform)}: ${esc(p.title)}">${esc(p.title)}</div>`).join('')}
      </div>`;
    }
    $('#cal-grid').innerHTML = html;
  }
  $('#cal-grid').addEventListener('click', (e) => {
    const p = e.target.closest('[data-post]');
    if (p) return openPost(state.posts.find((x) => x.id === p.dataset.post));
    const d = e.target.closest('[data-day]');
    if (d) openPost({ date: d.dataset.day });
  });

  function renderPostTable() {
    const f = $('#post-filter').value;
    const rows = state.posts.filter((p) => !f || p.status === f).sort((a, b) => a.date.localeCompare(b.date));
    $('#post-table').innerHTML = rows.length
      ? `<thead><tr><th>Date</th><th>Platform</th><th>Title</th><th>Pillar</th><th>Status</th></tr></thead><tbody>
        ${rows.map((p) => `<tr class="clickable" data-post="${p.id}"><td>${esc(fmtShort(p.date))}</td><td><span class="tag" style="background:${platformColor(p.platform)}">${esc(p.platform.replace('Instagram ', 'IG '))}</span></td><td>${esc(p.title)}</td><td class="muted">${esc(p.pillar || '—')}</td><td><span class="status ${esc(p.status)}">${esc(p.status)}</span></td></tr>`).join('')}</tbody>`
      : '<tbody><tr><td class="muted">No posts yet — generate a campaign in the Content Studio or click a day above.</td></tr></tbody>';
  }
  $('#post-filter').addEventListener('change', renderPostTable);
  $('#post-table').addEventListener('click', (e) => {
    const r = e.target.closest('[data-post]');
    if (r) openPost(state.posts.find((p) => p.id === r.dataset.post));
  });

  // ---------- Ideas & Pillars ----------
  function renderIdeas() {
    const total = state.pillars.reduce((s, p) => s + (Number(p.mix) || 0), 0);
    $('#pillar-list').innerHTML = state.pillars.map((p) => `
      <div class="pillar">
        <div class="pname">${esc(p.name)}${p.desc ? `<div class="pillar-desc">${esc(p.desc)}</div>` : ''}</div>
        <div class="bar"><i style="width:${Math.min(100, Number(p.mix) || 0)}%"></i></div>
        <div class="pmix">${Number(p.mix) || 0}%</div>
        <button class="x" data-del-pillar="${p.id}">×</button>
      </div>`).join('') + `<p class="hint" style="margin-top:10px">Total mix: ${total}%${total !== 100 ? ' — aim for 100%' : ' ✓'}</p>`;

    const rhythm = [
      ['Mon', 'Reel', 'Destination Inspiration'],
      ['Tue', 'Carousel', 'Insider Tips & Know-How'],
      ['Wed', 'Stories', 'Polls / Q&A — engagement'],
      ['Thu', 'Post or Reel', 'Supplier Offer (from the Studio)'],
      ['Fri', 'Post', 'Meet Your Advisor / Client Stories'],
      ['Sun', 'Blog + Email', 'Every other week — long form, repurposed to IG'],
    ];
    $('#rhythm').innerHTML = rhythm.map(([d, f, t]) => `<div class="rhythm-row"><b>${d}</b><span><strong>${f}</strong> · <span class="muted">${t}</span></span></div>`).join('') +
      '<p class="hint" style="margin-top:10px">A suggested starting cadence — 3–4 feed posts a week plus Stories is plenty to build momentum.</p>';

    $('#idea-pillar').innerHTML = pillarOptions();
    $('#idea-list').innerHTML = state.ideas.map((i) => `
      <div class="idea"><div>${esc(i.text)}</div>
        <div class="idea-foot"><span>${esc(i.pillar || '')}</span>
          <span class="actions"><button class="link" data-plan-idea="${i.id}">Plan it →</button><button class="x" data-del-idea="${i.id}">×</button></span>
        </div></div>`).join('') || '<p class="muted">No ideas yet.</p>';
  }
  $('#pillar-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = formToObj(e.target);
    state.pillars.push({ id: uid(), name: d.name.trim(), mix: Number(d.mix) || 0, desc: '' });
    e.target.reset(); save(); render();
  });
  $('#idea-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = formToObj(e.target);
    state.ideas.unshift({ id: uid(), text: d.text.trim(), pillar: d.pillar });
    e.target.reset(); save(); renderIdeas(); renderHome();
  });
  $('#tab-ideas').addEventListener('click', (e) => {
    const t = e.target.dataset;
    if (t.delPillar && confirm('Remove this pillar?')) { state.pillars = state.pillars.filter((p) => p.id !== t.delPillar); save(); render(); }
    if (t.delIdea) { state.ideas = state.ideas.filter((i) => i.id !== t.delIdea); save(); renderIdeas(); renderHome(); }
    if (t.planIdea) {
      const idea = state.ideas.find((i) => i.id === t.planIdea);
      openPost({ title: idea.text, pillar: idea.pillar, status: 'Idea', date: nextDate(1) });
    }
  });

  // ---------- Clients ----------
  const clientDialog = $('#client-dialog');
  function openClient(c = {}) {
    const f = $('#client-form');
    const el = f.elements;
    el.stage.innerHTML = STAGES.map((s) => `<option>${s}</option>`).join('');
    ['id', 'name', 'email', 'phone', 'trip', 'dates', 'value', 'source', 'notes'].forEach((k) => (el[k].value = c[k] || ''));
    el.stage.value = c.stage || 'Lead';
    $('#delete-client').style.visibility = c.id ? 'visible' : 'hidden';
    clientDialog.showModal();
  }
  $('#new-client').addEventListener('click', () => openClient());
  $('#client-form').addEventListener('submit', (e) => {
    if (e.submitter?.value !== 'save') return;
    const d = formToObj(e.target);
    if (d.id) Object.assign(state.clients.find((c) => c.id === d.id), d);
    else state.clients.push({ ...d, id: uid(), created: ymd(new Date()) });
    save(); render(); toast('Client saved');
  });
  $('#delete-client').addEventListener('click', () => {
    const id = $('#client-form').elements.id.value;
    if (id && confirm('Delete this client?')) { state.clients = state.clients.filter((c) => c.id !== id); save(); render(); clientDialog.close(); }
  });
  function renderClients() {
    $('#pipeline').innerHTML = STAGES.map((s) => {
      const cs = state.clients.filter((c) => c.stage === s);
      const val = cs.reduce((t, c) => t + (Number(c.value) || 0), 0);
      return `<div class="stage"><h3>${s} <span>${cs.length}${val ? ' · ' + money(val) : ''}</span></h3>
        ${cs.map((c) => `<div class="client-card" data-client="${c.id}"><b>${esc(c.name)}</b>${esc(c.trip || '')}${c.dates ? `<div class="muted">${esc(c.dates)}</div>` : ''}</div>`).join('') || `<div class="empty-stage">${s === 'Lead' ? 'Your first client will land here 🧳' : '—'}</div>`}
      </div>`;
    }).join('');
    const checks = [
      'Client profiles (passports, birthdays, preferences, dietary needs)',
      'Trip records with itineraries & confirmation numbers',
      'Supplier deposit & final-payment due-date reminders',
      'Commission tracking (expected vs. received)',
      'Invoicing & online payments for planning fees',
      'Client-facing proposals / branded itineraries',
      'Syncs with Google Workspace (Gmail & Calendar)',
      'Connects to Mailchimp or has built-in email lists',
      'Inquiry form you can embed on Squarespace',
      'Works with WorldVia booking & reporting requirements',
      'Mobile app for on-the-go client questions',
      'Easy data import (export from here as CSV/JSON)',
    ];
    $('#crm-checklist').innerHTML = checks.map((c, i) => `<li><label><input type="checkbox" data-crm="${i}" ${state.crmChecks[i] ? 'checked' : ''}/>${esc(c)}</label></li>`).join('');
  }
  $('#pipeline').addEventListener('click', (e) => {
    const c = e.target.closest('[data-client]');
    if (c) openClient(state.clients.find((x) => x.id === c.dataset.client));
  });
  $('#crm-checklist').addEventListener('change', (e) => { state.crmChecks[e.target.dataset.crm] = e.target.checked; save(); });

  // ---------- Commission estimator ----------
  function renderCommission() {
    const v = +$('#cc-value').value || 0, r = +$('#cc-rate').value || 0, sp = +$('#cc-split').value || 0, fee = +$('#cc-fee').value || 0;
    const gross = v * r / 100; const yours = gross * sp / 100;
    $('#cc-out').innerHTML = `Gross commission ${money(gross)} → your share <b>${money(yours)}</b>${fee ? ` + ${money(fee)} planning fee = <b>${money(yours + fee)}</b>` : ''}`;
  }
  $('#comm-calc').addEventListener('input', renderCommission);

  // ---------- Settings ----------
  function fillSettings() {
    const f = $('#settings-form');
    Object.entries(state.settings).forEach(([k, v]) => { if (f.elements[k]) f.elements[k].value = v; });
  }
  $('#settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.settings = { ...state.settings, ...formToObj(e.target) };
    save(); render();
    $('#settings-saved').textContent = 'Saved ✓';
    setTimeout(() => ($('#settings-saved').textContent = ''), 2000);
  });
  $('#export-data').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `advisor-hq-backup-${ymd(new Date())}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  });
  $('#import-data').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data.settings) throw new Error('Not a backup file');
      state = { ...DEFAULTS(), ...data }; save(); fillSettings(); render(); toast('Backup imported');
    } catch (err) { alert('Could not import: ' + err.message); }
    e.target.value = '';
  });
  $('#reset-data').addEventListener('click', () => {
    if (confirm('Reset everything to defaults? Export a backup first if you want to keep your data.')) {
      state = DEFAULTS(); save(); fillSettings(); render(); toast('Reset to defaults');
    }
  });

  // ---------- Init ----------
  fillSettings();
  let startTab = 'home';
  try { startTab = localStorage.getItem(STORE_KEY + ':tab') || 'home'; } catch { /* ignore */ }
  goto($('#tab-' + startTab) ? startTab : 'home');
})();

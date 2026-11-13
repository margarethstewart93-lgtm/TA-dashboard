# Seasoned Voyages — Advisor HQ

A personal dashboard for running a travel advisor business: resources, marketing, and (soon) sales.

## Open it
- **Locally:** download the repo and double-click `index.html`. No install or build step.
- **Online (optional):** enable GitHub Pages (Settings → Pages → deploy from branch) and bookmark the URL.

Your data is saved in your browser (localStorage). Use **Brand & Settings → Export backup** regularly, and to move data to another computer.

## What's inside
| Section | What it does |
|---|---|
| **Home** | Posts due this week, to-dos, quick-launch links, pipeline stats |
| **Resources** | Website/Squarespace, Google Workspace, Canva, Mailchimp, Instagram, WorldVia, research links. Add your own. **Supplier Hub** placeholder. |
| **Content Studio** | **Upload a supplier PDF** (or paste the terms) → plain-English *Fine print TL;DR*: key dates, numbers, deposit, cancellation, restrictions, extra costs, and a glossary of jargon, written to translate cleanly, with a Google Translate button. In the claude.ai preview, Claude can write the summary, translate it in-page, and auto-fill the offer. Then plug in the offer → Instagram caption (with char/hashtag counter), Canva carousel outline, Reel script + Story sequence, SEO blog draft for Squarespace, Mailchimp email. Pick audience, tone, and pillar; shuffle hooks; save offers; schedule one piece or the whole campaign. |
| **Content Calendar** | Month view + list of all posts, color-coded by platform, with status (Idea → Draft → Scheduled → Published). |
| **Ideas & Pillars** | Content pillars with target mix, suggested weekly rhythm, and an idea bank ("Plan it →" drops an idea onto the calendar). |
| **Clients & Trips** | Lightweight pipeline (Lead → Consultation → Proposal Sent → Booked → Traveled) until you choose a CRM, plus a CRM must-have checklist. |
| **Invoicing** | Placeholder + commission estimator. |
| **Accounting** | Income & expense ledger (categories, status, client/vendor, payment method, receipt link), revenue vs. expenses chart by month, profit & loss statement (printable), expenses by category, expected commissions, tax set-aside estimate, CSV export for your accountant. Filter by year, quarter, or month. |
| **Legal Docs** | Library of your T&Cs, contracts, intake forms, waivers & policies, with version, last-updated date, status, link (e.g. Google Drive), change log, and review reminders (auto-set to 1 year after an Active doc's update date). Includes editable intake-form questions to paste into Google Forms and a compliance checklist. Each client record tracks which documents are on file. |
| **Brand & Settings** | Niche, audience segments, voice, hashtags, booking/signup links — these feed every generated draft. |

## Files
- `index.html` — layout
- `styles.css` — styling (light & dark mode)
- `fineprint.js` — PDF reading (pdf.js, loaded on demand) and the fine-print summarizer
- `app.js` — all logic and content templates (edit the `HOOKS` / `BODY` sections to tune your voice)

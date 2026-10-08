# Quality audit & open questions

## 1. Can a future designer/developer answer the key questions?

| Question | Where it is answered | Verdict |
|---|---|---|
| Who is Mimah's Atelier? | S1 (story, mission, values, owner), S22 | ✅ |
| What does it sell? | S3 (categories, product cards, materials, sizes, price list upload) | ✅ |
| Who buys it? | S6 (audience, locations, habits, FAQs), S21 `customersPhone` | ✅ |
| Why choose it? | S1 `special`/`proud`, S6 `why`/`value`, S16 `different`, S22 | ✅ |
| What makes the brand unique? | S1, S16, S22 | ✅ |
| What products must be displayed? | S3 `cats`, `bestsellers`, `list`, `hidden`; S10 | ✅ |
| How are products priced? | S3 `priceModel`, S5 `showPrices`, currency, wholesale, bundles | ✅ |
| How are orders placed? | S7 (channels, WhatsApp button, form routing), S5 `onlinePay` | ✅ |
| How are custom orders handled? | S4 (types, info needed, quote, deposit, timing, cancel, ideal 7-step flow) | ✅ |
| How are payments handled? | S5 (methods, deposits via S4, receipts), S14 | ✅ (no payment details collected) |
| How is delivery handled? | S8 (pickup, areas, couriers, fees, timing, international, packaging) | ✅ |
| What content must be written? | S13 (readiness matrix + help request), "Please help me write this" flags | ✅ |
| What visual identity? | S2 (logo status/files, colours, style words, typography, inspiration), S10 photo style | ✅ |
| Required website features? | S12 (33 features rated), S18, S7, S10 | ✅ |
| Business rules the site must respect? | S4, S9, S14 (policies), S20 | ✅ |
| What assets exist / what's missing? | S10 matrix, S13, S23 checklist | ✅ |
| What does the owner want the business to become? | S17 (1/3/5 yr, 11 growth options), S22 | ✅ |

## 2. Gaps found during the audit and fixed
- **Budget, launch date, and desired owner effort** were not in the brief but materially affect e-commerce, hosting, and CMS choices → added S21 `budget`, S11 `deadline`, S21 `comfort`/`internet`.
- **Customers' devices/data constraints** → S21 `customersPhone` (mobile-first, light pages).
- **Alert routing and admin devices** → S18 `alerts`, S21 `devices`.
- **Brand voice for copywriting** → S7 `tone`, S13 `tone`/`words`/`wordsAvoid`.
- **Design-copying concern & watermarking** → S10 `watermark`, S20 `designs`/`copy`.
- **Site language** → S12 `lang`.
- **Duplicate questions removed:** domain/hosting (asked once in S21, referenced in S19), social accounts (S15 only, referenced from S7), custom-order cancellation (S4 only, referenced in S14), customer-photo permission (S10 only).
- **Privacy:** no field asks for ID numbers, bank/wallet numbers or passwords; warnings appear on the welcome screen, Section 20, Section 5, and the footer.

## 3. Deliberate design choices
- Only **34 of 258 questions are required**, everything else is optional. “Not sure yet” counts as an answer for required questions so she is never stuck.
- Nothing assumes a payment provider, domain, hosting, or products. Option lists are menus, not assumptions.
- Questions that are only relevant after a previous answer (e.g. deposit %, rush fee) are hidden until needed.

## 4. Known limitations of the prototype
- **No backend:** “Submit” prepares the file; Mimah must send it herself. A later version could post to a form service or a small API.
- **Local storage is per device, per browser, per address.** Opening from a different link/browser starts empty → use *Download backup / Load a saved file*.
- **File upload boxes store names only** by design (no server). Files travel separately.
- Fonts load from Google Fonts when online and fall back to Georgia/system fonts offline.
- To let Mimah open it from a link, host the folder on any static host (e.g. GitHub Pages, Netlify); otherwise zip the folder and send it, and she opens `index.html`.

## 5. Questions that still need clarification (for you, before sending)
1. **Delivery of responses:** will Mimah send the downloaded file by WhatsApp/email, or do you want a form-service/back-end so submissions arrive automatically?
2. **How will she receive the questionnaire:** hosted link or zipped folder? (Affects whether saved progress survives, since it is tied to the address.)
3. **Does Mimah fill it alone, or with you beside her?** If with you, consider a short call to walk through Sections 3 and 4 (the most detailed).
4. **Language of the questionnaire:** English only, or would a Shona/Ndebele version help?
5. **Is she comfortable typing long answers?** If not, offer voice notes for Sections 1 and 22 and transcribe them.
6. **Confirm the questionnaire's tone** works for how you and Mimah relate; adjust section intros if needed.
7. **Currency options** are USD / ZiG / ZAR / Other: confirm these match her market.
8. **Anything you already know** about the business (logo, URLs, products) that could be pre-filled to save her time? The app does not assume any of this today.

## 6. Questions that the *owner's answers* should resolve (feeding the design phase)
Open logo/file status · public WhatsApp number vs private number · whether prices are shown publicly · online payments from launch or later · deposit policy · delivery areas and fees · who updates the site · domain name · launch deadline · whether she wants help writing the About story and policies.

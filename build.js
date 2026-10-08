/* Generates the JSON schema, the readable questionnaire (HTML + Markdown), the summary template and the asset list
 * from questionnaire-data.js.   Run:  node build.js   */
const fs = require("fs"), path = require("path");
const Q = require("./questionnaire-data.js");
const out = (f, t) => { fs.writeFileSync(path.join(__dirname, f), t); console.log("wrote", f); };
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const opts = q => q.options ? q.options.concat(q.other ? ["Other"] : []) : null;
const extras = q => [q.required ? "Required" : "Optional", ...(q.canHelp ? ["'Please help me write this' allowed"] : []), ...(q.noChips ? [] : q.required ? ["'Not sure yet' allowed"] : ["'Not sure yet' / 'Not applicable' allowed"])];

/* ---- 1. JSON schema ---- */
const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: Q.brand + " – " + Q.title, version: Q.version, id: Q.id,
  description: "Definition of every section and question. Used to drive the digital questionnaire and to interpret exported response files.",
  storageNote: Q.storageNote, answerStatuses: Q.chipLabels,
  answerTypes: {
    text: "string", longtext: "string", number: "number|string", url: "string", email: "string", tel: "string", date: "string (YYYY-MM-DD)",
    radio: "string (one of options; 'Other' with companion <id>__other)", checkbox: "string[] (options; 'Other' with companion <id>__other)",
    matrix: "{ [rowId]: choice }", rank: "string[] (ordered, index 0 = most important)", repeater: "object[] keyed by field id",
    multitext: "{ [fieldId]: string }", file: "string[] of file names (files are sent separately)"
  },
  summarySections: Object.fromEntries(Q.summarySections),
  sections: Q.sections.map((s, i) => ({
    id: s.id, number: i + 1, title: s.title, description: s.intro, privacyNote: s.note || undefined, summarySection: s.sum,
    questions: s.questions.map(q => {
      const o = { id: q.id, label: q.label, type: q.type, required: !!q.required, allowNotSure: !q.noChips, allowNotApplicable: !q.noChips && !q.required, allowHelpWriting: !!q.canHelp, summarySection: q.sum || s.sum };
      if (q.help) o.help = q.help; if (q.ex) o.example = q.ex; if (q.options) o.options = q.options; if (q.other) o.allowOther = true;
      if (q.max) o.maxChoices = q.max; if (q.count) o.rankCount = q.count; if (q.suffix) o.suffix = q.suffix;
      if (q.choices) o.choices = q.choices; if (q.rows) o.rows = q.rows; if (q.fields) o.fields = q.fields; if (q.showIf) o.showIf = q.showIf;
      return o;
    })
  }))
};
out("questionnaire.schema.json", JSON.stringify(schema, null, 2));

/* ---- 2. Readable questionnaire (Markdown) ---- */
const total = Q.sections.reduce((n, s) => n + s.questions.length, 0), reqN = Q.sections.reduce((n, s) => n + s.questions.filter(q => q.required).length, 0);
let md = [`# ${Q.brand}`, `## ${Q.title}`, "",
  `*${Q.sections.length} sections · ${total} questions · only ${reqN} are required. Take your time: you can answer in your own words, and “Not sure yet” is always a fine answer.*`, "",
  "**How to read this page:** ☐ = tick all that apply (or the one that fits for single-choice lists) · **(Required)** matters most · **(Optional)** can be skipped.", ""];
Q.sections.forEach((s, i) => {
  md.push("---", "", `## Section ${i + 1}: ${s.title}`, "", `*${s.intro}*`, "");
  if (s.note) md.push(`> ${s.note}`, "");
  s.questions.forEach((q, k) => {
    md.push(`**${i + 1}.${k + 1} ${q.label}** *(${q.required ? "Required" : "Optional"})*`, "");
    if (q.help) md.push(`> ${q.help}`, "");
    if (q.ex) md.push(`> *Example: ${q.ex.replace(/\n/g, " / ")}*`, "");
    if (q.showIf) md.push(`> *(Answer only if you chose: ${q.showIf.any.join(" / ")} in the earlier question.)*`, "");
    const op = opts(q);
    if (op) { op.forEach(o => md.push(`- ☐ ${o}${o === "Other" ? ": ______________" : ""}`)); if (q.max) md.push(`- *(choose up to ${q.max})*`); }
    else if (q.type === "matrix") { md.push(`| | ${q.choices.join(" | ")} |`, `|---|${q.choices.map(() => ":-:").join("|")}|`); q.rows.forEach(r => md.push(`| ${r.label}${r.help ? " – " + r.help : ""} | ${q.choices.map(() => "☐").join(" | ")} |`)); }
    else if (q.type === "rank") md.push(...Array.from({ length: q.count }, (_, n) => `${n + 1}. ______________`), "", "Choose from: " + q.options.join(" · "));
    else if (q.type === "repeater") { md.push(`*Fill in one block for each ${q.itemLabel.toLowerCase()}:*`, ""); q.fields.forEach(f => md.push(`- ${f.label}${f.options ? " (" + f.options.join(" / ") + ")" : ""}: ______________`)); }
    else if (q.type === "multitext") q.fields.forEach(f => md.push(`- ${f.label}: ______________`));
    else if (q.type === "file") md.push("- ☐ I will send this file separately");
    else md.push(q.type === "longtext" ? "______________________________________________" : "______________________", q.suffix ? q.suffix : "");
    if (!q.noChips) md.push("", `☐ Not sure yet${q.required ? "" : "   ☐ Not applicable"}${q.canHelp ? "   ☐ Please help me write this" : ""}`);
    md.push("");
  });
});
out("01-questionnaire.md", md.join("\n"));

/* ---- 2b. Readable questionnaire (printable HTML form) ---- */
let hh = [`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mimah's Atelier · Printable Questionnaire</title><style>
body{font:15px/1.5 Georgia,serif;max-width:820px;margin:24px auto;padding:0 16px;color:#2E2A33}h1{letter-spacing:.2em;color:#4B3769;margin:0}h2{color:#4B3769;border-bottom:2px solid #B8964E;padding-bottom:4px;margin-top:34px;page-break-after:avoid}
.sub{color:#7B5EA7;margin-bottom:12px}.intro{font-style:italic;color:#555}.q{margin:16px 0;page-break-inside:avoid}.l{font-weight:bold}.b{font-size:11px;font-weight:bold;padding:1px 7px;border-radius:9px;margin-left:6px;vertical-align:middle}
.r{background:#7B5EA7;color:#fff}.o{background:#E9E1F5;color:#555}.h,.e{font-size:13px;color:#666}.e{font-style:italic;color:#7B5EA7}.o2{columns:2;margin:4px 0;padding:0;list-style:none}.o2 li{break-inside:avoid;margin:2px 0}
.line{border-bottom:1px solid #999;height:24px}.box{border:1px solid #999;height:90px;border-radius:4px}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border:1px solid #ccc;padding:3px 6px}th{background:#F3EEF9}td.c{text-align:center}.ns{font-size:12px;color:#666;margin-top:3px}
@media print{body{margin:0;max-width:none;font-size:11pt}}</style></head><body>`,
  `<h1>${esc(Q.brand)}</h1><div class="sub">${esc(Q.title)}</div><p class="intro">${Q.sections.length} sections · ${total} questions · only ${reqN} are required. Answer in your own words. “Not sure yet” is always fine. ☐ = tick all that apply. Please don't write passwords, ID numbers or bank details.</p>`];
Q.sections.forEach((s, i) => {
  hh.push(`<h2>Section ${i + 1}: ${esc(s.title)}</h2><p class="intro">${esc(s.intro)}</p>${s.note ? `<p><b>${esc(s.note)}</b></p>` : ""}`);
  s.questions.forEach((q, k) => {
    hh.push(`<div class="q"><div class="l">${i + 1}.${k + 1} ${esc(q.label)}<span class="b ${q.required ? "r" : "o"}">${q.required ? "REQUIRED" : "OPTIONAL"}</span></div>`);
    if (q.help) hh.push(`<div class="h">${esc(q.help)}</div>`);
    if (q.ex) hh.push(`<div class="e">Example: ${esc(q.ex.replace(/\n/g, " / "))}</div>`);
    if (q.showIf) hh.push(`<div class="h">(Only if you chose: ${esc(q.showIf.any.join(" / "))} earlier.)</div>`);
    const op = opts(q);
    if (op) hh.push(`<ul class="o2">${op.map(o => `<li>☐ ${esc(o)}${o === "Other" ? ": ________" : ""}</li>`).join("")}</ul>${q.max ? `<div class="h">Choose up to ${q.max}.</div>` : ""}`);
    else if (q.type === "matrix") hh.push(`<table><tr><th></th>${q.choices.map(c => `<th>${esc(c)}</th>`).join("")}</tr>${q.rows.map(r => `<tr><td>${esc(r.label)}${r.help ? `<br><small>${esc(r.help)}</small>` : ""}</td>${q.choices.map(() => `<td class="c">☐</td>`).join("")}</tr>`).join("")}</table>`);
    else if (q.type === "rank") hh.push(`<div class="h">Pick from: ${esc(q.options.join(" · "))}</div>` + Array.from({ length: q.count }, (_, n) => `<div class="line">${n + 1}.</div>`).join(""));
    else if (q.type === "repeater") hh.push(`<div class="h">Make a copy of this block for each ${esc(q.itemLabel.toLowerCase())}:</div><table>${q.fields.map(f => `<tr><td width="38%">${esc(f.label)}${f.options ? `<br><small>${esc(f.options.join(" / "))}</small>` : ""}</td><td>&nbsp;</td></tr>`).join("")}</table>`);
    else if (q.type === "multitext") hh.push(q.fields.map(f => `<div class="h">${esc(f.label)}</div><div class="line"></div><div class="line"></div>`).join(""));
    else if (q.type === "file") hh.push(`<div>☐ I will send this separately</div>`);
    else hh.push(q.type === "longtext" ? `<div class="box"></div>` : `<div class="line"></div>`);
    if (!q.noChips) hh.push(`<div class="ns">☐ Not sure yet${q.required ? "" : " &nbsp; ☐ Not applicable"}${q.canHelp ? " &nbsp; ☐ Please help me write this" : ""}</div>`);
    hh.push(`</div>`);
  });
});
hh.push("</body></html>");
out("01-questionnaire-printable.html", hh.join("\n"));

/* ---- 3. Discovery summary template ---- */
const placeholder = q => `{{${q.id}}}`;
let t = [`# Website Discovery Summary: {{s1_name}}`, "", "_Auto-populated from the questionnaire responses. `{{id}}` marks where an answer goes; unanswered items show as “Not provided”. Generated by the questionnaire app (`Download discovery summary`) or by a script reading the response JSON._", "",
  "| Completed by | Date submitted | Completion |", "|---|---|---|", "| {{s22_who}} | {{meta.submittedAt}} | {{meta.completionPercent}}% |", ""];
Q.summarySections.forEach(([key, title]) => {
  t.push(`## ${title}`, "");
  Q.sections.forEach(s => s.questions.filter(q => (q.sum || s.sum) === key).forEach(q => t.push(`- **${q.label.replace(/\?$/, "")}:** ${placeholder(q)}`)));
  t.push("");
});
t.push("## Open Questions", "", "{{#each responses where status = 'unsure' or (required and status = 'skipped')}}", "- {{question}} – {{status}}", "{{/each}}", "",
  "## Development Recommendations", "", "_Generated by rule from the answers above, then reviewed by the designer:_", "",
  "- E-commerce vs catalogue + WhatsApp: from `s5_onlinePay`, `s12_features.cart/checkout`, `s17_ecomWhen`",
  "- Custom-order form scope: from `s4_*` answers", "- Mobile-first / light pages: from `s21_customersPhone`, `s21_internet`",
  "- Admin simplicity and training: from `s21_selfAdd`, `s21_comfort`, `s18_*`", "- Copywriting & policy drafting needed: from `s13_help`, `s14_write`, answers flagged “Please help me write this”",
  "- Photography plan: from `s10_have`, `s10_proHelp`", "- Domain / hosting set-up: from `s21_domain`, `s21_hosting`", "- International shipping/currency: from `s8_intl`, `s6_intl`, `s5_currency`", "- Language support: from `s12_lang`", "");
out("03-discovery-summary-template.md", t.join("\n"));

/* ---- 4. Asset checklist ---- */
const assets = Q.sections.find(s => s.id === "s23").questions.find(q => q.id === "s23_assets");
out("assets-to-prepare.md", ["# Assets to prepare before the next phase", "", "Please gather these and send them to your designer (WhatsApp, email or a Google Drive link). Send them as **original files** where you can, not screenshots.", "",
  ...assets.rows.map(r => `- [ ] ${r.label}`), "",
  "## Tips", "",
  "- **Photos:** send the original photo from your phone or camera. When photos are sent through WhatsApp they get squashed. Use “Send as document” if you can, or share a Google Drive folder.",
  "- **Logo:** the best files end in `.svg`, `.ai`, `.eps`, `.pdf` or a large `.png`. Ask whoever designed it.",
  "- **Price list:** a photo of your handwritten list is fine, or a spreadsheet.",
  "- **Customer photos & testimonials:** only include them if the customer agreed, and remove phone numbers.",
  "- **Do not send** ID documents, bank statements or passwords."].join("\n"));
console.log(`${Q.sections.length} sections, ${total} questions, ${reqN} required`);

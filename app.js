/* Mimah's Atelier – Discovery Questionnaire (no backend; answers live in this browser only) */
(function () {
  "use strict";
  const Q = window.QUESTIONNAIRE;
  const KEY = "mimahs-atelier-discovery-v1";
  const SECS = Q.sections;
  const $ = (s, r) => (r || document).querySelector(s);
  const main = $("#main"), nav = $("#nav"), shell = $("#shell");

  /* ---------- tiny DOM helper ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const k in (attrs || {})) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "checked" || k === "value" || k === "disabled" || k === "selected") el[k] = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    kids.flat(Infinity).forEach(c => { if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c)); });
    return el;
  }

  /* ---------- state & storage ---------- */
  const fresh = () => ({ answers: {}, status: {}, view: "welcome", sec: 0, visited: {}, submittedAt: null, startedAt: null, updatedAt: null });
  let saveFailed = false, saveTimer = null;
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return Object.assign(fresh(), JSON.parse(raw)); } catch (e) { saveFailed = true; }
    return fresh();
  }
  let S = load();
  function persist() {
    S.updatedAt = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(S)); saveFailed = false; showSaved(); }
    catch (e) { saveFailed = true; showSaved(); }
  }
  function queueSave() { clearTimeout(saveTimer); saveTimer = setTimeout(persist, 350); }
  function showSaved() {
    const n = $("#saveNote");
    if (saveFailed) { n.textContent = "⚠ Can't save here: download a backup"; n.className = "save-note err"; return; }
    n.className = "save-note";
    n.textContent = "✓ Saved on this device · " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  window.addEventListener("beforeunload", e => { if (saveFailed && Object.keys(S.answers).length) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------- question logic ---------- */
  const allQs = SECS.flatMap(s => s.questions.map(q => Object.assign({ secId: s.id }, q)));
  const qById = Object.fromEntries(allQs.map(q => [q.id, q]));
  const dependents = new Set(allQs.filter(q => q.showIf).map(q => q.showIf.id));

  function visible(q) {
    if (!q.showIf) return true;
    const v = S.answers[q.showIf.id];
    if (Array.isArray(v)) return v.some(x => q.showIf.any.includes(x));
    return q.showIf.any.includes(v);
  }
  const nonEmpty = v => v != null && String(v).trim() !== "";
  function hasValue(q) {
    const v = S.answers[q.id];
    switch (q.type) {
      case "checkbox": case "file": return Array.isArray(v) && v.length > 0;
      case "rank": return Array.isArray(v) && v.some(nonEmpty);
      case "matrix": case "multitext": return v && Object.values(v).some(nonEmpty);
      case "repeater": return Array.isArray(v) && v.some(r => Object.values(r || {}).some(nonEmpty));
      default: return nonEmpty(v);
    }
  }
  const flagged = q => !!S.status[q.id];
  const answered = q => flagged(q) || hasValue(q);
  const visQs = sec => sec.questions.filter(visible);
  const missingReq = sec => visQs(sec).filter(q => q.required && !answered(q));

  function stats() {
    let tot = 0, done = 0, rt = 0, rd = 0;
    SECS.forEach(s => visQs(s).forEach(q => { tot++; if (answered(q)) done++; if (q.required) { rt++; if (answered(q)) rd++; } }));
    return { tot, done, rt, rd, pct: tot ? Math.round(done / tot * 100) : 0 };
  }
  function secState(i) {
    const s = SECS[i], v = visQs(s), d = v.filter(answered).length;
    if (missingReq(s).length && S.visited[s.id]) return "miss";
    if (d === v.length) return "done";
    return d ? "part" : "none";
  }

  /* ---------- answer formatting (review / print / export / summary) ---------- */
  function withOther(q, vals) {
    const o = S.answers[q.id + "__other"];
    return vals.map(x => (x === "Other" && nonEmpty(o)) ? "Other: " + o.trim() : x);
  }
  function answerText(q) {
    const st = S.status[q.id];
    const v = S.answers[q.id];
    if (st && !hasValue(q)) return Q.chipLabels[st];
    let t = "";
    switch (q.type) {
      case "radio": t = withOther(q, [v])[0] || ""; break;
      case "checkbox": t = withOther(q, v || []).join(", "); break;
      case "rank": t = (v || []).map((x, i) => nonEmpty(x) ? (i + 1) + ". " + x : "").filter(Boolean).join("\n"); break;
      case "matrix": t = q.rows.filter(r => v && v[r.id]).map(r => r.label + ": " + v[r.id]).join("\n"); break;
      case "multitext": t = q.fields.filter(f => v && nonEmpty(v[f.id])).map(f => f.label + ": " + v[f.id].trim()).join("\n"); break;
      case "repeater": t = (v || []).filter(r => Object.values(r || {}).some(nonEmpty)).map((r, i) =>
        (i + 1) + ". " + q.fields.filter(f => nonEmpty(r[f.id])).map(f => f.label + ": " + r[f.id]).join(" | ")).join("\n"); break;
      case "file": t = (v || []).join(", ") + ((v || []).length ? " (to be sent separately)" : ""); break;
      default: t = nonEmpty(v) ? String(v).trim() + (q.suffix ? " " + q.suffix : "") : "";
    }
    if (st && hasValue(q)) t += "\n[" + Q.chipLabels[st] + "]";
    return t;
  }

  /* ---------- setters ---------- */
  function setAns(q, val) {
    S.answers[q.id] = val;
    if (S.status[q.id]) { delete S.status[q.id]; const c = $('[data-q="' + q.id + '"]'); if (c) c.classList.remove("flagged"), c.querySelectorAll(".chip").forEach(b => b.setAttribute("aria-pressed", "false")); }
    afterChange(q);
  }
  function afterChange(q) {
    queueSave();
    const el = $('[data-q="' + q.id + '"]'); if (el) el.classList.remove("missing");
    if (dependents.has(q.id)) renderSection(true);
    updateChrome();
  }

  /* ---------- question renderers ---------- */
  function renderInput(q) {
    const v = S.answers[q.id];
    const onTxt = e => setAns(q, e.target.value);
    switch (q.type) {
      case "text": case "url": case "email": case "tel": case "date": case "number": {
        const inp = h("input", { type: q.type === "number" ? "number" : q.type, value: v ?? "", id: "i_" + q.id, oninput: onTxt, inputmode: q.type === "number" ? "decimal" : null, placeholder: q.type === "tel" ? "+263 …" : null, autocomplete: "off" });
        return q.suffix ? h("div", { class: "inline" }, inp, h("span", { text: q.suffix })) : inp;
      }
      case "longtext": return h("textarea", { id: "i_" + q.id, oninput: onTxt, rows: 4 }, v ?? "");
      case "radio": return radioGroup(q);
      case "checkbox": return checkGroup(q);
      case "matrix": return matrix(q);
      case "rank": return rank(q);
      case "repeater": return repeater(q);
      case "multitext": return multitext(q);
      case "file": return fileInput(q);
    }
    return h("span");
  }
  function radioGroup(q) {
    const cur = S.answers[q.id];
    const wrap = h("fieldset", { class: "opts" + (q.options.length > 6 ? " grid-opts" : "") }, h("legend", { class: "sr", style: "position:absolute;left:-999px" }, q.label));
    const opts = q.other ? q.options.concat("Other") : q.options;
    opts.forEach(o => {
      const lab = h("label", { class: "opt" }, h("input", { type: "radio", name: "r_" + q.id, checked: cur === o, onchange: () => setAns(q, o) }), h("span", { text: o }));
      if (o === "Other") lab.append(h("input", { type: "text", class: "other-text", placeholder: "Please tell us", value: S.answers[q.id + "__other"] ?? "", "aria-label": "Other", oninput: e => { S.answers[q.id + "__other"] = e.target.value; if (S.answers[q.id] !== "Other") { S.answers[q.id] = "Other"; lab.firstChild.checked = true; } afterChange(q); } }));
      wrap.append(lab);
    });
    if (cur != null) wrap.append(h("button", { type: "button", class: "clear", onclick: () => { delete S.answers[q.id]; afterChange(q); wrap.querySelectorAll("input[type=radio]").forEach(r => r.checked = false); } }, "Clear my choice"));
    return wrap;
  }
  function checkGroup(q) {
    const cur = new Set(S.answers[q.id] || []);
    const opts = q.other ? q.options.concat("Other") : q.options;
    const wrap = h("fieldset", { class: "opts grid-opts" });
    const syncLimit = () => { if (!q.max) return; const full = cur.size >= q.max; wrap.querySelectorAll("label.opt").forEach(l => { const i = l.querySelector("input[type=checkbox]"); const dis = full && !i.checked; i.disabled = dis; l.classList.toggle("disabled", dis); }); };
    opts.forEach(o => {
      const i = h("input", { type: "checkbox", checked: cur.has(o), onchange: e => { e.target.checked ? cur.add(o) : cur.delete(o); setAns(q, opts.filter(x => cur.has(x))); syncLimit(); } });
      const lab = h("label", { class: "opt" }, i, h("span", { text: o }));
      if (o === "Other") lab.append(h("input", { type: "text", class: "other-text", placeholder: "Please tell us", "aria-label": "Other", value: S.answers[q.id + "__other"] ?? "", oninput: e => { S.answers[q.id + "__other"] = e.target.value; if (!cur.has("Other") && e.target.value) { cur.add("Other"); i.checked = true; setAns(q, opts.filter(x => cur.has(x))); syncLimit(); } else afterChange(q); } }));
      wrap.append(lab);
    });
    if (q.max) wrap.append(h("div", { class: "mcount", text: "Choose up to " + q.max }));
    queueMicrotask(syncLimit);
    return wrap;
  }
  function matrix(q) {
    const cur = Object.assign({}, S.answers[q.id] || {});
    const count = h("div", { class: "mcount" });
    const upd = () => count.textContent = Object.keys(cur).length + " of " + q.rows.length + " answered";
    const box = h("div", { class: "matrix" }, q.rows.map(r => h("div", { class: "mrow" },
      h("div", { class: "mrow__label" }, r.label, r.help ? h("small", { text: r.help }) : null),
      h("div", { class: "pills", role: "radiogroup", "aria-label": r.label }, q.choices.map(c =>
        h("label", { class: "pill" }, h("input", { type: "radio", name: q.id + "_" + r.id, checked: cur[r.id] === c, onchange: () => { cur[r.id] = c; setAns(q, Object.assign({}, cur)); upd(); } }), h("span", { text: c })))))));
    upd();
    return h("div", {}, box, count);
  }
  function rank(q) {
    const cur = (S.answers[q.id] || []).slice();
    while (cur.length < q.count) cur.push("");
    const selects = [];
    const sync = () => selects.forEach((s, i) => [...s.options].forEach(o => { o.disabled = o.value !== "" && cur.some((c, j) => c === o.value && j !== i); }));
    const wrap = h("div", { class: "rank" }, cur.map((val, i) => {
      const s = h("select", { "aria-label": "Rank " + (i + 1), onchange: e => { cur[i] = e.target.value; sync(); setAns(q, cur.slice()); } },
        h("option", { value: "" }, "Choose…"), q.options.map(o => h("option", { value: o, selected: o === val }, o)));
      selects.push(s);
      return h("label", {}, h("b", { text: String(i + 1) }), s);
    }));
    sync();
    return wrap;
  }
  function fieldInput(f, val, onIn) {
    if (f.type === "long") return h("textarea", { oninput: e => onIn(e.target.value) }, val ?? "");
    if (f.type === "select") return h("select", { onchange: e => onIn(e.target.value) }, h("option", { value: "" }, "Choose…"), f.options.map(o => h("option", { value: o, selected: o === val }, o)));
    return h("input", { type: f.type === "number" ? "number" : f.type === "url" ? "url" : "text", value: val ?? "", placeholder: f.ex || "", oninput: e => onIn(e.target.value), inputmode: f.type === "number" ? "decimal" : null });
  }
  function repeater(q) {
    let rows = (S.answers[q.id] && S.answers[q.id].length) ? S.answers[q.id].map(r => Object.assign({}, r)) : [{}];
    const list = h("div", { class: "rep" });
    const commit = () => setAns(q, rows.map(r => Object.assign({}, r)));
    const draw = () => {
      list.replaceChildren(...rows.map((r, i) => h("div", { class: "rep__item" },
        h("div", { class: "rep__top" }, h("strong", { text: q.itemLabel + " " + (i + 1) }),
          rows.length > 1 || Object.keys(r).length ? h("button", { type: "button", class: "btn ghost sm danger", onclick: () => { rows.splice(i, 1); if (!rows.length) rows = [{}]; commit(); draw(); } }, "Remove") : null),
        h("div", { class: "rep__grid" }, q.fields.map(f => h("label", { class: f.type === "long" ? "wide" : "" }, f.label, fieldInput(f, r[f.id], val => { r[f.id] = val; commit(); })))))));
    };
    draw();
    return h("div", {}, list, h("div", { class: "actions" }, h("button", { type: "button", class: "btn ghost sm", onclick: () => { rows.push({}); draw(); list.lastChild.querySelector("input,textarea,select").focus(); } }, "＋ " + q.addLabel)));
  }
  function multitext(q) {
    const cur = Object.assign({}, S.answers[q.id] || {});
    return h("div", { class: "mt" }, q.fields.map(f => h("label", {}, f.label, h("textarea", { oninput: e => { cur[f.id] = e.target.value; setAns(q, Object.assign({}, cur)); } }, cur[f.id] ?? ""))));
  }
  function fileInput(q) {
    const names = (S.answers[q.id] || []).slice();
    const ul = h("ul", { class: "filelist" });
    const draw = () => ul.replaceChildren(...names.map((n, i) => h("li", {}, "📎 " + n, h("button", { type: "button", class: "clear", onclick: () => { names.splice(i, 1); setAns(q, names.slice()); draw(); } }, "remove"))));
    draw();
    return h("div", { class: "files" },
      h("input", { type: "file", multiple: true, "aria-label": "Choose files", onchange: e => { [...e.target.files].forEach(f => names.includes(f.name) || names.push(f.name)); e.target.value = ""; setAns(q, names.slice()); draw(); } }),
      h("div", { class: "q__help", text: "Only the file names are remembered here. You'll send the files themselves separately (see Section 23)." }), ul);
  }

  function chipsFor(q) {
    if (q.noChips) return null;
    const kinds = q.required ? ["unsure"] : ["unsure", "na"];
    if (q.canHelp) kinds.push("help");
    return h("div", { class: "chips", role: "group", "aria-label": "Other ways to answer" }, kinds.map(k =>
      h("button", { type: "button", class: "chip", "aria-pressed": S.status[q.id] === k ? "true" : "false", onclick: () => {
        if (S.status[q.id] === k) delete S.status[q.id]; else S.status[q.id] = k;
        queueSave(); const old = $('[data-q="' + q.id + '"]'); if (old) old.replaceWith(renderQuestion(q)); updateChrome();
      } }, Q.chipLabels[k])));
  }
  function renderQuestion(q) {
    return h("div", { class: "q" + (flagged(q) ? " flagged" : ""), "data-q": q.id, id: "q_" + q.id },
      h("div", { class: "q__head" },
        h("label", { class: "q__label", for: ["radio", "checkbox", "matrix", "rank", "repeater", "multitext", "file"].includes(q.type) ? null : "i_" + q.id }, q.label),
        h("span", { class: "badge " + (q.required ? "req" : "optl"), text: q.required ? "Required" : "Optional" })),
      q.help ? h("p", { class: "q__help", text: q.help }) : null,
      q.ex ? h("p", { class: "q__ex", text: "Example: " + q.ex }) : null,
      h("div", { class: "q__input" }, renderInput(q)),
      chipsFor(q),
      h("div", { class: "q__err", role: "alert", text: "This one is required. Answer it, or tap “Not sure yet”." }));
  }

  /* ---------- chrome: progress + nav ---------- */
  function updateChrome() {
    const st = stats();
    $("#progress").hidden = S.view === "welcome";
    $("#progressText").textContent = st.pct + "% complete";
    $("#progressReq").textContent = st.rt ? st.rd + " of " + st.rt + " required answered" : "";
    $("#threadFill").style.width = st.pct + "%";
    $("#threadBall").style.left = st.pct + "%";
    $("#threadBar").setAttribute("aria-valuenow", st.pct);
    buildNav();
  }
  function buildNav() {
    const show = S.view !== "welcome";
    nav.hidden = !show; shell.classList.toggle("no-nav", !show);
    $("#menuBtn").style.display = show ? "" : "none";
    if (!show) return;
    nav.replaceChildren(h("ol", {}, SECS.map((s, i) => {
      const st = secState(i);
      return h("li", {}, h("button", { type: "button", "aria-current": (S.view === "section" && S.sec === i) ? "step" : null, onclick: () => go("section", i) },
        h("span", { class: "dot " + st, "aria-hidden": "true" }, st === "done" ? "✓" : st === "miss" ? "!" : String(i + 1)),
        h("span", {}, s.title, h("span", { style: "position:absolute;left:-999px" }, " (" + ({ done: "complete", part: "in progress", miss: "needs required answers", none: "not started" })[st] + ")"))));
    }), h("li", { class: "sep", "aria-hidden": "true" }), h("li", {}, h("button", { type: "button", "aria-current": S.view === "review" ? "step" : null, onclick: () => go("review") }, h("span", { class: "dot" }, "★"), h("span", {}, "Review & submit")))));
  }
  function closeDrawer() { nav.classList.remove("open"); $("#scrim").classList.remove("show"); $("#scrim").hidden = true; $("#menuBtn").setAttribute("aria-expanded", "false"); }
  $("#menuBtn").addEventListener("click", () => { const o = !nav.classList.contains("open"); nav.classList.toggle("open", o); $("#scrim").hidden = !o; $("#scrim").classList.toggle("show", o); $("#menuBtn").setAttribute("aria-expanded", String(o)); });
  $("#scrim").addEventListener("click", closeDrawer);

  /* ---------- navigation ---------- */
  function go(view, sec, qid) {
    if (S.view === "section") S.visited[SECS[S.sec].id] = true;
    S.view = view; if (sec != null) S.sec = sec;
    persist(); closeDrawer(); render();
    if (qid) { const el = $("#q_" + qid); if (el) { el.scrollIntoView({ block: "center" }); const i = el.querySelector("input,textarea,select"); i && i.focus({ preventScroll: true }); return; } }
    window.scrollTo({ top: 0 }); main.focus({ preventScroll: true });
  }
  function render() {
    updateChrome();
    ({ welcome: renderWelcome, section: () => renderSection(false), review: renderReview, done: renderDone })[S.view]();
  }

  /* ---------- views ---------- */
  function renderWelcome() {
    const st = stats(), started = Object.keys(S.answers).length || Object.keys(S.status).length;
    main.replaceChildren(h("div", { class: "card" },
      h("div", { class: "eyebrow", text: "Welcome" }),
      h("h1", { text: "Let's get to know Mimah's Atelier" }),
      h("p", { class: "lede", text: "Imagine we're sitting down together with a cup of tea while I ask about your craft, your customers and your dreams. The more you share, the better your website will feel like you." }),
      h("div", { class: "steps" },
        h("div", { class: "step" }, h("b", { text: "☕ Take your time" }), "About 45–60 minutes in total. Stop whenever you like, then come back. We save as you go."),
        h("div", { class: "step" }, h("b", { text: "✦ Required or optional" }), "Questions marked ", h("span", { class: "badge req", text: "Required" }), " matter most. Everything else is ", h("span", { class: "badge optl", text: "Optional" }), "."),
        h("div", { class: "step" }, h("b", { text: "🧶 Not sure? Perfectly fine" }), "Under most questions you can tap “Not sure yet” or “Not applicable”. That counts as an answer."),
        h("div", { class: "step" }, h("b", { text: "✍ Your own words" }), "Write the way you speak. Short answers are fine, and so are long stories.")),
      h("div", { class: "note ok" }, "🔒 ", h("strong", { text: "Your answers are saved only on this device." }), " ", Q.storageNote, " Please don't enter passwords, ID numbers or bank/wallet numbers anywhere."),
      h("div", { class: "actions" },
        started ? h("button", { class: "btn", onclick: () => go(S.submittedAt ? "review" : "section", S.sec) }, "Continue where I left off (" + st.pct + "%)") : null,
        h("button", { class: started ? "btn ghost" : "btn", onclick: () => { S.startedAt = S.startedAt || new Date().toISOString(); go("section", started ? 0 : 0); } }, started ? "Go to the first section" : "Let's begin"),
        h("label", { class: "btn ghost sm", style: "cursor:pointer" }, "Load a saved file", h("input", { type: "file", accept: ".json,application/json", style: "display:none", onchange: importFile })),
        started ? h("button", { class: "btn danger sm", onclick: resetAll }, "Start over") : null)));
  }

  function renderSection(keepScroll) {
    const y = window.scrollY, ae = document.activeElement, aeKey = ae && (ae.name ? "[name=\"" + ae.name + "\"]:checked" : ae.id ? "#" + ae.id : null), sec = SECS[S.sec], i = S.sec;
    const list = h("div", {}, visQs(sec).map(renderQuestion));
    const banner = h("div", { id: "banner" });
    main.replaceChildren(h("section", { class: "card", "aria-labelledby": "sec-title" },
      h("div", { class: "eyebrow", text: "Section " + (i + 1) + " of " + SECS.length }),
      h("h2", { id: "sec-title", text: sec.title }),
      h("p", { class: "lede", text: sec.intro }),
      sec.note ? h("div", { class: "note warn", text: sec.note }) : null,
      h("hr", { class: "stitch" }), list, banner,
      h("div", { class: "pager" },
        i > 0 ? h("button", { class: "btn ghost", onclick: () => go("section", i - 1) }, "← Back") : h("button", { class: "btn ghost", onclick: () => go("welcome") }, "← Welcome"),
        h("button", { class: "btn", onclick: () => next(i, banner) }, i === SECS.length - 1 ? "Review my answers →" : "Save & continue →"))));
    if (keepScroll) { window.scrollTo({ top: y }); try { const t = aeKey && main.querySelector(aeKey); t && t.focus({ preventScroll: true }); } catch (e) {} }
  }
  function next(i, banner) {
    const miss = missingReq(SECS[i]);
    const go2 = () => go(i === SECS.length - 1 ? "review" : "section", i + 1);
    if (!miss.length || banner.dataset.warned) return go2();
    miss.forEach(q => $('[data-q="' + q.id + '"]').classList.add("missing"));
    banner.dataset.warned = "1";
    banner.replaceChildren(h("div", { class: "note warn", role: "alert" },
      "You skipped " + miss.length + " required question" + (miss.length > 1 ? "s" : "") + " on this page (highlighted above). Please answer them, or tap “Not sure yet”. You can also continue and come back later.",
      h("div", { class: "actions" }, h("button", { class: "btn sm", onclick: () => { const el = $('[data-q="' + miss[0].id + '"]'); el.scrollIntoView({ block: "center" }); } }, "Show me the first one"), h("button", { class: "btn ghost sm", onclick: go2 }, "Continue anyway"))));
    banner.scrollIntoView({ block: "center" });
  }

  function reviewBlock(forPrint) { /* returns [{sec, items}] */
    return SECS.map((sec, i) => ({ sec, i, items: visQs(sec).map(q => ({ q, text: answerText(q), done: answered(q) })) }));
  }
  function renderReview() {
    const st = stats(); const miss = SECS.flatMap(s => missingReq(s));
    main.replaceChildren(h("div", { class: "card" },
      h("div", { class: "eyebrow", text: "Almost done" }),
      h("h2", { text: "Review your answers" }),
      h("p", { class: "lede", text: "Take a look through everything. Tap “Edit” beside any answer to change it. Questions that still need you are highlighted." }),
      miss.length ? h("div", { class: "note warn", role: "alert" }, h("strong", { text: miss.length + " required question" + (miss.length > 1 ? "s" : "") + (miss.length > 1 ? " still need an answer: " : " still needs an answer: ") }),
        miss.map((q, k) => [h("a", { href: "#", onclick: e => { e.preventDefault(); go("section", SECS.findIndex(s => s.id === q.secId), q.id); } }, q.label.replace(/\?$/, "")), k < miss.length - 1 ? " · " : ""]))
        : h("div", { class: "note ok", text: "All required questions are answered. You're ready to submit." }),
      h("p", { class: "mcount", text: st.done + " of " + st.tot + " questions answered (" + st.pct + "%). Optional questions you skipped are shown in grey." }),
      reviewBlock().map(b => h("div", { class: "rev-sec" },
        h("h3", {}, (b.i + 1) + ". " + b.sec.title, h("button", { class: "btn ghost sm", onclick: () => go("section", b.i) }, "Open section")),
        b.items.map(it => {
          const miss = it.q.required && !it.done;
          return h("div", { class: "rev-q" + (miss ? " miss" : "") + (!it.done ? " skip" : "") },
            h("div", { class: "rev-l" }, it.q.label, miss ? h("span", { class: "tag-miss", text: "NEEDS AN ANSWER" }) : null),
            h("div", { class: "rev-a", text: it.done ? it.text : "Skipped" }),
            h("button", { class: "btn ghost sm", "aria-label": "Edit: " + it.q.label, onclick: () => go("section", b.i, it.q.id) }, "Edit"));
        }))),
      h("hr", { class: "stitch" }),
      (window.SUBMIT_CONFIG || {}).formspreeId ? h("div", { class: "note", text: "When you tap Submit, your answers are sent securely to your designer. After that they also stay saved on this device. You can still download a copy." }) : null,
      h("div", { id: "submitMsg" }),
      h("div", { class: "actions" },
        h("button", { class: "btn gold", id: "submitBtn", onclick: submit }, "Submit my questionnaire ✓"),
        h("button", { class: "btn ghost", onclick: () => doPrint() }, "🖨 Print / save as PDF"),
        h("button", { class: "btn ghost", onclick: () => downloadJSON() }, "⬇ Download my answers (backup)"),
        h("span", { class: "spacer" }),
        h("button", { class: "btn ghost", onclick: () => go("section", SECS.length - 1) }, "← Back to the last section"))));
  }
  function submit() {
    const miss = SECS.flatMap(s => missingReq(s));
    if (miss.length) { window.scrollTo({ top: 0 }); const n = main.querySelector(".note.warn"); n.setAttribute("tabindex", "-1"); n.focus(); return; }
    const id = (window.SUBMIT_CONFIG || {}).formspreeId;
    if (!id) { S.submittedAt = new Date().toISOString(); persist(); return go("done"); }
    const btn = $("#submitBtn"), msg = $("#submitMsg");
    btn.disabled = true; btn.textContent = "Sending…"; msg.replaceChildren();
    const payload = exportObj(); payload.meta.submittedAt = new Date().toISOString();
    fetch("https://formspree.io/f/" + id, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: "Mimah's Atelier questionnaire: " + (S.answers.s22_who || "new submission") + " (" + payload.meta.completionPercent + "% complete)",
        name: S.answers.s22_who || "", completion: payload.meta.completionPercent + "%",
        summary: buildSummary(), answers_json: JSON.stringify(payload)
      })
    }).then(r => { if (!r.ok) throw new Error(r.status); S.submittedAt = payload.meta.submittedAt; S.sentAt = S.submittedAt; persist(); go("done"); })
      .catch(() => {
        btn.disabled = false; btn.textContent = "Try sending again ✓";
        msg.replaceChildren(h("div", { class: "note warn", role: "alert" }, "We couldn't send your answers (check your internet connection). Nothing is lost: your answers are still saved here. Please try again, or tap “Download my answers” and send the file by WhatsApp or email."));
      });
  }
  function renderDone() {
    main.replaceChildren(h("div", { class: "card" },
      h("div", { class: "big-check", "aria-hidden": "true", text: "✓" }),
      h("h2", { text: "Thank you, this is wonderful." }),
      S.sentAt
        ? [h("p", { class: "lede", text: "Your answers have been sent to your designer. 💜 There's one more thing: please send the photos and files from your checklist (Section 23) by WhatsApp, email or a Google Drive link." }),
           h("p", { class: "mcount", text: "Tip: use the buttons below to keep a copy for yourself." })]
        : [h("p", { class: "lede", text: "Your questionnaire is complete, but it has not been sent yet. Please do the two steps below so your designer receives it." }),
           h("ol", {}, h("li", {}, h("strong", { text: "Download your answers file " }), "(the first button below)."), h("li", {}, h("strong", { text: "Send it to your designer " }), "by WhatsApp or email, together with the photos and files from the checklist in Section 23."))],
      h("div", { class: "actions" },
        h("button", { class: "btn", onclick: () => downloadJSON(true) }, "⬇ Download my answers (.json)"),
        h("button", { class: "btn ghost", onclick: downloadSummary }, "⬇ Download discovery summary (.md)"),
        h("button", { class: "btn ghost", onclick: () => doPrint() }, "🖨 Print / save as PDF")),
      h("div", { class: "note", text: "Submitted " + new Date(S.submittedAt).toLocaleString() + ". Your answers remain saved on this device. You can still make changes any time." }),
      h("div", { class: "actions" }, h("button", { class: "btn ghost sm", onclick: () => go("review") }, "Edit my answers"))));
  }

  /* ---------- export / import / print ---------- */
  function download(name, text, mime) {
    const a = h("a", { href: URL.createObjectURL(new Blob([text], { type: mime })), download: name });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function exportObj() {
    const st = stats();
    return {
      meta: { questionnaire: Q.id, version: Q.version, brand: Q.brand, exportedAt: new Date().toISOString(), submittedAt: S.submittedAt, completionPercent: st.pct, requiredAnswered: st.rd + "/" + st.rt, requiredMissing: SECS.flatMap(s => missingReq(s)).map(q => q.id), note: "Business information only. Contains no passwords or payment details." },
      responses: SECS.flatMap(s => visQs(s).map(q => ({ section: s.id, sectionTitle: s.title, id: q.id, question: q.label, type: q.type, required: !!q.required, status: S.status[q.id] ? S.status[q.id] : hasValue(q) ? "answered" : "skipped", answer: S.answers[q.id] ?? null, other: S.answers[q.id + "__other"] ?? undefined }))),
      raw: { answers: S.answers, status: S.status }
    };
  }
  function downloadJSON(final) {
    download("mimahs-atelier-discovery-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(exportObj(), null, 2), "application/json");
  }
  function importFile(e) {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const d = JSON.parse(rd.result);
        if (!d.raw || !d.raw.answers) throw new Error("not a questionnaire file");
        if (Object.keys(S.answers).length && !confirm("This will replace the answers currently saved on this device. Continue?")) return;
        S = Object.assign(fresh(), { answers: d.raw.answers, status: d.raw.status || {}, submittedAt: d.meta && d.meta.submittedAt || null, view: "section", sec: 0 });
        persist(); render();
      } catch (err) { alert("Sorry, that file doesn't look like a Mimah's Atelier questionnaire file."); }
    };
    rd.readAsText(f);
  }
  function resetAll() {
    if (!confirm("Start over? This will erase everything you've entered on this device. (Tip: download a backup first.)")) return;
    S = fresh(); persist(); render();
  }

  function doPrint() {
    const pa = $("#printArea");
    pa.replaceChildren(h("h1", { text: Q.brand }), h("div", { class: "p-sub" }, Q.title + " · printed " + new Date().toLocaleDateString()),
      reviewBlock().map(b => [h("h2", { text: (b.i + 1) + ". " + b.sec.title }), b.items.map(it => h("div", { class: "p-q" }, h("div", { class: "p-l", text: it.q.label + (it.q.required ? " *" : "") }), h("div", { class: "p-a" + (it.done ? "" : " none"), text: it.done ? it.text : "(not answered)" })))]));
    window.print();
  }

  /* ---------- discovery summary (Markdown) ---------- */
  function downloadSummary() { download("mimahs-atelier-discovery-summary.md", buildSummary(), "text/markdown"); }
  function buildSummary() {
    const by = {}; const open = [], helpQs = [];
    SECS.forEach(s => visQs(s).forEach(q => {
      const key = q.sum || s.sum;
      if (!answered(q)) { if (q.required) open.push("(Required, unanswered) " + q.label); return; }
      const st = S.status[q.id];
      if (st === "unsure") open.push(q.label + " – owner is not sure yet");
      if (st === "help") helpQs.push(q.label);
      if (st === "na" || (st && !hasValue(q))) return;
      (by[key] = by[key] || []).push("- **" + q.label.replace(/\?$/, "") + ":** " + answerText(q).replace(/\n/g, "\n  "));
    }));
    const a = id => S.answers[id], has = (id, ...vals) => { const v = a(id); return Array.isArray(v) ? v.some(x => vals.includes(x)) : vals.includes(v); };
    const feat = a("s12_features") || {}, essentials = Object.keys(feat).filter(k => feat[k] === "Essential").map(k => qById.s12_features.rows.find(r => r.id === k).label);
    const rec = [];
    if (has("s5_onlinePay", "Yes, from the start") || feat.cart === "Essential" || feat.checkout === "Essential") rec.push("Build full e-commerce (cart + checkout) from launch; confirm the payment gateway for Zimbabwe (e.g. Paynow / mobile money).");
    else rec.push("Launch as a catalogue with WhatsApp ordering and an enquiry form; structure products so a cart can be added later.");
    if (a("s4_accepts") && !has("s4_accepts", "No")) rec.push("Build a guided custom-order request form with reference-image upload and clear deposit/timeline information.");
    if (has("s21_customersPhone", "Mostly phones")) rec.push("Design mobile-first and keep images light (customers likely browse on phones, possibly with limited data).");
    if (has("s21_selfAdd", "Yes", "Sometimes")) rec.push("Provide a very simple admin area so the owner can add/edit products herself" + (has("s21_comfort", "Only the basics", "I'd need a lot of help") ? " (owner reports limited tech comfort: plus training)." : "."));
    if (has("s13_help", "Yes, all of it", "Yes, some of it")) rec.push("Plan copywriting: About story, product descriptions, FAQ and policies drafted from her answers for her approval.");
    if (has("s10_proHelp", "Yes") || ["None", "A few"].includes((a("s10_have") || {}).products)) rec.push("Plan a photography shoot or photo guidelines before build.");
    if (has("s21_domain", "No", "Not sure what that is") || has("s21_hosting", "No", "Not sure what that is")) rec.push("Help with domain and hosting set-up and explain yearly costs.");
    if (has("s8_intl", "Yes", "Not yet, but I'd like to") || has("s6_intl", "Yes, soon")) rec.push("Consider international shipping rules and multi-currency display.");
    if ((a("s12_lang") || []).some(x => x !== "English")) rec.push("Plan for multiple website languages.");
    rec.push("Review the Open Questions list with the owner before design starts.");
    const out = ["# Website Discovery Summary: " + (a("s1_name") || "Mimah's Atelier"), "", "_Generated " + new Date().toLocaleString() + " from the owner's questionnaire responses. Completion: " + stats().pct + "%._", ""];
    Q.summarySections.forEach(([k, title]) => { out.push("## " + title, ""); out.push(...((by[k] && by[k].length) ? by[k] : ["_No information provided yet._"]), ""); });
    out.push("## Open Questions", "", ...(open.length ? open.map(x => "- " + x) : ["_None flagged._"]), "");
    if (helpQs.length) out.push("### Owner asked for writing help on", "", ...helpQs.map(x => "- " + x), "");
    out.push("## Development Recommendations", "", ...rec.map(x => "- " + x), "");
    if (essentials.length) out.push("**Features marked Essential:** " + essentials.join(", "), "");
    return out.join("\n");
  }

  render();
})();

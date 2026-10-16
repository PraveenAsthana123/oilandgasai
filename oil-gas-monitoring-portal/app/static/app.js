'use strict';
const $ = id => document.getElementById(id);
let token = '', offset = 0, total = 0, timer = null, busy = false, selected = null, catalog = [], generation = 0;
const fmt = t => t ? new Date(t).toLocaleString() : 'None received';
function message(s) { $('message').textContent = s; }
async function api(path, options = {}) {
  const res = await fetch(path, {...options, headers: {...options.headers, Authorization: `Bearer ${token}`}, signal: AbortSignal.timeout(8000)});
  if (!res.ok) {
    if (res.status === 401) disconnect('Session rejected. Enter a valid reviewer credential.');
    let detail = `Request failed (${res.status})`;
    try { const body = await res.json(); if (typeof body.detail === 'string') detail = body.detail; } catch (_) {}
    throw new Error(detail);
  }
  return res.json();
}
function disconnect(reason = 'Disconnected') {
  if (typeof clearAgency === 'function') clearAgency();
  token = ''; generation++; clearTimeout(timer); timer = null; selected = null;
  $('review-dialog').close(); $('token').value = ''; catalog = []; renderScenarios();
  $('connection').textContent = 'Disconnected'; $('connection').className = 'error';
  $('rows').replaceChildren(); emptyRow('Connect to load the observation queue.');
  for (const key of ['pending','confirmed','dismissed','last']) $(key).textContent = '—';
  $('module-list').replaceChildren(); $('knowledge-results').replaceChildren(); $('model-report').textContent = 'Connect to inspect reports.';
  $('updated').textContent = 'No authenticated update'; total = 0; offset = 0; updatePage(); message(reason);
}
function emptyRow(text) { const row = $('rows').insertRow(); const cell = row.insertCell(); cell.colSpan = 6; cell.className = 'empty'; cell.textContent = text; }
function cell(row, value, small) { const el = row.insertCell(); el.textContent = value; if (small) { const sub = document.createElement('small'); sub.textContent = small; el.append(sub); } return el; }
function updatePage() { $('page').textContent = total ? `${offset + 1}–${Math.min(offset + 25,total)} of ${total}` : 'No results'; $('prev').disabled = offset === 0; $('next').disabled = offset + 25 >= total; }
async function refresh() {
  if (!token || busy) return;
  busy = true; const current = generation; clearTimeout(timer);
  try {
    const camera = $('camera').value.trim();
    if (camera && !/^[a-zA-Z0-9_-]{1,80}$/.test(camera)) throw new Error('Camera ID may contain letters, numbers, underscores and hyphens.');
    const query = new URLSearchParams({state: $('state').value,limit:'25',offset:String(offset)});
    if (camera) query.set('camera_id',camera);
    const [summary, list] = await Promise.all([api('/v1/overview'),api(`/v1/ppe/events?${query}`)]);
    if (current !== generation) return;
    for (const key of ['pending','confirmed','dismissed']) $(key).textContent = summary.counts[key];
    $('last').textContent = fmt(summary.latest_received_at);
    $('updated').textContent = `Updated ${fmt(summary.server_time)}`;
    $('rows').replaceChildren(); total = list.total;
    for (const item of list.items) {
      const o = item.observation, row = $('rows').insertRow();
      cell(row,fmt(o.observed_at),`Received ${fmt(item.received_at)}`);
      cell(row,o.camera_id,o.source_id); cell(row,o.missing_items.join(', '),o.model_version);
      cell(row,`${(o.confidence * 100).toFixed(1)}%`,'Model score'); cell(row,item.state);
      const action = row.insertCell();
      if (item.state === 'pending') { const btn = document.createElement('button'); btn.textContent = 'Review'; btn.addEventListener('click',() => openReview(item)); action.append(btn); }
      else { action.textContent = item.review?.reason || 'Reviewed'; }
    }
    if (!list.items.length) emptyRow(offset ? 'No events on this page. Use Previous.' : 'No observations match this filter.');
    updatePage(); $('connection').textContent = 'Connected · 3s refresh'; $('connection').className = ''; message('');
  } catch (e) {
    if (current === generation) { $('connection').textContent = 'Update failed · data may be stale'; $('connection').className = 'error'; message(e.message); }
  } finally { busy = false; if (token) timer = setTimeout(refresh,3000); }
}
function openReview(item) {
  selected = item.id; $('review-description').textContent = `${item.observation.camera_id} · ${item.observation.missing_items.join(', ')} · ${fmt(item.observation.observed_at)}`;
  $('reason').value = ''; $('decision').value = 'confirmed'; $('review-error').textContent = ''; $('review-dialog').showModal();
}
$('review-form').addEventListener('submit',async e => {
  e.preventDefault(); if (!selected || !token) return;
  $('submit-review').disabled = true;
  try { await api(`/v1/ppe/events/${selected}/review`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({decision:$('decision').value,reason:$('reason').value.trim()})}); $('review-dialog').close(); selected = null; await refresh(); }
  catch (err) { $('review-error').textContent = err.message; }
  finally { $('submit-review').disabled = false; }
});
$('cancel-review').addEventListener('click',() => $('review-dialog').close());
$('connect').addEventListener('submit',async e => {
  e.preventDefault(); const supplied = $('token').value.trim(); disconnect('Connecting…'); token = supplied; $('token').value = '';
  const current = generation;
  await refresh();
  if (!token || current !== generation) return;
  try { const result = await api('/v1/scenarios'); if (current !== generation) return; catalog = result.items;
    const domains = [...new Set(catalog.map(x => x.domain))]; $('domain').replaceChildren(new Option('All domains',''),...domains.map(x => new Option(x,x))); renderScenarios();
  } catch (err) { message(err.message); }
});
$('disconnect').addEventListener('click',() => disconnect());
$('refresh').addEventListener('click',refresh);
for (const id of ['apply','state']) $(id).addEventListener(id === 'state' ? 'change' : 'click',() => { offset = 0; refresh(); });
$('prev').addEventListener('click',() => {offset = Math.max(0,offset - 25); refresh();});
$('next').addEventListener('click',() => {offset += 25; refresh();});
for (const button of document.querySelectorAll('[data-view]')) button.addEventListener('click',() => {
  for (const view of document.querySelectorAll('.view')) view.hidden = view.id !== button.dataset.view;
  for (const btn of document.querySelectorAll('[data-view]')) btn.classList.toggle('active',btn === button);
  if ($('view-description')) $('view-description').textContent = button.dataset.view === 'portfolio' ? 'Explore departmental use cases, inspect evidence and risks, and export a reviewed client report.' : 'Inspect observations, evidence and integration status. Human review remains required.';
  $('title').textContent = {operations:'Live operations',scenarios:'Use cases & scenarios',readiness:'Integration readiness',modules:'Model workbench',portfolio:'Client demo portfolio'}[button.dataset.view];
});
function renderScenarios() {
  const query = $('scenario-search').value.toLowerCase(), domain = $('domain').value; $('scenario-list').replaceChildren();
  for (const item of catalog.filter(x => (!domain || x.domain === domain) && JSON.stringify(x).toLowerCase().includes(query))) {
    const article = document.createElement('article'), badge = document.createElement('span'), h = document.createElement('h3');
    badge.className = 'badge'; badge.textContent = `${item.domain} · ${item.status}`; h.textContent = `${item.id} — ${item.title}`; article.append(badge,h);
    const summary = document.createElement('p'); summary.textContent = item.trigger; article.append(summary);
    const details = document.createElement('details'), caption = document.createElement('summary'); caption.textContent = 'Workflow & acceptance'; details.append(caption);
    for (const key of ['actor','input','workflow','expected','exceptions','acceptance']) {const line = document.createElement('p'), label = document.createElement('strong'); label.textContent = `${key[0].toUpperCase()+key.slice(1)}: `; line.append(label,document.createTextNode(item[key])); details.append(line);}
    article.append(details); $('scenario-list').append(article);
  }
  if (!$('scenario-list').children.length) $('scenario-list').textContent = token ? 'No scenarios match.' : 'Connect to load scenarios.';
}
$('scenario-search').addEventListener('input',renderScenarios); $('domain').addEventListener('change',renderScenarios); updatePage();

$('load-modules').addEventListener('click',async () => {
  if (!token) {message('Connect with your reviewer credential first.'); return;}
  const current = generation;
  try {
    const result = await api('/v1/modules');
    if (current !== generation) return;
    $('module-list').replaceChildren();
    for (const item of result.items) {
      const card = document.createElement('article'), title = document.createElement('h3'); title.textContent = item.title;
      const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = item.run_status; card.append(title,badge);
      for (const key of ['statistical','ml','cv','nlp','transformer']) {
        const p = document.createElement('p'), label = document.createElement('strong'); label.textContent = key.toUpperCase()+': ';
        p.append(label,document.createTextNode(item[key])); card.append(p);
      }
      const button = document.createElement('button'); button.textContent = 'View report'; button.disabled = item.run_status === 'not_run';
      button.addEventListener('click',async () => {
        const revision = generation;
        try {const report = await api(`/v1/modules/${item.id}/report`); if (revision === generation) $('model-report').textContent = JSON.stringify(report,null,2);}
        catch (error) {message(error.message);}
      }); card.append(button); $('module-list').append(card);
    }
  } catch (error) {message(error.message);}
});
$('knowledge-form').addEventListener('submit',async event => {
  event.preventDefault(); if (!token) {message('Connect first.'); return;}
  const current = generation;
  try {
    const result = await api('/v1/knowledge/search?q='+encodeURIComponent($('knowledge-query').value));
    if (current !== generation) return;
    $('knowledge-results').replaceChildren();
    for (const item of result.items) {const article = document.createElement('article'), title = document.createElement('h3'), text = document.createElement('p'); title.textContent = item.source+' · offset '+item.offset; text.textContent = item.text; article.append(title,text); $('knowledge-results').append(article);}
    if (!result.items.length) $('knowledge-results').textContent = 'No supporting document found.';
  } catch (error) {message(error.message);}
});

'use strict';
let agencyPortfolio = null, agencyScenario = null, agencyRun = null, agencyReplayTimer = null;
const agencyUrls = [];
function clearAgency() {
  agencyPortfolio = null; agencyScenario = null; agencyRun = null; clearInterval(agencyReplayTimer);
  for (const url of agencyUrls) URL.revokeObjectURL(url); agencyUrls.length = 0;
  for (const id of ['agency-cards','agency-risk-register','agency-case-risks','agency-history','agency-media','agency-answer']) $(id).replaceChildren();
  $('agency-detail').hidden = true; $('agency-result').hidden = true;
  for (const id of ['agency-departments','agency-usecases','agency-technologies','agency-risks']) $(id).textContent = '—';
}
async function agencyRequest(path, options = {}) {
  if (!token) throw new Error('Connect with the reviewer credential first.');
  const response = await fetch(path,{...options,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,...options.headers},signal:AbortSignal.timeout(60000)});
  if (response.status === 401) disconnect('Session rejected. Connect again.');
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : `Request failed (${response.status})`);
  return data;
}
function agencyText(tag,text,className) { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; }
function renderRisks(target,risks) {
  target.replaceChildren();
  for (const risk of risks) {const article = document.createElement('article'); article.append(agencyText('strong',`${risk.id} · ${risk.severity} · ${risk.category}`),agencyText('p',risk.risk),agencyText('small',`${risk.owner} — ${risk.control}`)); target.append(article);}
}
async function loadAgency() {
  const current = generation;
  try {
    const data = await agencyRequest('/v1/agency/portfolio'); if (current !== generation) return;
    agencyPortfolio = data; $('agency-name').textContent = data.agency_name;
    const departments = [...new Set(data.items.map(x => x.department))], technologies = [...new Set(data.items.flatMap(x => x.technologies))].sort();
    $('agency-department').replaceChildren(new Option('All departments',''),...departments.map(x => new Option(x,x)));
    $('agency-technology').replaceChildren(new Option('All technologies',''),...technologies.map(x => new Option(x,x)));
    $('agency-departments').textContent = departments.length; $('agency-usecases').textContent = data.items.length;
    $('agency-technologies').textContent = technologies.length; $('agency-risks').textContent = data.risks.length;
    renderRisks($('agency-risk-register'),data.risks); renderAgencyCards();
  } catch (error) {message(error.message);}
}
function renderAgencyCards() {
  if (!agencyPortfolio) return;
  const department = $('agency-department').value, technology = $('agency-technology').value, query = $('agency-search').value.toLowerCase();
  const items = agencyPortfolio.items.filter(x => (!department || x.department === department) && (!technology || x.technologies.includes(technology)) && JSON.stringify(x).toLowerCase().includes(query));
  $('agency-cards').replaceChildren(); $('agency-count').textContent = `${items.length} matching use cases`;
  for (const item of items) {
    const card = document.createElement('article');
    card.append(agencyText('span',item.department,'badge'),agencyText('h3',`${item.id} — ${item.title}`),agencyText('p',item.objective),agencyText('p',item.technologies.join(' · '),'muted'),agencyText('small',`${item.mode} · ${item.available ? 'Evidence ready' : 'Evidence not built'}`));
    const button = agencyText('button','Open use case'); button.addEventListener('click',() => selectAgencyCase(item)); card.append(button); $('agency-cards').append(card);
  }
}
function selectAgencyCase(item) {
  clearInterval(agencyReplayTimer); agencyScenario = item; agencyRun = null;
  $('agency-detail').hidden = false; $('agency-result').hidden = true;
  $('agency-case-title').textContent = `${item.id} — ${item.title}`; $('agency-case-description').textContent = item.objective;
  $('agency-case-kpi').textContent = `Pilot KPI to measure: ${item.business_kpi}. No achieved client savings are claimed.`;
  $('agency-workflow').replaceChildren(...item.workflow.map(s => agencyText('li',s)));
  $('agency-run').disabled = !item.available; $('agency-run-status').textContent = item.available ? 'Prepared evidence is available. Simulations recompute using the bounded settings.' : 'Build this evidence through the offline CLI first.';
  for (const id of ['inflow-label','outflow-label']) $(id).hidden = item.engine !== 'twin';
  $('blocked-label').hidden = item.engine !== 'route'; $('gap-label').hidden = item.engine !== 'iot'; $('question-label').hidden = item.engine !== 'rag';
  $('agency-question').value = ''; $('agency-blocked').checked = false; $('agency-gap').checked = false;
  renderRisks($('agency-case-risks'),agencyPortfolio.risks.filter(x => item.risk_ids.includes(x.id)));
  $('agency-detail').scrollIntoView({behavior:'smooth',block:'start'});
}
function svgElement(tag,attrs={}) {const el = document.createElementNS('http://www.w3.org/2000/svg',tag); for (const [key,value] of Object.entries(attrs)) el.setAttribute(key,value); return el;}
function renderChart(chart,limit=null) {
  $('agency-visual').replaceChildren(); if (!chart) return;
  const original = chart.points || [], points = original.slice(0,limit === null ? original.length : limit);
  if (chart.kind === 'bars') {
    const box = document.createElement('div'); box.className = 'agency-bars'; const max = Math.max(1,...points.map(p => p.y));
    for (const point of points) {const row = document.createElement('div'), meter = document.createElement('progress');meter.max = max;meter.value = point.y; row.append(agencyText('span',point.label),meter,agencyText('strong',String(point.y)));box.append(row);} $('agency-visual').append(box);return;
  }
  const valid = original.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
  const minX = chart.kind === 'route' ? 0 : Math.min(...valid.map(p => p.x)), maxX = chart.kind === 'route' ? 9 : Math.max(...valid.map(p => p.x));
  const minY = chart.kind === 'route' ? 0 : Math.min(...valid.map(p => p.y)), maxY = chart.kind === 'route' ? 9 : Math.max(...valid.map(p => p.y));
  const sx = x => 55 + 660*(x-minX)/Math.max(1e-9,maxX-minX), sy = y => 300 - 250*(y-minY)/Math.max(1e-9,maxY-minY);
  const svg = svgElement('svg',{viewBox:'0 0 760 360',role:'img','aria-label':`${chart.kind} visualization: ${chart.y_label || ''}`});
  svg.append(svgElement('path',{d:'M55 40 V300 H720',stroke:'#607b94',fill:'none'}));
  for (const point of chart.obstacles || []) svg.append(svgElement('rect',{x:sx(point.x)-12,y:sy(point.y)-12,width:24,height:24,fill:'#ca6c66'}));
  const colors = ['#45d9b2','#f2bc69','#80b6f5','#c49cf1']; let segment = [];
  const flush = () => {if (segment.length) svg.append(svgElement('polyline',{points:segment.join(' '),fill:'none',stroke:'#45d9b2','stroke-width':2})); segment = [];};
  for (const point of points) {
    if (!Number.isFinite(point.y)) {flush(); continue;}
    if (['line','route'].includes(chart.kind)) segment.push(`${sx(point.x)},${sy(point.y)}`);
    else {const circle = svgElement('circle',{cx:sx(point.x),cy:sy(point.y),r:chart.kind === 'map' ? 2 : 3,fill:colors[(point.group || 0)%4],opacity:.8});const title = svgElement('title');title.textContent = point.label;circle.append(title);svg.append(circle);}
  }
  flush();
  for (const [x,y,text] of [[55,325,`${minX.toFixed(2)} → ${maxX.toFixed(2)} · ${chart.x_label || ''}`],[55,25,`${chart.y_label || ''} · ${minY.toFixed(2)} → ${maxY.toFixed(2)}`]]) {const el = svgElement('text',{x,y,fill:'#b0c5d7','font-size':12});el.textContent = text;svg.append(el);}
  $('agency-visual').append(svg);
}
async function renderAgencyRun(run) {
  agencyRun = run; const result = run.payload.result; const current = generation;
  $('agency-result').hidden = false; $('agency-mode').textContent = `${result.mode} · ${run.state} · ${run.id}. Demonstration evidence; not operational certification.`;
  $('agency-metrics').replaceChildren();
  for (const [key,value] of Object.entries(result.metrics || {})) {const card = document.createElement('article');card.append(agencyText('small',key.replaceAll('_',' ')),agencyText('strong',typeof value === 'number' ? Number(value.toFixed(4)).toLocaleString() : String(value)));$('agency-metrics').append(card);}
  renderChart(result.chart);$('agency-replay').hidden = result.mode !== 'historical replay';
  $('agency-media').replaceChildren();
  for (const media of result.media || []) {
    try {
      const response = await fetch('/v1/agency/media/'+encodeURIComponent(media.file),{headers:{Authorization:`Bearer ${token}`}});
      if (!response.ok) throw new Error('Media unavailable'); const blob = await response.blob();if (current !== generation || agencyRun?.id !== run.id) return;
      const url = URL.createObjectURL(blob);agencyUrls.push(url);const figure = document.createElement('figure'),image = document.createElement('img');image.src = url;image.alt = media.caption;figure.append(image,agencyText('figcaption',media.caption));$('agency-media').append(figure);
    } catch (error) {message(error.message);}
  }
  $('agency-answer').replaceChildren();
  if (result.answer) { $('agency-answer').append(agencyText('h3','Source-grounded draft'),agencyText('p',result.answer),agencyText('small',result.generation_status));
    for (const source of result.evidence || []) $('agency-answer').append(agencyText('p',`[${source.id}] ${source.source} at character ${source.offset}: ${source.text}`)); }
  $('agency-evidence').textContent = JSON.stringify(result,null,2);
  $('agency-limitations').replaceChildren(...(result.limitations || []).map(x => agencyText('li',x)));
  $('agency-review-reason').value = '';$('agency-review-save').disabled = run.state !== 'draft';
  $('agency-review-state').textContent = run.review ? `${run.state}: ${run.review.reason}` : 'Awaiting demonstration review.';
}
$('agency-load').addEventListener('click',loadAgency);
for (const id of ['agency-department','agency-technology']) $(id).addEventListener('change',renderAgencyCards);
$('agency-search').addEventListener('input',renderAgencyCards);
$('agency-run').addEventListener('click',async () => {
  if (!agencyScenario) return; const current = generation,selected = agencyScenario.id;
  $('agency-run').disabled = true; $('agency-run-status').textContent = 'Preparing evidence…';
  try {const run = await agencyRequest('/v1/agency/runs',{method:'POST',body:JSON.stringify({scenario_id:selected,inflow:Number($('agency-inflow').value),outflow:Number($('agency-outflow').value),blocked:$('agency-blocked').checked,inject_gap:$('agency-gap').checked,question:$('agency-question').value.trim() || null})});
    if (current !== generation || agencyScenario?.id !== selected) return;
    await renderAgencyRun(run); $('agency-run-status').textContent = 'Evidence loaded. Inspect results and risks, then record your review.';
  } catch (error) {$('agency-run-status').textContent = error.message;} finally {$('agency-run').disabled = !agencyScenario?.available;}
});
$('agency-replay').addEventListener('click',() => {clearInterval(agencyReplayTimer);if (!agencyRun) return;const chart = agencyRun.payload.result.chart;let index = 0;agencyReplayTimer = setInterval(() => {renderChart(chart,++index);if (index >= chart.points.length) clearInterval(agencyReplayTimer);},100);});
$('agency-review-form').addEventListener('submit',async event => {
  event.preventDefault(); if (!agencyRun) return; const current = generation,id = agencyRun.id;
  $('agency-review-save').disabled = true;
  try {const run = await agencyRequest(`/v1/agency/runs/${id}/review`,{method:'POST',body:JSON.stringify({decision:$('agency-decision').value,reason:$('agency-review-reason').value.trim()})});if (current === generation && agencyRun?.id === id) await renderAgencyRun(run);}
  catch (error) {message(error.message); if (agencyRun?.state === 'draft') $('agency-review-save').disabled = false;}
});
$('agency-export').addEventListener('click',async () => {
  if (!agencyRun) return; const id = agencyRun.id,current = generation;
  try {const report = await agencyRequest(`/v1/agency/runs/${id}/report`);if (current !== generation) return;const url = URL.createObjectURL(new Blob([report.markdown],{type:'text/markdown'})),link = document.createElement('a');link.href = url;link.download = `Oil-Gas-Client-${id}.md`;document.body.append(link);link.click();link.remove();setTimeout(() => URL.revokeObjectURL(url),1000);} catch (error) {message(error.message);}
});
$('agency-history-load').addEventListener('click',async () => {
  const current = generation;
  try {const data = await agencyRequest('/v1/agency/runs');if (current !== generation) return;$('agency-history').replaceChildren();
    for (const item of data.items) {const button = agencyText('button',`${item.scenario_id} · ${item.state} · ${fmt(item.created_at)}`,'secondary');button.addEventListener('click',async () => {try {const run = await agencyRequest(`/v1/agency/runs/${item.id}`);if (current !== generation) return;const selected = agencyPortfolio?.items.find(x => x.id === run.scenario_id);if (!selected) {message('Load the portfolio first.'); return;}selectAgencyCase(selected);await renderAgencyRun(run);}catch(error){message(error.message);}});$('agency-history').append(button);}
  } catch (error) {message(error.message);}
});

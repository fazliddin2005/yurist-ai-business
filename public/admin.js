// admin.js -- Super Admin panel frontend mantiqi.
// Bu B2C/B2B foydalanuvchi tizimidan butunlay alohida -- o'zining maxfiy
// "admin_token"ini ishlatadi, oddiy foydalanuvchi tokeniga aralashmaydi.
const API = '/api/admin';

// DIQQAT: admin token ATAYLAB sessionStorage'da saqlanadi (localStorage emas) --
// chunki bu eng yuqori xavfsizlik darajasidagi panel, "meni eslab qol" qulayligi
// kerak emas. sessionStorage brauzer TAB/OYNA yopilganda avtomatik tozalanadi,
// shuning uchun har safar yangi sessiyada parol qaytadan so'raladi.
function authToken(){ return sessionStorage.getItem('admin_token'); }
function setAuthToken(t){ t ? sessionStorage.setItem('admin_token', t) : sessionStorage.removeItem('admin_token'); }
function authHeaders(){ const t=authToken(); return t ? {Authorization:'Bearer '+t} : {}; }

async function apiGet(path){
  const r = await fetch(API+path, {headers:authHeaders()});
  if(r.status===401){ setAuthToken(null); showGate(); throw new Error('Qaytadan kiring'); }
  const data = await r.json().catch(()=>({}));
  if(!r.ok){ throw new Error(data.error||'Server xatosi'); }
  return data;
}

function showGate(){
  document.getElementById('adminGate').style.display='flex';
  document.getElementById('adminApp').classList.remove('show');
}
function hideGate(){
  document.getElementById('adminGate').style.display='none';
  document.getElementById('adminApp').classList.add('show');
}
function showGateError(msg){
  document.getElementById('adminGateError').textContent = msg;
}

async function adminLogin(){
  const password = document.getElementById('adminPassword').value;
  showGateError('');
  try{
    const r = await fetch(API+'/login', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({password})});
    const data = await r.json();
    if(!r.ok){ showGateError(data.error||'Xatolik'); return; }
    setAuthToken(data.token);
    afterLogin();
  }catch(e){ showGateError('Server bilan bog\'lanib bo\'lmadi'); }
}
function adminLogout(){
  setAuthToken(null);
  location.reload();
}

/* ============ 10 DAQIQA HARAKATSIZLIKDAN KEYIN AVTOMATIK CHIQISH ============ */
// XAVFSIZLIK TALABI: admin panel eng yuqori himoya darajasiga ega bo'lishi
// kerak -- agar foydalanuvchi 10 daqiqa davomida HECH QANDAY harakat
// qilmasa (sichqoncha, klaviatura, teginish), avtomatik chiqarib yuboriladi,
// hatto tab/oyna ochiq qolsa ham.
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 daqiqa
let idleTimer = null;

function resetIdleTimer(){
  if(!authToken()) return; // login qilmagan bo'lsa, taymerga hojat yo'q
  clearTimeout(idleTimer);
  idleTimer = setTimeout(()=>{
    setAuthToken(null);
    alert("10 daqiqa harakatsizlik sababli tizimdan chiqarildingiz. Xavfsizlik uchun qaytadan kiring.");
    location.reload();
  }, IDLE_TIMEOUT_MS);
}
// Har qanday foydalanuvchi harakatida taymerni qaytadan boshlaymiz.
['mousemove','mousedown','keydown','scroll','touchstart','click'].forEach(evt=>{
  document.addEventListener(evt, resetIdleTimer, {passive:true});
});

async function afterLogin(){
  hideGate();
  goPage('overview');
  resetIdleTimer(); // login bo'lgandan keyin taymerni boshlaymiz
}

/* ============ NAVIGATION ============ */
document.getElementById('adminNav').addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-page]');
  if(!btn) return;
  goPage(btn.dataset.page);
});
function goPage(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('#adminNav button').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelector(`#adminNav button[data-page="${page}"]`).classList.add('active');

  if(page==='overview') loadOverview();
  if(page==='users') loadUsers();
  if(page==='workspaces') loadWorkspaces();
  if(page==='activity') loadActivity();
  if(page==='accuracy') loadAccuracy();
  if(page==='terms') loadTermsVersions();
  if(page==='incidents') loadIncidents();
}

/* ============ OVERVIEW ============ */
async function loadOverview(){
  try{
    const data = await apiGet('/overview');
    renderOverview(data);
  }catch(e){ console.error(e); }
}
function renderOverview(data){
  const u = data.users, rev = data.revenue, wsData = data.workspaces;
  document.getElementById('overviewStats').innerHTML = `
    <div class="stat-card"><div class="cap">Jami foydalanuvchilar</div><div class="num">${u.total}</div><div class="sub">+${u.newToday} bugun</div></div>
    <div class="stat-card"><div class="cap">Faol (7 kun)</div><div class="num">${u.activeThisWeek}</div></div>
    <div class="stat-card"><div class="cap">B2C hujjatlar</div><div class="num">${data.documents.b2cTotal}</div></div>
    <div class="stat-card"><div class="cap">B2B tashkilotlar</div><div class="num">${wsData.total}</div></div>
    <div class="stat-card"><div class="cap">Sotilgan kreditlar</div><div class="num">${rev.totalCreditsSold.toLocaleString('ru-RU')}</div></div>`;

  document.getElementById('userGrowthStats').innerHTML = `
    <table>
      <tr><td>Bugun</td><td style="text-align:right;font-weight:700">${u.newToday}</td></tr>
      <tr><td>So'nggi 7 kun</td><td style="text-align:right;font-weight:700">${u.newThisWeek}</td></tr>
      <tr><td>So'nggi 30 kun</td><td style="text-align:right;font-weight:700">${u.newThisMonth}</td></tr>
      <tr><td>Jami</td><td style="text-align:right;font-weight:700">${u.total}</td></tr>
    </table>`;

  const planRows = Object.entries(wsData.byPlan||{}).map(([plan,count])=>`<tr><td>${plan}</td><td style="text-align:right;font-weight:700">${count}</td></tr>`).join('');
  document.getElementById('revenueStats').innerHTML = `
    <table>
      <tr><td>Jami sotib olish hodisalari</td><td style="text-align:right;font-weight:700">${rev.totalPurchaseEvents}</td></tr>
      <tr><td>Jami sotilgan kredit</td><td style="text-align:right;font-weight:700">${rev.totalCreditsSold.toLocaleString('ru-RU')}</td></tr>
    </table>
    ${planRows ? `<h4 style="margin-top:14px;margin-bottom:8px;font-size:12.5px;color:var(--muted)">Tariflar bo'yicha</h4><table>${planRows}</table>` : ''}`;
}

/* ============ USERS ============ */
async function loadUsers(){
  try{
    const {users} = await apiGet('/users');
    renderUsers(users);
  }catch(e){ console.error(e); }
}
function renderUsers(users){
  const c = document.getElementById('usersTable');
  if(!users.length){ c.innerHTML = `<div class="empty-state"><div class="ei">👥</div><p>Hali foydalanuvchi yo'q</p></div>`; return; }
  c.innerHTML = `<table>
    <thead><tr><th>Ism</th><th>Email/Telefon</th><th>Kredit</th><th>Til</th><th>Tasdiqlangan</th>
      <th>📜 Shartlar v.</th><th>📜 Rozilik vaqti</th><th>📜 IP manzil</th><th>Ro'yxatdan o'tgan</th></tr></thead>
    <tbody>${users.map(u=>`
      <tr>
        <td>${u.name||'—'}</td>
        <td>${u.email||u.phone||'—'}</td>
        <td>${u.credits}</td>
        <td>${(u.lang||'uz').toUpperCase()}</td>
        <td>${u.verified ? '✅' : '⬜'}</td>
        <td>${u.termsAcceptedVersion || '<span style="color:#f87171">yo\'q</span>'}</td>
        <td style="white-space:nowrap;font-size:12px">${u.termsAcceptedAt ? new Date(u.termsAcceptedAt).toLocaleString('ru-RU') : '—'}</td>
        <td style="font-family:monospace;font-size:12px">${u.termsAcceptedIp ? `<a href="javascript:void(0)" onclick="document.getElementById('ipSearchInput').value='${u.termsAcceptedIp}';searchByIp()" style="color:var(--accent)">${u.termsAcceptedIp}</a>` : '—'}</td>
        <td>${new Date(u.createdAt).toLocaleString('ru-RU')}</td>
      </tr>`).join('')}</tbody>
  </table>`;
}

/* ============ IP QIDIRUVI (huquqiy dalil) ============ */
async function searchByIp(){
  const ip = document.getElementById('ipSearchInput').value.trim();
  if(!ip) return;
  const resultBox = document.getElementById('ipSearchResult');
  resultBox.innerHTML = `<p style="color:var(--muted);font-size:13px">Qidirilmoqda...</p>`;
  try{
    const {users, searchedIp} = await apiGet(`/users/by-ip?ip=${encodeURIComponent(ip)}`);
    if(!users.length){
      resultBox.innerHTML = `<div class="empty-state" style="padding:20px 0"><p>IP <b>${searchedIp}</b> manzilidan hech kim rozilik bermagan.</p></div>`;
      return;
    }
    resultBox.innerHTML = `
      <p style="font-size:12.5px;color:var(--muted);margin-bottom:10px"><b>${users.length}</b> foydalanuvchi <b>${searchedIp}</b> manzilidan rozilik bergan:</p>
      <table>
        <thead><tr><th>Ism</th><th>Email/Telefon</th><th>Shartlar v.</th><th>Rozilik vaqti</th></tr></thead>
        <tbody>${users.map(u=>`
          <tr>
            <td>${u.name||'—'}</td>
            <td>${u.email||u.phone||'—'}</td>
            <td>${u.termsAcceptedVersion||'—'}</td>
            <td style="white-space:nowrap;font-size:12px">${u.termsAcceptedAt ? new Date(u.termsAcceptedAt).toLocaleString('ru-RU') : '—'}</td>
          </tr>`).join('')}</tbody>
      </table>`;
  }catch(e){
    resultBox.innerHTML = `<p style="color:#f87171;font-size:13px">Xatolik: ${e.message}</p>`;
  }
}
function clearIpSearch(){
  document.getElementById('ipSearchInput').value = '';
  document.getElementById('ipSearchResult').innerHTML = '';
}

/* ============ WORKSPACES ============ */
async function loadWorkspaces(){
  try{
    const {workspaces} = await apiGet('/workspaces');
    renderWorkspaces(workspaces);
  }catch(e){ console.error(e); }
}
function renderWorkspaces(workspaces){
  const c = document.getElementById('workspacesTable');
  if(!workspaces.length){ c.innerHTML = `<div class="empty-state"><div class="ei">🏢</div><p>Hali B2B tashkilot yo'q</p></div>`; return; }
  c.innerHTML = `<table>
    <thead><tr><th>Nomi</th><th>Tarif</th><th>Xodimlar</th><th>Kredit</th><th>Yurisdiksiya</th><th>Yaratilgan</th></tr></thead>
    <tbody>${workspaces.map(w=>`
      <tr>
        <td>${w.name}</td>
        <td>${w.plan}</td>
        <td>${w.memberCount}/${w.seatsLimit}</td>
        <td>${w.credits}</td>
        <td>${w.primaryJurisdictionId||'UZ'}</td>
        <td>${new Date(w.createdAt).toLocaleString('ru-RU')}</td>
      </tr>`).join('')}</tbody>
  </table>`;
}

/* ============ ACTIVITY LOG ============ */
const ACTIVITY_LABELS = {
  user_registered: {label:'Ro\'yxatdan o\'tdi', cls:'register', ic:'📝'},
  user_login: {label:'Kirdi', cls:'login', ic:'🔓'},
  user_logout: {label:'Chiqdi', cls:'logout', ic:'🚪'},
  credit_purchased: {label:'Kredit sotib oldi', cls:'credit', ic:'🪙'},
  promo_redeemed: {label:'Promokod ishlatdi', cls:'credit', ic:'🎟️'},
  document_created: {label:'Hujjat yaratdi', cls:'document', ic:'📄'},
  chat_message_sent: {label:'AI chatdan foydalandi', cls:'chat', ic:'💬'},
  risk_analysis_run: {label:'Xavf tahlili qildi', cls:'audit', ic:'🛡️'},
  workspace_created: {label:'Workspace yaratdi', cls:'workspace', ic:'🏢'},
  workspace_deleted: {label:'Workspace o\'chirdi', cls:'workspace', ic:'🗑️'},
  b2b_member_added: {label:'Xodim qo\'shdi', cls:'workspace', ic:'👥'},
  b2b_template_created: {label:'B2B shablon yaratdi', cls:'document', ic:'📄'},
  b2b_audit_run: {label:'B2B audit qildi', cls:'audit', ic:'🛡️'},
  b2b_api_key_created: {label:'API kalit yaratdi', cls:'workspace', ic:'🔑'},
};
function activityMetaSummary(a){
  const m = a.meta || {};
  const parts = [];
  if(m.amount) parts.push(`${m.amount} kredit`);
  if(m.creditsGiven) parts.push(`${m.creditsGiven} kredit`);
  if(m.templateKey) parts.push(m.templateKey);
  if(m.category) parts.push(m.category);
  if(m.score!==undefined) parts.push(`${m.score}% / ${m.tier}`);
  if(m.jurisdictionId) parts.push(m.jurisdictionId);
  if(m.workspaceName) parts.push(m.workspaceName);
  if(m.role) parts.push(m.role);
  if(m.label) parts.push(m.label);
  return parts.join(' · ');
}
async function loadActivity(){
  const type = document.getElementById('activityFilter').value;
  const params = new URLSearchParams({ limit: 300 });
  if(type) params.set('type', type);
  try{
    const {activity} = await apiGet('/activity?'+params.toString());
    renderActivity(activity);
  }catch(e){ console.error(e); }
}
function renderActivity(activity){
  const c = document.getElementById('activityTable');
  if(!activity.length){ c.innerHTML = `<div class="empty-state"><div class="ei">📋</div><p>Hali faollik yo'q</p></div>`; return; }
  c.innerHTML = `<table>
    <thead><tr><th>Vaqt</th><th>Foydalanuvchi</th><th>Amal</th><th>Tafsilot</th></tr></thead>
    <tbody>${activity.map(a=>{
      const info = ACTIVITY_LABELS[a.type] || {label:a.type, cls:'other', ic:'•'};
      return `<tr>
        <td style="white-space:nowrap;color:var(--muted);font-size:12px">${new Date(a.createdAt).toLocaleString('ru-RU')}</td>
        <td>${a.userLabel||'—'}</td>
        <td><span class="pill ${info.cls}">${info.ic} ${info.label}</span></td>
        <td style="color:var(--muted);font-size:12px">${activityMetaSummary(a)}</td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

/* ============ ACCURACY METRICS (RAGAS-uslubida) ============ */
async function loadAccuracy(){
  const days = document.getElementById('accuracyDaysFilter').value;
  try{
    const data = await apiGet(`/accuracy?days=${days}`);
    renderAccuracy(data);
  }catch(e){ console.error(e); }
}
function renderAccuracy(data){
  if(!data.count){
    document.getElementById('accuracyStats').innerHTML = `<div class="stat-card" style="grid-column:1/-1"><div class="cap">Ma'lumot yo'q</div><div style="font-size:13px;color:var(--muted);margin-top:8px">Bu davrda hali baholangan AI javobi yo'q. OPENAI_API_KEY sozlangan bo'lishi va foydalanuvchilar AI'dan foydalanishi kerak.</div></div>`;
    document.getElementById('accuracyByJurisdiction').innerHTML = '';
    return;
  }
  document.getElementById('accuracyStats').innerHTML = `
    <div class="stat-card"><div class="cap">Baholangan javoblar</div><div class="num">${data.count}</div></div>
    <div class="stat-card"><div class="cap">Faithfulness (ishonchlilik)</div><div class="num">${data.avgFaithfulness}%</div></div>
    <div class="stat-card"><div class="cap">Answer Relevancy (moslik)</div><div class="num">${data.avgAnswerRelevancy}%</div></div>
    <div class="stat-card"><div class="cap">Context Precision (aniqlik)</div><div class="num">${data.avgContextPrecision}%</div></div>`;

  // DIAGNOSTIKA: manba topilgan va topilmagan holatlarni alohida ko'rsatamiz.
  // Agar "Manbasiz" qatorida ham past ko'rsatkich bo'lsa, bu NEYTRAL standart
  // (50%) qiymat -- HAQIQIY past sifat emas. Faqat "Manba bilan" qatori past
  // bo'lsa, bu real muammo (Nia/AI sifati past) degani.
  const wc = data.withContext || {count:0};
  const woc = data.withoutContext || {count:0};
  document.getElementById('accuracyByJurisdiction').innerHTML = `
    <table style="margin-bottom:24px">
      <thead><tr><th>Holat</th><th style="text-align:right">Soni</th><th style="text-align:right">Faithfulness</th><th style="text-align:right">Relevancy</th><th style="text-align:right">Precision</th></tr></thead>
      <tbody>
        <tr><td>📚 Manba bilan (Nia topgan)</td><td style="text-align:right">${wc.count}</td>
          <td style="text-align:right">${wc.count?wc.avgFaithfulness+'%':'—'}</td>
          <td style="text-align:right">${wc.count?wc.avgAnswerRelevancy+'%':'—'}</td>
          <td style="text-align:right">${wc.count?wc.avgContextPrecision+'%':'—'}</td></tr>
        <tr><td>⚠️ Manbasiz (Nia topa olmagan)</td><td style="text-align:right">${woc.count}</td>
          <td style="text-align:right">${woc.count?woc.avgFaithfulness+'%':'—'}</td>
          <td style="text-align:right">${woc.count?woc.avgAnswerRelevancy+'%':'—'}</td>
          <td style="text-align:right">${woc.count?woc.avgContextPrecision+'%':'—'}</td></tr>
      </tbody>
    </table>
    <p style="font-size:12px;color:var(--muted);margin-bottom:20px">ℹ️ "Manbasiz" qatordagi Faithfulness/Precision har doim ~50% bo'ladi -- bu standart neytral qiymat, past sifat emas. Diqqatni "Manba bilan" qatorga qarating -- shu yerda 80%+ bo'lishi maqsad.</p>`;

  const rows = Object.entries(data.byJurisdiction||{}).map(([j,d])=>`
    <tr><td>${j}</td><td style="text-align:right">${d.count}</td>
      <td style="text-align:right">${d.avgFaithfulness}%</td>
      <td style="text-align:right">${d.avgAnswerRelevancy}%</td>
      <td style="text-align:right">${d.avgContextPrecision}%</td></tr>`).join('');
  document.getElementById('accuracyByJurisdiction').innerHTML += rows
    ? `<h4 style="margin-bottom:10px;font-size:13px;color:var(--muted)">Yurisdiksiya bo'yicha</h4><table><thead><tr><th>Yurisdiksiya</th><th style="text-align:right">Soni</th><th style="text-align:right">Faithfulness</th><th style="text-align:right">Relevancy</th><th style="text-align:right">Precision</th></tr></thead><tbody>${rows}</tbody></table>`
    : '';
}

/* ============ TERMS HISTORY (huquqiy dalil arxivi) ============ */
async function loadTermsVersions(){
  try{
    const {versions} = await apiGet('/terms-versions');
    renderTermsVersions(versions);
  }catch(e){ console.error(e); }
}
function renderTermsVersions(versions){
  document.getElementById('termsVersionDetail').style.display = 'none';
  document.getElementById('termsVersionsList').style.display = 'block';
  const c = document.getElementById('termsVersionsList');
  if(!versions.length){ c.innerHTML = `<div class="empty-state"><div class="ei">📜</div><p>Hali versiya yo'q</p></div>`; return; }
  c.innerHTML = `<table>
    <thead><tr><th>Versiya</th><th>Holat</th><th>Izoh</th><th>Tillar</th><th>Chop etilgan</th><th></th></tr></thead>
    <tbody>${versions.map(v=>`
      <tr>
        <td style="font-weight:700">${v.version}</td>
        <td>${v.isCurrent ? '<span class="pill login">✅ Joriy</span>' : '<span class="pill other">Eski</span>'}</td>
        <td style="color:var(--muted);font-size:12px">${v.changeNote||'—'}</td>
        <td>${v.languagesCount}</td>
        <td style="white-space:nowrap;font-size:12px">${new Date(v.publishedAt).toLocaleString('ru-RU')}</td>
        <td><button onclick="viewTermsVersion('${v.version}')" style="color:var(--accent);font-size:12.5px;font-weight:600">To'liq matnni ko'rish →</button></td>
      </tr>`).join('')}</tbody>
  </table>`;
}
async function viewTermsVersion(version){
  try{
    const data = await apiGet(`/terms-versions/${encodeURIComponent(version)}`);
    renderTermsVersionDetail(data);
  }catch(e){ console.error(e); }
}
function renderTermsVersionDetail(data){
  document.getElementById('termsVersionsList').style.display = 'none';
  const d = document.getElementById('termsVersionDetail');
  d.style.display = 'block';

  const langTabs = Object.keys(data.content).map((lang, i) =>
    `<button class="lang-tab-btn ${i===0?'active':''}" data-lang="${lang}" onclick="switchTermsLang('${lang}', this)" style="padding:7px 14px;border-radius:8px;font-size:12.5px;font-weight:600;margin-right:6px;${i===0?'background:var(--accent);color:#fff':'color:var(--muted)'}">${lang.toUpperCase()}</button>`
  ).join('');

  const langContents = Object.entries(data.content).map(([lang, c], i) =>
    `<div class="terms-lang-content" data-lang="${lang}" style="${i===0?'':'display:none'}">
      <h3 style="margin-bottom:14px">${c.title}</h3>
      ${c.sections.map(s=>`<h4 style="font-size:13.5px;font-weight:700;margin-top:14px;margin-bottom:5px">${s.heading}</h4><p style="font-size:12.5px;color:var(--muted);line-height:1.7">${s.body}</p>`).join('')}
    </div>`
  ).join('');

  d.innerHTML = `
    <button onclick="renderTermsVersions(window._lastTermsVersionsCache||[])" style="margin-bottom:16px;color:var(--muted)" id="termsBackBtn">‹ Ro'yxatga qaytish</button>
    <div class="panel-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
        <div><h2 style="font-size:18px">Versiya ${data.version}</h2><p style="font-size:12px;color:var(--muted);margin-top:4px">${data.isCurrent?'✅ Joriy versiya':'Eski versiya'} · Chop etilgan: ${new Date(data.publishedAt).toLocaleString('ru-RU')}</p></div>
      </div>
      ${data.changeNote ? `<div style="background:var(--panel2);border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:var(--muted)">📝 ${data.changeNote}</div>` : ''}
      <div style="margin-bottom:18px">${langTabs}</div>
      ${langContents}
    </div>`;

  // Orqaga tugmasini to'g'ri ro'yxatga ulash uchun, oxirgi ro'yxatni keshlaymiz.
  document.getElementById('termsBackBtn').onclick = () => loadTermsVersions();
}
function switchTermsLang(lang, btn){
  document.querySelectorAll('.terms-lang-content').forEach(el=>{
    el.style.display = el.dataset.lang===lang ? 'block' : 'none';
  });
  document.querySelectorAll('.lang-tab-btn').forEach(b=>{
    if(b===btn){ b.style.background='var(--accent)'; b.style.color='#fff'; }
    else{ b.style.background='none'; b.style.color='var(--muted)'; }
  });
}

/* ============ SECURITY INCIDENTS (breach notification log) ============ */
let _lastSeverityLevels = [], _lastStatuses = [];

function openModal(html){ document.getElementById('adminModalBox').innerHTML=html; document.getElementById('adminModalBg').classList.add('show'); }
function closeModal(){ document.getElementById('adminModalBg').classList.remove('show'); }

async function loadIncidents(){
  try{
    const {incidents, severityLevels, statuses} = await apiGet('/incidents');
    _lastSeverityLevels = severityLevels; _lastStatuses = statuses;
    renderIncidentsList(incidents);
  }catch(e){ console.error(e); }
}
function renderIncidentsList(incidents){
  document.getElementById('incidentDetail').style.display = 'none';
  document.getElementById('incidentsList').style.display = 'block';
  const c = document.getElementById('incidentsList');
  if(!incidents.length){
    c.innerHTML = `<div class="empty-state"><div class="ei">✅</div><p>Hozircha qayd etilgan hodisa yo'q -- bu yaxshi xabar.</p></div>`;
    return;
  }
  c.innerHTML = `<table>
    <thead><tr><th>Sarlavha</th><th>Darajasi</th><th>Holati</th><th>Aniqlangan</th><th>Ta'sirlangan</th><th></th></tr></thead>
    <tbody>${incidents.map(inc=>`
      <tr>
        <td style="font-weight:600">${inc.title}</td>
        <td><span class="severity-pill ${inc.severity}">${inc.severity.toUpperCase()}</span></td>
        <td>${inc.status}</td>
        <td style="white-space:nowrap;font-size:12px">${new Date(inc.detectedAt).toLocaleString('ru-RU')}</td>
        <td>${inc.estimatedAffectedCount || '—'}</td>
        <td><button onclick="viewIncident('${inc.id}')" style="color:var(--accent);font-size:12.5px;font-weight:600">Tafsilot →</button></td>
      </tr>`).join('')}</tbody>
  </table>`;
}
function openNewIncidentModal(){
  openModal(`<h3>🚨 Yangi xavfsizlik hodisasi</h3>
    <div class="admin-field"><label>Sarlavha</label><input id="incTitle" placeholder="Masalan: API kalit sizib chiqishi"></div>
    <div class="admin-field"><label>Darajasi</label>
      <select id="incSeverity">${(_lastSeverityLevels.length?_lastSeverityLevels:['low','medium','high','critical']).map(s=>`<option value="${s}">${s.toUpperCase()}</option>`).join('')}</select>
    </div>
    <div class="admin-field"><label>Tasvir</label><textarea id="incDescription" placeholder="Nima sodir bo'lgani, qachon aniqlangani, qanday topilgani"></textarea></div>
    <div class="admin-field"><label>Ta'sirlangan ma'lumot turlari (vergul bilan ajratib)</label><input id="incDataTypes" placeholder="Masalan: email, parol xeshi"></div>
    <div class="admin-field"><label>Taxminan necha foydalanuvchi ta'sirlangan</label><input id="incCount" type="number" value="0"></div>
    <div class="admin-modal-actions"><button class="cancel" onclick="closeModal()">Bekor qilish</button>
    <button class="confirm" onclick="submitNewIncident()">Qayd etish</button></div>`);
}
async function submitNewIncident(){
  const title = document.getElementById('incTitle').value.trim();
  const severity = document.getElementById('incSeverity').value;
  const description = document.getElementById('incDescription').value.trim();
  const affectedDataTypes = document.getElementById('incDataTypes').value.split(',').map(s=>s.trim()).filter(Boolean);
  const estimatedAffectedCount = Number(document.getElementById('incCount').value) || 0;
  if(!title || !description){ alert('Sarlavha va tasvir talab qilinadi'); return; }
  try{
    const r = await fetch(API+'/incidents', {method:'POST', headers:{'Content-Type':'application/json', ...authHeaders()}, body: JSON.stringify({title, severity, description, affectedDataTypes, estimatedAffectedCount})});
    if(!r.ok){ const d = await r.json(); alert(d.error||'Xatolik'); return; }
    closeModal();
    loadIncidents();
  }catch(e){ alert(e.message); }
}
async function viewIncident(id){
  try{
    const {incident} = await apiGet(`/incidents/${id}`);
    renderIncidentDetail(incident);
  }catch(e){ console.error(e); }
}
function renderIncidentDetail(inc){
  document.getElementById('incidentsList').style.display = 'none';
  const d = document.getElementById('incidentDetail');
  d.style.display = 'block';

  const timeline = (inc.timeline||[]).slice().reverse().map(t=>`
    <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)">
      <div style="font-size:11px;color:var(--muted);white-space:nowrap;width:130px">${new Date(t.at).toLocaleString('ru-RU')}</div>
      <div><span style="font-weight:600;font-size:12.5px">${t.status}</span>${t.note?` — ${t.note}`:''}</div>
    </div>`).join('');

  const statusOptions = (_lastStatuses.length?_lastStatuses:['detected','investigating','contained','notified','resolved'])
    .map(s=>`<option value="${s}" ${s===inc.status?'selected':''}>${s}</option>`).join('');

  d.innerHTML = `
    <button onclick="loadIncidents()" style="margin-bottom:16px;color:var(--muted)">‹ Ro'yxatga qaytish</button>
    <div class="panel-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:14px">
        <div><h2 style="font-size:18px">${inc.title}</h2><span class="severity-pill ${inc.severity}" style="margin-top:6px;display:inline-block">${inc.severity.toUpperCase()}</span></div>
      </div>
      <p style="font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:16px">${inc.description}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px">
        <div><div style="font-size:11px;color:var(--muted)">Ta'sirlangan ma'lumot</div><div style="font-size:13px;margin-top:3px">${(inc.affectedDataTypes||[]).join(', ')||'—'}</div></div>
        <div><div style="font-size:11px;color:var(--muted)">Taxminan ta'sirlangan</div><div style="font-size:13px;margin-top:3px">${inc.estimatedAffectedCount||0}</div></div>
        <div><div style="font-size:11px;color:var(--muted)">Davlat organiga xabar berildi</div><div style="font-size:13px;margin-top:3px">${inc.authorityNotifiedAt?new Date(inc.authorityNotifiedAt).toLocaleString('ru-RU'):'Hali yo\'q'}</div></div>
        <div><div style="font-size:11px;color:var(--muted)">Foydalanuvchilarga xabar berildi</div><div style="font-size:13px;margin-top:3px">${inc.usersNotifiedAt?new Date(inc.usersNotifiedAt).toLocaleString('ru-RU'):'Hali yo\'q'}</div></div>
      </div>
      <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
        <select id="incStatusSelect" style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:9px 12px;color:#fff">${statusOptions}</select>
        <button onclick="updateIncidentStatus('${inc.id}')" style="background:var(--accent);color:#fff;padding:9px 16px;border-radius:8px;font-weight:600;font-size:13px">Statusni yangilash</button>
        ${!inc.authorityNotifiedAt ? `<button onclick="markAuthorityNotified('${inc.id}')" style="border:1px solid var(--warn);color:var(--warn);padding:9px 16px;border-radius:8px;font-weight:600;font-size:13px">Davlat organiga xabar berildi deb belgilash</button>` : ''}
      </div>
      <h3 style="font-size:13px;color:var(--muted);margin-bottom:10px">Vaqt jadvali</h3>
      ${timeline}
    </div>`;
}
async function updateIncidentStatus(id){
  const status = document.getElementById('incStatusSelect').value;
  const note = prompt('Izoh (ixtiyoriy):') || '';
  try{
    const r = await fetch(API+`/incidents/${id}/status`, {method:'PATCH', headers:{'Content-Type':'application/json', ...authHeaders()}, body: JSON.stringify({status, note})});
    if(!r.ok){ const d = await r.json(); alert(d.error||'Xatolik'); return; }
    viewIncident(id);
  }catch(e){ alert(e.message); }
}
async function markAuthorityNotified(id){
  if(!confirm('Tegishli davlat organiga xabar berilgani tasdiqlansinmi? Bu sana qayd etiladi va o\'zgartirilmaydi.')) return;
  try{
    const r = await fetch(API+`/incidents/${id}/notify-authority`, {method:'PATCH', headers:authHeaders()});
    if(!r.ok){ const d = await r.json(); alert(d.error||'Xatolik'); return; }
    viewIncident(id);
  }catch(e){ alert(e.message); }
}

/* ============ INIT ============ */
(function init(){
  if(authToken()){ afterLogin(); }
  else{ showGate(); }
})();

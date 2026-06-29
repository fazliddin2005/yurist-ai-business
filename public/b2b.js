// b2b.js -- Yurist AI Business frontend mantiqi.
// B2C ilovasidan (index.html) butunlay mustaqil, lekin bitta umumiy auth
// tizimini (JWT) qayta ishlatadi -- shuning uchun bir login orqali odam ham
// B2C, ham B2B'ga kira oladi.
const API = '/api';

/* ============ TIL (I18N) -- B2C bilan bir xil lug'at, /i18n.js orqali yuklanadi ============ */
const LANG_ORDER = ['uz','ru','en','kk','ky','tg','tk','az'];
const LANG_LABELS = {uz:'O‘zbek',ru:'Русский',en:'English',kk:'Қазақша',ky:'Кыргызча',tg:'Тоҳикӣ',tk:'Türkmençe',az:'Azərbaycan'};
const LANG_FLAGS = {uz:'🇺🇿',ru:'🇷🇺',en:'🇺🇸',kk:'🇰🇿',ky:'🇰🇬',tg:'🇹🇯',tk:'🇹🇲',az:'🇦🇿'};
let curLang = localStorage.getItem('yurist_lang') || 'uz';

function t(key){
  const dict = (window.I18N && window.I18N[curLang]) || {};
  const fallback = (window.I18N && window.I18N.uz) || {};
  return dict[key] !== undefined ? dict[key] : (fallback[key] !== undefined ? fallback[key] : key);
}

function escapeHtml(s){
  return String(s==null?'':s).replace(/[&<>"']/g, (c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function applyB2BLang(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    el.textContent = t(k);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    const k = el.getAttribute('data-i18n-ph');
    el.placeholder = t(k);
  });
  const label = document.getElementById('b2bLangLabel');
  if(label) label.textContent = LANG_LABELS[curLang] || curLang;
  // Davlat nomlarini (yurisdiksiya widget'i uchun) joriy tilga moslashtiramiz
  if(typeof JURIS_NAMES_BY_LANG!=='undefined'){
    JURIS_NAMES = JURIS_NAMES_BY_LANG[curLang] || JURIS_NAMES_BY_LANG.uz;
  }
  // Joriy sahifaga bog'liq dinamik kontentni qayta render qilamiz (agar ilova ochiq bo'lsa)
  if(currentWorkspace){
    const activePage = document.querySelector('.b2b-page.active');
    if(activePage){
      const pageId = activePage.id.replace('page-','');
      if(pageId==='dashboard') loadDashboard();
      if(pageId==='chat') renderB2BChatHistory();
      if(pageId==='templates') loadTemplates();
      if(pageId==='audit') loadAuditHistory();
      if(pageId==='documents') loadDocuments();
      if(pageId==='team'){ loadMembers(); loadInvites(); }
      if(pageId==='apikeys') loadApiKeys();
    }
  }
}

function setB2BLang(lang){
  curLang = lang;
  localStorage.setItem('yurist_lang', lang);
  applyB2BLang();
  closeModal();
}

function openB2BLangModal(){
  openModal(`<h3>🈯 ${t('b2b_select_lang')}</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px">
      ${LANG_ORDER.map(l=>`<button class="b2b-cancel" style="${l===curLang?'border-color:var(--accent);color:#fff':''}" onclick="setB2BLang('${l}')">${LANG_FLAGS[l]} ${LANG_LABELS[l]}</button>`).join('')}
    </div>`);
}

/* ============ AUTH (B2C bilan bir xil token, alohida kalit nomi) ============ */
function authToken(){ return localStorage.getItem('yurist_token'); }
function setAuthToken(t){ if(t) localStorage.setItem('yurist_token', t); else localStorage.removeItem('yurist_token'); }
function authHeaders(){ const t=authToken(); return t ? {'Authorization':'Bearer '+t} : {}; }

async function apiGet(path){
  const r = await fetch(API+path, {headers: authHeaders()});
  if(r.status===401){ setAuthToken(null); showGate(); throw new Error('Tizimga qaytadan kiring'); }
  const data = await r.json().catch(()=>({}));
  if(!r.ok){ const err=new Error(data.error||'Server xatosi'); err.status=r.status; throw err; }
  return data;
}
async function apiPost(path, body){
  const r = await fetch(API+path, {method:'POST', headers:{'Content-Type':'application/json', ...authHeaders()}, body: JSON.stringify(body||{})});
  if(r.status===401){ setAuthToken(null); showGate(); throw new Error('Tizimga qaytadan kiring'); }
  const data = await r.json().catch(()=>({}));
  if(!r.ok){ const err=new Error(data.error||'Server xatosi'); err.status=r.status; throw err; }
  return data;
}
async function apiPut(path, body){
  const r = await fetch(API+path, {method:'PUT', headers:{'Content-Type':'application/json', ...authHeaders()}, body: JSON.stringify(body||{})});
  if(r.status===401){ setAuthToken(null); showGate(); throw new Error('Tizimga qaytadan kiring'); }
  const data = await r.json().catch(()=>({}));
  if(!r.ok){ const err=new Error(data.error||'Server xatosi'); err.status=r.status; throw err; }
  return data;
}
async function apiPatch(path, body){
  const r = await fetch(API+path, {method:'PATCH', headers:{'Content-Type':'application/json', ...authHeaders()}, body: JSON.stringify(body||{})});
  if(r.status===401){ setAuthToken(null); showGate(); throw new Error('Tizimga qaytadan kiring'); }
  const data = await r.json().catch(()=>({}));
  if(!r.ok){ const err=new Error(data.error||'Server xatosi'); err.status=r.status; throw err; }
  return data;
}
async function apiDelete(path){
  const r = await fetch(API+path, {method:'DELETE', headers: authHeaders()});
  if(r.status===401){ setAuthToken(null); showGate(); throw new Error('Tizimga qaytadan kiring'); }
  const data = await r.json().catch(()=>({}));
  if(!r.ok){ const err=new Error(data.error||'Server xatosi'); err.status=r.status; throw err; }
  return data;
}

function toast(title, sub, color, ic){
  const w=document.getElementById('b2bToastWrap');
  const el=document.createElement('div');el.className='b2b-toast';
  el.innerHTML=`<span style="font-size:18px">${ic||'✅'}</span><div><div style="font-weight:700;font-size:13.5px">${title}</div>${sub?`<div style="font-size:12px;color:var(--muted);margin-top:2px">${sub}</div>`:''}</div>`;
  w.appendChild(el);
  setTimeout(()=>{el.style.opacity='0';el.style.transition='.3s';setTimeout(()=>el.remove(),300)},3200);
}
function openModal(html){document.getElementById('b2bModalBox').innerHTML=html;document.getElementById('b2bModalBg').classList.add('show');}
function closeModal(){document.getElementById('b2bModalBg').classList.remove('show');}
document.getElementById('b2bModalBg').onclick=e=>{if(e.target.id==='b2bModalBg')closeModal();};

function showGatePanel(name){
  document.getElementById('gateLogin').style.display = name==='login'?'block':'none';
  document.getElementById('gateRegister').style.display = name==='register'?'block':'none';
}
function showGateError(id, msg){ const el=document.getElementById(id); el.textContent=msg; el.classList.add('show'); }
function clearGateErrors(){ ['gateLoginError','gateRegError'].forEach(id=>{const el=document.getElementById(id); el.classList.remove('show'); el.textContent='';}); }

async function b2bLogin(){
  clearGateErrors();
  const identifier=document.getElementById('gateIdentifier').value.trim();
  const password=document.getElementById('gatePassword').value;
  if(!identifier||!password){ showGateError('gateLoginError',t('b2b_fill_all_fields')); return; }
  try{
    const r = await fetch(API+'/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({identifier, password})});
    const data = await r.json();
    if(!r.ok){ showGateError('gateLoginError', data.error||t('error_occurred')); return; }
    setAuthToken(data.token);
    // Rozilik holatini afterLogin() o'zi (markazlashtirilgan tarzda) tekshiradi.
    await afterLogin();
  }catch(e){ showGateError('gateLoginError',t('b2b_server_unreachable')); }
}
async function b2bRegister(){
  clearGateErrors();
  const name=document.getElementById('gateRegName').value.trim();
  const identifier=document.getElementById('gateRegIdentifier').value.trim();
  const password=document.getElementById('gateRegPassword').value;
  if(!identifier||!password){ showGateError('gateRegError',t('b2b_fill_all_fields')); return; }
  try{
    const r = await fetch(API+'/auth/register', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({identifier, password, name})});
    const data = await r.json();
    if(!r.ok){ showGateError('gateRegError', data.error||t('error_occurred')); return; }
    setAuthToken(data.token);
    await afterLogin();
  }catch(e){ showGateError('gateRegError',t('b2b_server_unreachable')); }
}
function b2bLogout(){
  fetch(API+'/auth/logout', {method:'POST', headers:authHeaders()}).catch(()=>{});
  setAuthToken(null); currentWorkspace=null; workspaces=[]; location.reload();
}

function showGate(){ document.getElementById('b2bGate').classList.remove('hidden'); document.getElementById('wsPicker').classList.add('hidden'); document.getElementById('b2bApp').classList.remove('show'); }
function hideGate(){ document.getElementById('b2bGate').classList.add('hidden'); }

/* ============ WORKSPACE STATE ============ */
let workspaces=[];
let currentWorkspace=null; // {id, name, myRole, ...}

/* ============ MAJBURIY ROZILIK PANELI (B2B) ============ */
// B2C bilan bir xil mantiq -- alohida, yopib bo'lmaydigan overlay.
function showB2BTermsOverlay(){
  return new Promise(async (resolve) => {
    try{
      const r = await fetch(`${API}/auth/terms?lang=${curLang||'uz'}`);
      if(!r.ok) throw new Error('Shartlar matnini yuklab bo\'lmadi');
      const {content} = await r.json();
      document.getElementById('b2bTermsTitle').textContent = content.title;
      document.getElementById('b2bTermsBody').innerHTML = content.sections
        .map(s => `<h4>${s.heading}</h4><p>${s.body}</p>`).join('');
      document.getElementById('b2bTermsConsentLabel').textContent = content.consentLabel;
      document.getElementById('b2bTermsAcceptBtn').textContent = content.acceptButton;
      window._b2bTermsAcceptLabel = content.acceptButton;
      document.getElementById('b2bTermsDeclineBtn').textContent = content.declineButton;
      document.getElementById('b2bTermsCheckbox').checked = false;
      document.getElementById('b2bTermsAcceptBtn').disabled = true;
      document.getElementById('b2bTermsOverlay').classList.add('show');
      window._b2bTermsDeclineWarning = content.declineWarning;
      window._b2bTermsResolve = resolve;
    }catch(e){
      console.error('[b2b terms] Yuklashda xato:', e);
      resolve();
    }
  });
}
async function acceptB2BTerms(){
  const btn = document.getElementById('b2bTermsAcceptBtn');
  btn.disabled = true; btn.textContent = '...';
  try{
    await apiPost('/auth/accept-terms', {});
  }catch(e){
    console.error('[b2b terms] Saqlashda xato:', e);
    toast(t('error_occurred'), e.message, '#ef4444','⚠️');
    btn.disabled = false;
    btn.textContent = window._b2bTermsAcceptLabel || 'OK';
    return; // MUHIM: saqlanmasa, overlay yopilmaydi -- aks holda rozilik yozilmagan holda foydalanuvchi kirib ketardi
  }
  document.getElementById('b2bTermsOverlay').classList.remove('show');
  if(window._b2bTermsResolve) window._b2bTermsResolve();
  location.reload();
}
function declineB2BTerms(){
  toast(window._b2bTermsDeclineWarning || t('b2b_terms_decline_warning') || 'Shartlarga rozilik bildirish shart', '', '#ef4444', '⚠️');
  setTimeout(() => {
    setAuthToken(null);
    document.getElementById('b2bTermsOverlay').classList.remove('show');
    location.reload();
  }, 1800);
}

async function afterLogin(){
  hideGate();
  try{
    // MUHIM: har bir kirish nuqtasida (login, register, sahifa qayta
    // yuklanganda) avval rozilik holatini tekshiramiz. Bu yagona joy --
    // shunda qaysi yo'l orqali kelinishidan qat'i nazar, rozilik
    // bermagan foydalanuvchi workspace ro'yxatiga o'tolmaydi.
    const {user} = await apiGet('/users/me');
    if(user && user.needsTermsConsent){
      await showB2BTermsOverlay();
      return; // showB2BTermsOverlay o'zi accept bo'lgandan keyin location.reload() qiladi
    }

    const {workspaces: list} = await apiGet('/b2b/workspaces');
    workspaces = list;
    // Agar foydalanuvchi taklif havolasidan login/register qilgan bo'lsa,
    // workspace ro'yxatini ko'rsatishdan oldin taklifni qabul qilishni so'raymiz.
    if(window._pendingInviteToken){
      const tok = window._pendingInviteToken;
      window._pendingInviteToken = null;
      await handleInviteLink(tok);
      return;
    }
    if(workspaces.length===0){
      openWorkspacePicker(); // bo'sh ro'yxat -- "yangi tashkilot yarating" ko'rinadi
    }else if(workspaces.length===1){
      selectWorkspace(workspaces[0].id);
    }else{
      openWorkspacePicker();
    }
  }catch(e){
    toast(t('error_occurred'), e.message, '#ef4444', '⚠️');
  }
}

function roleLabel(role){ return t('role_'+role) || role; }

function openWorkspacePicker(){
  document.getElementById('wsPicker').classList.remove('hidden');
  document.getElementById('b2bApp').classList.remove('show');
  const list=document.getElementById('wsList');
  if(!workspaces.length){
    list.innerHTML = `<div class="empty-state" style="padding:20px 0"><div class="ei">🏢</div><p>${t('b2b_empty_orgs')}</p></div>`;
  }else{
    list.innerHTML = workspaces.map(w=>`
      <div class="ws-item" onclick="selectWorkspace('${w.id}')">
        <div class="ws-ic">🏢</div>
        <div><div class="wname">${w.name}</div><div class="wmeta">${roleLabel(w.myRole)} · ${w.plan||'trial'} ${t('b2b_plan_label')}</div></div>
      </div>`).join('');
  }
}

function openCreateWorkspaceModal(){
  openModal(`<h3>🏢 ${t('b2b_new_org_title')}</h3><div class="msub">${t('b2b_new_org_sub')}</div>
    <div class="b2b-field"><label>${t('b2b_org_name')}</label><input id="newWsName" placeholder="${t('b2b_org_name_ph')}"></div>
    <div class="b2b-field"><label>${t('b2b_industry')}</label><input id="newWsIndustry" placeholder="${t('b2b_industry_ph')}"></div>
    <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal()">${t('b2b_cancel')}</button>
    <button class="b2b-confirm" onclick="submitCreateWorkspace()">${t('b2b_create_btn')}</button></div>`);
}
async function submitCreateWorkspace(){
  const name=document.getElementById('newWsName').value.trim();
  const industry=document.getElementById('newWsIndustry').value.trim();
  if(!name){ toast(t('error_occurred'),t('b2b_enter_org_name'),'#ef4444','⚠️'); return; }
  try{
    const {workspace} = await apiPost('/b2b/workspaces', {name, industry});
    workspaces.push(workspace);
    closeModal();
    toast(t('b2b_org_created'), workspace.name, '#22c55e','🏢');
    selectWorkspace(workspace.id);
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}

async function selectWorkspace(id){
  try{
    const {workspace} = await apiGet('/b2b/workspaces/'+id);
    currentWorkspace = workspace;
    document.getElementById('wsPicker').classList.add('hidden');
    document.getElementById('b2bApp').classList.add('show');
    document.getElementById('curWsName').textContent = workspace.name;
    document.getElementById('curWsRole').textContent = roleLabel(workspace.myRole);
    document.getElementById('addMemberBtn').style.display = (workspace.myRole==='owner'||workspace.myRole==='admin') ? 'flex' : 'none';
    document.getElementById('addApiKeyBtn').style.display = (workspace.myRole==='owner'||workspace.myRole==='admin') ? 'flex' : 'none';
    document.getElementById('dangerZone').style.display = (workspace.myRole==='owner') ? 'block' : 'none';
    goB2B('dashboard');
  }catch(e){
    toast(t('error_occurred'), e.message, '#ef4444','⚠️');
  }
}

/* ============ NAVIGATION ============ */
function goB2B(page){
  document.querySelectorAll('.b2b-page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('#b2bNav button').forEach(b=>b.classList.toggle('active', b.dataset.page===page));
  document.querySelector('.b2b-sidebar').classList.remove('open');
  if(page==='dashboard') loadDashboard();
  if(page==='chat') loadB2BConversations();
  if(page==='templates') loadTemplates();
  if(page==='audit') loadAuditHistory();
  if(page==='documents') loadDocuments();
  if(page==='team'){ loadMembers(); loadInvites(); }
  if(page==='apikeys') loadApiKeys();
}
document.getElementById('b2bNav').addEventListener('click', (e)=>{
  const btn=e.target.closest('button[data-page]');
  if(btn) goB2B(btn.dataset.page);
});

/* ============ DASHBOARD ============ */
async function loadDashboard(){
  try{
    const data = await apiGet(`/b2b/dashboard/${currentWorkspace.id}`);
    renderDashboard(data);
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}
function renderDashboard(data){
  const s=data.stats;
  const credits = data.workspace.credits ?? 0;
  const jurisCode = data.workspace.primaryJurisdictionId || 'UZ';
  document.getElementById('dashStats').innerHTML = `
    <div class="stat-card"><div class="si" style="background:rgba(109,59,245,.15);color:#a78bfa">📄</div><div class="num">${s.totalTemplates}</div><div class="cap">${t('b2b_active_templates')}</div></div>
    <div class="stat-card"><div class="si" style="background:rgba(34,197,94,.15);color:#4ade80">🛡️</div><div class="num">${s.totalAudits}</div><div class="cap">${t('b2b_total_audits')}</div></div>
    <div class="stat-card"><div class="si" style="background:rgba(245,158,11,.15);color:#fbbf24">📊</div><div class="num">${s.avgRiskScore ?? '—'}${s.avgRiskScore!==null?'%':''}</div><div class="cap">${t('b2b_avg_reliability')}</div></div>
    <div class="stat-card"><div class="si" style="background:rgba(59,130,246,.15);color:#60a5fa">👥</div><div class="num">${s.totalMembers}/${s.seatsLimit}</div><div class="cap">${t('b2b_team_members')}</div></div>
    <div class="stat-card" style="cursor:pointer" onclick="goB2B('chat')"><div class="si" style="background:rgba(249,115,22,.15);color:#fb923c">🪙</div><div class="num">${credits}</div><div class="cap">${t('stat_credits')||'Kreditlar'}</div></div>`;

  // UNIFIED INTERFACE: tashkilot qaysi davlat qonunchiligida ishlayotgani --
  // bosilganda davlat tanlash oynasi ochiladi (jurisdictionRouter.js'dagi
  // ro'yxat bilan sinhronlangan).
  document.getElementById('dashJurisBanner').innerHTML = `
    <div class="juris-banner" onclick="openJurisdictionModal('${jurisCode}')">
      <div class="juris-banner-ic">${JURIS_FLAGS[jurisCode]||'🌐'}</div>
      <div class="juris-banner-text">
        <div class="juris-banner-label">${t('b2b_active_jurisdiction')}</div>
        <div class="juris-banner-value">${JURIS_NAMES[jurisCode]||jurisCode}</div>
      </div>
      <div class="juris-banner-change">${t('b2b_change_jurisdiction')} →</div>
    </div>`;

  const total = (s.risksByLevel.high+s.risksByLevel.med+s.risksByLevel.low) || 1;
  document.getElementById('dashGridLower').innerHTML = `
    <div class="panel-card">
      <h3>⚠️ ${t('b2b_risk_distribution')}</h3>
      <div class="risk-bar-row"><span class="rlabel">${t('b2b_risk_high')}</span><div class="risk-bar-track"><div class="risk-bar-fill" style="width:${s.risksByLevel.high/total*100}%;background:var(--danger)"></div></div><span class="rcount">${s.risksByLevel.high}</span></div>
      <div class="risk-bar-row"><span class="rlabel">${t('b2b_risk_med')}</span><div class="risk-bar-track"><div class="risk-bar-fill" style="width:${s.risksByLevel.med/total*100}%;background:var(--warn)"></div></div><span class="rcount">${s.risksByLevel.med}</span></div>
      <div class="risk-bar-row"><span class="rlabel">${t('b2b_risk_low')}</span><div class="risk-bar-track"><div class="risk-bar-fill" style="width:${s.risksByLevel.low/total*100}%;background:var(--accent2)"></div></div><span class="rcount">${s.risksByLevel.low}</span></div>
    </div>
    <div class="panel-card">
      <h3>🕐 ${t('b2b_recent_activity')}</h3>
      ${data.recentActivity.length===0 ? `<div class="empty-state" style="padding:20px 0"><p>${t('b2b_no_audits_yet')}</p></div>` :
        data.recentActivity.map(a=>`<div class="activity-row"><span>${a.fileName}</span><span class="tier-pill ${a.tier}">${a.score??'—'}%</span></div>`).join('')}
    </div>`;
}

// Yurisdiksiyalar ro'yxati -- server/jurisdictionRouter.js va legalData.js
// bilan bir xil 8 davlat. Bayroq va nomlar B2C interfeysi bilan mos.
const JURIS_FLAGS = {UZ:'🇺🇿',KZ:'🇰🇿',KG:'🇰🇬',TJ:'🇹🇯',TM:'🇹🇲',RU:'🇷🇺',AZ:'🇦🇿',US:'🇺🇸'};
const JURIS_NAMES_BY_LANG = {
  uz:{UZ:'O‘zbekiston',KZ:'Qozog‘iston',KG:'Qirg‘iziston',TJ:'Tojikiston',TM:'Turkmaniston',RU:'Rossiya',AZ:'Ozarbayjon',US:'AQSh'},
  ru:{UZ:'Узбекистан',KZ:'Казахстан',KG:'Кыргызстан',TJ:'Таджикистан',TM:'Туркменистан',RU:'Россия',AZ:'Азербайджан',US:'США'},
  en:{UZ:'Uzbekistan',KZ:'Kazakhstan',KG:'Kyrgyzstan',TJ:'Tajikistan',TM:'Turkmenistan',RU:'Russia',AZ:'Azerbaijan',US:'USA'},
  kk:{UZ:'Өзбекстан',KZ:'Қазақстан',KG:'Қырғызстан',TJ:'Тәжікстан',TM:'Түрікменстан',RU:'Ресей',AZ:'Әзірбайжан',US:'АҚШ'},
  ky:{UZ:'Өзбекстан',KZ:'Казакстан',KG:'Кыргызстан',TJ:'Тажикстан',TM:'Түркменстан',RU:'Орусия',AZ:'Азербайжан',US:'АКШ'},
  tg:{UZ:'Узбекистон',KZ:'Қазоқистон',KG:'Қирғизистон',TJ:'Тоҷикистон',TM:'Туркманистон',RU:'Русия',AZ:'Озарбойҷон',US:'ИМА'},
  tk:{UZ:'Özbegistan',KZ:'Gazagystan',KG:'Gyrgyzystan',TJ:'Täjigistan',TM:'Türkmenistan',RU:'Russiýa',AZ:'Azerbaýjan',US:'ABŞ'},
  az:{UZ:'Özbəkistan',KZ:'Qazaxıstan',KG:'Qırğızıstan',TJ:'Tacikistan',TM:'Türkmənistan',RU:'Rusiya',AZ:'Azərbaycan',US:'ABŞ'},
};
let JURIS_NAMES = JURIS_NAMES_BY_LANG.uz;

function openJurisdictionModal(currentCode){
  const codes=['UZ','TJ','RU','KG','KZ','TM','AZ','US'];
  openModal(`<h3>🌐 ${t('b2b_select_jurisdiction')}</h3><div class="msub">${t('b2b_select_jurisdiction_sub')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px">
      ${codes.map(c=>`<button class="b2b-cancel" style="${c===currentCode?'border-color:var(--accent);color:#fff':''}" onclick="changeJurisdiction('${c}')">${JURIS_FLAGS[c]} ${JURIS_NAMES[c]||c}</button>`).join('')}
    </div>`);
}
async function changeJurisdiction(code){
  try{
    const {workspace} = await apiPatch(`/b2b/workspaces/${currentWorkspace.id}`, {primaryJurisdictionId: code});
    currentWorkspace.primaryJurisdictionId = workspace.primaryJurisdictionId;
    closeModal();
    toast(t('b2b_jurisdiction_updated'), JURIS_NAMES[code]||code, '#22c55e','🌐');
    loadDashboard();
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}

/* ============ TEMPLATES (CLM) ============ */
async function loadTemplates(){
  try{
    const {templates} = await apiGet(`/b2b/templates/${currentWorkspace.id}`);
    renderTemplates(templates);
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}
function renderTemplates(templates){
  const c=document.getElementById('templatesContainer');
  const active = templates.filter(tpl=>tpl.status==='active');
  if(!active.length){
    c.innerHTML = `<div class="empty-state"><div class="ei">📄</div><h4>${t('b2b_no_templates_title')}</h4><p>${t('b2b_no_templates_sub')}</p></div>`;
    return;
  }
  c.innerHTML = `<div class="tpl-grid">${active.map(tpl=>`
    <div class="tpl-card" onclick="openTemplateDetail('${tpl.id}')">
      <div class="tname">${tpl.name}</div>
      <div class="tcat">${tpl.category}</div>
      <div class="tmeta"><span>v${tpl.currentVersion}</span><span>${new Date(tpl.updatedAt).toLocaleDateString('ru-RU')}</span></div>
    </div>`).join('')}</div>`;
}
// ---- AI BILAN O'ZGARUVCHILARNI AVTOMATIK BELGILASH ----
// Foydalanuvchi {{...}} sintaksisini HECH QACHON o'zi yozmasligi kerak --
// na yangi shablon yaratayotganda, na eskisini tahrirlayotganda. Bu funksiya
// berilgan textarea'dagi NIMA BO'LSA HAM (yangi yozilgan oddiy matn yoki
// eski versiya matni) joriy holatini AI'ga yuboradi, AI qaysi joylar har
// safar o'zgarishi kerakligini aniqlab {{...}} bilan belgilaydi, natija
// qaytib shu textarea ichiga joylanadi -- foydalanuvchi faqat ko'rib chiqib,
// keyin saqlaydi.
async function markVariablesInTextarea(textareaId, btnId){
  const ta = document.getElementById(textareaId);
  const btn = document.getElementById(btnId);
  const raw = ta.value.trim();
  if(!raw){ toast(t('error_occurred'),"Avval matn yozing","#ef4444","⚠️"); return; }
  const oldLabel = btn.textContent;
  btn.disabled = true; btn.textContent = '⏳ Aniqlanmoqda...';
  try{
    const draft = await apiPost(`/b2b/templates/${currentWorkspace.id}/ai-draft`, {text: raw});
    ta.value = draft.body;
    toast("Tayyor", "O'zgaruvchi joylar avtomatik belgilandi", "#22c55e", "✨");
  }catch(e){
    toast(t('error_occurred'), e.message, "#ef4444", "⚠️");
  }
  btn.disabled = false; btn.textContent = oldLabel;
}

function openCreateTemplateModal(prefill){
  const p = prefill || {};
  openModal(`<h3>📄 ${t('b2b_new_template_title')}</h3><div class="msub">${t('b2b_new_template_sub')}</div>
    ${p.fromAi ? `<div style="background:#1e293b;border-radius:8px;padding:10px 12px;font-size:12.5px;color:var(--muted);margin-bottom:14px">🤖 AI tomonidan tayyorlangan loyiha — saqlashdan oldin matnni tekshirib, kerak bo'lsa tahrirlang.</div>` : ''}
    <div class="b2b-field"><label>${t('b2b_template_name')}</label><input id="newTplName" placeholder="${t('b2b_template_name_ph')}" value="${escapeHtml(p.name||'')}"></div>
    <div class="b2b-field"><label>${t('b2b_category')}</label><input id="newTplCategory" placeholder="${t('b2b_category_ph')}" value="${escapeHtml(p.category||'')}"></div>
    <div class="b2b-field"><label>${t('b2b_template_text')}</label><textarea id="newTplBody" rows="9" placeholder="${t('b2b_template_text_ph')}">${escapeHtml(p.body||'')}</textarea></div>
    <div style="margin:-4px 0 14px"><button class="b2b-confirm" id="newTplMarkBtn" style="background:#374151;font-size:12.5px;padding:8px 14px" onclick="markVariablesInTextarea('newTplBody','newTplMarkBtn')">✨ AI bilan o'zgaruvchilarni belgilash</button></div>
    <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal()">${t('b2b_cancel')}</button>
    <button class="b2b-confirm" onclick="submitCreateTemplate()">${t('b2b_create_btn')}</button></div>`);
}
async function submitCreateTemplate(){
  const name=document.getElementById('newTplName').value.trim();
  const category=document.getElementById('newTplCategory').value.trim();
  const body=document.getElementById('newTplBody').value.trim();
  if(!name||!body){ toast(t('error_occurred'),t('b2b_enter_org_name'),'#ef4444','⚠️'); return; }
  const placeholders=[...new Set([...body.matchAll(/\{\{([^}]+)\}\}/g)].map(m=>m[1]))];
  try{
    await apiPost(`/b2b/templates/${currentWorkspace.id}`, {name, category, body, placeholders});
    closeModal();
    toast(t('b2b_org_created'), name, '#22c55e','📄');
    loadTemplates();
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}

// ---- AI BILAN SHABLON YARATISH ----
// Foydalanuvchi {{joy_nomi}} kabi texnik sintaksisni o'zi yozishi SHART
// EMAS -- shartnomani oddiy, tabiiy tilda yozadi (haqiqiy ismlar bilan ham
// bo'lishi mumkin), AI o'zi qaysi qismlar har safar o'zgarishi kerakligini
// (ism, sana, summa, manzil va h.k.) aniqlab, {{...}} bilan belgilab beradi.
// Natija avval ko'rib chiqish/tahrirlash uchun oddiy "Yangi shablon" formasiga
// tushadi -- to'g'ridan-to'g'ri saqlanmaydi, foydalanuvchi har doim nazorat qiladi.
function openAiDraftTemplateModal(){
  openModal(`<h3>🤖 AI bilan shablon yaratish</h3>
    <div class="msub">Shartnomangizni oddiy tilda yozing yoki joylashtiring — ismlar, sanalar bilan bo'lsa ham bo'ladi. AI qaysi joylar har safar o'zgarishi kerakligini o'zi aniqlaydi.</div>
    <div class="b2b-field"><textarea id="aiDraftInput" rows="8" placeholder="Masalan: Uy egasi Fazliddin uyni Diyorga ijaraga beradi, oylik ijara 2 million so'm, muddat 1 yil..."></textarea></div>
    <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal()">${t('b2b_cancel')}</button>
    <button class="b2b-confirm" onclick="submitAiDraftTemplate()" id="aiDraftSubmitBtn">✨ Tayyorlash</button></div>`);
}
async function submitAiDraftTemplate(){
  const text = document.getElementById('aiDraftInput').value.trim();
  if(!text){ toast(t('error_occurred'),'Matn kiritilmadi','#ef4444','⚠️'); return; }
  const btn = document.getElementById('aiDraftSubmitBtn');
  btn.disabled = true; btn.textContent = '⏳ Tayyorlanmoqda...';
  try{
    const draft = await apiPost(`/b2b/templates/${currentWorkspace.id}/ai-draft`, {text});
    closeModal();
    openCreateTemplateModal({ ...draft, fromAi: true });
  }catch(e){
    toast(t('error_occurred'), e.message, '#ef4444','⚠️');
    btn.disabled = false; btn.textContent = '✨ Tayyorlash';
  }
}

async function openTemplateDetail(id){
  try{
    const {template, versions} = await apiGet(`/b2b/templates/${currentWorkspace.id}/${id}`);
    const latest = versions.find(v=>v.versionNumber===template.currentVersion);
    window._tplBodyCache = window._tplBodyCache || {};
    window._tplBodyCache[template.id] = latest?.body || '';
    openModal(`<h3>${template.name}</h3><div class="msub">${template.category} · v${template.currentVersion} · ${versions.length}</div>
      <div class="b2b-field"><label>${t('b2b_current_text')}</label><textarea id="tplCurrentBody" rows="6">${latest?.body||''}</textarea></div>
      <div style="margin:-4px 0 14px"><button class="b2b-confirm" id="tplMarkBtn" style="background:#374151;font-size:12.5px;padding:8px 14px" onclick="markVariablesInTextarea('tplCurrentBody','tplMarkBtn')">✨ AI bilan o'zgaruvchilarni belgilash</button>
      <span style="font-size:11.5px;color:var(--muted);margin-left:8px">— real ism/sana/summa yozgan bo'lsangiz, shu tugma {{...}} larni o'zi qo'yadi</span></div>
      <div class="b2b-field"><label>${t('b2b_change_note')}</label><input id="tplChangeNote" placeholder="${t('b2b_change_note_ph')}"></div>
      <div class="b2b-modal-actions">
        <button class="b2b-cancel" onclick="closeModal()">${t('b2b_close')}</button>
        <button class="b2b-confirm" style="background:#374151" onclick="openFillTemplateModal('${template.id}','${template.name.replace(/'/g,"\\'")}', window._tplBodyCache['${template.id}'])">📝 ${t('b2b_fill_btn')}</button>
        <button class="b2b-confirm" onclick="saveTemplateVersion('${template.id}')">💾 ${t('b2b_new_version_btn')}</button>
      </div>
      <div style="margin-top:16px;font-size:12px;color:var(--muted)">
        <b>${t('b2b_version_history')}</b><br>
        ${versions.map(v=>`v${v.versionNumber} — ${v.changeNote} (${new Date(v.createdAt).toLocaleString('ru-RU')})`).join('<br>')}
      </div>
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
        <button class="b2b-cancel" style="color:#f87171;border-color:#f87171" onclick="openArchiveTemplateModal('${template.id}','${template.name.replace(/'/g,"\\'")}')">🗑 Shablonni o'chirish</button>
      </div>`);
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}

// ---- SHABLONNI O'CHIRISH ----
// Haqiqatda "arxivlash" (status='archived') -- versiyalar tarixi hech qachon
// yo'qolmasligi kerakligi uchun (CLM talabi), lekin foydalanuvchiga oddiy
// "o'chirish" sifatida ko'rsatiladi: shablon ro'yxatdan butunlay yo'qoladi
// va qayta ishlatib bo'lmaydi.
function openArchiveTemplateModal(id, name){
  openModal(`<h3 style="color:#f87171">⚠️ Shablonni o'chirish</h3>
    <div class="msub"><b>${name}</b> ro'yxatdan butunlay olib tashlanadi. Bu shablon orqali avval to'ldirilgan hujjatlar (agar saqlangan bo'lsa) arxivda qoladi.</div>
    <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal()">${t('b2b_cancel')}</button>
    <button class="b2b-confirm" style="background:#dc2626" onclick="doArchiveTemplate('${id}')">🗑 O'chirish</button></div>`);
}
async function doArchiveTemplate(id){
  try{
    await apiPatch(`/b2b/templates/${currentWorkspace.id}/${id}/archive`, {});
    closeModal();
    toast("Shablon o'chirildi", '', '#ef4444', '🗑️');
    loadTemplates();
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}
async function saveTemplateVersion(id){
  const body=document.getElementById('tplCurrentBody').value;
  const changeNote=document.getElementById('tplChangeNote').value.trim();
  try{
    await apiPut(`/b2b/templates/${currentWorkspace.id}/${id}`, {body, changeNote});
    closeModal();
    toast(t('b2b_doc_saved'),'','#22c55e','💾');
    loadTemplates();
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}

let _fillState = null;

function openFillTemplateModal(id, name, body){
  const placeholders = [...new Set([...(body||'').matchAll(/\{\{([^}]+)\}\}/g)].map(m=>m[1]))];
  _fillState = { id, name, placeholders, mode: placeholders.length ? 'fields' : 'json' };
  renderFillModal();
}

function renderFillModal(){
  const { id, name, placeholders, mode } = _fillState;
  let valuesHtml;
  if (placeholders.length === 0){
    // ENG MUHIM HOLAT: shablon matnida {{...}} umuman yo'q. Avval bu yerda
    // JSON qutisi "zaxira" sifatida ko'rsatilardi -- bu chalkash edi, chunki
    // odam JSON yozishni bilmaydi va NEGA JSON kerakligini tushunmaydi.
    // Endi: ochiq-oydin tushuntiramiz va to'g'ridan-to'g'ri shablonni
    // tahrirlashga yo'naltiramiz.
    valuesHtml = `<div style="background:#1e293b;border-radius:10px;padding:14px 16px;margin-bottom:16px;font-size:13px;color:var(--muted);line-height:1.5">
      ⚠️ Bu shablon matnida hech qanday <code>{{...}}</code> bilan belgilangan o'zgaruvchi joy yo'q — shuning uchun to'ldirish uchun alohida maydon ko'rsatib bo'lmaydi.<br><br>
      Avval shablonni tahrirlang va matn ichiga <code>{{xodim_ismi}}</code> kabi joylarni qo'shing, keyin bu yerga qaytib to'ldiring.
    </div>
    <div class="b2b-modal-actions" style="margin-bottom:16px">
      <button class="b2b-confirm" style="background:#374151" onclick="closeModal();openTemplateDetail('${id}')">✏️ Shablonni tahrirlash</button>
    </div>`;
  } else if (mode === 'fields' && placeholders.length){
    // Bu -- asosiy rejim: foydalanuvchi JSON bilishi shart emas, shablondagi
    // har bir {{maydon}} uchun alohida, nomi yozilgan input ko'rsatiladi.
    valuesHtml = `<label style="font-size:13px;color:var(--muted);display:block;margin-bottom:6px">${t('b2b_fill_values_label')}</label>
      <div id="fillFieldsContainer">
        ${placeholders.map(p=>`<div class="b2b-field"><label>${escapeHtml(p)}</label>
          <input class="fillFieldInput" data-key="${escapeHtml(p)}" placeholder="${escapeHtml(p)}"></div>`).join('')}
      </div>
      <div style="margin:0 0 12px"><a href="#" onclick="switchFillMode('json');return false;" style="font-size:12px;color:var(--muted);text-decoration:underline">⚙️ JSON rejimida kiritish</a></div>`;
  } else {
    // Zaxira rejim: foydalanuvchi o'zi JSON rejimiga o'tgan (masalan API
    // orqali ishlashga o'rganib qolgan power-user).
    valuesHtml = `<div class="b2b-field"><label>${t('b2b_fill_values_label')}</label>
      <textarea id="fillValuesInput" rows="4" placeholder='{"company_name":"ABC Tech","employee_name":"Aliyev Vali"}'></textarea></div>
      <div style="margin:0 0 12px"><a href="#" onclick="switchFillMode('fields');return false;" style="font-size:12px;color:var(--muted);text-decoration:underline">📝 Maydonlar bo'yicha kiritish</a></div>`;
  }
  openModal(`<h3>📝 ${name} — ${t('b2b_fill_title')}</h3><div class="msub">${t('b2b_fill_sub')}</div>
    ${valuesHtml}
    <div class="b2b-field"><label>${t('b2b_doc_name')}</label><input id="fillDocName" placeholder="${t('b2b_doc_name_ph')}"></div>
    <div id="fillPreview" style="display:none;background:var(--panel2);border-radius:10px;padding:14px;font-size:12.5px;white-space:pre-wrap;margin-bottom:10px;max-height:200px;overflow-y:auto"></div>
    <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal()">${t('b2b_cancel')}</button>
    <button class="b2b-confirm" onclick="previewFill('${id}')">👁 ${t('b2b_preview_btn')}</button>
    <button class="b2b-confirm" onclick="saveFilledDoc('${id}')">✅ ${t('b2b_save_btn')}</button></div>`);
  // Modal qayta chizilganda hujjat nomi va boshqa kiritilgan qiymatlar yo'qolmasligi
  // uchun, agar avval kiritilgan bo'lsa, qayta tiklaymiz.
  const docNameInput = document.getElementById('fillDocName');
  if (docNameInput && _fillState.docName) docNameInput.value = _fillState.docName;
}

function switchFillMode(mode){
  // Rejim o'zgartirishdan oldin hujjat nomini saqlab qolamiz (modal qayta chiziladi).
  const docNameInput = document.getElementById('fillDocName');
  _fillState.docName = docNameInput ? docNameInput.value : '';
  _fillState.mode = mode;
  renderFillModal();
}

function collectFillValues(){
  if (_fillState && _fillState.placeholders.length === 0){
    return {}; // hech qanday {{...}} yo'q -- to'ldirish uchun qiymat kerak emas
  }
  if (_fillState && _fillState.mode === 'fields'){
    const values = {};
    document.querySelectorAll('.fillFieldInput').forEach(inp=>{ values[inp.dataset.key] = inp.value; });
    return values;
  }
  return JSON.parse(document.getElementById('fillValuesInput').value || '{}');
}

async function previewFill(id){
  let values;
  try{ values = collectFillValues(); }
  catch(e){ toast(t('error_occurred'),'JSON','#ef4444','⚠️'); return; }
  try{
    const {filledBody, missingFields} = await apiPost(`/b2b/templates/${currentWorkspace.id}/${id}/fill`, {values});
    const prev=document.getElementById('fillPreview');
    prev.style.display='block';
    prev.textContent = filledBody + (missingFields.length ? `\n\n⚠️ ${t('b2b_missing_fields')}: ${missingFields.join(', ')}` : '');
    window._lastFilledBody = filledBody;
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}
async function saveFilledDoc(templateId){
  const name=document.getElementById('fillDocName').value.trim();
  if(!window._lastFilledBody){ toast(t('b2b_preview_first'),t('b2b_preview_first_sub'),'#f59e0b','⚠️'); return; }
  if(!name){ toast(t('error_occurred'),t('b2b_enter_doc_name'),'#ef4444','⚠️'); return; }
  try{
    await apiPost(`/b2b/documents/${currentWorkspace.id}`, {name, templateId, filledBody: window._lastFilledBody});
    closeModal();
    toast(t('b2b_doc_saved'), name, '#22c55e','📂');
    window._lastFilledBody=null;
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}

/* ============ AI RISK AUDIT ============ */
async function runB2BAudit(input){
  const file=input.files[0]; if(!file) return;
  const box=document.getElementById('auditUploadBox');
  const result=document.getElementById('auditResult');
  box.style.opacity='.5';
  result.innerHTML=`<div class="empty-state"><div class="ei">🔍</div><p>${file.name} ${t('b2b_analyzing')}</p></div>`;
  try{
    const fd=new FormData(); fd.append('file', file);
    const r=await fetch(`${API}/b2b/audit/${currentWorkspace.id}/analyze`, {method:'POST', headers:authHeaders(), body:fd});
    const data=await r.json();
    box.style.opacity='1';
    if(!r.ok){ result.innerHTML=''; toast(t('error_occurred'), data.error||t('error_occurred'),'#ef4444','⚠️'); input.value=''; return; }
    renderAuditResult(data.audit);
    loadAuditHistory();
  }catch(e){
    box.style.opacity='1';
    toast(t('error_occurred'), e.message, '#ef4444','⚠️');
  }
  input.value='';
}
function renderAuditResult(audit){
  const tierColor = audit.tier==='good'?'#22c55e':audit.tier==='med'?'#f59e0b':'#ef4444';
  const tierLabel = audit.tier==='good'?t('b2b_good_doc'):audit.tier==='med'?t('b2b_med_doc'):t('b2b_bad_doc');
  let html = `<div class="score-display">
    <div class="score-ring-b2b" style="background:${tierColor}22;color:${tierColor}"><div style="font-size:22px">${audit.score??'—'}%</div></div>
    <div><div style="font-weight:800;font-size:16px;color:${tierColor}">${tierLabel}</div>
    <div style="font-size:12.5px;color:var(--muted);margin-top:4px">${audit.fileName} — ${audit.findings.length} ${t('b2b_issues_found')}</div></div>
  </div>`;

  if(audit.legalRefs && audit.legalRefs.length){
    html += `<div style="margin-bottom:16px"><b style="font-size:13px">📚 ${t('b2b_legal_refs')}</b>`;
    audit.legalRefs.forEach(ref=>{
      html += `<div class="legal-ref"><b>${ref.source}</b> — ${ref.excerpt}</div>`;
    });
    html += `</div>`;
  }

  if(audit.caseLawRef){
    html += `<div style="margin-bottom:16px"><b style="font-size:13px">⚖️ ${t('b2b_case_law_title')||'Sud amaliyoti'}</b>
      <div class="legal-ref" style="border-color:rgba(167,139,250,.3);background:rgba(167,139,250,.06)">
        <b>${audit.caseLawRef.source||''}</b> — ${audit.caseLawRef.excerpt}
      </div></div>`;
  }

  html += `<div class="findings-list">${audit.findings.map(f=>`
    <div class="finding ${f.sev}"><div class="ftitle">${f.sev==='high'?'🔴':f.sev==='med'?'🟡':'🟢'} ${f.title}</div>
    <div class="fbody">${f.body}</div></div>`).join('') || `<div class="empty-state" style="padding:20px"><p>${t('b2b_no_issues')}</p></div>`}</div>`;

  document.getElementById('auditResult').innerHTML = html;
}
async function loadAuditHistory(){
  try{
    const {audits} = await apiGet(`/b2b/audit/${currentWorkspace.id}`);
    const c=document.getElementById('auditHistory');
    if(!audits.length){ c.innerHTML = `<div class="empty-state" style="padding:20px 0"><p>${t('b2b_no_audits_yet')}</p></div>`; return; }
    c.innerHTML = audits.slice(0,10).map(a=>`
      <div class="activity-row" style="cursor:pointer" onclick='renderAuditResult(${JSON.stringify(a).replace(/'/g,"&apos;")})'>
        <span>${a.fileName}</span>
        <span style="display:flex;gap:10px;align-items:center"><span class="tier-pill ${a.tier}">${a.score??'—'}%</span><span style="color:var(--muted);font-size:11.5px">${new Date(a.createdAt).toLocaleDateString('ru-RU')}</span></span>
      </div>`).join('');
  }catch(e){ /* jim turamiz, dashboard asosiy emas */ }
}

/* ============ DOCUMENTS ARCHIVE ============ */
async function loadDocuments(){
  try{
    const {documents} = await apiGet(`/b2b/documents/${currentWorkspace.id}`);
    const c=document.getElementById('documentsContainer');
    if(!documents.length){
      c.innerHTML = `<div class="empty-state"><div class="ei">📂</div><h4>${t('b2b_no_docs_title')}</h4><p>${t('b2b_no_docs_sub')}</p></div>`;
      return;
    }
    // FAQAT egasi/admin hujjatni o'chira oladi -- jamoaviy arxivda oddiy
    // xodim boshqalar yaratgan hujjatni o'chirib yubormasligi kerak.
    const canDelete = currentWorkspace.myRole==='owner' || currentWorkspace.myRole==='admin';
    c.innerHTML = documents.map(d=>`
      <div class="panel-card" style="display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-weight:700;font-size:14px">${d.name}</div><div style="font-size:11.5px;color:var(--muted);margin-top:3px">${new Date(d.createdAt).toLocaleString('ru-RU')}</div></div>
        <div style="display:flex;gap:8px">
          <button class="pbtn ghost" onclick="b2bDownloadDoc('${d.id}','pdf')">📄 PDF</button>
          ${canDelete ? `<button class="pbtn ghost" style="color:#f87171;border-color:#f87171" onclick="confirmDeleteB2BDoc('${d.id}','${d.name.replace(/'/g,"\\'")}')">🗑</button>` : ''}
        </div>
      </div>`).join('');
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}
function confirmDeleteB2BDoc(docId, name){
  openModal(`<h3 style="color:#f87171">⚠️ Hujjatni o'chirish</h3>
    <div class="msub"><b>${name}</b> arxivdan butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.</div>
    <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal()">${t('b2b_cancel')}</button>
    <button class="b2b-confirm" style="background:#dc2626" onclick="doDeleteB2BDoc('${docId}')">🗑 O'chirish</button></div>`);
}
async function doDeleteB2BDoc(docId){
  try{
    await apiDelete(`/b2b/documents/${currentWorkspace.id}/${docId}`);
    closeModal();
    toast("Hujjat o'chirildi", '', '#ef4444', '🗑️');
    loadDocuments();
  }catch(e){ closeModal(); toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}

/* ============ TEAM ============ */
async function loadMembers(){
  try{
    const {members} = await apiGet(`/b2b/workspaces/${currentWorkspace.id}/members`);
    const canManage = currentWorkspace.myRole==='owner' || currentWorkspace.myRole==='admin';
    document.getElementById('membersContainer').innerHTML = members.map(m=>`
      <div class="member-row">
        <div class="member-l"><div class="m-avatar">${(m.name||m.email||'?').slice(0,2).toUpperCase()}</div>
          <div><div class="m-name">${m.name||t('b2b_unknown_name')}</div><div class="m-email">${m.email||m.phone||''}</div></div></div>
        <div style="display:flex;gap:10px;align-items:center">
          ${canManage && m.role!=='owner' ? `
            <select onchange="changeRole('${m.userId}', this.value)" style="width:auto;padding:6px 10px;font-size:12px">
              ${['admin','member','viewer'].map(r=>`<option value="${r}" ${m.role===r?'selected':''}>${roleLabel(r)}</option>`).join('')}
            </select>
            <button onclick="removeMemberConfirm('${m.userId}','${(m.name||m.email||'').replace(/'/g,"\\'")}')" style="color:#f87171;font-size:13px">🗑️</button>
          ` : `<span class="role-badge ${m.role}">${roleLabel(m.role)}</span>`}
        </div>
      </div>`).join('');
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}
function openAddMemberModal(){
  openModal(`<h3>👥 ${t('b2b_add_member_title')}</h3><div class="msub">${t('b2b_add_member_sub')}</div>
    <div class="b2b-field"><label>${t('auth_identifier')}</label><input id="addMemberIdentifier" placeholder="xodim@kompaniya.com"></div>
    <div class="b2b-field"><label>${t('b2b_role')}</label><select id="addMemberRole"><option value="member">${roleLabel('member')}</option><option value="admin">${roleLabel('admin')}</option><option value="viewer">${roleLabel('viewer')}</option></select></div>
    <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal()">${t('b2b_cancel')}</button>
    <button class="b2b-confirm" onclick="submitAddMember()">${t('b2b_add_btn')}</button></div>`);
}
async function submitAddMember(){
  const identifier=document.getElementById('addMemberIdentifier').value.trim();
  const role=document.getElementById('addMemberRole').value;
  if(!identifier){ toast(t('error_occurred'),t('b2b_enter_identifier'),'#ef4444','⚠️'); return; }
  try{
    await apiPost(`/b2b/workspaces/${currentWorkspace.id}/members`, {identifier, role});
    closeModal();
    toast(t('b2b_member_added'),'','#22c55e','👥');
    loadMembers();
  }catch(e){
    // Agar foydalanuvchi hali ro'yxatdan o'tmagan bo'lsa (404), avtomatik
    // taklif tizimiga o'tamiz -- havola yaratib, owner shu havolani
    // xodimga (Telegram, WhatsApp orqali) yuborishi mumkin.
    if(e.status===404){
      try{
        const {invite} = await apiPost(`/b2b/workspaces/${currentWorkspace.id}/invites`, {identifier, role});
        showInviteLinkModal(invite);
        loadInvites();
      }catch(e2){ toast(t('error_occurred'), e2.message, '#ef4444','⚠️'); }
    }else{
      toast(t('error_occurred'), e.message, '#ef4444','⚠️');
    }
  }
}
function showInviteLinkModal(invite){
  const link = `${location.origin}/b2b/invite/${invite.token}`;
  openModal(`<h3>✉️ ${t('b2b_invite_created')}</h3>
    <div class="msub">${t('b2b_invite_created_sub')}</div>
    <div style="background:var(--panel2);border:1px solid var(--accent);border-radius:10px;padding:14px;font-family:monospace;font-size:12px;word-break:break-all;margin-bottom:14px;color:#fff">${link}</div>
    <button class="b2b-confirm" style="width:100%;margin-bottom:10px" onclick="navigator.clipboard.writeText('${link}');toast('${t('b2b_copied')}','','#22c55e','📋')">📋 ${t('b2b_copy_link')}</button>
    <button class="b2b-cancel" style="width:100%" onclick="closeModal()">${t('b2b_close')}</button>`);
}
async function loadInvites(){
  try{
    const {invites} = await apiGet(`/b2b/workspaces/${currentWorkspace.id}/invites`);
    renderInvites(invites);
  }catch(e){ /* jim turamiz, asosiy emas */ }
}
function renderInvites(invites){
  const c=document.getElementById('invitesContainer');
  if(!c) return;
  if(!invites.length){ c.innerHTML=''; return; }
  c.innerHTML = `<div class="panel-card">
    <h3>✉️ ${t('b2b_pending_invites')}</h3>
    ${invites.map(i=>`
      <div class="member-row">
        <div class="member-l"><div class="m-avatar">✉️</div>
          <div><div class="m-name">${i.identifier}</div><div class="m-email">${roleLabel(i.role)} · ${t('b2b_invite_expires')} ${new Date(i.expiresAt).toLocaleDateString('ru-RU')}</div></div></div>
        <div style="display:flex;gap:8px">
          <button onclick="showInviteLinkModal(${JSON.stringify(i).replace(/"/g,'&quot;')})" style="font-size:12px;padding:7px 12px;border:1px solid var(--line);border-radius:8px">🔗 ${t('b2b_view_link')}</button>
          <button onclick="doRevokeInvite('${i.id}')" style="color:#f87171;font-size:13px">🗑️</button>
        </div>
      </div>`).join('')}
  </div>`;
}
async function doRevokeInvite(inviteId){
  try{
    await apiDelete(`/b2b/workspaces/${currentWorkspace.id}/invites/${inviteId}`);
    toast(t('b2b_invite_revoked'),'','#ef4444','🗑️');
    loadInvites();
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}
async function changeRole(userId, role){
  try{
    const r=await fetch(`${API}/b2b/workspaces/${currentWorkspace.id}/members/${userId}`, {method:'PATCH', headers:{'Content-Type':'application/json', ...authHeaders()}, body:JSON.stringify({role})});
    if(!r.ok){ const d=await r.json(); toast(t('error_occurred'), d.error,'#ef4444','⚠️'); return; }
    toast(t('b2b_role_updated'),'','#22c55e','✅');
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}
function removeMemberConfirm(userId, name){
  openModal(`<h3>${t('b2b_remove_member_title')}</h3><div class="msub">${name} ${t('b2b_remove_member_sub')}</div>
    <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal()">${t('b2b_cancel')}</button>
    <button class="b2b-confirm" style="background:#dc2626" onclick="doRemoveMember('${userId}')">${t('b2b_remove_btn')}</button></div>`);
}
async function doRemoveMember(userId){
  try{
    await apiDelete(`/b2b/workspaces/${currentWorkspace.id}/members/${userId}`);
    closeModal();
    toast(t('b2b_member_removed'),'','#ef4444','🗑️');
    loadMembers();
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}

/* ============ WORKSPACE O'CHIRISH (faqat owner) ============ */
function openDeleteWorkspaceModal(){
  openModal(`<h3 style="color:#f87171">⚠️ ${t('b2b_delete_workspace')}</h3>
    <div class="msub">${t('b2b_delete_workspace_warning')} <b>${currentWorkspace.name}</b></div>
    <div class="b2b-field"><label>${t('b2b_type_to_confirm')}</label><input id="deleteWsConfirmInput" placeholder="${currentWorkspace.name}"></div>
    <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal()">${t('b2b_cancel')}</button>
    <button class="b2b-confirm" style="background:#dc2626" onclick="doDeleteWorkspace()">🗑️ ${t('b2b_delete_workspace')}</button></div>`);
}
async function doDeleteWorkspace(){
  const confirmName = document.getElementById('deleteWsConfirmInput').value.trim();
  try{
    const r = await fetch(`${API}/b2b/workspaces/${currentWorkspace.id}`, {
      method:'DELETE', headers:{'Content-Type':'application/json', ...authHeaders()},
      body: JSON.stringify({confirmName}),
    });
    const data = await r.json();
    if(!r.ok){ toast(t('error_occurred'), data.error, '#ef4444','⚠️'); return; }
    closeModal();
    workspaces = workspaces.filter(w=>w.id!==currentWorkspace.id);
    currentWorkspace = null;
    toast(t('b2b_workspace_deleted'),'','#ef4444','🗑️');
    openWorkspacePicker();
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}

/* ============ AI YORDAMCHI (CHAT) ============ */
let b2bConversations=[];
let b2bCurrentConvoId=null;
let b2bChatHistory=[];

async function loadB2BConversations(){
  try{
    const {conversations} = await apiGet(`/b2b/conversations/${currentWorkspace.id}`);
    b2bConversations = conversations;
    renderB2BChatHistory();
  }catch(e){ /* jim turamiz */ }
}
function renderB2BChatHistory(){
  const list=document.getElementById('b2bChatHistoryList');
  if(!list) return;
  if(!b2bConversations.length){
    list.innerHTML = `<div class="b2b-chat-hist-empty">${t('no_chats')}</div>`;
    return;
  }
  list.innerHTML = b2bConversations.map(c=>`
    <div class="b2b-chat-hist-item ${c.id===b2bCurrentConvoId?'active':''}" onclick="openB2BConversation('${c.id}')">
      <span class="cht">${(c.title||t('new_chat')).replace(/</g,'&lt;')}</span>
      <span class="chdel" onclick="event.stopPropagation();confirmDeleteB2BConvo('${c.id}')">🗑️</span>
    </div>`).join('');
}
function b2bChatEmptyState(){
  return `<div class="empty-state" style="padding:40px 20px"><div class="ei">💬</div><p>${t('b2b_chat_empty')}</p></div>`;
}
function b2bStartNewConversation(){
  b2bCurrentConvoId=null;
  b2bChatHistory=[];
  document.getElementById('b2bChatBody').innerHTML = b2bChatEmptyState();
  renderB2BChatHistory();
  document.getElementById('b2bChatHistoryPanel')?.classList.remove('open');
}
async function openB2BConversation(id){
  if(id===b2bCurrentConvoId) return;
  try{
    const {conversation} = await apiGet(`/b2b/conversations/${currentWorkspace.id}/${id}`);
    b2bCurrentConvoId = id;
    b2bChatHistory = conversation.messages.map(m=>({role:m.role, content:m.content}));
    const body=document.getElementById('b2bChatBody');
    if(!conversation.messages.length){ body.innerHTML = b2bChatEmptyState(); }
    else{ body.innerHTML = conversation.messages.map(renderB2BMsgHTML).join(''); body.scrollTop=body.scrollHeight; }
    renderB2BChatHistory();
    document.getElementById('b2bChatHistoryPanel')?.classList.remove('open');
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}
function renderB2BMsgHTML(m){
  if(m.role==='user') return `<div class="b2b-msg user"><div class="b2b-msg-av">👤</div><div class="b2b-msg-bub">${m.content}</div></div>`;
  return `<div class="b2b-msg"><div class="b2b-msg-av">🤖</div><div class="b2b-msg-bub">${m.content}</div></div>`;
}
function confirmDeleteB2BConvo(id){
  openModal(`<h3>${t('delete_chat_title')}</h3><div class="msub">${t('delete_chat_sub')}</div>
    <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal()">${t('cancel_btn')}</button>
    <button class="b2b-confirm" style="background:#dc2626" onclick="doDeleteB2BConvo('${id}')">🗑️ ${t('delete_btn')}</button></div>`);
}
async function doDeleteB2BConvo(id){
  try{
    await apiDelete(`/b2b/conversations/${currentWorkspace.id}/${id}`);
    b2bConversations = b2bConversations.filter(c=>c.id!==id);
    closeModal();
    if(id===b2bCurrentConvoId) b2bStartNewConversation(); else renderB2BChatHistory();
  }catch(e){ closeModal(); toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}

async function b2bSendChat(){
  const inp=document.getElementById('b2bChatInput');
  const q=inp.value.trim(); if(!q) return;
  const body=document.getElementById('b2bChatBody');
  if(body.querySelector('.empty-state')) body.innerHTML='';
  body.innerHTML += `<div class="b2b-msg user"><div class="b2b-msg-av">👤</div><div class="b2b-msg-bub">${q}</div></div>`;
  inp.value=''; body.scrollTop=body.scrollHeight;
  const typing=document.createElement('div');
  typing.className='b2b-msg'; typing.innerHTML=`<div class="b2b-msg-av">🤖</div><div class="b2b-msg-bub">⌨️ ...</div>`;
  body.appendChild(typing); body.scrollTop=body.scrollHeight;

  try{
    if(!b2bCurrentConvoId){
      const {conversation} = await apiPost(`/b2b/conversations/${currentWorkspace.id}`, {firstMessage:q});
      b2bCurrentConvoId = conversation.id;
      b2bConversations.unshift({id:conversation.id, title:conversation.title, updatedAt:conversation.updatedAt, createdAt:conversation.createdAt});
      renderB2BChatHistory();
    }

    const {reply, niaSources, caseLawUsed, creditsLeft} = await apiPost(`/b2b/chat/${currentWorkspace.id}`, {message:q, history:b2bChatHistory, lang:curLang});
    b2bChatHistory.push({role:'user', content:q}, {role:'assistant', content:reply});
    typing.remove();

    const srcBadge = niaSources && niaSources.length
      ? `<div style="margin-top:8px;font-size:10.5px;opacity:.7">📚 ${niaSources.map(s=>typeof s==='string'?s:(s&&s.url)||(s&&s.name)||'rasmiy manba').join(', ')}</div>` : '';
    const caseLawBadge = caseLawUsed
      ? `<div style="margin-top:4px;font-size:10.5px;color:#a78bfa">⚖️ ${t('case_law_included')||'Sud amaliyoti hisobga olindi'}</div>` : '';

    const docMatch = reply.match(/\[\[DOC_START\]\]([\s\S]*?)\[\[DOC_END\]\]/);
    if(docMatch){
      const before = reply.slice(0, docMatch.index).trim();
      const after = reply.slice(docMatch.index + docMatch[0].length).trim();
      const docText = docMatch[1].trim();
      const docId = 'b2bdoc_'+Date.now();
      window._b2bAiDocs = window._b2bAiDocs || {};
      window._b2bAiDocs[docId] = docText;
      const firstLine = (docText.split('\n').find(l=>l.trim()) || 'Hujjat').trim().slice(0,60);
      body.innerHTML += `<div class="b2b-msg"><div class="b2b-msg-av">🤖</div><div class="b2b-msg-bub">
        ${before?`<div style="margin-bottom:8px">${before}</div>`:''}
        <div class="b2b-doc-card">
          <div class="b2b-doc-card-head">📄 ${firstLine}</div>
          <div class="b2b-doc-card-text">${docText.replace(/</g,'&lt;')}</div>
          <div class="b2b-doc-card-actions">
            <button class="b2b-doc-save-btn pdf" onclick="b2bSaveAndDownloadDoc('${docId}','pdf')">📄 PDF</button>
            <button class="b2b-doc-save-btn docx" onclick="b2bSaveAndDownloadDoc('${docId}','docx')">⬇ DOCX</button>
          </div>
        </div>
        ${after?`<div style="margin-top:8px">${after}</div>`:''}
        ${srcBadge}${caseLawBadge}</div></div>`;
    }else{
      body.innerHTML += `<div class="b2b-msg"><div class="b2b-msg-av">🤖</div><div class="b2b-msg-bub">${reply}${srcBadge}${caseLawBadge}</div></div>`;
    }
    body.scrollTop=body.scrollHeight;

    await apiPost(`/b2b/conversations/${currentWorkspace.id}/${b2bCurrentConvoId}/messages`, {role:'user', content:q});
    await apiPost(`/b2b/conversations/${currentWorkspace.id}/${b2bCurrentConvoId}/messages`, {role:'assistant', content:reply});
    const idx=b2bConversations.findIndex(c=>c.id===b2bCurrentConvoId);
    if(idx>=0){ b2bConversations[idx].title = b2bConversations[idx].title===t('new_chat') ? (q.length>42?q.slice(0,42)+'…':q) : b2bConversations[idx].title; renderB2BChatHistory(); }
  }catch(e){
    typing.remove();
    if(e.code==='NO_CREDITS'){
      body.innerHTML += `<div class="b2b-msg"><div class="b2b-msg-av">🤖</div><div class="b2b-msg-bub">⚠️ ${t('no_credits_title')}</div></div>`;
      showB2BOutOfCreditsPanel();
    }else{
      body.innerHTML += `<div class="b2b-msg"><div class="b2b-msg-av">🤖</div><div class="b2b-msg-bub">${t('error_occurred')}</div></div>`;
    }
    body.scrollTop=body.scrollHeight;
  }
}

async function b2bSaveAndDownloadDoc(localId, ext){
  const text = window._b2bAiDocs && window._b2bAiDocs[localId];
  if(!text){ toast(t('error_occurred'),'','#ef4444','⚠️'); return; }
  window._b2bAiDocsSavedIds = window._b2bAiDocsSavedIds || {};
  if(window._b2bAiDocsSavedIds[localId]){
    b2bDownloadDoc(window._b2bAiDocsSavedIds[localId], ext);
    return;
  }
  const firstLine = (text.split('\n').find(l=>l.trim()) || 'Hujjat').trim().slice(0,80);
  try{
    const {document:newDoc} = await apiPost(`/b2b/documents/${currentWorkspace.id}`, {name:firstLine, filledBody:text});
    window._b2bAiDocsSavedIds[localId] = newDoc.id;
    b2bDownloadDoc(newDoc.id, ext);
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}
async function b2bDownloadDoc(docId, ext){
  try{
    const resp = await fetch(`${API}/b2b/documents/${currentWorkspace.id}/${docId}/${ext}`, {headers:authHeaders()});
    if(!resp.ok){ const e=await resp.json().catch(()=>({})); throw new Error(e.error||t('error_occurred')); }
    const blob = await resp.blob();
    const cd = resp.headers.get('Content-Disposition')||'';
    const m = /filename="([^"]+)"/.exec(cd);
    const filename = m ? m[1] : `hujjat.${ext}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download=filename;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    toast(filename, '', ext==='pdf'?'#dc2626':'#2563eb','📥');
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}

/* ============ B2B KREDIT TUGAGANDA -- sotib olishga taklif paneli ============ */
function showB2BOutOfCreditsPanel(){
  openModal(`<h3>⚠️ ${t('no_credits_title')}</h3>
    <div class="msub">${t('no_credits_sub')}</div>
    <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal()">${t('b2b_cancel')}</button>
    <button class="b2b-confirm" onclick="closeModal();goB2B('team')">⚙️ ${t('b2b_contact_owner')}</button></div>`);
}

/* ============ API KALITLAR ============ */
async function loadApiKeys(){
  try{
    const {keys} = await apiGet(`/b2b/api-keys/${currentWorkspace.id}`);
    renderApiKeys(keys);
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}
function renderApiKeys(keys){
  const c=document.getElementById('apiKeysContainer');
  if(!keys.length){
    c.innerHTML = `<div class="empty-state"><div class="ei">🔑</div><h4>${t('b2b_no_apikeys_title')}</h4><p>${t('b2b_no_apikeys_sub')}</p></div>`;
    return;
  }
  c.innerHTML = keys.map(k=>`
    <div class="panel-card" style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-weight:700;font-size:14px">${k.label}</div>
        <div style="font-family:monospace;font-size:12px;color:var(--muted);margin-top:4px">${k.keyPreview}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">${t('b2b_created_at')}: ${new Date(k.createdAt).toLocaleDateString('ru-RU')} ${k.lastUsedAt?'· '+t('b2b_last_used')+': '+new Date(k.lastUsedAt).toLocaleString('ru-RU'):'· '+t('b2b_never_used')}</div>
      </div>
      <button onclick="confirmRevokeApiKey('${k.id}','${k.label.replace(/'/g,"\\'")}')" style="color:#f87171;font-size:13px;padding:8px 14px;border:1px solid rgba(239,68,68,.3);border-radius:8px">🗑️ ${t('b2b_revoke')}</button>
    </div>`).join('');
}
function openCreateApiKeyModal(){
  openModal(`<h3>🔑 ${t('b2b_new_apikey')}</h3><div class="msub">${t('b2b_new_apikey_sub')}</div>
    <div class="b2b-field"><label>${t('b2b_apikey_label')}</label><input id="newApiKeyLabel" placeholder="${t('b2b_apikey_label_ph')}"></div>
    <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal()">${t('b2b_cancel')}</button>
    <button class="b2b-confirm" onclick="submitCreateApiKey()">${t('b2b_create_btn')}</button></div>`);
}
async function submitCreateApiKey(){
  const label = document.getElementById('newApiKeyLabel').value.trim();
  try{
    const {key} = await apiPost(`/b2b/api-keys/${currentWorkspace.id}`, {label});
    showNewApiKeyModal(key);
    loadApiKeys();
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}
function showNewApiKeyModal(key){
  openModal(`<h3>✅ ${t('b2b_apikey_created')}</h3>
    <div class="msub" style="color:#fbbf24">⚠️ ${t('b2b_apikey_show_once')}</div>
    <div style="background:var(--panel2);border:1px solid var(--accent);border-radius:10px;padding:14px;font-family:monospace;font-size:12.5px;word-break:break-all;margin-bottom:14px;color:#fff">${key.rawKey}</div>
    <button class="b2b-confirm" style="width:100%;margin-bottom:10px" onclick="navigator.clipboard.writeText('${key.rawKey}');toast('${t('b2b_copied')}','','#22c55e','📋')">📋 ${t('b2b_copy')}</button>
    <button class="b2b-cancel" style="width:100%" onclick="closeModal()">${t('b2b_close')}</button>`);
}
function confirmRevokeApiKey(keyId, label){
  openModal(`<h3>${t('b2b_revoke_apikey_title')}</h3><div class="msub">${label} ${t('b2b_revoke_apikey_sub')}</div>
    <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal()">${t('b2b_cancel')}</button>
    <button class="b2b-confirm" style="background:#dc2626" onclick="doRevokeApiKey('${keyId}')">🗑️ ${t('b2b_revoke')}</button></div>`);
}
async function doRevokeApiKey(keyId){
  try{
    await apiDelete(`/b2b/api-keys/${currentWorkspace.id}/${keyId}`);
    closeModal();
    toast(t('b2b_apikey_revoked'),'','#ef4444','🗑️');
    loadApiKeys();
  }catch(e){ closeModal(); toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}

/* ============ TAKLIF HAVOLASI (/b2b/invite/:token) ============ */
function getInviteTokenFromUrl(){
  const m = location.pathname.match(/\/b2b\/invite\/([a-f0-9]+)/i);
  return m ? m[1] : null;
}
async function handleInviteLink(token){
  try{
    const r = await fetch(`${API}/b2b/workspaces/invites/${token}`);
    const data = await r.json();
    if(!r.ok){ toast(t('error_occurred'), data.error||'', '#ef4444','⚠️'); return; }
    if(authToken()){
      // Foydalanuvchi allaqachon tizimga kirgan -- darhol qabul qilish so'raymiz
      openModal(`<h3>✉️ ${t('b2b_invite_received_title')}</h3>
        <div class="msub">${t('b2b_invite_received_sub_1')} <b>${data.invite.workspaceName}</b> ${t('b2b_invite_received_sub_2')} ${roleLabel(data.invite.role)}.</div>
        <div class="b2b-modal-actions"><button class="b2b-cancel" onclick="closeModal();history.replaceState(null,'','/b2b')">${t('b2b_cancel')}</button>
        <button class="b2b-confirm" onclick="acceptInviteFromLink('${token}')">✅ ${t('b2b_accept_invite')}</button></div>`);
    }else{
      // Foydalanuvchi hali tizimga kirmagan -- avval login/register qilishni so'raymiz
      window._pendingInviteToken = token;
      showGate();
      toast(t('b2b_invite_login_first'), data.invite.workspaceName, '#2563eb','✉️');
    }
  }catch(e){ /* jim turamiz, asosiy oqimni buzmaslik uchun */ }
}
async function acceptInviteFromLink(token){
  try{
    const r = await fetch(`${API}/b2b/workspaces/invites/${token}/accept`, {method:'POST', headers:authHeaders()});
    const data = await r.json();
    closeModal();
    history.replaceState(null,'','/b2b');
    if(!r.ok){ toast(t('error_occurred'), data.error||'', '#ef4444','⚠️'); return; }
    toast(t('b2b_invite_accepted'), data.workspace.name, '#22c55e','✅');
    workspaces.push(data.workspace);
    selectWorkspace(data.workspace.id);
  }catch(e){ toast(t('error_occurred'), e.message, '#ef4444','⚠️'); }
}

/* ============ INIT ============ */
(function init(){
  applyB2BLang();
  const inviteToken = getInviteTokenFromUrl();
  if(authToken()){
    afterLogin().then(()=>{ if(inviteToken) handleInviteLink(inviteToken); });
  }else if(inviteToken){
    handleInviteLink(inviteToken);
  }else{
    showGate();
  }
})();

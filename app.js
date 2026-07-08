const STORE_KEY = 'training-planner-v1';

const SPORTS = {
  cycling: { label: 'Ciclismo', unit: 'W', mainMetric: 'FTP' },
  running: { label: 'Running', unit: 'min/km', mainMetric: 'Ritmo umbral' },
  swimming: { label: 'Natación', unit: 'm', mainMetric: 'CSS' },
  strength: { label: 'Fuerza', unit: 'RPE', mainMetric: 'RPE objetivo' },
  triathlon: { label: 'Triatlón', unit: 'mixto', mainMetric: 'Carga semanal' },
  mobility: { label: 'Movilidad', unit: 'min', mainMetric: 'Duración' },
};

const TEMPLATES = {
  cycling: [
    { title: 'Z2 resistencia', duration: 60, intensity: 'Z2' },
    { title: 'Sweet Spot 3x10', duration: 75, intensity: '88–92% FTP' },
    { title: 'VO2max 5x3', duration: 70, intensity: 'Z5' },
    { title: 'Fondo controlado', duration: 120, intensity: 'Z2' },
  ],
  running: [
    { title: 'Rodaje suave', duration: 35, intensity: 'Z2' },
    { title: 'Series 6x800', duration: 55, intensity: 'Z4' },
    { title: 'Cambios de ritmo', duration: 45, intensity: 'Z3' },
    { title: 'Tirada cómoda', duration: 60, intensity: 'Z2' },
  ],
  swimming: [
    { title: 'Técnica + aeróbico', duration: 45, intensity: '1.600m suave' },
    { title: 'Series CSS', duration: 55, intensity: '8x100 CSS' },
    { title: 'Pull + técnica', duration: 50, intensity: '2.000m control' },
  ],
  strength: [
    { title: 'Fuerza general', duration: 45, intensity: 'RPE 6' },
    { title: 'Pierna + core', duration: 50, intensity: 'RPE 7' },
    { title: 'Core + movilidad', duration: 30, intensity: 'RPE 5' },
  ],
  triathlon: [
    { title: 'Brick bici+carrera', duration: 80, intensity: 'Z2/Z3' },
    { title: 'Técnica natación', duration: 45, intensity: 'Suave' },
    { title: 'Run transición', duration: 35, intensity: 'Z2' },
  ],
  mobility: [
    { title: 'Movilidad cadera/espalda', duration: 25, intensity: 'Suave' },
    { title: 'Descarga guiada', duration: 20, intensity: 'Muy suave' },
  ],
};

const DEFAULT_STATE = {
  session: null,
  role: 'athlete',
  selectedDay: 3,
  calendarMode: 'month',
  page: 'dashboard',
  modalDay: null,
  editingWorkoutId: null,
  selectedAthleteId: 'k',
  athletes: [
    {
      id: 'k', name: 'K', sport: 'cycling', level: 'Intermedio', objective: 'Mejorar FTP y fondo', availability: 'Mar, Jue, Sáb, Dom',
      ftp: 240, maxHr: 184, thresholdHr: 168, weeklyHours: 6, fatigue: 5, pain: 'Sin molestias',
    },
    {
      id: 'fran', name: 'Fran', sport: 'running', level: 'Principiante', objective: 'Preparar 10K', availability: 'Lun, Mié, Vie',
      ftp: 0, maxHr: 190, thresholdHr: 172, weeklyHours: 4, fatigue: 4, pain: 'Sin molestias',
    }
  ],
  workouts: [
    { id: 'w1', athleteId: 'k', day: 1, sport: 'cycling', title: 'Z2 resistencia', duration: 60, intensity: 'Z2', status: 'completed', source: 'manual' },
    { id: 'w2', athleteId: 'k', day: 3, sport: 'cycling', title: 'Bici Z2', duration: 90, intensity: 'Z2', status: 'planned', source: 'manual' },
    { id: 'w3', athleteId: 'k', day: 3, sport: 'cycling', title: 'Garmin · carrera suave', duration: 42, intensity: 'Z2/Z3', status: 'imported', source: 'garmin' },
    { id: 'w4', athleteId: 'k', day: 5, sport: 'strength', title: 'Fuerza core', duration: 45, intensity: 'RPE 6', status: 'planned', source: 'manual' },
    { id: 'w5', athleteId: 'fran', day: 2, sport: 'running', title: 'Rodaje suave', duration: 35, intensity: 'Z2', status: 'planned', source: 'manual' },
  ],
  garminActivities: [
    { id: 'g1', athleteId: 'k', day: 3, sport: 'cycling', duration: 92, distance: 43.2, elevation: 520, avgPower: 178, np: 194, avgHr: 143, maxHr: 169, cadence: 86, zones: { Z1: 12, Z2: 58, Z3: 17, Z4: 5 }, rpe: 6 },
  ],
  feedback: {
    'k-3': { rpe: 6, fatigue: 5, sleep: 7, pain: 'No', comment: 'Piernas algo cargadas al final, pero controlado.' }
  },
  lastAiPlan: [],
};

let state = loadState();
const app = document.querySelector('#app');

function loadState(){
  try {
    const loaded = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    const merged = { ...structuredClone(DEFAULT_STATE), ...loaded };
    merged.feedback = { ...structuredClone(DEFAULT_STATE.feedback), ...(loaded.feedback || {}) };
    merged.lastAiPlan = loaded.lastAiPlan || [];
    merged.calendarMode = loaded.calendarMode || 'month';
    merged.page = loaded.page || 'dashboard';
    merged.modalDay = loaded.modalDay || null;
    return merged;
  }
  catch { return structuredClone(DEFAULT_STATE); }
}
function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function currentAthlete(){ return state.athletes.find(a => a.id === state.selectedAthleteId) || state.athletes[0]; }
function workoutsFor(day){ return state.workouts.filter(w => w.athleteId === currentAthlete().id && w.day === day); }
function sportClass(s){ return `sport-${s || 'mobility'}`; }
function statusLabel(s){ return ({ planned:'Planificado', completed:'Completado', skipped:'Saltado', imported:'Garmin' }[s] || s); }
function uid(){ return Math.random().toString(36).slice(2, 9); }
function athleteWorkouts(){ return state.workouts.filter(w => w.athleteId === currentAthlete().id); }
function weekSummary(){
  const ws = athleteWorkouts();
  const planned = ws.filter(w => w.status !== 'imported').reduce((a,w)=>a+Number(w.duration||0),0);
  const done = ws.filter(w => ['completed','imported'].includes(w.status)).reduce((a,w)=>a+Number(w.duration||0),0);
  const plannedCount = ws.filter(w => w.status === 'planned').length;
  const skippedCount = ws.filter(w => w.status === 'skipped').length;
  const consistency = planned ? Math.min(140, Math.round((done/planned)*100)) : 0;
  return { ws, planned, done, plannedCount, skippedCount, consistency };
}
function formatMinutes(min){ return `${Math.floor(min/60)}h ${min%60}`; }
function feedbackKey(day = state.selectedDay){ return `${currentAthlete().id}-${day}`; }
function selectedFeedback(){ return state.feedback?.[feedbackKey()] || { rpe: 5, fatigue: currentAthlete().fatigue || 5, sleep: 7, pain: 'No', comment: '' }; }
function escapeHtml(v){ return String(v ?? '').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }


function renderAppNav(){
  const items = [
    ['dashboard','Dashboard'],
    ['profile','Perfil'],
    ['stats','Estadísticas'],
    ['analysis','Garmin / análisis'],
  ];
  return `<nav class="app-nav">${items.map(([id,label])=>`<button class="nav-item ${state.page===id?'active':''}" data-page="${id}">${label}</button>`).join('')}</nav>`;
}

function renderCurrentPage(athlete){
  if(state.page === 'profile') return renderProfilePage(athlete);
  if(state.page === 'stats') return renderStatsPage(athlete);
  if(state.page === 'analysis') return renderAnalysisPage(athlete);
  return state.role === 'coach' ? renderCoachDashboard(athlete) : renderAthleteDashboard(athlete);
}

function render(){
  if(!state.session) return renderLogin();
  const athlete = currentAthlete();
  app.innerHTML = `
    <header class="topbar">
      <div class="brand"><span class="logo">TP</span><div>Training Planner<br><span class="small">${state.role === 'coach' ? 'Mister/Admin' : 'Atleta'} · Multi-deporte + Garmin</span></div></div>
      <div class="actions">
        <button class="tab ${state.role==='athlete'?'active':''}" data-role="athlete">Vista atleta</button>
        <button class="tab ${state.role==='coach'?'active':''}" data-role="coach">Vista mister</button>
        <button class="btn" id="resetDemo">Reset demo</button>
        <button class="btn danger" id="logout">Salir</button>
      </div>
    </header>
    ${renderAppNav()}
    ${renderCurrentPage(athlete)}
    ${renderDayModal()}
  `;
  bindCommon();
}

function renderLogin(){
  app.innerHTML = `
    <section class="login-wrap">
      <div class="login-card">
        <div class="brand"><span class="logo">TP</span><div>Training Planner<br><span class="small">PWA v1.7 · login local demo</span></div></div>
        <h1 style="margin-top:22px">Entrena con contexto.</h1>
        <p class="lead">Calendario, perfil físico, Garmin demo, vista atleta, vista mister y planificación semanal asistida por IA.</p>
        <form class="form" id="loginForm">
          <label>Email<input name="email" value="k@demo.local" /></label>
          <label>Contraseña<input name="password" type="password" value="demo" /></label>
          <button class="btn primary" type="submit">Entrar en demo</button>
        </form>
        <p class="small">Login local de prototipo. Sin backend, sin datos reales. Seguridad con casco de juguete, válida para maqueta.</p>
      </div>
    </section>`;
  document.querySelector('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.session = { email: data.get('email'), loginAt: new Date().toISOString() };
    save(); render();
  });
}

function renderAthleteDashboard(athlete){
  return `
    <section class="grid" style="margin-bottom:18px">
      <h1>Hola, ${escapeHtml(athlete.name)}.</h1>
      <p class="lead">Dashboard limpio: calendario, microciclo y lo que toca hoy. Lo demás vive en su sección, como debe ser.</p>
    </section>
    <section class="main-grid">
      <div class="grid">
        ${renderWeekFocus()}
        ${renderMicrocycle()}
        ${renderCalendar()}
      </div>
      <aside class="grid">
        ${renderTodayPanel()}
        ${renderSelectedDay()}
      </aside>
    </section>`;
}

function renderCoachDashboard(athlete){
  return `
    <section class="main-grid">
      <div class="grid">
        <section class="panel">
          <div class="panel-title"><h2>Atletas</h2><div class="actions"><button class="btn" id="duplicateWeek">Duplicar semana</button><button class="btn primary" id="generateWeek">Generar semana IA demo</button></div></div>
          <div class="coach-list">
            ${state.athletes.map(a => `<button class="athlete-card" data-athlete="${a.id}"><span><b>${escapeHtml(a.name)}</b><br><span class="muted">${SPORTS[a.sport]?.label || a.sport} · ${escapeHtml(a.objective)}</span></span><span class="pill">${a.weeklyHours}h/sem</span></button>`).join('')}
          </div>
        </section>
        ${renderWeekFocus()}
        ${renderMicrocycle()}
        ${renderCoachAlerts()}
        ${renderCalendar()}
      </div>
      <aside class="grid">
        ${renderTodayPanel()}
        ${renderSelectedDay()}
        ${renderWorkoutForm()}
        ${renderAiPlan()}
      </aside>
    </section>`;
}

function renderProfilePage(athlete){
  return `<section class="main-grid"><div class="grid">${renderProfile(athlete)}${renderZones(athlete)}</div><aside class="grid">${renderFeedbackForm(state.role==='coach')}${renderTodayPanel()}</aside></section>`;
}

function renderStatsPage(athlete){
  return `<section class="main-grid"><div class="grid">${renderMetrics()}${renderWeeklyHistory(state.role==='coach')}</div><aside class="grid">${renderCoachAlerts()}${renderAiPlan()}</aside></section>`;
}

function renderAnalysisPage(athlete){
  return `<section class="main-grid"><div class="grid">${renderGarminAnalysis(athlete, state.role==='coach')}</div><aside class="grid">${renderWeeklyHistory(state.role==='coach')} ${renderFeedbackForm(true)}</aside></section>`;
}

function selectedDayWorkload(){
  return workoutsFor(state.selectedDay).reduce((sum,w)=>sum+Number(w.duration||0),0);
}

function renderTodayPanel(){
  const list = workoutsFor(state.selectedDay);
  const next = list.find(w => w.status === 'planned') || list[0];
  const f = selectedFeedback();
  const title = next ? escapeHtml(next.title) : 'Descanso / movilidad opcional';
  const guidance = next
    ? `${SPORTS[next.sport]?.label || next.sport} · ${next.duration} min · ${escapeHtml(next.intensity)}. Objetivo: cumplir sin perseguir héroes.`
    : 'No hay sesión planificada. Si hay fatiga, descansa. Si estás fresco, movilidad ligera.';
  return `<section class="today-card"><span class="small">Panel Hoy · día ${state.selectedDay}</span><h2>${title}</h2><p>${guidance}</p><div class="today-strip"><span>RPE ${f.rpe}</span><span>Fatiga ${f.fatigue}/10</span><span>Sueño ${f.sleep}/10</span><span>${selectedDayWorkload()} min</span></div></section>`;
}

function coachAlerts(){
  const s = weekSummary();
  const f = selectedFeedback();
  const alerts=[];
  if(Number(f.fatigue) >= 8 || currentAthlete().fatigue >= 8) alerts.push({level:'danger', title:'Fatiga alta', body:'Conviene bajar intensidad o meter descarga.'});
  if(Number(f.sleep) <= 5) alerts.push({level:'warn', title:'Sueño bajo', body:'Evitar sesiones de alta intensidad hasta recuperar.'});
  if(s.skippedCount > 0) alerts.push({level:'warn', title:'Entrenos saltados', body:`${s.skippedCount} sesión(es) saltadas. Revisar adherencia antes de subir carga.`});
  if(s.consistency > 115) alerts.push({level:'warn', title:'Sobrecumplimiento', body:'Está haciendo más de lo previsto. Bien para Strava, delicado para la semana siguiente.'});
  if(s.consistency < 60 && s.planned > 0) alerts.push({level:'info', title:'Cumplimiento bajo', body:'Mejor reajustar calendario que acumular deuda deportiva imaginaria.'});
  return alerts;
}

function renderCoachAlerts(){
  if(state.role !== 'coach') return '';
  const alerts = coachAlerts();
  return `<section class="panel"><div class="panel-title"><h2>Alertas mister</h2><span class="pill">${alerts.length || 'OK'}</span></div>${alerts.length ? alerts.map(a=>`<div class="alert ${a.level}"><b>${escapeHtml(a.title)}</b><span>${escapeHtml(a.body)}</span></div>`).join('') : '<p class="lead">Sin alertas relevantes. La semana está razonablemente controlada.</p>'}</section>`;
}

function renderWeekFocus(){
  const s = weekSummary();
  const advice = currentAthlete().fatigue >= 8
    ? 'Fatiga alta: priorizar descarga y evitar intensidad.'
    : s.consistency < 60
      ? 'Cumplimiento bajo: mejor ajustar volumen que compensar de golpe.'
      : 'Semana controlada: mantener progresión sin heroicidades.';
  return `<section class="panel week-focus">
    <div><span class="small">Resumen inteligente</span><h2>${escapeHtml(currentAthlete().objective)}</h2><p class="lead">${advice}</p></div>
    <div class="mini-metrics">
      <span><b>${formatMinutes(s.planned)}</b><small>plan</small></span>
      <span><b>${formatMinutes(s.done)}</b><small>hecho</small></span>
      <span><b>${s.consistency}%</b><small>cumpl.</small></span>
      <span><b>${s.plannedCount}</b><small>pend.</small></span>
    </div>
  </section>`;
}


function dayLoad(day){
  const ws = workoutsFor(day);
  const minutes = ws.reduce((a,w)=>a+Number(w.duration||0),0);
  const hard = ws.some(w => /Z4|Z5|VO2|88|92|RPE 8|RPE 9/i.test(`${w.intensity} ${w.title}`));
  const imported = ws.some(w => w.status === 'imported');
  const skipped = ws.some(w => w.status === 'skipped');
  return { ws, minutes, hard, imported, skipped };
}

function renderMicrocycle(){
  const start = Math.max(1, Math.min(25, state.selectedDay - 3));
  const days = Array.from({length:7}, (_,i)=>start+i);
  return `<section class="panel"><div class="panel-title"><h2>Microciclo</h2><span class="pill">Carga semanal</span></div><div class="microcycle">${days.map(day=>{
    const d=dayLoad(day);
    const level = d.minutes === 0 ? 'rest' : d.minutes >= 90 ? 'high' : d.hard ? 'hard' : 'base';
    return `<button class="micro-day ${level} ${state.selectedDay===day?'active':''}" data-day="${day}"><b>${day}</b><span>${d.minutes ? `${d.minutes} min` : 'Descanso'}</span><small>${d.imported?'Garmin · ':''}${d.hard?'Intenso':d.skipped?'Saltado':d.ws.length?`${d.ws.length} sesión(es)`:'Movilidad opcional'}</small></button>`;
  }).join('')}</div></section>`;
}

function renderCalendar(){
  const start = Math.max(1, Math.min(25, state.selectedDay - 3));
  const days = state.calendarMode === 'week' ? Array.from({length: 7}, (_,i) => start+i) : Array.from({length: 31}, (_,i) => i+1);
  return `<section class="panel"><div class="panel-title"><h2>Julio 2026</h2><div class="tabs"><button class="tab ${state.calendarMode==='month'?'active':''}" data-calendar-mode="month">Mes</button><button class="tab ${state.calendarMode==='week'?'active':''}" data-calendar-mode="week">Semana</button><span class="pill">${escapeHtml(currentAthlete().name)}</span></div></div>
    <div class="calendar">
      ${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d=>`<div class="dow">${d}</div>`).join('')}
      ${days.map(day => `<article class="day ${state.selectedDay===day?'active':''}" data-day="${day}"><strong>${day}</strong>${workoutsFor(day).map(w => `<button class="workout ${sportClass(w.sport)}" data-workout="${w.id}">${escapeHtml(w.title)} · ${w.duration}'<br><span>${statusLabel(w.status)} · ${escapeHtml(w.intensity)}</span></button>`).join('')}</article>`).join('')}
    </div></section>`;
}

function renderSelectedDay(){
  const list = workoutsFor(state.selectedDay);
  const cards = list.map(w => `<article class="selected-workout ${sportClass(w.sport)}">
    <div><b>${escapeHtml(w.title)}</b><br><span>${SPORTS[w.sport]?.label || w.sport} · ${w.duration} min · ${escapeHtml(w.intensity)} · ${statusLabel(w.status)}</span></div>
    <div class="inline-actions">
      ${w.status === 'planned' ? `<button class="mini-btn" data-status="completed" data-id="${w.id}">Completar</button><button class="mini-btn" data-status="skipped" data-id="${w.id}">Saltar</button>` : ''}
      ${w.source !== 'garmin' ? `<button class="mini-btn" data-edit="${w.id}">Editar</button><button class="mini-btn danger" data-delete="${w.id}">Borrar</button>` : ''}
    </div>
  </article>`).join('');
  return `<section class="detail-card"><small>Día seleccionado · ${state.selectedDay} julio</small><h2>${list[0] ? `${list.length} ${list.length>1?'sesiones':'sesión'}` : 'Día libre'}</h2><p>${list.length ? 'Gestiona el estado del día sin salir del calendario.' : 'Sin entrenamiento. Buen día para descanso, movilidad o meter algo con cabeza.'}</p>${cards || ''}</section>`;
}


function renderDayModal(){
  if(!state.modalDay) return '';
  const day = Number(state.modalDay);
  const list = workoutsFor(day);
  const total = list.reduce((a,w)=>a+Number(w.duration||0),0);
  return `<div class="modal-backdrop" data-close-modal="true"><section class="day-modal" role="dialog" aria-modal="true" aria-label="Día ${day}"><div class="panel-title"><div><span class="small">Detalle del día</span><h2>${day} julio · ${total || 0} min</h2></div><button class="modal-close" data-close-modal="true">Cerrar</button></div>${list.length ? list.map(w=>`<article class="modal-workout ${sportClass(w.sport)}"><div><b>${escapeHtml(w.title)}</b><p>${SPORTS[w.sport]?.label || w.sport} · ${w.duration} min · ${escapeHtml(w.intensity)} · ${statusLabel(w.status)}</p></div><div class="inline-actions">${w.status === 'planned' ? `<button class="mini-btn" data-status="completed" data-id="${w.id}">Completar</button><button class="mini-btn" data-status="skipped" data-id="${w.id}">Saltar</button>` : ''}${w.source !== 'garmin' ? `<button class="mini-btn" data-edit="${w.id}">Editar</button><button class="mini-btn danger" data-delete="${w.id}">Borrar</button>` : ''}</div></article>`).join('') : '<p class="lead">Día libre. Perfecto para descanso, movilidad o no hacer el cafre.</p>'}</section></div>`;
}

function renderFeedbackForm(readOnly=false){
  const f = selectedFeedback();
  return `<section class="panel"><div class="panel-title"><h2>Feedback post-entreno</h2><span class="pill">Día ${state.selectedDay}</span></div>
    <form class="form" id="feedbackForm">
      <div class="form-row"><label>RPE 1-10<input name="rpe" type="number" min="1" max="10" value="${f.rpe}" ${readOnly?'readonly':''}/></label><label>Fatiga<input name="fatigue" type="number" min="1" max="10" value="${f.fatigue}" ${readOnly?'readonly':''}/></label></div>
      <div class="form-row"><label>Sueño<input name="sleep" type="number" min="1" max="10" value="${f.sleep}" ${readOnly?'readonly':''}/></label><label>Molestias<input name="pain" value="${escapeHtml(f.pain)}" ${readOnly?'readonly':''}/></label></div>
      <label>Comentario<textarea name="comment" rows="3" ${readOnly?'readonly':''}>${escapeHtml(f.comment)}</textarea></label>
      ${readOnly ? '<p class="small">Vista lectura para mister/admin.</p>' : '<button class="btn primary" type="submit">Guardar feedback</button>'}
    </form></section>`;
}

function renderAiPlan(){
  if(!state.lastAiPlan?.length) return `<section class="panel"><div class="panel-title"><h2>Plan IA</h2></div><p class="lead">Genera una semana IA demo para ver explicación sesión a sesión.</p></section>`;
  return `<section class="panel analysis"><div class="panel-title"><h2>Plan IA propuesto</h2><span class="pill">${state.lastAiPlan.length} sesiones</span></div>${state.lastAiPlan.map(p=>`<div class="item"><b>Día ${p.day} · ${escapeHtml(p.title)}</b><br>${escapeHtml(p.why)}</div>`).join('')}</section>`;
}

function renderWeeklyHistory(coach=false){
  const bySport = athleteWorkouts().reduce((acc,w)=>{ acc[w.sport]=(acc[w.sport]||0)+Number(w.duration||0); return acc; },{});
  const rows = Object.entries(bySport).sort((a,b)=>b[1]-a[1]).map(([sport,min])=>`<div class="zone"><b>${SPORTS[sport]?.label || sport}</b><span>${formatMinutes(min)}</span></div>`).join('');
  const f = selectedFeedback();
  const note = coach ? `Mister: revisar feedback RPE ${f.rpe}, fatiga ${f.fatigue}, sueño ${f.sleep}.` : `Último feedback: RPE ${f.rpe}, fatiga ${f.fatigue}, sueño ${f.sleep}.`;
  return `<section class="panel"><div class="panel-title"><h2>Historial semanal</h2><span class="pill">${coach?'Coach':'Atleta'}</span></div><div class="zone-list">${rows || '<p class="lead">Sin sesiones todavía.</p>'}</div><p class="lead">${note}</p></section>`;
}

function renderMetrics(){
  const s = weekSummary();
  return `<section class="panel metric-grid"><article class="metric"><span>Planificado</span><strong>${formatMinutes(s.planned)}</strong></article><article class="metric"><span>Realizado</span><strong>${formatMinutes(s.done)}</strong></article><article class="metric"><span>Consistencia</span><strong>${s.consistency}%</strong></article><article class="metric"><span>Fatiga</span><strong>${currentAthlete().fatigue}/10</strong></article></section>`;
}

function renderProfile(a){
  return `<section class="panel"><div class="panel-title"><h2>Perfil físico</h2><span class="pill">${SPORTS[a.sport]?.label}</span></div>
    <form class="form" id="profileForm">
      <div class="form-row"><label>Deporte principal<select name="sport">${Object.entries(SPORTS).map(([k,v])=>`<option value="${k}" ${a.sport===k?'selected':''}>${v.label}</option>`).join('')}</select></label><label>Nivel<input name="level" value="${escapeHtml(a.level)}" /></label></div>
      <label>Objetivo<input name="objective" value="${escapeHtml(a.objective)}" /></label>
      <div class="form-row"><label>FTP / métrica umbral<input name="ftp" type="number" value="${a.ftp || 0}" /></label><label>FC máx<input name="maxHr" type="number" value="${a.maxHr || 0}" /></label></div>
      <div class="form-row"><label>FC umbral<input name="thresholdHr" type="number" value="${a.thresholdHr || 0}" /></label><label>Horas semana<input name="weeklyHours" type="number" value="${a.weeklyHours || 0}" /></label></div>
      <label>Días disponibles<input name="availability" value="${escapeHtml(a.availability)}" /></label>
      <div class="form-row"><label>Fatiga 1-10<input name="fatigue" type="number" min="1" max="10" value="${a.fatigue || 5}" /></label><label>Molestias<input name="pain" value="${escapeHtml(a.pain)}" /></label></div>
      <button class="btn primary" type="submit">Guardar perfil</button>
    </form></section>`;
}

function renderZones(a){
  if(a.sport === 'cycling' && Number(a.ftp) > 0){
    const ftp=Number(a.ftp); const zones=[['Z1 Recuperación',0,0.55],['Z2 Resistencia',0.56,0.75],['Z3 Tempo',0.76,0.90],['Z4 Umbral',0.91,1.05],['Z5 VO2max',1.06,1.20],['Z6 Anaeróbica',1.21,1.50]];
    return `<section class="panel"><div class="panel-title"><h2>Zonas potencia</h2><span class="pill">FTP ${ftp}W</span></div><div class="zone-list">${zones.map(([n,lo,hi])=>`<div class="zone"><b>${n}</b><span>${lo?Math.round(ftp*lo):'<'}${lo?'–':''}${Math.round(ftp*hi)} W</span></div>`).join('')}</div></section>`;
  }
  if(['running','swimming','triathlon'].includes(a.sport) && Number(a.maxHr) > 0){
    const hr=Number(a.maxHr); const zones=[['Z1 Suave',0.60,0.70],['Z2 Aeróbica',0.70,0.80],['Z3 Tempo',0.80,0.87],['Z4 Umbral',0.87,0.93],['Z5 Alta',0.93,1.00]];
    return `<section class="panel"><div class="panel-title"><h2>Zonas FC</h2><span class="pill">FC máx ${hr}</span></div><div class="zone-list">${zones.map(([n,lo,hi])=>`<div class="zone"><b>${n}</b><span>${Math.round(hr*lo)}–${Math.round(hr*hi)} ppm</span></div>`).join('')}</div></section>`;
  }
  if(a.sport === 'strength'){
    return `<section class="panel"><div class="panel-title"><h2>Zonas fuerza</h2></div><div class="zone-list"><div class="zone"><b>Técnica</b><span>RPE 4–5</span></div><div class="zone"><b>Trabajo</b><span>RPE 6–7</span></div><div class="zone"><b>Alta carga</b><span>RPE 8–9</span></div></div></section>`;
  }
  return `<section class="panel"><div class="panel-title"><h2>Zonas</h2></div><p class="lead">Define FC, umbral o métrica principal para calcular zonas específicas.</p></section>`;
}

function renderWorkoutForm(){
  const editing = state.workouts.find(w => w.id === state.editingWorkoutId) || null;
  const sport = editing?.sport || currentAthlete().sport || 'cycling';
  const templates = TEMPLATES[sport] || TEMPLATES.mobility || [];
  return `<section class="panel"><div class="panel-title"><h2>${editing ? 'Editar entrenamiento' : 'Crear entrenamiento'}</h2>${editing ? '<button class="btn" id="cancelEdit">Cancelar</button>' : ''}</div>
    <form class="form" id="workoutForm">
      <input type="hidden" name="id" value="${editing?.id || ''}" />
      <div class="form-row"><label>Día<input name="day" type="number" min="1" max="31" value="${editing?.day || state.selectedDay}" /></label><label>Deporte<select name="sport">${Object.entries(SPORTS).map(([k,v])=>`<option value="${k}" ${(editing?.sport || currentAthlete().sport)===k?'selected':''}>${v.label}</option>`).join('')}</select></label></div>
      <label>Título<input name="title" value="${escapeHtml(editing?.title || 'Rodaje suave')}" /></label>
      <div class="form-row"><label>Duración min<input name="duration" type="number" value="${editing?.duration || 45}" /></label><label>Intensidad<input name="intensity" value="${escapeHtml(editing?.intensity || 'Z2')}" /></label></div>
      <button class="btn primary" type="submit">${editing ? 'Guardar cambios' : 'Añadir al calendario'}</button>
    </form>
    <div class="template-grid">
      ${templates.map((t,i)=>`<button class="template-chip" data-template="${sport}:${i}">${escapeHtml(t.title)} · ${t.duration}' · ${escapeHtml(t.intensity)}</button>`).join('')}
    </div>
  </section>`;
}

function renderGarminAnalysis(a, coach=false){
  const g = state.garminActivities.find(x => x.athleteId === a.id);
  if(!g) return `<section class="panel"><div class="panel-title"><h2>Garmin</h2></div><p class="lead">Sin actividad Garmin demo para este atleta.</p></section>`;
  const planned = state.workouts.find(w => w.athleteId === a.id && w.day === g.day && w.status !== 'imported');
  const plannedDuration = Number(planned?.duration || g.duration);
  const diff = g.duration - plannedDuration;
  const compliance = Math.round((g.duration / Math.max(1, plannedDuration)) * 100);
  const color = compliance < 80 ? 'warn' : compliance > 125 ? 'danger' : 'ok';
  const zoneText = Object.entries(g.zones || {}).map(([k,v]) => `${k}: ${v}m`).join(' · ');
  const intensityFlag = (g.zones?.Z4 || 0) + (g.zones?.Z5 || 0) > 12 ? 'intensidad alta' : 'intensidad controlada';
  const msg = coach
    ? `Plan vs real: ${planned ? escapeHtml(planned.title) : 'sin plan vinculado'} · ${plannedDuration} min previstos vs ${g.duration} min reales (${diff>=0?'+':''}${diff} min). ${intensityFlag}.`
    : `Hiciste ${compliance}% de la duración prevista. ${Math.abs(diff) <= 10 ? 'Encaja bien con el plan.' : diff > 0 ? 'Te fuiste por encima; ojo con acumular fatiga.' : 'Quedó corto; no pasa nada, ajustamos.'}`;
  return `<section class="panel analysis"><div class="panel-title"><h2>Análisis Garmin</h2><span class="pill">Demo importada</span></div>
    <div class="garmin-score ${color}"><strong>${compliance}%</strong><span>cumplimiento plan vs real</span></div>
    <div class="compare-grid"><div><small>Plan</small><b>${plannedDuration} min</b></div><div><small>Real</small><b>${g.duration} min</b></div><div><small>Diferencia</small><b>${diff>=0?'+':''}${diff} min</b></div></div>
    <div class="item"><b>${g.distance} km · ${g.duration} min · +${g.elevation} m</b></div><div class="item">Potencia media ${g.avgPower}W · NP ${g.np}W · Cadencia ${g.cadence} rpm</div><div class="item">FC media ${g.avgHr} · FC máx ${g.maxHr}</div><div class="item">${zoneText}</div><div class="item">${msg}</div></section>`;
}

function bindCommon(){
  document.querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => { state.role=b.dataset.role; save(); render(); }));
  document.querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => { state.page=b.dataset.page; save(); render(); }));
  document.querySelectorAll('[data-calendar-mode]').forEach(b => b.addEventListener('click', () => { state.calendarMode=b.dataset.calendarMode; save(); render(); }));
  document.querySelector('#logout')?.addEventListener('click',()=>{ state.session=null; save(); renderLogin(); });
  document.querySelector('#resetDemo')?.addEventListener('click',()=>{ localStorage.removeItem(STORE_KEY); state=structuredClone(DEFAULT_STATE); state.session={email:'k@demo.local',loginAt:new Date().toISOString()}; state.page='dashboard'; state.modalDay=null; save(); render(); });
  document.querySelectorAll('[data-day]').forEach(d => d.addEventListener('click', e => { state.selectedDay=Number(d.dataset.day); state.modalDay=Number(d.dataset.day); save(); render(); }));
  document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', e => { if(e.target.dataset.closeModal || e.currentTarget.dataset.closeModal){ state.modalDay=null; save(); render(); } }));
  document.querySelectorAll('[data-athlete]').forEach(b => b.addEventListener('click',()=>{ state.selectedAthleteId=b.dataset.athlete; save(); render(); }));
  document.querySelector('#profileForm')?.addEventListener('submit', e => { e.preventDefault(); const a=currentAthlete(); const f=new FormData(e.currentTarget); ['sport','level','objective','availability','pain'].forEach(k=>a[k]=f.get(k)); ['ftp','maxHr','thresholdHr','weeklyHours','fatigue'].forEach(k=>a[k]=Number(f.get(k)||0)); save(); render(); });
  document.querySelector('#feedbackForm')?.addEventListener('submit', e => { e.preventDefault(); const f=new FormData(e.currentTarget); state.feedback[feedbackKey()]={ rpe:Number(f.get('rpe')||5), fatigue:Number(f.get('fatigue')||5), sleep:Number(f.get('sleep')||7), pain:f.get('pain') || 'No', comment:f.get('comment') || '' }; currentAthlete().fatigue=Number(f.get('fatigue')||currentAthlete().fatigue||5); save(); render(); });
  document.querySelector('#workoutForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    const id = f.get('id');
    const payload = { athleteId:currentAthlete().id, day:Number(f.get('day')), sport:f.get('sport'), title:f.get('title'), duration:Number(f.get('duration')), intensity:f.get('intensity'), status:'planned', source:'manual' };
    if(id){
      const w = state.workouts.find(x=>x.id===id);
      if(w) Object.assign(w, payload);
      state.editingWorkoutId = null;
    } else {
      state.workouts.push({id:uid(), ...payload});
    }
    save(); render();
  });
  document.querySelector('#cancelEdit')?.addEventListener('click',()=>{ state.editingWorkoutId=null; save(); render(); });
  document.querySelectorAll('[data-template]').forEach(b => b.addEventListener('click', () => { const [sport,idx]=b.dataset.template.split(':'); const t=(TEMPLATES[sport]||[])[Number(idx)]; if(!t) return; state.workouts.push({id:uid(),athleteId:currentAthlete().id,day:state.selectedDay,sport,title:t.title,duration:t.duration,intensity:t.intensity,status:'planned',source:'template'}); save(); render(); }));
  document.querySelectorAll('[data-status]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const w=state.workouts.find(x=>x.id===b.dataset.id); if(w) w.status=b.dataset.status; save(); render(); }));
  document.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); state.editingWorkoutId=b.dataset.edit; state.role='coach'; state.page='dashboard'; state.modalDay=null; save(); render(); }));
  document.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); state.workouts=state.workouts.filter(w=>w.id!==b.dataset.delete); save(); render(); }));
  document.querySelector('#generateWeek')?.addEventListener('click', generateWeekDemo);
  document.querySelector('#duplicateWeek')?.addEventListener('click', duplicateCurrentWeek);
}


function duplicateCurrentWeek(){
  const a=currentAthlete();
  const source = state.workouts.filter(w => w.athleteId===a.id && w.status !== 'imported' && w.day <= 7);
  if(!source.length) return;
  source.forEach(w => state.workouts.push({
    ...w,
    id: uid(),
    day: Math.min(31, Number(w.day)+7),
    title: `Copia · ${w.title}`,
    status: 'planned',
    source: 'duplicated'
  }));
  state.selectedDay = Math.min(31, Number(source[0].day)+7);
  state.calendarMode = 'week';
  save(); render();
}

function generateWeekDemo(){
  const a=currentAthlete();
  const base = a.sport === 'cycling'
    ? [ ['cycling','Z2 resistencia',60,'Z2'], ['cycling','Sweet Spot 3x10',75,'88–92% FTP'], ['strength','Fuerza core',45,'RPE 6'], ['cycling','Fondo controlado',120,'Z2'] ]
    : a.sport === 'running'
      ? [ ['running','Rodaje suave',35,'Z2'], ['strength','Fuerza general',40,'RPE 6'], ['running','Cambios ritmo',45,'Z3'], ['running','Tirada cómoda',60,'Z2'] ]
      : [ [a.sport,'Técnica suave',45,'Baja'], ['strength','Fuerza general',40,'RPE 6'], [a.sport,'Sesión principal',60,'Media'], ['mobility','Movilidad/descarga',30,'Suave'] ];
  const days=[15,17,19,21];
  state.lastAiPlan = base.map((b,i)=>({
    day: days[i], sport: b[0], title: b[1], duration: b[2], intensity: b[3],
    why: a.fatigue >= 8
      ? `Carga contenida por fatiga ${a.fatigue}/10. Prioridad: recuperar sin perder hábito.`
      : `Encaja con objetivo “${a.objective}”, disponibilidad ${a.availability} y volumen máximo ${a.weeklyHours}h/sem.`
  }));
  state.lastAiPlan.forEach(p=> state.workouts.push({id:uid(),athleteId:a.id,day:p.day,sport:p.sport,title:`IA · ${p.title}`,duration:p.duration,intensity:p.intensity,status:'planned',source:'ai-demo'}));
  state.selectedDay=15;
  state.calendarMode='week';
  save(); render();
}

if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
render();

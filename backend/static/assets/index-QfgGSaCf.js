(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=document.querySelector(`#app`),t=`/static/assets/`,n=`${t}dreamina-2026-08-11-9578-REFERENCE IMAGE_ Use as the exact visua....mp4`,r={cabs:[],cab:null,stats:{cabs:0,on_road:0,memories:0,unknown:0},entered:!0,playing:!1,radio:!1,rain:!1,volume:.46,liked:!1,drawer:null,record:null,query:``,submissions:[],pointerX:0,pointerY:0,transition:!1,toast:``,fare:23};function i(e=``){return String(e).replace(/[&<>'"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,"'":`&#39;`,'"':`&quot;`})[e])}async function a(e,t={}){let n=await fetch(e,t);if(!n.ok){let e=`Request failed`;try{e=(await n.json()).detail||e}catch{}throw Error(e)}return n.json()}var o={stats:()=>a(`/api/stats`),cabs:()=>a(`/api/cabs`),cab:e=>a(`/api/cabs/${e}`),random:()=>a(`/api/cabs/random`),memory:(e,t)=>a(`/api/cabs/${e}/memories`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(t)}),submit:e=>a(`/api/submissions`,{method:`POST`,body:e}),submissions:()=>a(`/api/admin/submissions`),approve:e=>a(`/api/admin/submissions/${e}/approve`,{method:`POST`}),reject:e=>a(`/api/admin/submissions/${e}/reject`,{method:`POST`})},s=new class{constructor(){this.ctx=null,this.master=null,this.engine=null,this.engineGain=null,this.engineNoise=null,this.radioNoise=null,this.radioGain=null,this.rainNoise=null,this.rainGain=null,this.cityNoise=null,this.cityGain=null,this.volume=r.volume}ensure(){return this.ctx||(this.ctx=new(window.AudioContext||window.webkitAudioContext),this.master=this.ctx.createGain(),this.master.gain.value=this.volume,this.master.connect(this.ctx.destination)),this.ctx.state===`suspended`&&this.ctx.resume(),this.ctx}setVolume(e){this.volume=e,this.master&&this.master.gain.setTargetAtTime(e,this.ctx.currentTime,.04)}noiseBuffer(e=2){let t=this.ensure(),n=t.createBuffer(1,t.sampleRate*e,t.sampleRate),r=n.getChannelData(0);for(let e=0;e<r.length;e++)r[e]=Math.random()*2-1;return n}startEngine(){let e=this.ensure();if(this.engine)return;let t=e.createOscillator(),n=e.createGain(),r=e.createBiquadFilter();t.type=`sawtooth`,t.frequency.value=44,r.type=`lowpass`,r.frequency.value=180,n.gain.value=.045,t.connect(r).connect(n).connect(this.master),t.start(),this.engine=t,this.engineGain=n;let i=e.createBufferSource(),a=e.createGain(),o=e.createBiquadFilter();i.buffer=this.noiseBuffer(2),i.loop=!0,o.type=`bandpass`,o.frequency.value=90,o.Q.value=.9,a.gain.value=.022,i.connect(o).connect(a).connect(this.master),i.start(),this.engineNoise=i;let s=e.createBufferSource(),c=e.createBiquadFilter(),l=e.createGain();s.buffer=this.noiseBuffer(3),s.loop=!0,c.type=`lowpass`,c.frequency.value=1200,l.gain.value=.008,s.connect(c).connect(l).connect(this.master),s.start(),this.cityNoise=s,this.cityGain=l}stopEngine(){if(!this.ctx||!this.engine)return;let e=this.ctx.currentTime;this.engineGain.gain.setTargetAtTime(1e-4,e,.09),setTimeout(()=>{try{this.engine?.stop()}catch{}try{this.engineNoise?.stop()}catch{}try{this.cityNoise?.stop()}catch{}this.engine=null,this.engineNoise=null,this.cityNoise=null},350)}setRadio(e){let t=this.ensure();if(e&&!this.radioNoise){let e=t.createBufferSource(),n=t.createBiquadFilter(),r=t.createGain();e.buffer=this.noiseBuffer(2),e.loop=!0,n.type=`bandpass`,n.frequency.value=1550,n.Q.value=.7,r.gain.value=.032,e.connect(n).connect(r).connect(this.master),e.start(),this.radioNoise=e,this.radioGain=r,this.radioSweep()}else if(!e&&this.radioNoise){try{this.radioNoise.stop()}catch{}this.radioNoise=null}}radioSweep(){if(!this.radioGain||!this.ctx)return;let e=this.ctx.currentTime;this.radioGain.gain.cancelScheduledValues(e),this.radioGain.gain.setValueAtTime(.012,e),this.radioGain.gain.linearRampToValueAtTime(.04,e+.17),this.radioGain.gain.linearRampToValueAtTime(.018,e+.45)}setRain(e){let t=this.ensure();if(e&&!this.rainNoise){let e=t.createBufferSource(),n=t.createBiquadFilter(),r=t.createGain();e.buffer=this.noiseBuffer(3),e.loop=!0,n.type=`highpass`,n.frequency.value=2700,r.gain.value=.027,e.connect(n).connect(r).connect(this.master),e.start(),this.rainNoise=e,this.rainGain=r}else if(!e&&this.rainNoise){try{this.rainNoise.stop()}catch{}this.rainNoise=null}}click(){let e=this.ensure(),t=e.createOscillator(),n=e.createGain();t.type=`square`,t.frequency.value=120,n.gain.setValueAtTime(.12,e.currentTime),n.gain.exponentialRampToValueAtTime(1e-4,e.currentTime+.06),t.connect(n).connect(this.master),t.start(),t.stop(e.currentTime+.07)}meter(){let e=this.ensure();[0,.06].forEach((t,n)=>{let r=e.createOscillator(),i=e.createGain();r.type=`square`,r.frequency.value=n?740:510,i.gain.setValueAtTime(.06,e.currentTime+t),i.gain.exponentialRampToValueAtTime(1e-4,e.currentTime+t+.025),r.connect(i).connect(this.master),r.start(e.currentTime+t),r.stop(e.currentTime+t+.03)})}horn(){let e=this.ensure();[318,392].forEach((t,n)=>{let r=e.createOscillator(),i=e.createGain();r.type=`sawtooth`,r.frequency.value=t,i.gain.setValueAtTime(1e-4,e.currentTime),i.gain.exponentialRampToValueAtTime(n?.07:.09,e.currentTime+.025),i.gain.setValueAtTime(n?.07:.09,e.currentTime+.3),i.gain.exponentialRampToValueAtTime(1e-4,e.currentTime+.43),r.connect(i).connect(this.master),r.start(),r.stop(e.currentTime+.45)})}door(){let e=this.ensure(),t=e.createBufferSource(),n=e.createBiquadFilter(),r=e.createGain();t.buffer=this.noiseBuffer(.16),n.type=`lowpass`,n.frequency.value=720,r.gain.value=.2,t.connect(n).connect(r).connect(this.master),t.start(),t.stop(e.currentTime+.16)}},c=null,l=null,u=0,d=[];function f(e){r.toast=e,w(),clearTimeout(f.timer),f.timer=setTimeout(()=>{r.toast=``,w()},1900)}async function p(e){if(!e)return null;try{return await o.cab(e.id)}catch{return e}}function m(){clearInterval(l),l=setInterval(()=>{if(!r.playing)return;r.fare=Math.round((r.fare+.5)*100)/100;let e=document.querySelector(`.live-meter b`);e&&(e.textContent=r.fare.toFixed(2))},2200)}function h(){clearInterval(l),l=null}function g(){d.forEach(clearTimeout),d=[];let e=++u,t=[...document.querySelectorAll(`.hero-video`)];if(t.length!==2)return;let n=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;if(t[0].classList.add(`is-active`),n){t[0].pause();return}let r=0,i=(t,n)=>{let r=setTimeout(()=>{e===u&&t()},n);d.push(r)},a=e=>{let n=Number.isFinite(e.duration)?e.duration:7.1,o=Math.max(.4,n-e.currentTime-.7);i(()=>{let e=+(r===0),n=t[r],o=t[e];o.currentTime=0,o.play().catch(()=>{}),requestAnimationFrame(()=>o.classList.add(`is-entering`)),i(()=>{n.pause(),n.currentTime=0,n.classList.remove(`is-active`),o.classList.remove(`is-entering`),o.classList.add(`is-active`),r=e,a(o)},720)},o*1e3)},o=t[0];o.currentTime=0,o.play().catch(()=>{}),o.readyState>=1?a(o):o.addEventListener(`loadedmetadata`,()=>a(o),{once:!0})}async function _(e=1,t=!1){if(!r.transition){r.transition=!0,w(),s.click(),await new Promise(e=>setTimeout(e,260));try{let n;if(t)n=await o.random();else{let t=Math.max(0,r.cabs.findIndex(e=>e.id===r.cab?.id));n=r.cabs[(t+e+r.cabs.length)%r.cabs.length],n=await p(n)}r.cab=n,r.fare=23}finally{r.transition=!1,w()}}}function v(e){r.playing=e,e?(s.startEngine(),s.meter(),m()):(s.stopEngine(),h()),w()}function y(){r.rain=!r.rain,s.setRain(r.rain),w()}function b(){r.radio=!r.radio,s.setRadio(r.radio),w()}function x(e){r.drawer=e,w()}function S(){r.drawer=null,r.record=null,w()}function C(){r.entered=!0,s.door(),setTimeout(()=>v(!0),180),w()}function w(){if(c&&=(c.destroy(),null),!r.cab){e.innerHTML=`<div class="boot-screen"><div class="boot-dot"></div><p>Warming the meter…</p></div>`;return}r.cab,e.innerHTML=`
    <main class="home-shell ${r.playing?`sound-on`:``}">
      <section class="motion-hero" aria-label="View from inside a Kolkata Ambassador taxi">
        <div class="hero-media" aria-hidden="true">
          <video class="hero-video" src="${n}" poster="${t}howrah-ride.webp" muted playsinline preload="auto"></video>
          <video class="hero-video" src="${n}" muted playsinline preload="auto"></video>
          <div class="hero-shade"></div>
        </div>

        <header class="hero-title">
          <h1>METER DOWN</h1>
          <button data-action="about" aria-label="About Meter Down">KOLKATA / WEST BENGAL</button>
        </header>

        <div class="track-card" aria-live="polite">
          <p>Ei Poth Jodi Na Shesh Hoy</p>
          <span>Hemanta Mukherjee</span>
        </div>

        <nav class="hero-controls" aria-label="Ride controls">
          <button data-action="prev" aria-label="Previous taxi">◀</button>
          <button data-action="play" class="sound-toggle" aria-label="${r.playing?`Turn ambience off`:`Turn ambience on`}"><span></span></button>
          <button data-action="next" aria-label="Next taxi">▶</button>
        </nav>

        <footer class="hero-footer">
          <button data-action="radio" class="radio-label ${r.radio?`is-on`:``}">RADIO CALCUTTA</button>
          <button data-action="archive" class="riding-count" aria-label="Open the archive">${String(r.stats.cabs).padStart(2,`0`)} RIDING</button>
        </footer>

        ${r.transition?`<div class="cab-transition"><span>METER DOWN</span></div>`:``}
      </section>
      ${r.toast?`<div class="toast">${i(r.toast)}</div>`:``}
    </main>
    ${T()}
  `,g()}function T(){return r.drawer?r.drawer===`archive`?D():r.drawer===`record`?O(r.record||r.cab):r.drawer===`about`?k():r.drawer===`submit`?A():r.drawer===`memory`?j():r.drawer===`desk`?M():``:``}function E(e,t=``){return`<div class="drawer-backdrop" data-action="close"><aside class="drawer ${t}" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><button class="drawer-close" data-action="close" aria-label="Close">×</button>${e}</aside></div>`}function D(){let e=r.query.trim().toLowerCase(),t=r.cabs.filter(t=>!e||[t.registration,t.nickname,t.driver_name,t.neighbourhood,t.status].filter(Boolean).join(` `).toLowerCase().includes(e));return E(`
    <header class="drawer-head archive-title"><p>THE REGISTER</p><h2>${String(r.stats.cabs).padStart(2,`0`)} YELLOW CABS</h2><span>Prototype records are fictional until replaced with verified field documentation.</span></header>
    <div class="register-search"><input id="archive-search" value="${i(r.query)}" placeholder="plate, driver, neighbourhood…" autocomplete="off" /><button data-action="submit">ADD A TAXI +</button></div>
    <div class="register-list">
      ${t.map(e=>`<button class="register-row" data-cab-id="${e.id}">
        <span class="register-number">${i(e.registration)}</span>
        <span class="register-place">${i(e.neighbourhood||`Kolkata`)}</span>
        <span class="register-status status-${String(e.status).toLowerCase().replaceAll(` `,`-`)}">${i(e.status)}</span>
        <span class="register-year">${i(e.last_seen_year||`—`)}</span>
        <i>→</i>
      </button>`).join(``)||`<div class="empty-register">No taxi matches that search.</div>`}
    </div>
    <footer class="drawer-foot"><span>${r.stats.memories} memories preserved</span><button data-action="desk">FIELD DESK</button></footer>
  `,`archive-drawer`)}function O(e){let t=e.memories||[];return E(`
    <div class="record-paper">
      <header class="record-header">
        <div><p>YELLOW TAXI REGISTER / ${String(e.id).padStart(4,`0`)}</p><h2>${i(e.registration)}</h2><span>${i(e.nickname||`Ambassador`)}</span></div>
        <div class="record-stamp ${e.verified?`verified`:`unverified`}">${e.verified?`ARCHIVE COPY`:`UNVERIFIED FIELD NOTE`}</div>
      </header>
      <div class="record-rule"></div>
      <section class="record-lead">
        <div class="record-status"><span>STATUS</span><b>${i(e.status||`UNKNOWN`)}</b><small>${i(e.status_date||``)}</small></div>
        <blockquote>“${i(e.quote||`The record is still being assembled.`)}”</blockquote>
      </section>
      <section class="record-grid">
        <dl>
          <dt>MODEL</dt><dd>${i(e.variant||`Hindustan Ambassador`)}</dd>
          <dt>YEAR</dt><dd>${i(e.model_year||`Unknown`)}</dd>
          <dt>FUEL</dt><dd>${i(e.fuel||`Unknown`)}</dd>
          <dt>DRIVER</dt><dd>${i(e.driver_name||`Unknown`)}</dd>
          <dt>STAND</dt><dd>${i(e.taxi_stand||`Unknown`)}</dd>
          <dt>TERRITORY</dt><dd>${i(e.neighbourhood||`Kolkata`)}</dd>
          <dt>ODOMETER</dt><dd>${e.odometer_km?Number(e.odometer_km).toLocaleString()+` km`:`Unrecorded`}</dd>
        </dl>
        <div class="record-story"><h3>FIELD NOTE</h3><p>${i(e.story||`No narrative has been attached to this record yet.`)}</p></div>
      </section>
      <section class="record-timeline">
        <div><span>${i(e.first_seen_year||e.model_year||`—`)}</span><small>FIRST DOCUMENTED</small></div><i></i>
        <div><span>${i(e.last_seen_year||`—`)}</span><small>LAST DOCUMENTED</small></div><i></i>
        <div><span>${i(e.status||`UNKNOWN`)}</span><small>CURRENT RECORD</small></div>
      </section>
      <section class="memory-section">
        <header><div><p>PASSENGER MEMORY</p><h3>${t.length?`${t.length} ${t.length===1?`MEMORY`:`MEMORIES`}`:`NO MEMORIES YET`}</h3></div><button data-action="memory">I REMEMBER THIS TAXI +</button></header>
        <div class="memory-stack">${t.map(e=>`<article><p>“${i(e.memory)}”</p><span>${i(e.author_name)}${e.year?` · ${e.year}`:``}</span></article>`).join(``)||`<p class="empty-memory">If you knew this taxi, this is where the story begins.</p>`}</div>
      </section>
    </div>
  `,`record-drawer`)}function k(){return E(`
    <header class="drawer-head"><p>ABOUT METER DOWN</p><h2>BEFORE THE LAST ONE DISAPPEARS.</h2></header>
    <section class="about-copy">
      <p>Meter Down is conceived as an animated field archive for Kolkata's yellow Ambassador taxis: individual cars, drivers, sightings, sounds and passenger memories — preserved as historical objects rather than flattened into generic nostalgia.</p>
      <p>The public surface is intentionally sparse. The city and the cab come first. The register sits underneath it.</p>
      <div class="about-principles">
        <div><span>01</span><b>THE CAB IS THE INTERFACE.</b><p>Meter, plate, radio, windscreen and steering wheel become navigation.</p></div>
        <div><span>02</span><b>MEMORY NEEDS PROVENANCE.</b><p>Community submissions remain field notes until reviewed.</p></div>
        <div><span>03</span><b>THE CITY SHOULD BREATHE.</b><p>Animation stays restrained: engine tremor, rain, haze, meter clicks and distant traffic.</p></div>
      </div>
      <div class="about-actions"><button data-action="archive">OPEN THE REGISTER</button><button data-action="submit">ADD A TAXI</button><button data-action="desk">FIELD DESK</button></div>
      <small>LOCAL PROTOTYPE · DEMO DATA IS FICTIONAL · REPLACE WITH VERIFIED FIELD RECORDS BEFORE PUBLIC LAUNCH.</small>
    </section>
  `,`about-drawer`)}function A(){return E(`
    <header class="drawer-head"><p>FIELD NOTE / NEW TAXI</p><h2>ADD A TAXI.</h2><span>Nothing becomes historical fact automatically. Every submission enters the Field Desk first.</span></header>
    <form id="taxi-form" class="field-form">
      <div class="form-grid"><label>REGISTRATION<input name="registration" placeholder="WB 04 …" /></label><label>DRIVER NAME<input name="driver_name" /></label></div>
      <div class="form-grid"><label>APPROXIMATE YEAR<input name="approximate_year" placeholder="e.g. 2008 / seen in 2017" /></label><label>USUAL LOCATION<input name="usual_location" placeholder="Howrah, Gariahat, College Street…" /></label></div>
      <label>WHAT HAPPENED TO IT?<select name="status"><option value="WHEREABOUTS UNKNOWN">Whereabouts unknown</option><option value="ON THE ROAD">Still on the road</option><option value="RETIRED">Retired</option><option value="SCRAPPED">Scrapped</option><option value="RESTORED">Restored</option></select></label>
      <label>WHAT DO YOU REMEMBER?<textarea name="memory" rows="5" placeholder="A driver, a route, a sound, a dent, a photograph, a last sighting…"></textarea></label>
      <label>PHOTOGRAPH<input type="file" name="photo" accept="image/jpeg,image/png,image/webp" /></label>
      <div class="form-grid"><label>YOUR NAME<input name="submitter_name" /></label><label>EMAIL<input name="email" type="email" /></label></div>
      <label class="checkline"><input type="checkbox" name="consent" value="true" /> I have the right to submit this material and understand it may be reviewed for inclusion in the archive.</label>
      <div id="form-error" class="form-error" hidden></div>
      <button class="field-submit" type="submit">SEND TO FIELD DESK <span>→</span></button>
    </form>
  `,`form-drawer`)}function j(){return E(`
    <header class="drawer-head"><p>PASSENGER MEMORY / ${i((r.record||r.cab).registration)}</p><h2>I REMEMBER THIS TAXI.</h2></header>
    <form id="memory-form" class="field-form">
      <label>YOUR NAME<input name="author_name" required maxlength="80" placeholder="Name or Anonymous" /></label>
      <label>YEAR <input name="year" type="number" min="1900" max="2100" placeholder="optional" /></label>
      <label>MEMORY<textarea name="memory" rows="7" required maxlength="1200" placeholder="What do you remember?"></textarea></label>
      <div id="form-error" class="form-error" hidden></div>
      <button class="field-submit" type="submit">PRESERVE THIS MEMORY <span>→</span></button>
    </form>
  `,`form-drawer memory-drawer`)}function M(){let e=r.submissions.filter(e=>e.moderation_status===`PENDING`),t=r.submissions.filter(e=>e.moderation_status!==`PENDING`),n=e=>e.map(e=>`<article class="desk-row">
    <div><span class="desk-id">FIELD NOTE ${String(e.id).padStart(4,`0`)}</span><h3>${i(e.registration||`UNIDENTIFIED TAXI`)}</h3><p>${i(e.memory||`No written memory.`)}</p><div class="desk-meta"><span>${i(e.driver_name||`driver unknown`)}</span><span>${i(e.usual_location||`location unknown`)}</span><span>${i(e.status||`status unknown`)}</span></div></div>
    <aside><b>${i(e.moderation_status)}</b>${e.moderation_status===`PENDING`?`<button data-approve="${e.id}">APPROVE →</button><button class="reject" data-reject="${e.id}">REJECT</button>`:``}</aside>
  </article>`).join(``);return E(`
    <header class="drawer-head"><p>LOCAL ARCHIVIST VIEW</p><h2>FIELD DESK.</h2><span>This prototype desk has no authentication. Put it behind admin auth before deployment.</span></header>
    <section class="desk-section"><div class="desk-section-head"><h3>PENDING</h3><span>${e.length}</span></div>${n(e)||`<p class="empty-memory">No pending field notes.</p>`}</section>
    <section class="desk-section processed"><div class="desk-section-head"><h3>PROCESSED</h3><span>${t.length}</span></div>${n(t)||`<p class="empty-memory">Nothing processed yet.</p>`}</section>
  `,`desk-drawer`)}async function N(e){r.record=await o.cab(e||r.cab.id),r.drawer=`record`,w()}async function P(){r.submissions=await o.submissions(),r.drawer=`desk`,w()}e.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-action], [data-cab-id], [data-approve], [data-reject]`);if(t){if(t.dataset.cabId){await N(Number(t.dataset.cabId));return}if(t.dataset.approve){try{await o.approve(Number(t.dataset.approve)),r.cabs=await o.cabs(),r.stats=await o.stats(),await P(),f(`Field note promoted to archive.`)}catch(e){f(e.message)}return}if(t.dataset.reject){try{await o.reject(Number(t.dataset.reject)),await P(),f(`Field note rejected.`)}catch(e){f(e.message)}return}switch(t.dataset.action){case`enter`:C();break;case`play`:v(!r.playing);break;case`next`:await _(1);break;case`prev`:await _(-1);break;case`shuffle`:await _(1,!0);break;case`rain`:y();break;case`radio`:b();break;case`horn`:s.horn(),f(`Kolkata answers back.`);break;case`like`:r.liked=!r.liked,s.click(),w();break;case`archive`:x(`archive`);break;case`about`:x(`about`);break;case`submit`:x(`submit`);break;case`record`:await N(r.cab.id);break;case`memory`:x(`memory`);break;case`desk`:await P();break;case`close`:S()}}}),e.addEventListener(`input`,e=>{if(e.target.matches(`[data-action="volume"]`)&&(r.volume=Number(e.target.value),s.setVolume(r.volume)),e.target.id===`archive-search`){r.query=e.target.value;let t=e.target.selectionStart;w();let n=document.querySelector(`#archive-search`);n?.focus(),n&&n.setSelectionRange(t,t)}}),e.addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,n=t.querySelector(`#form-error`);try{if(t.id===`taxi-form`){let e=new FormData(t);t.querySelector(`[name="consent"]`).checked||e.set(`consent`,`false`),await o.submit(e),S(),f(`Field note received. It is waiting at the Field Desk.`)}if(t.id===`memory-form`){let e=new FormData(t),n={author_name:e.get(`author_name`)||`Anonymous`,memory:e.get(`memory`),year:e.get(`year`)?Number(e.get(`year`)):null},i=r.record||r.cab;await o.memory(i.id,n),r.record=await o.cab(i.id),r.drawer=`record`,r.stats=await o.stats(),w(),f(`Memory preserved.`)}}catch(e){n&&(n.hidden=!1,n.textContent=e.message)}}),window.addEventListener(`keydown`,async e=>{if(e.key===`Escape`&&r.drawer){S();return}r.drawer||!r.entered||(e.code===`Space`?(e.preventDefault(),v(!r.playing)):e.key===`ArrowRight`?await _(1):e.key===`ArrowLeft`?await _(-1):e.key.toLowerCase()===`r`?y():e.key.toLowerCase()===`h`?s.horn():e.key.toLowerCase()===`a`&&x(`archive`))}),window.addEventListener(`pointermove`,e=>{if(window.matchMedia(`(prefers-reduced-motion: reduce)`).matches)return;let t=(e.clientX/window.innerWidth-.5)*2,n=(e.clientY/window.innerHeight-.5)*2;r.pointerX=t*-5,r.pointerY=n*-3,document.documentElement.style.setProperty(`--pointer-x`,`${r.pointerX}px`),document.documentElement.style.setProperty(`--pointer-y`,`${r.pointerY}px`)}),(async function(){try{[r.stats,r.cabs,r.cab]=await Promise.all([o.stats(),o.cabs(),o.random()]),r.liked=localStorage.getItem(`meter-down-liked`)===`1`,w()}catch(t){e.innerHTML=`<div class="fatal"><h1>METER DOWN</h1><p>The archive could not start.</p><pre>${i(t.message)}</pre></div>`}})(),window.addEventListener(`beforeunload`,()=>localStorage.setItem(`meter-down-liked`,r.liked?`1`:`0`));
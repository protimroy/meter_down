const app = document.querySelector('#app');
const assetBase = `${import.meta.env.BASE_URL}assets/`;
const heroVideoSrc = `${assetBase}dreamina-2026-08-11-9578-REFERENCE IMAGE_ Use as the exact visua....mp4`;
const tracks = [
  // § 1 — Classic Soul of Calcutta
  { videoId: 'eygaFCOGxCY', title: 'Coffee Houser Sei Addata', artist: 'Manna Dey' },
  { videoId: 'by_XxT68yb0', title: 'Ami Je Ke Tomar', artist: 'Kishore Kumar' },
  { videoId: 'YFpxILBZUhg', title: 'Ei Poth Jodi Na Shesh Hoy', artist: 'Hemanta Mukherjee & Sandhya Mukherjee' },
  { videoId: 'cUBxx0V9R_k', title: 'Muchhe Jaoa Dinguli', artist: 'Hemanta Mukherjee' },
  { videoId: 'ZCjH6-44tRo', title: 'Purano Sei Diner Kotha', artist: 'Saswati Sen' },
  { videoId: 'VaxT-5zDcuk', title: 'Tui Phele Esechhis Kare', artist: 'Hemanta Mukhopadhyay' },
  { videoId: 'Qk5j8gF74mc', title: 'Amar Ar Hobe Na Deri', artist: 'Hemanta Mukhopadhyay' },
  { videoId: 'YmIhZCNXfJE', title: 'Kolkata', artist: 'Anupam Roy & Shreya Ghoshal' },

  // § 2 — Monsoon & Modern Indie
  { videoId: 'vYsfSlEBh5Y', title: 'Amake Amar Moto Thakte Dao', artist: 'Anupam Roy' },
  { videoId: 'SkvlY11xHeE', title: 'Ekhon Onek Raat', artist: 'Anupam Roy' },
  { videoId: 'wMpRQDek2ag', title: 'Jawl Phoring', artist: 'Silajit Majumder' },
  { videoId: '_B22nO_9s7U', title: 'Tomar Shawhore', artist: 'Anjan Dutt' },
  { videoId: 'stKRz6hTqZY', title: 'Kolkata (Lyrical)', artist: 'Anupam Roy & Shreya Ghoshal' },

  // § 3 — Late-Night Neon Drive (Bollywood Retro)
  { videoId: 'qOkE3ekdaco', title: 'Ek Pyar Ka Nagma Hai', artist: 'Lata Mangeshkar & Mukesh' },
  { videoId: 'b1kgB6yIHUw', title: 'Chalte Chalte In Rahon Par', artist: 'Kishore Kumar' },
  { videoId: 'JQoSSJDZxOo', title: 'Rimjhim Gire Sawan', artist: 'Kishore Kumar' },
  { videoId: 'xkl1QwNEuYs', title: 'Pyar Hua Ikrar Hua', artist: 'Lata Mangeshkar & Manna Dey' },
  { videoId: 'cP44iDZZ_wY', title: 'Zindagi Kaisi Hai Paheli', artist: 'Manna Dey' },
  { videoId: 'g_O5lttb5ww', title: 'Kabhi Kabhie Mere Dil Mein', artist: 'Mukesh' },
  { videoId: '_w14bUcxl1c', title: 'O Mere Dil Ke Chain', artist: 'Kishore Kumar' },
  { videoId: '-Px0efU00uQ', title: 'O Mere Dil Ke Chain (Alt)', artist: 'Kishore Kumar' },

  // § 4 — City Escape (Modern Bollywood & Indie)
  { videoId: 'PGPVZT3Blvs', title: 'Piyu Bole', artist: 'Shreya Ghoshal & Sonu Nigam' },
  { videoId: 'OF688uk3Il0', title: 'Roobaroo', artist: 'Naresh Iyer & A.R. Rahman' },
  { videoId: '-3gQ6HIkRys', title: 'Phir Se Ud Chala', artist: 'Mohit Chauhan' },
  { videoId: '6w67NOaRe-w', title: 'Ilahi', artist: 'Arijit Singh' },
];
let youtubePlayer = null;
let youtubeApiPromise = null;

const state = {
  cabs: [],
  cab: { id: 0, registration: '', status: '' },
  stats: { cabs: 0, on_road: 0, memories: 0, unknown: 0 },
  entered: true,
  playing: false,
  radio: false,
  rain: false,
  volume: 0.46,
  liked: false,
  drawer: null,
  record: null,
  query: '',
  submissions: [],
  pointerX: 0,
  pointerY: 0,
  transition: false,
  toast: '',
  fare: 23.00,
  trackIndex: 0,
};

const statusLabels = {
  'ON THE ROAD': 'ON THE ROAD',
  'RETIRED': 'RETIRED',
  'SCRAPPED': 'SCRAPPED',
  'RESTORED': 'RESTORED',
  'WHEREABOUTS UNKNOWN': 'WHEREABOUTS UNKNOWN',
};

const routeOrigins = ['HOWRAH', 'ESPLANADE', 'COLLEGE STREET', 'GARIAHAT', 'SHYAMBAZAR', 'PARK STREET'];
const moods = ['golden', 'monsoon', 'night', 'dawn', 'amber', 'blue'];

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

async function request(path, options = {}) {
  const response = await fetch(path, options);
  if (!response.ok) {
    let detail = 'Request failed';
    try { detail = (await response.json()).detail || detail; } catch (_) {}
    throw new Error(detail);
  }
  return response.json();
}

const api = {
  stats: () => request('/api/stats'),
  cabs: () => request('/api/cabs'),
  cab: id => request(`/api/cabs/${id}`),
  random: () => request('/api/cabs/random'),
  memory: (id, body) => request(`/api/cabs/${id}/memories`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body),
  }),
  submit: formData => request('/api/submissions', { method: 'POST', body: formData }),
  submissions: () => request('/api/admin/submissions'),
  approve: id => request(`/api/admin/submissions/${id}/approve`, { method: 'POST' }),
  reject: id => request(`/api/admin/submissions/${id}/reject`, { method: 'POST' }),
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.engine = null;
    this.engineGain = null;
    this.engineNoise = null;
    this.radioNoise = null;
    this.radioGain = null;
    this.rainNoise = null;
    this.rainGain = null;
    this.cityNoise = null;
    this.cityGain = null;
    this.volume = state.volume;
  }
  ensure() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.04);
  }
  noiseBuffer(seconds = 2) {
    const c = this.ensure();
    const b = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  startEngine() {
    const c = this.ensure();
    if (this.engine) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    const low = c.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = 44;
    low.type = 'lowpass';
    low.frequency.value = 180;
    gain.gain.value = 0.045;
    osc.connect(low).connect(gain).connect(this.master);
    osc.start();
    this.engine = osc;
    this.engineGain = gain;

    const src = c.createBufferSource();
    const ng = c.createGain();
    const nf = c.createBiquadFilter();
    src.buffer = this.noiseBuffer(2);
    src.loop = true;
    nf.type = 'bandpass';
    nf.frequency.value = 90;
    nf.Q.value = 0.9;
    ng.gain.value = 0.022;
    src.connect(nf).connect(ng).connect(this.master);
    src.start();
    this.engineNoise = src;

    const city = c.createBufferSource();
    const cityFilter = c.createBiquadFilter();
    const cityGain = c.createGain();
    city.buffer = this.noiseBuffer(3);
    city.loop = true;
    cityFilter.type = 'lowpass';
    cityFilter.frequency.value = 1200;
    cityGain.gain.value = 0.008;
    city.connect(cityFilter).connect(cityGain).connect(this.master);
    city.start();
    this.cityNoise = city;
    this.cityGain = cityGain;
  }
  stopEngine() {
    if (!this.ctx || !this.engine) return;
    const t = this.ctx.currentTime;
    this.engineGain.gain.setTargetAtTime(0.0001, t, 0.09);
    setTimeout(() => {
      try { this.engine?.stop(); } catch (_) {}
      try { this.engineNoise?.stop(); } catch (_) {}
      try { this.cityNoise?.stop(); } catch (_) {}
      this.engine = null; this.engineNoise = null; this.cityNoise = null;
    }, 350);
  }
  setRadio(on) {
    const c = this.ensure();
    if (on && !this.radioNoise) {
      const src = c.createBufferSource();
      const filter = c.createBiquadFilter();
      const gain = c.createGain();
      src.buffer = this.noiseBuffer(2);
      src.loop = true;
      filter.type = 'bandpass';
      filter.frequency.value = 1550;
      filter.Q.value = 0.7;
      gain.gain.value = 0.032;
      src.connect(filter).connect(gain).connect(this.master);
      src.start();
      this.radioNoise = src;
      this.radioGain = gain;
      this.radioSweep();
    } else if (!on && this.radioNoise) {
      try { this.radioNoise.stop(); } catch (_) {}
      this.radioNoise = null;
    }
  }
  radioSweep() {
    if (!this.radioGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.radioGain.gain.cancelScheduledValues(t);
    this.radioGain.gain.setValueAtTime(0.012, t);
    this.radioGain.gain.linearRampToValueAtTime(0.04, t + 0.17);
    this.radioGain.gain.linearRampToValueAtTime(0.018, t + 0.45);
  }
  setRain(on) {
    const c = this.ensure();
    if (on && !this.rainNoise) {
      const src = c.createBufferSource();
      const filter = c.createBiquadFilter();
      const gain = c.createGain();
      src.buffer = this.noiseBuffer(3);
      src.loop = true;
      filter.type = 'highpass';
      filter.frequency.value = 2700;
      gain.gain.value = 0.027;
      src.connect(filter).connect(gain).connect(this.master);
      src.start();
      this.rainNoise = src;
      this.rainGain = gain;
    } else if (!on && this.rainNoise) {
      try { this.rainNoise.stop(); } catch (_) {}
      this.rainNoise = null;
    }
  }
  click() {
    const c = this.ensure();
    const osc = c.createOscillator(), gain = c.createGain();
    osc.type = 'square'; osc.frequency.value = 120;
    gain.gain.setValueAtTime(0.12, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.06);
    osc.connect(gain).connect(this.master); osc.start(); osc.stop(c.currentTime + 0.07);
  }
  meter() {
    const c = this.ensure();
    [0, .06].forEach((offset, i) => {
      const osc = c.createOscillator(), gain = c.createGain();
      osc.type = 'square'; osc.frequency.value = i ? 740 : 510;
      gain.gain.setValueAtTime(.06, c.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(.0001, c.currentTime + offset + .025);
      osc.connect(gain).connect(this.master); osc.start(c.currentTime + offset); osc.stop(c.currentTime + offset + .03);
    });
  }
  horn() {
    const c = this.ensure();
    [318, 392].forEach((freq, i) => {
      const osc = c.createOscillator(), gain = c.createGain();
      osc.type = 'sawtooth'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(i ? .07 : .09, c.currentTime + .025);
      gain.gain.setValueAtTime(i ? .07 : .09, c.currentTime + .3);
      gain.gain.exponentialRampToValueAtTime(.0001, c.currentTime + .43);
      osc.connect(gain).connect(this.master); osc.start(); osc.stop(c.currentTime + .45);
    });
  }
  door() {
    const c = this.ensure();
    const src = c.createBufferSource(), filter = c.createBiquadFilter(), gain = c.createGain();
    src.buffer = this.noiseBuffer(.16); filter.type = 'lowpass'; filter.frequency.value = 720; gain.gain.value = .2;
    src.connect(filter).connect(gain).connect(this.master); src.start(); src.stop(c.currentTime + .16);
  }
}

const audio = new AudioEngine();

class RainField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.drops = [];
    this.running = false;
    this.raf = null;
    this.resize = this.resize.bind(this);
    this.frame = this.frame.bind(this);
    this.resize();
    window.addEventListener('resize', this.resize);
  }
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.floor(rect.width * rect.height / 8000);
    this.drops = Array.from({length: count}, () => this.makeDrop(rect));
  }
  makeDrop(rect) {
    return { x: Math.random()*rect.width, y: Math.random()*rect.height, len: 7+Math.random()*22, speed: 5+Math.random()*10, alpha:.12+Math.random()*.26 };
  }
  start() { if (this.running) return; this.running = true; this.frame(); }
  stop() { this.running = false; if (this.raf) cancelAnimationFrame(this.raf); this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); }
  destroy() { this.stop(); window.removeEventListener('resize', this.resize); }
  frame() {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0,0,rect.width,rect.height);
    this.ctx.lineWidth = 1;
    for (const d of this.drops) {
      this.ctx.strokeStyle = `rgba(225,234,224,${d.alpha})`;
      this.ctx.beginPath(); this.ctx.moveTo(d.x,d.y); this.ctx.lineTo(d.x-2,d.y+d.len); this.ctx.stroke();
      d.y += d.speed; d.x -= .18*d.speed;
      if (d.y > rect.height+30) { d.y = -30; d.x = Math.random()*rect.width; }
    }
    this.raf = requestAnimationFrame(this.frame);
  }
}

let rainField = null;
let fareTimer = null;
let heroLoopGeneration = 0;
let heroLoopTimers = [];

function cabRoute(cab) {
  if (!cab) return 'HOWRAH → KOLKATA';
  const origin = routeOrigins[(cab.id || 0) % routeOrigins.length];
  const destination = (cab.neighbourhood || 'KOLKATA').toUpperCase();
  return origin === destination ? `HOWRAH → ${destination}` : `${origin} → ${destination}`;
}

function moodForCab(cab) { return moods[(cab?.id || 0) % moods.length]; }

function setToast(message) {
  state.toast = message;
  render();
  clearTimeout(setToast.timer);
  setToast.timer = setTimeout(() => { state.toast = ''; render(); }, 1900);
}

async function hydrateCab(cab) {
  if (!cab) return null;
  try { return await api.cab(cab.id); } catch (_) { return cab; }
}

function startFare() {
  clearInterval(fareTimer);
  fareTimer = setInterval(() => {
    if (!state.playing) return;
    state.fare = Math.round((state.fare + 0.5) * 100) / 100;
    const display = document.querySelector('.live-meter b');
    if (display) display.textContent = state.fare.toFixed(2);
  }, 2200);
}
function stopFare() { clearInterval(fareTimer); fareTimer = null; }

function startHeroLoop() {
  heroLoopTimers.forEach(clearTimeout);
  heroLoopTimers = [];
  const generation = ++heroLoopGeneration;
  const videos = [...document.querySelectorAll('.hero-video')];
  if (videos.length !== 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  videos[0].classList.add('is-active');
  if (reducedMotion) {
    videos[0].pause();
    return;
  }

  let activeIndex = 0;
  const queue = (callback, delay) => {
    const timer = setTimeout(() => {
      if (generation === heroLoopGeneration) callback();
    }, delay);
    heroLoopTimers.push(timer);
  };

  const scheduleCrossfade = video => {
    const duration = Number.isFinite(video.duration) ? video.duration : 7.1;
    const remaining = Math.max(0.4, duration - video.currentTime - 0.7);
    queue(() => {
      const nextIndex = activeIndex === 0 ? 1 : 0;
      const current = videos[activeIndex];
      const next = videos[nextIndex];
      next.currentTime = 0;
      next.play().catch(() => {});
      requestAnimationFrame(() => next.classList.add('is-entering'));
      queue(() => {
        current.pause();
        current.currentTime = 0;
        current.classList.remove('is-active');
        next.classList.remove('is-entering');
        next.classList.add('is-active');
        activeIndex = nextIndex;
        scheduleCrossfade(next);
      }, 720);
    }, remaining * 1000);
  };

  const first = videos[0];
  first.currentTime = 0;
  first.play().catch(() => {});
  if (first.readyState >= 1) scheduleCrossfade(first);
  else first.addEventListener('loadedmetadata', () => scheduleCrossfade(first), { once: true });
}

async function nextCab(delta = 1, random = false) {
  if (state.transition) return;
  state.transition = true;
  render();
  audio.click();
  await new Promise(r => setTimeout(r, 260));
  try {
    let target;
    if (random) target = await api.random();
    else {
      const index = Math.max(0, state.cabs.findIndex(c => c.id === state.cab?.id));
      target = state.cabs[(index + delta + state.cabs.length) % state.cabs.length];
      target = await hydrateCab(target);
    }
    state.cab = target;
    state.fare = 23.00;
  } finally {
    state.transition = false;
    render();
  }
}

function setPlaying(on) {
  const button = document.querySelector('[data-action="play"]');
  const radioButton = document.querySelector('[data-action="radio"]');
  if (!button) return;

  state.playing = on;
  state.radio = on;
  if (youtubePlayer?.playVideo) {
    if (on) youtubePlayer.playVideo();
    else youtubePlayer.pauseVideo();
  }

  document.querySelector('.home-shell')?.classList.toggle('sound-on', on);
  const track = tracks[state.trackIndex];
  button.setAttribute('aria-label', `${on ? 'Pause' : 'Play'} ${track.title}`);
  button.title = on ? 'Pause song' : 'Play song';
  radioButton?.classList.toggle('is-on', on);
  radioButton?.setAttribute('aria-label', on ? 'Pause Radio Kolkata' : 'Play Radio Kolkata');
}

function loadTrack(index) {
  state.trackIndex = (index + tracks.length) % tracks.length;
  const track = tracks[state.trackIndex];
  const title = document.querySelector('.track-card p');
  const artist = document.querySelector('.track-card span');
  const playButton = document.querySelector('[data-action="play"]');

  if (title) title.textContent = track.title;
  if (artist) artist.textContent = track.artist;
  playButton?.setAttribute('aria-label', `${state.playing ? 'Pause' : 'Play'} ${track.title}`);

  if (youtubePlayer?.loadVideoById) {
    if (state.playing) youtubePlayer.loadVideoById(track.videoId);
    else youtubePlayer.cueVideoById(track.videoId);
  }
}

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise(resolve => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.append(script);
  });
  return youtubeApiPromise;
}

async function initSongPlayer() {
  const mount = document.querySelector('#youtube-song');
  const button = document.querySelector('[data-action="play"]');
  if (!mount || !button) return;
  const YT = await loadYouTubeApi();
  if (!document.querySelector('#youtube-song')) return;
  youtubePlayer = new YT.Player('youtube-song', {
    width: 640,
    height: 360,
    videoId: tracks[state.trackIndex].videoId,
    playerVars: {
      controls: 0,
      disablekb: 1,
      playsinline: 1,
      rel: 0,
      origin: window.location.origin,
    },
    events: {
      onReady: () => {
        if (state.playing) youtubePlayer.playVideo();
        button.disabled = false;
        button.title = state.playing ? 'Pause song' : 'Play song';
      },
      onStateChange: event => {
        if (event.data === YT.PlayerState.ENDED) loadTrack(state.trackIndex + 1);
      },
      onError: () => {
        // skip unembeddable or unavailable tracks silently
        loadTrack(state.trackIndex + 1);
      },
    },
  });
}

function toggleRain() {
  state.rain = !state.rain;
  audio.setRain(state.rain);
  render();
}

function toggleRadio() {
  setPlaying(!state.playing);
}

function openDrawer(name) { state.drawer = name; render(); }
function closeDrawer() { state.drawer = null; state.record = null; render(); }

function enter() {
  state.entered = true;
  audio.door();
  setTimeout(() => setPlaying(true), 180);
  render();
}

function render() {
  if (rainField) { rainField.destroy(); rainField = null; }
  if (!state.cab) {
    app.innerHTML = `<div class="boot-screen"><div class="boot-dot"></div><p>Warming the meter…</p></div>`;
    return;
  }

  const c = state.cab;
  const track = tracks[state.trackIndex];

  app.innerHTML = `
    <main class="home-shell ${state.playing ? 'sound-on' : ''}">
      <section class="motion-hero" aria-label="View from inside a Kolkata Ambassador taxi">
        <div class="hero-media" aria-hidden="true">
          <video class="hero-video" src="${heroVideoSrc}" poster="${assetBase}howrah-ride.webp" muted playsinline preload="auto"></video>
          <video class="hero-video" src="${heroVideoSrc}" muted playsinline preload="auto"></video>
          <div class="hero-shade"></div>
        </div>

        <header class="hero-title">
          <h1>METER DOWN</h1>
          <button data-action="about" aria-label="About Meter Down">KOLKATA / WEST BENGAL</button>
        </header>

        <div class="track-card" aria-live="polite">
          <p>${esc(track.title)}</p>
          <span>${esc(track.artist)}</span>
        </div>

        <div class="audio-embed" aria-hidden="true">
          <div id="youtube-song"></div>
        </div>

        <nav class="hero-controls" aria-label="Ride controls">
          <button data-action="song-prev" aria-label="Previous song" title="Previous song">◀</button>
          <button data-action="play" class="sound-toggle" aria-label="${state.playing ? 'Pause' : 'Play'} ${esc(track.title)}" title="${state.playing ? 'Pause' : 'Play'} song"><span></span></button>
          <button data-action="song-next" aria-label="Next song" title="Next song">▶</button>
        </nav>

        <footer class="hero-footer">
          <button data-action="radio" class="radio-label ${state.radio ? 'is-on' : ''}">RADIO KOLKATA</button>
          <span class="riding-count">ARCHIVE COMING SOON</span>
        </footer>

        ${state.transition ? '<div class="cab-transition"><span>METER DOWN</span></div>' : ''}
      </section>
      ${state.toast ? `<div class="toast">${esc(state.toast)}</div>` : ''}
    </main>
    ${drawerMarkup()}
  `;
  startHeroLoop();
  initSongPlayer();
}

function drawerMarkup() {
  if (!state.drawer) return '';
  if (state.drawer === 'archive') return archiveDrawer();
  if (state.drawer === 'record') return recordDrawer(state.record || state.cab);
  if (state.drawer === 'about') return aboutDrawer();
  if (state.drawer === 'submit') return submitDrawer();
  if (state.drawer === 'memory') return memoryDrawer();
  if (state.drawer === 'desk') return deskDrawer();
  return '';
}

function drawerShell(inner, cls='') {
  return `<div class="drawer-backdrop"><aside class="drawer ${cls}" role="dialog" aria-modal="true"><button class="drawer-close" data-action="close" aria-label="Close">×</button>${inner}</aside></div>`;
}

function archiveDrawer() {
  const q = state.query.trim().toLowerCase();
  const cabs = state.cabs.filter(c => !q || [c.registration,c.nickname,c.driver_name,c.neighbourhood,c.status].filter(Boolean).join(' ').toLowerCase().includes(q));
  return drawerShell(`
    <header class="drawer-head archive-title"><p>THE REGISTER</p><h2>${String(state.stats.cabs).padStart(2,'0')} YELLOW CABS</h2><span>Prototype records are fictional until replaced with verified field documentation.</span></header>
    <div class="register-search"><input id="archive-search" value="${esc(state.query)}" placeholder="plate, driver, neighbourhood…" autocomplete="off" /><button data-action="submit">ADD A TAXI +</button></div>
    <div class="register-list">
      ${cabs.map(c => `<button class="register-row" data-cab-id="${c.id}">
        <span class="register-number">${esc(c.registration)}</span>
        <span class="register-place">${esc(c.neighbourhood || 'Kolkata')}</span>
        <span class="register-status status-${String(c.status).toLowerCase().replaceAll(' ','-')}">${esc(c.status)}</span>
        <span class="register-year">${esc(c.last_seen_year || '—')}</span>
        <i>→</i>
      </button>`).join('') || '<div class="empty-register">No taxi matches that search.</div>'}
    </div>
    <footer class="drawer-foot"><span>${state.stats.memories} memories preserved</span><button data-action="desk">FIELD DESK</button></footer>
  `, 'archive-drawer');
}

function recordDrawer(c) {
  const memories = c.memories || [];
  return drawerShell(`
    <div class="record-paper">
      <header class="record-header">
        <div><p>YELLOW TAXI REGISTER / ${String(c.id).padStart(4,'0')}</p><h2>${esc(c.registration)}</h2><span>${esc(c.nickname || 'Ambassador')}</span></div>
        <div class="record-stamp ${c.verified ? 'verified' : 'unverified'}">${c.verified ? 'ARCHIVE COPY' : 'UNVERIFIED FIELD NOTE'}</div>
      </header>
      <div class="record-rule"></div>
      <section class="record-lead">
        <div class="record-status"><span>STATUS</span><b>${esc(c.status || 'UNKNOWN')}</b><small>${esc(c.status_date || '')}</small></div>
        <blockquote>“${esc(c.quote || 'The record is still being assembled.')}”</blockquote>
      </section>
      <section class="record-grid">
        <dl>
          <dt>MODEL</dt><dd>${esc(c.variant || 'Hindustan Ambassador')}</dd>
          <dt>YEAR</dt><dd>${esc(c.model_year || 'Unknown')}</dd>
          <dt>FUEL</dt><dd>${esc(c.fuel || 'Unknown')}</dd>
          <dt>DRIVER</dt><dd>${esc(c.driver_name || 'Unknown')}</dd>
          <dt>STAND</dt><dd>${esc(c.taxi_stand || 'Unknown')}</dd>
          <dt>TERRITORY</dt><dd>${esc(c.neighbourhood || 'Kolkata')}</dd>
          <dt>ODOMETER</dt><dd>${c.odometer_km ? Number(c.odometer_km).toLocaleString() + ' km' : 'Unrecorded'}</dd>
        </dl>
        <div class="record-story"><h3>FIELD NOTE</h3><p>${esc(c.story || 'No narrative has been attached to this record yet.')}</p></div>
      </section>
      <section class="record-timeline">
        <div><span>${esc(c.first_seen_year || c.model_year || '—')}</span><small>FIRST DOCUMENTED</small></div><i></i>
        <div><span>${esc(c.last_seen_year || '—')}</span><small>LAST DOCUMENTED</small></div><i></i>
        <div><span>${esc(c.status || 'UNKNOWN')}</span><small>CURRENT RECORD</small></div>
      </section>
      <section class="memory-section">
        <header><div><p>PASSENGER MEMORY</p><h3>${memories.length ? `${memories.length} ${memories.length===1?'MEMORY':'MEMORIES'}` : 'NO MEMORIES YET'}</h3></div><button data-action="memory">I REMEMBER THIS TAXI +</button></header>
        <div class="memory-stack">${memories.map(m => `<article><p>“${esc(m.memory)}”</p><span>${esc(m.author_name)}${m.year ? ` · ${m.year}` : ''}</span></article>`).join('') || '<p class="empty-memory">If you knew this taxi, this is where the story begins.</p>'}</div>
      </section>
    </div>
  `, 'record-drawer');
}

function aboutDrawer() {
  return drawerShell(`
    <header class="drawer-head"><p>ABOUT METER DOWN</p><h2>BEFORE THE LAST ONE DISAPPEARS.</h2></header>
    <section class="about-copy">
      <p>Meter Down is conceived as an animated field archive for Kolkata's yellow Ambassador taxis: individual cars, drivers, sightings, sounds and passenger memories — preserved as historical objects rather than flattened into generic nostalgia.</p>
      <p>This visual preview is intentionally sparse. The city and the cab come first; the public register will return in a later release.</p>
      <div class="about-principles">
        <div><span>01</span><b>THE CAB IS THE INTERFACE.</b><p>Meter, plate, radio, windscreen and steering wheel become navigation.</p></div>
        <div><span>02</span><b>MEMORY NEEDS PROVENANCE.</b><p>Community submissions remain field notes until reviewed.</p></div>
        <div><span>03</span><b>THE CITY SHOULD BREATHE.</b><p>Animation stays restrained: engine tremor, rain, haze, meter clicks and distant traffic.</p></div>
      </div>
      <small>VISUAL PREVIEW · ARCHIVE FEATURES COMING SOON.</small>
    </section>
  `, 'about-drawer');
}

function submitDrawer() {
  return drawerShell(`
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
  `, 'form-drawer');
}

function memoryDrawer() {
  const c = state.record || state.cab;
  return drawerShell(`
    <header class="drawer-head"><p>PASSENGER MEMORY / ${esc(c.registration)}</p><h2>I REMEMBER THIS TAXI.</h2></header>
    <form id="memory-form" class="field-form">
      <label>YOUR NAME<input name="author_name" required maxlength="80" placeholder="Name or Anonymous" /></label>
      <label>YEAR <input name="year" type="number" min="1900" max="2100" placeholder="optional" /></label>
      <label>MEMORY<textarea name="memory" rows="7" required maxlength="1200" placeholder="What do you remember?"></textarea></label>
      <div id="form-error" class="form-error" hidden></div>
      <button class="field-submit" type="submit">PRESERVE THIS MEMORY <span>→</span></button>
    </form>
  `, 'form-drawer memory-drawer');
}

function deskDrawer() {
  const pending = state.submissions.filter(s => s.moderation_status === 'PENDING');
  const processed = state.submissions.filter(s => s.moderation_status !== 'PENDING');
  const rows = items => items.map(s => `<article class="desk-row">
    <div><span class="desk-id">FIELD NOTE ${String(s.id).padStart(4,'0')}</span><h3>${esc(s.registration || 'UNIDENTIFIED TAXI')}</h3><p>${esc(s.memory || 'No written memory.')}</p><div class="desk-meta"><span>${esc(s.driver_name || 'driver unknown')}</span><span>${esc(s.usual_location || 'location unknown')}</span><span>${esc(s.status || 'status unknown')}</span></div></div>
    <aside><b>${esc(s.moderation_status)}</b>${s.moderation_status==='PENDING'?`<button data-approve="${s.id}">APPROVE →</button><button class="reject" data-reject="${s.id}">REJECT</button>`:''}</aside>
  </article>`).join('');
  return drawerShell(`
    <header class="drawer-head"><p>LOCAL ARCHIVIST VIEW</p><h2>FIELD DESK.</h2><span>This prototype desk has no authentication. Put it behind admin auth before deployment.</span></header>
    <section class="desk-section"><div class="desk-section-head"><h3>PENDING</h3><span>${pending.length}</span></div>${rows(pending) || '<p class="empty-memory">No pending field notes.</p>'}</section>
    <section class="desk-section processed"><div class="desk-section-head"><h3>PROCESSED</h3><span>${processed.length}</span></div>${rows(processed) || '<p class="empty-memory">Nothing processed yet.</p>'}</section>
  `, 'desk-drawer');
}

async function openRecord(id) {
  state.record = await api.cab(id || state.cab.id);
  state.drawer = 'record';
  render();
}

async function openDesk() {
  state.submissions = await api.submissions();
  state.drawer = 'desk';
  render();
}

app.addEventListener('click', async event => {
  if (event.target.classList.contains('drawer-backdrop')) {
    closeDrawer();
    return;
  }
  const button = event.target.closest('[data-action], [data-cab-id], [data-approve], [data-reject]');
  if (!button) return;
  if (button.dataset.cabId) { await openRecord(Number(button.dataset.cabId)); return; }
  if (button.dataset.approve) {
    try { await api.approve(Number(button.dataset.approve)); state.cabs = await api.cabs(); state.stats = await api.stats(); await openDesk(); setToast('Field note promoted to archive.'); } catch (e) { setToast(e.message); }
    return;
  }
  if (button.dataset.reject) {
    try { await api.reject(Number(button.dataset.reject)); await openDesk(); setToast('Field note rejected.'); } catch (e) { setToast(e.message); }
    return;
  }
  const action = button.dataset.action;
  switch(action) {
    case 'enter': enter(); break;
    case 'play': setPlaying(!state.playing); break;
    case 'song-prev': loadTrack(state.trackIndex - 1); break;
    case 'song-next': loadTrack(state.trackIndex + 1); break;
    case 'next': await nextCab(1); break;
    case 'prev': await nextCab(-1); break;
    case 'shuffle': await nextCab(1, true); break;
    case 'rain': toggleRain(); break;
    case 'radio': toggleRadio(); break;
    case 'horn': audio.horn(); setToast('Kolkata answers back.'); break;
    case 'like': state.liked = !state.liked; audio.click(); render(); break;
    case 'archive': openDrawer('archive'); break;
    case 'about': openDrawer('about'); break;
    case 'submit': openDrawer('submit'); break;
    case 'record': await openRecord(state.cab.id); break;
    case 'memory': openDrawer('memory'); break;
    case 'desk': await openDesk(); break;
    case 'close': closeDrawer(); break;
  }
});

app.addEventListener('input', event => {
  if (event.target.matches('[data-action="volume"]')) {
    state.volume = Number(event.target.value);
    audio.setVolume(state.volume);
  }
  if (event.target.id === 'archive-search') {
    state.query = event.target.value;
    const pos = event.target.selectionStart;
    render();
    const next = document.querySelector('#archive-search');
    next?.focus(); if (next) next.setSelectionRange(pos,pos);
  }
});

app.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.target;
  const error = form.querySelector('#form-error');
  try {
    if (form.id === 'taxi-form') {
      const fd = new FormData(form);
      if (!form.querySelector('[name="consent"]').checked) fd.set('consent','false');
      await api.submit(fd);
      closeDrawer();
      setToast('Field note received. It is waiting at the Field Desk.');
    }
    if (form.id === 'memory-form') {
      const fd = new FormData(form);
      const body = { author_name: fd.get('author_name') || 'Anonymous', memory: fd.get('memory'), year: fd.get('year') ? Number(fd.get('year')) : null };
      const cab = state.record || state.cab;
      await api.memory(cab.id, body);
      state.record = await api.cab(cab.id);
      state.drawer = 'record';
      state.stats = await api.stats();
      render();
      setToast('Memory preserved.');
    }
  } catch (e) {
    if (error) { error.hidden = false; error.textContent = e.message; }
  }
});

window.addEventListener('keydown', async event => {
  if (event.key === 'Escape' && state.drawer) { closeDrawer(); return; }
  if (state.drawer || !state.entered) return;
  if (event.code === 'Space') { event.preventDefault(); setPlaying(!state.playing); }
});

window.addEventListener('pointermove', event => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const nx = (event.clientX / window.innerWidth - .5) * 2;
  const ny = (event.clientY / window.innerHeight - .5) * 2;
  state.pointerX = nx * -5;
  state.pointerY = ny * -3;
  document.documentElement.style.setProperty('--pointer-x', `${state.pointerX}px`);
  document.documentElement.style.setProperty('--pointer-y', `${state.pointerY}px`);
});

(function init() {
  render();
})();

window.addEventListener('beforeunload', () => localStorage.setItem('meter-down-liked', state.liked ? '1':'0'));

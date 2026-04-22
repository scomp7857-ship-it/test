/* ============================================================
   TRINITY — Matrix descent experience
   Matrix rain + Trinity parallax + Web Audio ambience +
   custom cursor + terminal broadcast + scroll choreography
   ============================================================ */

(() => {
  const doc = document;
  const body = doc.body;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------
  // 1. MATRIX RAIN
  // ------------------------------------------------------------
  const canvas = doc.getElementById('matrix');
  const ctx = canvas.getContext('2d', { alpha: true });

  const GLYPHS =
    'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン'
    + '0123456789ABCDEFｦｧｨｩｪｫｬｭｮｯ#$%&*+=<>?/|\\';

  let cols = 0;
  let drops = [];
  let speeds = [];
  let bright = [];
  const FONT_SIZE = 16;

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(window.innerWidth / FONT_SIZE);
    drops = new Array(cols).fill(0).map(() => Math.random() * -50);
    speeds = new Array(cols).fill(0).map(() => 0.5 + Math.random() * 1.1);
    bright = new Array(cols).fill(0).map(() => Math.random());
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  let tilt = 0;           // horizontal tilt from mouse
  let speedBoost = 0;     // boosted by scroll/audio
  let audioLevel = 0;     // reactive to audio amplitude (0..1)

  function drawMatrix() {
    // translucent wipe to produce trailing glow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
    ctx.textBaseline = 'top';

    const baseSpeed = 0.9 + speedBoost + audioLevel * 1.3;

    for (let i = 0; i < cols; i++) {
      const char = GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);
      const x = i * FONT_SIZE + tilt * (i / cols - 0.5) * 30;
      const y = drops[i] * FONT_SIZE;

      // leading bright character
      if (bright[i] > 0.985) {
        ctx.fillStyle = 'rgba(220,255,230,0.95)';
        ctx.shadowColor = '#17ff7a';
        ctx.shadowBlur = 14;
      } else if (bright[i] > 0.9) {
        ctx.fillStyle = 'rgba(90,255,150,0.9)';
        ctx.shadowColor = '#17ff7a';
        ctx.shadowBlur = 6;
      } else {
        // depth: columns that are "closer" have higher alpha
        const depth = 0.3 + (i % 7) / 14;
        ctx.fillStyle = `rgba(23,255,122,${0.35 + depth * 0.3})`;
        ctx.shadowBlur = 0;
      }
      ctx.fillText(char, x, y);

      // reset
      if (y > window.innerHeight && Math.random() > 0.975) {
        drops[i] = -5 - Math.random() * 20;
        speeds[i] = 0.5 + Math.random() * 1.1;
      }
      drops[i] += speeds[i] * baseSpeed;
      bright[i] = Math.random();
    }
    ctx.shadowBlur = 0;
  }

  let rafId;
  function loop() {
    drawMatrix();
    // decay the boosts
    speedBoost *= 0.94;
    rafId = requestAnimationFrame(loop);
  }
  loop();

  // ------------------------------------------------------------
  // 2. PARALLAX + SCROLL CHOREOGRAPHY
  // ------------------------------------------------------------
  const trinity = doc.getElementById('trinity');
  const heroStage = doc.querySelector('.hero__stage');
  const velocity = doc.getElementById('velocity');

  let mouseX = 0, mouseY = 0;
  let targetRX = 0, targetRY = 0;
  let curRX = 0, curRY = 0;

  window.addEventListener('pointermove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    targetRX = mouseY * -6;
    targetRY = mouseX * 12;
    tilt = mouseX * 0.8;
  });

  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    speedBoost = Math.min(3, speedBoost + 0.15);
  }, { passive: true });

  function animate() {
    curRX += (targetRX - curRX) * 0.08;
    curRY += (targetRY - curRY) * 0.08;

    // choreograph trinity position with scroll
    const vh = window.innerHeight;
    const t = Math.min(1, scrollY / (vh * 2));
    const fall = t * vh * 0.9;
    const scale = 1 - t * 0.15;
    const spin = t * -8;
    const fade = Math.max(0, 1 - t * 1.2);

    if (trinity) {
      trinity.style.transform =
        `translateY(${fall}px) rotateX(${curRX}deg) rotateY(${curRY}deg) rotate(${spin}deg) scale(${scale})`;
      trinity.style.opacity = fade;
    }
    if (heroStage) {
      // stage itself shifts slightly with mouse for parallax
      heroStage.style.transform = `translate3d(${mouseX * -12}px, ${mouseY * -8}px, 0)`;
    }

    // velocity readout
    if (velocity) {
      const v = Math.round(981 + scrollY * 0.6 + Math.random() * 6);
      velocity.textContent = String(v).padStart(4, '0');
    }

    requestAnimationFrame(animate);
  }
  if (!reduceMotion) animate();

  // ------------------------------------------------------------
  // 3. CUSTOM CURSOR
  // ------------------------------------------------------------
  const cursor = doc.getElementById('cursor');
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let tx = cx, ty = cy;
  window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
  function moveCursor() {
    cx += (tx - cx) * 0.25;
    cy += (ty - cy) * 0.25;
    if (cursor) cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(moveCursor);
  }
  moveCursor();

  doc.querySelectorAll('.data-hover, a, button').forEach(el => {
    el.addEventListener('pointerenter', () => {
      cursor?.classList.add('is-hover');
      if (cursor) cursor.dataset.label = el.dataset.cursor || '';
    });
    el.addEventListener('pointerleave', () => {
      cursor?.classList.remove('is-hover');
    });
  });

  // cards gradient follow
  doc.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  // ------------------------------------------------------------
  // 4. TERMINAL broadcast (typewriter)
  // ------------------------------------------------------------
  const terminal = doc.getElementById('terminal');
  const BROADCAST = [
    '> UPLINK established.',
    '> Nebuchadnezzar / Operator online.',
    '> Locating signal …',
    '> █████████░░░░░░░░░░  48%',
    '> ██████████████░░░░░  72%',
    '> ██████████████████░  93%',
    '> LOCK: TRINITY — vector [ -y ] , v=981 m/s',
    '> Construct parameters: Matrix-v1994 build 0x3A9F',
    '> Running DECRYPT(subject.intent) …',
    '> intent := "free every last one."',
    '',
    '> "Dodge this." — TRINITY',
    '> End of transmission.',
    ''
  ];
  async function typeBroadcast() {
    if (!terminal) return;
    terminal.textContent = '';
    for (const line of BROADCAST) {
      for (const ch of line) {
        terminal.textContent += ch;
        await new Promise(r => setTimeout(r, 14 + Math.random() * 18));
      }
      terminal.textContent += '\n';
      await new Promise(r => setTimeout(r, 180));
    }
  }

  // Only type once it scrolls into view
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { typeBroadcast(); io.disconnect(); }
    });
  }, { threshold: 0.25 });
  if (terminal) io.observe(terminal);

  // Glyph stack (decorative falling chars)
  const glyphStack = doc.getElementById('glyphStack');
  if (glyphStack) {
    setInterval(() => {
      const s = doc.createElement('span');
      s.textContent = GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);
      s.style.left = Math.random() * 92 + '%';
      s.style.top = '0';
      s.style.position = 'absolute';
      s.style.animationDuration = (1.3 + Math.random() * 1.5) + 's';
      glyphStack.appendChild(s);
      setTimeout(() => s.remove(), 2600);
    }, 120);
  }

  // UID footer
  const uid = doc.getElementById('uid');
  if (uid) {
    setInterval(() => {
      uid.textContent = Math.random().toString(2).slice(2, 6) +
        '-' + Math.random().toString(16).slice(2, 6).toUpperCase();
    }, 800);
  }

  // ------------------------------------------------------------
  // 5. WEB AUDIO — synthesized ambient "matrix" soundtrack
  // ------------------------------------------------------------
  let audioCtx = null;
  let masterGain = null;
  let started = false;
  let analyser = null;
  let analyserData = null;

  function createPad(ctx, dest) {
    // Three detuned sawtooths + lowpass = lush drone
    const freqs = [55, 82.4, 110]; // A1, E2, A2
    const padGain = ctx.createGain();
    padGain.gain.value = 0.0;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    lp.Q.value = 0.9;

    freqs.forEach((f, i) => {
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      o1.type = 'sawtooth'; o2.type = 'sawtooth';
      o1.frequency.value = f;
      o2.frequency.value = f * 1.005;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.3 : 0.18;
      o1.connect(g); o2.connect(g);
      g.connect(lp);
      o1.start(); o2.start();

      // slow LFO on detune
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.frequency.value = 0.04 + i * 0.03;
      lfoG.gain.value = 4 + i * 3;
      lfo.connect(lfoG); lfoG.connect(o2.detune);
      lfo.start();
    });

    lp.connect(padGain); padGain.connect(dest);

    // breathe the filter
    const fLfo = ctx.createOscillator();
    const fLfoG = ctx.createGain();
    fLfo.frequency.value = 0.08;
    fLfoG.gain.value = 180;
    fLfo.connect(fLfoG); fLfoG.connect(lp.frequency);
    fLfo.start();

    return padGain;
  }

  function createSub(ctx, dest) {
    // filtered sub-bass pulse — "heartbeat of the construct"
    const gain = ctx.createGain();
    gain.gain.value = 0.0;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 120;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 41.2; // E1
    osc.connect(lp); lp.connect(gain); gain.connect(dest);
    osc.start();

    // 54 BPM pulse (~0.9 Hz)
    const pulse = () => {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.55, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    };
    const interval = (60 / 54) * 1000;
    setInterval(() => { if (started) pulse(); }, interval);
    return gain;
  }

  function rainBlips(ctx, dest) {
    // Random sine blips mapped to falling glyphs
    const g = ctx.createGain();
    g.gain.value = 0.0;
    g.connect(dest);

    setInterval(() => {
      if (!started) return;
      if (Math.random() > 0.55) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const pentatonic = [220, 261.6, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
      osc.frequency.value = pentatonic[(Math.random() * pentatonic.length) | 0] * (Math.random() > .7 ? 2 : 1);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.08, now + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      osc.connect(env); env.connect(g);
      osc.start(now);
      osc.stop(now + 0.75);
    }, 180);

    g.gain.value = 0.7;
    return g;
  }

  function startAudio() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return; }
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.0;

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyserData = new Uint8Array(analyser.frequencyBinCount);

    const comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 20;
    comp.ratio.value = 3;

    const pad = createPad(audioCtx, comp);
    const sub = createSub(audioCtx, comp);
    const blips = rainBlips(audioCtx, comp);

    comp.connect(analyser);
    analyser.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    pad.gain.setValueAtTime(0, audioCtx.currentTime);
    pad.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 3);
    sub.gain.setValueAtTime(0, audioCtx.currentTime);
    sub.gain.linearRampToValueAtTime(0.35, audioCtx.currentTime + 1.5);

    // audio-reactive coupling
    function readLevel() {
      if (!analyser) return;
      analyser.getByteFrequencyData(analyserData);
      let sum = 0;
      for (let i = 0; i < analyserData.length; i++) sum += analyserData[i];
      const avg = sum / analyserData.length / 255;
      audioLevel += (avg - audioLevel) * 0.15;
      requestAnimationFrame(readLevel);
    }
    readLevel();
  }

  function setSound(on) {
    if (!audioCtx) startAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    started = on;
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.linearRampToValueAtTime(on ? 0.6 : 0.0, now + 0.6);
  }

  const soundBtn = doc.getElementById('soundBtn');
  soundBtn?.addEventListener('click', () => {
    const pressed = soundBtn.getAttribute('aria-pressed') === 'true';
    soundBtn.setAttribute('aria-pressed', String(!pressed));
    soundBtn.querySelector('.sound__label').textContent = !pressed ? 'SOUND ON' : 'SOUND OFF';
    setSound(!pressed);
  });

  // ------------------------------------------------------------
  // 6. LOADER / entry gate (audio requires user gesture)
  // ------------------------------------------------------------
  const loader = doc.getElementById('loader');
  const enterHint = doc.getElementById('enterHint');

  function enter() {
    if (!body.classList.contains('is-loading')) return;
    body.classList.remove('is-loading');
    loader?.classList.add('is-hidden');
    // Auto-enable sound when user clicks (gesture)
    if (soundBtn && soundBtn.getAttribute('aria-pressed') !== 'true') {
      soundBtn.click();
    }
  }
  ['click', 'keydown', 'touchstart'].forEach(ev =>
    window.addEventListener(ev, enter, { once: true })
  );

  // Reveal enter hint after loader bar fills
  setTimeout(() => { if (enterHint) enterHint.style.opacity = 1; }, 2400);

})();

/* Hushsong — sound. The world starts silent; every pet in the band adds its family's part to the music.
   A stray plays one raw note, a first evolution plays a figure, a second evolution plays the whole part. */
(function (H) {
  'use strict';
  const Au = (H.Audio = { ctx: null, on: false, vol: { music: 0.7, sfx: 0.8, sound: 1 } });
  let ctx, master, musicBus, sfxBus, noiseBuf, famBus = {}, dinGain, windGain, timer = null;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  Au.init = () => {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      ctx = Au.ctx = new AC();
      master = ctx.createGain(); const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 5; master.connect(comp); comp.connect(ctx.destination);
      musicBus = ctx.createGain(); sfxBus = ctx.createGain(); musicBus.connect(master); sfxBus.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      for (const [f, g] of [['drum', 0.62], ['string', 0.3], ['breath', 0.26], ['brass', 0.24], ['voice', 0.34]]) { const b = ctx.createGain(); b.gain.value = g; b.connect(musicBus); famBus[f] = b; }
      // the hush itself: a slow wind
      const wn = ctx.createBufferSource(); wn.buffer = noiseBuf; wn.loop = true; const wf = ctx.createBiquadFilter(); wf.type = 'lowpass'; wf.frequency.value = 320; wf.Q.value = 0.6; windGain = ctx.createGain(); windGain.gain.value = 0;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.11; const lg = ctx.createGain(); lg.gain.value = 140; lfo.connect(lg); lg.connect(wf.frequency); lfo.start();
      wn.connect(wf); wf.connect(windGain); windGain.connect(master); wn.start();
      // the din: tuneless noise under a battle, fading as the Din fall
      const dn = ctx.createBufferSource(); dn.buffer = noiseBuf; dn.loop = true; dn.playbackRate.value = 0.6; const df = ctx.createBiquadFilter(); df.type = 'bandpass'; df.frequency.value = 900; df.Q.value = 1.4; dinGain = ctx.createGain(); dinGain.gain.value = 0;
      const dl = ctx.createOscillator(); dl.frequency.value = 0.37; const dg = ctx.createGain(); dg.gain.value = 500; dl.connect(dg); dg.connect(df.frequency); dl.start();
      dn.connect(df); df.connect(dinGain); dinGain.connect(master); dn.start();
      Au.on = true; Au.applyVol(); return true;
    } catch (e) { return false; }
  };
  Au.applyVol = () => { if (!ctx) return; const s = Au.vol.sound ? 1 : 0; master.gain.setTargetAtTime(0.9 * s, ctx.currentTime, 0.05); musicBus.gain.setTargetAtTime(Au.vol.music, ctx.currentTime, 0.05); sfxBus.gain.setTargetAtTime(Au.vol.sfx, ctx.currentTime, 0.05); };

  /* ----- instruments ----- */
  const env = (g, t, a, peak, d, sus, r, dur) => { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.linearRampToValueAtTime(peak * sus, t + a + d); g.gain.setValueAtTime(peak * sus, t + Math.max(a + d, dur)); g.gain.linearRampToValueAtTime(0.0001, t + Math.max(a + d, dur) + r); return t + Math.max(a + d, dur) + r + 0.02; };
  const noise = (t, dur, type, freq, q, peak, out) => { const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 1; const g = ctx.createGain(); g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + dur + 0.02); };
  const I = {
    kick(t, vel, out) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.13); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.26); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.3); },
    snare(t, vel, out) { noise(t, 0.13, 'bandpass', 1900, 0.8, vel * 0.7, out); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(210, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.08); g.gain.setValueAtTime(vel * 0.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.12); },
    hat(t, vel, out) { noise(t, 0.035, 'highpass', 7500, 0.7, vel * 0.3, out); },
    tom(t, vel, out, f) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(f * 1.6, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.1); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.25); },
    pluck(t, midi, dur, vel, out) { const f = mtof(midi); const o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'sawtooth'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 1.004; lp.type = 'lowpass'; lp.Q.value = 1.5; lp.frequency.setValueAtTime(Math.min(9000, f * 7), t); lp.frequency.exponentialRampToValueAtTime(Math.max(300, f * 1.2), t + 0.25); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0008, t + Math.max(0.25, dur * 1.6)); o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(out); o.start(t); o2.start(t); const e = t + Math.max(0.25, dur * 1.6) + 0.03; o.stop(e); o2.stop(e); },
    flute(t, midi, dur, vel, out) { const f = mtof(midi); const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2; g2.gain.value = 0.12; const v = ctx.createOscillator(), vg = ctx.createGain(); v.frequency.value = 5.2; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.006, t + 0.25); v.connect(vg); vg.connect(o.frequency); const e = env(g, t, 0.05, vel, 0.08, 0.8, 0.12, dur); o.connect(g); o2.connect(g2); g2.connect(g); g.connect(out); noise(t, 0.07, 'bandpass', f * 2, 2, vel * 0.25, out); o.start(t); o2.start(t); v.start(t); o.stop(e); o2.stop(e); v.stop(e); },
    brass(t, midi, dur, vel, out) { const f = mtof(midi); const o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.value = f; o2.frequency.value = f * 0.997; lp.type = 'lowpass'; lp.Q.value = 2.2; lp.frequency.setValueAtTime(260, t); lp.frequency.linearRampToValueAtTime(Math.min(4200, f * 6), t + 0.05); lp.frequency.linearRampToValueAtTime(Math.min(2200, f * 3), t + 0.2); const e = env(g, t, 0.025, vel, 0.1, 0.7, 0.09, dur); o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(out); o.start(t); o2.start(t); o.stop(e); o2.stop(e); },
    voice(t, midi, dur, vel, out, vowel) { const f = mtof(midi); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = f; const v = ctx.createOscillator(), vg = ctx.createGain(); v.frequency.value = 5.6; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.011, t + 0.2); v.connect(vg); vg.connect(o.frequency); const fm = vowel === 'ah' ? [[820, 1], [1250, 0.6]] : [[380, 1], [820, 0.45]]; const e = env(g, t, 0.07, vel, 0.1, 0.85, 0.16, dur); for (const [ff, gg] of fm) { const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = 6; const bg = ctx.createGain(); bg.gain.value = gg * 2.2; o.connect(bp); bp.connect(bg); bg.connect(g); } g.connect(out); o.start(t); v.start(t); o.stop(e); v.stop(e); },
    bell(t, midi, dur, vel, out) { const f = mtof(midi); for (const [m, a] of [[1, 1], [2.76, 0.35], [5.4, 0.15]]) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f * m; g.gain.setValueAtTime(vel * a, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.02); } },
  };

  /* ----- the band's parts ----- */
  // chords: [root midi, 'maj'|'min']
  const PROG = {
    camp:  { bpm: 84,  ch: [[60, 'maj'], [57, 'min'], [53, 'maj'], [55, 'maj']] },
    fen:   { bpm: 104, ch: [[62, 'min'], [60, 'maj'], [55, 'maj'], [57, 'min']] },
    works: { bpm: 112, ch: [[64, 'min'], [60, 'maj'], [62, 'maj'], [59, 'min']] },
    ridge: { bpm: 116, ch: [[57, 'min'], [53, 'maj'], [60, 'maj'], [55, 'maj']] },
    hall:  { bpm: 120, ch: [[53, 'min'], [61, 'maj'], [56, 'maj'], [63, 'maj']] },
  };
  const tones = (c) => { const t = c[1] === 'maj' ? 4 : 3; return [c[0], c[0] + t, c[0] + 7, c[0] + 12, c[0] + 12 + t, c[0] + 19]; };
  const penta = (c) => (c[1] === 'maj' ? [0, 2, 4, 7, 9, 12, 14, 16] : [0, 3, 5, 7, 10, 12, 15, 17]).map((x) => c[0] + x);
  const MELODY = [[0, 3, 3], [4, 4, 2], [6, 5, 2], [8, 4, 4], [12, 2, 2], [14, 3, 2]];           // [step, scale index, length]
  const MELODY2 = [[0, 5, 2], [2, 4, 2], [4, 3, 4], [8, 2, 2], [10, 3, 2], [12, 4, 4]];
  const COUNTER = [[0, 4, 6], [6, 3, 2], [8, 2, 6], [14, 1, 2]];
  function part(fam, lvl, step, bar, c, t, sd, out, soft) {
    const T = tones(c), P = penta(c), v = soft ? 0.7 : 1;
    if (fam === 'drum') {
      if (lvl === 1) { if (step === 0) I.kick(t, 0.9 * v, out); if (step === 8) I.tom(t, 0.5 * v, out, 90); }
      else if (lvl === 2) { if (step === 0 || step === 8 || step === 10) I.kick(t, (step === 10 ? 0.5 : 0.9) * v, out); if (step === 4 || step === 12) I.hat(t, 0.9 * v, out); if (step % 4 === 2) I.hat(t, 0.4 * v, out); }
      else { if (step === 0 || step === 6 || step === 8) I.kick(t, 0.95 * v, out); if (step === 4 || step === 12) I.snare(t, 0.8 * v, out); if (step % 2 === 0) I.hat(t, (step % 4 === 2 ? 0.8 : 0.45) * v, out); if (bar === 3 && step >= 13) I.snare(t, 0.5 * v, out); if (bar === 3 && step === 10) I.tom(t, 0.6 * v, out, 120); }
    } else if (fam === 'string') {
      if (lvl === 1) { if (step === 0) I.pluck(t, T[0] - 12, sd * 6, 0.8 * v, out); if (step === 8) I.pluck(t, T[2] - 12, sd * 4, 0.5 * v, out); }
      else if (lvl === 2) { if (step % 2 === 0) { const seq = [0, 2, 3, 2, 1, 2, 3, 2]; I.pluck(t, T[seq[step / 2]], sd * 2, (step % 4 ? 0.5 : 0.75) * v, out); } }
      else { const seq = [0, 2, 3, 4, 3, 2, 3, 5, 0, 2, 3, 4, 5, 4, 3, 2]; I.pluck(t, T[seq[step]], sd * 1.5, (step % 4 ? 0.42 : 0.72) * v, out); if (step === 0) I.pluck(t, T[0] - 12, sd * 8, 0.6 * v, out); }
    } else if (fam === 'breath') {
      if (lvl === 1) { if (step === 0) I.flute(t, T[0] + 12, sd * 12, 0.5 * v, out); }
      else if (lvl === 2) { if (step === 0) I.flute(t, T[2] + 12, sd * 7, 0.55 * v, out); if (step === 8) I.flute(t, T[1] + 12, sd * 7, 0.5 * v, out); }
      else { for (const [s, i, l] of (bar % 2 ? MELODY2 : MELODY)) if (s === step) I.flute(t, P[i] + 12, sd * l * 0.9, 0.6 * v, out); }
    } else if (fam === 'brass') {
      if (lvl === 1) { if (step === 0) I.brass(t, T[0] - 12, sd * 3, 0.7 * v, out); }
      else if (lvl === 2) { if (step === 0 || step === 6) I.brass(t, T[0] - 12, sd * 2.2, 0.7 * v, out); if (step === 8) I.brass(t, T[2] - 12, sd * 2.2, 0.65 * v, out); if (step === 14) I.brass(t, T[0] - 12, sd, 0.5 * v, out); }
      else { if (step === 0 || step === 6 || step === 10) I.brass(t, T[0] - 12, sd * 1.8, 0.7 * v, out); if (step === 8) I.brass(t, T[2] - 12, sd * 1.6, 0.6 * v, out); if (step === 4 || step === 11) for (const k of [1, 2, 3]) I.brass(t, T[k], sd * 0.9, 0.3 * v, out); if (bar === 3 && step === 14) for (const k of [2, 3, 4]) I.brass(t, T[k], sd * 1.6, 0.34 * v, out); }
    } else if (fam === 'voice') {
      if (lvl === 1) { if (step === 0) I.voice(t, T[1], sd * 13, 0.55 * v, out, 'oo'); }
      else if (lvl === 2) { if (step === 0) I.voice(t, T[1], sd * 7, 0.55 * v, out, 'oo'); if (step === 8) I.voice(t, T[2], sd * 7, 0.55 * v, out, 'ah'); }
      else { for (const [s, i, l] of COUNTER) if (s === step) I.voice(t, P[i] + (bar === 3 ? 12 : 0), sd * l * 0.92, 0.55 * v, out, i > 2 ? 'ah' : 'oo'); }
    }
  }

  const M = (Au.music = { layers: [], prog: 'camp', mode: 'silent', step: 0, next: 0, bpm: 84, soft: false });
  // mode: 'silent' (wind only), 'camp', 'delve', 'battle', 'boss'
  M.set = (mode, layers, prog) => {
    M.mode = mode; M.layers = layers || []; if (prog && PROG[prog]) M.prog = prog;
    const P = PROG[M.prog]; M.bpm = P.bpm * (mode === 'boss' ? 1.1 : mode === 'delve' ? 0.86 : mode === 'camp' ? 1 : 1); M.soft = mode === 'delve' || mode === 'camp';
    if (!ctx) return;
    const playing = mode !== 'silent' && M.layers.length > 0;
    windGain.gain.setTargetAtTime(playing ? 0.012 : 0.07, ctx.currentTime, 0.8);
    musicBus.gain.setTargetAtTime(Au.vol.music * (mode === 'delve' ? 0.55 : mode === 'camp' ? 0.7 : 1), ctx.currentTime, 0.3);
    if (mode !== 'battle' && mode !== 'boss') M.din(0);
    if (!timer) { M.next = ctx.currentTime + 0.08; M.step = 0; timer = setInterval(M.tick, 40); }
  };
  M.din = (frac) => { if (ctx) dinGain.gain.setTargetAtTime(0.028 * frac, ctx.currentTime, 0.6); };
  M.chord = () => PROG[M.prog].ch[Math.floor(M.step / 16) % 4];
  M.tick = () => {
    if (!ctx || ctx.state !== 'running') return;
    if (M.next < ctx.currentTime - 0.3) M.next = ctx.currentTime + 0.05;
    while (M.next < ctx.currentTime + 0.14) {
      const sd = 60 / M.bpm / 4, bar = Math.floor(M.step / 16) % 4, st = M.step % 16, c = PROG[M.prog].ch[bar];
      if (M.mode !== 'silent') { const best = {}; for (const l of M.layers) best[l.family] = Math.max(best[l.family] || 0, l.level); for (const f in best) if (famBus[f]) part(f, best[f], st, bar, c, M.next + (st % 2 ? sd * 0.08 : 0), sd, famBus[f], M.soft); }
      M.next += sd; M.step = (M.step + 1) % 64;
    }
  };
  // Offline render of the band's parts, for level checks without speakers.
  Au.renderTest = async (layers, prog, secs, sfxName, sfxArg) => {
    const oc = new OfflineAudioContext(1, Math.round(44100 * secs), 44100), keep = [ctx, famBus, sfxBus, noiseBuf];
    ctx = oc; famBus = {}; const nb = oc.createBuffer(1, 44100 * 2, 44100), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; noiseBuf = nb;
    for (const [f, g] of [['drum', 0.62], ['string', 0.3], ['breath', 0.26], ['brass', 0.24], ['voice', 0.34]]) { const b = oc.createGain(); b.gain.value = g; b.connect(oc.destination); famBus[f] = b; }
    sfxBus = oc.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(oc.destination);
    const P = PROG[prog], sd = 60 / P.bpm / 4; let t = 0.05, step = 0;
    if (sfxName) { const on = Au.on; Au.on = true; Object.defineProperty(oc, 'state', { value: 'running' }); M.prog = prog; M.mode = 'battle'; Au.sfx(sfxName, sfxArg); Au.on = on; }
    else while (t < secs - 0.5) { const bar = Math.floor(step / 16) % 4, st = step % 16; for (const l of layers) part(l.family, l.level, st, bar, P.ch[bar], t, sd, famBus[l.family], false); t += sd; step++; }
    const buf = await oc.startRendering(); [ctx, famBus, sfxBus, noiseBuf] = keep;
    const x = buf.getChannelData(0); let peak = 0, sum = 0, nan = 0; for (let i = 0; i < x.length; i++) { const v = x[i]; if (!isFinite(v)) nan++; peak = Math.max(peak, Math.abs(v)); sum += v * v; }
    return { peak: +peak.toFixed(3), rms: +Math.sqrt(sum / x.length).toFixed(4), nan };
  };
  Au.layersFor = (pets) => pets.filter(Boolean).map((p) => ({ family: H.petFamily(p), level: H.petTier(p) + 1 }));

  /* ----- effects, kept in the current key so battles sound like playing ----- */
  const NOISES = {
    thud: (t, o) => { I.kick(t, 0.9, o); I.kick(t + 0.34, 0.7, o); },
    clack: (t, o) => { noise(t, 0.05, 'bandpass', 2600, 3, 2.4, o); noise(t + 0.13, 0.05, 'bandpass', 3100, 3, 2.2, o); },
    twang: (t, o) => { const os = ctx.createOscillator(), g = ctx.createGain(); os.type = 'sawtooth'; os.frequency.setValueAtTime(330, t); os.frequency.exponentialRampToValueAtTime(205, t + 0.5); g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.6); os.connect(g); g.connect(o); os.start(t); os.stop(t + 0.62); },
    screech: (t, o) => { const os = ctx.createOscillator(), bp = ctx.createBiquadFilter(), g = ctx.createGain(); os.type = 'sawtooth'; os.frequency.setValueAtTime(1150, t); os.frequency.linearRampToValueAtTime(1650, t + 0.35); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 3; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.9, t + 0.05); g.gain.linearRampToValueAtTime(0.0001, t + 0.42); os.connect(bp); bp.connect(g); g.connect(o); os.start(t); os.stop(t + 0.45); noise(t, 0.35, 'highpass', 4000, 1, 0.08, o); },
    hum: (t, o) => I.flute(t, 57, 0.8, 0.28, o),
    squeak: (t, o) => { for (const d of [0, 0.16]) { const os = ctx.createOscillator(), g = ctx.createGain(); os.frequency.setValueAtTime(1400, t + d); os.frequency.exponentialRampToValueAtTime(2200, t + d + 0.08); g.gain.setValueAtTime(0.3, t + d); g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.1); os.connect(g); g.connect(o); os.start(t + d); os.stop(t + d + 0.12); } },
    blare: (t, o) => I.brass(t, 46, 0.4, 0.32, o),
    yelp: (t, o) => { for (const d of [0, 0.2]) { const os = ctx.createOscillator(), g = ctx.createGain(); os.type = 'triangle'; os.frequency.setValueAtTime(520, t + d); os.frequency.exponentialRampToValueAtTime(920, t + d + 0.06); os.frequency.exponentialRampToValueAtTime(640, t + d + 0.12); g.gain.setValueAtTime(0.4, t + d); g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.14); os.connect(g); g.connect(o); os.start(t + d); os.stop(t + d + 0.16); } },
  };
  let tapN = 0;
  Au.sfx = (name, a) => {
    if (!ctx || !Au.on || ctx.state !== 'running') return;
    const t = ctx.currentTime + 0.005, o = sfxBus, c = M.mode === 'silent' ? [60, 'maj'] : M.chord(), T = tones(c), P = penta(c);
    switch (name) {
      case 'tap': I.pluck(t, P[(a == null ? tapN++ : a) % 8] + 12, 0.12, 0.22, o); break;
      case 'back': I.pluck(t, P[0], 0.12, 0.2, o); break;
      case 'hit': {
        const f = a && a.family, hv = a && a.heavy ? 1.25 : 1;
        if (f === 'drum') I.tom(t, 0.7 * hv, o, 110); else if (f === 'string') I.pluck(t, T[3], 0.15, 0.5 * hv, o); else if (f === 'breath') I.flute(t, T[4], 0.09, 0.5 * hv, o);
        else if (f === 'brass') I.brass(t, T[2], 0.1, 0.28 * hv, o); else if (f === 'voice') I.voice(t, T[3], 0.1, 0.5 * hv, o, 'ah'); else { noise(t, 0.09, 'bandpass', 700 + Math.random() * 900, 1.2, 0.5, o); }
        noise(t, 0.05, 'lowpass', 900, 0.7, 0.25, o); if (a && a.crit) I.bell(t + 0.02, T[5] + 12, 0.35, 0.22, o); break;
      }
      case 'heal': I.bell(t, T[3], 0.4, 0.22, o); I.bell(t + 0.09, T[4], 0.5, 0.22, o); break;
      case 'shield': I.bell(t, T[0], 0.5, 0.25, o); break;
      case 'good': I.pluck(t, T[2] + 12, 0.1, 0.3, o); I.pluck(t + 0.07, T[3] + 12, 0.14, 0.3, o); break;
      case 'bad': I.pluck(t, T[1] + 1, 0.1, 0.3, o); I.pluck(t + 0.07, T[0], 0.16, 0.3, o); break;
      case 'miss': noise(t, 0.16, 'bandpass', 3200, 0.8, 0.6, o); break;
      case 'fall': { const os = ctx.createOscillator(), g = ctx.createGain(); os.type = 'triangle'; os.frequency.setValueAtTime(mtof(T[2]), t); os.frequency.exponentialRampToValueAtTime(mtof(T[0] - 12), t + 0.45); g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5); os.connect(g); g.connect(o); os.start(t); os.stop(t + 0.52); break; }
      case 'cue': [0, 1, 2, 3, 4, 5].forEach((k, i) => I.bell(t + i * 0.055, T[k] + 12, 0.5, 0.2, o)); break;
      case 'win': [0, 2, 3, 2, 3, 5].forEach((k, i) => I.brass(t + i * 0.13, T[k], i === 5 ? 0.6 : 0.1, 0.27, o)); I.snare(t + 0.78, 0.5, o); break;
      case 'lose': [3, 2, 1, 0].forEach((k, i) => I.flute(t + i * 0.2, T[k] - 12, i === 3 ? 0.9 : 0.16, 0.26, o)); break;
      case 'coin': I.bell(t, T[4] + 12, 0.2, 0.16, o); I.bell(t + 0.07, T[5] + 12, 0.3, 0.16, o); break;
      case 'level': [0, 1, 2, 3, 5].forEach((k, i) => I.pluck(t + i * 0.07, T[k] + 12, 0.3, 0.35, o)); break;
      case 'evolve': [0, 2, 3, 4, 5, 4, 5].forEach((k, i) => I.bell(t + i * 0.09, T[k] + (i > 4 ? 12 : 0), 0.7, 0.2, o)); break;
      case 'noise': if (NOISES[a]) NOISES[a](t, o); break;
      case 'crack': noise(t, 0.06, 'highpass', 3000, 1, 0.5, o); noise(t + 0.09, 0.1, 'bandpass', 1800, 1, 0.4, o); break;
      case 'step': I.pluck(t, T[0], 0.12, 0.3, o); I.pluck(t + 0.08, T[2], 0.12, 0.3, o); break;
      case 'boss': I.brass(t, T[0] - 24, 1.0, 0.26, o); I.brass(t, T[0] - 23, 1.0, 0.2, o); noise(t, 0.9, 'lowpass', 300, 0.7, 0.3, o); break;
      case 'skip': I.pluck(t, T[1] - 12, 0.2, 0.25, o); break;
    }
  };
})(window.H);

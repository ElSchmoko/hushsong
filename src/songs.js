/* Hushsong — the fifteen ensemble openings. Notes: "C4:2" is note:length in steps, "-" a rest, "+" joins a chord; div is steps per beat.
   Drums: k kick, s snare, h hat, t/m/T toms, B/b taiko, d/D hand drum, p slap, x shaker, c stick click, C crash. */
(function (H) {
  H.SONGS = {
    drumline: { s: "Taiko thunder", bpm: 116, div: 3, len: 24, parts: [
      {f: 'drum',d: 'B.. ... B.. B.. B.. ... B.B B..'},
      {f: 'drum',v: 0.9,d: '..b .bb ..b .bb ..b .bb .b. ...'},
      {f: 'drum',v: 0.8,d: 'x.x x.x x.x x.x x.x x.x ccc c..'}] },
    stringtrio: { s: "Concerto, fast movement in minor", bpm: 116, div: 4, len: 32, parts: [
      {f: 'bow',n: 'A5:1 E5:1 A5:1 E5:1 C6:1 E5:1 A5:1 E5:1 B5:1 E5:1 G#5:1 E5:1 B5:1 E5:1 D6:1 E5:1 C6:1 A5:1 E5:1 A5:1 C6:1 E6:1 C6:1 A5:1 B5:1 G#5:1 E5:1 G#5:1 A5:4'},
      {f: 'bow',v: 0.6,n: 'C5+E5:2 -:2 C5+E5:2 -:2 B4+E5:2 -:2 B4+E5:2 -:2 C5+E5:2 -:2 C5+E5:2 -:2 B4+D5:2 -:2 A4+C5+E5:4'},
      {f: 'bow',v: 0.9,n: 'A2:2 A3:2 A2:2 A3:2 E3:2 E2:2 E3:2 E2:2 A2:2 A3:2 C3:2 A2:2 E3:2 E2:2 A2:4'}] },
    windtrio: { s: "Flowing pastoral", bpm: 116, div: 4, len: 32, parts: [
      {f: 'breath',n: 'G5:2 A5:2 C6:4 B5:2 A5:2 G5:4 E5:2 G5:2 A5:2 G5:2 E5:2 D5:2 C5:4'},
      {f: 'breath',v: 0.7,n: 'E5:8 D5:4 E5:4 C5:4 C5:4 B4:4 G4:4'},
      {f: 'breath',v: 0.8,n: 'C4:8 F4:4 C4:4 A3:4 F3:4 G3:4 C4:4'}] },
    brassband: { s: "Fanfare", bpm: 112, div: 4, len: 32, parts: [
      {f: 'brass',n: 'G4:1 G4:1 G4:2 C5:4 G4:1 G4:1 G4:2 E5:4 C5:2 E5:2 G5:3 E5:1 C5:2 G4:2 C5:4'},
      {f: 'brass',v: 0.7,n: 'E4:1 E4:1 E4:2 G4:4 E4:1 E4:1 E4:2 C5:4 G4:2 C5:2 E5:3 C5:1 G4:2 E4:2 E4+G4:4'},
      {f: 'brass',n: 'C3:4 C3:4 C3:4 G2:4 C3:4 E3:4 G2:4 C3:4'}] },
    choir: { s: "Chorale", bpm: 112, div: 4, len: 32, parts: [
      {f: 'voice',vow: 'ah',n: 'E5:8 F5:4 E5:4 G5:6 F5:2 E5:8'},
      {f: 'voice',v: 0.8,n: 'C5:8 C5:4 C5:4 D5:6 D5:2 C5:8'},
      {f: 'voice',v: 0.9,n: 'C4:8 A3:4 C4:4 B3:6 G3:2 C4:8'}] },
    folk: { s: "Jig", bpm: 120, div: 3, len: 24, parts: [
      {f: 'breath',n: 'G5:1 A5:1 G5:1 E5:2 G5:1 A5:1 B5:1 C6:1 A5:3 G5:1 A5:1 G5:1 E5:1 D5:1 E5:1 G5:2 E5:1 C5:3'},
      {f: 'string',v: 0.7,n: 'C4:1 G4:1 E4:1 C4:1 G4:1 E4:1 F4:1 C5:1 A4:1 F4:1 C5:1 A4:1 C4:1 G4:1 E4:1 G3:1 D4:1 B3:1 C4:1 G4:1 E4:1 C4+E4+G4:3'},
      {f: 'drum',d: 'k.hk.h k.hk.h k.hk.h k.hs..'}] },
    ragtime: { s: "Piano rag", bpm: 112, div: 4, len: 32, parts: [
      {f: 'string',n: 'E5:1 C5:1 E5:1 G5:2 E5:1 C5:2 F5:1 D5:1 F5:1 A5:2 F5:1 D5:2 E5:1 C5:1 E5:1 G5:2 C6:1 G5:2 A5:1 G5:1 E5:1 D5:1 C5:4'},
      {f: 'brass',v: 0.7,n: 'C3:2 E3+G3:2 G2:2 E3+G3:2 D3:2 F3+A3:2 G2:2 F3+B3:2 C3:2 E3+G3:2 E3:2 G3+C4:2 G2:2 G2:2 C3:4'},
      {f: 'drum',v: 0.7,d: 'k.h. s.h. k.h. s.h. k.h. s.h. k.s. k...'}] },
    rock: { s: "Heavy stomp with shouts", bpm: 112, div: 4, len: 32, parts: [
      {f: 'gtr',n: 'A2+E3:3 A2+E3:1 G2+D3:2 A2+E3:2 C3+G3:3 C3+G3:1 D3+A3:2 E3+B3:2 A2+E3:3 A2+E3:1 G2+D3:2 A2+E3:2 E3:1 D3:1 C3:1 D3:1 A2+E3+A3:4'},
      {f: 'voice',vow: 'ah',n: '-:4 A4+E5:2 -:2 -:4 A4+E5:2 -:2 -:4 A4+E5:2 -:2 -:4 A4+C5+E5:4'},
      {f: 'drum',d: 'C..k s... k.k. s... k..k s... k.k. C...'}] },
    marching: { s: "Drum call and answer", bpm: 112, div: 4, len: 32, parts: [
      {f: 'drum',d: 's.ss s.ss s... .... s.ss s.ss s.s. k...'},
      {f: 'brass',n: '-:8 -:2 G4:2 C5:4 -:8 G4:1 C5:1 E5:2 C5:4'},
      {f: 'breath',n: '-:12 E6:1 G6:1 E6:1 G6:1 -:8 E5:1 G5:1 C6:2 E6:4'}] },
    carnival: { s: "Samba", bpm: 112, div: 4, len: 32, parts: [
      {f: 'breath',n: 'G5:2 E5:1 G5:2 E5:1 A5:2 G5:2 E5:1 G5:2 E5:1 C5:2 D5:2 F5:1 A5:2 F5:1 D5:2 E5:1 G5:1 E5:1 D5:1 C5:4'},
      {f: 'voice',vow: 'ah',v: 0.8,n: '-:6 C5:2 -:6 E5:2 -:6 D5:2 C5+E5:4 G4+C5+E5:4'},
      {f: 'drum',d: 'k..k k.s. k..k s.s. k..k k.s. k.sk s...'},
      {f: 'drum',v: 0.6,d: 'h.hh h.hh h.hh h.hh h.hh h.hh h.hh ....'}] },
    swing: { s: "Big-band shout", bpm: 138, div: 3, len: 24, parts: [
      {f: 'brass',n: 'G4:3 -:2 A4:1 -:2 G4:1 E4:3 C4:2 D4:1 E4:2 G4:1 A4:2 C5:1 C5:3'},
      {f: 'voice',vow: 'ah',n: 'E5+G5:3 -:9 -:9 E5+G5+C6:3'},
      {f: 'drum',v: 0.8,d: 's..h.h h..h.h h..h.h s.ss.s'},
      {f: 'drum',v: 0.7,d: 'k..... k..... k..... k..k..'}] },
    chamber: { s: "Minuet", bpm: 176, div: 2, len: 24, parts: [
      {f: 'breath',n: 'E5:2 G5:2 C6:2 B5:2 A5:1 G5:1 F5:2 E5:2 F5:1 E5:1 D5:1 C5:1 C5:6'},
      {f: 'string',v: 0.8,n: 'C4:2 E4+G4:2 E4+G4:2 G3:2 D4+F4:2 D4+F4:2 A3:2 C4+E4:2 G3:2 C4:2 G3:2 C3:2'},
      {f: 'brass',v: 0.8,n: 'C3:6 G2:6 A2:4 G2:2 C3:6'}] },
    serenade: { s: "Romantic duet with cello", bpm: 80, div: 4, len: 24, parts: [
      {f: 'voice',vow: 'ah',n: 'G4:4 E5:6 D5:2 C5:4 B4:2 D5:2 C5:4'},
      {f: 'bow',v: 0.9,n: 'C3:8 A2:8 G2:4 C3:4'},
      {f: 'breath',v: 0.7,n: '-:8 -:4 G5:2 A5:2 G5:4 E5:4'}] },
    opera: { s: "Aria", bpm: 108, div: 4, len: 32, parts: [
      {f: 'voice',vow: 'ah',n: 'A5:6 G5:1 F5:1 E5:4 D5:2 E5:2 F5:2 A5:2 G5:2 B5:2 C6:8'},
      {f: 'brass',v: 0.7,n: 'A3:8 E3:4 E3:4 F3:4 G3:4 C3+G3+C4:8'},
      {f: 'string',v: 0.6,n: '-:2 C4+E4:2 -:2 C4+E4:2 -:2 B3+E4:2 -:2 B3+E4:2 -:2 C4+F4:2 -:2 D4+G4:2 C4+E4+G4:8'}] },
    hymn: { s: "Solemn hymn", bpm: 112, div: 4, len: 32, parts: [
      {f: 'voice',vow: 'ah',n: 'C5:4 E5:4 D5:4 C5:4 F5:4 E5:4 D5:4 C5:4'},
      {f: 'brass',v: 0.8,n: 'C3:4 C3:4 G3:4 A3:4 F3:4 C3:4 G2:4 C3:4'},
      {f: 'breath',v: 0.8,n: 'G5:8 B5:4 C6:4 A5:4 G5:4 F5:2 D5:2 E5:4'}] },
  };
})(typeof window !== "undefined" ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));

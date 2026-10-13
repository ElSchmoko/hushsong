// The 15 ensembles, each with two candidate openings. Notes: "C4:2" = note:length in steps, "-" = rest, "+" joins a chord.
// Drums: k kick, s snare, h hat, t/m/T low/mid/high tom, . rest. div = steps per beat.
const ENSEMBLES = [
  { id: 'drumline', n: 'Drumline', fam: ['drum', 'drum', 'drum'], boon: 'Your whole team acts before any enemy, and all enemies are slowed for 1 turn.', v: [
    { L: 'C', s: 'Taiko thunder', bpm: 116, div: 3, len: 24, parts: [
      { f: 'drum', d: 'B.. ... B.. B.. B.. ... B.B B..' }, { f: 'drum', v: 0.9, d: '..b .bb ..b .bb ..b .bb .b. ...' }, { f: 'drum', v: 0.8, d: 'x.x x.x x.x x.x x.x x.x ccc c..' }] },
    { L: 'D', s: 'Hand-drum circle', bpm: 112, div: 4, len: 32, parts: [
      { f: 'drum', d: 'd.pd .p.d d.pd .pDD d.pd .p.d DdDd p...' }, { f: 'drum', d: 'B... .... B..B .... B... .... B.B. B...' }, { f: 'drum', v: 0.7, d: 'x.xx x.xx x.xx x.xx x.xx x.xx x.xx ....' }] } ] },
  { id: 'stringtrio', n: 'String Trio', fam: ['string', 'string', 'string'], boon: "Your team's first three hits are critical hits.", v: [
    { L: 'C', s: 'Concerto, slow movement', bpm: 104, div: 4, len: 32, parts: [
      { f: 'bow', n: 'E5:4 G5:2 C6:2 B5:3 A5:1 G5:4 A5:2 F5:2 D5:2 B4:2 C5:8' },
      { f: 'bow', v: 0.7, n: 'G4:8 F4:4 E4:4 F4:4 D4:4 E4:8' },
      { f: 'bow', v: 0.9, n: 'C3:8 D3:4 E3:4 F3:4 G3:4 C3:8' }] },
    { L: 'D', s: 'Concerto, fast movement in minor', bpm: 116, div: 4, len: 32, parts: [
      { f: 'bow', n: 'A5:1 E5:1 A5:1 E5:1 C6:1 E5:1 A5:1 E5:1 B5:1 E5:1 G#5:1 E5:1 B5:1 E5:1 D6:1 E5:1 C6:1 A5:1 E5:1 A5:1 C6:1 E6:1 C6:1 A5:1 B5:1 G#5:1 E5:1 G#5:1 A5:4' },
      { f: 'bow', v: 0.6, n: 'C5+E5:2 -:2 C5+E5:2 -:2 B4+E5:2 -:2 B4+E5:2 -:2 C5+E5:2 -:2 C5+E5:2 -:2 B4+D5:2 -:2 A4+C5+E5:4' },
      { f: 'bow', v: 0.9, n: 'A2:2 A3:2 A2:2 A3:2 E3:2 E2:2 E3:2 E2:2 A2:2 A3:2 C3:2 A2:2 E3:2 E2:2 A2:4' }] } ] },
  { id: 'windtrio', pick: 'A', n: 'Wind Trio', fam: ['breath', 'breath', 'breath'], boon: 'Tailwind: your team takes its turns 25% sooner for the whole battle.', v: [
    { s: 'Flowing pastoral', bpm: 116, div: 4, len: 32, parts: [
      { f: 'breath', n: 'G5:2 A5:2 C6:4 B5:2 A5:2 G5:4 E5:2 G5:2 A5:2 G5:2 E5:2 D5:2 C5:4' },
      { f: 'breath', v: 0.7, n: 'E5:8 D5:4 E5:4 C5:4 C5:4 B4:4 G4:4' },
      { f: 'breath', v: 0.8, n: 'C4:8 F4:4 C4:4 A3:4 F3:4 G3:4 C4:4' }] },
    { s: 'Birdsong', bpm: 138, div: 4, len: 32, parts: [
      { f: 'breath', n: 'C6:1 -:1 C6:1 E6:1 G6:2 E6:2 D6:1 -:1 D6:1 F6:1 A6:2 F6:2 E6:1 G6:1 E6:1 C6:1 D6:1 F6:1 D6:1 B5:1 C6:2 G5:2 C6:4' },
      { f: 'breath', v: 0.7, n: '-:2 G5:2 -:2 G5:2 -:2 A5:2 -:2 A5:2 -:2 G5:2 -:2 G5:2 E5:2 D5:2 E5:4' },
      { f: 'breath', v: 0.8, n: 'C4:4 E4:4 F4:4 A4:4 C4:4 G4:4 C4:2 G3:2 C4:4' }] } ] },
  { id: 'brassband', pick: 'A', n: 'Brass Band', fam: ['brass', 'brass', 'brass'], boon: 'Crescendo: your team gains 6% Power every turn, up to 30%.', v: [
    { s: 'Fanfare', bpm: 112, div: 4, len: 32, parts: [
      { f: 'brass', n: 'G4:1 G4:1 G4:2 C5:4 G4:1 G4:1 G4:2 E5:4 C5:2 E5:2 G5:3 E5:1 C5:2 G4:2 C5:4' },
      { f: 'brass', v: 0.7, n: 'E4:1 E4:1 E4:2 G4:4 E4:1 E4:1 E4:2 C5:4 G4:2 C5:2 E5:3 C5:1 G4:2 E4:2 E4+G4:4' },
      { f: 'brass', n: 'C3:4 C3:4 C3:4 G2:4 C3:4 E3:4 G2:4 C3:4' }] },
    { s: 'Oom-pah', bpm: 120, div: 4, len: 32, parts: [
      { f: 'brass', n: 'E5:2 G5:2 E5:2 C5:2 D5:2 E5:2 D5:4 A5:2 G5:2 E5:2 C5:2 D5:2 B4:2 C5:4' },
      { f: 'brass', v: 0.55, n: '-:2 E4+G4:2 -:2 E4+G4:2 -:2 E4+G4:2 -:2 D4+G4:2 -:2 F4+A4:2 -:2 E4+G4:2 -:2 D4+F4:2 E4+G4:4' },
      { f: 'brass', n: 'C3:2 -:2 G2:2 -:2 C3:2 -:2 G2:2 -:2 F2:2 -:2 C3:2 -:2 G2:2 G2:2 C3:4' }] } ] },
  { id: 'choir', pick: 'A', n: 'Choir', fam: ['voice', 'voice', 'voice'], boon: 'Harmony: whenever one pet is healed, the other two heal for a third as much.', v: [
    { s: 'Chorale', bpm: 112, div: 4, len: 32, parts: [
      { f: 'voice', vow: 'ah', n: 'E5:8 F5:4 E5:4 G5:6 F5:2 E5:8' }, { f: 'voice', v: 0.8, n: 'C5:8 C5:4 C5:4 D5:6 D5:2 C5:8' }, { f: 'voice', v: 0.9, n: 'C4:8 A3:4 C4:4 B3:6 G3:2 C4:8' }] },
    { s: 'Doo-wop', bpm: 116, div: 4, len: 32, parts: [
      { f: 'voice', vow: 'ah', n: 'G5:4 E5:2 G5:2 A5:4 G5:4 A5:2 C6:2 A5:2 G5:2 D5:2 F5:2 E5:4' },
      { f: 'voice', v: 0.6, n: '-:2 E4+G4:2 -:2 E4+G4:2 -:2 E4+A4:2 -:2 E4+A4:2 -:2 F4+A4:2 -:2 F4+A4:2 -:2 F4+B4:2 E4+G4+C5:4' },
      { f: 'voice', n: 'C3:2 -:1 C3:1 E3:2 G3:2 A3:2 -:1 A3:1 G3:2 E3:2 F3:2 -:1 F3:1 A3:2 C4:2 G3:2 G3:2 C3:4' }] } ] },
  { id: 'folk', pick: 'A', n: 'Folk Band', fam: ['drum', 'string', 'breath'], boon: 'Speed Up on your team for 2 turns.', v: [
    { s: 'Jig', bpm: 120, div: 3, len: 24, parts: [
      { f: 'breath', n: 'G5:1 A5:1 G5:1 E5:2 G5:1 A5:1 B5:1 C6:1 A5:3 G5:1 A5:1 G5:1 E5:1 D5:1 E5:1 G5:2 E5:1 C5:3' },
      { f: 'string', v: 0.7, n: 'C4:1 G4:1 E4:1 C4:1 G4:1 E4:1 F4:1 C5:1 A4:1 F4:1 C5:1 A4:1 C4:1 G4:1 E4:1 G3:1 D4:1 B3:1 C4:1 G4:1 E4:1 C4+E4+G4:3' },
      { f: 'drum', d: 'k.hk.h k.hk.h k.hk.h k.hs..' }] },
    { s: 'Reel', bpm: 132, div: 4, len: 32, parts: [
      { f: 'breath', n: 'C5:1 E5:1 G5:1 E5:1 A5:1 G5:1 E5:1 G5:1 F5:1 A5:1 C6:1 A5:1 G5:2 E5:2 C5:1 E5:1 G5:1 E5:1 A5:1 G5:1 E5:1 C5:1 D5:1 E5:1 D5:1 B4:1 C5:4' },
      { f: 'string', v: 0.7, n: 'C3:2 E4+G4:2 C3:2 E4+G4:2 F3:2 F4+A4:2 C3:2 E4+G4:2 C3:2 E4+G4:2 A2:2 E4+A4:2 G2:2 D4+G4:2 C3+E4+G4:4' },
      { f: 'drum', d: 'k.h. s.h. k.h. s.h. k.h. s.h. k.k. s...' }] } ] },
  { id: 'ragtime', pick: 'A', n: 'Ragtime Band', fam: ['drum', 'string', 'brass'], boon: 'Power Down on all enemies for 2 turns.', v: [
    { s: 'Piano rag', bpm: 112, div: 4, len: 32, parts: [
      { f: 'string', n: 'E5:1 C5:1 E5:1 G5:2 E5:1 C5:2 F5:1 D5:1 F5:1 A5:2 F5:1 D5:2 E5:1 C5:1 E5:1 G5:2 C6:1 G5:2 A5:1 G5:1 E5:1 D5:1 C5:4' },
      { f: 'brass', v: 0.7, n: 'C3:2 E3+G3:2 G2:2 E3+G3:2 D3:2 F3+A3:2 G2:2 F3+B3:2 C3:2 E3+G3:2 E3:2 G3+C4:2 G2:2 G2:2 C3:4' },
      { f: 'drum', v: 0.7, d: 'k.h. s.h. k.h. s.h. k.h. s.h. k.s. k...' }] },
    { s: 'Stop-time strut', bpm: 108, div: 4, len: 32, parts: [
      { f: 'brass', n: 'C4:2 -:2 E4:2 -:2 G4:1 A4:1 G4:2 E4:2 -:2 F4:2 -:2 A4:2 -:2 G4:1 F4:1 E4:1 D4:1 C4:4' },
      { f: 'string', n: '-:2 G5:1 E5:1 -:2 C6:1 G5:1 -:8 -:2 A5:1 F5:1 -:2 C6:1 A5:1 -:4 E5+G5+C6:4' },
      { f: 'drum', d: 'k... s... k... s.s. k... s... k.ss k...' }] } ] },
  { id: 'rock', n: 'Rock Band', fam: ['drum', 'string', 'voice'], boon: 'Encore: the first Special each pet uses is ready again right away.', v: [
    { L: 'C', s: 'Driving hard rock', bpm: 138, div: 4, len: 32, parts: [
      { f: 'gtr', n: 'A2+E3:1 A2+E3:1 -:1 A2+E3:1 C3+G3:2 A2+E3:2 A2+E3:1 A2+E3:1 -:1 A2+E3:1 D3+A3:2 C3+G3:2 A2+E3:1 A2+E3:1 -:1 A2+E3:1 C3+G3:2 D3+A3:2 E3+B3:2 E3+B3:2 A2+E3+A3:4' },
      { f: 'voice', vow: 'ah', n: '-:16 A4:8 C5:2 D5:2 E5:4' },
      { f: 'drum', d: 'k.hk s.h. k.hk s.h. k.hk s.h. k.s. C...' }] },
    { L: 'D', s: 'Heavy stomp with shouts', bpm: 112, div: 4, len: 32, parts: [
      { f: 'gtr', n: 'A2+E3:3 A2+E3:1 G2+D3:2 A2+E3:2 C3+G3:3 C3+G3:1 D3+A3:2 E3+B3:2 A2+E3:3 A2+E3:1 G2+D3:2 A2+E3:2 E3:1 D3:1 C3:1 D3:1 A2+E3+A3:4' },
      { f: 'voice', vow: 'ah', n: '-:4 A4+E5:2 -:2 -:4 A4+E5:2 -:2 -:4 A4+E5:2 -:2 -:4 A4+C5+E5:4' },
      { f: 'drum', d: 'C..k s... k.k. s... k..k s... k.k. C...' }] } ] },
  { id: 'marching', pick: 'B', n: 'Marching Band', fam: ['drum', 'breath', 'brass'], boon: 'Shield for your team, worth 15% of each pet\'s HP.', v: [
    { s: 'Parade march', bpm: 116, div: 4, len: 32, parts: [
      { f: 'brass', n: 'C4:2 C4:1 C4:1 E4:2 G4:2 C5:3 G4:1 E4:2 C4:2 F4:2 F4:1 F4:1 A4:2 C5:2 B4:2 G4:2 C5:4' },
      { f: 'breath', n: '-:8 G5:1 E5:1 G5:1 C6:1 G5:2 E5:2 -:8 D6:1 E6:1 F6:1 G6:1 C6:4' },
      { f: 'drum', d: 'k.ss k.s. k.ss k.s. k.ss k.s. kss. k...' }] },
    { s: 'Drum call and answer', bpm: 112, div: 4, len: 32, parts: [
      { f: 'drum', d: 's.ss s.ss s... .... s.ss s.ss s.s. k...' },
      { f: 'brass', n: '-:8 -:2 G4:2 C5:4 -:8 G4:1 C5:1 E5:2 C5:4' },
      { f: 'breath', n: '-:12 E6:1 G6:1 E6:1 G6:1 -:8 E5:1 G5:1 C6:2 E6:4' }] } ] },
  { id: 'carnival', pick: 'A', n: 'Carnival', fam: ['drum', 'breath', 'voice'], boon: 'Confetti: every enemy starts with one random effect (Slow, Poison or Power Down) for 2 turns.', v: [
    { s: 'Samba', bpm: 112, div: 4, len: 32, parts: [
      { f: 'breath', n: 'G5:2 E5:1 G5:2 E5:1 A5:2 G5:2 E5:1 G5:2 E5:1 C5:2 D5:2 F5:1 A5:2 F5:1 D5:2 E5:1 G5:1 E5:1 D5:1 C5:4' },
      { f: 'voice', vow: 'ah', v: 0.8, n: '-:6 C5:2 -:6 E5:2 -:6 D5:2 C5+E5:4 G4+C5+E5:4' },
      { f: 'drum', d: 'k..k k.s. k..k s.s. k..k k.s. k.sk s...' }, { f: 'drum', v: 0.6, d: 'h.hh h.hh h.hh h.hh h.hh h.hh h.hh ....' }] },
    { s: 'Calypso', bpm: 112, div: 4, len: 32, parts: [
      { f: 'breath', n: 'C5:3 E5:3 G5:2 A5:3 G5:3 E5:2 F5:3 A5:3 G5:2 E5:2 D5:2 C5:4' },
      { f: 'voice', v: 0.7, n: 'E4+G4:3 E4+G4:3 E4+G4:2 F4+A4:3 F4+A4:3 E4+G4:2 F4+A4:3 F4+A4:3 E4+G4:2 D4+G4:4 E4+G4:4' },
      { f: 'drum', d: 'k..h ..k. s..h ..k. k..h ..k. s.s. k...' }] } ] },
  { id: 'swing', pick: 'B', n: 'Swing Band', fam: ['drum', 'brass', 'voice'], boon: 'Your fastest pet takes two turns in a row at the start.', v: [
    { s: 'Easy swing riff', bpm: 132, div: 3, len: 24, parts: [
      { f: 'brass', n: 'C4:2 E4:1 G4:2 A4:1 -:2 G4:1 -:3 C4:2 E4:1 G4:2 A4:1 C5:3 -:3' },
      { f: 'voice', vow: 'ah', n: '-:9 E5:1 -:1 E5:1 -:9 G5:1 E5:1 C5:1' },
      { f: 'drum', v: 0.8, d: 'h..h.h h..h.h h..h.h h..s..' }, { f: 'drum', v: 0.7, d: 'k..... k..... k..... k.....' }] },
    { s: 'Big-band shout', bpm: 138, div: 3, len: 24, parts: [
      { f: 'brass', n: 'G4:3 -:2 A4:1 -:2 G4:1 E4:3 C4:2 D4:1 E4:2 G4:1 A4:2 C5:1 C5:3' },
      { f: 'voice', vow: 'ah', n: 'E5+G5:3 -:9 -:9 E5+G5+C6:3' },
      { f: 'drum', v: 0.8, d: 's..h.h h..h.h h..h.h s.ss.s' }, { f: 'drum', v: 0.7, d: 'k..... k..... k..... k..k..' }] } ] },
  { id: 'chamber', pick: 'B', n: 'Chamber Orchestra', fam: ['string', 'breath', 'brass'], boon: 'Each pet shrugs off the first Slow, Stun, Poison or Power Down it would get.', v: [
    { s: 'Baroque', bpm: 112, div: 4, len: 32, parts: [
      { f: 'breath', n: 'E5:4 G5:4 F5:4 A5:4 G5:2 F5:2 D5:2 B4:2 C5:8' },
      { f: 'string', v: 0.7, n: 'C4:1 E4:1 G4:1 C5:1 G4:1 E4:1 G4:1 E4:1 D4:1 F4:1 A4:1 D5:1 A4:1 F4:1 A4:1 F4:1 G3:1 B3:1 D4:1 G4:1 D4:1 B3:1 D4:1 B3:1 C4:1 E4:1 G4:1 C5:1 C4+E4+G4+C5:4' },
      { f: 'brass', v: 0.8, n: 'C3:8 D3:8 G2:8 C3:8' }] },
    { s: 'Minuet', bpm: 176, div: 2, len: 24, parts: [
      { f: 'breath', n: 'E5:2 G5:2 C6:2 B5:2 A5:1 G5:1 F5:2 E5:2 F5:1 E5:1 D5:1 C5:1 C5:6' },
      { f: 'string', v: 0.8, n: 'C4:2 E4+G4:2 E4+G4:2 G3:2 D4+F4:2 D4+F4:2 A3:2 C4+E4:2 G3:2 C4:2 G3:2 C3:2' },
      { f: 'brass', v: 0.8, n: 'C3:6 G2:6 A2:4 G2:2 C3:6' }] } ] },
  { id: 'serenade', n: 'Serenade', fam: ['string', 'breath', 'voice'], boon: 'Regen on your team for 3 turns.', v: [
    { L: 'C', s: 'Cradle song with harp', bpm: 76, div: 3, len: 18, parts: [
      { f: 'voice', n: 'E5:3 G5:2 E5:1 D5:3 F5:2 D5:1 C5:6' },
      { f: 'string', v: 0.7, n: 'C3:1 G3:1 E4:1 G4:1 E4:1 G3:1 G2:1 D3:1 B3:1 F4:1 B3:1 D3:1 C3:1 G3:1 E4:1 C5:3' },
      { f: 'breath', v: 0.7, n: '-:6 -:3 A5:1 G5:1 F5:1 E5:6' }] },
    { L: 'D', s: 'Romantic duet with cello', bpm: 80, div: 4, len: 24, parts: [
      { f: 'voice', vow: 'ah', n: 'G4:4 E5:6 D5:2 C5:4 B4:2 D5:2 C5:4' },
      { f: 'bow', v: 0.9, n: 'C3:8 A2:8 G2:4 C3:4' },
      { f: 'breath', v: 0.7, n: '-:8 -:4 G5:2 A5:2 G5:4 E5:4' }] } ] },
  { id: 'opera', pick: 'B', n: 'Opera', fam: ['string', 'brass', 'voice'], boon: 'High note: the enemy with the most HP is stunned for 1 turn.', v: [
    { s: 'Grand overture', bpm: 112, div: 4, len: 32, parts: [
      { f: 'brass', n: 'C4:3 C4:1 C4:4 G4:3 G4:1 G4:4 E4:2 F4:2 G4:2 B4:2 C5:8' },
      { f: 'string', v: 0.6, n: 'C4:1 E4:1 G4:1 E4:1 C4:1 E4:1 G4:1 E4:1 B3:1 D4:1 G4:1 D4:1 B3:1 D4:1 G4:1 D4:1 C4:1 E4:1 G4:1 E4:1 D4:1 F4:1 B4:1 F4:1 C4+E4+G4:8' },
      { f: 'voice', vow: 'ah', n: '-:8 -:8 G5:4 B5:4 C6:8' }] },
    { s: 'Aria', bpm: 108, div: 4, len: 32, parts: [
      { f: 'voice', vow: 'ah', n: 'A5:6 G5:1 F5:1 E5:4 D5:2 E5:2 F5:2 A5:2 G5:2 B5:2 C6:8' },
      { f: 'brass', v: 0.7, n: 'A3:8 E3:4 E3:4 F3:4 G3:4 C3+G3+C4:8' },
      { f: 'string', v: 0.6, n: '-:2 C4+E4:2 -:2 C4+E4:2 -:2 B3+E4:2 -:2 B3+E4:2 -:2 C4+F4:2 -:2 D4+G4:2 C4+E4+G4:8' }] } ] },
  { id: 'hymn', pick: 'A', n: 'Hymn', fam: ['breath', 'brass', 'voice'], boon: 'The first pet to fall gets back up at 25% HP.', v: [
    { s: 'Solemn hymn', bpm: 112, div: 4, len: 32, parts: [
      { f: 'voice', vow: 'ah', n: 'C5:4 E5:4 D5:4 C5:4 F5:4 E5:4 D5:4 C5:4' },
      { f: 'brass', v: 0.8, n: 'C3:4 C3:4 G3:4 A3:4 F3:4 C3:4 G2:4 C3:4' },
      { f: 'breath', v: 0.8, n: 'G5:8 B5:4 C6:4 A5:4 G5:4 F5:2 D5:2 E5:4' }] },
    { s: 'Gospel lift', bpm: 112, div: 4, len: 32, parts: [
      { f: 'voice', vow: 'ah', n: 'G4:2 C5:2 E5:4 E5:2 D5:2 C5:4 A4:2 C5:2 F5:4 E5:2 D5:2 C5:4' },
      { f: 'brass', v: 0.8, n: '-:8 -:4 C4+E4+G4:1 -:3 -:8 -:2 F3+A3+C4:2 C3+G3+C4+E4:4' },
      { f: 'breath', n: '-:12 G5:1 A5:1 C6:2 -:8 A5:1 C6:1 D6:1 E6:1 C6:4' }] } ] },
];
if (typeof module !== 'undefined') module.exports = ENSEMBLES;

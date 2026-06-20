/* ═══════════════════════════════════════════════════════════════
   ASTRO CHART — chart.js  v5
   Key changes:
   - Tick lines extend all the way from zodiac ring TO glyph ring
     so glyph naturally sits at its tick end (aligned by default)
   - Dashed leader ONLY appears when glyph is nudged (conjunction)
   - Bigger glyphs (natal 19px, transit 18px)
   - House numbers closer to centre
═══════════════════════════════════════════════════════════════ */
'use strict';

// ── Sign utilities ────────────────────────────────────────────
const SIGN_BASE = {
  Aries:0,Taurus:30,Gemini:60,Cancer:90,Leo:120,Virgo:150,
  Libra:180,Scorpio:210,Sagittarius:240,Capricorn:270,Aquarius:300,Pisces:330
};
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
               'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_GLYPHS  = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_COLORS  = [
  '#b91c1c','#15803d','#1d4ed8','#6d28d9',
  '#c2410c','#166534','#1e40af','#7c3aed',
  '#991b1b','#14532d','#1e3a8a','#5b21b6'
];
const SIGN_FILL = [
  'rgba(239,68,68,0.07)','rgba(34,197,94,0.07)','rgba(59,130,246,0.07)','rgba(139,92,246,0.07)',
  'rgba(249,115,22,0.07)','rgba(34,197,94,0.07)','rgba(59,130,246,0.07)','rgba(239,68,68,0.07)',
  'rgba(249,115,22,0.07)','rgba(34,197,94,0.07)','rgba(59,130,246,0.07)','rgba(139,92,246,0.07)'
];

function sLon(sign, deg) { return SIGN_BASE[sign] + deg; }
function norm(l) { return ((l % 360) + 360) % 360; }
function lonToSignIdx(lon) { return Math.floor(norm(lon) / 30) % 12; }
function lonToDeg(lon) { return norm(lon) % 30; }
function fmtDeg(d) {
  const deg = Math.floor(d), min = Math.floor((d % 1) * 60);
  return `${deg}°${String(min).padStart(2,'0')}'`;
}
function f(n) { return Math.round(n * 100) / 100; }

// ── Natal data ────────────────────────────────────────────────
const PROFILES = {
  leandro: {
    name: 'Leandro',
    born: '21 Apr 1993 · 10:05 · Botucatu SP, Brazil',
    ascSign:'Gemini', ascDeg:18+10/60,
    mcSign: 'Pisces', mcDeg: 27+11/60,
    houses:[
      {n:1,s:'Gemini',d:18+10/60},{n:2,s:'Cancer',d:19+15/60},
      {n:3,s:'Leo',d:23+5/60},{n:4,s:'Virgo',d:27+11/60},
      {n:5,s:'Libra',d:27+52/60},{n:6,s:'Scorpio',d:24+15/60},
      {n:7,s:'Sagittarius',d:18+10/60},{n:8,s:'Capricorn',d:19+15/60},
      {n:9,s:'Aquarius',d:23+5/60},{n:10,s:'Pisces',d:27+11/60},
      {n:11,s:'Aries',d:27+52/60},{n:12,s:'Taurus',d:24+15/60},
    ],
    planets:[
      {name:'Sun',    g:'☉',sign:'Taurus',     d:1+26/60, h:11,r:false,cat:'planet'},
      {name:'Moon',   g:'☽',sign:'Aries',      d:26+26/60,h:10,r:false,cat:'planet'},
      {name:'Mercury',g:'☿',sign:'Aries',      d:8+37/60, h:10,r:false,cat:'planet'},
      {name:'Venus',  g:'♀',sign:'Aries',      d:3+45/60, h:10,r:true, cat:'planet'},
      {name:'Mars',   g:'♂',sign:'Cancer',     d:26+59/60,h:2, r:false,cat:'planet'},
      {name:'Jupiter',g:'♃',sign:'Libra',      d:7+6/60,  h:4, r:true, cat:'planet'},
      {name:'Saturn', g:'♄',sign:'Aquarius',   d:28+22/60,h:9, r:false,cat:'planet'},
      {name:'Uranus', g:'♅',sign:'Capricorn',  d:22+10/60,h:8, r:false,cat:'planet'},
      {name:'Neptune',g:'♆',sign:'Capricorn',  d:21+9/60, h:8, r:false,cat:'planet'},
      {name:'Pluto',  g:'♇',sign:'Scorpio',    d:24+46/60,h:6, r:true, cat:'planet'},
      {name:'Node',   g:'☊',sign:'Sagittarius',d:14+34/60,h:6, r:true, cat:'point'},
      {name:'S.Node', g:'☋',sign:'Gemini',     d:14+34/60,h:12,r:false,cat:'point'},
      {name:'Lilith', g:'⚸',sign:'Pisces',     d:20+53/60,h:9, r:false,cat:'point'},
      {name:'Chiron', g:'⚷',sign:'Leo',        d:17+12/60,h:2, r:false,cat:'point'},
      {name:'Fortune',g:'⊗',sign:'Gemini',     d:13+10/60,h:12,r:false,cat:'point'},
      {name:'Vertex', g:'Vx',sign:'Aquarius',  d:12+3/60, h:8, r:false,cat:'point'},
    ],
  },
  mathew: {
    name: 'Mathew',
    born: '31 May 1980 · 07:15 · Etobicoke ON, Canada',
    ascSign:'Cancer', ascDeg:11+11/60,
    mcSign: 'Pisces', mcDeg: 17+17/60,
    houses:[
      {n:1,s:'Cancer',d:11+11/60},{n:2,s:'Cancer',d:29+49/60},
      {n:3,s:'Leo',d:20+42/60},{n:4,s:'Virgo',d:17+17/60},
      {n:5,s:'Libra',d:22+53/60},{n:6,s:'Sagittarius',d:4+39/60},
      {n:7,s:'Capricorn',d:11+11/60},{n:8,s:'Capricorn',d:29+49/60},
      {n:9,s:'Aquarius',d:20+42/60},{n:10,s:'Pisces',d:17+17/60},
      {n:11,s:'Aries',d:22+53/60},{n:12,s:'Gemini',d:4+39/60},
    ],
    planets:[
      {name:'Sun',    g:'☉',sign:'Gemini',     d:10+10/60,h:12,r:false,cat:'planet'},
      {name:'Moon',   g:'☽',sign:'Sagittarius',d:29+16/60,h:6, r:false,cat:'planet'},
      {name:'Mercury',g:'☿',sign:'Gemini',     d:29+17/60,h:12,r:false,cat:'planet'},
      {name:'Venus',  g:'♀',sign:'Cancer',     d:1+41/60, h:12,r:true, cat:'planet'},
      {name:'Mars',   g:'♂',sign:'Virgo',      d:9+51/60, h:3, r:false,cat:'planet'},
      {name:'Jupiter',g:'♃',sign:'Virgo',      d:2+2/60,  h:3, r:false,cat:'planet'},
      {name:'Saturn', g:'♄',sign:'Virgo',      d:20+15/60,h:4, r:false,cat:'planet'},
      {name:'Uranus', g:'♅',sign:'Scorpio',    d:22+50/60,h:5, r:true, cat:'planet'},
      {name:'Neptune',g:'♆',sign:'Sagittarius',d:21+36/60,h:6, r:true, cat:'planet'},
      {name:'Pluto',  g:'♇',sign:'Libra',      d:19+11/60,h:4, r:true, cat:'planet'},
      {name:'Node',   g:'☊',sign:'Leo',        d:23+52/60,h:3, r:true, cat:'point'},
      {name:'S.Node', g:'☋',sign:'Aquarius',   d:23+52/60,h:9, r:false,cat:'point'},
      {name:'Lilith', g:'⚸',sign:'Libra',      d:6+15/60, h:4, r:false,cat:'point'},
      {name:'Chiron', g:'⚷',sign:'Taurus',     d:15+21/60,h:11,r:false,cat:'point'},
      {name:'Fortune',g:'⊗',sign:'Aquarius',   d:0+18/60, h:8, r:false,cat:'point'},
      {name:'Vertex', g:'Vx',sign:'Scorpio',   d:28+23/60,h:5, r:false,cat:'point'},
    ],
  }
};

function pLon(p)    { return norm(sLon(p.sign, p.d)); }
function ascLon(pr) { return norm(sLon(pr.ascSign, pr.ascDeg)); }
function mcLon(pr)  { return norm(sLon(pr.mcSign,  pr.mcDeg)); }
function hLon(h)    { return norm(sLon(h.s, h.d)); }

// ── SVG geometry ──────────────────────────────────────────────
const CX = 360, CY = 360;

function lonToA(lon, asc) {
  return 180 - norm(lon - asc);
}
function polar(angleDeg, r) {
  const rad = angleDeg * Math.PI / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

// ── Draw zodiac ring ──────────────────────────────────────────
function drawZodiac(asc, rOut, rIn) {
  let s = '';
  for (let i = 0; i < 12; i++) {
    const s0=i*30, s1=s0+30;
    const a1=lonToA(s0,asc), a2=lonToA(s1,asc);
    const po1=polar(a1,rOut),po2=polar(a2,rOut);
    const pi1=polar(a1,rIn), pi2=polar(a2,rIn);
    s+=`<path d="M${f(po1.x)},${f(po1.y)} A${rOut},${rOut} 0 0,0 ${f(po2.x)},${f(po2.y)} L${f(pi2.x)},${f(pi2.y)} A${rIn},${rIn} 0 0,1 ${f(pi1.x)},${f(pi1.y)}Z" fill="${SIGN_FILL[i]}" stroke="#c8cad8" stroke-width="0.4"/>`;
    s+=`<line x1="${f(pi1.x)}" y1="${f(pi1.y)}" x2="${f(po1.x)}" y2="${f(po1.y)}" stroke="#b0b2c8" stroke-width="0.8"/>`;
    const gp=polar(lonToA(s0+15,asc),(rOut+rIn)/2);
    s+=`<text x="${f(gp.x)}" y="${f(gp.y)}" text-anchor="middle" dominant-baseline="central" font-size="19" fill="${SIGN_COLORS[i]}">${SIGN_GLYPHS[i]}</text>`;
  }
  for (let deg=0;deg<360;deg++) {
    const a=lonToA(deg,asc);
    const len=deg%10===0?9:deg%5===0?5.5:3;
    const p1=polar(a,rIn+1),p2=polar(a,rIn+1+len);
    s+=`<line x1="${f(p1.x)}" y1="${f(p1.y)}" x2="${f(p2.x)}" y2="${f(p2.y)}" stroke="#b8bacb" stroke-width="0.6"/>`;
  }
  s+=`<circle cx="${CX}" cy="${CY}" r="${rOut}" fill="none" stroke="#9094b0" stroke-width="1.5"/>`;
  s+=`<circle cx="${CX}" cy="${CY}" r="${rIn}"  fill="none" stroke="#9094b0" stroke-width="1"/>`;
  return s;
}

// ── Draw house cusps ──────────────────────────────────────────
const H_ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

function drawHouses(prof, asc, rOut, rIn, rCenter) {
  let s='';
  const cusps=prof.houses.map(h=>hLon(h));
  for (let i=0;i<12;i++) {
    const lon=cusps[i], ang=lonToA(lon,asc);
    const isAngular=[0,3,6,9].includes(i);
    const pOut=polar(ang,rOut), pIn=polar(ang,rCenter+3);
    s+=`<line x1="${f(pOut.x)}" y1="${f(pOut.y)}" x2="${f(pIn.x)}" y2="${f(pIn.y)}" stroke="${isAngular?'#222':'#9094b0'}" stroke-width="${isAngular?1.8:0.8}"/>`;
    let next=cusps[(i+1)%12];
    if(next<=lon) next+=360;
    const mid=(lon+next)/2;
    // House number: closer to centre circle (rCenter + 28 instead of midpoint)
    const numR = rCenter + 28;
    const np=polar(lonToA(mid,asc), numR);
    s+=`<text x="${f(np.x)}" y="${f(np.y)}" text-anchor="middle" dominant-baseline="central" font-size="9.5" fill="#aab0c8">${H_ROMAN[i]}</text>`;
  }
  const angles=[
    {label:'ASC',lon:ascLon(prof)},
    {label:'DSC',lon:norm(ascLon(prof)+180)},
    {label:'MC', lon:mcLon(prof)},
    {label:'IC', lon:norm(mcLon(prof)+180)},
  ];
  for (const ap of angles) {
    const lp=polar(lonToA(ap.lon,asc),rOut-13);
    s+=`<text x="${f(lp.x)}" y="${f(lp.y)}" text-anchor="middle" dominant-baseline="central" font-size="8.5" fill="#4a6fa5" font-weight="700">${ap.label}</text>`;
  }
  return s;
}

// ── Deconfliction ─────────────────────────────────────────────
// Only nudges when glyphs would genuinely overlap at the glyph radius.
// minSepDeg: minimum angular separation in SVG degrees at rGlyph.
// At r≈250, 1° arc ≈ 4.4px. A glyph is ~19px wide ≈ ~4.3°.
// So two glyphs collide when < ~8° apart; we use 9° as the threshold.
function deconflict(items, asc, minSepDeg) {
  const arr=items.map(p=>({
    ...p,
    baseAngle: lonToA(p._lon,asc),
    finalAngle:lonToA(p._lon,asc),
  }));
  for (let pass=0;pass<30;pass++) {
    let moved=false;
    for (let i=0;i<arr.length;i++) {
      for (let j=i+1;j<arr.length;j++) {
        let diff=arr[j].finalAngle-arr[i].finalAngle;
        while(diff> 180) diff-=360;
        while(diff<-180) diff+=360;
        const abs=Math.abs(diff);
        if(abs<minSepDeg && abs>0.001){
          const push=(minSepDeg-abs)/2+0.3;
          if(diff>=0){arr[i].finalAngle-=push;arr[j].finalAngle+=push;}
          else       {arr[i].finalAngle+=push;arr[j].finalAngle-=push;}
          moved=true;
        }
      }
    }
    if(!moved) break;
  }
  return arr;
}

// ── Colour for natal planet ───────────────────────────────────
function natalColor(p) {
  if (p.r) return '#b91c1c';
  if (p.cat==='point') return '#6b5ea8';
  return SIGN_COLORS[lonToSignIdx(pLon(p))];
}

// ── Retrograde/stationary suffix ─────────────────────────────
// rx: true=retrograde, 'st'=stationary
function rxSuffix(rx) {
  if (rx==='st') return ' ST';
  if (rx)        return ' R';
  return '';
}

// ══════════════════════════════════════════════════════════════
// DRAW NATAL PLANETS
//
// Layout at each planet's true longitude angle:
//
//   rZodiacIn   rZodiacIn-10   rGlyph-18   rGlyph
//       |              |            |           |
//  [zodiac ring] [tick end] [degree label] [GLYPH]
//                |___tick___|
//
// Tick is SHORT — just a small notch at the zodiac ring edge (~10px).
// Glyph sits at rGlyph at the same angle (no offset for un-nudged planets).
// Dashed leader ONLY drawn when a conjunction forces a nudge (>1° displacement).
// ══════════════════════════════════════════════════════════════
function drawNatalPlanets(planets, asc, rGlyph, rZodiacIn) {
  const items =planets.map(p=>({...p,_lon:pLon(p)}));
  // ~9° threshold: glyphs are ~19px, at r=250 that's ~4.4°/px → need ~8-9° to not overlap
  const placed=deconflict(items,asc,9);
  let s='';

  for (const p of placed) {
    const color =natalColor(p);
    const fsize =(p.name==='Vertex'||p.name==='S.Node')?12:19;
    const fw    =p.cat==='point'?'400':'500';
    const trueA =p.baseAngle;
    const glyphA=p.finalAngle;
    // Only draw leader if glyph was meaningfully displaced (>1° in SVG coords)
    const nudged=Math.abs(glyphA-trueA)>1;

    // 1. SHORT TICK at true longitude — just a small notch at the zodiac ring edge
    const tkOuter=polar(trueA, rZodiacIn-1);    // at zodiac inner ring
    const tkInner=polar(trueA, rZodiacIn-11);   // 10px inward = short notch
    s+=`<line x1="${f(tkOuter.x)}" y1="${f(tkOuter.y)}" x2="${f(tkInner.x)}" y2="${f(tkInner.y)}" stroke="${color}" stroke-width="1.3" opacity="0.8"/>`;

    // 2. Glyph position (nudged only when conjunction)
    const glyphPos=polar(glyphA,rGlyph);

    // 3. Dashed leader ONLY when nudged
    if (nudged) {
      // Connect tick-inner to glyph with dashed line
      s+=`<line x1="${f(tkInner.x)}" y1="${f(tkInner.y)}" x2="${f(glyphPos.x)}" y2="${f(glyphPos.y)}" stroke="${color}" stroke-width="0.7" stroke-dasharray="2.5,2" opacity="0.5"/>`;
    }

    // 4. Glyph
    s+=`<text x="${f(glyphPos.x)}" y="${f(glyphPos.y)}" text-anchor="middle" dominant-baseline="central" font-size="${fsize}" fill="${color}" font-weight="${fw}">${p.g}</text>`;

    // 5. Degree label + R/ST — same angle as glyph, just inside it
    const degInt=Math.floor(p.d);
    const suffix=rxSuffix(p.r);
    const lp=polar(glyphA, rGlyph-21);
    s+=`<text x="${f(lp.x)}" y="${f(lp.y)}" text-anchor="middle" dominant-baseline="central" font-size="8" fill="#9094b0">${degInt}°${suffix}</text>`;
  }
  return s;
}

// ══════════════════════════════════════════════════════════════
// DRAW TRANSIT PLANETS
//
// Transit glyphs sit in a band OUTSIDE the zodiac ring.
//
//   rZodiacOut   rZodiacOut+10   rGlyph-18   rGlyph
//       |               |             |           |
//  [zodiac outer] [tick end]  [degree label] [GLYPH]
//       |_____tick______|
//
// Same logic: short tick at zodiac outer edge, glyph at rGlyph,
// dashed leader only when nudged by conjunction.
// ══════════════════════════════════════════════════════════════
function drawTransitPlanets(transits, asc, rZodiacOut, rZodiacIn) {
  const rGlyph=rZodiacOut+28;   // glyph sits outside zodiac ring

  const items =transits.map(p=>({...p,_lon:p.lon}));
  const placed=deconflict(items,asc,9);
  let s='';

  for (const p of placed) {
    const fsize=(p.name==='Node'||p.name==='S.Node')?13:18;
    const color='#0f6b8a';
    const trueA =p.baseAngle;
    const glyphA=p.finalAngle;
    const nudged=Math.abs(glyphA-trueA)>1;

    // 1. SHORT TICK at true longitude — notch just outside the zodiac outer ring
    const tkInner=polar(trueA, rZodiacOut+1);    // at zodiac outer ring
    const tkOuter=polar(trueA, rZodiacOut+11);   // 10px outward = short notch
    s+=`<line x1="${f(tkInner.x)}" y1="${f(tkInner.y)}" x2="${f(tkOuter.x)}" y2="${f(tkOuter.y)}" stroke="#0891b2" stroke-width="1.3" opacity="0.8"/>`;

    // 2. Glyph position
    const glyphPos=polar(glyphA,rGlyph);

    // 3. Dashed leader ONLY when nudged
    if (nudged) {
      s+=`<line x1="${f(tkOuter.x)}" y1="${f(tkOuter.y)}" x2="${f(glyphPos.x)}" y2="${f(glyphPos.y)}" stroke="#0891b2" stroke-width="0.7" stroke-dasharray="2.5,2" opacity="0.5"/>`;
    }

    // 4. Glyph
    s+=`<text x="${f(glyphPos.x)}" y="${f(glyphPos.y)}" text-anchor="middle" dominant-baseline="central" font-size="${fsize}" fill="${color}" font-weight="500">${p.g}</text>`;

    // 5. Degree label: whole degrees only + R or ST
    const degInt=Math.floor(lonToDeg(p.lon));
    const suffix=rxSuffix(p.rx);
    const lp=polar(glyphA, rGlyph-20);
    s+=`<text x="${f(lp.x)}" y="${f(lp.y)}" text-anchor="middle" dominant-baseline="central" font-size="8" fill="#0a7a9a">${degInt}°${suffix}</text>`;
  }
  return s;
}

// ── Transit engine — GEOCENTRIC ───────────────────────────────
function getMeanNorthNodeLon(date) {
  const J2000_JD=2451545.0;
  const JD=date.getTime()/86400000+2440587.5;
  const T=(JD-J2000_JD)/36525;
  const node=125.0445222-1934.136261*T+0.0020708*T*T+T*T*T/450000;
  return((node%360)+360)%360;
}
function getGeocentricLon(bodyKey,t) {
  const geo=Astronomy.GeoVector(Astronomy.Body[bodyKey],t,true);
  const ecl=Astronomy.Ecliptic(geo);
  return((ecl.elon%360)+360)%360;
}
const TRANSIT_BODIES=[
  {name:'Sun',    g:'☉',key:'Sun'},
  {name:'Moon',   g:'☽',key:'Moon'},
  {name:'Mercury',g:'☿',key:'Mercury'},
  {name:'Venus',  g:'♀',key:'Venus'},
  {name:'Mars',   g:'♂',key:'Mars'},
  {name:'Jupiter',g:'♃',key:'Jupiter'},
  {name:'Saturn', g:'♄',key:'Saturn'},
  {name:'Uranus', g:'♅',key:'Uranus'},
  {name:'Neptune',g:'♆',key:'Neptune'},
  {name:'Pluto',  g:'♇',key:'Pluto'},
];

// Daily motion thresholds for stationary detection (°/day)
// A planet is "stationary" when its daily motion is less than these values
const STATION_THRESHOLD = {
  Sun:0, Moon:0, Mercury:0.2, Venus:0.2, Mars:0.1,
  Jupiter:0.03, Saturn:0.02, Uranus:0.01, Neptune:0.008, Pluto:0.006,
};

function calcTransits(dateStr) {
  const [y,m,d]=dateStr.split('-').map(Number);
  const utcOffset=(m>=3&&m<=11)?4:5;
  const utcDate=new Date(Date.UTC(y,m-1,d,12+utcOffset,0,0));
  const t=Astronomy.MakeTime(utcDate);
  const results=TRANSIT_BODIES.map(b=>({
    name:b.name, g:b.g,
    lon:getGeocentricLon(b.key,t), rx:false,
  }));
  // Use 1-day interval for motion detection (more accurate for slow planets)
  const tM=Astronomy.MakeTime(new Date(utcDate.getTime()-1*86400000));
  const tP=Astronomy.MakeTime(new Date(utcDate.getTime()+1*86400000));
  for (const b of results) {
    const key=TRANSIT_BODIES.find(x=>x.name===b.name).key;
    let lonBefore=getGeocentricLon(key,tM);
    let lonAfter =getGeocentricLon(key,tP);
    let mot=lonAfter-lonBefore;
    if(mot> 180) mot-=360;
    if(mot<-180) mot+=360;
    // Daily motion magnitude
    const dailyMot=Math.abs(mot)/2;  // divided by 2-day span
    const threshold=STATION_THRESHOLD[key]||0;
    if (threshold>0 && dailyMot<threshold) {
      b.rx='st';  // stationary
    } else {
      b.rx=mot<0; // retrograde=true, direct=false
    }
  }
  const nLon=getMeanNorthNodeLon(utcDate);
  results.push({name:'Node',  g:'☊',lon:nLon,           rx:true });
  results.push({name:'S.Node',g:'☋',lon:(nLon+180)%360, rx:false});
  return results;
}

// ── Main render ───────────────────────────────────────────────
function renderChart(profKey, mode, transits) {
  const prof=PROFILES[profKey];
  const asc=ascLon(prof);
  const svg=document.getElementById('chart-svg');
  let s='';

  s+=`<rect width="720" height="720" fill="#ffffff" rx="8"/>`;
  s+=`<circle cx="${CX}" cy="${CY}" r="356" fill="none" stroke="#e0e2f0" stroke-width="1"/>`;

  if (mode==='natal') {
    // ── Single wheel ring layout ──
    // RC=62  : centre hole
    // RHI=215: inner boundary of planet+label band (house ring fills 62→215)
    // RZI=272: zodiac inner edge  (planet glyphs at RG=252, labels at RG-21=231)
    // RZO=320: zodiac outer edge
    const RC=62, RHI=215, RZI=272, RZO=320, RG=252;

    s+=drawZodiac(asc,RZO,RZI);
    s+=`<circle cx="${CX}" cy="${CY}" r="${RHI}" fill="#fbfbff" stroke="#c8cad8" stroke-width="0.8"/>`;
    s+=`<circle cx="${CX}" cy="${CY}" r="${RC}"  fill="#f5f5fa" stroke="#d0d2e0" stroke-width="1"/>`;
    s+=drawHouses(prof,asc,RZI,RHI,RC);
    s+=drawNatalPlanets(prof.planets,asc,RG,RZI);

  } else {
    // ── Bi-wheel ring layout ──
    // RC=62  : centre
    // RNI=208: inner of natal band
    // RNO=260: outer of natal band / inner of zodiac  (natal glyphs at RNG=240)
    // RZI=260: zodiac inner
    // RZO=316: zodiac outer  (transit glyphs at RZO+30=346, labels at RZO+50=366 clipped to 356)
    const RC=62, RNI=208, RNO=260, RZI=260, RZO=312;
    const RNG=240;

    s+=drawZodiac(asc,RZO,RZI);
    s+=`<circle cx="${CX}" cy="${CY}" r="${RNO}" fill="#fafaff" stroke="#7a7ca0" stroke-width="1.8"/>`;
    s+=`<circle cx="${CX}" cy="${CY}" r="${RNI}" fill="#f8f8fd" stroke="#c8cad8" stroke-width="0.8"/>`;
    s+=`<circle cx="${CX}" cy="${CY}" r="${RC}"  fill="#f5f5fa" stroke="#d0d2e0" stroke-width="1"/>`;
    s+=`<circle cx="${CX}" cy="${CY}" r="356"   fill="none"   stroke="#9094b0" stroke-width="1"/>`;

    s+=drawHouses(prof,asc,RNO,RNI,RC);
    s+=drawNatalPlanets(prof.planets,asc,RNG,RNO);
    if (transits&&transits.length>0) {
      s+=drawTransitPlanets(transits,asc,RZO,RZI);
    }
  }

  s+=`<text x="${CX}" y="${CY-10}" text-anchor="middle" font-size="11" fill="#4a6fa5" font-weight="700">${prof.name}</text>`;
  s+=`<text x="${CX}" y="${CY+8}"  text-anchor="middle" font-size="8"  fill="#9094b0">${mode==='natal'?'Natal Chart':'Natal + Transit'}</text>`;
  svg.innerHTML=s;
}

// ── Sidebar render ─────────────────────────────────────────────
function renderSidebar(profKey, mode, transits) {
  const prof=PROFILES[profKey];
  const sb=document.getElementById('sidebar');
  let h='';
  h+=`<div class="sb-section-title">${prof.name} · Natal</div>`;
  for (const p of prof.planets) {
    const si=lonToSignIdx(pLon(p));
    const color=natalColor(p);
    const gs=(p.name==='Vertex'||p.name==='S.Node')?'0.82rem':'1rem';
    // Whole degrees only in sidebar too
    const degInt=Math.floor(p.d);
    const minInt=Math.floor((p.d%1)*60);
    const posStr=`${p.sign} ${degInt}°${String(minInt).padStart(2,'0')}'`;
    h+=`<div class="planet-row">
      <span class="p-glyph" style="color:${color};font-size:${gs}">${p.g}</span>
      <span class="p-name">${p.name}</span>
      <span class="p-pos" style="color:${SIGN_COLORS[si]}">${posStr}</span>
      <span class="p-house">H${p.h}</span>
      ${p.r?'<span class="p-retro">R</span>':''}
    </div>`;
  }
  h+=`<div class="sb-divider"></div>`;
  h+=`<div class="sb-section-title">Angles</div>`;
  const asc=ascLon(prof);
  const mc=mcLon(prof);
  const ascDegStr=`${prof.ascSign} ${Math.floor(prof.ascDeg)}°${String(Math.floor((prof.ascDeg%1)*60)).padStart(2,'0')}'`;
  const mcDegStr =`${prof.mcSign} ${Math.floor(prof.mcDeg)}°${String(Math.floor((prof.mcDeg%1)*60)).padStart(2,'0')}'`;
  h+=`<div class="planet-row"><span class="p-glyph" style="color:#4a6fa5">AC</span><span class="p-name">Ascendant</span><span class="p-pos" style="color:#4a6fa5">${ascDegStr}</span></div>`;
  h+=`<div class="planet-row"><span class="p-glyph" style="color:#4a6fa5">MC</span><span class="p-name">Midheaven</span><span class="p-pos" style="color:#4a6fa5">${mcDegStr}</span></div>`;
  if (mode==='transit'&&transits&&transits.length>0) {
    h+=`<div class="sb-divider"></div>`;
    h+=`<div class="transit-label">✦ Transit · Toronto</div>`;
    h+=`<div class="sb-section-title">Transit Planets</div>`;
    for (const tp of transits) {
      const si=lonToSignIdx(tp.lon);
      const gs=(tp.name==='S.Node'||tp.name==='Node')?'0.85rem':'1rem';
      const d=lonToDeg(tp.lon);
      const posStr=`${SIGNS[si]} ${Math.floor(d)}°${String(Math.floor((d%1)*60)).padStart(2,'0')}'`;
      // rx label: 'st'→ST, true→R, false→''
      const rxLabel=tp.rx==='st'?' <span class="p-retro">ST</span>':tp.rx?' <span class="p-retro">R</span>':'';
      h+=`<div class="planet-row">
        <span class="p-glyph" style="color:#0891b2;font-size:${gs}">${tp.g}</span>
        <span class="p-name">${tp.name}</span>
        <span class="p-pos" style="color:${SIGN_COLORS[si]}">${posStr}</span>
        ${rxLabel}
      </div>`;
    }
  }
  h+=`<div class="sb-divider"></div>`;
  h+=`<div class="sb-section-title">Legend</div>`;
  for (const [label,color] of [['Fire','#b91c1c'],['Earth','#15803d'],['Air','#1d4ed8'],['Water','#6d28d9']]) {
    h+=`<div class="legend-row"><svg width="14" height="14" style="flex-shrink:0"><circle cx="7" cy="7" r="5.5" fill="${color}" opacity="0.7"/></svg>${label} signs</div>`;
  }
  h+=`<div class="legend-row" style="margin-top:4px;color:#888"><span style="font-size:0.68rem;margin-right:4px">R</span>Retrograde &nbsp; <span style="font-size:0.68rem;margin-right:4px">ST</span>Stationary</div>`;
  if (mode==='transit') {
    h+=`<div class="legend-row" style="color:#0f6b8a;margin-top:3px"><svg width="14" height="14" style="flex-shrink:0"><text x="2" y="12" font-size="12" fill="#0891b2">✦</text></svg>Transit planets</div>`;
  }
  sb.innerHTML=h;
}

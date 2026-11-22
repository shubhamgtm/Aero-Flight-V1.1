
const AP={SFO:['San Francisco',37.62,-122.38],LAX:['Los Angeles',33.94,-118.41],SEA:['Seattle',47.45,-122.31],DEN:['Denver',39.86,-104.67],ORD:['Chicago',41.98,-87.9],DFW:['Dallas',32.9,-97.04],ATL:['Atlanta',33.64,-84.43],MIA:['Miami',25.79,-80.29],JFK:['New York',40.64,-73.78],BOS:['Boston',42.36,-71.01],YYZ:['Toronto',43.68,-79.63],MEX:['Mexico City',19.44,-99.07],GRU:['São Paulo',-23.43,-46.47],EZE:['Buenos Aires',-34.82,-58.54],LHR:['London',51.47,-.45],CDG:['Paris',49.01,2.55],AMS:['Amsterdam',52.31,4.76],FRA:['Frankfurt',50.03,8.57],MAD:['Madrid',40.47,-3.56],FCO:['Rome',41.8,12.25],IST:['Istanbul',41.26,28.74],DXB:['Dubai',25.25,55.36],DEL:['Delhi',28.56,77.1],BOM:['Mumbai',19.09,72.87],KTM:['Kathmandu',27.7,85.36],SIN:['Singapore',1.36,103.99],HKG:['Hong Kong',22.31,113.91],ICN:['Seoul',37.46,126.44],NRT:['Tokyo',35.77,140.39],SYD:['Sydney',-33.94,151.18],JNB:['Johannesburg',-26.14,28.25],CPT:['Cape Town',-33.97,18.6]};
/* Paste your Google Maps JavaScript API key between the quotes to use Google Maps. Leave empty to use OpenStreetMap. */
const GMAPS_KEY='';
const SEAT={Study:'Window 12A',Work:'Aisle 14C',Create:'Exit row 20F'};
const $=s=>document.querySelector(s),app=$('#app'),clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const KEY='aeroflight.v1';let D={};try{D=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}
D=Object.assign({home:'SFO',flights:[],amb:true,vol:50,active:null,playlists:[],theme:null},D);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}};
const st={dur:25,intent:'Study',to:null,no:null,last:null};let timer=0,wake=null;
const km=(a,b)=>{const r=Math.PI/180,[,la,lo]=AP[a],[,lb,lb2]=AP[b],x=Math.sin((lb-la)*r/2)**2+Math.cos(la*r)*Math.cos(lb*r)*Math.sin((lb2-lo)*r/2)**2;return Math.round(12742*Math.asin(Math.sqrt(x)))};
const others=h=>Object.keys(AP).filter(c=>c!==h).sort((a,b)=>km(h,a)-km(h,b));
const reach=(h=D.home,n=D.flights.length)=>Math.max(1500,km(h,others(h)[0]))+600*n; // distance unlocked by completed flights
const tier=d=>d<1500?'Regional hop':d<4000?'Continental':'Intercontinental';
const fmtT=s=>{s=Math.max(0,Math.ceil(s));const h=s/3600|0,m=s%3600/60|0;return(h?h+':'+String(m).padStart(2,'0'):String(m).padStart(2,'0'))+':'+String(s%60).padStart(2,'0')};
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',3000)}
const chips=(k,list)=>list.map(v=>`<button class="chip ${st[k]==v?'on':''}" data-act="${k}" data-v="${v}">${v}${k=='dur'?' min':''}</button>`).join('');

/* ---------- audio: generated cabin noise, loops seamlessly, works offline ---------- */
let au=null;
function audio(){if(au)return au;const c=new(window.AudioContext||window.webkitAudioContext)(),b=c.createBuffer(1,c.sampleRate*4,c.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=b;s.loop=true;
 const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=70;const pk=c.createBiquadFilter();pk.type='peaking';pk.frequency.value=140;pk.gain.value=8;
 const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2200;const g=c.createGain();g.gain.value=0;
 s.connect(hp).connect(pk).connect(lp).connect(g).connect(c.destination);s.start();return au={c,g}}
function ambience(on){try{const a=audio();a.c.resume();a.g.gain.setTargetAtTime(on?D.vol/100*.5:0,a.c.currentTime,.1)}catch(e){}}
function chime(){try{const a=audio();a.c.resume();[660,880,1320].forEach((f,i)=>{const o=a.c.createOscillator(),g=a.c.createGain(),t=a.c.currentTime+i*.3;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.2,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+1.5);o.connect(g).connect(a.c.destination);o.start(t);o.stop(t+1.6)})}catch(e){}}

/* ---------- route map (equirectangular, no external tiles) ---------- */
function geo(f,t){const p=c=>[AP[c][2]+180,90-AP[c][1]],a=p(f),b=p(t),d=Math.hypot(b[0]-a[0],b[1]-a[1]);return{a,b,c:[(a[0]+b[0])/2,(a[1]+b[1])/2-Math.min(45,d*.3)]}}
const bez=(g,t)=>{const u=1-t;return[u*u*g.a[0]+2*u*t*g.c[0]+t*t*g.b[0],u*u*g.a[1]+2*u*t*g.c[1]+t*t*g.b[1],2*u*(g.c[0]-g.a[0])+2*t*(g.b[0]-g.c[0]),2*u*(g.c[1]-g.a[1])+2*t*(g.b[1]-g.c[1])]};
let MK=1;
function mapSVG(f,t){const g=geo(f,t),xs=[g.a[0],g.b[0],g.c[0]],ys=[g.a[1],g.b[1],g.c[1]],x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 let w=Math.max(x1-x0,30)*1.6,h=Math.max(y1-y0,15)*1.6;if(w/h<2)w=h*2;else h=w/2;const vx=(x0+x1)/2-w/2,vy=(y0+y1)/2-h/2,k=MK=w/360;
 let s=`<svg class="map" viewBox="${vx} ${vy} ${w} ${h}" role="img" aria-label="Flight route map">`;
 for(let x=Math.ceil(vx/30)*30;x<vx+w;x+=30)s+=`<path d="M${x} ${vy}V${vy+h}" class="mg" stroke-width="${.4*k}"/>`;for(let y=Math.ceil(vy/30)*30;y<vy+h;y+=30)s+=`<path d="M${vx} ${y}H${vx+w}" class="mg" stroke-width="${.4*k}"/>`;
 for(const c in AP){const cx=AP[c][2]+180,cy=90-AP[c][1];if(c!==f&&c!==t&&cx>vx&&cx<vx+w&&cy>vy&&cy<vy+h)s+=`<circle cx="${cx}" cy="${cy}" r="${1.2*k}" class="md"/><text class="md" x="${cx+2*k}" y="${cy+3*k}" font-size="${5*k}" font-family="monospace">${c}</text>`}
 const d=`M${g.a} Q${g.c} ${g.b}`;s+=`<path d="${d}" fill="none" class="mr" stroke-width="${.8*k}" stroke-dasharray="${2*k} ${2*k}"/><path id="tr" d="${d}" pathLength="1" fill="none" class="mtr" stroke-width="${1.4*k}" stroke-dasharray="1" stroke-dashoffset="1"/>`;
 for(const[c,p]of[[f,g.a],[t,g.b]])s+=`<circle cx="${p[0]}" cy="${p[1]}" r="${2.6*k}" fill="#eaff00" stroke="#10121c" stroke-width="${.6*k}"/><text class="mt" x="${p[0]+4*k}" y="${p[1]-4*k}" font-size="${8*k}" font-weight="700" font-family="monospace">${c}</text>`;
 return s+`<path id="pl" fill="#eaff00" stroke="#10121c" stroke-width="${.5*k}" d="M0-7L2-1.5L8 2V3.5L2 2.5L1.5 6.5L3.5 8V9L0 8L-3.5 9V8L-1.5 6.5L-2 2.5L-8 3.5V2L-2-1.5Z"/></svg>`}

/* ---------- real map: Google Maps when GMAPS_KEY is set, otherwise (or on any failure) Leaflet + OpenStreetMap, then the grid map ---------- */
const PLANE_D='M0-9L2.4-2L10 2.6V4.4L2.4 3L1.8 8L4.4 10V11.2L0 10L-4.4 11.2V10L-1.8 8L-2.4 3L-10 4.4V2.6L-2.4-2Z';
const PLANE=`<svg viewBox="-10 -10 20 20" width="30" height="30"><path fill="#eaff00" stroke="#121421" stroke-width=".8" d="${PLANE_D}"/></svg>`;
const GDARK=[{elementType:'geometry',stylers:[{color:'#1d2338'}]},{elementType:'labels.text.fill',stylers:[{color:'#8d94b0'}]},{elementType:'labels.text.stroke',stylers:[{color:'#121421'}]},{featureType:'administrative',elementType:'geometry.stroke',stylers:[{color:'#3a4268'}]},{featureType:'poi',stylers:[{visibility:'off'}]},{featureType:'road',stylers:[{visibility:'off'}]},{featureType:'transit',stylers:[{visibility:'off'}]},{featureType:'water',elementType:'geometry',stylers:[{color:'#0b0e1a'}]}];
let LM=null,LP=[],mapGen=0,gmBad=false,gmP=null;
function gc(f,t,n=120){const r=Math.PI/180,[,a1,o1]=AP[f],[,a2,o2]=AP[t],v=(la,lo)=>[Math.cos(la*r)*Math.cos(lo*r),Math.cos(la*r)*Math.sin(lo*r),Math.sin(la*r)],A=v(a1,o1),B=v(a2,o2),w=Math.acos(clamp(A[0]*B[0]+A[1]*B[1]+A[2]*B[2],-1,1)),pts=[];let prev=o1;
 for(let i=0;i<=n;i++){const q=i/n,k=w?[Math.sin((1-q)*w)/Math.sin(w),Math.sin(q*w)/Math.sin(w)]:[1,0],x=k[0]*A[0]+k[1]*B[0],y=k[0]*A[1]+k[1]*B[1],z=k[0]*A[2]+k[1]*B[2];let lo=Math.atan2(y,x)/r;while(lo-prev>180)lo-=360;while(lo-prev<-180)lo+=360;prev=lo;pts.push([Math.asin(clamp(z,-1,1))/r,lo])}return pts}
const brg=(a,b)=>{const r=Math.PI/180,d=(b[1]-a[1])*r;return Math.atan2(Math.sin(d)*Math.cos(b[0]*r),Math.cos(a[0]*r)*Math.sin(b[0]*r)-Math.sin(a[0]*r)*Math.cos(b[0]*r)*Math.cos(d))/r};
function killMap(){if(LM&&LM.kind=='l')LM.map.remove();LM=null;mapGen++}
function loadGoogle(){if(window.google&&google.maps)return Promise.resolve();return gmP=gmP||new Promise((res,rej)=>{window.__gm=res;const s=document.createElement('script');s.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(GMAPS_KEY)+'&v=weekly&callback=__gm';s.async=true;s.onerror=()=>{gmP=null;rej()};document.head.appendChild(s)})}
window.gm_authFailure=()=>{gmBad=true;toast('Google rejected the Maps API key (check billing, restrictions and allowed websites). Using OpenStreetMap instead.');if(LM&&LM.kind=='g'&&D.active){killMap();initMap(D.active)}};
function initMap(f){killMap();const el=$('#lm');if(!el)return;const gen=mapGen;LP=gc(f.from,f.to);
 const fallback=()=>{if(gen!==mapGen)return;el.innerHTML='';if(window.L)leafInit(f,el);else{el.outerHTML=mapSVG(f.from,f.to);LM={kind:'s'}}};
 if(!GMAPS_KEY||gmBad)return fallback();
 loadGoogle().then(()=>{if(gen!==mapGen)return;try{gInit(f,el)}catch(e){fallback()}}).catch(fallback)}
const gPlane=r=>({path:PLANE_D,fillColor:'#eaff00',fillOpacity:1,strokeColor:'#121421',strokeWeight:1,scale:1.5,rotation:r});
function gInit(f,el){const G=google.maps,P=LP.map(p=>new G.LatLng(p[0],p[1],true)),map=new G.Map(el,{center:P[0],zoom:3,backgroundColor:'#0e101c',streetViewControl:false,mapTypeControl:false,fullscreenControl:false,gestureHandling:'cooperative',styles:document.documentElement.dataset.theme=='light'?[]:GDARK});
 new G.Polyline({map,path:P,strokeColor:'#6b74a8',strokeOpacity:.7,strokeWeight:2});const tr=new G.Polyline({map,path:[],strokeColor:'#eaff00',strokeWeight:3});
 for(const[c,p]of[[f.from,P[0]],[f.to,P[P.length-1]]])new G.Marker({map,position:p,icon:{path:G.SymbolPath.CIRCLE,scale:6,fillColor:'#eaff00',fillOpacity:1,strokeColor:'#121421',strokeWeight:2,labelOrigin:new G.Point(0,-2.4)},label:{text:c+' · '+AP[c][0],color:'#eaff00',fontWeight:'700',fontSize:'12px'}});
 const pl=new G.Marker({map,position:P[0],icon:gPlane(0),clickable:false,zIndex:9}),bnd=new G.LatLngBounds();P.forEach(p=>bnd.extend(p));map.fitBounds(bnd,50);LM={kind:'g',map,tr,pl,P}}
function leafInit(f,el){const map=L.map(el,{scrollWheelZoom:false});
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:12,crossOrigin:true,referrerPolicy:'strict-origin-when-cross-origin',attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map);
 L.polyline(LP,{color:'#6b74a8',weight:2,dashArray:'6 6'}).addTo(map);const tr=L.polyline([],{color:'#eaff00',weight:3}).addTo(map);
 for(const[c,i]of[[f.from,0],[f.to,LP.length-1]])L.circleMarker(LP[i],{radius:6,color:'#121421',weight:2,fillColor:'#eaff00',fillOpacity:1}).bindTooltip(c+' · '+AP[c][0],{permanent:true,direction:'top',className:'aero-label'}).addTo(map);
 const pl=L.marker(LP[0],{icon:L.divIcon({className:'plane',html:PLANE,iconSize:[30,30],iconAnchor:[15,15]}),interactive:false,keyboard:false}).addTo(map);
 map.fitBounds(L.latLngBounds(LP),{padding:[50,50]});LM={kind:'l',map,tr,pl}}
function updateMap(p){if(!LM||LM.kind=='s')return;const n=LP.length-1,x=p*n,i=Math.min(n-1,Math.floor(x)),u=x-i,a=LP[i],b=LP[i+1],pos=[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];
 if(LM.kind=='g'){const ll=new google.maps.LatLng(pos[0],pos[1],true);LM.tr.setPath(LM.P.slice(0,i+1).concat([ll]));LM.pl.setPosition(ll);LM.pl.setIcon(gPlane(brg(a,b)));return}
 LM.tr.setLatLngs(LP.slice(0,i+1).concat([pos]));LM.pl.setLatLng(pos);const q1=LM.map.latLngToLayerPoint(a),q2=LM.map.latLngToLayerPoint(b),el=LM.pl.getElement();
 if(el&&el.firstChild)el.firstChild.style.transform=`rotate(${Math.atan2(q2.y-q1.y,q2.x-q1.x)*180/Math.PI+90}deg)`}
function resizeMap(){if(!LM)return;if(LM.kind=='l')LM.map.invalidateSize();else if(LM.kind=='g'){google.maps.event.trigger(LM.map,'resize');const b=new google.maps.LatLngBounds();LM.P.forEach(p=>b.extend(p));LM.map.fitBounds(b,50)}}

/* ---------- views ---------- */
const LK={gh:'https://github.com/shubhamgtm',dc:'https://discord.gg/Prr3ux4Kc2',mail:'mailto:chat.shubhamgtm@gmail.com',qr:'https://qrifyyy.netlify.app'};
const PROJECTS=[['KeyRush','https://github.com/shubhamgtm/KeyRush-By-Shubham-Gautam','A project by Shubham Gautam. Explore the code on GitHub.'],['ZipLink','https://github.com/shubhamgtm/ZipLink-By-Shubham','A project by Shubham Gautam. Explore the code on GitHub.']];
const GH='<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>';
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const a=(u,t,c='btn g')=>`<a class="${c}" href="${u}"${u.startsWith('http')?' target="_blank" rel="noopener noreferrer"':''}>${t}</a>`;
const connect=()=>`<div class="btns">${a(LK.gh,GH+' Follow @shubhamgtm','btn')}${a(LK.dc,'💬 Join Discord')}${a(LK.mail,'✉ Email / DM')}</div>`;
const maker=()=>`<section class="card maker"><div class="avatar" aria-hidden="true">SG</div><div><h3>Made by Shubham Gautam</h3><p>Aero Flight was made by <b>Shubham Gautam</b>, a developer from Nepal. To support me, follow me on GitHub or DM me at <a href="${LK.mail}">chat.shubhamgtm@gmail.com</a>. I will respond as soon as possible. You can also join my Discord server to chat.</p>${connect()}</div></section>`;
const promo=()=>`<a class="promo" href="${LK.qr}" target="_blank" rel="noopener noreferrer"><span class="tag">Featured · by Shubham</span><b>QRify: free QR code generator</b><span class="mut">Turn links, text, emails and phone numbers into sharp QR codes in seconds. No sign-up, runs in your browser, download as PNG.</span><em>Open qrifyyy.netlify.app →</em></a>`;
const projects=()=>`<h2>More from Shubham</h2><div class="projects">${PROJECTS.map(([n,u,d])=>`<a class="proj" href="${u}" target="_blank" rel="noopener noreferrer"><b>${n}</b><span>${d}</span><em>View on GitHub →</em></a>`).join('')}</div>`;
const appCard=()=>`<section class="card appcard"><div><h3>⬇ Get the app</h3><p class="mut">Install Aero Flight on your phone, tablet or computer. It works offline and needs no account.</p><div class="btns"><button class="btn" data-act="install">Install app</button></div><p class="mut small">iPhone / iPad: tap Share, then “Add to Home Screen”.</p></div><div class="gh"><h3>${GH} GitHub &amp; community</h3><p class="mut">Follow <b>@shubhamgtm</b> for new projects, or join the Discord server.</p>${connect()}</div></section>`;
const FEAT=[['🎫','Boarding pass ritual','Tear your pass to commit to the session.'],['🗺️','Live world map','Watch your plane cross the real map as time passes.'],['🔊','Cabin ambience','Steady, seamless cabin noise to mask distractions.'],['🔓','Unlock routes','Start with short hops, earn longer flights.'],['🎵','Your music','Play a YouTube or Spotify playlist while you focus.'],['🌓','Dark & light','A theme that fits your eyes, day or night.']];
const doc=(h,p)=>`<h1>${h}</h1>${p}`;
const V={
'':()=>{const n=D.flights.length,m=D.flights.reduce((s,f)=>s+f.min,0),log=D.flights.slice(-5).reverse();return`<section class="hero"><div><span class="eyebrow">FREE · NO SIGNUP · WORKS OFFLINE</span><h1>Free focus timer.<br><span class="y">No signup.</span></h1><p class="lead">Aero Flight turns every focus block into a flight. Pick a route, tear your boarding pass and land safely when the timer ends. The timer sets your session length, not the flight distance.</p><div class="stats"><div><b>${n}</b><small>Flights</small></div><div><b>${m}</b><small>Focus min</small></div><div><b>${reach()}</b><small>Reach km</small></div></div></div>
<section class="card glow"><h3>Quick start</h3><div class="mut">Duration</div><div class="chips">${chips('dur',[25,50,90])}<input id="cust" type="number" min="5" max="180" placeholder="5-180" value="${[25,50,90].includes(st.dur)?'':st.dur}" aria-label="Custom minutes"></div><div class="mut">Intent</div><div class="chips">${chips('intent',['Study','Work','Create'])}</div><button class="btn" data-act="plan">Plan my flight →</button></section></section>
${log.length?`<section class="card"><h3>Flight log</h3><ul class="log">${log.map(f=>`<li><b>${f.from} → ${f.to}</b><span>${f.min} min · ${f.intent}</span><span class="mut">${new Date(f.at).toLocaleDateString()}</span></li>`).join('')}</ul></section>`:''}
<h2>Everything you need to focus</h2><div class="feat">${FEAT.map(([i,t,d])=>`<div><span class="ic">${i}</span><b>${t}</b><p>${d}</p></div>`).join('')}</div>${appCard()}${promo()}${projects()}${maker()}`},
plan:()=>{const r=reach(),L=others(D.home);return`<h1>Pick your <span class="y">destination</span></h1><div class="cols"><section class="card"><h3>Departure</h3><select id="home" aria-label="Home airport">${Object.keys(AP).map(c=>`<option value="${c}" ${c==D.home?'selected':''}>${c} · ${AP[c][0]}</option>`).join('')}</select> <button class="chip" data-act="geo">Use my location (optional)</button><h3 style="margin-top:18px">Seat type</h3><div class="chips">${chips('intent',['Study','Work','Create'])}</div><div class="mut">${st.dur} min · ${SEAT[st.intent]}</div></section>
<section class="card"><h3>Destination</h3><p class="mut">Complete flights to unlock longer routes and new cities. Completed: ${D.flights.length}.</p><div class="dest">${L.map(c=>{const d=km(D.home,c),ok=d<=r;return`<button class="d ${st.to==c&&ok?'on':''}" ${ok?`data-act="to" data-v="${c}"`:'disabled'}><b>${c}</b> ${AP[c][0]}<small>${d} km · ${tier(d)}</small><small>${ok?'Unlocked':'🔒 '+Math.ceil((d-r)/600)+' more flight(s) to unlock'}</small></button>`}).join('')}</div></section></div>
<button class="btn" data-act="pass" ${st.to&&km(D.home,st.to)<=r?'':'disabled'}>Get boarding pass →</button>`},
pass:()=>{st.no=st.no||'AFX'+(100+Math.random()*900|0);return`<h1>Your <span class="y">boarding pass</span></h1><p class="lead">Tear the stub to board. It is a promise to yourself: once you board, stay focused until you land.</p>
<div class="pass" id="pass"><div class="main"><div style="color:#5b5d70;font-size:12px;letter-spacing:.12em">AERO FLIGHT · BOARDING PASS</div><div class="route">${D.home} → ${st.to}</div><div>${AP[D.home][0]} to ${AP[st.to][0]}</div>
<div class="row"><div>Flight<b>${st.no}</b></div><div>Duration<b>${st.dur} min</b></div><div>Seat<b>${st.intent} · ${SEAT[st.intent].split(' ')[1]}</b></div><div>Gate<b>${'ABCD'[st.no.slice(-1)%4]}${st.no.slice(3,5)%30+1}</b></div></div></div>
<div class="stub" id="stub" role="button" aria-label="Tear the stub to board"><div class="bc"></div><b>TEAR ▶</b><br>drag to board</div></div><div class="btns"><button class="btn" data-act="tear">Tear &amp; board</button><button class="btn g" data-act="plan">Back</button></div>`},
flight:()=>{const f=D.active;return`<div class="flight"><div><div class="meta mut" style="text-align:inherit">${f.from} → ${f.to} · ${f.no} · ${f.intent}</div><div class="timer" id="t">--:--</div><div class="pbar"><i id="pb"></i></div>
<div class="ctl"><button class="btn g" data-act="sheet" data-v="amb">🔊 Ambience</button><button class="btn g" data-act="sheet" data-v="music">🎵 Music</button><button class="btn g" data-act="pure">Pure Mode</button><button class="btn g" data-act="fs">Full screen</button><button class="btn g" data-act="abort">Abort</button></div></div>
${window.L||GMAPS_KEY?'<div id="lm" class="map"></div>':mapSVG(f.from,f.to)}</div>`},
landed:()=>{const f=st.last;return`<h1>Safe <span class="y">landing</span></h1><p class="lead">You stayed focused and landed in ${AP[f.to][0]}. Well done.</p><div class="card grid"><div><small>Duration</small><b>${f.min} min</b></div><div><small>Seat type</small><b>${f.intent}</b></div><div><small>Route</small><b>${f.from} → ${f.to}</b></div><div><small>Landed at</small><b>${new Date(f.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</b></div></div>
${f.fresh.length?`<div class="card"><h3>🔓 New destinations unlocked</h3>${f.fresh.map(c=>`${c} · ${AP[c][0]}`).join(', ')}${f.more?' and more':''}</div>`:''}<div class="btns"><button class="btn" data-act="plan">Board another flight</button><button class="btn g" data-act="share">Share</button><button class="btn g" data-act="home">Home</button></div><p class="mut">Total flights: ${D.flights.length} · Total focus: ${D.flights.reduce((s,x)=>s+x.min,0)} min</p>${promo()}`},
about:()=>doc('About <span class="y">Aero Flight</span>',`<p class="lead">Aero Flight is a free focus timer that turns work into a journey. Choosing a route, tearing a boarding pass and watching your plane cross the map gives you a commitment structure a plain countdown does not.</p><div class="card"><h3>Features</h3><ul><li>Every focus block is a flight with a destination and a boarding pass</li><li>Steady cabin noise that loops seamlessly</li><li>Live world map that follows your timer</li><li>Unlockable routes: regional hops first, then continental and intercontinental</li><li>Play your own YouTube or Spotify playlist</li><li>Pure Mode: just the timer. Exit with Esc or a double-tap</li><li>Dark and light themes; installable and offline-ready; no account</li></ul></div><p>The timer length, not the flight distance, decides how long you focus. <a href="#/">Start a flight</a></p>${maker()}${appCard()}${promo()}${projects()}`),
students:()=>doc('Aero Flight for <span class="y">Students</span>',`<p class="lead">Revision, essays and problem sets go better with a start line and a finish line.</p><div class="card"><ul><li>Pick Study as your seat type and a 25 or 50 minute flight for a lecture-sized block</li><li>Use 90 minutes for essay drafts and past papers</li><li>Cabin noise or your own study playlist masks dorm and library chatter</li><li>Free, no signup, nothing to hand over</li></ul></div><a class="btn" href="#/">Start a study flight</a>${promo()}`),
developers:()=>doc('Aero Flight for <span class="y">Developers</span>',`<p class="lead">Protect deep work: one task, one flight, no context switching.</p><div class="card"><ul><li>Choose Work for a 90 minute deep-work block, or 25 for a quick bug fix</li><li>Pure Mode leaves only the timer on a side monitor</li><li>Install it as an app and it runs offline on a plane or a train</li><li>No account, no tracking, your history stays in your browser</li></ul></div><a class="btn" href="#/">Start a deep-work flight</a>${maker()}`),
privacy:()=>doc('<span class="y">Privacy</span>',`<div class="card"><ul><li>Aero Flight collects <b>no personal data</b>. There are no accounts, analytics or ads.</li><li>Your unlocked routes, flight history, playlists and theme are stored only in your browser (localStorage) and never leave your device.</li><li>Your location is <b>never required</b>. If you tap "Use my location", it is used once to find the nearest airport and is not stored or sent anywhere.</li><li>The flight map is loaded from OpenStreetMap (or Google Maps, if the site owner enabled it) and the map library from jsDelivr. Like any website they can see your IP address and the map area shown.</li><li>If you add a YouTube or Spotify playlist, that player loads from YouTube/Spotify, which may set their own cookies once you play it.</li><li>Links to GitHub, Discord and QRify lead to other websites with their own policies.</li></ul><div class="btns"><button class="btn g" data-act="clear">Delete all my Aero Flight data</button></div></div>`)};

/* ---------- logic ---------- */
const TITLES={about:'About',students:'For Students',developers:'For Developers',privacy:'Privacy',plan:'Plan your flight',pass:'Boarding pass',landed:'Safe landing'};
function render(){let k=location.hash.slice(2).split('?')[0];k=Object.prototype.hasOwnProperty.call(V,k)?k:'';
 const info=['about','students','developers','privacy'];
 if(D.active&&!info.includes(k))k='flight';else if(!D.active&&k=='flight')k='';
 if(k=='pass'&&(!st.to||km(D.home,st.to)>reach()))k='plan';if(k=='landed'&&!st.last)k='';
 const want=k?'#/'+k:'#/';if(location.hash!==want)history.replaceState(null,'',want);
 clearInterval(timer);killMap();document.body.classList.remove('pure');closeSheets();
 document.title=(k=='flight'?'':(TITLES[k]?TITLES[k]+' | ':'')+'Aero Flight | Free focus timer. No signup.').trim()||'Aero Flight';
 app.innerHTML=V[k]();document.querySelectorAll('.top nav a').forEach(x=>x.classList.toggle('on',x.getAttribute('href')=='#/'+k));
 scrollTo({top:0,left:0,behavior:'instant'});if(matchMedia('(display-mode: standalone)').matches)document.querySelectorAll('[data-act=install]').forEach(b=>b.hidden=true);
 if(k=='pass')tearInit();if(k=='flight'){if(Date.now()>=D.active.end)return land();initMap(D.active);tick();timer=setInterval(tick,250)}}
function tick(){const f=D.active;if(!f||!$('#t'))return;const now=Date.now(),p=clamp((now-f.start)/(f.end-f.start),0,1),g=geo(f.from,f.to),[x,y,dx,dy]=bez(g,p);
 updateMap(p);$('#t').textContent=fmtT((f.end-now)/1000);$('#pb').style.width=p*100+'%';$('#tr')?.setAttribute('stroke-dashoffset',1-p);
 $('#pl')?.setAttribute('transform',`translate(${x} ${y}) rotate(${Math.atan2(dy,dx)*180/Math.PI+90}) scale(${.8*MK})`);document.title=fmtT((f.end-now)/1000)+' · Aero Flight';if(p>=1)land()}
function tearInit(){const s=$('#stub');let x0=null,dx=0;s.onpointerdown=e=>{x0=e.clientX;s.setPointerCapture(e.pointerId);s.style.transition='none'};
 s.onpointermove=e=>{if(x0===null)return;dx=Math.max(0,e.clientX-x0);s.style.transform=`translateX(${dx}px) rotate(${dx/14}deg)`};
 s.onpointerup=()=>{if(x0===null)return;x0=null;s.style.transition='';dx>80?tear():s.style.transform=''};s.onpointercancel=()=>{x0=null;s.style.transition='';s.style.transform=''}}
let tearing=false;
function tear(){if(tearing)return;tearing=true;$('#stub').classList.add('torn');$('#pass').classList.add('go');setTimeout(()=>{tearing=false;board()},650)}
function lock(){try{navigator.wakeLock?.request('screen').then(w=>wake=w).catch(()=>{})}catch(e){}}
function board(){if(!st.to||D.active)return;const n=Date.now();D.active={from:D.home,to:st.to,min:st.dur,intent:st.intent,no:st.no,start:n,end:n+st.dur*60000};save();st.no=null;ambience(D.amb);lock();location.hash='#/flight';render()}
function land(){const f=D.active;if(!f)return;clearInterval(timer);const before=reach(),h=f.from;D.flights.push({...f,at:Date.now()});D.active=null;
 const after=reach(h),fresh=others(h).filter(c=>km(h,c)>before&&km(h,c)<=after);save();ambience(false);chime();try{wake?.release()}catch(e){}
 st.last={...f,at:Date.now(),fresh:fresh.slice(0,4),more:fresh.length>4};st.to=null;location.hash='#/landed';render()}
const pure=on=>{closeSheets();document.body.classList.toggle('pure',on);setTimeout(resizeMap,60);if(on)toast('Pure Mode: double-tap or press Esc to exit')};

/* theme */
const sysTheme=()=>matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
function applyTheme(t){document.documentElement.dataset.theme=t;$('#thm').textContent=t=='dark'?'☀️':'🌙';$('#thm').setAttribute('aria-label',t=='dark'?'Switch to light mode':'Switch to dark mode');
 document.querySelector('meta[name=theme-color]').content=t=='dark'?'#0e1020':'#f2f4fb';if(LM&&LM.kind=='g')LM.map.setOptions({styles:t=='light'?[]:GDARK})}

/* sheets */
function closeSheets(){document.querySelectorAll('.sheet').forEach(s=>s.classList.remove('open'));$('#scrim').classList.remove('on')}
function sheet(id){const el=$('#s-'+id),open=!el.classList.contains('open');closeSheets();if(open){el.classList.add('open');$('#scrim').classList.add('on')}}

/* music: YouTube or Spotify links, saved in this browser */
const spo=(t,id)=>({kind:'sp',tall:!['track','episode'].includes(t),src:`https://open.spotify.com/embed/${t}/${id}?utm_source=generator&theme=0`,label:'Spotify '+t});
function parseMedia(u){u=u.trim();let m=u.match(/^spotify:(playlist|album|track|episode|show|artist):([A-Za-z0-9]+)/);if(m)return spo(m[1],m[2]);
 let x;try{x=new URL(/^https?:\/\//i.test(u)?u:'https://'+u)}catch(e){return null}const h=x.hostname.replace(/^(www|m|music)\./,'');
 if(h=='open.spotify.com'){m=x.pathname.match(/\/(?:intl-[a-z-]+\/)?(?:embed\/)?(playlist|album|track|episode|show|artist)\/([A-Za-z0-9]+)/);return m?spo(m[1],m[2]):null}
 if(['youtube.com','youtube-nocookie.com','youtu.be'].includes(h)){const list=x.searchParams.get('list');let v=h=='youtu.be'?x.pathname.slice(1):x.searchParams.get('v');const e=x.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/);if(e)v=e[1];v=v&&/^[\w-]{11}$/.test(v)?v:null;if(!v&&!list)return null;
  const q=new URLSearchParams({autoplay:'1',rel:'0',playsinline:'1'});if(list)q.set('list',list);return{kind:'yt',src:`https://www.youtube-nocookie.com/embed/${v||'videoseries'}?${q}`,label:list?'YouTube playlist':'YouTube video'}}
 return null}
function playMedia(p){const box=$('#mplayer');box.textContent='';const f=document.createElement('iframe');f.title='Music player';f.src=p.src;f.allow='autoplay; encrypted-media; fullscreen; clipboard-write; picture-in-picture';f.referrerPolicy='strict-origin-when-cross-origin';
 f.style.height=p.kind=='sp'?(p.tall?'352px':'152px'):'';f.style.aspectRatio=p.kind=='yt'?'16/9':'';box.appendChild(f);if(!navigator.onLine)toast('You are offline: music needs an internet connection.')}
function musicList(){const l=D.playlists||[];$('#mlist').innerHTML=l.length?l.map((p,i)=>`<li><span title="${esc(p.url)}">${esc(p.name)}</span><button class="btn" data-act="mplay" data-v="${i}">▶ Play</button><button class="btn g" data-act="mdel" data-v="${i}" aria-label="Remove ${esc(p.name)}">✕</button></li>`).join(''):'<li class="mut">No playlists yet. Add one above.</li>'}
function addMusic(){const url=$('#murl').value.trim(),p=parseMedia(url);if(!p)return toast('Paste a YouTube or Spotify link (video, playlist, album or track).');
 D.playlists=D.playlists||[];if(D.playlists.length>=20)return toast('You can save up to 20 playlists. Remove one first.');
 D.playlists.push({name:($('#mname').value.trim()||p.label).slice(0,40),url});save();$('#murl').value='';$('#mname').value='';musicList();playMedia(p)}

/* events */
document.addEventListener('dragstart',e=>e.preventDefault());
document.addEventListener('contextmenu',e=>{if(D.active&&!e.target.closest('input,textarea'))e.preventDefault()}); // no long-press / right-click menu during a flight
addEventListener('keydown',e=>{if(e.key=='Escape'){pure(false);closeSheets()}});
let lt=0;app.addEventListener('touchend',()=>{const n=Date.now();if(n-lt<300&&document.body.classList.contains('pure'))pure(false);lt=n});
app.addEventListener('dblclick',()=>{if(document.body.classList.contains('pure'))pure(false)});
let ip;const showInst=on=>document.querySelectorAll('.top [data-act=install]').forEach(b=>b.hidden=!on);
addEventListener('beforeinstallprompt',e=>{e.preventDefault();ip=e;showInst(true)});addEventListener('appinstalled',()=>{ip=null;showInst(false);toast('Aero Flight installed!')});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const A=b.dataset.act,v=b.dataset.v;
 if(A=='dur'){st.dur=+v;render()}else if(A=='intent'){st.intent=v;render()}else if(A=='to'){st.to=v;render()}else if(A=='plan')location.hash='#/plan';else if(A=='home')location.hash='#/';
 else if(A=='pass')location.hash='#/pass';else if(A=='tear')tear();else if(A=='sheet')sheet(v||'amb');else if(A=='pure')pure(true);
 else if(A=='theme'){D.theme=document.documentElement.dataset.theme=='dark'?'light':'dark';save();applyTheme(D.theme)}
 else if(A=='install'){if(ip){ip.prompt();ip=null;showInst(false)}else toast('Use your browser menu: Install app / Add to Home Screen')}
 else if(A=='madd')addMusic();else if(A=='mplay'){const p=parseMedia(D.playlists[+v].url);p?playMedia(p):toast('That link cannot be played.')}
 else if(A=='mdel'){D.playlists.splice(+v,1);save();musicList()}else if(A=='mstop')$('#mplayer').textContent='';
 else if(A=='share'){const f=st.last,url=location.origin+location.pathname,txt=`I just finished a ${f.min}-minute focus flight ${f.from} → ${f.to} on Aero Flight ✈`;
  if(navigator.share)navigator.share({title:'Aero Flight',text:txt,url}).catch(()=>{});else navigator.clipboard?.writeText(txt+' '+url).then(()=>toast('Copied to clipboard'),()=>toast('Could not copy'))}
 else if(A=='clear'){if(confirm('Delete all your Aero Flight data on this device?')){try{localStorage.removeItem(KEY)}catch(x){}D={home:'SFO',flights:[],amb:true,vol:50,active:null,playlists:[]};ambience(false);location.hash='#/';location.reload()}}
 else if(A=='fs'){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>toast('Full screen is not supported here'))}catch(x){toast('Full screen is not supported here')}}
 else if(A=='abort'){if(confirm('End this flight early? It will not count.')){D.active=null;save();ambience(false);location.hash='#/';render()}}
 else if(A=='geo'){if(!navigator.geolocation)return toast('Location is not available');navigator.geolocation.getCurrentPosition(p=>{let best=null,bd=1e9;for(const c in AP){const d=Math.hypot(AP[c][1]-p.coords.latitude,(AP[c][2]-p.coords.longitude)*Math.cos(p.coords.latitude*Math.PI/180));if(d<bd){bd=d;best=c}}D.home=best;st.to=null;save();toast('Nearest airport: '+best);render()},()=>toast('Location was not shared. Pick an airport instead.'))}});
$('#scrim').onclick=closeSheets;
app.addEventListener('change',e=>{if(e.target.id=='cust'){const v=Math.round(+e.target.value);if(v>=5&&v<=180)st.dur=v;else toast('Enter 5 to 180 minutes');render()}if(e.target.id=='home'){D.home=e.target.value;st.to=null;save();render()}});
$('#amb').checked=D.amb;$('#vol').value=D.vol;
$('#amb').onchange=e=>{D.amb=e.target.checked;save();ambience(D.amb&&!!D.active)};$('#vol').oninput=e=>{D.vol=+e.target.value;save();if(D.active&&D.amb)ambience(true)};
$('#murl').addEventListener('keydown',e=>{if(e.key=='Enter')addMusic()});
addEventListener('hashchange',render);addEventListener('visibilitychange',()=>{if(!document.hidden&&D.active){tick();lock()}});
matchMedia('(prefers-color-scheme: light)').addEventListener?.('change',()=>{if(!D.theme)applyTheme(sysTheme())});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
applyTheme(D.theme||sysTheme());musicList();render();

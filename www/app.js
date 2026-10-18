const K="dompet-pelajar-v1",$=id=>document.getElementById(id);
let S={budget:0,tx:[],saves:[],debts:[],limits:{},rem:{on:false,t:"19:00"},goal:{name:"Tabungan impian",target:100000}};
try{const r=localStorage.getItem(K);if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
const persist=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
const rp=n=>(n<0?"-":"")+"Rp"+Math.abs(Math.round(n)).toLocaleString("id-ID");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const sum=a=>a.reduce((s,x)=>s+x.amt,0);
function ld(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
const uid=()=>Date.now()+""+Math.random().toString(36).slice(2,6);
function calc(){
 const m=ld().slice(0,7),mo=a=>a.filter(x=>x.date.startsWith(m));
 const out=sum(mo(S.tx).filter(t=>t.type=="out")),inn=sum(mo(S.tx).filter(t=>t.type=="in")),sv=sum(mo(S.saves));
 const d=new Date(),left=new Date(d.getFullYear(),d.getMonth()+1,0).getDate()-d.getDate()+1;
 const sisa=S.budget+inn-out-sv;
 return{sisa,left,per:sisa/left,mo,out,inn,sv}
}
function render(){
 const c=calc();
 $("bulan").textContent=new Date().toLocaleDateString("id-ID",{month:"long",year:"numeric"});
 $("sisa").textContent=rp(c.sisa);
 $("per").textContent=!S.budget&&!S.tx.length?"Isi uang saku dulu di bawah ya":c.sisa<=0?"Uang bulan ini sudah habis, hati-hati ya!":"Boleh dipakai sekitar "+rp(c.per)+" per hari ("+c.left+" hari lagi)";
 const by={};c.mo(S.tx).filter(t=>t.type=="out").forEach(t=>by[t.cat]=(by[t.cat]||0)+t.amt);
 const e=Object.entries(by).sort((a,b)=>b[1]-a[1]),mx=e.length?e[0][1]:1;
 const ks=[...new Set([...Object.keys(by),...Object.keys(S.limits)])].sort((a,b)=>(by[b]||0)-(by[a]||0));
 $("cats").innerHTML=ks.length?ks.map(k=>{const v=by[k]||0,l=S.limits[k]||0,w=l?Math.min(100,v/l*100):v/mx*100;return`<div class="cat${l&&v>l?" over":""}"><div class="t"><span>${({Makan:"🍜",Transport:"🚌",Jajan:"🧋",Sekolah:"📚",Hiburan:"🎮",Lainnya:"📦"})[k]||""} ${k}</span><b>${rp(v)}${l?" / "+rp(l):""}</b></div><div class="b"><i style="width:${w}%"></i></div></div>`}).join(""):'<div class="mu">Belum ada pengeluaran bulan ini.</div>';
 extra(c,by,e);const tot=sum(S.saves),g=S.goal,pct=g.target>0?Math.min(100,tot/g.target*100):0;
 $("gname").textContent="🎯 "+g.name;$("gtot").textContent=rp(tot)+" / "+rp(g.target);$("gbar").style.width=pct+"%";
 const rest=g.target-tot;
 $("ginfo").textContent=rest<=0?"Target tercapai, selamat! 🎉":Math.round(pct)+"% tercapai. Nabung Rp2.000 per hari, "+Math.ceil(rest/2000)+" hari lagi tercapai.";
 const items=[...S.tx.map(t=>({k:"tx",id:t.id,date:t.date,amt:t.amt,pos:t.type=="in",l:(CE[t.cat]||"")+" "+t.cat+(t.note?" · "+t.note:"")})),...S.saves.map(s=>({k:"sv",id:s.id,date:s.date,amt:s.amt,pos:true,l:"🐷 Menabung"}))].sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
 $("list").innerHTML=items.length?items.map(i=>`<div class="it"><div class="l"><b>${esc(i.l)}</b><span class="mu">${i.date.slice(8)}/${i.date.slice(5,7)}</span></div><b class="${i.pos?"pos":"neg"}">${i.pos?"+":"−"}${rp(i.amt)}</b><button class="x" onclick="del('${i.k}','${i.id}')">✕</button></div>`).join(""):'<div class="mu">Belum ada catatan.</div>';
}
function extra(c,by,e){
 $("st").innerHTML=`<div><span class="mu">Masuk</span><b class="pos">${rp(c.inn)}</b></div><div><span class="mu">Keluar</span><b class="neg">${rp(c.out)}</b></div><div><span class="mu">Ditabung</span><b>${rp(c.sv)}</b></div>`;
 const tp=e[0];
 $("tip").textContent=!S.budget&&!S.tx.length?"Mulai dengan mengisi uang saku bulananmu ya.":c.sisa<0?"Pengeluaranmu melewati uang saku bulan ini. Coba kurangi jajan dulu sampai akhir bulan.":!c.sv?"Belum nabung bulan ini. Mulai Rp1.000 aja dulu, yang penting rutin!":tp&&c.out&&tp[1]/c.out>.4?"Pengeluaran terbesarmu di "+tp[0]+" ("+Math.round(tp[1]/c.out*100)+"%). Coba cari yang bisa dihemat di situ.":"Keuanganmu sehat bulan ini, pertahankan ya! 👍";
 const f=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"),
 days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d}),
 vs=days.map(d=>sum(S.tx.filter(t=>t.type=="out"&&t.date==f(d)))),m=Math.max(...vs,1);
 $("chart").innerHTML=days.map((d,i)=>`<div><small>${vs[i]?Math.round(vs[i]/1000)+"k":""}</small><i style="height:${Math.max(2,vs[i]/m*60)}px"></i>${["Min","Sen","Sel","Rab","Kam","Jum","Sab"][d.getDay()]}</div>`).join("");
 const ds=new Set(S.saves.map(s=>s.date));let n=0,d=new Date();if(!ds.has(f(d)))d.setDate(d.getDate()-1);
 while(ds.has(f(d))){n++;d.setDate(d.getDate()-1)}
 $("streak").textContent=n?"🔥 Streak nabung "+n+" hari berturut-turut!":"Nabung hari ini untuk mulai streak 🔥";
 const oe=sum(S.debts.filter(x=>x.dir=="owe"&&!x.done)),le=sum(S.debts.filter(x=>x.dir=="lent"&&!x.done));
 $("dowe").textContent=rp(oe);$("dlent").textContent="Piutang kamu ke teman: "+rp(le);
 $("dlist").innerHTML=S.debts.length?S.debts.map(x=>`<div class="it" style="${x.done?"opacity:.5;text-decoration:line-through":""}"><div class="l"><b>${esc(x.who)}</b><span class="mu">${x.dir=="owe"?"Kamu utang":"Utang ke kamu"} · ${x.date.slice(8)}/${x.date.slice(5,7)}</span></div><b class="${x.dir=="owe"?"neg":"pos"}">${rp(x.amt)}</b>${x.done?"":`<button class="ok" onclick="paid('${x.id}')">Lunas</button>`}<button class="x" onclick="delD('${x.id}')">✕</button></div>`).join(""):'<div class="mu">Belum ada catatan utang.</div>';
 const td=sum(S.tx.filter(t=>t.type=="out"&&t.date==ld())),al=(c.sisa+td)/c.left,pc=al>0?Math.min(100,td/al*100):100;
 $("ring").style.cssText="--p:"+pc+";--c:"+(pc<70?"#86efac":pc<100?"#fde047":"#fca5a5");
 $("today").textContent=rp(Math.max(0,c.per));
 $("wk").textContent="Minggu ini maks "+rp(Math.max(0,c.per)*Math.min(7,c.left));
 $("chal").innerHTML=[...Array(30)].map((_,i)=>`<button class="${S.saves.some(s=>s.id=="c"+(i+1))?"d":""}" onclick="chal(${i+1})">${i+1}</button>`).join("");
 const tt=sum(S.saves),B=[["🐣","Nabung pertama",S.saves.length>0],["🔥","Streak 3 hari",n>=3],["⚡","Streak 7 hari",n>=7],["💯","Total Rp100rb",tt>=1e5],["💎","Total Rp500rb",tt>=5e5],["🎯","Target tercapai",tt>=S.goal.target],["🧾","10 catatan",S.tx.length>=10],["🤝","Utang lunas",S.debts.some(x=>x.done)],["🛡️","Di bawah jatah",S.budget>0&&c.sisa>0]];
 $("bdg").innerHTML=B.map(b=>`<div class="${b[2]?"on":""}"><i>${b[0]}</i>${b[1]}</div>`).join("");
 S.bills=S.bills||[];
 const dn=new Date(),D=dn.getDate(),dm=new Date(dn.getFullYear(),dn.getMonth()+1,0).getDate(),ym=f(dn).slice(0,7);
 const bills=S.bills.map(b=>{const dd=Math.min(b.day,dm);return{...b,in:dd>=D?dd-D:dm-D+dd}}).sort((a,b)=>a.in-b.in);
 $('bl').innerHTML=bills.length?bills.map(b=>`<div class='it'><div class='l'><b>${esc(b.name)}</b><span class='mu'>Tiap tanggal ${b.day} · ${b.in?b.in+' hari lagi':'hari ini!'}</span></div><b>${rp(b.amt)}</b><button class='x' data-i='${b.id}' onclick='delB(this.dataset.i)'>✕</button></div>`).join(''):"<div class='mu'>Belum ada tagihan rutin.</div>";
 const dsp=[...Array(dm)].map((_,i)=>sum(S.tx.filter(t=>t.type=='out'&&t.date==ym+'-'+String(i+1).padStart(2,'0')))),hm=Math.max(...dsp,1),fd=new Date(dn.getFullYear(),dn.getMonth(),1).getDay();
 $('heat').innerHTML="<div style='visibility:hidden'></div>".repeat(fd)+dsp.map((v,i)=>`<div class='${i+1==D?'t':''}' style='--a:${v?0.15+0.7*v/hm:0.06}'>${i+1}</div>`).join('');
 const pe=S.budget+c.inn,avg=c.out/D,dl=avg>0?c.sisa/avg:99,pace=pe>0?(c.out/pe)/(D/dm):0;
 let pr;
 if(!S.budget&&!c.out)pr='Isi uang saku dan catat pengeluaran untuk melihat prediksi.';
 else if(c.sisa<=0)pr='Uang bulan ini sudah habis.';
 else if(avg==0||dl>=c.left)pr='Dengan pola sekarang, uangmu aman sampai akhir bulan 🎉';
 else{const x=new Date();x.setDate(x.getDate()+Math.floor(dl));pr='Dengan pola jajan sekarang, uang habis sekitar tanggal '+x.getDate()+' ('+Math.round(c.left-dl)+' hari sebelum akhir bulan).'}
 const s1=pace<=1?50:Math.max(0,50-(pace-1)*50),s2=pe>0?Math.min(30,c.sv/pe/0.2*30):0,ov=Object.keys(S.limits).filter(k=>(by[k]||0)>S.limits[k]).length,sc=S.budget>0?Math.round(s1+s2+Math.max(0,20-ov*10)):0;
 $('sc').style.cssText='--p:'+sc+';--c:'+(sc>=70?'#22c55e':sc>=40?'#f59e0b':'#ef4444');
 $('scv').textContent=S.budget>0?sc:'-';
 $('scl').textContent=S.budget>0?'Kesehatan keuangan: '+(sc>=80?'Luar biasa 🌟':sc>=60?'Bagus 👍':sc>=40?'Lumayan 🙂':'Waspada ⚠️'):'Skor belum tersedia';
 $('prd').textContent=pr;
 $('bll').textContent=bills.length?'🧾 '+bills[0].name+' '+rp(bills[0].amt)+', '+(bills[0].in?bills[0].in+' hari lagi':'hari ini!'):'';
 $('r532').innerHTML=[['🏠 Kebutuhan 50%',0.5],['🎮 Keinginan 30%',0.3],['🐷 Tabungan 20%',0.2]].map(([nm,p])=>`<div class='it'><div class='l'><b>${nm}</b></div><b>${rp(S.budget*p)}</b></div>`).join('')+`<div class='mu' style='margin-top:6px'>Bulan ini kamu menabung ${pe>0?Math.round(c.sv/pe*100):0}% dari uang masuk.</div>`;
 const hr=dn.getHours();
 $('bulan').textContent=(hr<11?'Selamat pagi ☀️':hr<15?'Selamat siang 🌤️':hr<18?'Selamat sore 🌇':'Selamat malam 🌙')+' · '+$('bulan').textContent;
 cu($('sisa'),c.sisa);cu($('today'),Math.max(0,c.per));
 const lk=f(new Date(dn.getFullYear(),dn.getMonth()-1,1)).slice(0,7),lo=sum(S.tx.filter(t=>t.type=='out'&&t.date.startsWith(lk)&&+t.date.slice(8)<=D));
 if(lo>0&&c.out>0){const pc2=Math.round((c.out-lo)/lo*100);$('prd').textContent+=' Pengeluaran '+(pc2>=0?'naik '+pc2:'turun '+(-pc2))+'% dibanding bulan lalu di periode yang sama.'}
 const bc=B.filter(b=>b[2]).length;if(window._bc!==undefined&&bc>window._bc){toast('🏅 Lencana baru terbuka!');boom()}window._bc=bc;
 remind();
}
const CE={Makan:'🍜',Transport:'🚌',Jajan:'🧋',Sekolah:'📚',Hiburan:'🎮',Lainnya:'📦'};
function cu(el,v){if(el._v===v)return;const a=el._v||0,t0=performance.now();el._v=v;(function s(t){const p=Math.min(1,(t-t0)/600);el.textContent=rp(a+(v-a)*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(s)})(t0)}
function boom(){for(let i=0;i<26;i++){const s=document.createElement('span');s.textContent=['🎉','✨','💰','🪙','🎊'][i%5];s.style.cssText='position:fixed;top:-30px;left:'+Math.random()*100+'vw;font-size:'+(16+Math.random()*16)+'px;z-index:40;pointer-events:none;transition:transform '+(1.6+Math.random()*1.2)+'s ease-in,opacity 2.5s';document.body.appendChild(s);requestAnimationFrame(()=>{s.style.transform='translateY(110vh) rotate('+Math.random()*360+'deg)';s.style.opacity=0});setTimeout(()=>s.remove(),3300)}}
const LN=()=>window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;
async function sched(){const L=LN();if(!L)return;try{await L.cancel({notifications:[{id:1}]});const R=S.rem||{};if(!R.on)return;const p=await L.requestPermissions();if(p.display!=='granted')return;const [h,m]=R.t.split(':').map(Number);await L.schedule({notifications:[{id:1,title:'Waktunya nabung! 🐷',body:'Sisihkan Rp1.000 aja dulu, yang penting rutin.',schedule:{on:{hour:h,minute:m},allowWhileIdle:true}}]})}catch(e){}}
function cicil(){const h=+$('ch').value,b=+$('cb').value/100,n=+$('cn').value;if(!(h>0&&n>0))return $('cr').textContent='Isi harga dan tenor ya.';const m=b>0?h*b/(1-Math.pow(1+b,-n)):h/n;$('cr').textContent='Cicilan '+rp(m)+'/bulan, total bayar '+rp(m*n)+' (lebih mahal '+rp(m*n-h)+')'}
function worth(){const p=+$('wp').value;if(!(p>0))return $('wr').textContent='Isi harga barangnya ya.';const c=calc();$('wr').textContent='Setara '+(p/Math.max(c.per,1)).toFixed(1)+' hari jatah jajanmu, atau '+Math.ceil(p/2000)+' hari nabung Rp2.000. '+(p>c.sisa?'Melebihi sisa uangmu bulan ini, tunda dulu ya!':'Masih terjangkau, tapi tahan 24 jam dulu sebelum beli.')}
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('s');if(navigator.vibrate)navigator.vibrate(25);clearTimeout(toast.i);toast.i=setTimeout(()=>t.classList.remove('s'),2200)}
function addBill(){const n=$('bn').value.trim(),a=+$('ba').value,d=Math.round(+$('bd').value);if(!n||!(a>0)||!(d>=1&&d<=31))return toast('Isi nama, nominal, dan tanggal 1-31 ya');S.bills=S.bills||[];S.bills.push({id:uid(),name:n,amt:a,day:d});$('bn').value=$('ba').value=$('bd').value='';persist();render()}
function delB(id){S.bills=S.bills.filter(b=>b.id!=id);persist();render()}
let IP;addEventListener('beforeinstallprompt',e=>{e.preventDefault();IP=e;$('ib').style.display='inline-block'});
function inst(){if(IP)IP.prompt()}
function theme(){const r=document.documentElement,d=r.dataset.theme=="dark"||!r.dataset.theme&&matchMedia("(prefers-color-scheme:dark)").matches;r.dataset.theme=d?"light":"dark"}
function setRem(on){S.rem={on:!!on,t:$("rt").value||"19:00"};remind.s=0;persist();sched();if(on)try{Notification.requestPermission()}catch(e){}render()}
function remind(){
 const R=S.rem||{},n=new Date(),t=String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0"),b=$("ban"),due=R.on&&t>=R.t&&!S.saves.some(s=>s.date==ld());
 $("rs").textContent=R.on?"Aktif jam "+R.t+". Pengingat muncul selama halaman ini terbuka.":"Belum aktif. Pengingat muncul selama halaman ini terbuka (notifikasi browser dipakai bila diizinkan).";
 b.style.display=due?"block":"none";
 if(due){b.innerHTML="⏰ Waktunya nabung! Sisihkan Rp1.000 aja dulu 🐷<br><button onclick=\"addSave(1000)\">Tabung Rp1.000</button>";
  if(!remind.s){remind.s=1;try{if(Notification.permission=="granted")new Notification("Waktunya nabung! 🐷")}catch(e){}}}
}
function chal(i){const id="c"+i,x=S.saves.findIndex(s=>s.id==id);if(x>=0)S.saves.splice(x,1);else S.saves.push({id,amt:1000,date:ld()});persist();render()}
function addDebt(dir){const a=+$("damt").value,w=$("dwho").value.trim();if(!(a>0)||!w)return;S.debts.push({id:uid(),who:w,amt:a,dir,done:false,date:ld()});$("damt").value=$("dwho").value="";persist();render()}
function paid(id){const x=S.debts.find(y=>y.id==id);if(x)x.done=true;persist();render()}
function delD(id){S.debts=S.debts.filter(x=>x.id!=id);persist();render()}
function setLimit(){const k=$("lc").value,r=$("lv").value;if(r===""||+r<0)return;if(+r)S.limits[k]=+r;else delete S.limits[k];$("lv").value="";persist();render()}
function split(){const t=+$("pt").value,n=+$("pn").value;$("pr").textContent=t>0&&n>0?"Per orang: "+rp(Math.ceil(t/n/100)*100)+" (dibulatkan ke atas Rp100)":"Isi total dan jumlah orang ya."}
function sim(){const a=+$("sa").value,d=+$("sd").value;$("sr").textContent=a>0&&d>0?"Dalam "+d+" hari kamu punya "+rp(a*d)+" 🎉":"Isi nominal dan jumlah hari ya."}
function backup(){const j=JSON.stringify(S);$("bk").value=j;$("bk").select();try{navigator.clipboard.writeText(j).catch(()=>{});$("bm").textContent="Teks dibuat (dan disalin kalau diizinkan)."}catch(e){$("bm").textContent="Salin teks di atas secara manual."}}
function restore(){try{const o=JSON.parse($("bk").value);if(!o||!Array.isArray(o.tx))throw 0;S=Object.assign({budget:0,tx:[],saves:[],debts:[],limits:{},goal:S.goal},o);persist();render();$("bm").textContent="Data berhasil dipulihkan ✓"}catch(e){$("bm").textContent="Teks tidak valid, tempel hasil Cadangkan ya."}}
function setBud(){const v=+$("bud").value;if(v>=0){S.budget=v;persist();render();$("msg").textContent=""}}
function addTx(type){
 const a=+$("amt").value;
 if(!(a>0)){$("msg").textContent="Isi nominalnya dulu ya.";return}
 S.tx.push({id:uid(),type,amt:a,cat:$("cat").value,note:$("note").value.trim(),date:ld()});
 $("amt").value="";$("note").value="";$("msg").textContent="Tersimpan ✓";persist();render();
}
function addSave(a){
 if(!(a>0))return;
 S.saves.push({id:uid(),amt:a,date:ld()});toast('🐷 +'+rp(a)+' masuk tabungan!');$("sv").value="";persist();render();
}
function setGoal(){
 const n=$("gn").value.trim(),t=+$("gt").value;
 if(n)S.goal.name=n;if(t>0)S.goal.target=t;
 $("gn").value="";$("gt").value="";persist();render();
}
function del(k,id){
 if(k=="tx")S.tx=S.tx.filter(x=>x.id!=id);else S.saves=S.saves.filter(x=>x.id!=id);
 persist();render();
}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{
 document.querySelectorAll(".tabs button,section").forEach(x=>x.classList.remove("on"));
 b.classList.add("on");$(b.dataset.t).classList.add("on");
});
if(S.budget>0)$("bud").value=S.budget;$("lc").innerHTML=$("cat").innerHTML;if(S.rem)$("rt").value=S.rem.t;setInterval(remind,30000);sched();
document.querySelectorAll('.tabs button').forEach((b,i)=>b.innerHTML='<span>'+['🏠','🐷','🏆','🤝','🧰','🧾'][i]+'</span>'+b.textContent.replace('🏆 ','').replace('Tabungan','Tabung'));
try{const c=document.createElement('canvas');c.width=c.height=180;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,180,180);g.addColorStop(0,'#6366f1');g.addColorStop(1,'#ec4899');x.fillStyle=g;x.fillRect(0,0,180,180);x.font='96px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('💰',90,98);const l=document.createElement('link');l.rel='apple-touch-icon';l.href=c.toDataURL();document.head.appendChild(l)}catch(e){}
render();

// Versi web (PWA): daftarkan service worker hanya kalau dibuka lewat hosting biasa
if("serviceWorker"in navigator&&location.protocol.startsWith("http")&&location.hostname!=="localhost")addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));

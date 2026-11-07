import{auth,db}from'./firebase.js';
import{onAuthStateChanged}from'https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js';
import{httpsCallable,getFunctions}from'https://www.gstatic.com/firebasejs/12.5.0/firebase-functions.js';
import{ref,onValue,query,limitToLast}from'https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js';
const fn=getFunctions(undefined,'us-central1'),call=n=>httpsCallable(fn,n),$=id=>document.getElementById(id);
const number=v=>Number(v||0).toLocaleString();
function row(label,value){const e=document.createElement('div');e.className='row';const a=document.createElement('span'),b=document.createElement('strong');a.textContent=label;b.textContent=value;e.append(a,b);return e;}
function renderRecent(id,data,kind){const root=$(id);root.replaceChildren();const items=Object.values(data||{}).reverse().slice(0,10);if(!items.length){root.textContent=kind==='transactions'?'No transactions yet.':'No matches played yet.';return;}items.forEach(x=>{let label,value;if(kind==='transactions'){label=(x.type||'Transaction').replaceAll('-',' ');const d=x.delta||{};value=Object.entries(d).filter(([,v])=>Number(v)!==0).map(([k,v])=>`${Number(v)>0?'+':''}${number(v)} ${k.toUpperCase()}`).join(' · ')||'No balance change';}else{label=`${(x.mode||'game').toUpperCase()} · ${(x.result||'').toUpperCase()}`;value=`${x.move||'—'} vs ${x.opponentMove||'—'}`;}root.append(row(label,value));});}
onAuthStateChanged(auth,async u=>{if(!u)return;try{const data=(await call('ensurePlayer')({})).data,p=data.profile;$('profileName').value=p.displayName||'';$('profileEmail').textContent=u.email||p.email||'—';$('profileId').textContent=p.playerId||'Unavailable';
$('copyPlayerId').onclick=async()=>{try{await navigator.clipboard.writeText(p.playerId);$('profileMessage').textContent='Player ID copied.';}catch{$('profileMessage').textContent='Copy is unavailable in this browser. Select the ID and copy it manually.';}};
onValue(ref(db,`wallets/${u.uid}`),s=>{const w=s.val()||{};const root=$('profileWallet');root.replaceChildren();['gold','silver','bronze','vxb'].forEach(k=>root.append(row(k.toUpperCase(),number(w[k]))));});
onValue(ref(db,`playerStats/${u.uid}`),s=>{const x=s.val()||{};$('profileWins').textContent=number(x.wins);$('profileLosses').textContent=number(x.losses);$('profileDraws').textContent=number(x.draws);$('profileRounds').textContent=`${number(x.rounds)} total rounds`;});
onValue(query(ref(db,`transactions/${u.uid}`),limitToLast(20)),s=>renderRecent('profileTransactions',s.val(),'transactions'));
onValue(query(ref(db,`matches/${u.uid}`),limitToLast(20)),s=>renderRecent('profileMatches',s.val(),'matches'));
}catch(e){$('profileMessage').textContent=e.message||'Could not load profile.';}});
$('profileForm')?.addEventListener('submit',async e=>{e.preventDefault();$('profileMessage').textContent='Saving…';try{const r=(await call('updatePlayerProfile')({displayName:$('profileName').value.trim()})).data;$('profileMessage').textContent=`Profile saved. Permanent Player ID: ${r.playerId}`;}catch(err){$('profileMessage').textContent=err.message||'Profile update failed.';}});

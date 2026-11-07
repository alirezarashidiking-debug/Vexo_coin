import {auth,db} from './firebase.js';
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut,updateProfile} from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js';
import {httpsCallable,getFunctions} from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-functions.js';
const $=id=>document.getElementById(id),functions=getFunctions(undefined,'us-central1'),ensurePlayer=httpsCallable(functions,'ensurePlayer'),updatePlayerProfile=httpsCallable(functions,'updatePlayerProfile');
const msg=t=>{if($('message'))$('message').textContent=t};
let authActionInProgress=false;
async function finish(user,displayName=''){
  await ensurePlayer({});
  if(displayName){
    await updatePlayerProfile({displayName});
    await updateProfile(user,{displayName});
  }
  location.replace('dashboard.html');
}
if($('loginForm'))$('loginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const email=$('email').value.trim(),pass=$('password').value,name=$('username')?.value.trim()||'',mode=$('mode').value;
  try{
    authActionInProgress=true;
    if(mode==='signup'&&name.length<3)throw Error('Username must contain at least 3 characters.');
    if(mode==='signup'&&pass!==$('confirm').value)throw Error('Passwords do not match.');
    const cred=mode==='signup'?await createUserWithEmailAndPassword(auth,email,pass):await signInWithEmailAndPassword(auth,email,pass);
    await finish(cred.user,mode==='signup'?name:'');
  }catch(err){authActionInProgress=false;msg(err.message||'Authentication failed.');}
});
if($('google'))$('google').onclick=async()=>{authActionInProgress=true;try{const c=await signInWithPopup(auth,new GoogleAuthProvider());await finish(c.user);}catch(e){authActionInProgress=false;msg(e.message||'Google sign-in failed.');}};
if($('logout'))$('logout').onclick=()=>signOut(auth).then(()=>location.replace('login.html'));
onAuthStateChanged(auth,async u=>{
  document.querySelectorAll('[data-user-email]').forEach(x=>x.textContent=u?.email||'Guest');
  const protectedPage=document.body.dataset.protected==='true';
  const onLogin=!!$('loginForm');
  if(u){
    if((onLogin&&!authActionInProgress)||location.pathname.endsWith('/index.html')||location.pathname==='/'){location.replace('dashboard.html');return;}
    try{await ensurePlayer({});}catch(e){console.error('Player bootstrap failed',e);if(protectedPage){location.replace('login.html');return;}}
    if(protectedPage)document.body.style.visibility='visible';
  }else{
    if(protectedPage){location.replace('login.html');return;}
    if(onLogin)document.body.style.visibility='visible';
  }
});

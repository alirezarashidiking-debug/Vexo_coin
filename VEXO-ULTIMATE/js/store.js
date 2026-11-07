import {auth} from './firebase.js';
import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js';
import {httpsCallable,getFunctions} from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-functions.js';
import {TON_NETWORK,TON_MANIFEST_URL} from './tonconnect-config.js';
const $=id=>document.getElementById(id), fn=getFunctions(undefined,'us-central1'), call=n=>httpsCallable(fn,n);
let currentUser=null, walletVerified=false, activeOrder=null, tc=null, statusBusy=false;
const userReady=new Promise(resolve=>{const unsub=onAuthStateChanged(auth,u=>{currentUser=u; if(u){unsub();resolve(u);}});});
function message(text){$('storeMessage').textContent=text;}
function setBuyEnabled(enabled){document.querySelectorAll('[data-buy]').forEach(b=>b.disabled=!enabled);}
function setWalletStatus(text){$('walletStatus').textContent=text;}
function showAddress(address){return address?`${address.slice(0,8)}…${address.slice(-8)}`:'';}
if(!window.TON_CONNECT_UI){setWalletStatus('TON Connect library did not load. Refresh the page or check your internet connection.');}
else {
  tc=new window.TON_CONNECT_UI.TonConnectUI({manifestUrl:TON_MANIFEST_URL,buttonRootId:'ton-connect'});
  tc.setConnectionNetwork(TON_NETWORK);
  tc.onStatusChange(async wallet=>{
    if(!wallet){walletVerified=false;setBuyEnabled(false);$('disconnectWallet').hidden=true;setWalletStatus('Wallet disconnected. Connect and verify again.');return;}
    $('disconnectWallet').hidden=false;
    if(wallet.account?.chain!==TON_NETWORK){walletVerified=false;setBuyEnabled(false);setWalletStatus('Wrong network. VEXO accepts TON Mainnet only.');try{await tc.disconnect();}catch(_){}return;}
    const item=wallet.connectItems?.tonProof;
    if(!item||!('proof' in item)){walletVerified=false;setBuyEnabled(false);setWalletStatus(`Wallet ${showAddress(wallet.account.address)} connected, but ownership proof was not returned. Disconnect and reconnect using the VEXO button.`);return;}
    if(statusBusy)return; statusBusy=true;
    try{
      await userReady;
      const result=await call('verifyTonWallet')({address:wallet.account.address,network:wallet.account.chain,walletStateInit:wallet.account.walletStateInit,proof:item.proof});
      walletVerified=!!result.data.verified;setBuyEnabled(walletVerified);
      setWalletStatus(walletVerified?`Verified TON Mainnet wallet: ${showAddress(result.data.address)}`:'Wallet verification was not completed.');
      if(walletVerified)message('Wallet verified and securely linked to your VEXO Firebase account. Choose a package to create a Mainnet invoice.');
    }catch(e){walletVerified=false;setBuyEnabled(false);setWalletStatus(`Wallet verification failed: ${e.message}`);}
    finally{statusBusy=false;}
  });
}
$('connectWallet')?.addEventListener('click',async()=>{
  if(!tc){message('TON Connect is unavailable. Refresh and try again.');return;}
  try{
    await userReady;
    if(tc.wallet&&!walletVerified)await tc.disconnect();
    const nonceResult=await call('getTonProofNonce')({});
    tc.setConnectRequestParameters({state:'ready',value:{tonProof:nonceResult.data.nonce}});
    await tc.openModal();
  }catch(e){message(`Could not start wallet connection: ${e.message}`);}
});
$('disconnectWallet')?.addEventListener('click',async()=>{try{await tc?.disconnect();}catch(e){message(e.message);}});
document.querySelectorAll('[data-buy]').forEach(button=>button.addEventListener('click',async()=>{
  if(!currentUser||!walletVerified){message('Sign in and verify your TON Mainnet wallet first.');return;}
  try{
    const result=await call('createMainnetTonOrder')({package:button.dataset.buy});activeOrder=result.data;
    $('invoicePanel').hidden=false;$('verifyPayment').hidden=false;
    $('invoiceDetails').textContent=`Package: ${activeOrder.gold} Gold · Amount: ${(Number(activeOrder.amountNano)/1e9).toFixed(9).replace(/0+$/,'').replace(/\.$/,'')} TON · Network: TON Mainnet · Receiver: ${activeOrder.receiver} · Memo: ${activeOrder.memo}`;
    message('Invoice created. Review the receiver and amount, then approve the transfer in your connected wallet.');
  }catch(e){message(`Invoice error: ${e.message}`);}
}));
$('payWithTonkeeper')?.addEventListener('click',async()=>{
  if(!tc?.wallet||!walletVerified||!activeOrder){message('Connect and verify your wallet and create an invoice first.');return;}
  try{
    await tc.sendTransaction({validUntil:Math.floor(Date.now()/1000)+300,network:TON_NETWORK,messages:[{address:activeOrder.receiver,amount:String(activeOrder.amountNano),payload:activeOrder.payload}]});
    message('Wallet accepted the transaction request. Wait for TON Mainnet confirmation, then tap Verify payment.');
  }catch(e){message(`Transaction was not completed: ${e.message}`);}
});
$('verifyPayment')?.addEventListener('click',async()=>{
  if(!activeOrder)return;
  try{const result=await call('verifyMainnetTonOrder')({orderId:activeOrder.orderId});if(result.data.status==='paid'){message(`Payment confirmed on TON Mainnet. ${result.data.gold} Gold credited to your Firebase wallet. Transaction: ${result.data.txHash}`);$('verifyPayment').hidden=true;$('payWithTonkeeper').disabled=true;}else message(result.data.message||'Payment is not indexed yet. Please wait and verify again.');}
  catch(e){message(`Verification error: ${e.message}`);}
});
onAuthStateChanged(auth,u=>{if(!u){walletVerified=false;setBuyEnabled(false);message('Sign in to VEXO before connecting a wallet or purchasing.');}});

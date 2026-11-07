const {
  Address, Cell, contractAddress, loadStateInit, domainSignVerify,
  WalletContractV1R1, WalletContractV1R2, WalletContractV1R3,
  WalletContractV2R1, WalletContractV2R2,
  WalletContractV3R1, WalletContractV3R2,
  WalletContractV4, WalletContractV5R1,
} = require('@ton/ton');
const { createHash } = require('node:crypto');

function loadV1(slice) { slice.loadUint(32); return slice.loadBuffer(32); }
function loadV2(slice) { slice.loadUint(32); return slice.loadBuffer(32); }
function loadV3(slice) { slice.loadUint(32); slice.loadUint(32); return slice.loadBuffer(32); }
function loadV4(slice) { slice.loadUint(32); slice.loadUint(32); return slice.loadBuffer(32); }
function loadV5(slice) { slice.loadBoolean(); slice.loadUint(32); slice.loadUint(32); return slice.loadBuffer(32); }

const layouts = [
  [WalletContractV1R1, loadV1], [WalletContractV1R2, loadV1], [WalletContractV1R3, loadV1],
  [WalletContractV2R1, loadV2], [WalletContractV2R2, loadV2],
  [WalletContractV3R1, loadV3], [WalletContractV3R2, loadV3],
  [WalletContractV4, loadV4], [WalletContractV5R1, loadV5],
].filter(([Contract]) => Contract && typeof Contract.create === 'function')
 .map(([Contract, load]) => ({ code: Contract.create({ workchain: 0, publicKey: Buffer.alloc(32) }).init.code, load }));

function extractPublicKey(stateInit) {
  if (!stateInit.code || !stateInit.data) return null;
  for (const item of layouts) {
    try { if (item.code.equals(stateInit.code)) return item.load(stateInit.data.beginParse()); }
    catch (_) { /* try the next known wallet layout */ }
  }
  return null;
}
function sha256(value) { return createHash('sha256').update(value).digest(); }
function verifyTonProof({ address, network, walletStateInit, proof, expectedDomain, expectedPayload }) {
  if (network !== '-239') throw new Error('Only TON Mainnet wallets are accepted.');
  if (!proof || typeof proof.signature !== 'string' || typeof proof.payload !== 'string') throw new Error('TON proof is missing.');
  if (proof.domain?.value !== expectedDomain) throw new Error('Wallet proof domain does not match this VEXO site.');
  if (proof.domain?.lengthBytes !== Buffer.byteLength(expectedDomain, 'utf8')) throw new Error('Invalid proof domain length.');
  if (proof.payload !== expectedPayload) throw new Error('Wallet proof nonce does not match.');
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(proof.timestamp) || Math.abs(now - proof.timestamp) > 15 * 60) throw new Error('Wallet proof expired. Reconnect and try again.');
  const wanted = Address.parse(address);
  const stateInit = loadStateInit(Cell.fromBase64(walletStateInit).beginParse());
  const derived = contractAddress(wanted.workChain, stateInit);
  if (!derived.equals(wanted)) throw new Error('Wallet state does not match the reported address.');
  const publicKey = extractPublicKey(stateInit);
  if (!publicKey) throw new Error('This wallet contract version is not supported for ownership verification yet.');
  const wc = Buffer.alloc(4); wc.writeInt32BE(wanted.workChain, 0);
  const domainBytes = Buffer.from(proof.domain.value, 'utf8');
  const domainLen = Buffer.alloc(4); domainLen.writeUInt32LE(proof.domain.lengthBytes, 0);
  const timestamp = Buffer.alloc(8); timestamp.writeBigUInt64LE(BigInt(proof.timestamp), 0);
  const message = Buffer.concat([
    Buffer.from('ton-proof-item-v2/', 'utf8'), wc, Buffer.from(wanted.hash),
    domainLen, domainBytes, timestamp, Buffer.from(proof.payload, 'utf8'),
  ]);
  const digest = sha256(Buffer.concat([Buffer.from([0xff, 0xff]), Buffer.from('ton-connect', 'utf8'), sha256(message)]));
  const signature = Buffer.from(proof.signature, 'base64');
  if (signature.length !== 64 || !domainSignVerify({ data: digest, signature, publicKey, domain: { type: 'empty' } })) {
    throw new Error('Wallet ownership signature is invalid.');
  }
  return wanted;
}
module.exports = { verifyTonProof };

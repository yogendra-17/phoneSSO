import * as Crypto from 'expo-crypto';

const toBase64 = (hex: string): string => {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = Uint8Array.from(clean.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || []);
  // btoa not available in RN; use Buffer ponyfill
  // eslint-disable-next-line no-undef
  return Buffer.from(bytes).toString('base64');
};

const toBase64Url = (inputB64: string): string =>
  inputB64.replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const padHex = (hex: string, length: number): string => {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  return clean.padEnd(length, '0').slice(0, length);
};

export const demoKeygen = async () => {
  const randomHex = await Crypto.getRandomBytesAsync(32).then((bytes) =>
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );

  const shareHex = randomHex; // 32B random client share (hex)
  const publicKeyHex = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, shareHex);
  const publicKeyB64 = toBase64(publicKeyHex);
  const keyId = toBase64Url(
    await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, publicKeyB64)
      .then(toBase64)
  );

  const keyshareB64 = toBase64(shareHex);

  return { keyshareB64, publicKeyB64, keyId };
};

export const demoSign = async (keyId: string, msgHash: string) => {
  const msgLower = msgHash.toLowerCase();
  const input = `${keyId}:${msgLower}`;
  const digestHex = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
  const r = padHex(digestHex.slice(0, 64), 64);
  const s = padHex(digestHex.slice(64, 128), 64);
  const v = 27;
  return { r, s, v };
};


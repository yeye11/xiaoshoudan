// 简易加密工具：使用 Web Crypto AES-GCM + PBKDF2 派生密钥
// 文件格式：
// [magic: Uint8Array('CYPRIDINA1')] + [salt(16)] + [iv(12)] + [ciphertext]

const MAGIC = new TextEncoder().encode('CYPRIDINA1');

async function getKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 120_000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptJsonToBinary(data: any, password: string): Promise<Blob> {
  const json = new TextEncoder().encode(JSON.stringify(data));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKeyFromPassword(password, salt);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, json));

  const out = new Uint8Array(MAGIC.length + salt.length + iv.length + ciphertext.length);
  out.set(MAGIC, 0);
  out.set(salt, MAGIC.length);
  out.set(iv, MAGIC.length + salt.length);
  out.set(ciphertext, MAGIC.length + salt.length + iv.length);
  return new Blob([out], { type: 'application/octet-stream' });
}

export async function decryptBinaryToJson(blob: Blob, password: string): Promise<any> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  // 校验 magic
  for (let i = 0; i < MAGIC.length; i++) {
    if (buf[i] !== MAGIC[i]) throw new Error('文件格式错误或非加密导出文件');
  }
  const saltStart = MAGIC.length;
  const ivStart = saltStart + 16;
  const dataStart = ivStart + 12;
  const salt = buf.slice(saltStart, saltStart + 16);
  const iv = buf.slice(ivStart, ivStart + 12);
  const ciphertext = buf.slice(dataStart);
  const key = await getKeyFromPassword(password, salt);
  const plainBuf = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext));
  const jsonStr = new TextDecoder().decode(plainBuf);
  return JSON.parse(jsonStr);
}

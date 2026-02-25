import { encrypt, decrypt } from '../../src/config/encryption';

describe('AES-256-GCM encryption', () => {
  it('encrypts and decrypts a string', () => {
    const plaintext = 'sensitive-data-12345';
    const ciphertext = encrypt(plaintext);
    expect(ciphertext).not.toBe(plaintext);
    expect(decrypt(ciphertext)).toBe(plaintext);
  });

  it('produces different ciphertext for same input (random IV)', () => {
    const plaintext = 'test';
    const ct1 = encrypt(plaintext);
    const ct2 = encrypt(plaintext);
    expect(ct1).not.toBe(ct2);
  });

  it('throws on tampered ciphertext', () => {
    const ciphertext = encrypt('test');
    const parts = ciphertext.split(':');
    parts[2] = 'tampered';
    expect(() => decrypt(parts.join(':'))).toThrow();
  });
});

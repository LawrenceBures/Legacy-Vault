const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function generateShortCode(length = 9): string {
  let code = 'ev';
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

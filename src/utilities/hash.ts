import crypto from 'crypto';

const salt = '0123456789abcdefghijklmnopqrstuvwxyz0123456789';

export function hash(input: string): string {
  const sha256 = crypto.createHmac('sha256', salt);
  return sha256.update(input).digest('hex');
}

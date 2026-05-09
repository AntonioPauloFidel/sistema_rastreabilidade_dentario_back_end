import { createHash } from 'crypto';

export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function hashValue(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function hashCpf(cpf: string) {
  return hashValue(onlyDigits(cpf));
}

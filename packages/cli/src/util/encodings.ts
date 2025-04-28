export function decodeAsUtf8(buffer: Buffer): string | false {
  try {
    return new TextDecoder('UTF-8', { fatal: true }).decode(buffer);
  } catch {
    return false;
  }
}

export function decodeAsUtf16(buffer: Buffer): string | false {
  try {
    return new TextDecoder('UTF-16', { fatal: true }).decode(buffer);
  } catch {
    return false;
  }
}

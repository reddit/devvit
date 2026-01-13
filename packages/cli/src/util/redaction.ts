export function shouldRedact(argv: string[]): boolean {
  // Users may include secrets when using this command incorrectly, so we redact it.
  return argv[0] === 'settings' && argv[1] === 'set';
}

export function isWebContainer(): boolean {
  return process.env.SHELL === '/bin/jsh' && !!process.versions.webcontainer;
}

export function getPlatformFromEnvironment(): typeof process.platform | 'bolt' {
  if (isWebContainer()) {
    return 'bolt';
  }

  return process.platform;
}

export function isWebContainer(): boolean {
  return process.env.SHELL === '/bin/jsh' && !!process.versions.webcontainer;
}

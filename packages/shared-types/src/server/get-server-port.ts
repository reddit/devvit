import process from 'node:process';

/**
 * Gets the port the internal server should run on. Call this when starting the server to get the
 * port to use.
 * @example createServer(myHandler).listen(getServerPort());
 * @returns The port to use for the server.
 */
export function getServerPort(): number {
  const envPort = Number(process.env.WEBBIT_PORT);
  if (isNaN(envPort)) {
    return 3000;
  }
  return envPort;
}

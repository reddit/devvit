/**
 *  Resolves to the next line from stdin. Note that Mac has a 1024 character
 *  input limit, so if you're trying to read something longer than that, you'll
 *  need to use a different method.
 */
export function readLine(): Promise<Buffer> & { reject(): void } {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  let resolve: (buffer: Buffer) => void;
  let reject!: () => void;
  return Object.assign(
    new Promise<Buffer>((pResolve, pReject) => {
      resolve = pResolve;
      reject = pReject;
      process.stdin.once('data', resolve);
    }).finally(() => {
      process.stdin.pause();
      process.stdin.removeListener('data', resolve);
    }),
    { reject }
  );
}

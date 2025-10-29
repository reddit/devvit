import path from 'node:path';
import url from 'node:url';

import { createRequire } from 'module';

/**
 * Package name to version detail for package.json dependencies. See BuildInfo.
 * Eg:
 *
 *   @devvit/protos → 1.2.3
 *   @devvit/public-api → 4.5.6
 *   @devvit/payments → 4.5.6
 *   node → 7.8.9
 */
export type BuildInfoDependencies = {
  [name: string]: string;
};

/**
 * Collect significant dependencies and devDependencies. Also includes Node.js
 * (under the "node" key).
 * @arg dir The absolute or relative directory to resolve from . Usually,
 *          `path.join(process.cwd(), 'src')`.
 */
export function newBuildInfoDependencies(dir: string): BuildInfoDependencies {
  const deps: BuildInfoDependencies = {
    // Strip the leading "v" from "v1.2.3".
    node: process.version.replace(/^v/, ''),
  };

  const packages = [
    {
      // A user app should always have @devvit/public-api as a direct dependency.
      // Absence is actionable.
      name: '@devvit/protos',
      throwIfNotFound: false,
    },
    { name: '@devvit/client', throwIfNotFound: false },
    { name: '@devvit/server', throwIfNotFound: false },
    { name: '@devvit/public-api', throwIfNotFound: true },
    {
      // Payments is not a required dependency for all apps,
      // so we don't throw if it's not found.
      name: '@devvit/payments',
      throwIfNotFound: false,
    },
    { name: '@devvit/web', throwIfNotFound: false },
  ];

  // Get the version of each package.
  // If the package is not found, throw an error if throwIfNotFound is true.
  for (const { name, throwIfNotFound } of packages) {
    const packageJSONPath = `${name}/package.json`;
    try {
      const packageJSON = requireFromDir(dir, packageJSONPath);
      deps[name] = (packageJSON as { version: string }).version;
    } catch (err) {
      if (throwIfNotFound) {
        throw Error(`missing ${name} npm dependency`, { cause: err });
      }
    }
  }

  return deps;
}

/** Throws if missing. */
export function requireFromDir(dir: string, id: string): unknown {
  // Dirs must end in with a slash to be interpreted as a dir not a file.
  const require = createRequire(url.pathToFileURL(path.join(dir, path.sep)));
  return require(id); // eslint-disable-line security/detect-non-literal-require
}

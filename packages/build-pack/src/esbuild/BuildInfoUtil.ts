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
    '@devvit/protos',
    '@devvit/client',
    '@devvit/server',
    '@devvit/public-api',
    '@devvit/payments',
    '@devvit/web',
  ];

  // Get the version of each package.
  let foundAtLeastOnePackage = false;
  for (const name of packages) {
    const packageJSONPath = `${name}/package.json`;
    try {
      const packageJSON = requireFromDir(dir, packageJSONPath);
      deps[name] = (packageJSON as { version: string }).version;
      foundAtLeastOnePackage = true;
    } catch {
      // no op
    }
  }

  if (!foundAtLeastOnePackage) {
    throw Error(`missing a dependency on at least one of: ${packages.join(', ')}`);
  }

  return deps;
}

/** Throws if missing. */
export function requireFromDir(dir: string, id: string): unknown {
  // Dirs must end in with a slash to be interpreted as a dir not a file.
  const require = createRequire(url.pathToFileURL(path.join(dir, path.sep)));
  return require(id); // eslint-disable-line security/detect-non-literal-require
}

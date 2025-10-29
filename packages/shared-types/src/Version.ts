// to-do: move to service + CLI shared package.
// Do not use in @devvit/public-api. Protos not in externalized @devvit/protos
// barrel.

import type { AppVersionInfo } from '@devvit/protos/community.js';

export enum VersionBumpType {
  Major = 'major',
  Minor = 'minor',
  Patch = 'patch',
  Prerelease = 'prerelease',
}

export class DevvitVersion {
  #major: number;
  #minor: number;
  #patch: number;
  #prerelease: number | undefined;

  static fromString(str: string): DevvitVersion {
    const parts = str.split('.').map((p) => parseInt(p));

    // check that each part is a number
    parts.forEach((p) => {
      if (isNaN(p)) {
        throw new Error('DevvitVersion parts can only be numbers');
      }
    });

    if (parts.length < 3 || parts.length > 4) {
      throw new Error(
        'DevvitVersion should only consist of a major, minor, patch, and an optional prerelease number'
      );
    }
    return new DevvitVersion(parts[0], parts[1], parts[2], parts[3]);
  }

  static fromProtoAppVersionInfo(
    version: Pick<AppVersionInfo, 'majorVersion' | 'minorVersion' | 'patchVersion'> &
      Partial<Pick<AppVersionInfo, 'prereleaseVersion'>>
  ): DevvitVersion {
    return new DevvitVersion(
      version.majorVersion,
      version.minorVersion,
      version.patchVersion,
      version.prereleaseVersion
    );
  }

  constructor(major: number, minor: number, patch: number, prerelease?: number) {
    this.#major = major;
    this.#minor = minor;
    this.#patch = patch;
    this.#prerelease = prerelease === -1 ? undefined : prerelease;
  }

  get major(): number {
    return this.#major;
  }

  get minor(): number {
    return this.#minor;
  }

  get patch(): number {
    return this.#patch;
  }

  get prerelease(): number | undefined {
    return this.#prerelease;
  }

  // create a new clone
  clone(): DevvitVersion {
    return DevvitVersion.fromString(this.toString());
  }

  isEqual(rhs: Readonly<DevvitVersion>): boolean {
    return this.toString() === rhs.toString();
  }

  bumpVersion(bumpType: VersionBumpType): void {
    switch (bumpType) {
      case VersionBumpType.Major: {
        this.#major++;
        this.#minor = 0;
        this.#patch = 0;
        this.#prerelease = undefined;
        break;
      }
      case VersionBumpType.Minor: {
        this.#minor++;
        this.#patch = 0;
        this.#prerelease = undefined;
        break;
      }
      case VersionBumpType.Patch: {
        this.#patch++;
        this.#prerelease = undefined;
        break;
      }
      case VersionBumpType.Prerelease: {
        if (this.#prerelease == null) this.#prerelease = 0;
        this.#prerelease++;
        break;
      }
    }
  }

  newerThan(rhs: Readonly<DevvitVersion>): boolean {
    return this.compare(rhs) > 0;
  }

  toString(): string {
    const res = `${this.#major}.${this.#minor}.${this.#patch}`;
    if (!this.#prerelease) return res;
    return res + '.' + this.#prerelease;
  }

  /**
   * @description return 1 if greater than rhs, -1 if less, and 0 if equal
   */
  compare(rhs: Readonly<DevvitVersion>): 1 | -1 | 0 {
    if (this.major > rhs.major) {
      return 1;
    }
    if (this.major < rhs.major) {
      return -1;
    }

    if (this.minor > rhs.minor) {
      return 1;
    }
    if (this.minor < rhs.minor) {
      return -1;
    }

    if (this.patch > rhs.patch) {
      return 1;
    }
    if (this.patch < rhs.patch) {
      return -1;
    }

    if ((this.prerelease ?? 0) > (rhs.prerelease ?? 0)) {
      return 1;
    }
    if ((this.prerelease ?? 0) < (rhs.prerelease ?? 0)) {
      return -1;
    }

    return 0;
  }
}

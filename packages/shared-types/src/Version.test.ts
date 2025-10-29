import { DevvitVersion, VersionBumpType } from './Version.js';

describe('DevvitVersion', () => {
  it('Can create a new DevvitVersion object from a valid string', () => {
    const major = '0';
    const minor = '1';
    const patch = '2';
    const prerelease = '3';

    const str = [major, minor, patch, prerelease].join('.');
    const ver = DevvitVersion.fromString(str);

    expect(ver.major).toBe(parseInt(major));
    expect(ver.minor).toBe(parseInt(minor));
    expect(ver.patch).toBe(parseInt(patch));
    expect(ver.prerelease).toBe(parseInt(prerelease));
  });

  it('Will throw an error when creating a new DevvitVersion object using an invalid string', () => {
    const invalidStrings = ['a.b.c', 'a.b.1', '0.1', '0.1.2.3.4', ''];

    invalidStrings.forEach((str) => {
      expect(() => DevvitVersion.fromString(str)).toThrow();
    });
  });

  describe('Correctly determines if it is newer or older than another DevvitVersion object', () => {
    it('different major', () => {
      const oldVer = DevvitVersion.fromString('0.3.2.4');
      const newVer = DevvitVersion.fromString('1.2.3.4');
      expect(newVer.newerThan(oldVer)).toBe(true);
    });
    it('different minor', () => {
      const oldVer = DevvitVersion.fromString('0.1.3.4');
      const newVer = DevvitVersion.fromString('0.2.3.4');
      expect(newVer.newerThan(oldVer)).toBe(true);
    });
    it('different patch', () => {
      const oldVer = DevvitVersion.fromString('0.1.2.8');
      const newVer = DevvitVersion.fromString('0.1.3.4');
      expect(newVer.newerThan(oldVer)).toBe(true);
    });
    it('different prerelease', () => {
      const oldVer = DevvitVersion.fromString('0.1.2.4');
      const newVer = DevvitVersion.fromString('0.1.2.5');
      expect(newVer.newerThan(oldVer)).toBe(true);
    });
  });

  describe('Versions should bump properly in increments of 1', () => {
    let ver: DevvitVersion;
    beforeEach(() => {
      ver = new DevvitVersion(0, 0, 0, 0);
    });

    it('can bump major', () => {
      ver.bumpVersion(VersionBumpType.Major);
      expect(ver.major).toBe(1);
    });
    it('can bump minor', () => {
      ver.bumpVersion(VersionBumpType.Minor);
      expect(ver.minor).toBe(1);
    });
    it('can bump major', () => {
      ver.bumpVersion(VersionBumpType.Patch);
      expect(ver.patch).toBe(1);
    });
    it('can bump major', () => {
      ver.bumpVersion(VersionBumpType.Prerelease);
      expect(ver.prerelease).toBe(1);
    });
  });

  describe('Versions are properly incremented when bumped', () => {
    it('Can bump major', () => {
      const ver = new DevvitVersion(0, 1, 2, 3);
      ver.bumpVersion(VersionBumpType.Major);
      expect(ver.isEqual(DevvitVersion.fromString('1.0.0'))).toBe(true);
    });
    it('Can bump minor', () => {
      const ver = new DevvitVersion(0, 1, 2, 3);
      ver.bumpVersion(VersionBumpType.Minor);
      expect(ver.isEqual(DevvitVersion.fromString('0.2.0'))).toBe(true);
    });
    it('Can bump patch', () => {
      const ver = new DevvitVersion(0, 1, 2, 3);
      ver.bumpVersion(VersionBumpType.Patch);
      expect(ver.isEqual(DevvitVersion.fromString('0.1.3'))).toBe(true);
    });
    it('Can bump prerelease', () => {
      const ver = new DevvitVersion(0, 1, 2, 3);
      ver.bumpVersion(VersionBumpType.Prerelease);
      expect(ver.isEqual(DevvitVersion.fromString('0.1.2.4'))).toBe(true);
    });
  });
});

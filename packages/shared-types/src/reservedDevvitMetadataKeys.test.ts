import {
  filterToReservedDevvitMetadataKeys,
  isDevvitMetadataKey,
  purgeReservedDevvitKeysFromMetadata,
} from './reservedDevvitMetadataKeys.js';

describe('isDevvitMetadataKey', () => {
  test('Returns true for devvit- prefixed strings.', () => {
    assert.isTrue(isDevvitMetadataKey('devvit-foo'));
  });

  test('Returns false for non-"devvit-" prefixed strings.', () => {
    assert.isFalse(isDevvitMetadataKey('foo'));
  });
});

describe('filterToReservedDevvitMetadataKeys', () => {
  test('Includes devvit- prefixed strings.', () => {
    const devvitPrefixedStrings = ['devvit-foo', 'devvit-bar', 'devvit-app'];
    assert.deepEqual(
      filterToReservedDevvitMetadataKeys(devvitPrefixedStrings),
      devvitPrefixedStrings
    );
  });

  test('Excludes non-"devvit-" prefixed strings.', () => {
    assert.isEmpty(filterToReservedDevvitMetadataKeys(['foo', 'bar', 'devvit+']));
  });

  test('Mixed reserved and non-reserved', () => {
    assert.deepEqual(filterToReservedDevvitMetadataKeys(['devvit-reserved', 'not-reserved']), [
      'devvit-reserved',
    ]);
  });
});

describe('purgeReservedDevvitKeysFromMetadata', () => {
  test('Removes devvit- prefixed keys.', () => {
    const metadata = {
      'devvit-installation': 'uuid',
      'devvit-post': 't3_abc',
      'not-devvit': 'value',
    };
    assert.deepEqual(purgeReservedDevvitKeysFromMetadata(metadata), { 'not-devvit': 'value' });
  });
});

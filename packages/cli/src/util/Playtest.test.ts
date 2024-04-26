import { modifyBundleVersion } from '../commands/playtest.js'
import { Bundle } from '@devvit/protos';

test('bundle has a version and is modified', () => {
    const bundle: Bundle = Bundle.fromPartial({})
    
    modifyBundleVersion(bundle, '1.2.3.4')
  
    expect(bundle?.dependencies?.actor?.version).toBe('1.2.3.4')
  });


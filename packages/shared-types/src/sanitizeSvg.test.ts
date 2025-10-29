import { expect } from 'vitest';

import { sanitizeSvg } from './sanitizeSvg.js';

describe('sanitizeSvg', () => {
  it('should be happy with a valid svg', () => {
    const url =
      '<svg xmlns="http://www.w3.org/2000/svg"><rect class="bar" x="30" y="150" width="40" height="0"></rect></svg>';
    expect(sanitizeSvg(url)).toEqual(url);
  });
  /**
   * TODO: Remove this test when we want to disallow images again
   *
   * 1/31/24: We need to allow images so we can make things happen.
   * https://reddit.atlassian.net/browse/DX-5740
   */
  it('should be happy with an image in an svg', () => {
    const url =
      '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><image href="https://i.redd.it/v8yt6xsnwnfc1.png" width="100" height="100" id="myImage"/></svg>';
    expect(sanitizeSvg(url)).toEqual(url);
  });
  it('should append xmlns if not provided', () => {
    const url = '<svg><rect class="bar" x="30" y="150" width="40" height="0"></rect></svg>';
    expect(sanitizeSvg(url)).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg"><rect class="bar" x="30" y="150" width="40" height="0"></rect></svg>'
    );
  });
  it.each([
    ['foo'],
    ['<svg><rect class="bar" x="30" y="150" width="40" height="0"><script></script></rect></svg>'],
    [
      '<svg onerror="javascript(alert(0));"><rect class="bar" x="30" y="150" width="40" height="0"></rect></svg>',
    ],
    ['<svg><foreignobject /><script></script></svg>'],
    // https://reddit.atlassian.net/browse/DX-5740
    // [
    //   '<svg><rect class="bar" x="30" y="150" width="40" height="0"><style>background-image: url(https://badimage.js);</style></rect></svg>',
    // ],
    // [
    //   '<svg style="background-image: url(https://badimage.js);"><rect class="bar" x="30" y="150" width="40" height="0"></rect></svg>',
    // ],
    [
      `<svg>
          <rect class="bar" x="30" y="150" width="40" height="0"></rect>
          <script></script>
      </svg>`,
    ],
    [
      `<svg onerror          =javascript(alert(1));>
          <rect class="bar" x="30" y="150" width="40" height="0"></rect>
      </svg>`,
    ],
    [
      `<svg onerror          javascript(alert(1));>
          <rect class="bar" x="30" y="150" width="40" height="0"></rect>
      </svg>`,
    ],
  ])('"%s" should fail', (test) => {
    expect(sanitizeSvg(test)).toEqual(undefined);
  });
});

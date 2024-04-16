import { svg } from './svg.js';

describe('svg``', () => {
  it('passes when valid svg is passed', () => {
    expect(
      svg`<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="4" /></svg>`
    ).toEqual(
      'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%225%22%20cy%3D%225%22%20r%3D%224%22%20%2F%3E%3C%2Fsvg%3E'
    );
  });
  it('passes when valid svg is passed (no xmlns)', () => {
    expect(svg`<svg><circle cx="5" cy="5" r="4" /></svg>`).toEqual(
      'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%225%22%20cy%3D%225%22%20r%3D%224%22%20%2F%3E%3C%2Fsvg%3E'
    );
  });
  it('passes when valid svg is passed (new lines)', () => {
    expect(
      svg`
        <svg xmlns="http://www.w3.org/2000/svg">
          <circle cx="5" cy="5" r="4" />
        </svg>
      `
    ).toEqual(
      'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%20%3Ccircle%20cx%3D%225%22%20cy%3D%225%22%20r%3D%224%22%20%2F%3E%20%3C%2Fsvg%3E'
    );
  });
  it('correctly builds the svg when interpolated values are passed', () => {
    const number = 5;
    const string = '5';
    const name = 'foo';
    expect(
      svg`
        <svg xmlns="http://www.w3.org/2000/svg" data-name="${name}">
          <circle cx="${number}" cy="${string}" r="4" />
        </svg>
      `
    ).toEqual(
      'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20data-name%3D%22foo%22%3E%20%3Ccircle%20cx%3D%225%22%20cy%3D%225%22%20r%3D%224%22%20%2F%3E%20%3C%2Fsvg%3E'
    );
  });
  it('fails when invalid - svg', () => {
    expect(svg`foo`).toEqual('');
  });
  it('fails when invalid - xss', () => {
    expect(svg`<svg><circle cx="5" cy="5" r="4" /><script>alert("xss")</script></svg>`).toEqual('');
  });
  // https://reddit.atlassian.net/browse/DX-5740
  // it('fails when invalid - image', () => {
  //   expect(
  //     svg`<svg><circle cx="5" cy="5" r="4" /><image href="https://inappropriate.com"></image></svg>`
  //   ).toEqual('');
  // });
});

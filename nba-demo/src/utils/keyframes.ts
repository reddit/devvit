/**
 * SRC: https://github.com/gerardabello/spring-animation-keyframes
 */
const hypot = (x: number, y: number): number => {
  let a = Math.abs(x);
  let b = Math.abs(y);

  if (a < 3000 && b < 3000) {
    return Math.sqrt(a * a + b * b);
  }

  if (a < b) {
    a = b;
    b = x / y;
  } else {
    b = y / x;
  }
  return a * Math.sqrt(1 + b * b);
};

const parse = (
  a: number | Complex,
  b?: number
): {
  re: number;
  im: number;
} => {
  const z = { re: 0, im: 0 };

  if (a == null) {
    z.re = z.im = 0;
  } else if (b != null && typeof a === 'number') {
    z.re = a;
    z.im = b;
  } else {
    switch (typeof a) {
      case 'object':
        z.im = a.im;
        z.re = a.re;
        break;
      case 'number':
        z.im = 0;
        z.re = a;
        break;

      default:
        throw Error('Wrong params in Complex constructor');
    }
  }

  return z;
};

class Complex {
  re: number;
  im: number;

  constructor(a: number | Complex, b?: number) {
    const z = parse(a, b);

    this.re = z.re;
    this.im = z.im;
  }

  add(a: number | Complex): Complex {
    const z = new Complex(a);

    return new Complex(this.re + z.re, this.im + z.im);
  }

  mul(a: number | Complex): Complex {
    const z = new Complex(a);

    return new Complex(this.re * z.re - this.im * z.im, this.re * z.im + this.im * z.re);
  }

  div(n: number | Complex): Complex {
    const z = new Complex(n);

    const a = this.re;
    const b = this.im;

    const c = z.re;
    const d = z.im;
    let t;
    let x;

    if (d === 0) {
      // Divisor is real
      return new Complex(a / c, b / c);
    }

    if (Math.abs(c) < Math.abs(d)) {
      x = c / d;
      t = c * x + d;

      return new Complex((a * x + b) / t, (b * x - a) / t);
    }

    x = d / c;
    t = d * x + c;

    return new Complex((a + b * x) / t, (b - a * x) / t);
  }

  sqrt(): Complex {
    const a = this.re;
    const b = this.im;
    const r = this.abs();

    let re;
    let im;

    if (a >= 0) {
      if (b === 0) {
        return new Complex(Math.sqrt(a), 0);
      }

      re = 0.5 * Math.sqrt(2.0 * (r + a));
    } else {
      re = Math.abs(b) / Math.sqrt(2 * (r - a));
    }

    if (a <= 0) {
      im = 0.5 * Math.sqrt(2.0 * (r - a));
    } else {
      im = Math.abs(b) / Math.sqrt(2 * (r + a));
    }

    return new Complex(re, b < 0 ? -im : im);
  }

  exp(): Complex {
    const tmp = Math.exp(this.re);

    return new Complex(tmp * Math.cos(this.im), tmp * Math.sin(this.im));
  }

  abs(): number {
    return hypot(this.re, this.im);
  }

  valueOf(): number | null {
    if (this.im === 0) {
      return this.re;
    }
    return null;
  }

  isZero(): boolean {
    return this.re === 0 && this.im === 0;
  }

  isInfinite(): boolean {
    return !(this.isNaN() || this.isFinite());
  }

  isNaN(): boolean {
    return isNaN(this.re) || isNaN(this.im);
  }

  isFinite(): boolean {
    return isFinite(this.re) && isFinite(this.im);
  }
}

/*
  Solution to:

  f(0) = x0
  f'(0) = v0
  f''(t) = -k*(f(t) - x1) - μ*f'(t)

  μ: friction coeficient
  v0: startingVelocity
  k: stiffness/tension
  x0: starting position
  x1: end position
*/

const spring = (
  tension: number,
  friction: number,
  startPositon: number,
  endPosition: number,
  startingVelocity: number
): ((t: number) => number) => {
  const distance = endPosition - startPositon;
  const lsr = new Complex(friction * friction - 4 * tension).sqrt();

  const m = new Complex(-1).div(2).div(lsr);

  return (t: number) => {
    const z1 = new Complex(2 * startingVelocity).mul(
      lsr.mul(-1).add(-friction).mul(t).mul(0.5).exp()
    );

    const z2 = new Complex(-2 * startingVelocity).mul(lsr.add(-friction).mul(t).mul(0.5).exp());

    const a = new Complex(-friction)
      .mul(distance)
      .mul(lsr.mul(-1).add(-friction).mul(t).mul(0.5).exp());

    const b = new Complex(friction).mul(distance).mul(lsr.add(-friction).mul(t).mul(0.5).exp());

    const c = lsr.mul(distance).mul(lsr.mul(-1).add(-friction).mul(t).mul(0.5).exp());
    const d = lsr.mul(distance).mul(lsr.add(-friction).mul(t).mul(0.5).exp());

    const f = lsr.mul(distance).mul(-2);

    const res = new Complex(0).add(z1).add(z2).add(a).add(b).add(c).add(d).add(f).mul(m);

    return (res.valueOf() ?? 0) + startPositon;
  };
};

export const presets = {
  default: { tension: 170, friction: 26 },
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 280, friction: 60 },
  molasses: { tension: 280, friction: 120 },
};

const transformProperties = [
  'perspective',
  'translateY',
  'translateX',
  'translateZ',
  'scale',
  'scaleX',
  'scaleY',
];

const getSpringFunction = ({
  from,
  to,
  tension,
  friction,
  startingVelocity = 0,
}: Spring): ((t: number) => number) => {
  return spring(tension, friction, from, to, startingVelocity);
};

export type Spring = {
  property: string;
  unit?: string;
  from: number;
  to: number;
  friction: number;
  tension: number;
  startingVelocity?: number;
};

export const generateKeyframes = (springs: Spring[], { time = 1 } = {}): string => {
  const otherSprings = springs
    .filter((s) => !transformProperties.includes(s.property))
    .map((o) => ({ ...o, f: getSpringFunction({ ...o }) }));

  const transformSprings = springs
    .filter((s) => transformProperties.includes(s.property))
    .map((o) => ({ ...o, f: getSpringFunction({ ...o }) }));

  let keyframesString = '';
  for (let i = 0; i <= 100; i++) {
    keyframesString = keyframesString + `${i}% {`;
    keyframesString = keyframesString + '\n';

    if (transformSprings.length > 0) {
      keyframesString = keyframesString + ` transform: `;
      for (let j = 0; j < transformSprings.length; j++) {
        const { property, unit = '' } = transformSprings[j];

        const t = (i * time) / 100;
        const { f } = transformSprings[j];
        const springValue = f(t);

        keyframesString = keyframesString + `${property}(${springValue}${unit}) `;
      }

      keyframesString = keyframesString + ';\n';
    }

    for (let j = 0; j < otherSprings.length; j++) {
      const { property, unit = '' } = otherSprings[j];

      const t = (i * time) / 100;

      const { f } = otherSprings[j];
      const springValue = f(t);

      keyframesString = keyframesString + `${property}: ${springValue}${unit};`;
      keyframesString = keyframesString + '\n';
    }

    keyframesString = keyframesString + `}`;
    keyframesString = keyframesString + '\n';
  }

  return keyframesString;
};

import clsx from 'clsx';
import React from 'react';

import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Customize community',
    // eslint-disable-next-line implicitDependencies/no-implicit
    Svg: require('@site/static/img/Well-Loved-Brand.svg').default,
    description: (
      <>
        Extend the functionality of subreddits large and small! Focus on your communities, let
        Reddit host your code.
      </>
    ),
  },
  {
    title: 'Automate moderation',
    // eslint-disable-next-line implicitDependencies/no-implicit
    Svg: require('@site/static/img/Huge-Scale.svg').default,
    description: (
      <>
        Manage mod workflows and tap into powerful automod configurations. Leverage custom actions
        and events-driven bots.
      </>
    ),
  },
  {
    title: 'Start building today',
    // eslint-disable-next-line implicitDependencies/no-implicit
    Svg: require('@site/static/img/Exciting-Products.svg').default,
    description: (
      <>
        It's never been easier to code for community. Use modern laguages like Javascript, Python,
        and more.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem): JSX.Element {
  return (
    <div className={clsx('col col--3', 'feature')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

// eslint-disable-next-line implicitDependencies/no-implicit
import useBaseUrl from '@docusaurus/useBaseUrl';
import React from 'react';

function resize(event): void {
  const target = event.target as HTMLIFrameElement;
  target.style.height = target.contentWindow.document.body.scrollHeight + 'px';
}

export default function FaceplateDocsEmbed({ path }): JSX.Element {
  const fullPath = useBaseUrl(path);
  return <iframe src={fullPath} onLoad={resize} style={{ width: '100%' }}></iframe>;
}

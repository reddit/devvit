import React from 'react';
// eslint-disable-next-line @benasher44/implicit-dependencies/no-implicit
import useBaseUrl from '@docusaurus/useBaseUrl';

function resize(event): void {
  const target = event.target as HTMLIFrameElement;
  target.style.height = target.contentWindow.document.body.scrollHeight + 'px';
}

export default function FaceplateDocsEmbed({ path }): JSX.Element {
  const fullPath = useBaseUrl(path);
  return <iframe src={fullPath} onLoad={resize} style={{ width: '100%' }}></iframe>;
}

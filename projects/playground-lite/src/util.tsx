import { XMLParser } from 'fast-xml-parser';
import { Devvit } from '@devvit/public-api';

export const xmlToJsx = (xmlData: string): JSX.Element => {
  const json = new XMLParser({
    attributeNamePrefix: '',
    ignoreAttributes: false,
    textNodeName: '#text',
    allowBooleanAttributes: false,
    parseAttributeValue: true,
    preserveOrder: true,
    trimValues: true,
  }).parse(xmlData);
  return toJSX(json);
};

function getIndentation(level: number): string {
  return '  '.repeat(level);
}

export function indentXML(xml: string): string {
  let formatted = '';
  let indentLevel = 0;
  const xmlArr = xml.split(/>\s*</);
  for (let i = 0; i < xmlArr.length; i++) {
    let node = xmlArr[i];
    if (i === 0) {
      node = node.trim();
    }
    if (i === xmlArr.length - 1) {
      node = node.trim();
    }
    const isClosingTag = node.charAt(0) === '/';
    if (isClosingTag) {
      indentLevel--;
    }
    formatted += getIndentation(indentLevel);
    if (i !== 0) {
      formatted += '<';
    }
    formatted += node;
    if (i !== xmlArr.length - 1) {
      formatted += '>\n';
    }
    if (!isClosingTag && node.indexOf('</') === -1 && node.charAt(node.length - 1) !== '/') {
      indentLevel++;
    }
  }
  return formatted;
}

const toJSX = (json: any): JSX.Element => {
  if (json === undefined || json === null) {
    return <></>;
  }
  if (Array.isArray(json)) {
    return <>{json.map((child: any) => toJSX(child))} </>;
  } else {
    const attrs = json[':@'];
    delete json[':@'];
    const tag = Object.keys(json)[0];
    const children = json[tag];

    switch (tag) {
      case 'blocks':
        return toJSX(children);
      case 'vstack':
        return <vstack {...attrs}>{toJSX(children)}</vstack>;
      case 'hstack':
        return <hstack {...attrs}>{toJSX(children)}</hstack>;
      case 'zstack':
        return <zstack {...attrs}>{toJSX(children)}</zstack>;
      case 'text':
        return <text {...attrs}>{toJSX(children)}</text>;
      case 'button':
        return <button {...attrs}>{toJSX(children)}</button>;
      case 'image':
        return <image {...attrs}>{toJSX(children)}</image>;
      case 'spacer':
        return <spacer {...attrs}>{toJSX(children)}</spacer>;
      case 'icon':
        return <icon {...attrs}>{toJSX(children)}</icon>;
      case 'avatar':
        return <avatar {...attrs}>{toJSX(children)}</avatar>;
      case 'fullsnoo':
        return <fullsnoo {...attrs}>{toJSX(children)}</fullsnoo>;
      case 'animation':
        return <animation {...attrs}>{toJSX(children)}</animation>;
      case 'webview':
        return <webview {...attrs}>{toJSX(children)}</webview>;
      case '#text':
        return <>{children}</>;
      default:
        return <text>unknown tag: {tag}</text>;
    }
  }
};

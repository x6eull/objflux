import { Fragment, useRef } from 'react';
import { limit } from '../../utils/utils';
import { Button } from '../../Button/Button';

export function Markdown({ source }: { source: string }) {
  const components: React.ReactNode[] = [];
  const lines = source.split(/\r?\n/);
  //此处不选用foreach以便读下行、跳过空行
  let currentPara: React.ReactElement[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const hashmatch = l.match(/^(?<hash>#+)\s*(?<title>.*)$/);
    if (hashmatch) {
      if (currentPara.length) {
        components.push(<p key={components.length}>{currentPara}</p>);
        currentPara = [];
      }
      let hashNo = (hashmatch.groups?.hash as string).length;
      hashNo = limit(hashNo, 1, 6);
      const Element: React.FunctionComponent<{ children: any }> = getHeadElement(hashNo);
      components.push(<Element key={components.length}>{parseInline(hashmatch.groups?.title ?? '')}</Element>);
      continue;
    }
    const isEmpty = /^\s*$/.test(l);
    if (isEmpty && currentPara.length) {
      components.push(<p key={components.length}>{currentPara}</p>);
      currentPara = [];
      continue;
    }
    const trailingSpace = captureGroup(l, /(?<pre>\S+) {2,}/);
    if (!trailingSpace)
      currentPara.push(<Fragment key={currentPara.length}>{parseInline(l)}</Fragment>);
    else {
      currentPara.push(<Fragment key={currentPara.length}>{parseInline(trailingSpace.pre)}</Fragment>);
      currentPara.push(<br key={currentPara.length} />);
    }
  }
  if (currentPara.length)
    components.push(<p key={components.length}>{currentPara}</p>);
  const ref = useRef<HTMLDivElement>(null);
  return <div><div>Markdown预览<Button onClick={() => {
    const result = `<!DOCTYPE HTML>
    <html>
    <head></head>
    <body>${ref.current?.innerHTML ?? ''}<body>
    </html>`;
    const blob = new Blob([result], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const eleA = document.createElement('a');
    eleA.href = url;
    eleA.download = 'markdown_export.html';
    eleA.click();
  }} title='导出' /></div><div ref={ref} style={{ all: 'initial' }}>{components}</div></div>;
}

function parseInline(text: string): React.ReactNode {
  const boldItalicMatch = captureGroup(text, /^(?<pre>.*?)((?<!\\)\*(?<!\\)\*(?<!\\)\*(?<t1>.+?)(?<!\\)\*(?<!\\)\*(?<!\\)\*|(?<!\\)_(?<!\\)_(?<!\\)_(?<t2>.+?)(?<!\\)_(?<!\\)_(?<!\\)_)(?<post>.*?)$/);
  if (boldItalicMatch) {
    return <>{parseInline(boldItalicMatch.pre)}<strong><i>{parseInline(boldItalicMatch.t1 ?? boldItalicMatch.t2)}</i></strong>{parseInline(boldItalicMatch.post)}</>;
  }
  const boldMatch = captureGroup(text, /^(?<pre>.*?)((?<!\\)\*(?<!\\)\*(?<t1>.+?)(?<!\\)\*(?<!\\)\*|(?<!\\)_(?<!\\)_(?<t2>.+?)(?<!\\)_(?<!\\)_)(?<post>.*?)$/);
  if (boldMatch) {
    return <>{parseInline(boldMatch.pre)}<strong>{parseInline(boldMatch.t1 ?? boldMatch.t2)}</strong>{parseInline(boldMatch.post)}</>;
  }
  const italicMatch = captureGroup(text, /^(?<pre>.*?)((?<!\\)\*(?<t1>.+?)(?<!\\)\*|(?<!\\)_(?<t2>.+?)(?<!\\)_)(?<post>.*?)$/);
  if (italicMatch) {
    return <>{parseInline(italicMatch.pre)}<i>{parseInline(italicMatch.t1 ?? italicMatch.t2)}</i>{parseInline(italicMatch.post)}</>;
  }
  const codeMatch = captureGroup(text, /^(?<pre>.*?)((?<!\\)`(?<code>.+?)(?<!\\)`)(?<post>.*?)$/);
  if (codeMatch) {
    return <>{parseInline(codeMatch.pre)}<code style={{ borderRadius: '3px', background: 'rgba(27,31,35,.12)', padding: '3px 5px', margin: '0 3px' }}>{parseInline(codeMatch.code)}</code>{parseInline(codeMatch.post)}</>;
  }
  const linkMatch = captureGroup(text, /^(?<pre>.*?)(?<!\\)\[(?<title>.+?)(?!\\)\](?<!\\)\((?<link>.+?)(?!\\)\)(?<post>.*?)$/);
  if (linkMatch) {
    return <>{parseInline(linkMatch.pre)}<a href={linkMatch.link}>{parseInline(linkMatch.title)}</a>{parseInline(linkMatch.post)}</>;
  }
  return unescape(text);
}

function unescape(text: string): string {
  return text.replaceAll(/\\([\\`*_{}[\]()#+-.!|])/g, '$1');
}

function getHeadElement(n: number): React.FunctionComponent<{ children: any }> {
  switch (n) {
    case 1:
      return ((props: any) => <h1 {...props} />);
    case 2:
      return ((props: any) => <h2 {...props} />);
    case 3:
      return ((props: any) => <h3 {...props} />);
    case 4:
      return ((props: any) => <h4 {...props} />);
    case 5:
      return ((props: any) => <h5 {...props} />);
    case 6:
    default:
      return ((props: any) => <h6 {...props} />);
  }
}

function captureGroup(text: string, regex: RegExp): null | { [capture: string]: string } {
  const result = text.match(regex);
  if (!result)
    return null;
  return result.groups ?? {};
}
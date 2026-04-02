export interface Props {
  code: string;
  language?: string;
  filename?: string;
}

export default function Code({ code, language, filename }: Props) {
  return (
    <div class="my-6 bg-alt border border-line rounded-brand overflow-hidden text-sm">
      {(filename || language) && (
        <div class="flex items-center justify-between px-5 py-2.5 border-b border-line bg-inset">
          {filename
            ? <span class="font-mono text-xs text-secondary">{filename}</span>
            : <span />}
          {language && (
            <span class="text-xs font-semibold tracking-caps uppercase text-muted">
              {language}
            </span>
          )}
        </div>
      )}
      <pre class="p-5 overflow-x-auto m-0 bg-transparent border-0 leading-[1.75]">
        <code class="font-mono text-sm bg-transparent p-0 whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}

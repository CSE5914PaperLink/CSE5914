"use client";
import { annotateWithCitations, parseCitationGroup } from "./citations";
import { truncateTitle } from "./sourceUtils";
import { ChatMessage, SourceChunk } from "./types";
import { RefObject } from "react";
import ReactMarkdown from "react-markdown";

const NON_BREAKING_SPACE = "\u00A0";

type RemarkNode = {
  type: string;
  value?: string;
  children?: RemarkNode[];
};

const BREAKABLE_PARENTS = new Set([
  "paragraph",
  "heading",
  "emphasis",
  "strong",
  "blockquote",
  "link",
  "delete",
]);

// Custom remark plugin that turns soft line breaks into <br> nodes while
// keeping Markdown features intact.
const remarkHardBreaks = () => {
  const transformNode = (node?: RemarkNode) => {
    if (!node?.children?.length) return;
    node.children = node.children.flatMap((child) => {
      if (
        BREAKABLE_PARENTS.has(node.type) &&
        child.type === "text" &&
        typeof child.value === "string" &&
        child.value.includes("\n")
      ) {
        const fragments = child.value.split(/\r?\n/);
        const nextNodes: RemarkNode[] = [];
        fragments.forEach((fragment, idx) => {
          if (fragment.length > 0) {
            nextNodes.push({ type: "text", value: fragment });
          }
          if (idx < fragments.length - 1) {
            nextNodes.push({ type: "break" });
          }
        });
        return nextNodes;
      }

      transformNode(child);
      return [child];
    });
  };

  return (tree: RemarkNode) => {
    transformNode(tree);
  };
};

const InlineCitation = ({
  numbers,
  sourceMap,
  onSourceClick,
}: {
  numbers: number[];
  sourceMap: Map<number, SourceChunk>;
  onSourceClick?: (source: SourceChunk) => void;
}) => {
  const resolvedSources = numbers
    .map((num) => sourceMap.get(num))
    .filter((source): source is SourceChunk => Boolean(source));
  const primarySource = resolvedSources[0];
  const firstNumber = numbers[0];

  if (!primarySource) {
    return (
      <span className="ml-1 align-super text-[0.7rem] text-neutral-500">
        [{firstNumber}]
      </span>
    );
  }

  const handleClick = () => {
    if (!primarySource) return;
    handleSourceInteraction(primarySource, onSourceClick);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="ml-1 inline-flex cursor-pointer items-center rounded-full border border-blue-200/80 bg-white/90 px-1.5 py-0.5 text-[0.7rem] font-mono text-blue-700 align-super shadow-sm hover:border-blue-400 hover:bg-blue-50 transition-colors"
      aria-label={`View source details for citation ${firstNumber}`}
    >
      [{firstNumber}]
    </button>
  );
};

const handleSourceInteraction = (
  source: SourceChunk,
  callback?: (source: SourceChunk) => void
) => {
  if (source.type === "text" && source.content) {
    console.log("Source content:", source.content);
  }
  callback?.(source);
};

const SourceList = ({
  sources,
  onSourceClick,
}: {
  sources: SourceChunk[];
  onSourceClick?: (source: SourceChunk) => void;
}) => {
  if (!sources.length) return null;

  return (
    <details className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-700 open:shadow-inner open:shadow-slate-200/70">
      <summary className="flex cursor-pointer items-center justify-between gap-3 text-left">
        <span className="text-[0.65rem] uppercase tracking-[0.35em] text-blue-500">
          Sources Used
        </span>
        <span className="text-xs text-slate-500">
          {sources.length} referenced
        </span>
      </summary>
      <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source, idx) => {
          const citationLabel = source.citation_number ?? idx + 1;
          const rawTitle = source.title || source.doc_id || source.filename;
          const isGithubSource = [
            source.title,
            source.doc_id,
            source.filename,
          ].some((value) => typeof value === "string" && /github/i.test(value));
          const isReadme =
            typeof source.filename === "string" &&
            /readme\.md/i.test(source.filename);
          const showGithub =
            isGithubSource ||
            (isReadme && (!source.heading || /unknown/i.test(source.heading)));
          const fullTitle =
            showGithub && (!source.heading || /unknown/i.test(source.heading))
              ? source.filename
              : source.heading || rawTitle || `Source ${citationLabel}`;
          const displayTitle = rawTitle || `Source ${citationLabel}`;
          const paperTitle = truncateTitle(
            showGithub ? "GitHub" : displayTitle,
            32
          );
          const sectionTitle = truncateTitle(fullTitle, 45);
          const metadata = [
            source.page ? `p.${source.page}` : undefined,
            source.chunk_index !== undefined
              ? `chunk ${source.chunk_index}`
              : undefined,
          ]
            .filter(Boolean)
            .join(" • ");
          const isImage = source.type === "image";
          const icon = showGithub ? (
            <svg
              className="h-4 w-4 text-slate-900"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 .5C5.648.5.5 5.787.5 12.266c0 5.194 3.438 9.607 8.205 11.168.6.115.82-.27.82-.6 0-.297-.012-1.28-.017-2.322-3.338.744-4.042-1.665-4.042-1.665-.546-1.424-1.334-1.805-1.334-1.805-1.09-.769.083-.754.083-.754 1.205.086 1.839 1.28 1.839 1.28 1.07 1.903 2.809 1.353 3.495 1.035.108-.807.418-1.353.762-1.664-2.665-.315-5.466-1.383-5.466-6.156 0-1.36.465-2.47 1.235-3.34-.124-.317-.535-1.592.115-3.32 0 0 1.005-.33 3.3 1.27a11.006 11.006 0 0 1 6 0c2.292-1.6 3.296-1.27 3.296-1.27.652 1.728.241 3.003.118 3.32.77.87 1.232 1.98 1.232 3.34 0 4.784-2.806 5.836-5.48 6.146.43.385.823 1.138.823 2.295 0 1.657-.015 2.994-.015 3.404 0 .333.216.722.825.598C20.065 21.87 23.5 17.457 23.5 12.266 23.5 5.787 18.352.5 12 .5Z" />
            </svg>
          ) : isImage ? (
            <svg
              className="h-4 w-4 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          );

          return (
            <li key={source.id || `${source.doc_id}-${idx}`}>
              <button
                type="button"
                onClick={() => handleSourceInteraction(source, onSourceClick)}
                className="flex h-full w-full cursor-pointer flex-col rounded-xl border border-slate-200 bg-white/95 px-2 py-1.5 text-left shadow-sm shadow-slate-200/60 transition hover:border-blue-300 hover:shadow-md"
                title={fullTitle}
              >
                <div className="flex items-center justify-between text-[0.55rem] uppercase tracking-[0.35em] text-slate-500">
                  <span>Source {citationLabel}</span>
                  <span>
                    {isGithubSource ? "GitHub" : isImage ? "Image" : "Text"}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 self-center">
                    {icon}
                  </span>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-[0.8rem] font-semibold text-slate-900 truncate">
                      {paperTitle}
                    </p>
                    <p className="text-[0.6rem] text-blue-500 truncate">
                      {sectionTitle}
                    </p>
                    {metadata && (
                      <p className="text-[0.65rem] text-slate-500">
                        {metadata}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </details>
  );
};

function MessageWithCitations({
  text,
  sources,
  onSourceClick,
}: {
  text: string;
  sources?: SourceChunk[];
  onSourceClick?: (source: SourceChunk) => void;
}) {
  const resolvedText =
    sources && sources.length > 0 ? annotateWithCitations(text, sources) : text;

  const sourceMap = new Map<number, SourceChunk>();
  sources?.forEach((source, idx) => {
    const citationNumber = source.citation_number ?? idx + 1;
    if (!sourceMap.has(citationNumber)) {
      sourceMap.set(citationNumber, source);
    }
  });

  type Segment =
    | { type: "text"; content: string }
    | { type: "citation"; content: number[] };

  const segments: Segment[] = [];
  const citationGroupRegex = /\[(\s*\d+(?:\s*,\s*\d+)*)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = citationGroupRegex.exec(resolvedText)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = resolvedText
        .slice(lastIndex, match.index)
        .replace(/\n+$/, " ");
      segments.push({
        type: "text",
        content: textChunk,
      });
    }

    const prevChar =
      match.index > 0 ? resolvedText.charAt(match.index - 1) : "";
    if (prevChar && !/\s/.test(prevChar)) {
      const lastSegment = segments[segments.length - 1];
      if (lastSegment && lastSegment.type === "text") {
        lastSegment.content = `${
          lastSegment.content as string
        }${NON_BREAKING_SPACE}`;
      } else {
        segments.push({ type: "text", content: NON_BREAKING_SPACE });
      }
    }

    const citationNumbers = parseCitationGroup(match[1]);
    if (citationNumbers.length > 0) {
      segments.push({ type: "citation", content: citationNumbers });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < resolvedText.length) {
    const tailText = resolvedText.slice(lastIndex).replace(/^\n+/, "");
    segments.push({ type: "text", content: tailText });
  }

  return (
    <div className="prose prose-sm max-w-none text-slate-900 leading-relaxed">
      {segments.map((segment, idx) => {
        if (segment.type === "text") {
          const content = segment.content as string;
          return (
            <span key={idx}>
              <ReactMarkdown
                remarkPlugins={[remarkHardBreaks]}
                components={{
                  p: ({ children }) => <span>{children}</span>,
                }}
              >
                {content}
              </ReactMarkdown>
            </span>
          );
        }
        const citationNumbers = segment.content as number[];
        return (
          <InlineCitation
            key={`citation-${idx}-${citationNumbers.join("-")}`}
            numbers={citationNumbers}
            sourceMap={sourceMap}
            onSourceClick={onSourceClick}
          />
        );
      })}
    </div>
  );
}

export function Messages({
  messages,
  typing,
  chatRef,
  onSourceClick,
}: {
  messages: ChatMessage[];
  typing: boolean;
  chatRef: RefObject<HTMLDivElement | null>;
  onSourceClick?: (source: SourceChunk) => void;
}) {
  return (
    <div
      ref={chatRef}
      id="chatContainer"
      className="flex-1 overflow-y-auto min-h-0 bg-transparent"
    >
      <div className="max-w-3xl mx-auto px-6 py-8 container">
        <div className="text-center text-gray-500 py-4">
          <h2 className="text-lg font-medium">AI Research Assistant</h2>
          <p className="text-xs">Ask anything about research papers.</p>
        </div>
        <div id="messagesContainer" className="space-y-5 mt-6 pb-32">
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.sender === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className={
                  m.sender === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl px-5 py-3 max-w-[80%] shadow-lg shadow-blue-500/30"
                    : m.sender === "system"
                    ? "bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl px-4 py-2 max-w-prose text-center text-sm mx-auto"
                    : "bg-white/95 text-slate-900 rounded-3xl px-6 py-5 max-w-3xl border border-slate-200 shadow-2xl shadow-slate-200/70"
                }
              >
                {m.sender === "ai" ? (
                  <div className="space-y-4">
                    {m.status && (
                      <div className="mb-3 flex items-center gap-2 text-sm text-neutral-600">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                          <div
                            className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.15s" }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.3s" }}
                          ></div>
                        </div>
                        <span className="font-medium capitalize">
                          {m.status}
                        </span>
                      </div>
                    )}

                    <MessageWithCitations
                      text={m.text}
                      sources={m.sources}
                      onSourceClick={onSourceClick}
                    />

                    {m.sources && m.sources.length > 0 && (
                      <SourceList
                        sources={m.sources}
                        onSourceClick={onSourceClick}
                      />
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div id="typingIndicator" className="flex justify-start">
              <div className="bg-neutral-100 text-neutral-600 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

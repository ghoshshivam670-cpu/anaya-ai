"use client";

interface CodeDiffViewProps {
  diff: string;
  compact?: boolean;
}

export function CodeDiffView({ diff, compact = false }: CodeDiffViewProps) {
  const lines = diff.split("\n");

  return (
    <div
      className={`code-scroll overflow-x-auto font-mono ${
        compact ? "text-[10.5px] leading-[1.6]" : "text-[11px] leading-[1.65]"
      }`}
    >
      {lines.map((line, index) => {
        const isFileHeader = line.startsWith("--- ") || line.startsWith("+++ ");
        const isHunk = line.startsWith("@@");
        const isDel = !isFileHeader && line.startsWith("-");
        const isAdd = !isFileHeader && line.startsWith("+");
        const isComment = line.trim().startsWith("//") || line.trim().startsWith("#");

        let rowClass = "text-[#a1a1a6]";
        if (isFileHeader) {
          rowClass = "text-[#8e8e93] font-medium";
        } else if (isHunk) {
          rowClass = "bg-[#0071e3]/12 text-[#64d2ff]";
        } else if (isDel) {
          rowClass = "bg-[#ff453a]/12 text-[#ff6961]";
        } else if (isAdd) {
          rowClass = "bg-[#30d158]/12 text-[#32d74b]";
        } else if (isComment) {
          rowClass = "text-[#636366]";
        }

        return (
          <div
            key={`${index}-${line}`}
            className={`whitespace-pre rounded px-2 py-0.5 ${rowClass}`}
          >
            {line.length > 0 ? line : " "}
          </div>
        );
      })}
    </div>
  );
}

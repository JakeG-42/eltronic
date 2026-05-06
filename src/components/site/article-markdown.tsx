type ArticleMarkdownProps = {
  content: string;
};

export function ArticleMarkdown({ content }: ArticleMarkdownProps) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="article-body">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          return <h2 key={key}>{block.value}</h2>;
        }

        if (block.type === "subheading") {
          return <h3 key={key}>{block.value}</h3>;
        }

        if (block.type === "strong") {
          return <p key={key} className="article-strong-line">{block.value}</p>;
        }

        if (block.type === "list") {
          return (
            <ul key={key}>
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }

        return <p key={key}>{block.value}</p>;
      })}
    </div>
  );
}

type MarkdownBlock =
  | { type: "heading" | "paragraph" | "strong" | "subheading"; value: string }
  | { items: string[]; type: "list" };

function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = content.split(/\r?\n/);
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", value: paragraph.join(" ") });
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length > 0) {
      blocks.push({ type: "list", items: list });
      list = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "subheading", value: line.replace(/^###\s+/, "") });
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", value: line.replace(/^##\s+/, "") });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.replace(/^-\s+/, ""));
      continue;
    }

    const strongMatch = line.match(/^\*\*(.+)\*\*$/);

    if (strongMatch?.[1]) {
      flushParagraph();
      flushList();
      blocks.push({ type: "strong", value: strongMatch[1] });
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

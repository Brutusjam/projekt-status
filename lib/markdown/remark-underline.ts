import type { Nodes, Parent, Root, RootContent } from "mdast";

const OPEN_TAG = /^<u>$/i;
const CLOSE_TAG = /^<\/u>$/i;

function isParent(node: Nodes): node is Parent & Nodes {
  return "children" in node && Array.isArray(node.children);
}

function isHtml(node: RootContent, pattern: RegExp): boolean {
  return node.type === "html" && pattern.test(node.value.trim());
}

/**
 * Wandelt `<u>…</u>` innerhalb eines Absatzes in ein `<u>`-Element um.
 * Übriges Roh-HTML bleibt wie bisher unberücksichtigt.
 */
function transform(parent: Parent) {
  const children = parent.children as RootContent[];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isParent(child as Nodes)) {
      transform(child as Parent);
    }
    if (!isHtml(child, OPEN_TAG)) continue;

    const end = children.findIndex(
      (candidate, index) => index > i && isHtml(candidate, CLOSE_TAG),
    );
    if (end === -1) continue;

    const inner = children.slice(i + 1, end);
    for (const node of inner) {
      if (isParent(node as Nodes)) transform(node as Parent);
    }

    const underline = {
      type: "underline",
      children: inner,
      data: { hName: "u" },
    } as unknown as RootContent;

    children.splice(i, end - i + 1, underline);
  }
}

export function remarkUnderline() {
  return (tree: Root) => {
    transform(tree);
  };
}

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { describe, expect, it } from "vitest";
import { remarkUnderline } from "@/lib/markdown/remark-underline";
import { markdownToHtml } from "@/lib/pdf/templates";

function render(content: string) {
  return renderToStaticMarkup(
    createElement(Markdown, { remarkPlugins: [remarkGfm, remarkUnderline] }, content),
  );
}

describe("remarkUnderline", () => {
  it("rendert <u> als Unterstreichung", () => {
    expect(render("Ein <u>wichtiger</u> Punkt")).toBe(
      "<p>Ein <u>wichtiger</u> Punkt</p>",
    );
  });

  it("unterstützt Formatierung innerhalb der Unterstreichung", () => {
    expect(render("<u>**fett** und unterstrichen</u>")).toBe(
      "<p><u><strong>fett</strong> und unterstrichen</u></p>",
    );
  });

  it("funktioniert in Listen", () => {
    expect(render("- <u>eins</u>\n- zwei")).toContain("<li><u>eins</u></li>");
  });

  it("ignoriert anderes Roh-HTML weiterhin", () => {
    expect(render('<script>alert(1)</script> Text')).not.toContain("<script>");
  });
});

describe("markdownToHtml (PDF)", () => {
  it("setzt fett, kursiv und unterstrichen um", () => {
    expect(markdownToHtml("**fett** *kursiv* <u>unter</u>")).toBe(
      "<p><strong>fett</strong> <em>kursiv</em> <u>unter</u></p>",
    );
  });

  it("erstellt Aufzählungen und nummerierte Listen", () => {
    expect(markdownToHtml("Intro\n- a\n- b\n\n1. eins\n2. zwei")).toBe(
      "<p>Intro</p><ul><li>a</li><li>b</li></ul><ol><li>eins</li><li>zwei</li></ol>",
    );
  });

  it("escaped übriges HTML", () => {
    expect(markdownToHtml("<b>x</b>")).toBe("<p>&lt;b&gt;x&lt;/b&gt;</p>");
  });
});

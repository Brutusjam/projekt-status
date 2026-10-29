import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import { describe, expect, it } from "vitest";
import { markdownRemarkPlugins } from "@/lib/markdown/plugins";
import { markdownToHtml } from "@/lib/pdf/templates";

function render(content: string) {
  return renderToStaticMarkup(
    createElement(Markdown, { remarkPlugins: markdownRemarkPlugins }, content),
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

  it("zeigt einfache Zeilenumbrüche als Umbruch an", () => {
    expect(render("Zeile eins\nZeile zwei")).toBe(
      "<p>Zeile eins<br/>\nZeile zwei</p>",
    );
  });
});

describe("markdownToHtml (PDF)", () => {
  const html = (text: string) => markdownToHtml(text).replaceAll("\n", "");

  it("setzt fett, kursiv und unterstrichen um", () => {
    expect(html("**fett** *kursiv* <u>unter</u>")).toBe(
      "<p><strong>fett</strong> <em>kursiv</em> <u>unter</u></p>",
    );
  });

  it("erstellt Aufzählungen und nummerierte Listen", () => {
    expect(html("Intro\n- a\n- b\n\n1. eins\n2. zwei")).toBe(
      "<p>Intro</p><ul><li>a</li><li>b</li></ul><ol><li>eins</li><li>zwei</li></ol>",
    );
  });

  it("trennt Absätze und übernimmt einfache Zeilenumbrüche", () => {
    expect(html("Erster\nZeile zwei\n\nZweiter Absatz")).toBe(
      "<p>Erster<br>Zeile zwei</p><p>Zweiter Absatz</p>",
    );
  });

  it("unterstützt Überschriften, Zitate und verschachtelte Listen", () => {
    expect(html("## Titel\n\n> Zitat\n\n- a\n  - b")).toBe(
      "<h2>Titel</h2><blockquote><p>Zitat</p></blockquote><ul><li>a<ul><li>b</li></ul></li></ul>",
    );
  });

  it("lässt übriges Roh-HTML weg", () => {
    expect(html("<b>x</b> <script>alert(1)</script>")).not.toMatch(/<b>|<script>/);
  });
});

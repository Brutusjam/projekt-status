import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { remarkUnderline } from "@/lib/markdown/remark-underline";

/**
 * Gemeinsame remark-Plugins für Webansicht und PDF.
 * `remark-breaks` macht aus einem einfachen Zeilenumbruch einen sichtbaren Umbruch.
 */
export const markdownRemarkPlugins = [remarkGfm, remarkBreaks, remarkUnderline];

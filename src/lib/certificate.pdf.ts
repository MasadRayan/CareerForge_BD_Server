import PDFDocument from "pdfkit";
import { registerCertificateFonts } from "./certificate.fonts.js";

export type CertificatePdfData = {
  fullName: string;
  skill: string;
  score: number;
  certificateNumber: string;
  issuedAt?: Date;
};

// ─── A4 landscape page (points) ─────────────
const PAGE_W = 841.89;
const PAGE_H = 595.28;
const CENTER = PAGE_W / 2;

// ─── Forge Seal palette ─────────────────────
const INK = "#0F172A"; // slate-900 — primary text
const MUTED = "#64748B"; // slate-500 — secondary text
const FAINT = "#94A3B8"; // slate-400 — labels / captions
const HAIRLINE = "#E2E8F0"; // slate-200 — rules & borders
const PAPER = "#FFFFFF";
const CHIP_BG = "#EEF2FF"; // indigo-50 — skill chip
const CHIP_TEXT = "#4F46E5"; // indigo-600 — skill name
const INDIGO = "#6366F1";
const VIOLET = "#8B5CF6";
const EMERALD = "#10B981";

// Font aliases (registered by certificate.fonts.ts)
const F_DISPLAY = "SpaceGrotesk-Medium";
const F_DISPLAY_BOLD = "SpaceGrotesk-Bold";
const F_BODY = "SpaceGrotesk";
const F_MONO = "JetBrainsMono";
const F_MONO_BOLD = "JetBrainsMono-Bold";

/* ── Helpers ──────────────────────────────── */

const setText = (
  doc: PDFKit.PDFDocument,
  font: string,
  size: number,
  color: string,
): PDFKit.PDFDocument => doc.font(font).fontSize(size).fillColor(color);

/** Draw a single centered line of text at its top y. */
const centeredText = (
  doc: PDFKit.PDFDocument,
  y: number,
  text: string,
  opts: { font: string; size: number; color: string; tracking?: number },
): void => {
  setText(doc, opts.font, opts.size, opts.color);
  doc.text(text, 40, y, {
    width: PAGE_W - 80,
    align: "center",
    lineBreak: false,
    characterSpacing: opts.tracking ?? 0,
  });
};

/** Draw a single line of text right-aligned against rightX. */
const rightText = (
  doc: PDFKit.PDFDocument,
  rightX: number,
  y: number,
  text: string,
  opts: { font: string; size: number; color: string; tracking?: number },
): void => {
  setText(doc, opts.font, opts.size, opts.color);
  doc.text(text, 0, y, {
    width: rightX,
    align: "right",
    lineBreak: false,
    characterSpacing: opts.tracking ?? 0,
  });
};

/** Shrink a font size until the string fits, returns the final size. */
const fitSize = (
  doc: PDFKit.PDFDocument,
  text: string,
  startSize: number,
  minSize: number,
  maxWidth: number,
  tracking = 0,
): number => {
  let size = startSize;
  while (size > minSize) {
    doc.fontSize(size);
    if (doc.widthOfString(text, { characterSpacing: tracking }) <= maxWidth) {
      break;
    }
    size -= 1;
  }
  return size;
};

const brandGradient = (
  doc: PDFKit.PDFDocument,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): PDFKit.PDFGradient =>
  doc.linearGradient(x1, y1, x2, y2).stop(0, INDIGO).stop(0.6, VIOLET).stop(1, EMERALD);

/** Gradient hairline + thin outer frame. */
const drawFrame = (doc: PDFKit.PDFDocument): void => {
  const top = brandGradient(doc, 0, 0, PAGE_W, 0);
  doc.rect(0, 0, PAGE_W, 7).fill(top);

  doc
    .roundedRect(30, 30, PAGE_W - 60, PAGE_H - 60, 6)
    .lineWidth(1.25)
    .strokeColor(HAIRLINE)
    .stroke();
};

/** Wordmark lockup: "CareerForge" in ink + "BD" in emerald. */
const drawWordmark = (doc: PDFKit.PDFDocument, x: number, y: number): void => {
  setText(doc, F_DISPLAY_BOLD, 14, INK);
  const a = doc.widthOfString("CareerForge");
  doc.text("CareerForge", x, y);
  setText(doc, F_DISPLAY_BOLD, 14, EMERALD);
  doc.text("BD", x + a, y);
};

/** Gradient ring seal with a white core + emerald monogram. */
const drawSeal = (doc: PDFKit.PDFDocument, cx: number, cy: number, r = 24): void => {
  const grad = brandGradient(doc, cx - r, cy - r, cx + r, cy + r);

  doc.save();
  doc.circle(cx, cy, r).clip();
  doc.rect(cx - r, cy - r, r * 2, r * 2).fill(grad);
  doc.restore();

  doc.circle(cx, cy, r).lineWidth(1).strokeColor(PAPER).stroke();
  doc.circle(cx, cy, r - 6).fill(PAPER);

  setText(doc, F_DISPLAY_BOLD, 12, EMERALD);
  const mw = doc.widthOfString("BD");
  doc.text("BD", cx - mw / 2, cy - 7);
};

/** Short gradient rule, used under the title. */
const drawRule = (doc: PDFKit.PDFDocument, cx: number, y: number, width = 96): void => {
  const grad = brandGradient(doc, cx - width / 2, y, cx + width / 2, y);
  doc.roundedRect(cx - width / 2, y, width, 2.5, 1.25).fill(grad);
};

/** Emerald circle + white checkmark. */
const drawCheckSeal = (doc: PDFKit.PDFDocument, x: number, y: number, r = 7): void => {
  doc.circle(x, y, r).fill(EMERALD);
  doc
    .moveTo(x - 3.4, y + 0.5)
    .lineTo(x - 1, y + 3)
    .lineTo(x + 3.6, y - 3)
    .strokeColor(PAPER)
    .lineWidth(1.75)
    .lineCap("round")
    .lineJoin("round")
    .stroke();
};

/* ── Render ──────────────────────────────── */

const buildPdf = (data: CertificatePdfData): Promise<Buffer> => {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 0,
    autoFirstPage: true,
  });

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    registerCertificateFonts(doc);

    const issuedDate = data.issuedAt ?? new Date();
    const dateStr = issuedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    drawFrame(doc);

    // ─── Header: wordmark (left) + mono eyebrow (right) ─────
    drawWordmark(doc, 54, 64);
    rightText(doc, PAGE_W - 54, 68, "CERTIFICATE OF ACHIEVEMENT", {
      font: F_MONO,
      size: 8.5,
      color: FAINT,
      tracking: 2.5,
    });

    // ─── Seal medallion ────────────────────────────────────
    drawSeal(doc, CENTER, 132);

    // ─── Title + rule ──────────────────────────────────────
    centeredText(doc, 170, "SKILL CERTIFICATE", {
      font: F_DISPLAY,
      size: 25,
      color: INK,
      tracking: 5,
    });
    drawRule(doc, CENTER, 208);

    // ─── Presented to ──────────────────────────────────────
    centeredText(doc, 236, "PRESENTED TO", {
      font: F_MONO,
      size: 9.5,
      color: FAINT,
      tracking: 3,
    });

    // Name — the hero type moment (shrinks if long)
    const nameSize = fitSize(doc, data.fullName, 36, 24, 600);
    centeredText(doc, 248, data.fullName, {
      font: F_DISPLAY,
      size: nameSize,
      color: INK,
    });

    // ─── Skill line ────────────────────────────────────────
    centeredText(doc, 312, "for completing the skill assessment in", {
      font: F_BODY,
      size: 12,
      color: MUTED,
    });

    // Skill chip
    setText(doc, F_DISPLAY, 20, CHIP_TEXT);
    const skillWidth = doc.widthOfString(data.skill);
    const chipW = Math.max(120, skillWidth + 48);
    const chipH = 40;
    const chipX = CENTER - chipW / 2;
    const chipY = 334;
    const skillSize = fitSize(doc, data.skill, 20, 13, chipW - 32);
    doc.roundedRect(chipX, chipY, chipW, chipH, chipH / 2).fill(CHIP_BG);
    centeredText(doc, chipY + 10, data.skill, {
      font: F_DISPLAY,
      size: skillSize,
      color: CHIP_TEXT,
    });

    // ─── Score ─────────────────────────────────────────────
    centeredText(doc, 396, `With a passing score of ${data.score}%`, {
      font: F_MONO,
      size: 10.5,
      color: MUTED,
    });

    // ─── Verification serial block (the signature) ─────────
    const boxW = 420;
    const boxH = 74;
    const boxX = CENTER - boxW / 2;
    const boxY = 420;
    doc
      .roundedRect(boxX, boxY, boxW, boxH, 12)
      .fillColor("#F8FAFC")
      .strokeColor(HAIRLINE)
      .lineWidth(1)
      .fillAndStroke();

    centeredText(doc, boxY + 16, "VERIFICATION CODE", {
      font: F_MONO,
      size: 8,
      color: FAINT,
      tracking: 2.5,
    });

    setText(doc, F_MONO_BOLD, 15, INK);
    const serialW = doc.widthOfString(data.certificateNumber);
    const checkR = 7;
    const gap = 10;
    const groupW = checkR * 2 + gap + serialW;
    const gx = CENTER - groupW / 2;
    drawCheckSeal(doc, gx + checkR, boxY + 39);
    setText(doc, F_MONO_BOLD, 15, INK);
    doc.text(data.certificateNumber, gx + checkR * 2 + gap, boxY + 33);

    centeredText(doc, boxY + 57, "Valid at CareerForge BD", {
      font: F_MONO,
      size: 7.5,
      color: FAINT,
    });

    // ─── Footer ────────────────────────────────────────────
    const fy = PAGE_H - 86;
    setText(doc, F_MONO, 9, MUTED);
    doc.text(`Issued on ${dateStr}`, 54, fy);

    const sx = PAGE_W - 54;
    const lineW = 230;
    doc
      .moveTo(sx - lineW, fy)
      .lineTo(sx, fy)
      .strokeColor(HAIRLINE)
      .lineWidth(1)
      .stroke();

    setText(doc, F_DISPLAY_BOLD, 10, MUTED);
    const signNameW = doc.widthOfString("CareerForge BD");
    doc.text("CareerForge BD", sx - signNameW, fy + 10);
    setText(doc, F_MONO, 7, FAINT);
    const signSubW = doc.widthOfString("AUTHORIZED SIGNATURE");
    doc.text("AUTHORIZED SIGNATURE", sx - signSubW, fy + 25);

    doc.end();
  });
};

export const renderSkillCertificatePdf = buildPdf;

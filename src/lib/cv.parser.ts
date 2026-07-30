import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import AppError from "../utils/AppError";

// Soft cap on extracted text length. A typical CV is 1-3k words (~15KB),
// but a scanned/image-heavy PDF can dump garbage. Capping bounds the DB
// row size (raw_text is @db.Text) and Gemini prompt cost downstream.
const MAX_TEXT_LENGTH = 20_000;

const DOCX_MIMETYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Extracts plain text from a CV file buffer.
 * PDF → pdf-parse (PDFParse class, v2 API), DOCX → mammoth.
 *
 * @param buffer   the file bytes (from multer memoryStorage)
 * @param mimetype the uploaded file's mimetype
 */
export const parseCVText = async (
  buffer: Buffer,
  mimetype: string,
): Promise<string> => {
  let text: string;

  if (mimetype === "application/pdf") {
    // pdf-parse v2: instantiate with the buffer, then call getText().
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    text = result.text;
    await parser.destroy();
  } else if (mimetype === DOCX_MIMETYPE) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new AppError("Unsupported file type. Only PDF or DOCX allowed.", 400);
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new AppError(
      "Could not extract any text from the CV. Is it a scanned image?",
      422,
    );
  }

  if (trimmed.length > MAX_TEXT_LENGTH) {
    console.warn(
      `⚠️ CV text exceeded ${MAX_TEXT_LENGTH} chars (got ${trimmed.length}); truncating.`,
    );
    return trimmed.slice(0, MAX_TEXT_LENGTH);
  }

  return trimmed;
};

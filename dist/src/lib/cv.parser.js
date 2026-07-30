import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import AppError from "../utils/AppError";
const MAX_TEXT_LENGTH = 20_000;
const DOCX_MIMETYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const parseCVText = async (buffer, mimetype) => {
    let text;
    if (mimetype === "application/pdf") {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        text = result.text;
        await parser.destroy();
    }
    else if (mimetype === DOCX_MIMETYPE) {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
    }
    else {
        throw new AppError("Unsupported file type. Only PDF or DOCX allowed.", 400);
    }
    const trimmed = text.trim();
    if (!trimmed) {
        throw new AppError("Could not extract any text from the CV. Is it a scanned image?", 422);
    }
    if (trimmed.length > MAX_TEXT_LENGTH) {
        console.warn(`⚠️ CV text exceeded ${MAX_TEXT_LENGTH} chars (got ${trimmed.length}); truncating.`);
        return trimmed.slice(0, MAX_TEXT_LENGTH);
    }
    return trimmed;
};
//# sourceMappingURL=cv.parser.js.map
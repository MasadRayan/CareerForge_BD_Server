export const estimateTokens = (text) => Math.ceil(text.length / 4);
export const cleanExtractedText = (raw) => raw
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{3,}/g, " ")
    .replace(/^\s*[-–]?\s*\d+\s*[-–]?\s*$/gm, "")
    .replace(/^\s*[-_=]{5,}\s*$/gm, "")
    .trim();
export const truncateText = (text, maxChars = 3_000) => {
    if (text.length <= maxChars)
        return text;
    const cut = text.lastIndexOf(" ", maxChars);
    return (cut > 0 ? text.slice(0, cut) : text.slice(0, maxChars)) + "\n[truncated]";
};
export const prepareCV = (raw) => truncateText(cleanExtractedText(raw), 2_500);
export const prepareJD = (raw) => truncateText(cleanExtractedText(raw), 2_000);
//# sourceMappingURL=tokenUtils.js.map
const SEARCH_URLS: Record<string, (query: string) => string> = {
  video: (q) => `https://www.youtube.com/results?search_query=${q}`,
  article: (q) => `https://www.google.com/search?q=${q}`,
  docs: (q) => `https://www.google.com/search?q=${q}+documentation`,
  course: (q) => `https://www.google.com/search?q=${q}+course`,
};

export const getFallbackUrl = (title: string, type: string): string => {
  const sanitized = title.replace(/["<>#%{}|\\^~[\]`]/g, "").trim();
  const query = encodeURIComponent(sanitized);
  const builder = SEARCH_URLS[type] ?? SEARCH_URLS.article;
  return builder(query);
};

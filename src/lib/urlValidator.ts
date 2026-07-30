const TIMEOUT_MS = 5_000;

const fetchWithTimeout = async (
  url: string,
  timeout: number,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CareerForgeBD/1.0)" },
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

const verifySingleUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout(url, TIMEOUT_MS);
    return response.status >= 200 && response.status < 400;
  } catch {
    return false;
  }
};

interface Resource {
  title: string;
  url: string;
  type: string;
}

export const verifyResources = async (
  resources: Resource[],
): Promise<{ valid: Resource[]; invalid: Resource[] }> => {
  const results = await Promise.all(
    resources.map(async (res) => ({
      resource: res,
      valid: await verifySingleUrl(res.url),
    })),
  );

  const valid: Resource[] = [];
  const invalid: Resource[] = [];

  for (const { resource, valid: isOk } of results) {
    if (isOk) valid.push(resource);
    else invalid.push(resource);
  }

  return { valid, invalid };
};

export type AppEnvironment = "development" | "test" | "production";

export type LlmProvider = "none" | "openai" | "anthropic" | "gemini";

export type SecurityEnvironment = {
  appEnv: AppEnvironment;
  llmProvider: LlmProvider;
  llmApiKey?: string;
};

const secretPublicNamePattern =
  /(api[_-]?key|token|secret|password|authorization|credential)/i;

const sensitiveFieldPattern =
  /(api[_-]?key|token|secret|password|authorization|cookie|credential|latitude|longitude|coordinate|location|calendar|prompt|photo|memory)/i;

function requireNonEmpty(value: string | undefined, name: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required when the provider is enabled`);
  }

  return value;
}

function isPlaceholder(value: string): boolean {
  return /^replace_with_your_.+$/i.test(value.trim());
}

export function parseSecurityEnvironment(
  env: Record<string, string | undefined>,
): SecurityEnvironment {
  for (const name of Object.keys(env)) {
    if (name.startsWith("NEXT_PUBLIC_") && secretPublicNamePattern.test(name)) {
      throw new Error(`${name} must not be public`);
    }
  }

  const appEnv = env.APP_ENV ?? "development";
  if (appEnv !== "development" && appEnv !== "test" && appEnv !== "production") {
    throw new Error("APP_ENV is invalid");
  }

  const llmProvider = env.LLM_PROVIDER ?? "none";
  if (
    llmProvider !== "none" &&
    llmProvider !== "openai" &&
    llmProvider !== "anthropic" &&
    llmProvider !== "gemini"
  ) {
    throw new Error("LLM_PROVIDER is invalid");
  }

  const keyName =
    llmProvider === "openai"
      ? "OPENAI_API_KEY"
      : llmProvider === "anthropic"
        ? "ANTHROPIC_API_KEY"
        : llmProvider === "gemini"
          ? "GEMINI_API_KEY"
          : null;

  if (keyName) {
    const key = requireNonEmpty(env[keyName], keyName);
    if (isPlaceholder(key)) {
      throw new Error(`${keyName} must contain a real value when enabled`);
    }

    return { appEnv, llmProvider, llmApiKey: key };
  }

  return { appEnv, llmProvider };
}

export function assertAllowedProviderUrl(
  value: string,
  allowedHosts: readonly string[],
  options: { allowLocalDevelopment?: boolean } = {},
): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Provider URL is invalid");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Provider URL protocol is not allowed");
  }
  if (url.username || url.password) {
    throw new Error("Provider URL credentials are not allowed");
  }

  const hostname = url.hostname.toLowerCase();
  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]";
  if (isLocal && !options.allowLocalDevelopment) {
    throw new Error("Local provider URLs require explicit development access");
  }

  const normalizedHosts = allowedHosts.map((host) => host.toLowerCase());
  if (!normalizedHosts.includes(hostname)) {
    throw new Error("Provider URL host is not in the allowlist");
  }

  return url;
}

export function redactSensitiveData(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveData);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      sensitiveFieldPattern.test(key)
        ? "[REDACTED]"
        : redactSensitiveData(nestedValue),
    ]),
  );
}

export function validatePayloadSize(
  payload: string | Uint8Array,
  maxBytes: number,
): void {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new RangeError("maxBytes must be a positive safe integer");
  }

  const size = typeof payload === "string"
    ? new TextEncoder().encode(payload).byteLength
    : payload.byteLength;
  if (size > maxBytes) {
    throw new RangeError(`Provider payload exceeds the ${maxBytes}-byte limit`);
  }
}

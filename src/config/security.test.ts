import { describe, expect, it } from "vitest";
import {
  assertAllowedProviderUrl,
  parseSecurityEnvironment,
  redactSensitiveData,
  validatePayloadSize,
} from "./security";

describe("security configuration", () => {
  it("accepts disabled optional providers without requiring credentials", () => {
    expect(
      parseSecurityEnvironment({
        APP_ENV: "test",
        LLM_PROVIDER: "none",
      }),
    ).toMatchObject({
      appEnv: "test",
      llmProvider: "none",
    });
  });

  it("requires a credential when a hosted LLM provider is enabled", () => {
    expect(() =>
      parseSecurityEnvironment({
        APP_ENV: "production",
        LLM_PROVIDER: "openai",
      }),
    ).toThrow("OPENAI_API_KEY");
  });

  it("rejects secrets accidentally exposed as public environment variables", () => {
    expect(() =>
      parseSecurityEnvironment({
        APP_ENV: "production",
        NEXT_PUBLIC_OPENAI_API_KEY: "not-allowed",
      }),
    ).toThrow("NEXT_PUBLIC_OPENAI_API_KEY");
  });
});

describe("provider URL allowlist", () => {
  it("accepts an explicitly allowed HTTPS provider origin", () => {
    expect(
      assertAllowedProviderUrl(
        "https://api.open-meteo.com/v1/forecast",
        ["api.open-meteo.com"],
      ).toString(),
    ).toBe("https://api.open-meteo.com/v1/forecast");
  });

  it("rejects arbitrary hosts, credentials, and non-HTTP protocols", () => {
    expect(() =>
      assertAllowedProviderUrl("https://evil.example/collect", [
        "api.open-meteo.com",
      ]),
    ).toThrow("allowlist");
    expect(() =>
      assertAllowedProviderUrl(
        "https://user:password@api.open-meteo.com/v1",
        ["api.open-meteo.com"],
      ),
    ).toThrow("credentials");
    expect(() =>
      assertAllowedProviderUrl("file:///etc/passwd", ["api.open-meteo.com"]),
    ).toThrow("protocol");
  });

  it("allows local development only when it is explicitly enabled", () => {
    expect(() =>
      assertAllowedProviderUrl("http://localhost:5000", ["localhost"]),
    ).toThrow(/local/i);
    expect(
      assertAllowedProviderUrl("http://localhost:5000", ["localhost"], {
        allowLocalDevelopment: true,
      }).hostname,
    ).toBe("localhost");
  });
});

describe("sensitive data controls", () => {
  it("redacts secrets, coordinates, calendar content, and nested values", () => {
    const redacted = redactSensitiveData({
      apiKey: "secret",
      location: { latitude: 40.1, longitude: -3.7 },
      calendarEvent: "private details",
      nested: { authorization: "Bearer token" },
      safe: "kept",
    });

    expect(redacted).toEqual({
      apiKey: "[REDACTED]",
      location: "[REDACTED]",
      calendarEvent: "[REDACTED]",
      nested: { authorization: "[REDACTED]" },
      safe: "kept",
    });
  });

  it("rejects oversized payloads before parsing provider data", () => {
    expect(() => validatePayloadSize("12345", 4)).toThrow("payload");
    expect(() => validatePayloadSize("1234", 4)).not.toThrow();
  });
});

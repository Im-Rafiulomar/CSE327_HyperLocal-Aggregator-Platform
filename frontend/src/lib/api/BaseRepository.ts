import type { HttpClient } from "../http/HttpClient";

/** Every resource repository owns exactly one API area (SRP). */
export abstract class BaseRepository {
  protected http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  protected qs(params: Record<string, string | number | undefined>) {
    return new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "") as [string, string][],
    ).toString();
  }
}

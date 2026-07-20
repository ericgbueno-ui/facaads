export function getMetaAccessToken(): string | null {
  return process.env.META_ADS_ACCESS_TOKEN?.trim() || null;
}

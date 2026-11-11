/** Resolve bundled public assets for both root and subpath static deployments. */
export function publicAsset(path: string) {
  return path.startsWith('/') && !path.startsWith('//')
    ? import.meta.env.BASE_URL + path.slice(1)
    : path;
}

export const constructFBProfileUrl = (authorId: string) =>
  `https://www.facebook.com/profile.php?id=${authorId}`;

export function extractPostId(url: string): string {
  const m =
    url.match(/\/posts\/(\d+)/) ??
    url.match(/multi_permalinks=(\d+)/) ??
    url.match(/story_fbid=(\d+)/);
  return m?.[1] ?? "";
}

export function extractGroupId(url: string): string {
  return url.match(/\/groups\/(\d+)/)?.[1] ?? "";
}

export function extractAuthorId(profileUrl: string): string {
  return (
    profileUrl.match(/\/user\/(\d+)/)?.[1] ??
    profileUrl.match(/profile\.php\?id=(\d+)/)?.[1] ??
    ""
  );
}

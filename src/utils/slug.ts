/**
 * Turns a well name like "EBSH3B1-6-2H (EBS-160)" into a URL-safe slug
 * like "ebsh3b1-6-2h-ebs-160". Used because the sheet has no Well_ID.
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Makes a list of slugs unique by appending -2, -3, ... to duplicates,
 * so two wells that happen to share a name never collide on one route.
 */
export function dedupeSlugs(slugs: string[]): string[] {
  const seen = new Map<string, number>();
  return slugs.map((slug) => {
    const base = slug || "well";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  });
}

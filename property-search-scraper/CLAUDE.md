# Guidance for Claude on this scraper

## Selectors: DO NOT invent them

Facebook ships obfuscated, frequently-rotated class names and inconsistent
DOM trees across post types (regular post, commerce listing single-image,
commerce listing multi-photo, video viewer, photo lightbox). Selectors
that "look reasonable" from training data have repeatedly failed against
the real DOM and cost the user significant debug time.

**Hard rules — break these and you waste the user's time:**

1. Only use a selector you have **confirmed against a real HTML dump**
   (e.g., a `debug*.html` file in the repo, an `lib/test/testHTMLPages/*.html`
   fixture, or content the user pasted in the current conversation).
2. If the user asks for behavior on a DOM shape we have no dump for, **ask
   for a dump first** (e.g. "save the lightbox HTML to debug4.html"). Do
   not write speculative code and ask them to "try it."
3. When extending an existing selector, **keep the existing one as a
   fallback** unless the user explicitly tells you to replace it. Existing
   selectors were paid for in debug time.
4. Prefer stable signals over class names:
   - `page.url()` content (e.g., `/videos/`, `/photo/`, `/permalink/`)
   - `aria-label` / `aria-posinset` / `role`
   - FB's perf hooks: `data-visualcompletion`, `data-imgperflogname`,
     `data-ad-rendering-role`
   - These rarely change because they back FB's own observability.
5. Class-name-based selectors (the `x14rh7hd`-style obfuscated classes)
   are reshuffled every deploy — never use them.

If you need to extend a selector and have no dump, the right move is one
sentence: "I don't have a dump of this shape — can you save it to
`debug<N>.html`?" Not a guess.

## Working iteratively with scrape.ts + repl.ts

- `scrape.ts` launches Patchright with `--remote-debugging-port=9222` and
  idles after the scrape so the browser stays up.
- `repl.ts` attaches via `connectOverCDP` to the same Chrome instance.
  `browser.close()` in repl.ts only disconnects the CDP client — the
  browser keeps running.
- The user iterates by editing the experiment function and re-running
  `npx tsx repl.ts` against the still-logged-in session.

## Awaiting promises

Always `await` Playwright/Patchright actions inside async functions.
Unawaited promises (including `.then()` chains that aren't returned) will
fire AFTER the surrounding function resolves and the caller has run
`browser.close()`, producing a misleading

> Target page, context or browser has been closed

This bug has bitten the user multiple times. When you see that error
message, the first thing to check is missing `await`s.

## Stack reminders

- TypeScript + Patchright (stealth Playwright fork) + ghost-cursor.
- No `tsconfig.json` at scraper root, but `@types/node` is in
  devDependencies. `tsx` is the runner (`npx tsx <file>`).
- Persistent Chrome user-data-dir is `./fb-session/`. Only one process
  can use it at a time (Chrome locks it).
- The scraper is one source in a larger Bangalore property-search
  platform (Node backend + Next.js frontend + Prisma). Do not couple
  scraper code to that schema directly; emit data-bag objects.

## Video URLs

- FB videos are streamed via MSE-in-Worker (`MediaSourceHandle`). The
  `<video>` element has no `src`; the actual segment URLs are short-lived
  `.kf` chunks that aren't reconstructable from the DOM.
- The pipeline approach: capture the post-level video permalink
  `https://www.facebook.com/<actorId>/videos/pcb.<postId>/<videoId>`
  (which is what `page.url()` becomes when the photo viewer lands on a
  video frame) and hand it to `yt-dlp` downstream. Don't try to extract
  segment URLs in this scraper.

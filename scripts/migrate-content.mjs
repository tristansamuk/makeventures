// One-off migration of the Decap-era Markdown in `migration/` into EmDash.
//
// Usage:
//   node scripts/migrate-content.mjs                       # local dev server, dev-bypass auth
//   EMDASH_URL=https://… EMDASH_TOKEN=ec_pat_… node scripts/migrate-content.mjs
//   node scripts/migrate-content.mjs --dry-run             # convert only, write nothing
//
// Safe to re-run: media is matched by filename and entries by slug, and
// anything that already exists is skipped.

import { randomBytes } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EmDashClient } from "emdash/client";
import remarkGfm from "remark-gfm";
import sharp from "sharp";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { parse as parseYaml } from "yaml";

// Date-only frontmatter values ("Mar 20 2026") must not shift with the machine's timezone.
process.env.TZ = "UTC";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "migration/content");
const BASE_URL = (process.env.EMDASH_URL ?? "http://localhost:4321").replace(/\/$/, "");
const TOKEN = process.env.EMDASH_TOKEN;
const DRY_RUN = process.argv.includes("--dry-run");

// `whoami.md` has a sentence in its tags list; it is not a real tag.
const DROPPED_TAGS = new Set([
  "Building practical home automation, electronics, and IoT projects—one experiment at a time.",
]);

const VIDEO_SHORTCODE = /^\{\{<\s*video\s+"([^"]+)"(?:\s+"([^"]*)")?\s*>\}\}$/;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const HTML_COMMENT = /^<!--[\s\S]*-->$/;

const key = () => randomBytes(6).toString("hex");
const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const toIso = (value) => (value == null ? undefined : new Date(value).toISOString());

// ---------------------------------------------------------------------------
// Markdown -> Portable Text
// ---------------------------------------------------------------------------

/** Flatten inline mdast nodes into Portable Text spans, collecting link markDefs. */
function inlineToSpans(nodes, markDefs, marks = []) {
  const spans = [];
  for (const node of nodes) {
    switch (node.type) {
      case "text":
        // A newline inside a text node is a soft wrap in the source, not a line break.
        spans.push({ _type: "span", _key: key(), text: node.value.replace(/\s*\n\s*/g, " "), marks });
        break;
      case "inlineCode":
        spans.push({ _type: "span", _key: key(), text: node.value, marks: [...marks, "code"] });
        break;
      case "break":
        spans.push({ _type: "span", _key: key(), text: "\n", marks });
        break;
      case "strong":
        spans.push(...inlineToSpans(node.children, markDefs, [...marks, "strong"]));
        break;
      case "emphasis":
        spans.push(...inlineToSpans(node.children, markDefs, [...marks, "em"]));
        break;
      case "delete":
        spans.push(...inlineToSpans(node.children, markDefs, [...marks, "strike-through"]));
        break;
      case "link": {
        const linkKey = key();
        markDefs.push({ _key: linkKey, _type: "link", href: node.url });
        spans.push(...inlineToSpans(node.children, markDefs, [...marks, linkKey]));
        break;
      }
      default:
        throw new Error(`Unsupported inline Markdown node "${node.type}"`);
    }
  }
  return spans;
}

function textBlock(children, extra = {}) {
  const markDefs = [];
  const spans = inlineToSpans(children, markDefs);
  return { _type: "block", _key: key(), style: "normal", markDefs, children: spans, ...extra };
}

function tableBlock(node) {
  const markDefs = [];
  const rows = node.children.map((row, rowIndex) => ({
    _type: "tableRow",
    _key: key(),
    cells: row.children.map((cell, column) => ({
      _type: "tableCell",
      _key: key(),
      content: inlineToSpans(cell.children, markDefs),
      ...(rowIndex === 0 ? { isHeader: true } : {}),
      ...(node.align?.[column] ? { textAlign: node.align[column] } : {}),
    })),
  }));
  return { _type: "table", _key: key(), rows, hasHeaderRow: true, markDefs };
}

/**
 * Convert block-level mdast nodes. `ctx.resolveImage` maps a Markdown image URL
 * to an uploaded media item; `ctx.source` is the Markdown the nodes came from.
 */
async function blocksFrom(nodes, ctx, list) {
  const blocks = [];
  for (const node of nodes) {
    switch (node.type) {
      case "heading":
        blocks.push(textBlock(node.children, { style: `h${node.depth}` }));
        break;

      case "paragraph": {
        const [only] = node.children;
        if (node.children.length === 1 && only.type === "image") {
          const media = await ctx.resolveImage(only.url);
          blocks.push({
            _type: "image",
            _key: key(),
            asset: { _ref: media.id, url: media.src },
            alt: only.alt || undefined,
            // Markdown image titles were tooltips, not visible captions.
            title: only.title || undefined,
            width: media.width,
            height: media.height,
          });
          break;
        }
        // Match on the raw source: GFM autolinks the URL inside the shortcode.
        const raw = ctx.source.slice(node.position.start.offset, node.position.end.offset);
        const video = raw.trim().match(VIDEO_SHORTCODE);
        if (video) {
          const provider = video[1].includes("vimeo.com") ? "vimeo" : "youtube";
          blocks.push({ _type: "embed", _key: key(), url: video[1], provider });
          break;
        }
        blocks.push(textBlock(node.children, list ?? {}));
        break;
      }

      case "blockquote":
        for (const child of node.children) {
          if (child.type !== "paragraph") {
            throw new Error(`Unsupported node "${child.type}" inside a blockquote`);
          }
          blocks.push(textBlock(child.children, { style: "blockquote" }));
        }
        break;

      case "list": {
        const nested = {
          listItem: node.ordered ? "number" : "bullet",
          level: (list?.level ?? 0) + 1,
        };
        for (const item of node.children) {
          blocks.push(...(await blocksFrom(item.children, ctx, nested)));
        }
        break;
      }

      case "code":
        blocks.push({
          _type: "code",
          _key: key(),
          language: node.lang || undefined,
          code: node.value,
        });
        break;

      case "table":
        blocks.push(tableBlock(node));
        break;

      case "thematicBreak":
        blocks.push({ _type: "break", _key: key(), style: "lineBreak" });
        break;

      case "html":
        // Editorial notes left as HTML comments were never visible on the site.
        if (!HTML_COMMENT.test(node.value.trim())) {
          throw new Error(`Unsupported raw HTML: ${node.value.slice(0, 60)}`);
        }
        ctx.onDroppedComment?.();
        break;

      default:
        throw new Error(`Unsupported Markdown node "${node.type}"`);
    }
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Source files
// ---------------------------------------------------------------------------

async function readEntries(folder) {
  const dir = path.join(CONTENT_DIR, folder);
  const files = (await readdir(dir)).filter((file) => file.endsWith(".md")).sort();
  return Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(dir, file), "utf8");
      const match = raw.match(FRONTMATTER);
      if (!match) throw new Error(`${file}: no frontmatter`);
      const source = raw.slice(match[0].length);
      return {
        slug: file.replace(/\.md$/, ""),
        file: path.join(dir, file),
        frontmatter: parseYaml(match[1]),
        source,
        tree: unified().use(remarkParse).use(remarkGfm).parse(source),
      };
    }),
  );
}

// ---------------------------------------------------------------------------
// EmDash writes
// ---------------------------------------------------------------------------

/**
 * EmDash records an upload's raw pixel dimensions and ignores EXIF rotation, so
 * a photo taken sideways would be laid out with the wrong shape. Bake the
 * rotation into the pixels for those; leave every other file untouched.
 */
async function uprightImage(bytes) {
  const { orientation = 1 } = await sharp(bytes).metadata();
  if (orientation === 1) return bytes;
  return sharp(bytes).rotate().jpeg({ quality: 92 }).toBuffer();
}

/**
 * Upload an image the way the admin does: with its dimensions and a small
 * preview the server decodes for the blur placeholder. Without the preview the
 * server decodes the full photo, which takes far more CPU than the Workers Free
 * plan allows a request. `EmDashClient.mediaUpload` cannot send these fields,
 * so this posts the form through the client's authenticated transport.
 */
async function uploadWithPreview(client, bytes, filename) {
  const { width, height, format } = await sharp(bytes).metadata();
  const preview = await sharp(bytes).resize(64, 64, { fit: "inside" }).jpeg({ quality: 70 }).toBuffer();

  const form = new FormData();
  form.append("file", new Blob([bytes], { type: `image/${format}` }), filename);
  form.append("width", String(width));
  form.append("height", String(height));
  form.append("thumbnail", new Blob([preview], { type: "image/jpeg" }), `preview-${filename}`);

  const request = new Request(`${BASE_URL}/_emdash/api/media`, { method: "POST", body: form });
  const response = await client.transport.fetch(request);
  if (!response.ok) {
    throw new Error(`Uploading ${filename} failed: ${response.status} ${await response.text()}`);
  }
  return (await response.json()).data.item;
}

function createMediaResolver(client, existing, stats) {
  const byFilename = new Map(existing.map((item) => [item.filename, item]));
  let dryId = 0;

  return async function resolve(entryFile, relativeUrl) {
    const file = path.resolve(path.dirname(entryFile), decodeURI(relativeUrl));
    const filename = path.basename(file);
    let item = byFilename.get(filename);
    if (item) {
      stats.mediaSkipped.add(filename);
    } else {
      const bytes = await uprightImage(await readFile(file));
      item = DRY_RUN
        ? { id: `dry-${dryId++}`, storageKey: filename, filename }
        : await uploadWithPreview(client, bytes, filename);
      byFilename.set(filename, item);
      stats.mediaUploaded.add(filename);
    }
    return {
      id: item.id,
      src: item.url ?? `/_emdash/api/media/file/${item.storageKey}`,
      width: item.width,
      height: item.height,
      storageKey: item.storageKey,
    };
  };
}

function imageFieldValue(media) {
  return {
    id: media.id,
    src: media.src,
    alt: "",
    width: media.width,
    height: media.height,
    provider: "local",
    meta: { storageKey: media.storageKey },
  };
}

async function ensureTerms(client, labels) {
  const wanted = new Map(labels.map((label) => [slugify(label), label]));
  const { items } = DRY_RUN ? { items: [] } : await client.terms("tag", { includeCounts: false });
  const bySlug = new Map(items.map((term) => [term.slug, term.id]));
  for (const [slug, label] of wanted) {
    if (bySlug.has(slug)) continue;
    if (DRY_RUN) {
      bySlug.set(slug, `dry-${slug}`);
      continue;
    }
    const created = await client.createTerm("tag", { slug, label });
    bySlug.set(slug, created.term?.id ?? created.id);
  }
  return bySlug;
}

async function existingSlugs(client, collection) {
  const slugs = new Set();
  if (DRY_RUN) return slugs;
  for (const status of ["published", "draft"]) {
    for await (const item of client.listAll(collection, { status })) slugs.add(item.slug);
  }
  return slugs;
}

async function migrateCollection(client, { collection, folder, toData, tagsOf }, resolveMedia, stats) {
  const entries = await readEntries(folder);
  const skip = await existingSlugs(client, collection);
  const termIds = tagsOf
    ? await ensureTerms(client, [...new Set(entries.flatMap((entry) => tagsOf(entry.frontmatter)))])
    : new Map();

  for (const entry of entries) {
    const label = `${collection}/${entry.slug}`;
    if (skip.has(entry.slug)) {
      console.log(`  skip    ${label} (already exists)`);
      stats.skipped.push(label);
      continue;
    }

    const ctx = {
      source: entry.source,
      resolveImage: (url) => resolveMedia(entry.file, url),
      onDroppedComment: () => console.log(`  note    ${label}: dropped an HTML comment`),
    };
    const hero = await ctx.resolveImage(entry.frontmatter.heroImage);
    const content = await blocksFrom(entry.tree.children, ctx);
    const data = {
      ...toData(entry.frontmatter),
      featured_image: imageFieldValue(hero),
      content,
    };

    if (DRY_RUN) {
      const types = content.reduce((acc, b) => ({ ...acc, [b._type]: (acc[b._type] ?? 0) + 1 }), {});
      console.log(`  dry-run ${label}`, JSON.stringify(types));
      stats.created.push(label);
      continue;
    }

    const item = await client.create(collection, { slug: entry.slug, data });
    if (tagsOf) {
      const ids = tagsOf(entry.frontmatter).map((tag) => termIds.get(slugify(tag)));
      // EmDashClient has no method for term assignment, so call the endpoint directly.
      await client.request("POST", `/content/${collection}/${item.id}/terms/tag`, { termIds: ids });
    }
    await client.publish(collection, item.id);
    console.log(`  create  ${label}`);
    stats.created.push(label);
  }
}

// ---------------------------------------------------------------------------
// Field mapping
// ---------------------------------------------------------------------------

const COLLECTIONS = [
  {
    collection: "posts",
    folder: "blog",
    tagsOf: (fm) => (fm.tags ?? []).filter((tag) => !DROPPED_TAGS.has(tag)),
    toData: (fm) => ({
      title: fm.title,
      description: fm.description.trim(),
      pub_date: toIso(fm.pubDate),
      updated_date: toIso(fm.updatedDate),
      author: fm.author,
    }),
  },
  {
    collection: "projects",
    folder: "projects",
    toData: (fm) => ({
      title: fm.title,
      nav_title: fm.navTitle,
      description: fm.description.trim(),
      pub_date: toIso(fm.pubDate),
      project_status: fm.status,
      completed_date: toIso(fm.completedDate),
      featured_stat: fm.featuredStat,
    }),
  },
];

// ---------------------------------------------------------------------------

async function main() {
  const isLocal = ["localhost", "127.0.0.1"].includes(new URL(BASE_URL).hostname);
  if (!TOKEN && !isLocal && !DRY_RUN) {
    throw new Error("EMDASH_TOKEN is required for a non-local EMDASH_URL");
  }
  const client = new EmDashClient({
    baseUrl: BASE_URL,
    ...(TOKEN ? { token: TOKEN } : { devBypass: isLocal }),
  });

  console.log(`Migrating to ${BASE_URL}${DRY_RUN ? " (dry run)" : ""}`);
  const stats = { created: [], skipped: [], mediaUploaded: new Set(), mediaSkipped: new Set() };
  const existingMedia = DRY_RUN ? [] : (await client.mediaList({ limit: 100 })).items;
  const resolveMedia = createMediaResolver(client, existingMedia, stats);

  for (const config of COLLECTIONS) {
    console.log(`\n${config.collection}`);
    await migrateCollection(client, config, resolveMedia, stats);
  }

  console.log(
    `\nEntries: ${stats.created.length} created, ${stats.skipped.length} skipped. ` +
      `Media: ${stats.mediaUploaded.size} uploaded, ${stats.mediaSkipped.size} already present.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

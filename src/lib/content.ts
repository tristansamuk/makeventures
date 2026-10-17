import { getEmDashCollection, getEmDashEntry, getTaxonomyTerms, getTermsForEntries } from "emdash";
import type { Post as PostData, Project as ProjectData } from "../../emdash-env";

export type HeroImage = PostData["featured_image"];
export type Body = NonNullable<PostData["content"]>;

export interface Tag {
  slug: string;
  label: string;
}

export interface BlogPost {
  /** URL slug: the post lives at `/blog/<slug>/`. */
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  heroImage: HeroImage;
  author: string;
  tags: Tag[];
  content: Body;
}

export type ProjectStatus = NonNullable<ProjectData["project_status"]>;

export interface Project {
  /** URL slug: the project lives at `/projects/<slug>/`. */
  slug: string;
  title: string;
  navTitle?: string;
  description: string;
  pubDate: Date;
  heroImage: HeroImage;
  status?: ProjectStatus;
  completedDate?: Date;
  featuredStat?: string;
  content: Body;
}

type PostEntry = { id: string; data: PostData };
type ProjectEntry = { id: string; data: ProjectData };

const toDate = (value: string | undefined) => (value ? new Date(value) : undefined);
const toTag = ({ slug, label }: Tag): Tag => ({ slug, label });

function toBlogPost(entry: PostEntry, tags: Tag[]): BlogPost {
  const { data } = entry;
  return {
    slug: entry.id,
    title: data.title,
    description: data.description,
    pubDate: new Date(data.pub_date),
    updatedDate: toDate(data.updated_date),
    heroImage: data.featured_image,
    author: data.author,
    tags,
    content: data.content ?? [],
  };
}

function toProject(entry: ProjectEntry): Project {
  const { data } = entry;
  return {
    slug: entry.id,
    title: data.title,
    navTitle: data.nav_title,
    description: data.description,
    pubDate: new Date(data.pub_date),
    heroImage: data.featured_image,
    status: data.project_status,
    completedDate: toDate(data.completed_date),
    featuredStat: data.featured_stat,
    content: data.content ?? [],
  };
}

/** Published posts, newest first. Pass a tag slug to filter. */
export async function getPosts(options: { tag?: string } = {}): Promise<BlogPost[]> {
  const { entries } = await getEmDashCollection("posts", {
    orderBy: { pub_date: "desc" },
    ...(options.tag ? { where: { tag: options.tag } } : {}),
  });
  const tagsByEntry = await getTermsForEntries(
    "posts",
    entries.map((entry) => entry.data.id),
    "tag",
  );
  return entries.map((entry) =>
    toBlogPost(entry, (tagsByEntry.get(entry.data.id) ?? []).map(toTag)),
  );
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  const { entry } = await getEmDashEntry("posts", slug);
  if (!entry) return undefined;
  return toBlogPost(entry, (entry.data.terms?.tag ?? []).map(toTag));
}

/** Published projects, newest first. */
export async function getProjects(): Promise<Project[]> {
  const { entries } = await getEmDashCollection("projects", {
    orderBy: { pub_date: "desc" },
  });
  return entries.map(toProject);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const { entry } = await getEmDashEntry("projects", slug);
  return entry ? toProject(entry) : undefined;
}

export async function getTag(slug: string): Promise<Tag | undefined> {
  const terms = await getTaxonomyTerms("tag", { includeCounts: false });
  const term = terms.find((item) => item.slug === slug);
  return term && toTag(term);
}

/** Public URL of an EmDash media value, for meta tags and structured data. */
export function mediaUrl(image: HeroImage | undefined): string | undefined {
  if (!image) return undefined;
  if (image.src) return image.src;
  const storageKey = image.meta?.storageKey;
  return typeof storageKey === "string" ? `/_emdash/api/media/file/${storageKey}` : undefined;
}

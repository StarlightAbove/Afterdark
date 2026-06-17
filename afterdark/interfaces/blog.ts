export type PostMeta = {
    slug: string;
    title: string;
    date: string;
    category: string;
    tags: string[];
    excerpt: string;
}

export type Post = PostMeta & {
    content: string;
}
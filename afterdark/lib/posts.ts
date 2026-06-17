import {Post, PostMeta} from "@/interfaces/blog"
import fs from "fs"
import matter, { read } from "gray-matter"
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import { cwd } from "process";
import path from "path";

const rootPosts = path.join(cwd(), 'posts')
const processor = unified()
  .use(remarkParse)        // parse markdown AST
  .use(remarkGfm)          // tables, strikethrough, task lists, autolinks
  .use(remarkRehype, { allowDangerousHtml: true }) // convert to HTML AST
  .use(rehypeRaw)          // handle raw HTML blocks in markdown
  .use(rehypeStringify); 

function readPost(dir: string, file: string, category: string) : PostMeta {
    const slug = file.replace(/\.md/, '');
    const fullPath = path.join(dir, file);
    const {data} = matter.read(fs.readFileSync(fullPath, "utf-8"))

    if(!data.title || !data.date){
        throw new Error("The date or title has not been set for this file. Please modify the frontmatter. ")
    }

    return {
        slug: slug,
        category: data.category,
        title: data.title,
        tags: data.tags,
        excerpt: data.excerpt,
        date: data.date
    };

}

export function getAllPosts() : PostMeta[]{
    const allEntries = fs.readdirSync(rootPosts);
    const posts = allEntries.flatMap((entry) => {
        const entryPath = path.join(rootPosts, entry);
        if(fs.statSync(entryPath).isDirectory()) {
            return fs.readdirSync(entryPath)
                    .filter((file) => file.endsWith('.md'))
                    .map((file) => readPost(entryPath, file, entry))
        } else if (entry.endsWith(".md")) {
            return [readPost(rootPosts, entry, 'uncat')];
        } else {
            return [];
        }
    })

    return posts.sort((a,b) => (a.date < b.date ? 1 : -1));

}

export async function getPost(category: string, slug: string) : Promise<Post> {
    const fullPath = path.join(rootPosts, category, `${slug}.md`);
    const contents = fs.readFileSync(fullPath, "utf-8");
    const { data, content } = matter(contents); 
    const process = processor.process(content);

    return {
        slug: slug,
        category: data.category,
        title: data.title,
        tags: data.tags,
        excerpt: data.excerpt,
        date: data.date,
        content: content
    };
}

export function getCategories() : string[] {
    return fs.readdirSync(rootPosts).filter((category) => fs.statSync(path.join(rootPosts, category)).isDirectory());
}

export function getTags() : string[] {
    const posts = getAllPosts();
    const tags = new Set(posts.flatMap((p) => p.tags));
    return Array.from(tags).sort();
}
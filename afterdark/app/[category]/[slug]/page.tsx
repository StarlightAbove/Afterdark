import {getPost, getAllPosts} from '@/lib/posts';
import Link from 'next/link';
type Props = {
    params: Promise<{category: string; slug: string}>;
}

export async function generateAsyncParams(){
    return getAllPosts().map(({category, slug}) => ({category, slug}));
}

export async function PostPage({params}: Props){
    const {category, slug} = await params;
    const post = await getPost(category, slug);

    return (
        <main>
            <header>
                <h1>{post.title}</h1>
                <div>
                    <time dateTime={post.date}>{post.date}</time>
                </div>
                <div>
                    {post.category}
                </div>
                {post.tags.length > 0 && (
                    <>
                    <span>·</span>
                    <div> {post.tags.map((tag) => (
                        <Link key={tag} href={`/blog?tag=${tag}`} className="rounded-full border px-2.5 py-0.5 text-xs font-medium hover:bg-accent transition-colors">
                        #{tag}
                        </Link>
                        ))}
                    </div>
                    </>
                 )}
            </header>

            <article dangerouslySetInnerHTML={{__html: post.content}} />
        </main>
    )
}
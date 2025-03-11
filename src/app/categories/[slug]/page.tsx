import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { type DefaultSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { PostCard } from '@/components/posts/post-card'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

type PostWithRelations = {
  id: string
  title: string
  content: string
  createdAt: Date
  author: {
    name: string | null
  }
  category: {
    name: string
    slug: string
  }
  votes?: {
    id: string
    value: number
  }[]
  _count: {
    comments: number
    votes: number
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as DefaultSession['user'] & { id: string })?.id

  const category = await db.category.findUnique({
    where: { slug: params.slug },
    include: {
      posts: {
        include: {
          author: {
            select: {
              name: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          votes: userId ? {
            where: {
              userId: userId,
            },
            take: 1,
          } : false,
          _count: {
            select: {
              comments: true,
              votes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!category) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        <p className="mt-2 text-muted-foreground">{category.description}</p>
      </div>
      <div className="space-y-4">
        {category.posts.map((post: PostWithRelations) => (
          <PostCard key={post.id} post={post} />
        ))}
        {category.posts.length === 0 && (
          <p className="text-center text-muted-foreground">No posts yet</p>
        )}
      </div>
    </div>
  )
} 
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { PostForm } from '@/components/posts/post-form'

export default async function NewPostPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/sign-in')
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create a new post</h1>
          <p className="mt-2 text-muted-foreground">
            Share your thoughts, questions, or experiences with other dads
          </p>
        </div>
        <PostForm categories={categories} />
      </div>
    </div>
  )
} 
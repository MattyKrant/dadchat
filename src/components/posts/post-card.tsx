'use client'

import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { VoteButtons } from './vote-buttons'

interface PostCardProps {
  post: {
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
    _count: {
      comments: number
      votes: number
    }
    votes?: {
      id: string
      value: number
    }[]
  }
}

export function PostCard({ post }: PostCardProps) {
  const userVote = post.votes?.[0]
  const voteCount = post.votes?.reduce((acc, vote) => acc + vote.value, 0) ?? 0

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex gap-4">
        <VoteButtons
          postId={post.id}
          initialVoteCount={voteCount}
          initialVote={userVote}
        />
        <div className="flex-1 space-y-1">
          <Link
            href={`/posts/${post.id}`}
            className="text-lg font-semibold hover:underline"
          >
            {post.title}
          </Link>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Posted by {post.author.name || 'Anonymous'}</span>
            <span>•</span>
            <Link
              href={`/categories/${post.category.slug}`}
              className="hover:underline"
            >
              {post.category.name}
            </Link>
            <span>•</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
            {post.content}
          </p>
          <div className="mt-4 flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <span>{post._count.comments}</span>
              <span>comments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
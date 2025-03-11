'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface VoteButtonsProps {
  postId: string
  initialVoteCount: number
  initialVote?: {
    id: string
    value: number
  }
}

export function VoteButtons({
  postId,
  initialVoteCount,
  initialVote,
}: VoteButtonsProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [currentVote, setCurrentVote] = useState(initialVote)

  async function handleVote(value: number) {
    if (!session) {
      router.push('/sign-in')
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      if (currentVote) {
        if (currentVote.value === value) {
          // Remove vote
          await fetch(`/api/posts/${postId}/vote`, {
            method: 'DELETE',
          })
          setVoteCount(voteCount - value)
          setCurrentVote(undefined)
        } else {
          // Update vote
          const response = await fetch(`/api/posts/${postId}/vote`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value }),
          })
          const updatedVote = await response.json()
          setVoteCount(voteCount - currentVote.value + value)
          setCurrentVote(updatedVote)
        }
      } else {
        // Create vote
        const response = await fetch(`/api/posts/${postId}/vote`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value }),
        })
        const newVote = await response.json()
        setVoteCount(voteCount + value)
        setCurrentVote(newVote)
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsLoading(false)
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={cn(
          'rounded p-1 hover:bg-accent',
          currentVote?.value === 1 && 'text-primary'
        )}
        aria-label="Upvote"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
      </button>
      <span className="text-sm font-medium">{voteCount}</span>
      <button
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={cn(
          'rounded p-1 hover:bg-accent',
          currentVote?.value === -1 && 'text-destructive'
        )}
        aria-label="Downvote"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="rotate-180"
        >
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
      </button>
    </div>
  )
} 
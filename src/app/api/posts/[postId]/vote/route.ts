import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { type DefaultSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const voteSchema = z.object({
  value: z.number().min(-1).max(1),
})

export async function PUT(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as DefaultSession['user'] & { id: string })?.id

    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const json = await req.json()
    const body = voteSchema.parse(json)

    const existingVote = await db.vote.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: params.postId,
        },
      },
    })

    if (existingVote) {
      const updatedVote = await db.vote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          value: body.value,
        },
      })
      return NextResponse.json(updatedVote)
    }

    const vote = await db.vote.create({
      data: {
        value: body.value,
        userId: userId,
        postId: params.postId,
      },
    })

    return NextResponse.json(vote)
  } catch (error) {
    console.error('Error in vote creation:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as DefaultSession['user'] & { id: string })?.id

    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await db.vote.delete({
      where: {
        userId_postId: {
          userId: userId,
          postId: params.postId,
        },
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error in vote deletion:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
} 
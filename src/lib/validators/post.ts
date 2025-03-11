import * as z from 'zod'

export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(128, 'Title must be less than 128 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(40000, 'Content must be less than 40000 characters'),
  categoryId: z.string().min(1, 'Category is required'),
})

export const updatePostSchema = createPostSchema.partial()

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment must not be empty')
    .max(10000, 'Comment must be less than 10000 characters'),
  postId: z.string().min(1, 'Post ID is required'),
  parentId: z.string().optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema> 
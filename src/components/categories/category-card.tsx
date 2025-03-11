'use client'

import Link from 'next/link'
import { type Category } from '@prisma/client'

interface CategoryCardProps {
  category: Category
  postCount: number
}

export function CategoryCard({ category, postCount }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="block rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-accent/50"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{category.name}</h3>
        <span className="text-sm text-muted-foreground">{postCount} posts</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
    </Link>
  )
} 
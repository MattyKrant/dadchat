import { db } from '@/lib/db'
import { CategoryCard } from '@/components/categories/category-card'

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="mt-2 text-muted-foreground">
          Browse topics and join discussions that interest you
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            postCount={category._count.posts}
          />
        ))}
      </div>
    </div>
  )
} 
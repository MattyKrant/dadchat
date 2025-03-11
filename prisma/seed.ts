import { PrismaClient } from '@prisma/client'
import { slugify } from '../src/lib/utils'

const prisma = new PrismaClient()

const categories = [
  {
    name: 'Parenting Tips',
    description: 'Share and discover practical advice on raising children.',
  },
  {
    name: 'Dad Life',
    description: 'General discussions about the joys and challenges of fatherhood.',
  },
  {
    name: 'Work-Life Balance',
    description: 'Tips and discussions on managing career and family responsibilities.',
  },
  {
    name: 'Health & Wellness',
    description: 'Discussions about physical and mental health for dads.',
  },
  {
    name: 'Relationships',
    description: 'Advice on maintaining healthy relationships with partners and children.',
  },
  {
    name: 'Activities & Hobbies',
    description: 'Share fun activities and hobbies to do with your kids.',
  },
]

async function main() {
  console.log('Start seeding...')

  for (const category of categories) {
    await prisma.category.create({
      data: {
        name: category.name,
        description: category.description,
        slug: slugify(category.name),
      },
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getOrganizationBilling(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/billing',
      {
        schema: {
          tags: ['billing'],
          summary: 'Get billing details of an organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              billing: z.object({
                seats: z.object({
                  amount: z.number(),
                  unit: z.number(),
                  price: z.number(),
                }),
                projects: z.object({
                  amount: z.number(),
                  unit: z.number(),
                  price: z.number(),
                }),
                total: z.number(),
              }),
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Billing')) {
          throw new UnauthorizedError(`You don't have access to this resource`)
        }

        const [amoutOfMembers, amountOfProjects] = await Promise.all([
          prisma.member.count({
            where: {
              organizationId: organization.id,
              role: {
                not: 'BILLING',
              },
            },
          }),
          prisma.project.count({
            where: {
              organizationId: organization.id,
            },
          }),
        ])

        return {
          billing: {
            seats: {
              amount: amoutOfMembers,
              unit: 10,
              price: amoutOfMembers * 10,
            },
            projects: {
              amount: amountOfProjects,
              unit: 20,
              price: amountOfProjects * 20,
            },
            total: amoutOfMembers * 10 + amountOfProjects * 20,
          },
        }
      },
    )
}
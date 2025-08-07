import { PrismaClient, RepositoryRole } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Create Users
  const users = await Promise.all(
    Array.from({ length: 5 }).map(async () =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          github_id: faker.string.alphanumeric(10),
          wallet_address: faker.finance.ethereumAddress(),
        },
      })
    )
  );

  // Create Organizations
  const organizations = await Promise.all(
    Array.from({ length: 2 }).map(async () =>
      prisma.organization.create({
        data: {
          name: faker.company.name(),
          github_org_id: faker.string.alphanumeric(10),
          installation_id: faker.string.alphanumeric(15),
          app_installed: true,
        },
      })
    )
  );

  // Create Repositories for each org
  const repositories = await Promise.all(
    organizations.flatMap((org) =>
      Array.from({ length: 2 }).map(() =>
        prisma.repository.create({
          data: {
            name: faker.word.words(2),
            github_repo_id: faker.string.alphanumeric(12),
            organization_id: org.id,
          },
        })
      )
    )
  );

  // Add RepositoryMaintainers
  await Promise.all(
    repositories.map((repo, i) => {
      const user = users[i % users.length];
      if (!user) {
        throw new Error('No users available for repository maintainer');
      }
      return prisma.repositoryMaintainer.create({
        data: {
          repository_id: repo.id,
          user_id: user.id,
          role: RepositoryRole.MAINTAIN,
          github_id: user.github_id,
        },
      });
    })
  );

  // Create Contributors
  const contributors = await Promise.all(
    Array.from({ length: 3 }).map(() =>
      prisma.contributor.create({
        data: {
          github_id: faker.string.alphanumeric(10),
          email: faker.internet.email(),
          wallet_address: faker.finance.ethereumAddress(),
        },
      })
    )
  );

  // Create Rewards
  await Promise.all(
    contributors.flatMap((contributor) =>
      repositories.map((repo) =>
        prisma.reward.create({
          data: {
            owner_github_id: faker.string.alphanumeric(10),
            contributor_github_id: contributor.github_id,
            repo_github_id: repo.github_repo_id,
            pr_number: faker.number.int({ min: 1, max: 1000 }),
            secret: faker.string.uuid(),
            amount_usd: faker.number.float({ min: 10, max: 100 }),
            amount_eth: faker.number.float({ min: 0.01, max: 0.1 }),
            claimed: false,
            contributor_id: contributor.id,
            repository_id: repo.id,
          },
        })
      )
    )
  );
}

main()
  .then(() => {
    console.log('🌱 Seeding complete!');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });

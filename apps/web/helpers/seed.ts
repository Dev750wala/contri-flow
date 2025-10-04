// import { PrismaClient, RepositoryRole } from '@prisma/client';
// import { faker } from '@faker-js/faker';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Starting seeding...');

//   // Clear existing data
//   await prisma.reward.deleteMany();
//   await prisma.repositoryMaintainer.deleteMany();
//   await prisma.repository.deleteMany();
//   await prisma.organization.deleteMany();
//   await prisma.contributor.deleteMany();
//   await prisma.user.deleteMany();

//   // Create users
//   const users = await Promise.all(
//     Array.from({ length: 10 }, async () => {
//       return prisma.user.create({
//         data: {
//           name: faker.person.fullName(),
//           email: faker.internet.email(),
//           github_id: faker.string.alphanumeric(20).toLowerCase(),
//           wallet_address: faker.finance.ethereumAddress(),
//         },
//       });
//     })
//   );

//   console.log(`✅ Created ${users.length} users`);

//   // Create organizations
//   const organizations = await Promise.all(
//     Array.from({ length: 5 }, async () => {
//       return prisma.organization.create({
//         data: {
//           name: faker.company.name(),
//           github_org_id: faker.string.numeric(10),
//           installation_id: faker.string.uuid(),
//           app_installed: faker.datatype.boolean(),
//           sync_maintainers: faker.datatype.boolean(),
//           owner_github_id: faker.string.numeric(10),
//         },
//       });
//     })
//   );

//   console.log(`✅ Created ${organizations.length} organizations`);

//   // Create repositories for each organization
//   const repositories = [];
//   for (const org of organizations) {
//     const orgRepos = await Promise.all(
//       Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, async () => {
//         return prisma.repository.create({
//           data: {
//             name: faker.lorem.words(2).replace(/ /g, '-'),
//             github_repo_id: faker.string.numeric(10),
//             organization_id: org.id,
//           },
//         });
//       })
//     );
//     repositories.push(...orgRepos);
//   }

//   console.log(`✅ Created ${repositories.length} repositories`);

//   // Create repository maintainers
//   const maintainers = [];
//   for (const repo of repositories) {
//     // Choose a random number of maintainers, then pick unique users for this repo
//     const numberOfMaintainers = faker.number.int({ min: 1, max: 3 });
//     const uniqueUsersForRepo: typeof users = [];
//     const usedGithubIds = new Set<string>();
//     while (uniqueUsersForRepo.length < numberOfMaintainers) {
//       const candidate = faker.helpers.arrayElement(users);
//       if (!usedGithubIds.has(candidate.github_id)) {
//         usedGithubIds.add(candidate.github_id);
//         uniqueUsersForRepo.push(candidate);
//       }
//     }

//     const repoMaintainers = await Promise.all(
//       uniqueUsersForRepo.map(async (user) => {
//         return prisma.repositoryMaintainer.create({
//           data: {
//             repository_id: repo.id,
//             user_id: user.id,
//             github_id: user.github_id,
//             role: faker.helpers.arrayElement([
//               RepositoryRole.ADMIN,
//               RepositoryRole.MAINTAIN,
//             ]),
//           },
//         });
//       })
//     );
//     maintainers.push(...repoMaintainers);
//   }

//   console.log(`✅ Created ${maintainers.length} maintainers`);

//   // Create contributors
//   // Precompute unique user assignments to avoid race conditions with unique(user_id)
//   const numContributors = 15;
//   const unusedUserIds = faker.helpers.shuffle(users.map((u) => u.id));
//   const contributorPlans = Array.from({ length: numContributors }, () => {
//     const shouldAttachUser = faker.datatype.boolean({ probability: 0.6 });
//     const user_id =
//       shouldAttachUser && unusedUserIds.length > 0
//         ? unusedUserIds.pop()!
//         : null;
//     return { user_id };
//   });

//   const contributors = await Promise.all(
//     contributorPlans.map(async (plan) => {
//       return prisma.contributor.create({
//         data: {
//           github_id: faker.string.alphanumeric(20).toLowerCase(),
//           wallet_address: faker.datatype.boolean({ probability: 0.7 })
//             ? faker.finance.ethereumAddress()
//             : null,
//           email: faker.datatype.boolean({ probability: 0.8 })
//             ? faker.internet.email()
//             : null,
//           user_id: plan.user_id,
//         },
//       });
//     })
//   );

//   console.log(`✅ Created ${contributors.length} contributors`);

//   // Create rewards
//   const rewards = [];
//   for (const repo of repositories) {
//     const rewardsCount = faker.number.int({ min: 3, max: 8 });
//     const usedPrNumbers = new Set<number>();
//     const getUniquePrNumber = () => {
//       let n: number;
//       do {
//         n = faker.number.int({ min: 1, max: 100000 });
//       } while (usedPrNumbers.has(n));
//       usedPrNumbers.add(n);
//       return n;
//     };

//     const repoRewards = await Promise.all(
//       Array.from({ length: rewardsCount }, async () => {
//         const contributor = faker.helpers.arrayElement(contributors);
//         const issuer = faker.helpers.arrayElement(
//           maintainers.filter((m) => m.repository_id === repo.id)
//         );

//         return prisma.reward.create({
//           data: {
//             pr_number: getUniquePrNumber(),
//             secret: faker.string.uuid(),
//             tokenAmount: faker.number.int({ min: 1, max: 100000 }).toString(),
//             claimed: faker.datatype.boolean({ probability: 0.3 }),
//             claimed_at: faker.datatype.boolean({ probability: 0.3 })
//               ? faker.date.recent()
//               : null,
//             contributor_id: contributor.id,
//             repository_id: repo.id,
//             issuer_id: issuer.id,
//           },
//         });
//       })
//     );
//     rewards.push(...repoRewards);
//   }

//   console.log(`✅ Created ${rewards.length} rewards`);

//   console.log('🌱 Seeding completed successfully!');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Seeding failed:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

import { PrismaClient } from '@prisma/client';

// Source database (local)
const sourceDb = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:dev@localhost:5432/contriflow-v2?schema=public"
    }
  }
});

// Target database (hosted)
const targetDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || ''
    }
  }
});

async function migrateData() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Step 0: Check what exists in target database
    console.log('🔍 Checking existing data in Neon database...');
    const existingUsers = await targetDb.user.findMany();
    const existingOrgs = await targetDb.organization.findMany();
    const existingRepos = await targetDb.repository.findMany();

    console.log(`Found in Neon:`);
    console.log(`   - ${existingUsers.length} existing users`);
    console.log(`   - ${existingOrgs.length} existing organizations`);
    console.log(`   - ${existingRepos.length} existing repositories\n`);

    // Step 1: Fetch all data from source database
    console.log('📥 Fetching data from local database...');

    const users = await sourceDb.user.findMany();
    const organizations = await sourceDb.organization.findMany();
    const repositories = await sourceDb.repository.findMany();
    const maintainers = await sourceDb.repositoryMaintainer.findMany();
    const contributors = await sourceDb.contributor.findMany();
    const rewards = await sourceDb.reward.findMany();
    const payouts = await sourceDb.payout.findMany();
    const activities = await sourceDb.activity.findMany();

    console.log(`✅ Fetched from local:`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${organizations.length} organizations`);
    console.log(`   - ${repositories.length} repositories`);
    console.log(`   - ${maintainers.length} maintainers`);
    console.log(`   - ${contributors.length} contributors`);
    console.log(`   - ${rewards.length} rewards`);
    console.log(`   - ${payouts.length} payouts`);
    console.log(`   - ${activities.length} activities\n`);

    // Create ID mapping for entities that might have different IDs
    const userIdMap = new Map<string, string>();
    const orgIdMap = new Map<string, string>();
    const repoIdMap = new Map<string, string>();
    const maintainerIdMap = new Map<string, string>();

    // Step 2: Insert data into target database
    console.log('📤 Migrating data to Neon database...\n');

    // Insert users first (no dependencies)
    console.log('→ Migrating users...');
    let usersUpdated = 0;
    for (const user of users) {
      try {
        // First check if user exists by unique fields
        const existing = await targetDb.user.findFirst({
          where: {
            OR: [
              { github_id: user.github_id },
              ...(user.email ? [{ email: user.email }] : [])
            ]
          }
        });

        if (existing) {
          console.log(`   🔄 Updating existing user: ${user.github_id}`);
          await targetDb.user.update({
            where: { id: existing.id },
            data: user,
          });
          userIdMap.set(user.id, existing.id); // Map old ID to existing ID
          usersUpdated++;
        } else {
          const result = await targetDb.user.create({
            data: user,
          });
          userIdMap.set(user.id, result.id);
        }
      } catch (error: any) {
        console.error(`   ❌ Error migrating user ${user.github_id}:`, error.message);
        throw error;
      }
    }
    console.log(`✅ ${users.length} users migrated (${usersUpdated} updated, ${users.length - usersUpdated} created)`);

    // Insert organizations
    console.log('→ Migrating organizations...');
    let orgsUpdated = 0;
    for (const org of organizations) {
      try {
        // Update owner_id if user was remapped
        const mappedOwnerId = org.owner_id ? (userIdMap.get(org.owner_id) || org.owner_id) : null;
        const orgData = { ...org, owner_id: mappedOwnerId };

        // First check if organization exists by unique fields
        const existing = await targetDb.organization.findFirst({
          where: {
            OR: [
              { github_org_id: org.github_org_id },
              { installation_id: org.installation_id }
            ]
          }
        });

        if (existing) {
          console.log(`   🔄 Updating existing organization: ${org.name}`);
          await targetDb.organization.update({
            where: { id: existing.id },
            data: orgData,
          });
          orgIdMap.set(org.id, existing.id); // Map old ID to existing ID
          orgsUpdated++;
        } else {
          const result = await targetDb.organization.create({
            data: orgData,
          });
          orgIdMap.set(org.id, result.id);
        }
      } catch (error: any) {
        console.error(`   ❌ Error migrating organization ${org.name}:`, error.message);
        throw error;
      }
    }
    console.log(`✅ ${organizations.length} organizations migrated (${orgsUpdated} updated, ${organizations.length - orgsUpdated} created)`);

    // Insert repositories
    console.log('→ Migrating repositories...');
    let reposUpdated = 0;
    for (const repo of repositories) {
      try {
        // Update organization_id if org was remapped
        const mappedOrgId = orgIdMap.get(repo.organization_id) || repo.organization_id;
        const repoData = { ...repo, organization_id: mappedOrgId };

        // First check if repository exists by unique field
        const existing = await targetDb.repository.findUnique({
          where: { github_repo_id: repo.github_repo_id }
        });

        if (existing) {
          console.log(`   🔄 Updating existing repository: ${repo.name}`);
          await targetDb.repository.update({
            where: { id: existing.id },
            data: repoData,
          });
          repoIdMap.set(repo.id, existing.id); // Map old ID to existing ID
          reposUpdated++;
        } else {
          const result = await targetDb.repository.create({
            data: repoData,
          });
          repoIdMap.set(repo.id, result.id);
        }
      } catch (error: any) {
        console.error(`   ❌ Error migrating repository ${repo.name}:`, error.message);
        throw error;
      }
    }
    console.log(`✅ ${repositories.length} repositories migrated (${reposUpdated} updated, ${repositories.length - reposUpdated} created)`);

    // Insert maintainers
    console.log('→ Migrating repository maintainers...');
    let maintainersUpdated = 0;
    for (const maintainer of maintainers) {
      try {
        // Update repository_id and user_id if they were remapped
        const mappedRepoId = repoIdMap.get(maintainer.repository_id) || maintainer.repository_id;
        const mappedUserId = maintainer.user_id ? (userIdMap.get(maintainer.user_id) || maintainer.user_id) : null;
        const maintainerData = {
          ...maintainer,
          repository_id: mappedRepoId,
          user_id: mappedUserId
        };

        // Check if maintainer exists by composite unique constraint
        const existing = await targetDb.repositoryMaintainer.findUnique({
          where: {
            repository_id_github_id: {
              repository_id: mappedRepoId,
              github_id: maintainer.github_id
            }
          }
        });

        if (existing) {
          console.log(`   🔄 Updating existing maintainer: ${maintainer.github_id}`);
          await targetDb.repositoryMaintainer.update({
            where: { id: existing.id },
            data: maintainerData,
          });
          maintainerIdMap.set(maintainer.id, existing.id); // Map old ID to existing ID
          maintainersUpdated++;
        } else {
          const result = await targetDb.repositoryMaintainer.create({
            data: maintainerData,
          });
          maintainerIdMap.set(maintainer.id, result.id);
        }
      } catch (error: any) {
        console.error(`   ❌ Error migrating maintainer ${maintainer.github_id}:`, error.message);
        throw error;
      }
    }
    console.log(`✅ ${maintainers.length} maintainers migrated (${maintainersUpdated} updated, ${maintainers.length - maintainersUpdated} created)`);

    // Insert contributors
    console.log('→ Migrating contributors...');
    let contributorsUpdated = 0;
    for (const contributor of contributors) {
      try {
        // Update user_id if user was remapped
        const mappedUserId = contributor.user_id ? (userIdMap.get(contributor.user_id) || contributor.user_id) : null;
        const contributorData = { ...contributor, user_id: mappedUserId };

        // Check if contributor exists by unique fields
        const existing = await targetDb.contributor.findFirst({
          where: {
            OR: [
              { github_id: contributor.github_id },
              ...(contributor.email ? [{ email: contributor.email }] : [])
            ]
          }
        });

        if (existing) {
          console.log(`   🔄 Updating existing contributor: ${contributor.github_id}`);
          await targetDb.contributor.update({
            where: { id: existing.id },
            data: contributorData,
          });
          contributorsUpdated++;
        } else {
          await targetDb.contributor.create({
            data: contributorData,
          });
        }
      } catch (error: any) {
        console.error(`   ❌ Error migrating contributor ${contributor.github_id}:`, error.message);
        throw error;
      }
    }
    console.log(`✅ ${contributors.length} contributors migrated (${contributorsUpdated} updated, ${contributors.length - contributorsUpdated} created)`);

    // Insert rewards
    console.log('→ Migrating rewards...');
    let rewardsUpdated = 0;
    for (const reward of rewards) {
      try {
        // Update all foreign key references if they were remapped
        const mappedRepoId = repoIdMap.get(reward.repository_id) || reward.repository_id;
        const mappedIssuerId = maintainerIdMap.get(reward.issuer_id) || reward.issuer_id;
        const rewardData = {
          ...reward,
          repository_id: mappedRepoId,
          issuer_id: mappedIssuerId
        };

        // Check if reward exists by composite unique constraint
        const existing = await targetDb.reward.findUnique({
          where: {
            repository_id_pr_number: {
              repository_id: mappedRepoId,
              pr_number: reward.pr_number
            }
          }
        });

        if (existing) {
          console.log(`   🔄 Updating existing reward for PR #${reward.pr_number}`);
          await targetDb.reward.update({
            where: { id: existing.id },
            data: rewardData,
          });
          rewardsUpdated++;
        } else {
          await targetDb.reward.create({
            data: rewardData,
          });
        }
      } catch (error: any) {
        console.error(`   ❌ Error migrating reward for PR #${reward.pr_number}:`, error.message);
        throw error;
      }
    }
    console.log(`✅ ${rewards.length} rewards migrated (${rewardsUpdated} updated, ${rewards.length - rewardsUpdated} created)`);

    // Insert payouts
    console.log('→ Migrating payouts...');
    let payoutsUpdated = 0;
    for (const payout of payouts) {
      try {
        // Check if payout exists by unique fields
        const existing = await targetDb.payout.findFirst({
          where: {
            OR: [
              { tx_hash: payout.tx_hash },
              { reward_id: payout.reward_id }
            ]
          }
        });

        if (existing) {
          console.log(`   🔄 Updating existing payout: ${payout.tx_hash}`);
          await targetDb.payout.update({
            where: { id: existing.id },
            data: payout,
          });
          payoutsUpdated++;
        } else {
          await targetDb.payout.create({
            data: payout,
          });
        }
      } catch (error: any) {
        console.error(`   ❌ Error migrating payout ${payout.tx_hash}:`, error.message);
        throw error;
      }
    }
    console.log(`✅ ${payouts.length} payouts migrated (${payoutsUpdated} updated, ${payouts.length - payoutsUpdated} created)`);

    // Insert activities
    console.log('→ Migrating activities...');
    let activitiesUpdated = 0;
    for (const activity of activities) {
      try {
        // Update organization_id if org was remapped
        const mappedOrgId = orgIdMap.get(activity.organization_id) || activity.organization_id;
        const activityData = { ...activity, organization_id: mappedOrgId };

        // Check if this exact activity already exists (by ID or similar criteria)
        const existing = await targetDb.activity.findUnique({
          where: { id: activity.id }
        });

        if (existing) {
          console.log(`   🔄 Updating existing activity`);
          await targetDb.activity.update({
            where: { id: existing.id },
            data: activityData,
          });
          activitiesUpdated++;
        } else {
          await targetDb.activity.create({
            data: activityData,
          });
        }
      } catch (error: any) {
        console.error(`   ❌ Error migrating activity:`, error.message);
        // Continue on error
      }
    }
    console.log(`✅ ${activities.length} activities migrated (${activitiesUpdated} updated, ${activities.length - activitiesUpdated} created)`);

    console.log('\n🎉 Migration completed successfully!');
    console.log('✅ All data has been synced to your Neon database (source is the source of truth).');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sourceDb.$disconnect();
    await targetDb.$disconnect();
  }
}

setTimeout(() => {
  migrateData()
    .then(() => {
      console.log('\n✅ Database migration script finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });

}, 10 * 1000);

console.log("THIS WILL OVERWRITE data in your Neon database with data from your local database.");
console.log('⏳ Waiting 10 seconds before starting migration to ensure you\'re ready...');
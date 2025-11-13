import { PrismaClient } from '@prisma/client';

// Source database (local)
const sourceDb = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:dev@localhost:5432/contriflow-v2?schema=public"
    }
  }
});

// Target database (Neon)
const targetDb = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://contri-flow_owner:npg_CJhlDPn4E0to@ep-tiny-smoke-a1eevaqn-pooler.ap-southeast-1.aws.neon.tech/contri-flow?sslmode=require&channel_binding=require"
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
    let usersSkipped = 0;
    for (const user of users) {
      try {
        const result = await targetDb.user.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        });
        userIdMap.set(user.id, result.id);
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Unique constraint violation - find existing user
          const existing = await targetDb.user.findFirst({
            where: {
              OR: [
                { email: user.email },
                { github_id: user.github_id }
              ]
            }
          });
          if (existing) {
            console.log(`   ⚠️  Skipping user (already exists): ${user.email || user.github_id}`);
            userIdMap.set(user.id, existing.id); // Map old ID to new ID
            usersSkipped++;
          }
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ ${users.length - usersSkipped} users migrated (${usersSkipped} skipped)`);

    // Insert organizations
    console.log('→ Migrating organizations...');
    let orgsSkipped = 0;
    for (const org of organizations) {
      try {
        // Update owner_id if user was remapped
        const mappedOwnerId = org.owner_id ? (userIdMap.get(org.owner_id) || org.owner_id) : null;
        const orgData = { ...org, owner_id: mappedOwnerId };
        
        const result = await targetDb.organization.upsert({
          where: { id: org.id },
          update: orgData,
          create: orgData,
        });
        orgIdMap.set(org.id, result.id);
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Find existing organization
          const existing = await targetDb.organization.findFirst({
            where: {
              OR: [
                { github_org_id: org.github_org_id },
                { installation_id: org.installation_id }
              ]
            }
          });
          if (existing) {
            console.log(`   ⚠️  Skipping organization (already exists): ${org.name}`);
            orgIdMap.set(org.id, existing.id); // Map old ID to new ID
            orgsSkipped++;
          }
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ ${organizations.length - orgsSkipped} organizations migrated (${orgsSkipped} skipped)`);

    // Insert repositories
    console.log('→ Migrating repositories...');
    let reposSkipped = 0;
    for (const repo of repositories) {
      try {
        // Update organization_id if org was remapped
        const mappedOrgId = orgIdMap.get(repo.organization_id) || repo.organization_id;
        const repoData = { ...repo, organization_id: mappedOrgId };
        
        const result = await targetDb.repository.upsert({
          where: { id: repo.id },
          update: repoData,
          create: repoData,
        });
        repoIdMap.set(repo.id, result.id);
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Find existing repository
          const existing = await targetDb.repository.findFirst({
            where: { github_repo_id: repo.github_repo_id }
          });
          if (existing) {
            console.log(`   ⚠️  Skipping repository (already exists): ${repo.name}`);
            repoIdMap.set(repo.id, existing.id); // Map old ID to new ID
            reposSkipped++;
          }
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ ${repositories.length - reposSkipped} repositories migrated (${reposSkipped} skipped)`);

    // Insert maintainers
    console.log('→ Migrating repository maintainers...');
    let maintainersSkipped = 0;
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
        
        const result = await targetDb.repositoryMaintainer.upsert({
          where: { id: maintainer.id },
          update: maintainerData,
          create: maintainerData,
        });
        maintainerIdMap.set(maintainer.id, result.id);
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Find existing maintainer
          const existing = await targetDb.repositoryMaintainer.findFirst({
            where: {
              repository_id: repoIdMap.get(maintainer.repository_id) || maintainer.repository_id,
              github_id: maintainer.github_id
            }
          });
          if (existing) {
            console.log(`   ⚠️  Skipping maintainer (already exists)`);
            maintainerIdMap.set(maintainer.id, existing.id); // Map old ID to new ID
            maintainersSkipped++;
          }
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ ${maintainers.length - maintainersSkipped} maintainers migrated (${maintainersSkipped} skipped)`);

    // Insert contributors
    console.log('→ Migrating contributors...');
    let contributorsSkipped = 0;
    for (const contributor of contributors) {
      try {
        // Update user_id if user was remapped
        const mappedUserId = contributor.user_id ? (userIdMap.get(contributor.user_id) || contributor.user_id) : null;
        const contributorData = { ...contributor, user_id: mappedUserId };
        
        await targetDb.contributor.upsert({
          where: { id: contributor.id },
          update: contributorData,
          create: contributorData,
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  Skipping contributor (already exists): ${contributor.github_id}`);
          contributorsSkipped++;
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ ${contributors.length - contributorsSkipped} contributors migrated (${contributorsSkipped} skipped)`);

    // Insert rewards
    console.log('→ Migrating rewards...');
    let rewardsSkipped = 0;
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
        
        await targetDb.reward.upsert({
          where: { id: reward.id },
          update: rewardData,
          create: rewardData,
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  Skipping reward (already exists)`);
          rewardsSkipped++;
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ ${rewards.length - rewardsSkipped} rewards migrated (${rewardsSkipped} skipped)`);

    // Insert payouts
    console.log('→ Migrating payouts...');
    let payoutsSkipped = 0;
    for (const payout of payouts) {
      try {
        await targetDb.payout.upsert({
          where: { id: payout.id },
          update: payout,
          create: payout,
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  Skipping payout (already exists)`);
          payoutsSkipped++;
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ ${payouts.length - payoutsSkipped} payouts migrated (${payoutsSkipped} skipped)`);

    // Insert activities
    console.log('→ Migrating activities...');
    let activitiesSkipped = 0;
    for (const activity of activities) {
      try {
        // Update organization_id if org was remapped
        const mappedOrgId = orgIdMap.get(activity.organization_id) || activity.organization_id;
        const activityData = { ...activity, organization_id: mappedOrgId };
        
        await targetDb.activity.upsert({
          where: { id: activity.id },
          update: activityData,
          create: activityData,
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  Skipping activity (already exists)`);
          activitiesSkipped++;
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ ${activities.length - activitiesSkipped} activities migrated (${activitiesSkipped} skipped)`);

    console.log('\n🎉 Migration completed successfully!');
    console.log('✅ All data has been migrated to your Neon database.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sourceDb.$disconnect();
    await targetDb.$disconnect();
  }
}

migrateData()
  .then(() => {
    console.log('\n✅ Database migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });

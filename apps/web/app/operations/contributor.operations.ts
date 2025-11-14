import { gql } from '@apollo/client';

// ========================================
// CONTRIBUTOR DASHBOARD QUERIES
// ========================================

/**
 * Get contributor dashboard overview data
 * FAST query - load immediately
 */
export const GET_CONTRIBUTOR_DASHBOARD = gql`
  query GetContributorDashboard($githubId: String!) {
    contributorByGithubId(github_id: $githubId) {
      id
      github_id
      email
      created_at
      updated_at
      user {
        id
        name
        email
      }
    }
  }
`;

/**
 * Get all rewards for a contributor (both claimed and unclaimed)
 * FAST query - indexed by contributor_id
 */
export const GET_CONTRIBUTOR_REWARDS = gql`
  query GetContributorRewards($githubId: String!) {
    rewardsByContributor(contributorGithubId: $githubId) {
      id
      pr_number
      token_amount
      claimed
      confirmed
      comment
      created_at
      updated_at
      repository {
        id
        name
        github_repo_id
        organization {
          id
          name
          github_org_id
        }
      }
      issuer {
        id
        github_id
        user {
          name
        }
      }
      payout {
        id
        tx_hash
        destination_chain
        total_amount
        receiver_address
        claimed_at
        platform_fee
      }
    }
  }
`;

/**
 * Get pending (unclaimed) rewards for a contributor
 * FAST query - filtered view
 */
export const GET_CONTRIBUTOR_PENDING_CLAIMS = gql`
  query GetContributorPendingClaims($githubId: String!) {
    rewardsByContributor(contributorGithubId: $githubId) {
      id
      pr_number
      token_amount
      claimed
      confirmed
      comment
      created_at
      repository {
        id
        name
        github_repo_id
        organization {
          id
          name
          github_org_id
        }
      }
      issuer {
        github_id
        user {
          name
        }
      }
    }
  }
`;

/**
 * Get contributor statistics
 * This aggregates data from rewards
 */
export const GET_CONTRIBUTOR_STATS = gql`
  query GetContributorStats($githubId: String!) {
    rewardsByContributor(contributorGithubId: $githubId) {
      id
      token_amount
      claimed
      confirmed
      repository {
        id
        name
      }
    }
  }
`;

/**
 * Get specific reward details
 * FAST query
 */
export const GET_REWARD_DETAILS = gql`
  query GetRewardDetails($rewardId: String!) {
    reward(id: $rewardId) {
      id
      pr_number
      secret
      token_amount
      claimed
      confirmed
      comment
      created_at
      updated_at
      contributor {
        id
        github_id
        email
      }
      repository {
        id
        name
        github_repo_id
        enabled_rewards
        organization {
          id
          name
          github_org_id
        }
      }
      issuer {
        id
        github_id
        role
        user {
          id
          name
        }
      }
      payout {
        id
        tx_hash
        destination_chain
        total_amount
        receiver_address
        claimed_at
        platform_fee
      }
    }
  }
`;

// ========================================
// CONTRIBUTOR MUTATIONS
// ========================================

/**
 * Get claim message for EIP-712 signature
 * This returns the message that needs to be signed by the wallet
 */
export const GET_CLAIM_MESSAGE = gql`
  query GetClaimMessage($rewardId: String!, $walletAddress: String!) {
    getClaimMessage(rewardId: $rewardId, walletAddress: $walletAddress)
  }
`;

/**
 * Claim a reward
 * This will trigger the on-chain payout process
 */
export const CLAIM_REWARD = gql`
  mutation ClaimReward($rewardId: String!, $signature: String!, $walletAddress: String!) {
    claimReward(rewardId: $rewardId, signature: $signature, walletAddress: $walletAddress) {
      id
      claimed
      payout {
        id
        tx_hash
        total_amount
        claimed_at
      }
    }
  }
`;

/**
 * Link contributor profile to user account
 */
export const LINK_CONTRIBUTOR_TO_USER = gql`
  mutation LinkContributorToUser($userId: String!, $githubId: String!) {
    linkContributorToUser(userId: $userId, github_id: $githubId) {
      id
      github_id
      user {
        id
        name
        email
      }
    }
  }
`;

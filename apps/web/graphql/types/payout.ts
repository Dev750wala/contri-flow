import { list, objectType } from 'nexus';
import { Context } from '../context';
import { Payout } from 'nexus-prisma';
import { RewardType } from './reward';
import { Payout as PayoutPrisma } from '@prisma/client';

export const PayoutType = objectType({
  name: Payout.$name,
  description: Payout.$description,
  definition(t) {
    t.field(Payout.id);
    t.field(Payout.total_amount);
    t.field(Payout.platform_fee);
    t.field(Payout.signature_hash);
    t.field(Payout.destination_chain);
    t.field(Payout.receiver_address);
    t.field(Payout.tx_hash);

    t.field(Payout.claimed_at);

    t.field(Payout.reward.name, {
      type: RewardType,
      resolve: async (parent: PayoutPrisma, _args, ctx: Context) => {
        return await ctx.prisma.reward.findUnique({
          where: { id: parent.reward_id },
        });
      }
    })
  },
});

import {
  AxelarQueryAPI,
  Environment,
  EvmChain,
  GasToken,
} from '@axelar-network/axelarjs-sdk';

export async function estimateGmpNativeFee(
  from: EvmChain,
  to: EvmChain,
  gasLimit = 700000
) {
  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });
  const fee = await api.estimateGasFee(from, to, gasLimit, GasToken.ETH);
  return fee;
}

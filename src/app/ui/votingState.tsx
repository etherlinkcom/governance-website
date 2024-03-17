import { TzktApiProvider } from '@/app/lib/api/tzktApiProvider';
import { RpcGovernanceStateProvider } from '@/app/lib/governance/state/providers/governanceStateProvider';
import BigNumber from 'bignumber.js';
import { GovernanceState, PeriodType } from '@/app/lib/governance/state/state';
import { unstable_noStore as noStore } from 'next/cache';
import ProposalState from '@/app/ui/proposalState';
import PeriodHeader from '@/app/ui/periodHeader';
import PromotionState from '@/app/ui/promotionState';
import { RpcGovernanceConfigProvider } from '../lib/governance/config/providers/governanceConfigProvider';
import { TezosToolkit } from '@taquito/taquito';

const rpcUrl = 'https://rpc.tzkt.io/ghostnet';
const apiProvider = new TzktApiProvider('https://api.ghostnet.tzkt.io');
const configProvider = new RpcGovernanceConfigProvider(new TezosToolkit(rpcUrl));

const readContractStateAtBlock = async <T,>(contractAddress: string, blockLevel: BigNumber): Promise<GovernanceState<T>> => {
  noStore();
  console.warn('Request Contract State')
  const provider = new RpcGovernanceStateProvider<T>(contractAddress, rpcUrl, apiProvider);
  return await provider.getState(blockLevel);
};

const getCurrentBlockLevel = async () => {
  noStore();
  return await apiProvider.getCurrentBlockLevel();
}

export default async function VotingState() {
  const contractAddress = 'KT1MHAVKVVDSgZsKiwNrRfYpKHiTLLrtGqod';
  const blockLevel = await getCurrentBlockLevel();
  const timeBetweenBlocks = await apiProvider.getTimeBetweenBlocks();

  const state = await readContractStateAtBlock<string>(contractAddress, blockLevel);
  const config = await configProvider.getConfig(contractAddress);

  const votingContext = state.votingContext;
  const { periodEndLevel } = votingContext.promotionPeriod ? votingContext.promotionPeriod : votingContext.proposalPeriod;
  const blocksRemain = periodEndLevel.minus(blockLevel).plus(1);
  const secondsRemain = blocksRemain.multipliedBy(timeBetweenBlocks);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always', style: 'long' });
  const timeRemains = formatter.format(secondsRemain.toNumber(), 'seconds');

  return <>
    <div className="flex gap-8 mb-4">
      <span title="Period index">{votingContext.periodIndex.toString()}</span>
      <PeriodHeader periodType={PeriodType.Proposal} startLevel={votingContext.proposalPeriod.periodStartLevel} endLevel={votingContext.proposalPeriod.periodEndLevel} />
      {votingContext.periodType === PeriodType.Promotion
        && <PeriodHeader periodType={PeriodType.Promotion} startLevel={votingContext.promotionPeriod.periodStartLevel} endLevel={votingContext.promotionPeriod.periodEndLevel} />}
    </div>
    <div>
      <h1>Current Voting State</h1> 
      <p>Current level: {blockLevel.toString()}</p>
      <p>Blocks remain: {blocksRemain.toString()}</p>
      <p>Period finishes: {timeRemains}</p>
      <p>Last winner payload: {state.lastWinnerPayload}</p>
      <p>Config: {JSON.stringify(config, undefined, 2)}</p>
      <br />
      <br />
      <ProposalState proposalPeriod={votingContext.proposalPeriod} />
      {votingContext.promotionPeriod && <><br /><br /><PromotionState promotionPeriod={votingContext.promotionPeriod} /></>}
    </div >
  </>
}
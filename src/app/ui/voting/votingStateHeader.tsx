import { PeriodType, VotingContext } from '@/app/lib/governance/state/state';
import BigNumber from 'bignumber.js'
import PeriodHeader from './periodHeader';
import { getFirstBlockOfPeriod, getLastBlockOfPeriod } from '@/app/lib/governance/utils/calculators';
import { GovernanceConfig } from '@/app/lib/governance/config/config';
import NavButton from './navButton';

interface VotingStateHeaderProps {
  periodIndex: BigNumber;
  currentPeriodIndex: BigNumber;
  votingContext: VotingContext;
  config: GovernanceConfig
}

export default function VotingStateHeader({ periodIndex, votingContext, currentPeriodIndex, config }: VotingStateHeaderProps) {
  const promotionPeriodIndex = votingContext.proposalPeriod.periodIndex.plus(1);
  const { startedAtLevel, periodLength } = config;
  const prevPeriodIndex = periodIndex.minus(1);
  const nextPeriodIndex = periodIndex.plus(1);

  return <div className="flex flex-row justify-between items-center pb-4 mb-8 border-b">
    <div className="flex flex-row gap-10 items-center">
      <NavButton disabled={prevPeriodIndex.lte(0)} periodIndex={prevPeriodIndex} />
      <span>Period: {periodIndex.toString()}</span>
      <PeriodHeader
        periodType={PeriodType.Proposal}
        periodIndex={votingContext.proposalPeriod.periodIndex}
        startLevel={votingContext.proposalPeriod.periodStartLevel}
        endLevel={votingContext.proposalPeriod.periodEndLevel} />
      {(votingContext.promotionPeriod || currentPeriodIndex.eq(votingContext.proposalPeriod.periodIndex)) && <PeriodHeader
        disabled={!votingContext.promotionPeriod}
        periodIndex={promotionPeriodIndex}
        periodType={PeriodType.Promotion}
        startLevel={votingContext.promotionPeriod?.periodStartLevel || getFirstBlockOfPeriod(promotionPeriodIndex, startedAtLevel, periodLength)}
        endLevel={votingContext.promotionPeriod?.periodEndLevel || getLastBlockOfPeriod(promotionPeriodIndex, startedAtLevel, periodLength)} />}
    </div>
    <div className='flex flex-row gap-10 items-center'>
      <span>Config</span>
      <NavButton isNext disabled={nextPeriodIndex.gt(currentPeriodIndex)} periodIndex={nextPeriodIndex} />
    </div>
  </div>
}
import { createAppContext } from '@/app/lib/appContext/createAppContext';
import { getCurrentPeriodIndex } from '@/app/lib/governance/utils/calculators';
import VotingState from '@/app/ui/voting/votingState';
import { redirect } from 'next/navigation';
import BigNumber from 'bignumber.js';

interface HomeProps {
  params: {
    periodIndex: string[] | undefined;
    contract: string;
  }
}

export default async function Home({ params }: HomeProps) {
  const context = createAppContext();
  const contract = context.config.contracts.find(c => c.name === params.contract);
  if (!contract)
    redirect(`/${context.config.contracts[0].name}/period`);

  const currentBlockLevel = await context.  apiProvider.getCurrentBlockLevel();

  const config = await context.governanceConfigProvider.getConfig(contract.address);
  const { startedAtLevel, periodLength } = config;
  const currentPeriodIndex = getCurrentPeriodIndex(currentBlockLevel, startedAtLevel, periodLength);
  const redirectUrl = `/${contract.name}/period/${currentPeriodIndex.toString()}`;

  const periodIndex = params.periodIndex && params.periodIndex.length === 1 ? BigNumber(params.periodIndex[0]) : undefined;
  if (!periodIndex || periodIndex.isNaN() || periodIndex.gt(currentPeriodIndex) || periodIndex.lt(0))
    redirect(redirectUrl);

  return <>
    <VotingState contract={contract} config={config} periodIndex={periodIndex} />
  </>;
}

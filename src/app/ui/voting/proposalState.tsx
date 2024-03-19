import { ProposalPeriod } from "@/app/lib/governance/state/state";
import { getProposalQuorumPercent } from "../../lib/governance/utils/calculators";
import BigNumber from 'bignumber.js'
import { GovernanceConfig } from "../../lib/governance/config/config";
import clsx from 'clsx';
import VotingPower from "@/app/ui/common/votingPower";
import NoData from "@/app/ui//common/noData";

interface ProposalStateProps {
  proposalPeriod: ProposalPeriod<string>;
  config: GovernanceConfig;
}

export default function ProposalState({ proposalPeriod, config }: ProposalStateProps) {
  if (!proposalPeriod.proposals.length)
    return <NoData text="No proposals" />

  const proposalList = <ul>
    {proposalPeriod.proposals.map(p =>
      <li key={p.key} className={clsx("block flex flex-row justify-between py-8 px-8 border mb-4", p.key === proposalPeriod.winnerCandidate ? 'border-emerald-500' : 'border-slate-500')}>
        <div className="flex flex-col">
          <span className="mb-1">
            Proposer: {p.proposer}
          </span>
          <span className="text-xl">
            0x{p.key}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="mb-1">upvotes:</span>
          <VotingPower className="text-xl" value={p.upvotesVotingPower} />
        </div>
      </li>)}
  </ul>

  const tableCellClass = 'text-center border border-slate-500 p-2';

  const upvotersTable = proposalPeriod.upvoters.length ? <table className="table-auto w-full border-collapse border border-slate-500">
    <thead>
      <tr>
        <th className={tableCellClass}>Baker</th>
        <th className={tableCellClass}>Voting Power</th>
        <th className={tableCellClass}>Proposal</th>
      </tr>
    </thead>
    <tbody>
      {proposalPeriod.upvoters.map(p => <tr key={p.proposalKey}>
        <td className={tableCellClass}>{p.address}</td>
        <td className={tableCellClass}><VotingPower value={p.votingPower} /></td>
        <td className={tableCellClass}>{p.proposalKey}</td>
      </tr>)}
    </tbody>
  </table> : <span className="block">No Upvoters</span>

  const proposalQuorum = getProposalQuorumPercent(proposalPeriod.candidateUpvotesVotingPower || BigNumber(0), proposalPeriod.totalVotingPower)

  return <>
    <div className="flex flex-row justify-between items-center mb-2">
      <h2 className="text-xl">Proposals</h2>
      <div>
        <span>Quorum: </span>
        <span className={clsx({ 'text-emerald-500': proposalQuorum.gte(config.proposalQuorum) })}>{proposalQuorum.toFixed(2)}% of {config.proposalQuorum.toFixed(2)}%</span>
      </div>
    </div>
    {proposalList}

    <br />
    <h2 className="text-xl mb-2">Upvoters</h2>
    {upvotersTable}
  </>
}
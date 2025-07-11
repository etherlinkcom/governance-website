import { PayloadKey } from '@/lib/governance';
import { LinkPure } from '@/app/components';
import { InlineCopy } from '@/app/components';

// Data about proposals and links to information about them
import { allLinkData } from "@/data/proposals";
import equal from 'fast-deep-equal';

interface InformationLinkProps {
  payloadKey: PayloadKey,
  contractAddress: string,
  period: "promotion" | "proposal",
}

export const InformationLink: React.FC<InformationLinkProps> = ({
  payloadKey,
  contractAddress,
  period,
}) => {
  const linkData = allLinkData.find((d) => equal(d.payloadKey, payloadKey));

  if (!linkData) {
    return null;
  }

  const proposalPeriodCommand = `octez-client transfer 0 from my_wallet to ${contractAddress} --entrypoint "upvote_proposal" --arg "${payloadKey}"`;

  const promotionPeriodCommand = `octez-client transfer 0 from my_wallet to ${contractAddress} --entrypoint "vote" --arg '"yea"'`;

  const command = period === 'proposal' ? proposalPeriodCommand : promotionPeriodCommand;
  const text = period === 'proposal' ? 'Copy command to upvote proposal' : 'Copy command to vote on promotion';

  return <>
    <LinkPure className="underline text-gray-400" href={linkData.href} target="_blank">
      {linkData.title}
    </LinkPure>
    <div>
      <InlineCopy text={text} code={command} />
    </div>
  </>

}

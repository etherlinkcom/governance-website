import styles from "./informationLink.module.css";

interface InformationLinkProps {
  cycle: number,
}

// Data about proposals and links to information about them
const allLinkData = [
  {
    periodType: 'kernel',
    cycles: [134, 135],
    href: 'https://medium.com/@etherlink/announcing-calypso-the-next-etherlink-upgrade-proposal-dbe92c576da9',
    title: 'Announcing Calypso: The Next Etherlink Upgrade Proposal',
  },
  {
    periodType: 'kernel',
    cycles: [83],
    href: 'https://medium.com/etherlink/announcing-bifr%C3%B6st-a-2nd-upgrade-proposal-for-etherlink-mainnet-ef1a7cf9715f',
    title: 'Announcing Bifröst: a 2nd upgrade proposal for Etherlink Mainnet',
  },
];

export const InformationLink = ({ cycle }: InformationLinkProps) => {

  // Get currently selected governance contract via parsing the URL.
  // There is probably a better way to do this but I couldn't find the type of governance from the contract.
  const currentUrl = window.location.href;
  const currentPeriodType = currentUrl.split('/').find((subPath) => ['kernel', 'security'].includes(subPath));

  const linkData = allLinkData.find(({ cycles, periodType }) => cycles.includes(cycle) && periodType === currentPeriodType);

  if (!linkData) {
    return <></>;
  }

  return <div>
    <a className={styles.externalLink} href={linkData.href} target="_blank">{linkData.title}
    </a>
  </div>
}
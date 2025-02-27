import styles from "./informationLink.module.css";

// Data about proposals and links to information about them
import { allLinkData } from "@/data/proposals";

interface InformationLinkProps {
  cycle: number,
}

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
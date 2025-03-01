import { PayloadKey } from '@/lib/governance';
import styles from "./informationLink.module.css";

// Data about proposals and links to information about them
import { allLinkData } from "@/data/proposals";

interface InformationLinkProps {
  payloadKey: PayloadKey,
}

export const InformationLink: React.FC<InformationLinkProps> = ({
  payloadKey
}) => {
  const linkData = allLinkData.find((d) => JSON.stringify(d.payloadKey) === JSON.stringify(payloadKey));
  
  if (!linkData) {
    return null;
  }

  return <div>
    <a className={styles.externalLink} href={linkData.href} target="_blank">
      {linkData.title}
    </a>
  </div>
}

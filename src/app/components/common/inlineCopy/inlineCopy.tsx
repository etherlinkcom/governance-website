import React from 'react';
import styles from "./inlineCopy.module.css";

import { CopyButton } from '../copyButton';

interface InlineCopyProps {
  code: string,
};

export const InlineCopy = ({ code }: InlineCopyProps) =>
  <div className={styles.container}>
    <code className={styles.command}>{code}</code>
    <CopyButton code={code} />
  </div>;
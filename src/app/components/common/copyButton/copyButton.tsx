'use client';

import React, {useCallback, useState, useRef, useEffect} from 'react';
import copy from 'copy-text-to-clipboard';
import Image from 'next/image';
import styles from "./copyButton.module.css";

import FiCopy from '../../../../img/FiCopy.svg';
import CopySuccess from '../../../../img/copy-success.svg';

interface CopyButtonProps {
  code: string,
};

export function CopyButton({ code }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeout = useRef<number | undefined>(undefined);
  const handleCopyCode = useCallback(() => {
    copy(code);
    setIsCopied(true);
    copyTimeout.current = window.setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  }, [code]);

  useEffect(() => () => window.clearTimeout(copyTimeout.current), []);

  return (<div className={styles.button}>
    <button
      type="button"
      aria-label="Copied"
      title="Copy"
      onClick={handleCopyCode}>
        {isCopied
          ? <Image src={CopySuccess} alt='copy success icon' width={24} height={24} />
          : <Image src={FiCopy} alt='copy icon' width={16} height={17} />
        }
    </button>
  </div>
  );
}
'use client';

import React, {useCallback, useState, useRef, useEffect} from 'react';
import Image from 'next/image';
import FiCopy from '/public/icons/FiCopy.svg';
import CopySuccess from '/public/icons/copy-success.svg';


interface CopyButtonProps {
  code: string,
};

export function CopyButton({ code }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeout = useRef<number | undefined>(undefined);
  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(code)
    setIsCopied(true);
    copyTimeout.current = window.setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  }, [code]);

  useEffect(() => () => window.clearTimeout(copyTimeout.current), []);

  return (
    <div className="relative inline-flex items-center justify-center">
      <button
        type="button"
        aria-label="Copied"
        title="Copy"
        onClick={handleCopyCode}
        className="relative w-8 h-8"
      >
        <span
          className={`
            absolute inset-0 flex items-center justify-center -mt-2
            transition-opacity duration-300 ease-in-out
            ${isCopied ? 'opacity-0' : 'opacity-100'}
          `}
        >
          <Image src={FiCopy} alt="copy icon" width={16} height={17} />
        </span>
        <span
          className={`
            absolute inset-0 flex items-center justify-center -mt-2
            transition-opacity duration-300 ease-in-out
            ${isCopied ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <Image src={CopySuccess} alt="copy success icon" width={16} height={17} />
        </span>
      </button>
    </div>
  );
}
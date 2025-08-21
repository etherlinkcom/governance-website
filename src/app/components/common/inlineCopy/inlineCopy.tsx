import React from 'react';

import { CopyButton } from '../copyButton';

interface InlineCopyProps {
  text: string,
  code: string,
};

export const InlineCopy = ({ text, code }: InlineCopyProps) =>
  <div className="flex mt-2">
    <div>{text}</div>
    <CopyButton code={code} />
  </div>;
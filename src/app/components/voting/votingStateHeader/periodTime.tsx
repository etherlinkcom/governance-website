'use client'

import { formatDateTimeCompact } from '@/lib/governance/utils';

interface PeriodTimeProps {
  time: Date;
  level: number;
}

export const PeriodTime = ({ time, level }: PeriodTimeProps) => {
  const now = new Date();
  const timeStr = formatDateTimeCompact(time);
  const isEstimatedTime = now < time;
  const content = `${timeStr}${isEstimatedTime ? '*' : ''}`;
  const title = `Level: ${level.toString()}; ${isEstimatedTime ? ' Estimated ' : ' '}Time: ${time.toLocaleString('en')}`

  return <span title={title}>{content}</span>
}
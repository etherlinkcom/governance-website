import { memo } from 'react'
import BigNumber from 'bignumber.js'
import { formatPercentageCompact } from '@/lib/governance/utils';
import { Progress as ProgressAnt } from 'antd';
import clsx from 'clsx';
import { appTheme } from '.';

interface ProgressProps {
  value: BigNumber;
  target: BigNumber;
  text: string;
  className?: string;
}

export const Progress = ({ value, target, text, className }: ProgressProps) => {
  const progressValue = value.dividedBy(target).toNumber() * 100;
  const title = `Current voting power: ${formatPercentageCompact(value)}; Required: ${formatPercentageCompact(target)}`;

  return <div className={clsx('flex flex-col', className)} title={title}>
    <div className="flex flex-row gap-6 justify-between">
      <span>{text}:</span>
      <span className={value.gte(target) ? appTheme.accentTextColor : appTheme.redTextColor}>
        {`${formatPercentageCompact(value)} / ${formatPercentageCompact(target)}`}
      </span>
    </div>
    <ProgressAnt
      style={{ fontSize: 4 }}
      size={['small', 2]}
      percent={progressValue}
      showInfo={false}
      strokeColor={value.gte(target) ? appTheme.accentColorValue : appTheme.redColorValue}
      trailColor={appTheme.borderColorValue}
      status={value.gte(target) ? 'success' : 'exception'} />
  </div>
};

export const ProgressPure = memo(Progress);

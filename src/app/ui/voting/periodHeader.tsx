'use client'

import { PeriodType } from "@/app/lib/governance/state/state"
import { LinkPure } from "@/app/ui/common";
import { getPeriodPageUrl } from '@/app/actions';
import { PeriodTime } from './periodTime';

interface PeriodHeaderProps {
  contractName: string;
  periodType: PeriodType;
  active?: boolean;
  disabled?: boolean;
  periodIndex: number;
  startLevel: number;
  startTime: Date;
  endTime: Date;
  endLevel: number;
}

export const PeriodHeader = ({
  contractName,
  periodType,
  active,
  disabled,
  periodIndex,
  startTime,
  startLevel,
  endTime,
  endLevel
}: PeriodHeaderProps) => {
  const periodName = periodType === PeriodType.Proposal ? 'Proposal' : 'Promotion';

  return <div className="flex flex-col items-start">
    <LinkPure href={getPeriodPageUrl(contractName, periodIndex.toString())} active={active} disabled={disabled}>{`${periodName}`}</LinkPure>
    <div className="text-[10px]">
      <PeriodTime time={startTime} level={startLevel} /> - <PeriodTime time={endTime} level={endLevel} />
    </div>
  </div>
}
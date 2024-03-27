import { getPeriodPageUrl } from '@/app/actions';
import clsx from 'clsx';
import Link from 'next/link';

interface NavButtonProps {
  contractName: string;
  periodIndex: bigint;
  disabled?: boolean;
  isNext?: boolean;
}

export default function NavButton({ contractName, periodIndex, isNext, disabled }: NavButtonProps) {
  const className = clsx('flex justify-center items-center border rounded-md h-[40px] w-[40px] text-lg', disabled ? 'border-slate-500 text-slate-500' : 'hover:bg-neutral-700');
  const content = { __html: isNext ? '&#8594;' : '&#8592;' };

  return !disabled
    ? <Link
      className={className}
      href={getPeriodPageUrl(contractName, periodIndex.toString())}
      dangerouslySetInnerHTML={content} />
    : <span className={clsx(className, 'cursor-default')} dangerouslySetInnerHTML={content}></span>
}
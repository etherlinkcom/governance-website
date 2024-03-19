import BigNumber from 'bignumber.js'
import clsx from 'clsx';
import Link from 'next/link';

interface NavButtonProps {
  periodIndex: BigNumber;
  disabled?: boolean;
  isNext?: boolean;
}

export default function NavButton({ periodIndex, isNext, disabled }: NavButtonProps) {
  const className = clsx('flex justify-center items-center border rounded-md h-[40px] w-[40px] text-lg', disabled ? 'border-slate-500 text-slate-500' : 'hover:bg-neutral-700');
  const content = { __html: isNext ? '&#8594;' : '&#8592;' };

  return !disabled
    ? <Link
      className={className}
      href={`/period/${periodIndex.toString()}`}
      dangerouslySetInnerHTML={content} />
    : <span className={clsx(className, 'cursor-default')} dangerouslySetInnerHTML={content}></span>
}
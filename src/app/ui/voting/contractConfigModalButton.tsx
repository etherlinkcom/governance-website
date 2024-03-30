'use client';

import { Modal } from 'antd';
import clsx from 'clsx';
import { useState } from 'react';
import { GovernanceConfig } from '@/app/lib/governance';
import { formatPercentageCompact, natToPercent } from '@/app/lib/governance/utils';
import Link from '../common/link';
import { getAppContext } from '@/app/lib/appContext';

interface ContractConfigProps {
  buttonText: string;
  config: GovernanceConfig;
  contractAddress: string;
  contractUrl: string;
  contractName: string;
}

export default function ContractConfigModalButton({ buttonText, contractName, contractAddress, contractUrl, config }: ContractConfigProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const cellClassName = 'border border-slate-500 p-2';

  return <>
    <button className="hover:text-gray-300" onClick={showModal}>{buttonText}</button>
    <Modal
      title="Contract config"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[]}
    >
      <table className="w-full mt-4">
        <tbody>
          <tr>
            <td className={cellClassName}>Contract type</td>
            <td className={clsx(cellClassName, 'text-right')}><span className="capitalize">{contractName}</span></td>
          </tr>
          <tr>
            <td className={cellClassName}>Contract address</td>
            <td className={clsx(cellClassName, 'text-right')}><Link href={contractUrl} target="_blank">{contractAddress}</Link></td>
          </tr>
          <tr>
            <td className={cellClassName}>Started at level</td>
            <td className={clsx(cellClassName, 'text-right')}>{config.startedAtLevel.toString()}</td>
          </tr>
          <tr>
            <td className={cellClassName}>Period length</td>
            <td className={clsx(cellClassName, 'text-right')}>{config.periodLength.toString()} blocks</td>
          </tr>
          <tr>
            <td className={cellClassName}>Adoption period</td>
            <td className={clsx(cellClassName, 'text-right')}>{config.adoptionPeriodSec.toString()} seconds</td>
          </tr>
          <tr>
            <td className={cellClassName}>Upvoting limit</td>
            <td className={clsx(cellClassName, 'text-right')}>{config.upvotingLimit.toString()}</td>
          </tr>
          <tr>
            <td className={cellClassName}>Proposal quorum</td>
            <td className={clsx(cellClassName, 'text-right')}>{formatPercentageCompact(natToPercent(config.proposalQuorum, config.scale))}</td>
          </tr>
          <tr>
            <td className={cellClassName}>Promotion quorum</td>
            <td className={clsx(cellClassName, 'text-right')}>{formatPercentageCompact(natToPercent(config.promotionQuorum, config.scale))}</td>
          </tr>
          <tr>
            <td className={cellClassName}>Promotion supermajority</td>
            <td className={clsx(cellClassName, 'text-right')}>{formatPercentageCompact(natToPercent(config.promotionSupermajority, config.scale))}</td>
          </tr>
        </tbody>
      </table>
    </Modal>
  </>
} 
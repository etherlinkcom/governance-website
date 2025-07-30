import { BlockchainProvider } from '@/lib/blockchain';
import { GovernanceOperationsProvider } from './provider'
import { Upvoter, Voter } from '..';
import { mapPayloadKey } from '../../utils';
import { HistoricalRpcClient } from '@/lib/rpc';
import { ContractAbstraction, TezosToolkit } from '@taquito/taquito';

export class RpcGovernanceOperationsProvider implements GovernanceOperationsProvider {
  constructor(
    private readonly blockchainProvider: BlockchainProvider
  ) { }

  async getUpvoters(
    contractAddress: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): Promise<Upvoter[]> {
    const [
      operations,
      bakers
    ] = await Promise.all([
      this.blockchainProvider.getContractOperations(contractAddress, ['new_proposal', 'upvote_proposal'], periodStartLevel, periodEndLevel),
      this.blockchainProvider.getBakers(periodEndLevel)
    ])
    const bakersMap = new Map(bakers.map(b => [b.address, b]));

    return operations.map(o => {
      const baker = bakersMap.get(o.sender.address);

      return {
        address: o.sender.address,
        alias: o.sender.alias,
        proposalKey: mapPayloadKey(o.parameter.value),
        votingPower: baker!.votingPower,
        operationHash: o.hash,
        operationTime: o.time
      } as Upvoter
    });
  }

  async getVoters(
    contractAddress: string,
    periodStartLevel: number,
    periodEndLevel: number
  ): Promise<Voter[]> {
    const [
      operations,
      bakers
    ] = await Promise.all([
      this.blockchainProvider.getContractOperations(contractAddress, ['vote'], periodStartLevel, periodEndLevel),
      this.blockchainProvider.getBakers(periodEndLevel)
    ])
    const bakersMap = new Map(bakers.map(b => [b.address, b]));

console.log({periodStartLevel})
    const rpc_client = new HistoricalRpcClient('https://rpc.tzkt.io/mainnet', periodStartLevel);
    const tezos_toolkit = new TezosToolkit(rpc_client);
    const delegationContract = await tezos_toolkit.contract.at('KT1Ut6kfrTV9tK967tDYgQPMvy9t578iN7iH');

    return await Promise.all(operations.map(async (o) => {
      // // Filter out operations that did not come from a baker
      // .filter(({ sender }) => bakersMap.has(sender.address))
      // .map(o => {
      const baker = bakersMap.get(o.sender.address);
      const globalVotingIndex = await this.blockchainProvider.getGlobalVotingPeriodIndex(periodStartLevel, periodStartLevel + 1);
      const delegateVotingPower: bigint = await this.getDelegateVotingPowerForAddress(o.sender.address, delegationContract, globalVotingIndex);
      // Get delegates from delegate contract at level
      // loop through them to get voting power
      const votingPower: bigint = (baker?.votingPower || BigInt(0)) + delegateVotingPower;

      return {
        address: o.sender.address,
        alias: o.sender.alias,
        vote: o.parameter.value,
        votingPower: votingPower,
        operationHash: o.hash,
        operationTime: o.time
      } as Voter
    }));
  }



  async getDelegateVotingPowerForAddress(address: string, delegationContract: any, globalVotingIndex: number): Promise<bigint> {
    if (address == 'tz1Z4C2Zx4iUf9KAJScG8qHQgch4fUgs37Ga') {
            console.log({address})
          }
      try {
          if (address == 'tz1Z4C2Zx4iUf9KAJScG8qHQgch4fUgs37Ga') console.log(3)
          const view = delegationContract.contractViews.list_voters({
              0: address,
              1: null
          });
          if (address == 'tz1Z4C2Zx4iUf9KAJScG8qHQgch4fUgs37Ga') console.log(4)
          const delegates: string[] = await view.executeView({ viewCaller: address });

          if (address == 'tz1Z4C2Zx4iUf9KAJScG8qHQgch4fUgs37Ga') {
            console.log({delegates})
          }
          if (delegates.length === 0) return BigInt(0);


          console.log({address, delegates})
          const delegate_totals = await Promise.allSettled(
              delegates.map(async (addr) => {
                  return this.blockchainProvider.getVotingPowerForAddress(addr, globalVotingIndex)
              })
          );

          console.log({delegate_totals})

          const delegate_sum: number =  delegate_totals.reduce((total, result) => {
              if (result.status === 'fulfilled') {
                  return total + result.value;
              } else {
                  throw new Error(`Error fetching voting power for delegate: ${result.reason}`);
              }
          }, 0);

          console.log({delegate_totals})
          return BigInt(delegate_sum);
      } catch (error) {
    if (address == 'tz1Z4C2Zx4iUf9KAJScG8qHQgch4fUgs37Ga') console.log({error})
      }
      return BigInt(0);
  }
}
import { ApiProvider } from "./provider";
import { Baker, TzktBigMapEntry, TzktTezosPeriodInfo, TzktVoter, VotingFinishedEventPayloadDto } from "../dto";

export class TzktApiProvider implements ApiProvider {
  constructor(
    private readonly baseUrl: string
  ) { }

  getVotingFinishedEvents(address: string): Promise<VotingFinishedEventPayloadDto[]> {
    const url = `${this.baseUrl}/v1/contracts/events`;
    const params = {
      contract: address,
      tag: 'voting_finished',
      'select.fields': 'payload',
      'sort.desc': 'id'
    }
    return this.fetchAllChunks(url, 300, params);
  }

  async getContractOriginationLevel(address: string): Promise<bigint> {
    const url = `${this.baseUrl}/v1/contracts/${address}`;
    return BigInt((await this.fetchJson(url) as any).firstActivity.toString());
  }

  async getCurrentBlockLevel(): Promise<bigint> {
    const url = `${this.baseUrl}/v1/head`;
    return BigInt((await this.fetchJson(url) as any).level.toString());
  }

  async getTimeBetweenBlocks(): Promise<bigint> {
    const url = `${this.baseUrl}/v1/protocols/current`;
    return BigInt((await this.fetchJson(url) as any).constants.timeBetweenBlocks.toString());
  }

  async getTotalVotingPower(level: bigint): Promise<bigint> {
    const period = await this.getTezosVotingPeriod(level)
    return BigInt(period.totalVotingPower.toString());
  }

  async getTezosVotingPeriod(level: bigint): Promise<TzktTezosPeriodInfo> {
    const url = `${this.baseUrl}/v1/voting/periods`;
    const params = {
      'firstLevel.le': level.toString(),
      'lastLevel.ge': level.toString(),
    };
    const periods: TzktTezosPeriodInfo[] = await this.fetchJson<TzktTezosPeriodInfo[]>(url, params)
    const result = periods[0]

    if (result === undefined)
      throw new Error(`Impossible to find tezos voting period for level ${level.toString()}`)

    return result;
  }

  async getBakers(level: bigint): Promise<Baker[]> {
    const votingPeriod = await this.getTezosVotingPeriod(level);
    const index = votingPeriod.index;
    const url = `${this.baseUrl}/v1/voting/periods/${index}/voters`;
    const rawResult = await this.fetchAllChunks<TzktVoter>(url, 100);
    return rawResult.map(r => ({
      address: r.delegate.address,
      alias: r.delegate.alias,
      votingPower: BigInt(r.votingPower.toString()),
    }) as Baker)
  }

  async getBigMapEntries<K, V>(id: bigint): Promise<Array<TzktBigMapEntry<K, V>>> {
    const url = `${this.baseUrl}/v1/bigmaps/${id.toString(10)}/keys`;
    return this.fetchJson(url, { select: 'key,value' });
  }

  private async fetchAllChunks<T>(url: string, limit: number, params?: Record<string, string>): Promise<T[]> {
    let offset = 0;
    let chunk: T[] = [];
    let result: T[] = [];
    do {
      chunk = await this.fetchJson<T[]>(url, { ...params, limit: limit.toString(), offset: offset.toString() });
      result.push(...chunk)
      offset += limit;
    } while (chunk.length)
    return result;
  }

  private async fetchJson<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    //TODO: improve
    let url = endpoint;
    if (params)
      url = `${url}?${new URLSearchParams(params).toString()}`;

    const res = await fetch(url, { cache: 'no-store' });
    return await res.json() as T;
  }
}
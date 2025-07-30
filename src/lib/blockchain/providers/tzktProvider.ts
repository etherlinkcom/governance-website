import { BlockchainProvider } from './provider';
import { Baker, ContractOperation, TzktBigMapEntry, TzktContractOperation, TzktTezosPeriodInfo, TzktVoter, VotingFinishedEventPayloadDto } from '../dto';
import { getEstimatedBlockCreationTime } from '../../governance/utils';

export class TzktProvider implements BlockchainProvider {
  constructor(
    private readonly baseUrl: string
  ) { }

  async getContractOperations(address: string, entrypoints: string[], startLevel: number, endLevel: number): Promise<ContractOperation[]> {
    const url = `${this.baseUrl}/v1/operations/transactions`;
    const params = {
      target: address,
      'entrypoint.in': entrypoints.join(','),
      'level.ge': startLevel.toString(),
      'level.le': endLevel.toString(),
      'select': 'hash,timestamp,sender,parameter'
    };
    const rawResult = await this.fetchAllChunks<TzktContractOperation>(url, 100, params);
    return rawResult.map(r => ({
      hash: r.hash,
      sender: r.sender,
      time: new Date(r.timestamp),
      parameter: r.parameter
    }))
  }

  async getBlocksCreationTime(levels: number[]): Promise<Map<number, Date>> {
    const result = new Map<number, Date>();
    const url = `${this.baseUrl}/v1/blocks`;
    const limit = 500;
    let promises = [];
    for (let i = 0; i <= levels.length; i += limit) {
      const levelsChunk = levels.slice(i, i + limit);
      const params = {
        'level.in': levelsChunk.join(','),
        'select.values': 'level,timestamp',
        limit: limit.toString()
      }
      promises.push(this.fetchJson<Array<[number, string]>>(url, params));
    }

    const results = await Promise.all(promises);
    results.forEach(blocks => {
      blocks.forEach(([level, timestamp]) => result.set(level, new Date(timestamp)));
    });

    return result;
  }

  async getBlockCreationTime(level: number): Promise<Date> {
    const url = `${this.baseUrl}/v1/blocks/${level.toString()}`;
    let result;

    try {
      result = new Date(((await this.fetchJson(url)) as any).timestamp);
    } catch {
      const [
        currentBlockLevel,
        timeBetweenBlocks
      ] = await Promise.all([
        this.getCurrentBlockLevel(),
        this.getTimeBetweenBlocks()
      ]);
      result = getEstimatedBlockCreationTime(level, currentBlockLevel, timeBetweenBlocks);
    }

    return result;
  }

  getVotingFinishedEvents(address: string): Promise<VotingFinishedEventPayloadDto[]> {
    const url = `${this.baseUrl}/v1/contracts/events`;
    const params = {
      contract: address,
      tag: 'voting_finished',
      'select.fields': 'payload',
      'sort.desc': 'id'
    }
    //TODO: we can use get count and then use Promise.all
    return this.fetchAllChunks(url, 300, params);
  }

  async getContractOriginationLevel(address: string): Promise<number> {
    const url = `${this.baseUrl}/v1/contracts/${address}`;
    return (await this.fetchJson(url) as any).firstActivity;
  }

  async getCurrentBlockLevel(): Promise<number> {
    const url = `${this.baseUrl}/v1/head`;
    return (await this.fetchJson(url, undefined, { next: { revalidate: 10 } }) as any).level;
  }

  async getTimeBetweenBlocks(): Promise<number> {
    const url = `${this.baseUrl}/v1/protocols/current`;
    return (await this.fetchJson(url) as any).constants.timeBetweenBlocks;
  }

  async getTotalVotingPower(level: number): Promise<bigint> {
    const period = await this.getTezosVotingPeriod(level);
    return BigInt(period.totalVotingPower.toString());
  }

  async getClosestVotingPeriodFallback(level: number): Promise<TzktTezosPeriodInfo> {
    const currentLevel = await this.getCurrentBlockLevel();
    if (level < currentLevel)
      throw new Error(`Impossible to find tezos voting period for level ${level.toString()}`);

    const url = `${this.baseUrl}/v1/voting/periods/current`;
    const period: TzktTezosPeriodInfo = await this.fetchJson<TzktTezosPeriodInfo>(url);

    if (period === undefined)
      throw new Error(`Impossible to find current tezos voting period for level`);

    return period;
  }

  async getTezosVotingPeriod(level: number): Promise<TzktTezosPeriodInfo> {
    const url = `${this.baseUrl}/v1/voting/periods`;
    const params = {
      'firstLevel.le': level.toString(),
      'lastLevel.ge': level.toString(),
    };
    const periods: TzktTezosPeriodInfo[] = await this.fetchJson<TzktTezosPeriodInfo[]>(url, params);
    const result = periods[0];

    if (result === undefined)
      return await this.getClosestVotingPeriodFallback(level);

    return result;
  }

  async getBakers(level: number): Promise<Baker[]> {
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

  async getBigMapEntries<K, V>(id: string): Promise<Array<TzktBigMapEntry<K, V>>> {
    const url = `${this.baseUrl}/v1/bigmaps/${id}/keys`;
    return this.fetchJson(url, { select: 'key,value' });
  }

  async getVotingPowerForAddress(address: string, global_voting_index: number): Promise<number> {
    try {
        let voting_power = 0;
        const url = `${this.baseUrl}/voting/periods/${global_voting_index}/voters/${address}`
        const data = await this.fetchJson<{ delegate: { address: string }; votingPower: number }>(url);

        if (!data) return voting_power;
        if (!data.votingPower) throw new Error(`No voting power found for address ${address} at global_voting_index ${global_voting_index}`);
        return data.votingPower;
    } catch (error) {
        return 0;
    }
  }

  async getGlobalVotingPeriodIndex(start_level: number, end_level: number): Promise<number> {
      const url = `${this.baseUrl}/v1/voting/periods`;
      const data = await this.fetchJson<{ index: number }[]>(
          url,
          { 'firstLevel.le': String(start_level), 'lastLevel.ge': String(end_level) }
      );
      if (!data || data.length === 0) throw new Error(`No voting period found for start level ${start_level} and end level ${end_level}`);
      if (data.length > 1) {
        console.warn(`Multiple voting periods found for start level ${start_level} and end level ${end_level}, returning the first one`);
      }
      return data[0].index;
  }

  protected async fetchAllChunks<T>(url: string, limit: number, params?: Record<string, string>): Promise<T[]> {
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

 protected async fetchJson<T>(
    endpoint: string,
    params?: Record<string, string>,
    fetchParams: RequestInit = { cache: 'no-store' },
    maxRetries: number = 5,
    baseDelayMs: number = 1000
): Promise<T> {
    let url = endpoint;
    if (params) {
        url = `${url}?${new URLSearchParams(params).toString()}`;
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch(url, fetchParams);

            if (res.ok) {
                return await res.json() as T;
            } else if (res.status === 429 && attempt < maxRetries) {
                const delay = baseDelayMs * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            } else {
                const errorBody = await res.text();
                throw new Error(`HTTP Error ${res.status}: ${res.statusText || 'Unknown Error'} - ${errorBody.substring(0, 200)}`);
            }
        } catch (error) {
            if ((error instanceof TypeError || (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')))) && attempt < maxRetries) {
                const delay = baseDelayMs * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            } else if (error instanceof Error && error.message.includes('blocks')) {
                throw error;
            } else {
                throw error;
            }
        }
    }
    throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts.`);
}
}

import { BaseConfig, Network } from '../types';

export const mainnetConfig: BaseConfig = {
  key: 'mainnet',
  name: 'Mainnet',
  network: Network.Mainnet,
  rpcUrl: 'https://rpc.tzkt.io/mainnet',
  tzktApiUrl: 'https://api.tzkt.io',
  tzktExplorerUrl: 'https://tzkt.io',
  // All contracts below are for Dyonisus
  contracts: [{
    address: 'KT1XdSAYGXrUDE1U5GNqUKKscLWrMhzyjNeh',
    name: 'slow'
  }, {
    address: 'KT1D1fRgZVdjTj5sUZKcSTPPnuR7LRxVYnDL',
    name: 'fast'
  }, {
    address: 'KT1NnH9DCAoY1pfPNvb9cw9XPKQnHAFYFHXa',
    name: 'sequencer'
  }]
};

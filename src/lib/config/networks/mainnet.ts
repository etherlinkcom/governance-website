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
    address: 'KT1VZVNCNnhUp7s15d9RsdycP7C1iwYhAQ8r',
    name: 'slow'
  }, {
    address: 'KT1DxndcFitAbxLdJCN3C1pPivqbC3RJxD1R',
    name: 'fast'
  }, {
    address: 'KT1WckZ2uiLfHCfQyNp1mtqeRcC1X6Jg2Qzf',
    name: 'sequencer'
  }]
};

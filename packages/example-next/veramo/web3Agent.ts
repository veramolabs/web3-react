/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createAgent, IDIDManager, IKeyManager, IResolver } from '@veramo/core'
import { CredentialIssuer, W3cMessageHandler } from '@veramo/credential-w3c'
import { AbstractIdentifierProvider, DIDManager } from '@veramo/did-manager'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { KeyManager } from '@veramo/key-manager'
import { SdrMessageHandler } from '@veramo/selective-disclosure'
import { JwtMessageHandler } from '@veramo/did-jwt'
import { MessageHandler } from '@veramo/message-handler'
import { Web3KeyManagementSystem } from './KeyManagementSystem'
import {
  DataStoreJson,
  DIDStoreJson,
  KeyStoreJson,
} from '@veramo/data-store-json'
import { LocalStorageStore } from './localStorageStore'
// import { NFTResolver } from './NFTResolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import { EthrDIDProvider } from '@veramo/did-provider-ethr'
import { MinimalImportableKey } from '@veramo/core'
import { Web3Provider } from '@ethersproject/providers'

const dataStore = LocalStorageStore.fromLocalStorage('veramo-state')
const infuraProjectId = '3586660d179141e3801c3895de1c2eba'

interface ConnectorInfo {
  provider: Web3Provider,
  chainId: number,
  accounts?: string[],
  name: string,
  isActive: boolean,
}

export async function createWeb3Agent({
  connectors
}: {
  connectors: ConnectorInfo[]
}) {

  const didProviders: Record<string, AbstractIdentifierProvider> = {}
  const web3Providers: Record<string, Web3Provider> = {}

  connectors.forEach(info => {
    didProviders[info.name] = new EthrDIDProvider({
      defaultKms: 'web3',
      network: info.chainId,
      web3Provider: info.provider,
    })
    web3Providers[info.name] = info.provider
  })

  const id = 'web3Agent'
  const agent = createAgent<IDIDManager & IKeyManager & IResolver>({
    context: {
      id,
      name: `Web3`,
    },
    plugins: [
      new DIDResolverPlugin({
        resolver: new Resolver({
          ethr: ethrDidResolver({
            // provider: web3Provider,
            infuraProjectId
          }).ethr,
          web: webDidResolver().web,
        }),
      }),
      new KeyManager({
        store: new KeyStoreJson(dataStore),
        kms: {
          web3: new Web3KeyManagementSystem(web3Providers, new KeyStoreJson(dataStore)),
        },
      }),
      new DIDManager({
        store: new DIDStoreJson(dataStore),
        defaultProvider: connectors[0]?.name,
        providers: didProviders,
      }),
      new CredentialIssuer(),
      new DataStoreJson(dataStore),
      new MessageHandler({
        messageHandlers: [
          new JwtMessageHandler(),
          new W3cMessageHandler(),
          new SdrMessageHandler(),
        ],
      }),
    ],
  })

  const identifiers = await agent.didManagerFind()
  for (const identifier of identifiers) {
    if (identifier.keys.filter((key) => key.kms !== 'web3').length === 0) {
      await agent.didManagerDelete({ did: identifier.did })
    }
  }

  for (const info of connectors) {
    if (info.accounts) {
      for (const account of info.accounts) {
        const did = `did:ethr:${info.chainId}:${account}`
        const controllerKeyId = `${did}#controller`
        await agent.didManagerImport({
          did,
          provider: info.name,
          controllerKeyId,
          keys: [{
            kid: controllerKeyId,
            type: 'Secp256k1',
            kms: 'web3',
            privateKeyHex: '',
            meta: {
              provider: info.name,
              account,
              algorithms: [
                'eth_signMessage',
                'eth_signTypedData',
                'eth_sendTransaction',
              ]
            },
          } as MinimalImportableKey],
        })
      }
    }
  }

  return agent
}

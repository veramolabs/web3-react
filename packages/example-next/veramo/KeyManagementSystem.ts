/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import { TransactionRequest, Web3Provider } from '@ethersproject/providers'
import {
  TKeyType,
  IKey,
  ManagedKeyInfo,
  MinimalImportableKey,
} from '@veramo/core'
import { AbstractKeyManagementSystem, AbstractKeyStore, ManagedPrivateKey } from '@veramo/key-manager'
import { toUtf8String } from '@ethersproject/strings'
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import { parse } from '@ethersproject/transactions'
// import Debug from 'debug'
// const debug = Debug('veramo:kms:web3')

type Eip712Payload = {
  domain: TypedDataDomain
  types: Record<string, TypedDataField[]>
  primaryType: string
  message: Record<string, any>
}

export class Web3KeyManagementSystem extends AbstractKeyManagementSystem {
  constructor(private providers: Record<string, Web3Provider>, private keyStore: AbstractKeyStore) {
    super()
  }

  createKey({ type }: { type: TKeyType }): Promise<ManagedKeyInfo> {
    throw Error('Not implemented')
  }

  async importKey(
    args: Omit<MinimalImportableKey, 'kms'>,
  ): Promise<ManagedKeyInfo> {
    console.log('import',{args})
    // throw Error('Not implemented')
    return args as any as ManagedKeyInfo
  }

  async listKeys(): Promise<ManagedKeyInfo[]> {
    throw Error('Not implemented')
  }

  async sharedSecret(args: {
    myKeyRef: Pick<IKey, 'kid'>
    theirKey: Pick<IKey, 'type' | 'publicKeyHex'>
  }): Promise<string> {
    throw Error('Not implemented')
  }

  async deleteKey(args: { kid: string }) {
    // this kms doesn't need to delete keys
    return true
  }

  async sign({
    keyRef,
    algorithm,
    data,
  }: {
    keyRef: Pick<IKey, 'kid'>
    algorithm?: string
    data: Uint8Array
  }): Promise<string> {
    
    let key: IKey
    try {
      key = await this.keyStore.get({ kid: keyRef.kid })
    } catch (e) {
      throw new Error(`key_not_found: No key entry found for kid=${keyRef.kid}`)
    }

    if (algorithm) {
      if (
        ['eth_signTransaction', 'signTransaction', 'signTx'].includes(algorithm)
      ) {
        return await this.eth_signTransaction(key, data)
      } else if (algorithm === 'eth_signMessage') {
        return await this.eth_signMessage(key, data)
      } else if (
        ['eth_signTypedData', 'EthereumEip712Signature2021'].includes(algorithm)
      ) {
        return await this.eth_signTypedData(key, data)
      }
    }

    throw Error(`not_supported: Cannot sign ${algorithm} `)
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed EIP712 data
   */
  private async eth_signTypedData(key: IKey, data: Uint8Array) {
    let msg, msgDomain, msgTypes
    const serializedData = toUtf8String(data)
    try {
      const jsonData = JSON.parse(serializedData) as Eip712Payload
      if (
        typeof jsonData.domain === 'object' &&
        typeof jsonData.types === 'object'
      ) {
        const { domain, types, message } = jsonData
        msg = message
        msgDomain = domain
        msgTypes = types
      } else {
        // next check will throw since the data couldn't be parsed
      }
    } catch (e) {
      // next check will throw since the data couldn't be parsed
    }
    if (
      typeof msgDomain !== 'object' ||
      typeof msgTypes !== 'object' ||
      typeof msg !== 'object'
    ) {
      throw Error(
        `invalid_arguments: Cannot sign typed data. 'domain', 'types', and 'message' must be provided`,
      )
    }

    const signature = await this.providers[key.meta.provider]
      .getSigner()
      ._signTypedData(msgDomain, msgTypes, msg)
    return signature
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed message
   */
  private async eth_signMessage(key: IKey, rawMessageBytes: Uint8Array) {
    const signature = await this.providers[key.meta.provider]
      .getSigner()
      .signMessage(rawMessageBytes)
    // HEX encoded string, 0x prefixed
    return signature
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed raw transaction
   */
  private async eth_signTransaction(key: IKey, rlpTransaction: Uint8Array) {
    const { v, r, s, from, ...tx } = parse(rlpTransaction)
    console.log(tx)

    //FIXME
    // if (from) {
    //   debug('WARNING: executing a transaction signing request with a `from` field.')
    //   if (this.web3Provider.address.toLowerCase() !== from.toLowerCase()) {
    //     const msg =
    //       'invalid_arguments: eth_signTransaction `from` field does not match the chosen key. `from` field should be omitted.'
    //     debug(msg)
    //     throw new Error(msg)
    //   }
    // }

    const hexTx = Buffer.from(rlpTransaction).toString('hex')
    console.log('sending', hexTx)
    const result = await this.providers[key.meta.provider].sendTransaction('0x'+hexTx)
    // const result = await this.providers[key.meta.provider].getBalance('0x19711CD19e609FEBdBF607960220898268B7E24b')
    console.log({result})
    return 'aaa'

    // const signedRawTransaction = await this.providers[key.meta.provider]
    //   .getSigner()
    //   .signTransaction(tx as TransactionRequest)
    // // HEX encoded string, 0x prefixed
    // return signedRawTransaction
  }
}

import { useEffect, useState } from 'react'
import { VeramoProvider } from '@veramo-community/veramo-react'
import { IResolver, TAgent } from '@veramo/core'
import { createWeb3Agent } from './web3Agent'
import { hooks as metamaskHooks} from '../connectors/metaMask'
import { hooks as walletConnectHooks } from '../connectors/walletConnect'
import { hooks as coinbaseHooks } from '../connectors/coinbaseWallet'


export const VeramoWeb3Provider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {

  const [web3agent, setWeb3Agent] = useState<TAgent<IResolver>>()

  const metaMaskIsActive = metamaskHooks.useIsActive()
  const metaMaskChainId = metamaskHooks.useChainId()
  const metaMaskAccounts = metamaskHooks.useAccounts()
  const metaMaskProvider = metamaskHooks.useProvider()

  const walletConnectIsActive = walletConnectHooks.useIsActive()
  const walletConnectChainId  = walletConnectHooks.useChainId()
  const walletConnectAccounts = walletConnectHooks.useAccounts()
  const walletConnectProvider = walletConnectHooks.useProvider()

  const coinbaseIsActive = coinbaseHooks.useIsActive()
  const coinbaseChainId  = coinbaseHooks.useChainId()
  const coinbaseAccounts = coinbaseHooks.useAccounts()
  const coinbaseProvider = coinbaseHooks.useProvider()

  useEffect(() => {
      const connectors = []

      if (metaMaskIsActive) {
        connectors.push({
          chainId: metaMaskChainId,
          accounts: metaMaskAccounts,
          provider: metaMaskProvider,
          name: 'metaMask'
        })
      }

      if (walletConnectIsActive) {
        connectors.push({
          chainId:  walletConnectChainId,
          accounts: walletConnectAccounts,
          provider: walletConnectProvider,
          name: 'walletConnect'
        })
      }
      if (coinbaseIsActive) {
        connectors.push({
          chainId:  coinbaseChainId,
          accounts: coinbaseAccounts,
          provider: coinbaseProvider,
          name: 'coinbase'
        })
      }

      if (connectors.length > 0) {

        void createWeb3Agent({ connectors })
        .then(setWeb3Agent)
      }

      return () => {
        setWeb3Agent(undefined)
      }

  }, [metaMaskIsActive, metaMaskChainId, metaMaskAccounts, metaMaskProvider,
    walletConnectIsActive, walletConnectChainId, walletConnectAccounts, walletConnectProvider,
    coinbaseIsActive, coinbaseChainId, coinbaseAccounts, coinbaseProvider]) 
  
  const plugins = [ ]

  return (<VeramoProvider agents={web3agent && [web3agent]} plugins={plugins}>
    {children}
  </VeramoProvider>)
}
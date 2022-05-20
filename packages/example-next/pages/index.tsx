import CoinbaseWalletCard from '../components/connectorCards/CoinbaseWalletCard'
import GnosisSafeCard from '../components/connectorCards/GnosisSafeCard'
import MetaMaskCard from '../components/connectorCards/MetaMaskCard'
import NetworkCard from '../components/connectorCards/NetworkCard'
import WalletConnectCard from '../components/connectorCards/WalletConnectCard'
import Identifiers from '../components/Identifiers'
import ProviderExample from '../components/ProviderExample'
import { VeramoWeb3Provider } from '../veramo/VeramoWeb3Provider'
import { QueryClientProvider, QueryClient } from 'react-query'

export default function Home() {
  const queryClient = new QueryClient()
  return (
    <>
      <ProviderExample />
      <div style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif' }}>
        <MetaMaskCard />
        <WalletConnectCard />
        <CoinbaseWalletCard />
        <NetworkCard />
        <GnosisSafeCard />
        <QueryClientProvider client={queryClient}>
          <VeramoWeb3Provider>
            <Identifiers />
          </VeramoWeb3Provider>
        </QueryClientProvider>
      </div>
    </>
  )
}

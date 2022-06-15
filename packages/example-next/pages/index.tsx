import CoinbaseWalletCard from '../components/connectorCards/CoinbaseWalletCard'
import GnosisSafeCard from '../components/connectorCards/GnosisSafeCard'
import MetaMaskCard from '../components/connectorCards/MetaMaskCard'
import NetworkCard from '../components/connectorCards/NetworkCard'
import WalletConnectCard from '../components/connectorCards/WalletConnectCard'
import VeramoCard from '../components/VeramoCard'
import ProviderExample from '../components/ProviderExample'
import { VeramoWeb3Provider } from '../veramo/VeramoWeb3Provider'

export default function Home() {

  return (
    <>
      <ProviderExample />
      <div style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif' }}>
        <MetaMaskCard />
        <WalletConnectCard />
        <CoinbaseWalletCard />
        <NetworkCard />
        <GnosisSafeCard />
        <VeramoWeb3Provider>
          <VeramoCard />
        </VeramoWeb3Provider>
      </div>
    </>
  )
}

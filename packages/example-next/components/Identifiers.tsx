import { useVeramo } from "@veramo-community/veramo-react"
import { IDIDManager, IKeyManager } from "@veramo/core"
import { useQuery } from 'react-query'

export default function Identifiers() {
  const { agent } = useVeramo<IDIDManager>()
  const { data: identifiers } = useQuery(['identifiers'], () =>
  agent?.didManagerFind(),
)
  return <div>
    <h3>Identifiers</h3>
    {identifiers?.map(identifier => <Identifier key={identifier.did} did={identifier.did}/>)}
  </div>
}

function Identifier({did}:{did: string}) {
  const { agent } = useVeramo<IDIDManager & IKeyManager>()
  const handleSign = async () => {
    const identifier = await agent.didManagerGet({ did })
    const result = await agent.keyManagerSign({
      keyRef: identifier.controllerKeyId,
      algorithm: 'eth_signMessage',
      data: 'Hello'
    })
    console.log({result})
  }

  // const handleAddService = async () => {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //   const result = await agent.didManagerAddService({
  //     did,
  //     service: {
  //       id: '123',
  //       type: 'example',
  //       serviceEndpoint: 'https://example.com'
  //     }
  //   })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //   console.log({result})
  // }

  return <div>
    {did} 
    <button onClick={() => {void handleSign()}}>Sign</button>
    {/* <button onClick={() => {void handleAddService()}}>Add service</button> */}
  </div>
}
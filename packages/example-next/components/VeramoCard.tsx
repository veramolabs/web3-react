import { useEffect, useState } from "react"
import { useVeramo } from "@veramo-community/veramo-react"
import { IDIDManager, IIdentifier, IKeyManager, VerifiableCredential } from "@veramo/core"
import { ICredentialIssuer } from "@veramo/credential-w3c"
import { Card } from "./Card"

export default function VeramoCard() {
  const { agent } = useVeramo<IDIDManager & IKeyManager & ICredentialIssuer>()
  const [identifiers, setIdentifiers] = useState<IIdentifier[]>([])
  const [selectedDid, setSelectedDid] = useState<string|null>(null)
  const [vc, setVc] = useState<VerifiableCredential|null>(null)
  
  useEffect(()=> {
    agent?.didManagerFind()
    .then(setIdentifiers)
    .catch(console.log)
  }, [ agent ])

  const handleAddService = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await agent.didManagerAddService({
      did: selectedDid,
      service: {
        id: '123',
        type: 'example',
        serviceEndpoint: 'https://example.com'
      }
    })
    //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    console.log({result})
  }

  const handleSignCredential = async () => {
    const verifiableCredential = await agent.createVerifiableCredential({
      credential: {
        issuer: { id: selectedDid },
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
        type: ['VerifiableCredential', 'Custom'],
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: 'did:web:example.com',
          you: 'Rock',
        }
      },
      proofFormat: 'EthereumEip712Signature2021',
    })
    //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    console.log({verifiableCredential})
    setVc(vc)
  }

  return <div>
    <b>Veramo</b>
    <div>
      <select multiple onChange={(e)=>setSelectedDid(e.target.value)}>
        {identifiers?.map(identifier => <option key={identifier.did} value={identifier.did}>{identifier.did}</option>)}
      </select>
    </div>
    <div>
      <button disabled={!selectedDid} onClick={() => {void handleAddService()}}>Add service</button>
      <button disabled={!selectedDid} onClick={() => {void handleSignCredential()}}>Sign credential</button>
    </div>
    <div>
      {vc && <pre>{JSON.stringify(vc, null, 2)}</pre>}
    </div>
  </div>
}
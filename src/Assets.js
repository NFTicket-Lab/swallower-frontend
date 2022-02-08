import React, { useEffect, useState } from 'react';
import { Form, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';


const convertToSwallowerHash = entry =>
  `0x${entry[0].toJSON().slice(-64)}`;

const constructKitty = (hash, { name, initGene, gene, owner }) => ({
  id: hash,
  dna: gene,
  initGene: initGene.toJSON(),
  name,
  owner: owner.toJSON()
});

const ASSET_ID = 1;

export default function Accounts(props) {
  const { api, keyring } = useSubstrate();
  const { accountPair } = props;

  const [assetBalances, setSwallowers] = useState([]);

  const subscribeAccountBalance1 = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.swallower.swallowers.multi(swallowerHashes, swallowers => {
        const swallowerArr = swallowers
          .map((swallower, ind) => constructKitty(swallowerHashes[ind], swallower.value));
        setSwallowers(swallowerArr);
      });
    };
    asyncFetch();
    // return the unsubscription cleanup function
    return () => {
      unsub && unsub();
    };
  };

  const subscribeAccountBalance = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.assets.account([ASSET_ID,keyring.address],accountBalance => {
        
      });
    }
  };

  useEffect(subscribeSwallowers, [api, swallowerHashes]);
  useEffect(subscribeSwallowerCnt, [api, keyring]);

  return <Grid.Column width={16}>
    <h1>Swallowers</h1>
    <SwallowerCards swallowers={swallowers} accountPair={accountPair} setStatus={setStatus} />
    <Form style={{ margin: '1em 0' }}>
      <Form.Input placeholder="please input swallower name" onChange={formChange('target')} />
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='Create Swallower' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'swallower',
            callable: 'mintSwallower',
            inputParams: [formValue.target],
            paramFields: [true]
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>;
}

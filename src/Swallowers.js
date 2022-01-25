import React, { useEffect, useState } from 'react';
import { Form, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

import KittyCards from './KittyCards';

const convertToSwallowerHash = entry =>
  `0x${entry[0].toJSON().slice(-64)}`;

const constructKitty = (hash, { name, initGene, gene, owner }) => ({
  id: hash,
  dna: gene,
  initGene: initGene.toJSON(),
  name,
  owner: owner.toJSON()
});

export default function Kitties (props) {
  const { api, keyring } = useSubstrate();
  const { accountPair } = props;

  const [swallowerHashes, setSwallowerHashes] = useState([]);
  const [swallowers, setSwallowers] = useState([]);
  const [status, setStatus] = useState('');

  const subscribeSwallowerCnt = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.swallower.swallowerNo(async cnt => {
        // Fetch all kitty keys
        const entries = await api.query.swallower.swallowers.entries();
        const hashes = entries.map(convertToSwallowerHash);
        setSwallowerHashes(hashes);
      });
    };

    asyncFetch();

    return () => {
      unsub && unsub();
    };
  };

  const subscribeSwallowers = () => {
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

  useEffect(subscribeSwallowers, [api, swallowerHashes]);
  useEffect(subscribeSwallowerCnt, [api, keyring]);

  return <Grid.Column width={16}>
  <h1>Swallowers</h1>
  <KittyCards kitties={swallowers} accountPair={accountPair} setStatus={setStatus}/>
  <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='Create Swallower' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'swallower',
            callable: 'mintSwallower',
            inputParams: ['abc54341'],
            paramFields: ['name']
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>;
}

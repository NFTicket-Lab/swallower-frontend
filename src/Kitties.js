import React, { useEffect, useState } from 'react';
import { Form, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

import KittyCards from './KittyCards';

const convertToSwallowerHash = entry =>
  `0x${entry[0].toJSON().slice(-64)}`;

const constructKitty = (hash, { dna, price, gender, owner }) => ({
  id: hash,
  dna,
  price: price.toJSON(),
  gender: gender.toJSON(),
  owner: owner.toJSON()
});

export default function Kitties (props) {
  const { api, keyring } = useSubstrate();
  const { accountPair } = props;

  const [swallowerHashes, setSwallowerHashes] = useState([]);
  const [kitties, setKitties] = useState([]);
  const [status, setStatus] = useState('');

  const subscribeSwallowerCnt = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.palletSwallower.swallowerNo(async cnt => {
        // Fetch all kitty keys
        const entries = await api.query.palletSwallower.swallowers.entries();
        const hashes = entries.map(convertToSwallowerHash);
        setSwallowerHashes(hashes);
      });
    };

    asyncFetch();

    return () => {
      unsub && unsub();
    };
  };

  const subscribeKitties = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.substrateKitties.kitties.multi(swallowerHashes, kitties => {
        const kittyArr = kitties
          .map((kitty, ind) => constructKitty(swallowerHashes[ind], kitty.value));
        setKitties(kittyArr);
      });
    };

    asyncFetch();

    // return the unsubscription cleanup function
    return () => {
      unsub && unsub();
    };
  };

  useEffect(subscribeKitties, [api, swallowerHashes]);
  useEffect(subscribeSwallowerCnt, [api, keyring]);

  return <Grid.Column width={16}>
  <h1>Kitties</h1>
  <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
  <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='Create Kitty' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'substrateKitties',
            callable: 'createKitty',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>;
}

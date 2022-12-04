import React, { useState, useEffect } from "react";
import { BeaconWallet } from "@taquito/beacon-wallet";
import {
  NetworkType,
  BeaconEvent,
  defaultEventCallbacks
} from "@airgap/beacon-dapp";

const ConnectButton = ({
  Tezos,
  setContract,
  setWallet,
  setUserAddress,
  setUserBalance,
  contractAddress,
  setBeaconConnection,
  setPublicToken,
  wallet,
  fetchAssets,
}) => {
  const setup = async (userAddress) => {
    setUserAddress(userAddress);
    const balance = await Tezos.tz.getBalance(userAddress);
    setUserBalance(balance.toNumber());

    const contract = await Tezos.wallet.at(contractAddress);
    const storage = await contract.storage();
    setContract(contract);
    await fetchAssets(storage);

  };

  const connectWallet = async () => {
    try {
      await wallet.requestPermissions({
        network: {
          type: NetworkType.GHOSTNET,
          rpcUrl: "https://ghostnet.ecadinfra.com"
        }
      });
      // gets user's address
      const userAddress = await wallet.getPKH();
      await setup(userAddress);
      setBeaconConnection(true);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    (async () => {
      // creates a wallet instance
      const wallet = new BeaconWallet({
        name: "Genx - Genetics Assets Laboratory",
        preferredNetwork: NetworkType.GHOSTNET,
        disableDefaultEvents: true, // Disable all events / UI. This also disables the pairing alert.
        eventHandlers: {
          // To keep the pairing alert, we have to add the following default event handlers back
          [BeaconEvent.PAIR_INIT]: {
            handler: defaultEventCallbacks.PAIR_INIT
          },
          [BeaconEvent.PAIR_SUCCESS]: {
            handler: data => setPublicToken(data.publicKey)
          }
        }
      });
      Tezos.setWalletProvider(wallet);
      setWallet(wallet);
      // checks if wallet was connected before
      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        const userAddress = await wallet.getPKH();
        await setup(userAddress);
        setBeaconConnection(true);
      }
    })();
  }, []);

  return (
    <div className="buttons">
      <button className="button" onClick={connectWallet}>
        <span>
          <i className="fas fa-wallet"></i>&nbsp; Connect with wallet
        </span>
      </button>
    </div>
  );
};

export default ConnectButton;

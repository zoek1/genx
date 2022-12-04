import React, { useState } from "react";
import {MichelsonMap, TezosToolkit} from "@taquito/taquito";
import "./App.css";
import ConnectButton from "./components/ConnectWallet";
import DisconnectButton from "./components/DisconnectWallet";
import qrcode from "qrcode-generator";
import UpdateContract from "./components/UpdateContract";
import Transfers from "./components/Transfers";
import genx from "genx"
import Assets, {Asset} from "./components/Assets";
import Generations from "./components/Generations";
import TokenEditor from "./components/TokenEditor";

enum BeaconConnection {
  NONE = "",
  LISTENING = "Listening to P2P channel",
  CONNECTED = "Channel connected",
  PERMISSION_REQUEST_SENT = "Permission request sent, waiting for response",
  PERMISSION_REQUEST_SUCCESS = "Wallet is connected"
}

const App = () => {
  const [Tezos, setTezos] = useState<TezosToolkit>(
    new TezosToolkit("https://ghostnet.ecadinfra.com")
  );
  const [contract, setContract] = useState<any>(undefined);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [userBalance, setUserBalance] = useState<number>(0);
  const [storage, setStorage] = useState<any>(null);
  const [copiedPublicToken, setCopiedPublicToken] = useState<boolean>(false);
  const [beaconConnection, setBeaconConnection] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("transfer");
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(-1)
  const [generations, setGenerations] = useState([])
  const [editor, setEditor] = useState("")

  const fetchGenerations = async (token_id: any) => {
    const storage = await contract.storage();
    setSelectedAsset(token_id)
    const generations = await genx.genx.get_generation(storage.genx, token_id)
    setGenerations(generations);
  }

  const fetchAssets = async (storage: any) => {
    const assets = await genx.genx.getAssets(storage || await contract.storage());
    setAssets(assets);
  }

  const contractAddress: string = "KT1P2xiVEosLWqyUMyvjaRzK4NMbbwDEpX25";

  if (userAddress && !isNaN(userBalance)) {
    return (
      <div>
        <DisconnectButton
            wallet={wallet}
            setPublicToken={setPublicToken}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setWallet={setWallet}
            setTezos={setTezos}
            setBeaconConnection={setBeaconConnection}
          />

        <div style={{display: 'flex'}}>

            <Assets contract={contract} assets={assets} fetchGenerations={fetchGenerations} />
            <Generations selectedAsset={selectedAsset} fetchGenerations={fetchGenerations} contract={contract} generations={generations} />
            <TokenEditor contract={contract} onUpdate={fetchAssets} />
        </div>
      </div>
    );
  } else if (!publicToken && !userAddress && !userBalance) {
    return (
      <div className="main-box">
        <div className="title">
          <h1>Taquito React template</h1>
          <a href="https://app.netlify.com/start/deploy?repository=https://github.com/ecadlabs/taquito-react-template">
            <img
              src="https://www.netlify.com/img/deploy/button.svg"
              alt="netlify-button"
            />
          </a>
        </div>
        <div id="dialog">
          <header>Welcome to the Taquito React template!</header>
          <div id="content">
            <p>Hello!</p>
            <p>
              This is a template Tezos dApp built using Taquito. It's a starting
              point for you to hack on and build your own dApp for Tezos.
              <br />
              If you have not done so already, go to the{" "}
              <a
                href="https://github.com/ecadlabs/taquito-react-template"
                target="_blank"
                rel="noopener noreferrer"
              >
                Taquito React template Github page
              </a>{" "}
              and click the <em>"Use this template"</em> button.
            </p>
            <p>Go forth and Tezos!</p>
          </div>
          <ConnectButton
            Tezos={Tezos}
            setContract={setContract}
            setPublicToken={setPublicToken}
            setWallet={setWallet}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setStorage={setStorage}
            setAssets={setAssets}
            contractAddress={contractAddress}
            setBeaconConnection={setBeaconConnection}
            wallet={wallet}
            fetchAssets={fetchAssets}
          />
        </div>
        <div id="footer">
          <img src="built-with-taquito.png" alt="Built with Taquito" />
        </div>
      </div>
    );
  } else {
    return <div>An error has occurred</div>;
  }
};

export default App;

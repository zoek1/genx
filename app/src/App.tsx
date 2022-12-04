import React, { useState } from "react";
import {TezosToolkit} from "@taquito/taquito";
import "./App.css";
import ConnectButton from "./components/ConnectWallet";
import DisconnectButton from "./components/DisconnectWallet";
import genx from "genx"
import Assets, {Asset} from "./components/Assets";
import Generations from "./components/Generations";
import TokenEditor from "./components/TokenEditor";
import EditorGeneration from "./components/EditorGeneration";
import {Container, Navbar} from "react-bootstrap";


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
  const [beaconConnection, setBeaconConnection] = useState<boolean>(false);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(-1)
  const [generations, setGenerations] = useState([])
  const [editor, setEditor] = useState("")
  const [generation, setGeneration] = useState({});

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

  const navbar = <Navbar bg="dark" variant="dark" style={{height: "120px", marginBottom: '80px'}}>
        <Container>
          <Navbar.Brand href="#home">
            <img
              alt=""
              src="/logo-128.png"
              width="40"
              height="40"
              className="d-inline-block align-top"
            />{' '}
            Genx - Genetics NFT Laboratory
          </Navbar.Brand>
          { userAddress ?
           <DisconnectButton
            wallet={wallet}
            setPublicToken={setPublicToken}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setWallet={setWallet}
            setTezos={setTezos}
            setBeaconConnection={setBeaconConnection}
          /> : <></> }
        </Container>
      </Navbar>;

  if (userAddress && !isNaN(userBalance)) {
    return (<div>
      {navbar}
      <div style={{marginTop: '45px'}}>
      <div style={{display: 'flex', justifyContent: "space-around", marginBottom: '45px'}}>
            <Assets contract={contract} assets={assets} fetchGenerations={fetchGenerations} openEditor={() => setEditor('token')} />
            <Generations selectedAsset={selectedAsset} fetchGenerations={fetchGenerations} contract={contract} generations={generations}
                         onSelect={(gen: any) => {
                           setGeneration(gen);
                           setEditor('evolve');
                         }} />
          { editor === 'evolve'
              ? <EditorGeneration contract={contract} genes={generation} selectedAsset={selectedAsset} onSave={async () => {
                return fetchGenerations(selectedAsset);
              }
              }/>
              : <TokenEditor contract={contract} onUpdate={fetchAssets} />
          }
        </div>
      </div>
      </div>
    );
  } else if (!publicToken && !userAddress && !userBalance) {
    return (<div>
          {navbar}
          <div style={{ display: 'grid'}}>
            <div className="main-box">
    <div id="dialog">
      <header>Welcome to Genx Editor!</header>
      <div id="content">
        <p>Hello!</p>
        <p>
          The Genx team has develop this dApp to allow you manage
          the genes of your game assets or NFTs.
          <br />
          Power your assets and give the ability to your users to
          connect the assets as Characters in any game they want.
        </p>
        <p>Sign in and start the next game generation!</p>
      </div>
      <ConnectButton
        Tezos={Tezos}
        setContract={setContract}
        setPublicToken={setPublicToken}
        setWallet={setWallet}
        setUserAddress={setUserAddress}
        setUserBalance={setUserBalance}
        contractAddress={contractAddress}
        setBeaconConnection={setBeaconConnection}
        wallet={wallet}
        fetchAssets={fetchAssets}
      />
    </div>
  </div>
          </div>
        </div>
    );
  } else {
    return <div>An error has occurred</div>;
  }
};

export default App;

import {MichelsonMap, TezosToolkit} from "@taquito/taquito";
import {decode, encode} from "./encoding";
import {BeaconEvent, defaultEventCallbacks, NetworkType} from "@airgap/beacon-dapp";
import {useEffect} from "react";
import {BeaconWallet} from "@taquito/beacon-wallet";
const semver = require('semver')

export const STRING = "string";
export const NUMBER = "number";
export const BOOL = "bool";

export const contractAddress = 'KT1P2xiVEosLWqyUMyvjaRzK4NMbbwDEpX25'

const toObject = v => [...v.keys()].reduce((acc, key) => {
        acc[key] = decode(v.get(key));
        return acc;
    } , {})

export const get_generations = async (genx, id) => {
    const generations = await genx.get(id);
    return [...generations.keys()].map(key => `${key[0]}.${key[1]}.${key[2]}` )
}

export const get_generation = async (genx, id) => {
    const generations = await genx.get(id);
    return [...generations.keys()].reduce( (acc, key) => {
        const v = generations.get(key);
        acc[`${key[0]}.${key[1]}.${key[2]}`] = [...v.keys()].reduce((acc, key) => {
            acc[key] = v.get(key);
            acc[key].value = decode(acc[key].value);

            return acc
        } , {})
        return acc;
    }, {} )
}

export const getLastTokenId = storage => storage.counter.toNumber()

export const lastVersion = async (genx, token_id) => {
   const generations = await get_generations(genx, token_id);
   const ordered = generations.sort(semver.rcompare)

   if (ordered.length) return ordered[0]

   return null;
}

export const getAssets = async (storage) => {
    const ids = Array(getLastTokenId(storage)).keys();
    const assets = await storage.token_metadata.getMultipleValues([...ids]);
    return [...assets.values()].map(x => ({
        token_id: x.token_id.toNumber(),
        token_info: toObject(x.token_info)
    }))
}

export const getLastSupportedVersion = async (genx, token_id, predicate) => {
   const generations = await get_generations(genx, token_id);
   return semver.maxSatisfying(generations, predicate)
}

export const version = str => str.split(".").map(e => parseInt(e))


export const gene = (type, value) => ({ type_: type, value: encode(value)})

export const reduceGenes = async (genx, token_id, predicate="last") => {
    const generations = await get_generation(genx, token_id);

    if (predicate !== "last") {
        const versions = await get_generations(genx, token_id);

        return versions.map(version => generations.get(version)).reduce((c, obj) => ({...c, ...obj}), {})
    }

    return Object.values(generations).reduce((c, obj) => ({...c, ...obj}), {});
}

export const fusion = async (genx, token_x, gen_x, token_y, gen_y) => {
    const x = await get_generation(genx, token_x)[gen_x];
    const y = await get_generation(genx, token_y)[gen_y];

    return {...x, ...y}
}

/*
export const bread = async (genx, token_x, gen_x, token_y, gen_y) => {
    const x = await get_generation(genx, token_x)[gen_x];
    const y = await get_generation(genx, token_y)[gen_y];

    return {...x, ...y}
}
*/

export const create_token = async (contract, token_id, props) => {
    // temp2.methods.create_token(0,  temp1.fromLiteral({name: "70697261746531"}), 0).send()
    const encoded_properties = Object.entries(props).reduce((acc, [key, value]) => {
        acc[key] = encode(value.toString());
        return acc;
    }, {})
    const token_info = MichelsonMap.fromLiteral({
        token_id: encode(token_id.toString()),
        ...encoded_properties
    });
    const op = await contract.methods.create_token(token_id, token_info, token_id).send()
    await op.confirmation(1)
    return op
}

export const add_gen = async (contract, token_id, genes, major, minor=0, patch=0) => {
    // temp2.methods.add_gen(temp1.fromLiteral({attack: { type_: "number", value: "3132"}}), 0, 1, 0, 0).send()
    const genx = MichelsonMap.fromLiteral(genes);
    const op = await contract.methods.add_gen(genx, major, minor, patch, token_id).send()
    await op.confirmation(1)
    return op
}

export const nerf = async (contract,
                           token_id,
                           gene_name, gene_type, gene_value,
                           major, minor=0, patch=0) => {
    // temp2.methods.nerf(0, 1, 0, "defense", 0, "number", "3132").send()

    const op = await contract.methods.nerf(major, minor, patch, gene_name, token_id, gene_type, encode(gene_value)).send()
    await op.confirmation(1)
    return op
}

export const mutate = async (contract, token_id, genes, major, minor=0, patch=0) => {
    // temp2.methods.mutate(temp1.fromLiteral({attack: { type_: "number", value: "3233"}}), 0,1,1, 0).send()

    const genx = MichelsonMap.fromLiteral(genes);
    const op = await contract.methods.mutate(genx, major, minor, patch, token_id).send()
    await op.confirmation(1)
    return op
}

export const evolve = async (contract, token_id, genes) => {
    // temp2.methods.evolve(temp1.fromLiteral({type: { type_: "string", value: "77697a617264"}}), 0,2,0, 0).send()
    const storage = await contract.storage();
    const [major, minor, patch] = version(await lastVersion(storage.genx, token_id));
    const genx = MichelsonMap.fromLiteral(genes);
    const op = await contract.methods.evolve(genx, major, minor, patch, token_id).send()
    await op.confirmation(1)
    return op
}


const setup = async (Tezos, userAddress, contractAddress=contractAddress) => {
    const balance = await Tezos.tz.getBalance(userAddress);
    const contract = await Tezos.wallet.at(contractAddress);

    return {
        address: userAddress,
        balance,
        contract,
    }
  };

export const connectWallet = async (wallet) => {
    try {
      await wallet.requestPermissions({
        network: {
          type: NetworkType.GHOSTNET,
          rpcUrl: "https://ghostnet.ecadinfra.com"
        }
      });

      return await wallet.getPKH();
    } catch (error) {
      console.log(error);
    }
    return null;
};

export const getWallet = async (Tezos, name, setPublicToken=() => {}) => {
    const wallet = new BeaconWallet({
        name: name,
        preferredNetwork: NetworkType.GHOSTNET,
        disableDefaultEvents: true,
        eventHandlers: {
          [BeaconEvent.PAIR_INIT]: {
            handler: defaultEventCallbacks.PAIR_INIT
          },
          [BeaconEvent.PAIR_SUCCESS]: {
            handler: data => setPublicToken(data.publicKey)
          }
        }
    });

    Tezos.setWalletProvider(wallet);

    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount) {
        const userAddress = await wallet.getPKH();
        await setup(userAddress);
        return [true, wallet, userAddress]
    }
    return [false, wallet, null];
}

export const getTezos = (url="https://ghostnet.ecadinfra.com") => new TezosToolkit(url)
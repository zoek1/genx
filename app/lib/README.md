# GenX

Empower your users adding genes to NFTS. Your users can mutate and evolve the assets in multiple games, 
don't tie the characters to only one game. Don't reinvent the wheel. 


## Setup

```js
import genx from 'genx';

const Tezos = genx.genx.getTezos();

const [alreadyConnected, wallet, userAddress] = await genx.genx.getWallet(this.Tezos, "Pirate Genx Game");
const pk = !alreadyConnected
           ? await genx.genx.connectWallet(wallet)
           : userAddress;

const contract = await this.Tezos.wallet.at(contractAddress);
const storage = await this.contract.storage();

```

## Functions

- `getLastTokenId(storage)`: Get the next token Id
- `get_generations(storage.genx, token_id)`: Get all generations keys
- `get_generation(storage.genx, token_id)`: Get all generations as array of objects
- `getAssets(storage)`: Retrieve all NFT Tokens and its metadata
- `reduceGenes(storage.genx, tokenId)`: Combine all genes of the token
- `version(str)`: Convert string to numeric version ("2.1.0" => [2,1,0])
- `fusion(genx, token_x, gen_x, token_y, gen_y)`: Fusion two genes versions
- `create_token(contract, token_id, props)`: Create a NFT Token
- `add_gen(contract, token_id, genes, major, minor=0, patch=0)`: Add or update if exists the generation
- `nerf(contract, token_id, gene_name, gene_type, gene_value, major, minor=0, patch=0)`: Add or update specified gene
- `mutate(contract, token_id, genes, major, minor=0, patch=0)`: Update specific version with the provided genes
- `evolve(contract, token_id, genes)`: Create a new version based on the provided genes

## Licese

See [LICENSE](LICENSE)

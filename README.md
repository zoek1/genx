# GenX

Empower your users adding genes to NFTS. 
Your users can mutate and evolve the assets in 
multiple games, don't tie the characters to only 
one game. Don't reinvent the wheel. Include
characters from other games that share the same stats,
Even you can evolve the character to include the required
genes by the game.

## Motivation

As a player, I wondered with games like Smash Bross where
many characters of different games joined in one sharing
the same mechanics.

Another motivator is Pokemon Home where you can share 
Pokemons among different Pokemon games, it impose certain
restrictions based on game generations, but with genx this is up to
Game designers.

To allow the game designers impose restrictions or 
get specific versions, the genx use the semver
to get the specified versions or merge all genes into one
(One for all).


## Structure
The Genx project provide the following components:
1. genx contract, every assets is also an FA2 token.
2. JS library to communicate with the contract.
3. Genx Editor, users can create NFT, Add genes, Mutate and Evolve visually.
4. Demo Phaser Game, to demonstrate how to retrieve the last token and use their genes.

## Installation

Install the JS library

```
yarn add @zoek1/genx
```

Setup demo game

```
cd client
yarn
```

Setup Genx Editor
```
cd app
yarn
```

## Usage
Open two terminals

```
cd app
yarn start
```

## Demo
### Genx Editor
![](screenshots/login.png)
![](screenshots/editor.png)
## Backlog

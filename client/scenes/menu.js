import Phaser from "phaser";
import genx from "@zoek/genx";
import {gene, reduceGenes} from "@zoek/genx/genx";
import * as assert from "assert";

export class Menu extends Phaser.Scene{

    constructor() 
    {
        super({ key: 'menu' });
        this.character='pirategreen';
        this.index=1;
        let characterlist=[];
    }

    async tzLoad() {
        const contractAddress = "KT1P2xiVEosLWqyUMyvjaRzK4NMbbwDEpX25";
        if (this.disabled) return;
        this.disabled = true;

        this.Tezos = genx.genx.getTezos();

        const [alreadyConnected, wallet, userAddress] = await genx.genx.getWallet(this.Tezos, "Pirate Genx Game");

        this.wallet = wallet;
        if (!alreadyConnected) {
            this.pk = await genx.genx.connectWallet(wallet);
        } else {
            this.pk = userAddress;
        }

        this.contract = await this.Tezos.wallet.at(contractAddress);
        this.storage = await this.contract.storage();
        this.tokenId = genx.genx.getLastTokenId(this.storage) - 1;
        this.assets = await genx.genx.get_generations(this.storage.genx, this.tokenId);
        this.genes = await genx.genx.reduceGenes(this.storage.genx, this.tokenId)
        console.log(this.assets)
        console.log(this.genes)
    }

    preload(){
        this.load.image('pixar', require('../assets/background/square.jpg'));
        this.load.image('title',require('../assets/background/title.png'));
        this.load.image('door',require('../assets/background/puerta.jpg'));
        this.load.image('pirategreen',require('../assets/gun/pirategreengun.png'));
        this.load.image('canonpurple',require('../assets/canon/canonpiratepurple.png'));
        this.load.image('piratered',require('../assets/gun/pirateredgun.png'));
        this.load.image('pirateyellow',require('../assets/gun/pirateyellowgun.png'));
        this.load.image('arrow',require('../assets/background/arrow.png'));
        this.load.image('textstart',require('../assets/background/texttostart.png'));
    }
    
    create (){

        this.add.image(760,342.5,'pixar');
        this.add.image(700,130,'title').setScale(1.8);
        this.add.image(700,420,'door').setScale(0.5,0.4);
        this.arrow1=this.add.image(460,430,'arrow').setScale(.3,0.5);
        this.arrow2=this.add.image(940,430,'arrow').setScale(.3,0.5);
        this.arrow2.flipX=true;

        this.pirategreen=this.add.image(716,410,'pirategreen').setScale(.3).setInteractive();
        this.pirateyellow=this.add.image(716,410,'pirateyellow').setScale(.3).setInteractive();
        this.canonpurple=this.add.image(716,390,'canonpurple').setScale(.3).setInteractive();
        this.piratered=this.add.image(716,410,'piratered').setScale(.3).setInteractive()

        this.pirategreen.visible=false;
        this.pirateyellow.visible=false;
        this.canonpurple.visible=false;
        this.piratered.visible=false;

        this.characterlist=[this.pirategreen,this.canonpurple,this.pirateyellow,this.piratered];
        
        this.select=this.add.text(630, 410, 'Press A or D', { fontFamily: 'Bullpen3D',fontSize: '25px', fill: '#00FF00'});
        this.add.image(700, 600, 'textstart').setScale(.75);

        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // this.keya = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        // this.keyd = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.d=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.a=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        
        
    }
    update(){

        if(Phaser.Input.Keyboard.JustDown(this.a)){
            this.select.visible=false;
            this.growarrow1();
            this.minus();
            this.characterlist[this.index].visible=true;
            this.characterlist[this.index+1].visible=false;
            this.character=this.characterlist[this.index].texture.key.toString();
            console.log(this.character.toString());
        }
        if(Phaser.Input.Keyboard.JustDown(this.d)){
            this.select.visible=false;
            this.growarrow2();
            this.plus();
            this.characterlist[this.index].visible=true;
            this.characterlist[this.index-1].visible=false;
            this.character=this.characterlist[this.index].texture.key.toString();
            console.log(this.character.toString());
        }

        if(this.space.isDown && !this.disabled){
            this.tzLoad().then(() => {
                if (this.pk) {
                    this.input.keyboard.shutdown();
                    this.scene.stop();
                    this.scene.start('game',{
                        character:this.character,
                        Tezos: this.Tezos,
                        address: this.pk,
                        contract: this.contract,
                        genes: this.genes
                    });
                    console.log('space');
                }
            })
        }
    }
    growarrow1(){
        this.arrow1.setScale(.3,0.6);
        setTimeout(()=>{
            this.arrow1.setScale(.3,0.5);
        },350);
    }
    growarrow2(){
        this.arrow2.setScale(.3,0.6);
        setTimeout(()=>{
            this.arrow2.setScale(.3,0.5);
        },350);
    }
    minus(){
        if(this.index>0){
            this.index=this.index-1;
        }
        else{this.index=0;}
        
    }
    plus(){
        if(this.index==this.characterlist.length-1){
            this.index=this.characterlist.length-1;
        }else{
            this.index=this.index+1;
        }
    }

}
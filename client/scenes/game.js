var shoot=1;
var timeshoot=0;

import personajes from '../scenes/piratas.js'
import genx from '@zoek/genx';

export class Game extends Phaser.Scene{

    constructor() 
    {
        super({ key: 'game' });
    }

    init(data){
        // console.log(personajes);
        this.data=data.character;
        this.genes = data.genes;
    }

    preload(){
        this.stats = {
            width: parseInt(this.genes?.width.value || 130),
            height: parseInt(this.genes?.height.value || 180),
            velocityX: parseInt(this.genes?.velocityX.value || 150),
            velocityY: parseInt(this.genes?.velocityY.value || 400),
            power: parseInt(this.genes?.power.value || 300),
            speed: parseFloat(this.genes?.speed.value || 0.001)
        }
        console.log(this.stats)
        this.load.spritesheet('canonpurplebreathingmodified',require('../assets/canon/purple/canonpurplebreathingmodified.png'),{frameWidth: 491, frameHeight: 400});
        this.load.spritesheet('canonpurplehurtmodified',require('../assets/canon/purple/canonpurplehurtmodified.png'),{frameWidth: 491, frameHeight: 400});
        this.load.spritesheet('canonpurplerunningmodified',require('../assets/canon/purple/canonpurplerunningmodified.png'),{frameWidth: 491, frameHeight: 400});
        this.load.spritesheet('canonpurpledeadmodified',require('../assets/canon/purple/canonpurpledeadmodified.png'),{frameWidth:491, frameHeight:400});
        this.load.spritesheet('canonpurpleshotmodified',require('../assets/canon/purple/canonpurpleshotmodified.png'),{frameWidth: 491, frameHeight: 400});
        this.load.spritesheet('canonpurplejumpingmodified',require('../assets/canon/purple/canonpurplejumpingmodified.png'),{frameWidth: 491, frameHeight: 400})
        //-------------------------------------------------------------------------------------------------------------------------------------------
        this.load.spritesheet('pirategreenbreathingmodified',require('../assets/gun/green/pirategreenbreathingmodified.png'),{frameWidth: 469, frameHeight: 420});
        this.load.spritesheet('pirategreenhurtmodified',require('../assets/gun/green/pirategreenhurtmodified.png'),{frameWidth:469, frameHeight:420});
        this.load.spritesheet('pirategreenrunningmodified',require('../assets/gun/green/pirategreenrunningmodified.png'),{frameWidth: 469, frameHeight: 420});
        this.load.spritesheet('pirategreendeadmodified',require('../assets/gun/green/pirategreendeadmodified.png'),{frameWidth: 469, frameHeight: 420});
        this.load.spritesheet('pirategreenshotmodified',require('../assets/gun/green/pirategreenshotmodified.png'),{frameWidth: 469, frameHeight: 420});
        this.load.spritesheet('pirategreenjumpingmodified',require('../assets/gun/green/pirategreenjumpingmodified.png'),{frameWidth: 469, frameHeight: 420});
        //-------------------------------------------------------------------------------------------------------------------------------------------
        this.load.spritesheet('pirateyellowbreathingmodified',require('../assets/gun/yellow/pirateyellowbreathingmodified.png'),{frameWidth:469,frameHeight: 420});
        this.load.spritesheet('pirateyellowhurtmodified',require('../assets/gun/yellow/pirateyellowhurtmodified.png'),{frameWidth: 469, frameHeight: 420});
        this.load.spritesheet('pirateyellowrunningmodified',require('../assets/gun/yellow/pirateyellowrunningmodified.png'),{frameWidth: 467, frameHeight: 415});
        this.load.spritesheet('pirateyellowdeadmodified',require('../assets/gun/yellow/pirateyellowdeadmodified.png'),{frameWidth: 469, frameHeight: 420});
        this.load.spritesheet('pirateyellowshotmodified',require('../assets/gun/yellow/pirateyellowshotmodified.png'),{frameWidth: 469, frameHeight: 420});
        this.load.spritesheet('pirateyellowjumpingmodified',require('../assets/gun/yellow/pirateyellowjumpingmodified.png'),{frameWidth: 465, frameHeight: 420});
        //-------------------------------------------------------------------------------------------------------------------------------------------
        this.load.spritesheet('pirateredbreathingmodified',require('../assets/gun/red/pirateredbreathingmodified.png'),{frameWidth:469,frameHeight: 420});
        this.load.spritesheet('pirateredhurtmodified',require('../assets/gun/red/pirateredhurtmodified.png'),{frameWidth: 469, frameHeight: 420});
        this.load.spritesheet('pirateredrunningmodified',require('../assets/gun/red/pirateredrunningmodified.png'),{frameWidth: 467, frameHeight: 415});
        this.load.spritesheet('piratereddeadmodified',require('../assets/gun/red/piratereddeadmodified.png'),{frameWidth: 469, frameHeight: 420});
        this.load.spritesheet('pirateredshotmodified',require('../assets/gun/red/pirateredshotmodified.png'),{frameWidth: 469, frameHeight: 420});
        this.load.spritesheet('pirateredjumpingmodified',require('../assets/gun/red/pirateredjumpingmodified.png'),{frameWidth: 465, frameHeight: 420});
        //-------------------------------------------------------------------------------------------------------------------------------------------
        this.load.image('bullet',require('../assets/elements/bomb.png'));
    }

    create(){

       console.log(this.data);
       this.pirate2=this.physics.add.sprite(300,450,`${this.data}breathingmodified`).setScale(personajes[this.data].scale);
       this.pirate2.setCollideWorldBounds(true);
       this.pirate2.setSize(this.stats.width,this.stats.height,true);
       this.pirate2.setOffset(personajes[this.data].hitbox.offset[0],personajes[this.data].hitbox.offset[1]);
//-------------------------------------------------------------------------------------------------------------------------------------------------------
       //ANIMACIONES
        this.anims.create({
        key:personajes[this.data].key,
        frames:this.anims.generateFrameNumbers(`${this.data}breathingmodified`,{start:personajes[this.data].frames.start , end:personajes[this.data].frames.end}),
        frameRate: personajes[this.data].frameRate,
        yoyo:personajes[this.data].yoyo,
        repeat:personajes[this.data].repeat
       });
       this.anims.create({
        key:personajes[this.data].animshurt.key,
        frames:this.anims.generateFrameNumbers(`${this.data}hurtmodified`,{start:personajes[this.data].animshurt.frames.start,end:personajes[this.data].animshurt.frames.end}),
        frameRate: personajes[this.data].animshurt.frameRate,
        yoyo:personajes[this.data].animshurt.yoyo,
        repeat:personajes[this.data].animshurt.repeat
       });
       this.anims.create({
        key:personajes[this.data].animsrunning.key,
        frames:this.anims.generateFrameNumbers(`${this.data}runningmodified`,{start:personajes[this.data].animsrunning.frames.start,end:personajes[this.data].animsrunning.frames.end}),
        frameRate:personajes[this.data].animsrunning.frameRate,
        yoyo:personajes[this.data].animsrunning.yoyo,
        repeat:personajes[this.data].animsrunning.repeat
       });
       this.anims.create({
        key:personajes[this.data].animsdead.key,
        frames:this.anims.generateFrameNumbers(`${this.data}deadmodified`,{start:personajes[this.data].animsdead.frames.start,end:personajes[this.data].animsdead.frames.end}),
        frameRate:personajes[this.data].animsdead.frameRate,
        yoyo:personajes[this.data].animsdead.yoyo,
        repeat:personajes[this.data].animsdead.repeat
       });
       this.anims.create({
        key:personajes[this.data].animsjumping.key,
        frames:this.anims.generateFrameNumbers(`${this.data}jumpingmodified`,{start:personajes[this.data].animsjumping.frames.start,end:personajes[this.data].animsjumping.frames.end}),
        frameRate:personajes[this.data].animsjumping.frameRate,
        yoyo:personajes[this.data].animsjumping.yoyo,
        repeat:personajes[this.data].animsjumping.repeat
       });
       this.anims.create({
        key:personajes[this.data].animsshot.key,
        frames:this.anims.generateFrameNumbers(`${this.data}shotmodified`,{start:personajes[this.data].animsshot.frames.start,end:personajes[this.data].animsshot.frames.end}),
        frameRate:personajes[this.data].animsshot.frameRate,
        yoyo:personajes[this.data].animsshot.yoyo,
        repeat:personajes[this.data].animsshot.repeat
       });
//------------------------------------------------------------------------------------------------
       this.cursors= this.input.keyboard.createCursorKeys();
       this.e=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
//--------------------------------------------------------------------------------------
    this.bullets = this.physics.add.group();
       
    }

    update(time) {
        if(this.cursors.left.isDown){
              this.pirate2.flipX=false;
              this.pirate2.setVelocityX(-1 * this.stats.velocityX);
              this.pirate2.anims.play(personajes[this.data].animsrunning.key,true);
              console.log('izquierda');
          }
          else if(this.cursors.right.isDown)
          {
              this.pirate2.flipX=true;
              this.pirate2.setVelocityX(this.stats.velocityX);
              this.pirate2.anims.play(personajes[this.data].animsrunning.key,true);
              console.log('derecha');
          }else if(this.cursors.up.isDown && this.pirate2.body.onFloor())
          {
              this.pirate2.body.setVelocityY(-1 * this.stats.velocityY);
              this.pirate2.anims.play(personajes[this.data].animsjumping.key,true);
          }else if(this.pirate2.body.onFloor()){
            this.pirate2.body.setVelocityX(0);
            this.pirate2.anims.play(personajes[this.data].key,true);
          }
          
          if(Phaser.Input.Keyboard.JustDown(this.e)){
              if(time*0.1>timeshoot){
                  timeshoot=time*0.1 + shoot;
                  this.shootBullet();
                  console.log(time*this.stats.speed);
              }
            // this.e.getDuration()
          }
    }

    shootBullet(){

        if(this.pirate2.flipX){
            this.bullet = this.bullets.create(this.pirate2.body.position.x+93,this.pirate2.body.position.y+50,'bullet');
            this.bullet.body.allowGravity = false;
            this.bullet.body.setVelocityX(this.stats.power);
        }
        if(this.pirate2.flipX==false){
            this.bullet = this.bullets.create(this.pirate2.body.position.x-20,this.pirate2.body.position.y+50,'bullet');
            this.bullet.body.allowGravity = false;
            this.bullet.body.setVelocityX(-1 * this.stats.power);
        }
        
    }
    resetBullet(){
        this.bullets.kill();
    }
    
}

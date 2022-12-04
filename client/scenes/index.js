import {Menu} from './menu.js';
import {Game} from './game.js';

const config = {
    type: Phaser.AUTO,
    width: 1520,
    height: 700,
    scene: [Menu,Game],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    },
    
};

var game = new Phaser.Game(config);
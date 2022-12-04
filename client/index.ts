import Phaser from "phaser";

import { Menu } from "./scenes/menu.js";
import {Game} from './scenes/game.js';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    fps: {
        target: 60,
        forceSetTimeOut: true,
        smoothStep: false,
    },
    width: 1520,
    height: 700,
    scene: [Menu,Game],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    }
};

const game = new Phaser.Game(config);


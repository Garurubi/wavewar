
import playGame from './playGame.js';
import gameStart from './gameStart.js';
import gameOver from './gameOver.js';
import levelUp from './levelUp.js';
import leaderBoard from './leaderBoard.js';
import status from './status.js';
import miniMap from './miniMap.js';

var config = 
{
    type: Phaser.AuTO,
    // 맵 영역크기 설정
    width: window.innerWidth - 25,
    height: window.innerHeight - 20,
    parent: 'wavewar',
    physics: 
    {
        default: 'arcade',
        arcade: 
        {
            debug: false
        }
    },
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    // 등장 순서대로 배치 하지 않으면 scene위에 scene이 덮어질 수 있음.
    scene:
    [
        {preload, create},
        playGame,
        gameStart,
        leaderBoard,
        status,
        miniMap,
        levelUp,
        gameOver
    ],
    dom: 
    {
        createContainer: true
    }
}

const game = new Phaser.Game(config);

function preload()
{
    // 기본 공통 url을 세팅하고 그 하위경로에서 이미지들을 하나씩 불러옴
    this.load.setBaseURL('http://' + window.location.host + '/static');

    this.load.html('nameform', 'nameform.html');

    this.load.image('phaser3-logo', 'image/background/phaser3-logo.png');
    this.load.image('space', 'image/background/background_sky3_l.png');
    this.load.image('space1', 'image/background/starfield.png');
    this.load.image('wavewar-logo', 'image/background/WAVEWAR.png');
    this.load.image('baseShip', 'image/ship/spaceShips_0011.png');
    this.load.image('heavyShip', 'image/ship/spaceShips_0012.png');
    this.load.image('sniperShip', 'image/ship/spaceShips_0013.png');

    this.load.image('jupiter', 'image/planet/simple_planet_21_h.png');
    this.load.image('earth', 'image/planet/simple_planet_23_h.png');
    this.load.image('moon', 'image/planet/simple_planet_09_h.png');
    this.load.image('venus', 'image/planet/planet6_h.png');
    this.load.image('mercury', 'image/planet/planet29_h.png');
    this.load.image('asteroid1', 'image/planet/meteorBrown_big1.png');
    this.load.image('asteroid2', 'image/planet/meteorBrown_big2.png');
    this.load.image('asteroid3', 'image/planet/meteorBrown_big3.png');

    this.load.image('baseLaser', 'image/laser/laserRed07.png');
    this.load.image('heavyLaser', 'image/laser/laserRed06.png');
    this.load.image('sniperLaser', 'image/laser/laserRed01.png');
    this.load.image('hitLaser', 'image/effect/laserRed10.png');
    this.load.image('explosion', 'image/effect/tank_explosion3.png');
    this.load.image('baseShipIcon', 'image/effect/icon1.png');
    this.load.image('heavyShipIcon', 'image/effect/icon2.png');
    this.load.image('sniperShipIcon', 'image/effect/icon3.png');
    this.load.image('hpIcon', 'image/effect/platformPack_item017.png');
    this.load.image('attSpeedIcon', 'image/effect/platformPack_item002.png');
    this.load.image('rangeIcon', 'image/effect/platformPack_item003.png');
    this.load.image('moveSpeedIcon', 'image/effect/platformPack_item001.png');
    this.load.image('miniMapPoint', 'image/effect/turretBase_small.png');

    this.load.image('hpUp', 'image/effect/pill_red.png');
    this.load.image('attackSpeedUp', 'image/effect/pill_yellow.png');
    this.load.image('rangeUp', 'image/effect/pill_green.png');
    this.load.image('moveSpeedUp', 'image/effect/pill_blue.png');
  
}

function create()
{
    this.scene.start('playGame');
}
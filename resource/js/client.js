
var config = 
{
    type: Phaser.AuTO,
    // 맵 영역크기 설정
    width: window.innerWidth - 25,
    height: window.innerHeight - 20,
    physics: {
        default: 'arcade',
        arcade: 
        {
            debug: true
        }
    },
    scene:
    [
        gameStart, 
        {
            preload: preload,
            create: create,
            update: update
        },
        gameOver
    ]
}

function preload()
{
    // 기본 공통 url을 세팅하고 그 하위경로에서 이미지들을 하나씩 불러옴
    this.load.setBaseURL('http://192.168.2.248:9999/static');

    this.load.image('space', 'image/background/background_sky3_l.png');
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

    this.load.image('baseLaser', 'image/laser/laserRed05.png');
    this.load.image('hitLaser', 'image/effect/laserRed10.png');
    this.load.image('explosion', 'image/effect/spaceEffects_016.png');
}

var myShip;
var bg;
var w_keydown;
var self;

function create()
{
    // 배경 반복해서 깔기
    const { width, height } = this.sys.game.config;
    bg = this.add.tileSprite(0, 0, width, height, "space").setScrollFactor(0).setOrigin(0, 0);
    this.input.setDefaultCursor('url(static/image/background/numeralX.png), pointer');

    self = this;
    this.socket = io();
    this.players = this.physics.add.group();
    this.playerNames = this.add.group();
    this.asteroids = this.physics.add.group();
    this.bullets = this.physics.add.group();

    // this.socket.emit('createShip', {});

    this.socket.on('worldBounds', function (worldSize)
    {
        var worldBound = self.add.graphics().lineStyle(2, 0x0000ff, 1).strokeRect(0, 0, worldSize.w, worldSize.h);
    })

    this.socket.on('currentPlayerList', function (playerList)
    {
        Object.keys(playerList).forEach(function (id) 
        {
            if (playerList[id].playerId === self.socket.id) 
            {
                // 최초 생성시 내 기체 정보 저장.
                myShip = playerList[id];
                // 내 기체 출력
                displayMine(self, playerList[id]);
            }
            else
            {
                // 다른 플레이어 기체 출력
                displayPlayer(self, playerList[id]);
            }
        });
    });

    this.socket.on('planets', function (planets)
    {
        displayPlanet(self, planets.planetList);
        displayAsteroid(self, planets.asteroidList);
    });

    this.socket.on('newPlayer', function (playerInfo) 
    {
        displayPlayer(self, playerInfo);
    });

    this.socket.on('outPlayer', function (playerId) 
    {
        self.players.getChildren().forEach(function (player) 
        {
            if (playerId === player.playerId) 
            {
                player.destroy();
            }
        });
    });

    this.socket.on('playerUpdates', function (playerList) 
    {
        Object.keys(playerList).forEach(function (id) 
        {
            self.players.getChildren().forEach(function (player) 
            {
                if (playerList[id].playerId === player.playerId) 
                {
                    player.setRotation(playerList[id].rotation);
                    player.setPosition(playerList[id].x, playerList[id].y);
                    if(id === self.socket.id)
                    {
                        bg.tilePositionX += playerList[id].bg.x;
                        bg.tilePositionY += playerList[id].bg.y;
                    }
                }
            });
        });
    });

    this.socket.on('asteroidMove', function (asteroidList)
    {
        self.asteroids.getChildren().forEach(function (asteroid)
        {
            var id = asteroid.id;
            asteroid.setPosition(asteroidList[id].x, asteroidList[id].y);
        })
    });

    this.socket.on('addBullet', function (bullet)
    {
        addBullet(self, bullet);
    })

    this.socket.on('updateBullet', function (bulletInfo)
    {
        updateBullet(self, bulletInfo);
    })

    this.socket.on('hitBullet', function (bulletId)
    {
        hitBullet(self, bulletId);
    })

    this.socket.on('detroyPlayer', function (playerId)
    {
        destroyPlayer(self, playerId);
    })

    this.socket.on('destroyBullet', function (bulletId)
    {
        destroyBullet(self, bulletId);
    })

    // 클라이언트 조작
    this.cursors = this.input.keyboard.addKeys('W');
    
    // this.input.on('pointermove', function (pointer) 
    // {
    //     if(!self.input.mouse.locked)
    //     {
    //         self.input.mouse.requestPointerLock();
    //     }
    //     var moX = pointer.movementX;
    //     var moY = pointer.movementY;
    //     self.cursorImage.setPosition(moX, moY);
    //     self.socket.emit('rotateShip', {mouseX : moX, mouseY : moY})
    // });
    
    this.input.keyboard.on('keydown-W', function()
    {
        console.log("w 누름 신호 전송!")
        w_keydown = true;
        self.socket.emit('moveShip', {W : true})
    });

    this.input.keyboard.on('keyup-W', function()
    {
        console.log("w 꺼짐 신호 전송!")
        w_keydown = false;
        self.socket.emit('moveShip', {W : false})
    });

    this.input.on('pointerdown', function (pointer) 
    {
        console.log("pointerdown 신호 전송!")
        self.socket.emit('fireBullet', true)
    });

    this.input.on('pointerup', function (pointer) 
    {
        console.log("pointerup 신호 전송!")
        self.socket.emit('fireBullet', false)
    });

    // setTimeOut 기능
    // this.time.addEvent(
    // {
    //     delay: 3000,
    //     loop: false,
    //     callback: addAlien
    // });
}

function update()
{
    this.input.mousePointer.updateWorldPoint(this.cameras.main);
    var moX = this.input.activePointer.worldX;
    var moY = this.input.activePointer.worldY;
    this.socket.emit('rotateShip', {mouseX : moX, mouseY : moY})

    this.players.getChildren().forEach(function (player) 
    {
        self.playerNames.getChildren().forEach(function (playerName)
        {
            if(player.playerId === playerName.playerId)
            {
                playerName.setPosition(player.x, player.y - 70);
            }
        })
    });

    // 움질일때 불꽃 이미지 추가
    // if (cursors.W.isDown)
    // {

    // }
}

function displayMine(self, playerInfo) 
{
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, playerInfo.ship)
                    .setOrigin(0.5, 0.5).setDepth(1);
    player.playerId = playerInfo.playerId;
    self.players.add(player);
    myShip = player;
    // 카메라 팔로우 설정
    self.cameras.main.startFollow(player, true, 0.1, 0.1);
    // console.log(player.body.syncBounds)
    const playerName = self.add.text(playerInfo.x, playerInfo.y - 70, playerInfo.playerName, {fontSize: '20px'}).setOrigin(0.5, 0.5);
    playerName.playerId = playerInfo.playerId;
    self.playerNames.add(playerName);
}

function displayPlayer(self, playerInfo) 
{
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, playerInfo.ship).setOrigin(0.5, 0.5);
    player.playerId = playerInfo.playerId;
    self.players.add(player);
    const playerName = self.add.text(playerInfo.x, playerInfo.y - 70, playerInfo.playerName, {fontSize: '20px'}).setOrigin(0.5, 0.5);
    playerName.playerId = playerInfo.playerId;
    self.playerNames.add(playerName);
}

function displayPlanet(self, planetList)
{
    Object.keys(planetList).forEach(function (id) 
    {
        // self.add.image(planetList[id].x, planetList[id].y, planetList[id].planet);
        if(id == 0)
        {
            self.physics.add.image(planetList[id].x, planetList[id].y, planetList[id].planet).setCircle(258);
        }
        else if(id == 1)
        {
            self.physics.add.image(planetList[id].x, planetList[id].y, planetList[id].planet).setCircle(258);
        }
        else if(id == 2)
        {
            self.physics.add.image(planetList[id].x, planetList[id].y, planetList[id].planet).setCircle(285, -2, 20);
        }
        else if(id == 3)
        {
            self.physics.add.image(planetList[id].x, planetList[id].y, planetList[id].planet).setCircle(138, 2, 2);
        }

    })
}

function displayAsteroid(self, asteroidList)
{
    Object.keys(asteroidList).forEach(function (id) 
    {
        const asteroid = self.physics.add.image(asteroidList[id].x, asteroidList[id].y, asteroidList[id].asteroid)
                        .setCircle(43);
        asteroid.id = asteroidList[id].id;
        self.asteroids.add(asteroid);
    })
}

function addBullet(self, bulletInfo)
{
   const bullet = self.physics.add.image(bulletInfo.x, bulletInfo.y, bulletInfo.bullet)
                .setRotation(bulletInfo.rotation);
   bullet.id = bulletInfo.id;
   self.bullets.add(bullet);
}

function updateBullet(self, bulletInfo)
{
    self.bullets.getChildren().forEach(function (bullet)
    {
        if(bulletInfo.id === bullet.id)
        {
            bullet.setPosition(bulletInfo.x, bulletInfo.y);
        }
    })
}

function destroyBullet(self, bulletId)
{
    self.bullets.getChildren().forEach(function (bullet)
    {
        if(bulletId === bullet.id)
        {
            bullet.destroy();
        }
    })
}

function hitBullet(self, bulletId)
{
    self.bullets.getChildren().forEach(function (bullet)
    {
        if(bulletId === bullet.id)
        {
            // var hit = self.add.particles("hitLaser").createEmitter(
            // {
            //     alpha: { start: 1, end: 0, ease: "Cubic.easeIn" },
            //     blendMode: 3,
            //     frequency: -1,
            //     lifespan: 500,
            //     radial: false,
            //     scale: { start: 1, end: 5, ease: "Cubic.easeOut" }
            // });
            var hit = self.add.image(bullet.x, bullet.y, 'hitLaser').setScale(0.7, 0.7);
            bullet.destroy();
            self.time.addEvent(
            {
                delay: 100,
                loop: false,
                callback: function(){hit.destroy()}
            });
        }
    })
}

function destroyPlayer(self, playerId)
{
    self.players.getChildren().forEach(function (player) 
    {
        if (playerId === player.playerId) 
        {
            player.destroy();
            self.playerNames.getChildren().forEach(function (playerName)
            {
                if(playerId === playerName.playerId)
                {
                    playerName.destroy();
                }
            })
            var explosion = self.add.image(player.x, player.y, 'explosion').setScale(2, 2);
            self.time.addEvent(
            {
                delay: 300,
                loop: false,
                callback: function(){explosion.destroy()}
            });
            self.scene.start('gameOver');
        }
    });
}

const game = new Phaser.Game(config);
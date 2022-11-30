var playerList = {};
var planetList = {};
var asteroidList = {};
var bulletNum = 0;
var shipInfoList = {};
let leaderBoard = [];

var playerNum = 0;
var mapWidth = 3000;
var mapHeight = 3000;

var baseBullet = new Phaser.Class
({
    Extends: Phaser.GameObjects.Image,

    initialize:

    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'baseLaser');

        this.id = null;
        this.playerId = null;
        this.incX = 0;
        this.incY = 0;
        this.lifespan = 0;

        this.speed = Phaser.Math.GetSpeed(800, 1);
    },

    fire: function (playerInfo)
    {
        this.setActive(true);
        this.setVisible(true);
        this.setPosition(playerInfo.x, playerInfo.y);

        var angle = Phaser.Math.Angle.Between(playerInfo.input.mouseX, playerInfo.input.mouseY, playerInfo.x, playerInfo.y);
        this.setRotation(Math.PI / 2 - angle);

        this.incX = Math.cos(angle);
        this.incY = Math.sin(angle);
    },

    update: function (time, delta)
    {
        this.lifespan -= delta;

        this.x -= this.incX * (this.speed * delta);
        this.y -= this.incY * (this.speed * delta);

        if (this.lifespan <= 0)
        {
            io.emit('destroyBullet', this.id);
            // delete bulletList[this.id];
            this.destroy();
        }
        io.emit('updateBullet', {id: this.id, x: this.x, y: this.y});
    }
});

var heavyBullet = new Phaser.Class
({
    Extends: baseBullet,

    initialize:

    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'heavyLaser');

        this.id = null;
        this.playerId = null;
        this.incX = 0;
        this.incY = 0;
        this.lifespan = 0;

        this.speed = Phaser.Math.GetSpeed(800, 1);
    },

    fire: function (playerInfo, num)
    {
        this.setActive(true);
        this.setVisible(true);

        this.setPosition(playerInfo.x, playerInfo.y);

        var angle = Phaser.Math.Angle.Between(playerInfo.input.mouseX, playerInfo.input.mouseY, playerInfo.x, playerInfo.y);
        
        if(num === 1)
        {
            // console.log('1번탄')
            // this.setRotation(angle - Math.PI*2 / 3);
            // this.incX = Math.cos(angle - Math.PI / 6);
            // this.incY = Math.sin(angle - Math.PI / 6);
            this.setRotation(angle - Math.PI*5 / 8);
            this.incX = Math.cos(angle - Math.PI / 8);
            this.incY = Math.sin(angle - Math.PI / 8);
        }
        else if(num === 2)
        {
            // console.log('2번탄')
            this.setRotation(angle - Math.PI / 2);
            this.incX = Math.cos(angle);
            this.incY = Math.sin(angle);
        }
        else if(num === 3)
        {
            // console.log('3번탄')
            // this.setRotation(angle + Math.PI*2 / 3);
            // this.incX = Math.cos(angle + Math.PI / 6);
            // this.incY = Math.sin(angle + Math.PI / 6);
            this.setRotation(angle + Math.PI*5 / 8);
            this.incX = Math.cos(angle + Math.PI / 8);
            this.incY = Math.sin(angle + Math.PI / 8);
        }
    }
});

var sniperBullet = new Phaser.Class
({
    Extends: baseBullet,

    initialize:

    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'sniperLaser');

        this.id = null;
        this.playerId = null;
        this.incX = 0;
        this.incY = 0;
        this.lifespan = 0;

        this.speed = Phaser.Math.GetSpeed(800, 1);
    }
});

var config = 
{
    type: Phaser.HEADLESS,
    width: mapWidth,
    height: mapHeight,
    autoFocus: false,
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
    scene:
    {
        preload: preload,
        create: create,
        update: update
    }
}

function preload()
{
    this.load.image('baseShip', 'resource/image/ship/spaceShips_0011.png');
    this.load.image('heavyShip', 'resource/image/ship/spaceShips_0012.png');
    this.load.image('sniperShip', 'resource/image/ship/spaceShips_0013.png');

    this.load.image('jupiter', 'resource/image/planet/simple_planet_21_h.png');
    this.load.image('earth', 'resource/image/planet/simple_planet_23_h.png');
    this.load.image('moon', 'resource/image/planet/simple_planet_09_h.png');
    this.load.image('venus', 'resource/image/planet/planet6_h.png');
    this.load.image('mercury', 'resource/image/planet/planet29_h.png');
    this.load.image('asteroid1', 'resource/image/planet/meteorBrown_big1.png');
    this.load.image('asteroid2', 'resource/image/planet/meteorBrown_big2.png');
    this.load.image('asteroid3', 'resource/image/planet/meteorBrown_big3.png');

    this.load.image('baseLaser', 'resource/image/laser/laserRed07.png');
    this.load.image('heavyLaser', 'resource/image/laser/laserRed06.png');
    this.load.image('sniperLaser', 'resource/image/laser/laserRed01.png');
}

function create()
{
    // 플레이어 그룹
    this.players = this.physics.add.group();
    // 행성 그룹
    this.planets = this.physics.add.staticGroup();
    addPlanets(this);
    // 소행성 그룹
    this.asteroids = this.physics.add.group();
    addAsteroid(this);
    // 탄환 그룹
    this.baseBullets = this.physics.add.group
    ({
        classType: baseBullet,
        runChildUpdate: true // Bullet 객체의 update 메서드를 실행할것인지 여부
    });
    this.heavyBullets = this.physics.add.group
    ({
        classType: heavyBullet,
        runChildUpdate: true 
    });
    this.sniperBullets = this.physics.add.group
    ({
        classType: sniperBullet,
        runChildUpdate: true 
    });

    // 충돌 설정
    gameCollide(this, this.players, this.asteroids, this.planets, this.baseBullets, this.heavyBullets, this.sniperBullets);

    io.on('connect', (socket) => 
    {
        let self = this;
        socket.emit('worldBounds', {w: mapWidth, h: mapHeight});
        socket.emit('planets', {planetList : planetList, asteroidList : asteroidList});
        socket.emit('currentPlayerList', playerList);
        
        socket.on('selectShip', (inputData) => 
        {
            managePlayerInfo(inputData, socket.id);
            socket.emit('addMine', {myPlayerInfo: playerList[socket.id], hp: shipInfoList[socket.id].hp, leaderBoard: leaderBoard, playerList: playerList});
            addPlayer(self, playerList[socket.id], shipInfoList[socket.id]);
            socket.broadcast.emit('newPlayer', {playerInfo: playerList[socket.id], leaderBoard: leaderBoard});
            playerNum++
            console.log("플레이어 수 : " + playerNum);
        })

        socket.on('disconnect', (reason) => 
        {
            // phaser객체, leaderBoard, shipInfoList, playerList 삭제
            removePlayer(self, socket.id);
            io.emit("outPlayer", {playerId: socket.id, leaderBoard: leaderBoard});
            playerNum--;
            console.log("플레이어 수 : " + playerNum);
        });

        socket.on('moveShip', (inputData) => 
        {
            handlePlayerMove(self, socket.id, inputData);
        });
        
        socket.on('rotateShip', (inputData) => 
        {
            handlePlayerRotation(self, socket.id, inputData);
        })

        socket.on('fireBullet', (inputData) => 
        {
            ///////////////////////////////////////////////////////////////////////////////////////////
            // console.log(playerList[socket.id].playerName);
            if(playerList[socket.id])
            {
                playerList[socket.id].input.isDown = inputData;
            }
            if(bulletNum > 1000000)
            {
                bulletNum = 0;
            }
        })

        socket.on('hpUP', (inputData) =>
        {
            if(shipInfoList[socket.id])
            {
                shipInfoList[socket.id].hp = shipInfoList[socket.id].hp + 1;
            }
        })
        socket.on('moveSpeedUp', (inputData) =>
        {
            shipInfoList[socket.id].moveSpeed = shipInfoList[socket.id].moveSpeed + 50;
            self.players.getChildren().forEach((player) => 
            {
                if (socket.id === player.playerId) 
                {
                    player.setMaxVelocity(shipInfoList[socket.id].moveSpeed);
                }
            });
        })
        socket.on('rangeUp', (inputData) =>
        {
            shipInfoList[socket.id].lifespan = shipInfoList[socket.id].lifespan + 100;
        })
        socket.on('attackSpeedUp', (inputData) =>
        {
            shipInfoList[socket.id].attSpeed = shipInfoList[socket.id].attSpeed - 100;
        })
    })
}

function update(time, delta)
{
    this.players.getChildren().forEach((player) => 
    {
        const input = playerList[player.playerId].input;
        const shipInfo = shipInfoList[player.playerId];
        player.setRotation(Phaser.Math.Angle.Between(input.mouseX, input.mouseY, player.x, player.y) - Math.PI / 2);

        if(input.W)
        {
            // player.x += Phaser.Math.GetSpeed(300, 1) * delta;
            this.physics.velocityFromRotation(player.rotation - Math.PI/2, shipInfo.moveSpeed, player.body.acceleration);
            // let angle = Phaser.Math.Angle.Between(input.mouseX, input.mouseY, player.x, player.y) - Math.PI;
            // let cos = Math.cos(angle);
            // let sin = Math.sin(angle);
            // player.setVelocity(400*cos, 400*sin);
        }
        else
        {
            player.setAcceleration(0);
        }

        if (input.isDown && time > shipInfo.lastFiredTime)
        {
            let shipSortNum = shipInfo.sortNum;
            if(shipSortNum === 1 || shipSortNum === 3)
            {
                let bullet;
                if(shipSortNum === 1)
                {
                    bullet = this.baseBullets.get();
                }
                else if(shipSortNum === 3)
                {
                    bullet = this.sniperBullets.get();
                }
                registerBulletInfo(bullet, player, shipInfo);
                bullet.fire(playerList[player.playerId]);
                shipInfo.lastFiredTime = time + shipInfo.attSpeed;
            }
            else if(shipSortNum === 2)
            {
                let bullet1 = this.heavyBullets.get();
                bullet1.bulletNo = 1;
                let bullet2 = this.heavyBullets.get();
                bullet2.bulletNo = 2;
                let bullet3 = this.heavyBullets.get();
                bullet3.bulletNo = 3;
                heavyBulletFire([bullet1, bullet2, bullet3], player, playerList[player.playerId], shipInfo);
                shipInfo.lastFiredTime = time + shipInfo.attSpeed;
            }
        }

        playerList[player.playerId].x = player.x;
        playerList[player.playerId].y = player.y;
        playerList[player.playerId].rotation = player.rotation;
        playerList[player.playerId].bg.x = player.body.deltaX() * 0.5;
        playerList[player.playerId].bg.y = player.body.deltaY() * 0.5;
    });
    io.emit('playerUpdates', {playerList: playerList, time: Date.now()});

    this.asteroids.getChildren().forEach((asteroid) => 
    {
        asteroidList[asteroid.id].x = asteroid.x;
        asteroidList[asteroid.id].y = asteroid.y;
    })
    io.emit('asteroidMove', asteroidList);
    // 맵 경계를 벗어날 경우 반대편에서 나타나게 설정
    this.physics.world.wrap(this.asteroids, 5);
}

function managePlayerInfo(inputData, playerId)
{
    let x = Phaser.Math.Between(0, mapWidth);
    let y = Phaser.Math.Between(0, mapHeight);
    let shipSort = inputData.shipSort;
    let shipSortNum = inputData.shipSortNum;

    playerList[playerId] = 
    {
        rotation: 0,
        x: x,
        y: y,
        playerName: inputData.playerName,
        playerId: playerId,
        ship: shipSort,
        bg:
        {
            x: 0,
            y: 0
        },
        input: 
        {
            mouseX: x,
            mouseY: y,
            W: false,
            isDown: false
        }
    };
    if(shipSortNum === 1)
    {
        shipInfoList[playerId] = 
        {
            sortNum: shipSortNum,
            hp: 3,
            level: 0,
            laser: 'baseLaser',
            attPower: 1,
            lastFiredTime: 0,
            attSpeed: 1000,
            moveSpeed: 400,
            lifespan: 800
        };
    }
    else if(shipSortNum === 2)
    {
        shipInfoList[playerId] = 
        {
            sortNum: shipSortNum,
            hp: 4,
            level: 0,
            laser: 'heavyLaser',
            attPower: 1,
            lastFiredTime: 0,
            attSpeed: 1200,
            moveSpeed: 200,
            lifespan: 600
        };
    }
    else if(shipSortNum === 3)
    {
        shipInfoList[playerId] = 
        {
            sortNum: shipSortNum,
            hp: 3,
            level: 0,
            laser: 'sniperLaser',
            attPower: 2,
            lastFiredTime: 0,
            attSpeed: 1300,
            moveSpeed: 400,
            lifespan: 1000
        };
    }
    leaderBoard.push({playerId: playerId, level: 0, playerName: inputData.playerName, ship: playerList[playerId].ship});
}

function handlePlayerRotation(self, playerId, input) 
{
    self.players.getChildren().forEach((player) => 
    {
        if (playerId === player.playerId) 
        {
            playerList[player.playerId].input.mouseX = input.mouseX;
            playerList[player.playerId].input.mouseY = input.mouseY;
            return;
        }
    });
}

function handlePlayerMove(self, playerId, input) 
{
    self.players.getChildren().forEach((player) => 
    {
        if (playerId === player.playerId) 
        {
            playerList[player.playerId].input.W = input.W;
            return;
        }
    });
}

function addPlayer(self, playerInfo, shipInfo) 
{
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, playerInfo.ship).setOrigin(0.5, 0.5);
    self.players.add(player);
    player.setDrag(50);
    player.setMaxVelocity(shipInfo.moveSpeed);
    // player.setAngularDrag(100);
    player.setBounce(0.5, 0.5);
    player.setCollideWorldBounds(true);
    // player.body.syncBounds = true;
    player.playerId = playerInfo.playerId;
}

function removePlayer(self, playerId) 
{
    self.players.getChildren().forEach((player) => 
    {
        if (playerId === player.playerId) 
        {
            player.destroy();
            return;
        }
    });
    // 리스트에서 삭제
    delete playerList[playerId];
    delete shipInfoList[playerId];
    removeLeaderBoard(playerId);    
}

function removeLeaderBoard(playerId)
{
    let arr = [];
    for(let i=0; i<leaderBoard.length; i++)
    {
        if(leaderBoard[i].playerId !== playerId)
        {
            arr.push(leaderBoard[i]);
            // delete leaderBoard[i];
            // let arrNum = i;
            // for(let j=i+1; j<leaderBoard.length; j++)
            // {
            //     leaderBoard[arrNum] = leaderBoard[j];
            //     arrNum = j;
            // }
        }
    }
    leaderBoard = arr;
}

function addPlanets(self)
{
    planetList =
    [ 
        {
            planet : 'jupiter',
            x : 1000,
            y : 500
        },
        {
            planet : 'earth',
            x : 2200,
            y : 1000
        },
        {
            planet : 'mercury',
            x : 1000,
            y : 2000
        },
        {
            planet : 'venus',
            x : 2300,
            y : 2000
        }
    ]
    self.planets.create(planetList[0].x, planetList[0].y, 'jupiter').setCircle(258);
    self.planets.create(planetList[1].x, planetList[1].y, 'earth').setCircle(258);
    self.planets.create(planetList[2].x, planetList[2].y, 'mercury').setCircle(285, -2, 20);
    self.planets.create(planetList[3].x, planetList[3].y, 'venus').setCircle(138, 2, 2);
}

function addAsteroid(self)
{
    var ranNum = Phaser.Math.Between(10, 20);
    console.log('소행성 개수 : ' + ranNum);
    for(var i=0; i<=ranNum; i++)
    {
        var x = Math.floor(Math.random() * mapWidth);
        var y = Math.floor(Math.random() * mapHeight);
        var xVel = Phaser.Math.Between(-200, 200);
        var yVel = Phaser.Math.Between(-200, 200);
        var asteroid = self.asteroids.create(x, y, 'asteroid3').setCircle(43).setBounce(1, 1).setVelocity(xVel, yVel);
        asteroid.id = i;
        asteroidList[i] =
        {
            id : i,
            asteroid : 'asteroid3',
            x : x,
            y : y,
            rotation : 0
        }
    }
}

function hitElement(bulletHit, elementHit)
{
    if (bulletHit.active === true && elementHit.active === true)
    {
        io.emit('hitBullet', bulletHit.id);
        bulletHit.destroy();
    }
}

function hitPlayer(bulletHit, playerHit)
{
    var attPlayerId = bulletHit.playerId;
    var hitPlayerId = playerHit.playerId;
    if(attPlayerId !== hitPlayerId)
    {
        if(bulletHit.active === true && playerHit.active === true)
        {
            var attShipInfo = shipInfoList[attPlayerId];
            var hitShipInfo = shipInfoList[hitPlayerId];
            io.emit('hitBullet', bulletHit.id);
            bulletHit.destroy();
    
            hitShipInfo.hp = hitShipInfo.hp - attShipInfo.attPower;
            io.to(hitPlayerId).emit('hpDown', attShipInfo.attPower);
            if(hitShipInfo.hp <= 0)
            {
                playerHit.destroy();
                removeLeaderBoard(hitPlayerId);  
                resetLeaderBoard(attPlayerId);
                io.emit('detroyPlayer', {playerId: hitPlayerId, playerName: playerList[hitPlayerId].playerName, leaderBoard: leaderBoard});
                delete playerList[hitPlayerId];
                io.to(attPlayerId).emit('levelUp', true);
                shipInfoList[attPlayerId].level++;
            } 
        }
    }
}

function resetLeaderBoard(attPlayerId)
{
    for(let i=0; i<leaderBoard.length; i++)
    {
        if(leaderBoard[i].playerId === attPlayerId)
        {
            leaderBoard[i].level = leaderBoard[i].level + 1;
            break;
        }
    }
    for(let i=0; i<leaderBoard.length-1; i++)
    {
        let arrNum = i;
        for(let j=i+1; j<leaderBoard.length; j++)
        {
            if(leaderBoard[arrNum].level < leaderBoard[j].level)
            {
                arrNum = j;
            }
        }
        let tmp = leaderBoard[i];
        leaderBoard[i] = leaderBoard[arrNum];
        leaderBoard[arrNum] = tmp;
    }
}

function registerBulletInfo(bullet, player, shipInfo)
{
    bullet.id = bulletNum;
    bullet.playerId = player.playerId;
    bullet.lifespan = shipInfo.lifespan;
    var bulletInfo =
    {
        id : bulletNum++,
        playerId : player.playerId,
        sortNum: shipInfo.sortNum,
        bullet : shipInfo.laser,
        x : player.x,
        y : player.y,
        rotation : player.rotation
    }

    io.emit('addBullet', bulletInfo);
}

function heavyBulletFire(heavyBulletArray, player, playerInfo, shipInfo)
{
    for(let i=0; i<heavyBulletArray.length; i++)
    {
        let bullet = heavyBulletArray[i];
        let bulletNo = bullet.bulletNo;
        let rotation;
        if(bulletNo === 1)
        {
            rotation = Phaser.Math.Angle.Between(playerInfo.input.mouseX, playerInfo.input.mouseY, playerInfo.x, playerInfo.y) - Math.PI*5/8;
        }
        else if(bulletNo === 2)
        {
            rotation = player.rotation;
        }
        else if(bulletNo === 3)
        {
            rotation = Phaser.Math.Angle.Between(playerInfo.input.mouseX, playerInfo.input.mouseY, playerInfo.x, playerInfo.y) + Math.PI*5/8;
        }
        bullet.id = bulletNum;
        bullet.playerId = player.playerId;
        bullet.lifespan = shipInfo.lifespan;
        var bulletInfo =
        {
            id : bulletNum++,
            playerId : player.playerId,
            sortNum: shipInfo.sortNum,
            bullet : shipInfo.laser,
            x : player.x,
            y : player.y,
            rotation : rotation
        }
        io.emit('addBullet', bulletInfo);
        bullet.fire(playerInfo, bullet.bulletNo);
    }   
}

function gameCollide(self, players, asteroids, planets, baseBullets, heavyBullets, sniperBullets)
{
    // self.physics.world.collide(players, asteroids);
    self.physics.add.collider(players);
    self.physics.add.collider(asteroids);
    self.physics.add.collider(players, planets);
    self.physics.add.collider(players, asteroids);
    self.physics.add.collider(asteroids, planets);
    self.physics.add.collider(baseBullets, planets, hitElement);
    self.physics.add.overlap(baseBullets, asteroids, hitElement);
    self.physics.add.overlap(baseBullets, players, hitPlayer);
    self.physics.add.collider(heavyBullets, planets, hitElement);
    self.physics.add.overlap(heavyBullets, asteroids, hitElement);
    self.physics.add.overlap(heavyBullets, players, hitPlayer);
    self.physics.add.collider(sniperBullets, planets, hitElement);
    self.physics.add.overlap(sniperBullets, asteroids, hitElement);
    self.physics.add.overlap(sniperBullets, players, hitPlayer);
}

const game = new Phaser.Game(config);
window.gameLoaded();
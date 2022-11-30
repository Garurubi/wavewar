class playGame extends Phaser.Scene
{
    constructor ()
    {
        super({key: 'playGame'});
    }
    
    create()
    {
        this.myShip;
        this.myPlayerInfo;
        this.myStatus;
        var self = this;
        // 배경 반복해서 깔기
        const { width, height } = this.sys.game.config;
        
        this.bg = this.add.tileSprite(0, 0, width, height, "space").setScrollFactor(0).setOrigin(0, 0);
        this.input.setDefaultCursor('url(static/image/background/numeralX.png), pointer');
        // this.cameras.add(0, 0, 800, 800).setZoom(0.2).setBackgroundColor(0x000000).setScroll(1400, 1000);
        
        // 캐릭터 고르는 동안 마우스 키 이 scene에서 잠금
        this.input.enabled = false;
        this.scene.run('gameStart');
        // 소켓 연결
        this.socket = io();
        this.registry.set('socket', this.socket);
        // 그룹 생성
        this.players = this.physics.add.group();
        this.playerNames = this.add.group();
        this.asteroids = this.physics.add.group();
        this.bullets = this.physics.add.group();
        
        this.socket.on('disconnect', function(reason)
        {
            self.input.enabled = false;
            window.location.reload();
        })

        this.socket.on('worldBounds', function (worldSize)
        {
            var worldBound = self.add.graphics().lineStyle(2, 0x0000ff, 1).strokeRect(0, 0, worldSize.w, worldSize.h);
            self.cameras.main.centerOn(worldSize.w/2, worldSize.h/2);
        })

        this.socket.on('currentPlayerList', function (playerList)
        {
            Object.keys(playerList).forEach(function (id) 
            {
                self.displayPlayer(self, playerList[id]);
            });
        });
    
        this.socket.on('planets', function (planets)
        {
            self.displayPlanet(self, planets.planetList);
            self.displayAsteroid(self, planets.asteroidList);
        });
    
        this.socket.on('addMine', function (inputData)
        {
            self.myPlayerInfo = inputData.myPlayerInfo;
            self.displayMine(self, self.myPlayerInfo);
            self.displayLeaderBoard(self, inputData.leaderBoard);
            self.myStatus = 
            {
                ship: inputData.myPlayerInfo.ship,
                level: 0,
                hp: inputData.hp,
                attSpeed: 0,
                range: 0,
                moveSpeed: 0
            }
            self.registry.set('myStatus', self.myStatus);
            self.displayStatus(self);
            self.registry.set('MiniMapInfo', {myPlayerInfo: inputData.myPlayerInfo, playerList: inputData.playerList});
            self.scene.run('miniMap');
            self.input.enabled = true;

            // self.scene.run('gameOver');
        })

        this.socket.on('newPlayer', function (inputData) 
        {
            self.displayPlayer(self, inputData.playerInfo);
            self.displayLeaderBoard(self, inputData.leaderBoard)
            self.scene.get('miniMap').newPlayer(inputData.playerInfo);
        });
    
        this.socket.on('outPlayer', function (inputData) 
        {
           self.outPlayer(self, inputData.playerId);
           self.displayLeaderBoard(self, inputData.leaderBoard);
           if(self.myShip)
           {
               self.scene.get('miniMap').outPlayer(inputData.playerId);
           }
        });
    
        this.socket.on('playerUpdates', function (inputData) 
        {
            let playerList = inputData.playerList;
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
                            self.bg.tilePositionX += playerList[id].bg.x;
                            self.bg.tilePositionY += playerList[id].bg.y;
                        }
                    }
                });
            });
            if(self.myShip)
            {
                self.scene.get('miniMap').updatePlayer(playerList);
            }
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
            self.addBullet(self, bullet);
        })
    
        this.socket.on('updateBullet', function (bulletInfo)
        {
            self.updateBullet(self, bulletInfo);
        })
    
        this.socket.on('hitBullet', function (bulletId)
        {
            self.hitBullet(self, bulletId);
        })
    
        this.socket.on('detroyPlayer', function (inputData)
        {
            let playerId = inputData.playerId;
            if(playerId === self.myShip.playerId)
            {
                self.input.enabled = false;
                self.registry.set('playerName', inputData.playerName);
                self.destroyMine(self);
            }
            else
            {
                self.destroyPlayer(self, playerId);
            }
            self.displayLeaderBoard(self, inputData.leaderBoard);
            self.scene.get('miniMap').outPlayer(inputData.playerId);
        })
    
        this.socket.on('destroyBullet', function (bulletId)
        {
            self.destroyBullet(self, bulletId);
        })

        this.socket.on('levelUp', function (inputData)
        {
            self.scene.run('levelUp');
        })

        this.socket.on('hpDown', function (attPower)
        {
            self.myStatus.hp -= attPower;
            self.registry.set('myStatus', self.myStatus);
            self.displayStatus(self);
        })
    
        // 클라이언트 조작
        this.cursors = this.input.keyboard.addKeys('W');
        
        this.input.keyboard.on('keydown-W', function()
        {
            // console.log("w 누름 신호 전송!")
            self.socket.emit('moveShip', {W : true})
        });
    
        this.input.keyboard.on('keyup-W', function()
        {
            // console.log("w 꺼짐 신호 전송!")
            self.socket.emit('moveShip', {W : false})
        });
    
        this.input.on('pointerdown', function (pointer) 
        {
            // console.log("pointerdown 신호 전송!")
            self.socket.emit('fireBullet', true)
        });
    
        this.input.on('pointerup', function (pointer) 
        {
            // console.log("pointerup 신호 전송!")
            self.socket.emit('fireBullet', false)
        });
    
    };
    
    update()
    {
        this.input.mousePointer.updateWorldPoint(this.cameras.main);
        var moX = this.input.activePointer.worldX;
        var moY = this.input.activePointer.worldY;
        this.socket.emit('rotateShip', {mouseX : moX, mouseY : moY})
    
        var playerNames = this.playerNames;
        this.players.getChildren().forEach(function (player) 
        {
            playerNames.getChildren().forEach(function (playerName)
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
    };
    
    displayMine(self, playerInfo) 
    {
        const player = self.physics.add.image(playerInfo.x, playerInfo.y, playerInfo.ship)
                        .setOrigin(0.5, 0.5).setDepth(1);
        player.playerId = playerInfo.playerId;
        self.players.add(player);
        self.myShip = player;
        // 카메라 팔로우 설정
        self.cameras.main.startFollow(player, true, 0.1, 0.1);
        const playerName = self.add.text(playerInfo.x, playerInfo.y - 70, playerInfo.playerName, {fontFamily: 'bebas', fontSize: '20px'}).setOrigin(0.5, 0.5);
        playerName.playerId = playerInfo.playerId;
        self.playerNames.add(playerName);
    }
    
    displayPlayer(self, playerInfo) 
    {
        const player = self.physics.add.image(playerInfo.x, playerInfo.y, playerInfo.ship).setOrigin(0.5, 0.5).setDepth(1);;
        player.playerId = playerInfo.playerId;
        self.players.add(player);
        const playerName = self.add.text(playerInfo.x, playerInfo.y - 70, playerInfo.playerName, {fontFamily: 'bebas', fontSize: '20px'}).setOrigin(0.5, 0.5);
        playerName.playerId = playerInfo.playerId;
        self.playerNames.add(playerName);
    }
    
    displayPlanet(self, planetList)
    {
        Object.keys(planetList).forEach(function (id) 
        {
            self.add.image(planetList[id].x, planetList[id].y, planetList[id].planet);
            // 행성 물리 테두리 확인
            // if(id == 0)
            // {
            //     self.physics.add.image(planetList[id].x, planetList[id].y, planetList[id].planet).setCircle(258);
            // }
            // else if(id == 1)
            // {
            //     self.physics.add.image(planetList[id].x, planetList[id].y, planetList[id].planet).setCircle(258);
            // }
            // else if(id == 2)
            // {
            //     self.physics.add.image(planetList[id].x, planetList[id].y, planetList[id].planet).setCircle(285, -2, 20);
            // }
            // else if(id == 3)
            // {
            //     self.physics.add.image(planetList[id].x, planetList[id].y, planetList[id].planet).setCircle(138, 2, 2);
            // }
        })
    }
    
    displayAsteroid(self, asteroidList)
    {
        Object.keys(asteroidList).forEach(function (id) 
        {
            const asteroid = self.physics.add.image(asteroidList[id].x, asteroidList[id].y, asteroidList[id].asteroid)
                            .setCircle(43);
            asteroid.id = asteroidList[id].id;
            self.asteroids.add(asteroid);
        })
    }
    
    addBullet(self, bulletInfo)
    {
        const bullet = self.physics.add.image(bulletInfo.x, bulletInfo.y, bulletInfo.bullet)
                    .setRotation(bulletInfo.rotation);
        bullet.id = bulletInfo.id;
        self.bullets.add(bullet);
    }
    
    updateBullet(self, bulletInfo)
    {
        self.bullets.getChildren().forEach(function (bullet)
        {
            if(bulletInfo.id === bullet.id)
            {
                bullet.setPosition(bulletInfo.x, bulletInfo.y);
            }
        })
    }
    
    destroyBullet(self, bulletId)
    {
        self.bullets.getChildren().forEach(function (bullet)
        {
            if(bulletId === bullet.id)
            {
                bullet.destroy();
            }
        })
    }
    
    hitBullet(self, bulletId)
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

    outPlayer(self, playerId)
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
                });
            }
        });
    }
    
    destroyPlayer(self, playerId)
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
                        self.explosionEffect(self, player);
                    }
                });
            }
        });
    }

    destroyMine(self)
    {
        self.myShip.destroy();
        self.playerNames.getChildren().forEach(function (playerName)
        {
            if(self.myShip.playerId === playerName.playerId)
            {
                playerName.destroy();
            }
        });
        self.explosionEffect(self, self.myShip);
        self.scene.stop('levelUp');
        self.scene.run('gameOver');
    }

    explosionEffect(self, player)
    {
        var explosion = self.add.image(player.x, player.y, 'explosion').setScale(1.5, 1.5);
        self.time.addEvent(
        {
            delay: 300,
            loop: false,
            callback: function(){explosion.destroy()}
        });
    }

    displayLeaderBoard(self, leaderBoard)
    {
        if(self.myShip)
        {
            self.scene.stop('leaderBoard');
            self.registry.set('leaderBoard', leaderBoard);
            self.scene.run('leaderBoard');
        }
    }

    displayStatus(self)
    {
        self.scene.stop('status');
        self.scene.run('status');
    }
}

export default playGame;

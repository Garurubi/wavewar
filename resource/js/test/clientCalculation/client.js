var playerList = {};

var config = 
{
    type: Phaser.AuTO,
    // 맵 영역크기 설정
    width: 1024,
    height: 1024,
    physics: 
    {
        default: 'arcade',
        arcade: 
        {
            debug: true, 
            gravity: { y: 0}
        }
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
    // 기본 공통 url을 세팅하고 그 하위경로에서 이미지들을 하나씩 불러옴
    this.load.setBaseURL('http://localhost:9999/static');

    this.load.image('space', 'image/background/background_sky3_l.png');
    this.load.image('baseShip', 'image/ship/spaceShips_0011.png');
    this.load.image('sniperShip', 'image/ship/spaceShips_003.png');
    this.load.image('sun', 'image/planet/sun2_l.png');
    this.load.image('earth', 'image/planet/simple_planet_23_l.png');
    this.load.image('bullet', 'image/laser/laserRed05.png');
}

function create()
{
    var self = this;
    this.socket = io();
    this.players = this.physics.add.group();
    self.physics.add.collider(this.players);

    this.socket.on('currentPlayerList', function (playerList)
    {
        Object.keys(playerList).forEach(function (id) 
        {
            addPlayer(self, playerList[id]);
            // displayPlayer(self, playerList[id]);
        });
    });

    this.socket.on('newPlayer', function (playerInfo) 
    {
        playerList[playerInfo.playerId] = playerInfo;
        addPlayer(self, playerInfo);
        // displayPlayer(self, playerInfo);
    });

    this.socket.on('outPlayer', function (playerId) 
    {
        delete playerList[playerId];
        self.players.getChildren().forEach(function (player) 
        {
            if (playerId === player.playerId) 
            {
                player.destroy();
            }
        });
    });

    this.socket.on('playerUpdates', function (playerInfo) 
    {
        playerList[playerInfo.playerId] = playerInfo;
        // Object.keys(playerList).forEach(function (id) 
        // {
        //     if (playerList[id].playerId === player.playerId) 
        //     {
        //         player.setRotation(playerList[id].rotation);
        //         player.setPosition(playerList[id].x, playerList[id].y);
        //     }
        // });
    });

    this.cursors = this.input.keyboard.addKeys('W');
    
    this.input.on('pointermove', function (pointer) 
    {
        self.socket.emit('rotateShip', {mouseX : pointer.x, mouseY : pointer.y})
    });
    
    this.input.keyboard.on('keydown-W', function()
    {
        console.log("w 누름 신호 전송!")
        self.socket.emit('moveShip', {W : true})
    });

    this.input.keyboard.on('keyup-W', function()
    {
        console.log("w 꺼짐 신호 전송!")
        self.socket.emit('moveShip', {W : false})
    });

    // this.playerList = this.physics.add.group();

    // planets = this.physics.add.staticGroup();
    // planets.create(256, 256, 'sun').setCircle(282);
    // planets.create(768, 768, 'earth').setCircle(172);
}

function update()
{
    this.players.getChildren().forEach((player) => 
    {
        const input = playerList[player.playerId].input;
        player.setRotation(Phaser.Math.Angle.Between(input.mouseX, input.mouseY, player.x, player.y) - Math.PI / 2);

        if(input.W)
        {
            this.physics.velocityFromRotation(player.rotation - Math.PI/2, 400, player.body.acceleration);
        }
        else
        {
            player.setAcceleration(0);
        }

        playerList[player.playerId].x = player.x;
        playerList[player.playerId].y = player.y;
        playerList[player.playerId].rotation = player.rotation;
    });
}

// function displayPlayer(self, playerInfo) 
// {
//     const player = self.add.sprite(playerInfo.x, playerInfo.y, playerInfo.ship).setOrigin(0.5, 0.5);
//     player.playerId = playerInfo.playerId;
//     self.players.add(player);
// }

function addPlayer(self, playerInfo) 
{
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, playerInfo.ship).setOrigin(0.5, 0.5);
    self.players.add(player);
    player.setDrag(50);
    player.setAngularDrag(100);
    player.setBounce(0.5, 0.5);
    player.setCollideWorldBounds(true);
    player.playerId = playerInfo.playerId;
    playerList[playerInfo.playerId] = playerInfo;
}

const game = new Phaser.Game(config);
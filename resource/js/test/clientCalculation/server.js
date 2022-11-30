var playerList = {};

var config = 
{
    type: Phaser.HEADLESS,
    width: 1024,
    height: 1024,
    backgroundColor: "#2d2d2d",
    autoFocus: false,
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
    this.load.image('baseShip', 'resource/image/ship/spaceShips_0011.png');
}

function create()
{
    this.players = this.physics.add.group();
    io.on('connect', (socket) => 
    {
        var self = this;
        console.log(socket.id + " 연결 완료되었습니다.")
        var x = Math.floor(Math.random() * 1024) + 50;
        var y = Math.floor(Math.random() * 1024) + 50;
        playerList[socket.id] = 
        {
            rotation: 0,
            x: x,
            y: y,
            playerId: socket.id,
            ship: 'baseShip',
            input: {
                mouseX: x,
                mouseY: y,
                W: false
            }
        };
        addPlayer(self, playerList[socket.id]);
        // 새로 접속한 유저에게 플레이어리스트 객체를 전송
        socket.emit('currentPlayerList', playerList);
        // 기존 접속 유저들에게 새로운 플레이어 객체를 전송
        socket.broadcast.emit('newPlayer', playerList[socket.id])

        socket.on('disconnect', (reason) => 
        {
            // phaser객체 삭제
            removePlayer(self, socket.id);
            // 리스트에서 삭제
            delete playerList[socket.id];
            // 전체 유저에게 연결 해제알림
            io.emit("outPlayer", socket.id);
            console.log(socket.id + " 연결 해제되었습니다.")
        });

        socket.on('moveShip', (inputData) => 
        {
            handlePlayerMove(self, socket.id, inputData);
            io.emit('playerUpdates', playerList[socket.id]);
        });
        
        socket.on('rotateShip', (inputData) => 
        {
            handlePlayerRotation(self, socket.id, inputData);
            io.emit('playerUpdates', playerList[socket.id]);
        })
    })
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
    // 맵 경계를 벗어날 경우 반대편에서 나타나게 설정
    // this.physics.world.wrap(this.players, 5);
    // io.emit('playerUpdates', playerList);
}

function handlePlayerRotation(self, playerId, input) 
{
    self.players.getChildren().forEach((player) => 
    {
        if (playerId === player.playerId) 
        {
            playerList[player.playerId].input.mouseX = input.mouseX;
            playerList[player.playerId].input.mouseY = input.mouseY;
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
        }
    });
}

function addPlayer(self, playerInfo) 
{
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, playerInfo.ship).setOrigin(0.5, 0.5);
    player.setDrag(50);
    player.setAngularDrag(100);
    player.setBounce(0.5, 0.5);
    player.setCollideWorldBounds(true);
    player.playerId = playerInfo.playerId;
    self.players.add(player);
}

function removePlayer(self, playerId) 
{
    self.players.getChildren().forEach((player) => 
    {
        if (playerId === player.playerId) 
        {
            player.destroy();
        }
    });
}

const game = new Phaser.Game(config);
window.gameLoaded();
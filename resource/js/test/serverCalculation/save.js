
// const socket = io.connect("http://localhost:9999/", {path: "/wavewar/enter", transport: ["websocket"]});

var config = 
{
    type: Phaser.HEADLESS,
    // 맵 영역크기 설정
    width: 1048,
    height: 1048,
    backgroundColor: "#2d2d2d",
    autoFocus: false,
    physics: 
    {
        default: 'arcade',
        arcade: 
        {
            debug: true, 
            // 맵에 중력 설정(기본적으로 아래에 적용)
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

var self;
var cursors;
var planets;
var isDown = false;
var mouseX = 0;
var mouseY = 0

var playerList = {};
var user;

var game = new Phaser.Game(config);

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
    // socket.on("connect", () => 
    // {
    //     playerList[socket.id] = 
    //     {
    //         rotation: 0,
    //         x: Math.floor(Math.random() * 1048) + 50,
    //         y: Math.floor(Math.random() * 1048) + 50,
    //         playerId: socket.id
    //     };
    // });

    // socket.on("disconnect", (reason) =>
    // {
    //     console.log(reason);
    //     divTag.innerHTML = "연결이 해제되었습니다.";
    // })

    // socket.on("inPlayer", )

    // socket.on("outPlayer", (plyerId) => 
    // {
    //     removePlayer(this, plyerId);
    // })

    this.playerList = this.physics.add.group();

    planets = this.physics.add.staticGroup();
    planets.create(256, 256, 'sun').setCircle(282);
    planets.create(768, 768, 'earth').setCircle(172);
    // earth.setCircle(this.body.halfWidth, 0, this.body.halfHeight - this.body.halfWidth);
    // this.physics.accelerateToObject(ship, sun, 30, 100, 100);
    // this.physics.accelerateToObject(ship, earth, 15, 100, 100);
    
    var Bullet = new Phaser.Class
    ({
        Extends: Phaser.GameObjects.Image,

        initialize:

        function Bullet (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');

            this.incX = 0;
            this.incY = 0;
            this.lifespan = 0;

            this.speed = Phaser.Math.GetSpeed(600, 1);
        },

        fire: function (x, y, self)
        {
            this.setActive(true);
            this.setVisible(true);

            //  Bullets fire from the middle of the screen to the given x/y
            this.setPosition(self.x, self.y);

            var angle = Phaser.Math.Angle.Between(x, y, self.x, self.y);

            this.setRotation(angle - Math.PI / 2);

            this.incX = Math.cos(angle);
            this.incY = Math.sin(angle);

            this.lifespan = 1000;
        },

        update: function (time, delta)
        {
            this.lifespan -= delta;

            this.x -= this.incX * (this.speed * delta);
            this.y -= this.incY * (this.speed * delta);

            if (this.lifespan <= 0)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }
    });

    bullets = this.add.group
    ({
        classType: Bullet,
        maxSize: 50,
        runChildUpdate: true // Bullet 객체의 update 메서드를 실행할것인지 여부
    });

    // 이미지에 물리적용(시작위치 좌표값 설정)
    self = this.physics.add.image(768, 256, 'baseShip').setDepth(1);
    // 속도를 0으로 감속시키는 수치
    self.setDrag(50);
    self.setAngularDrag(100)
    // 바운스시 x축 y축에 대한 속도변화값
    self.setBounce(0.5, 0.5);
    // 맵 경계를 바운스 할것인지
    self.setCollideWorldBounds(true);


    // 행성과 기체를 충돌하게 설정
    // this.physics.add.collider(ship, sun);
    this.physics.add.collider(self, planets);
    this.physics.add.collider(playerList, planets);

    // up, down, left, right, shift, space키 객체생성
    // cursors = this.input.keyboard.createCursorKeys();
    cursors = this.input.keyboard.addKeys('W,S,A,D');

    // pointerdown은 마우스 클릭할때
    this.input.on('pointerdown', function (pointer) 
    {
        isDown = true;
    });

    this.input.on('pointermove', function (pointer) 
    {
        mouseX = pointer.x;
        mouseY = pointer.y;
    });

    // 마우스 클릭버튼 뗄때
    this.input.on('pointerup', function (pointer) 
    {
        isDown = false;
    });
}

function update()
{
    self.setRotation(Phaser.Math.Angle.Between(mouseX, mouseY, self.x, self.y) - Math.PI / 2);
    
    if (cursors.W.isDown)
    {
        this.physics.velocityFromRotation(self.rotation - Math.PI/2, 400, self.body.acceleration);
    }
    else
    {
        self.setAcceleration(0);
    }

    if (isDown)
    {
        var bullet = bullets.get();
        if (bullet)
        {
            bullet.fire(mouseX, mouseY, self);
        }
    }
}

function addPlayer(self, playerInfo) 
{
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'baseShip').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    player.setDrag(50);
    player.setAngularDrag(100);
    player.setBounce(0.5, 0.5);
    player.setCollideWorldBounds(true);
    player.playerId = playerInfo.playerId;
    self.playerList.add(player);
}

function removePlayer(self, playerId) 
{
    self.playerList.getChildren().forEach((player) => 
    {
        if (playerId === player.playerId) 
        {
            player.destroy();
        }
    });
}
window.gameLoadded();
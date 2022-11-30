class gameStart extends Phaser.Scene
{
    constructor()
    {
        super({key: 'gameStart'});
    }

    create()
    {
        var self = this;
        // let x = this.cameras.main.width / 2;
        // let y = this.cameras.main.height / 2;

        const { width, height } = this.sys.game.config;
        let x = width / 2;
        let y = height / 2;
        let replayName = this.registry.get('playerName');
        if(replayName)
        {
            self.selectShip(self, x, y, replayName);
        }
        else
        {
            let logo = this.add.image(x, y - 200, 'wavewar-logo').setOrigin(0.5, 0.5).setScale(1.5, 1.5);
            let rectangle = this.add.rectangle(x, y + 100, 700, 250, 0x000000, 0.7).setInteractive({ cursor: 'url(static/image/background/cursor_hand.png), pointer' });
            let nameTitle = this.add.text(rectangle.x, rectangle.y - 65, '플레이어 이름을 입력하세요!', { fontFamily: 'bebas', fontSize: 50, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5, 0.5);
            var element = this.add.dom(rectangle.x, rectangle.y + 35).createFromCache('nameform').addListener('click');
            
            let warnText;
            element.on('click', function (event) 
            {
                if(event.target.name === 'inputButton')
                {
                    var inputText = this.getChildByName('playerName');
                    if(inputText.value !== '')
                    {
                        this.removeListener('click');
                        this.setVisible(false);
                        rectangle.setVisible(false);
                        nameTitle.setVisible(false);
                        logo.setVisible(false);
                        if(warnText)
                        {
                            warnText.setVisible(false);
                        }
    
                        self.selectShip(self, x, y, inputText.value);
                    }
                    else
                    {
                        if(!warnText)
                        {
                            warnText = self.add.text(rectangle.x, rectangle.y + 85, '플레이어 이름을 입력해주세요.', { fontFamily: 'bebas', fontSize: 20, color: '#cc0000' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5, 0.5);
                        }
                    }
                }
            });
        }
    }

    selectShip(self, x, y, playerName)
    {
        this.add.text(x, y - 250, '기체를 선택하세요!', { fontFamily: 'bebas', fontSize: 50, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5, 0.5);
        var rectangle1 = this.add.rectangle(x - 300, y, 250, 300, 0x000000, 0.7).setInteractive({ cursor: 'url(static/image/background/cursor_hand.png), pointer' });
        var rectangle2 = this.add.rectangle(x, y, 250, 300, 0x000000, 0.7).setInteractive({ cursor: 'url(static/image/background/cursor_hand.png), pointer' });
        var rectangle3 = this.add.rectangle(x + 300, y, 250, 300, 0x000000, 0.7).setInteractive({ cursor: 'url(static/image/background/cursor_hand.png), pointer' });
        this.add.image(rectangle1.x, rectangle1.y - 30, 'baseShip').setOrigin(0.5, 0.5).setScale(1.5, 1.5).setDepth(2);
        this.add.image(rectangle2.x, rectangle2.y - 30, 'heavyShip').setOrigin(0.5, 0.5).setScale(1.5, 1.5).setDepth(2);
        this.add.image(rectangle3.x, rectangle3.y - 30, 'sniperShip').setOrigin(0.5, 0.5).setScale(1.5, 1.5).setDepth(2);
        this.add.text(rectangle1.x, rectangle1.y + 100, 'BaseShip', { fontFamily: 'bebas', fontSize: 30, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5, 0.5);
        this.add.text(rectangle2.x, rectangle2.y + 100, 'HeavyShip', { fontFamily: 'bebas', fontSize: 30, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5, 0.5);
        this.add.text(rectangle3.x, rectangle3.y + 100, 'SniperShip', { fontFamily: 'bebas', fontSize: 30, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5, 0.5);

        var socket = self.registry.get('socket')
        rectangle1.on('pointerdown', function()
        {
            socket.emit('selectShip', {shipSort: 'baseShip', shipSortNum: 1, playerName: playerName})   
            self.scene.stop('gameStart');
        })
        rectangle2.on('pointerdown', function()
        {
            socket.emit('selectShip', {shipSort: 'heavyShip', shipSortNum: 2, playerName: playerName})   
            self.scene.stop('gameStart');
        })
        rectangle3.on('pointerdown', function()
        {
            socket.emit('selectShip', {shipSort: 'sniperShip', shipSortNum: 3, playerName: playerName})   
            self.scene.stop('gameStart');
        })
    }
}

export default gameStart;
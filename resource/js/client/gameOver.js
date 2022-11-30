class gameOver extends Phaser.Scene
{
    constructor()
    {
        super({key: 'gameOver'});
    }

    create()
    {
        let self = this;
        let x = this.cameras.main.width / 2;
        let y = this.cameras.main.height / 2;

        let rectangle = this.add.rectangle(x, y, 640, 500, 0x000000, 0.7);
        this.add.text(rectangle.x, rectangle.y - 180, 'GAME OVER!', { fontFamily: 'bebas', fontSize: 80, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5, 0.5);
        this.add.text(rectangle.x, rectangle.y - 100, '초 뒤에 종료됩니다.', { fontFamily: 'bebas', fontSize: 26, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5);
        this.reloadTime = 10;
        this.count = this.add.text(rectangle.x - 130, rectangle.y - 100, this.reloadTime, { fontFamily: 'bebas', fontSize: 26, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5);
        this.time.addEvent(
        {
            delay: 10100,
            loop: false,
            callback: function(){window.location.reload();}
        });
        this.showDeathInfo(rectangle.x, rectangle.y);


        // 카운트 다운시 사용하는 변수
        this.once = 1;
        let domBtn = '<input type="button" name="replayBtn" value="다시 시작" style="font-size: 20px">';
        let element = this.add.dom(rectangle.x, rectangle.y + 200).createFromHTML(domBtn).addListener('click');
        element.on('click', function(event)
        {
            self.scene.run('gameStart');
            self.scene.stop('gameOver');
        })
    }

    update(time)
    {
        this.currentTime = time;
        if(this.once-- === 1)
        {
            this.beforeTime = time;
        }
        if((this.currentTime - this.beforeTime) >= 1000)
        {
            this.count.setText(--this.reloadTime);
            this.beforeTime = this.currentTime;
        }
    }

    showDeathInfo(x, y)
    {
        let tempX = x - 70;
        let tempY = y - 40;
        let myStatus = this.registry.get('myStatus');
        let playerName = this.registry.get('playerName');
        this.add.image(tempX, tempY, myStatus.ship + 'Icon').setScale(2, 2).setOrigin(0.5, 0.5);
        this.add.text(tempX + 100, tempY, playerName, { fontFamily: 'bebas', fontSize: 30, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5, 0.5);
        this.add.text(tempX, tempY + 60,  'level           : ' + myStatus.level, { fontFamily: 'bebas', fontSize: 20, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0, 0.5);
        this.add.text(tempX, tempY + 100, 'attSpeed     : ' + myStatus.attSpeed, { fontFamily: 'bebas', fontSize: 20, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0, 0.5);
        this.add.text(tempX, tempY + 140, 'range         : ' + myStatus.range, { fontFamily: 'bebas', fontSize: 20, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0, 0.5);
        this.add.text(tempX, tempY + 180, 'moveSpeed : ' + myStatus.moveSpeed, { fontFamily: 'bebas', fontSize: 20, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0, 0.5);
        // this.add.text(tempX + 20, tempY + 90,  'hp             : ' + myStatus.hp, { fontFamily: 'bebas', fontSize: 20, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0, 0.5);
    }
}

export default gameOver;
class levelUp extends Phaser.Scene
{
    constructor()
    {
        super({key: 'levelUp'});
    }

    create()
    {
        console.log('레벨업 Scene!')
        var self = this;
        const width = this.sys.game.config.width;
        var x = width/2;
        var levelUpText = this.add.text(x, 250, 'levelUp!', { fontFamily: 'bebas', fontSize: 60, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5, 0.5);
        this.time.addEvent(
        {
            delay: 2000,
            loop: false,
            callback: function(){levelUpText.destroy();}
        });
        var abilities1 = [];
        var abilities2 = [];
        this.createAbility(this, abilities1, abilities2);
        // 사거리, 이동속도, 기체강화, 체력증가, 공격속도증가
        var rectangle1 = this.add.rectangle(x - 85, 100, 150, 150, 0x000000, 0.7).setInteractive({ cursor: 'url(static/image/background/cursor_hand.png), pointer' });
        var rectangle2 = this.add.rectangle(x + 85, 100, 150, 150, 0x000000, 0.7).setInteractive({ cursor: 'url(static/image/background/cursor_hand.png), pointer' });
        this.showChoice(x, rectangle1, rectangle2, Phaser.Utils.Array.GetRandom(abilities1), Phaser.Utils.Array.GetRandom(abilities2), self);
        
    }

    createAbility(self, abilities1, abilities2)
    {
        var hpUp1 = self.add.image(0, 0, 'hpUp').setOrigin(0.5, 0.5).setScale(2, 2).setDepth(2).setVisible(false);
        hpUp1.textName = '체력 증가';
        var hpUp2 = self.add.image(0, 0, 'hpUp').setOrigin(0.5, 0.5).setScale(2, 2).setDepth(2).setVisible(false);
        hpUp2.textName = '체력 증가';
        abilities1.push(hpUp1);
        abilities2.push(hpUp2);
        var moveSpeed1 = self.add.image(0, 0, 'moveSpeedUp').setOrigin(0.5, 0.5).setScale(2, 2).setDepth(2).setVisible(false);
        moveSpeed1.textName = '이동속도 증가';
        var moveSpeed2 = self.add.image(0, 0, 'moveSpeedUp').setOrigin(0.5, 0.5).setScale(2, 2).setDepth(2).setVisible(false);
        moveSpeed2.textName = '이동속도 증가';
        abilities1.push(moveSpeed1);
        abilities2.push(moveSpeed2);
        var rangeUp1 = self.add.image(0, 0, 'rangeUp').setOrigin(0.5, 0.5).setScale(2, 2).setDepth(2).setVisible(false);
        rangeUp1.textName = '사거리 증가';
        var rangeUp2 = self.add.image(0, 0, 'rangeUp').setOrigin(0.5, 0.5).setScale(2, 2).setDepth(2).setVisible(false);
        rangeUp2.textName = '사거리 증가';
        abilities1.push(rangeUp1);
        abilities2.push(rangeUp2);
        var attackSpeedUp1 = self.add.image(0, 0, 'attackSpeedUp').setOrigin(0.5, 0.5).setScale(2, 2).setDepth(2).setVisible(false);
        attackSpeedUp1.textName = '공격속도 증가';
        var attackSpeedUp2 = self.add.image(0, 0, 'attackSpeedUp').setOrigin(0.5, 0.5).setScale(2, 2).setDepth(2).setVisible(false);
        attackSpeedUp2.textName = '공격속도 증가';
        abilities1.push(attackSpeedUp1);
        abilities2.push(attackSpeedUp2);
    }

    showChoice(x, rectangle1, rectangle2, ability1, ability2, self)
    {
        let socket = self.registry.get('socket');
        let myStatus = self.registry.get('myStatus');
        myStatus.level++;
        rectangle1.on('pointerdown', function()
        {
            var abilitySort = ability1.textName;
            if(abilitySort === '체력 증가')
            {
                socket.emit('hpUP', true);
                myStatus.hp += 1;
            }
            else if(abilitySort === '이동속도 증가')
            {
                socket.emit('moveSpeedUp', true);
                myStatus.moveSpeed += 1;
            }
            else if(abilitySort === '사거리 증가')
            {
                socket.emit('rangeUp', true);
                myStatus.range += 1;
            }
            else if(abilitySort === '공격속도 증가')
            {
                socket.emit('attackSpeedUp', true);
                myStatus.attSpeed += 1;
            }
            self.registry.set('myStatus', myStatus);
            self.scene.run('status');
            self.scene.stop('levelUp');
        })
        rectangle2.on('pointerdown', function()
        {
            var abilitySort = ability2.textName;
            if(abilitySort === '체력 증가')
            {
                socket.emit('hpUP', true);
                myStatus.hp += 1;
            }
            else if(abilitySort === '이동속도 증가')
            {
                socket.emit('moveSpeedUp', true);
                myStatus.moveSpeed += 1;
            }
            else if(abilitySort === '사거리 증가')
            {
                socket.emit('rangeUp', true);
                myStatus.range += 1;
            }
            else if(abilitySort === '공격속도 증가')
            {
                socket.emit('attackSpeedUp', true);
                myStatus.attSpeed += 1;
            }
            self.registry.set('myStatus', myStatus);
            self.scene.run('status');
            self.scene.stop('levelUp');
        })
        ability1.setPosition(rectangle1.x, 80).setVisible(true);
        this.add.text(rectangle1.x, 135, ability1.textName, { fontFamily: 'bebas', fontSize: 15, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5, 0.5);
        ability2.setPosition(rectangle2.x , 80).setVisible(true);
        this.add.text(rectangle2.x, 135, ability2.textName, { fontFamily: 'bebas', fontSize: 15, color: '#ffffff' }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5, 0.5);
    }
}

export default levelUp;
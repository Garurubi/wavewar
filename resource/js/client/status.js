class status extends Phaser.Scene
{
    constructor()
    {
        super({key: 'status'});
    }

    create()
    {       
        let myStatus = this.registry.get('myStatus');

        this.createContent(0, 20, myStatus.hp, '체력', 'hpIcon');
        this.createContent(0, 50, myStatus.attSpeed, '공격속도', 'attSpeedIcon');
        this.createContent(0, 80, myStatus.range, '사거리', 'rangeIcon');
        this.createContent(0, 110, myStatus.moveSpeed, '이동속도', 'moveSpeedIcon');
    }
    
    createContent(x, y, roopCount, name, iconName)
    {
        let title = this.add.text(x + 10, y, name, { fontFamily: 'Arial', fontSize: 15, color: '#ffffff' }).setOrigin(0, 0.5);
        let num = title.x + 80;
        for(let i=0; i<roopCount; i++)
        {
            this.add.image(num, y, iconName).setOrigin(0.5, 0.5).setScale(0.7, 0.7);
            num += 25;
        }
    }
}

export default status;
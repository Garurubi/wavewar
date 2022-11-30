class leaderBoard extends Phaser.Scene
{
    constructor()
    {
        super({key: 'leaderBoard'});
    }

    create()
    {
        let x = this.cameras.main.width;
        let y = this.cameras.main.height;

        let rectangle = this.add.rectangle(x - 150, 150, 300, 300, 0x000000, 0.7);
        this.createContent(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    }
    
    createContent(x, y, width, height)
    {
        let title = this.add.text(x, y - height/2 + 20, 'Leader Board', { fontFamily: 'Arial', fontSize: 20, color: '#ffffff' }).setOrigin(0.5, 0.5);
        let leaderBoard = this.registry.get('leaderBoard');
        let max = leaderBoard.length > 8 ? 8 : leaderBoard.length;
     
        let tmp = 40;
        let rank = 1;
        let tmpX = x - width/2;
        for(let i=0; i<max; i++)
        {
            let rankInfo = leaderBoard[i];
            let tmpY = title.y + tmp;
            this.add.text(tmpX + 30, tmpY, '#'+ rank++, { fontFamily: 'Arial', fontSize: 20, color: '#ffffff' }).setOrigin(0.5, 0.5);
            this.add.text(tmpX + 110, tmpY, rankInfo.playerName, { fontFamily: 'Arial', fontSize: 15, color: '#ffffff' }).setOrigin(0.5, 0.5);
            this.add.text(tmpX + 200, tmpY, rankInfo.level, { fontFamily: 'Arial', fontSize: 15, color: '#ffffff' }).setOrigin(0.5, 0.5);
            this.add.image(tmpX + 270, tmpY, rankInfo.ship + 'Icon');
            // if(rankInfo.sortNum === 1)
            // {
            //     this.add.image(tmpX + 270, tmpY, 'icon1');
            // }
            // else if(rankInfo.sortNum === 2)
            // {
            //     this.add.image(tmpX + 270, tmpY, 'icon2');
            // }
            // else if(rankInfo.sortNum === 3)
            // {
            //     this.add.image(tmpX + 270, tmpY, 'icon3');
            // }
            tmp += 30;
        }
    }   
}

export default leaderBoard;
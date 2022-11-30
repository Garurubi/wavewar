class miniMap extends Phaser.Scene
{
    constructor()
    {
        super({key: 'miniMap'});
    }

    create()
    {   
        let x = this.cameras.main.width;
        let y = this.cameras.main.height;

        let myInfo = this.registry.get('MiniMapInfo').myPlayerInfo;
        let playerList = this.registry.get('MiniMapInfo').playerList;

        this.miniMap = this.cameras.add(x-300, y-200, 300, 200).setZoom(0.1).setName('mini');
        this.miniMap.setBackgroundColor(0x000000);
        // this.add.tileSprite(x-300, miniMap.y-200, 300, 200, "space1").setScrollFactor(0).setOrigin(0, 0);
        this.cameras.main.visible = false;

        this.miniMapGroup = this.add.group();
        this.player = this.add.image(myInfo.x, myInfo.y, 'miniMapPoint').setScale(3, 3).setOrigin(0.5, 0.5);
        this.miniMapGroup.add(this.player);
        this.player.playerId = myInfo.playerId;
        this.miniMap.startFollow(this.player, true);

        this.currentPlayer(playerList);
    }
    
    updatePlayer(playerList)
    {
        let group = this.miniMapGroup;
        Object.keys(playerList).forEach(function (id) 
        {
            group.getChildren().forEach(function (player) 
            {
                if (playerList[id].playerId === player.playerId) 
                {
                    player.setPosition(playerList[id].x, playerList[id].y);
                }
            });
        });
    }

    currentPlayer(playerList)
    {
        let self = this;
        Object.keys(playerList).forEach(function (id) 
        {
            if(self.player.playerId !== playerList[id].playerId)
            {
                self.displayPlayer(playerList[id]);
            }
        });
    }

    newPlayer(playerInfo)
    {
        console.log('미니맵 새로운 플레이어');
        this.displayPlayer(playerInfo);
    }

    outPlayer(playerId)
    {
        this.miniMapGroup.getChildren().forEach(function (player) 
        {
            if (playerId === player.playerId) 
            {
                player.destroy();
            }
        });
    }

    displayPlayer(playerInfo)
    {
        let player = this.add.image(playerInfo.x, playerInfo.y, 'miniMapPoint').setScale(3, 3).setOrigin(0.5, 0.5).setTint(0xCC0000);
        this.miniMapGroup.add(player);
        player.playerId = playerInfo.playerId;
    }
}

export default miniMap;
class bullet extends Phaser.GameObjects.Image
{
    constructor(scene)
    {
        super({key: 'bullet'});

        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'baseLaser');

        this.id = null;
        this.playerId = null;
        this.incX = 0;
        this.incY = 0;
        this.lifespan = 0;

        this.speed = Phaser.Math.GetSpeed(600, 1);
    }

    fire(playerInfo)
    {
        this.setActive(true);
        this.setVisible(true);

        //  Bullets fire from the middle of the screen to the given x/y
        this.setPosition(playerInfo.x, playerInfo.y);

        var angle = Phaser.Math.Angle.Between(playerInfo.input.mouseX, playerInfo.input.mouseY, playerInfo.x, playerInfo.y);

        this.setRotation(angle - Math.PI / 2);

        this.incX = Math.cos(angle);
        this.incY = Math.sin(angle);
    }

    update(time, delta)
    {
        // var io = this.registry.get('io');
        this.lifespan -= delta;

        this.x -= this.incX * (this.speed * delta);
        this.y -= this.incY * (this.speed * delta);

        if (this.lifespan <= 0)
        {
            io.emit('destroyBullet', this.id);
            // delete bulletList[this.id];
            this.destroy();
        }
        io.emit('updateBullet', {id: this.id, x: this.x, y: this.y});
    }
}

export default bullet;
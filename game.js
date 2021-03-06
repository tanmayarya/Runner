let game;
let clock;
let timer;
let gameConfig;

let gameOptions = {
    coinValue: 1,
    platformSpeedRange: [300, 300],
    mountainSpeed: 80,
    spawnRange: [80, 300],
    platformSizeRange: [150, 300],
    platformHeightRange: [-5, 5],
    platformHeighScale: 20,
    platformVerticalLimit: [0.4, 0.8],
    playerGravity: 900,
    jumpForce: 400,
    playerStartPosition: 200,
    jumps: 2,
    coinPercent: 50,
    questionPercent: 25,
    score: 0
}

window.onload = function() {

     gameConfig = {
        type: Phaser.AUTO,
        width: 1334,
        height: 750,
        scene: [preloadGame, playGame],
        backgroundColor: 0x0c88c7,

        physics: {
            default: "arcade"
        }
        
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
    resize();
    window.addEventListener("resize", resize, false);
}

class preloadGame extends Phaser.Scene{
    constructor(){
        super("PreloadGame");
    }
    preload(){
        this.load.plugin('rexclockplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexclockplugin.min.js', true);
        this.load.image("platform", "platform.png");

        this.load.spritesheet("player", "dude.png", {
            frameWidth: 32,
            frameHeight: 48
        });

        this.load.spritesheet("coin", "coin.png", {
            frameWidth: 20,
            frameHeight: 20
        });

        this.load.image("question", "ques.png");

        this.load.spritesheet("mountain", "mountain.png", {
            frameWidth: 512,
            frameHeight: 512
        });
        // 

    }
    create(){
        
        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("player", {
                start: 5,
                end: 8
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "rotate",
            frames: this.anims.generateFrameNumbers("coin", {
                start: 0,
                end: 5
            }),
            frameRate: 15,
            yoyo: true,
            repeat: -1
        });

        

        this.scene.start("PlayGame");
    }
}

class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");

    }
    create(){
        clock = this.plugins.get('rexclockplugin').add(this, gameConfig);
        clock.start();

        timer = this.time.addEvent({
            delay: 1000,                // ms
            callback: () => {
                this.timmerValue = this.millisToMinutesAndSeconds(clock.now);
                this.timerText.setText('Time: ' + this.timmerValue);
                console.log();
            },
            //args: [],
            // callbackScope: thisArg,
            loop: true
        });
        this.coinsValue = gameOptions.score;
        this.timmerValue = this.millisToMinutesAndSeconds(clock.now);
        this.timerText = this.add.text(1100, 16, 'Time: 00:00', { fontSize: '32px', fill: '#000' });
        this.scoreText = this.add.text(16, 16, 'coins: 0', { fontSize: '32px', fill: '#000' });
       
        this.mountainGroup = this.add.group();

        this.platformGroup = this.add.group({

            removeCallback: function(platform){
                platform.scene.platformPool.add(platform)
            }
        });

        this.platformPool = this.add.group({

            removeCallback: function(platform){
                platform.scene.platformGroup.add(platform)
            }
        });

        this.coinGroup = this.add.group({

            removeCallback: function(coin){
                coin.scene.coinPool.add(coin)
            }
        });

        this.coinPool = this.add.group({

            removeCallback: function(coin){
                coin.scene.coinGroup.add(coin)
            }
        });

        this.questionGroup = this.add.group({

            removeCallback: function(question){
                question.scene.questionPool.add(question)
            }
        });

        this.questionPool = this.add.group({

            removeCallback: function(question){
                question.scene.questionGroup.add(question)
            }
        });

        this.addMountains()

        this.addedPlatforms = 0;

        this.playerJumps = 0;

        this.addPlatform(game.config.width, game.config.width / 2, game.config.height * gameOptions.platformVerticalLimit[1]);

        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height * 0.7, "player");
        this.player.setGravityY(gameOptions.playerGravity);
        this.player.setDepth(2);

        this.dying = false;

        this.platformCollider = this.physics.add.collider(this.player, this.platformGroup, function(){

            if(!this.player.anims.isPlaying){
                this.player.anims.play("run");
            }
        }, null, this);

        this.physics.add.overlap(this.player, this.coinGroup, function(player, coin){

            this.tweens.add({
                targets: coin,
                y: coin.y - 100,
                alpha: 0,
                duration: 800,
                ease: "Cubic.easeOut",
                callbackScope: this,
                onComplete: function(){
                    this.coinGroup.killAndHide(coin);
                    this.coinGroup.remove(coin);
                    
                    
                }
            });
            coin.disableBody(true, true);
            this.updateScore(gameOptions.coinValue);


        }, null, this);

        this.physics.add.overlap(this.player, this.questionGroup, function(player, question){
            question.disableBody(true, true);
            this.dispQuestion();

        }, null, this);

        this.input.on("pointerdown", this.jump, this);
    }

    updateScore(val){
        this.coinsValue += val;
        if(this.coinsValue < 0){
            this.scoreText.setText('coins: 0');
        }else{
            this.scoreText.setText('coins: ' + this.coinsValue);
        }
    }

    

    dispQuestion(){
        this.scene.pause();
        manageQuestion(this);
    }

    addMountains(){
        let rightmostMountain = this.getRightmostMountain();
        if(rightmostMountain < game.config.width * 2){
            let mountain = this.physics.add.sprite(rightmostMountain + Phaser.Math.Between(100, 350), game.config.height + Phaser.Math.Between(0, 100), "mountain");
            mountain.setOrigin(0.5, 1);
            mountain.body.setVelocityX(gameOptions.mountainSpeed * -1)
            this.mountainGroup.add(mountain);
            if(Phaser.Math.Between(0, 1)){
                mountain.setDepth(1);
            }
            mountain.setFrame(Phaser.Math.Between(0, 3))
            this.addMountains()
        }
    }

    getRightmostMountain(){
        let rightmostMountain = -200;
        this.mountainGroup.getChildren().forEach(function(mountain){
            rightmostMountain = Math.max(rightmostMountain, mountain.x);
        })
        return rightmostMountain;
    }

    addPlatform(platformWidth, posX, posY){
        this.addedPlatforms ++;
        let platform;
        if(this.platformPool.getLength()){
            platform = this.platformPool.getFirst();
            platform.x = posX;
            platform.y = posY;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform);
            let newRatio =  platformWidth / platform.displayWidth;
            platform.displayWidth = platformWidth;
            platform.tileScaleX = 1 / platform.scaleX;
        }
        else{
            platform = this.add.tileSprite(posX, posY, platformWidth, 32, "platform");
            this.physics.add.existing(platform);
            platform.body.setImmovable(true);
            platform.body.setVelocityX(Phaser.Math.Between(gameOptions.platformSpeedRange[0], gameOptions.platformSpeedRange[1]) * -1);
            platform.setDepth(2);
            this.platformGroup.add(platform);
        }
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);

        if(this.addedPlatforms > 1){

            if(Phaser.Math.Between(1, 100) <= gameOptions.coinPercent){
                if(this.coinPool.getLength()){
                    let coin = this.coinPool.getFirst();
                    coin.x = posX;
                    coin.y = posY - 96;
                    coin.alpha = 1;
                    coin.active = true;
                    coin.visible = true;
                    this.coinPool.remove(coin);
                }
                else{
                    let coin = this.physics.add.sprite(posX, posY - 96, "coin");
                    coin.setImmovable(true);
                    coin.setVelocityX(platform.body.velocity.x);
                    coin.anims.play("rotate");
                    coin.setDepth(2);
                    this.coinGroup.add(coin);
                }
            }

            if(Phaser.Math.Between(1, 100) <= gameOptions.questionPercent){
                if(this.questionPool.getLength()){
                    let question = this.questionPool.getFirst();
                    question.x = posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth);
                    question.y = posY - 46;
                    question.alpha = 1;
                    question.active = true;
                    question.visible = true;
                    this.questionPool.remove(question);
                }
                else{
                    let question = this.physics.add.sprite(posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth), posY - 46, "question");
                    question.setImmovable(true);
                    question.setVelocityX(platform.body.velocity.x);
                    question.setSize(8, 2, true)
                    question.setDepth(2);
                    this.questionGroup.add(question);
                }
            }
        }
    }
    jump(){
        if((!this.dying) && (this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps))){
            if(this.player.body.touching.down){
                this.playerJumps = 0;
            }
            this.player.setVelocityY(gameOptions.jumpForce * -1);
            this.playerJumps ++;

            this.player.anims.stop();
        }
    }

    update(){
        if(this.player.y > game.config.height || this.coinsValue < 0){
            this.gameOver();
            // this.scene.start("PlayGame");
        }

        this.player.x = gameOptions.playerStartPosition;

        let minDistance = game.config.width;
        let rightmostPlatformHeight = 0;
        this.platformGroup.getChildren().forEach(function(platform){
            let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            if(platformDistance < minDistance){
                minDistance = platformDistance;
                rightmostPlatformHeight = platform.y;
            }
            if(platform.x < - platform.displayWidth / 2){
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);

        this.coinGroup.getChildren().forEach(function(coin){
            if(coin.x < - coin.displayWidth / 2){
                this.coinGroup.killAndHide(coin);
                this.coinGroup.remove(coin);
            }
        }, this);

        this.questionGroup.getChildren().forEach(function(question){
            if(question.x < - question.displayWidth / 2){
                this.questionGroup.killAndHide(question);
                this.questionGroup.remove(question);
            }
        }, this);

        this.mountainGroup.getChildren().forEach(function(mountain){
            if(mountain.x < - mountain.displayWidth){
                let rightmostMountain = this.getRightmostMountain();
                mountain.x = rightmostMountain + Phaser.Math.Between(100, 350);
                mountain.y = game.config.height + Phaser.Math.Between(0, 100);
                mountain.setFrame(Phaser.Math.Between(0, 3))
                if(Phaser.Math.Between(0, 1)){
                    mountain.setDepth(1);
                }
            }
        }, this);

        if(minDistance > this.nextPlatformDistance){
            let nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
            let platformRandomHeight = gameOptions.platformHeighScale * Phaser.Math.Between(gameOptions.platformHeightRange[0], gameOptions.platformHeightRange[1]);
            let nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;
            let minPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[0];
            let maxPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[1];
            let nextPlatformHeight = Phaser.Math.Clamp(nextPlatformGap, minPlatformHeight, maxPlatformHeight);
            this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2, nextPlatformHeight);
        }
    }

    gameOver(){
        this.scene.pause();
        if(this.coinsValue<0) {
            this.coinsValue = 0;
        }
        displayResult(this.coinsValue,this.timmerValue,this);
    }

    millisToMinutesAndSeconds(millis) {
        let minutes = Math.floor(millis / 60000);
        let seconds = ((millis % 60000) / 1000).toFixed(0);
        return (seconds == 60 ? (minutes+1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
    }
};
function resize(){
    let canvas = document.querySelector("canvas");
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowRatio = windowWidth / windowHeight;
    let gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}

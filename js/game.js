const Game = {
    title: 'Rainbow Island',
    author: 'Cristian Viñuales & Laura del Toro',
    license: null,
    version: '1.0.0',
    canvasDom: undefined,
    ctx: undefined,
    FPS: 60,
    intervalId: undefined,
    framesCounter: 0,
    maxFrames: 20000,

    canvasSize: {
        w: undefined,
        h: undefined
    },
    keys: {
        SPACE: 32,
        LEFT: 37,
        RIGHT: 39,
        XKey: 88
    },
    cameraVelocity: 10,
    background: undefined,
    player: undefined,
    higherPlayerPosition: 300,
    map: undefined,
    mapCols: 20,
    mapRows: 40,
    mapTSize: undefined,
    actualRainbowCollissionY: undefined,
    enemies: [],
    enemiesSources: ["images/floor-enemie-1.png", "images/floor-enemie-2.png"],
    starterEnemieVel: [1, -1, 2, -2],
    basePosition: {
        y: undefined,
        x: undefined
    },
    platformCollision: false,
    initGame(id) {
        this.canvasDom = document.getElementById(id)
        this.ctx = this.canvasDom.getContext('2d')
        this.setDimensions()
        this.startGame()
    },
    setDimensions() {
        this.canvasSize.w = window.innerWidth
        this.canvasSize.h = window.innerHeight
        this.mapTSize = this.canvasSize.w / this.mapCols
        this.basePosition.y = this.canvasSize.h - this.mapTSize * 2
        this.canvasDom.setAttribute('width', this.canvasSize.w)
        this.canvasDom.setAttribute('height', this.canvasSize.h)
    },

    startGame() {
        this.background = new Background(this.ctx, this.canvasSize, "images/skybackground.jpeg")
        this.map = new Map(this.ctx, this.mapCols, this.mapRows, this.mapTSize, this.canvasSize, this.higherPlayerPosition, this.cameraVelocity, "images/21-tileset.png")
        this.map.createMapImage()
        this.player = new Player(this.ctx, this.canvasSize, this.basePosition.y, "images/running-bothsides.png", 16, this.keys, this.cameraVelocity)
        //this.enemies.push(new FloorEnemie(this.ctx, "images/floor-enemie-2.png", 2, this.framesCounter, 400, this.canvasSize.w / 20 * 1, 100, 90, 1, 1, this.canvasSize.w, 0), new FloorEnemie(this.ctx, "images/floor-enemie-1.png", 2, this.framesCounter, 400, this.basePosition.y, 70, 70, -1, 1, this.canvasSize.w, 0))

        this.background.createBackground()
        this.player.createImgPlayer()
        this.enemies.forEach(enemie => enemie.createImgEnemie())


        this.intervalId = setInterval(() => {
            this.clearGame()
            this.background.drawBackground()
            this.map.drawMap(this.player)
            this.generateRandomEnemie()
            this.player.drawPlayer(this.framesCounter, this.higherPlayerPosition)
            this.enemies.forEach(enemie => enemie.drawFloorEnemie(this.framesCounter))
            //this.isCollidingEnemies() ? console.log("colliding with enemie") : null
            this.player.playerVelocity.y < 0 ? this.player.isFalling = true : this.player.isFalling = false
            this.managePlayerCollisionWithPlatforms(this.canvasSize.w / 20)
            this.manageEnemiesCollisonWithPlatforms()
            this.managePlayerRainbowCollissions()
            this.manageEnemiesRainbowCollission()
            this.framesCounter > this.maxFrames ? this.framesCounter = 0 : this.framesCounter++

        }, 1000 / this.FPS)
    },
    endGame() {
        clearInterval(this.intervalId)
    },
    clearGame() {
        this.ctx.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h)
    },
    isCollidingRainbows(characterPosition, characterSize) {
        return this.player.rainbowsConstructed.some(rainbow => {
            if (rainbow.actualRainbowDirection === "right") {
                if (
                    characterPosition.x + characterSize.w - 20 >= rainbow.rainbowPosition.facingRigth.x &&
                    characterPosition.y + characterSize.h >= rainbow.rainbowPosition.facingRigth.y &&
                    characterPosition.x <= rainbow.rainbowPosition.facingRigth.x + rainbow.rainbowSize.w &&
                    characterPosition.y < rainbow.rainbowPosition.facingRigth.y + rainbow.rainbowSize.h
                ) {
                    this.actualRainbowCollissionY = rainbow.rainbowPosition.facingRigth.y
                    return true
                }
            } else if (rainbow.actualRainbowDirection === "left") {
                if (
                    characterPosition.x + characterSize.w >= rainbow.rainbowPosition.facingLeft.x - rainbow.rainbowSize.w &&
                    characterPosition.y + characterSize.h >= rainbow.rainbowPosition.facingLeft.y &&
                    characterPosition.x <= rainbow.rainbowPosition.facingLeft.x - 20 &&
                    characterPosition.y < rainbow.rainbowPosition.facingLeft.y + rainbow.rainbowSize.h
                ) {
                    this.actualRainbowCollissionY = rainbow.rainbowPosition.facingLeft.y
                    return true
                }
            }

        })
    },
    manageEnemiesRainbowCollission() {
        this.enemies.forEach(enem => {
            if (this.isCollidingRainbows(enem.enemiePosition, enem.enemieSize)) {
                console.log("Colliding rainbow with enemie")
            }
        })

    },
    managePlayerRainbowCollissions() {
        if (this.isCollidingRainbows(this.player.playerPosition, this.player.playerSize)) {
            if (this.player.isFalling) {
                console.log("colliding and falling")
                //console.log("playerPosition", this.player.playerPosition.y)
                //console.log("where is supossed to be", this.actualRainbowCollissionY - this.player.playerSize.h)
                this.player.basePosition = this.actualRainbowCollissionY
                this.player.playerPosition.y = this.player.basePosition - this.player.playerSize.h - 10


            }
        } else {

        }
    },
    isCharacterWidthAfterTileXOrigin(colIndex, characterXPosition, characterWidth) {
        return characterXPosition + characterWidth >= this.mapTSize * colIndex
    },
    isCharacterHeightOverTileYOrigin(rowIndex, characterPositionY, characterHeight) {
        return characterPositionY + characterHeight + 5 >= this.map.getTileYAxis(rowIndex)
    },
    isCharacterXOriginBeforeTileWidth(colIndex, characterXPosition) {
        return characterXPosition <= this.mapTSize * colIndex + this.mapTSize
    },
    isCharacterYOrigingOverTileYWidth(rowIndex, characterYPosition, characterHeight) {
        return characterYPosition <= this.map.getTileYAxis(rowIndex) + this.mapTSize / 10 - characterHeight
    },
    isSomeTileColliding(row, rowIndex, characterPosition, characterSize) {
        return row.some((col, colIndex) => {
            return (
                col &&
                this.isCharacterWidthAfterTileXOrigin(colIndex, characterPosition.x, characterSize.w) &&
                this.isCharacterHeightOverTileYOrigin(rowIndex, characterPosition.y, characterSize.h) &&
                this.isCharacterXOriginBeforeTileWidth(colIndex, characterPosition.x) &&
                this.isCharacterYOrigingOverTileYWidth(rowIndex, characterPosition.y, characterSize.h)
            )

        })
    },
    managePlayerCollisionWithPlatforms() {
        if (!this.map.layer.some((row, rowIndex) => {
                if (this.isSomeTileColliding(row, rowIndex, this.player.playerPosition, this.player.playerSize)) {
                    if (this.player.isFalling) {
                        this.player.basePosition.y = this.map.getTileYAxis(rowIndex)
                        this.player.setPlayerToStaticPosition()
                    }
                    return true
                }
            })) {
            if (!this.player.isJumping) {
                this.player.playerVelocity.y = -this.cameraVelocity
                this.player.playerPosition.y -= this.player.playerVelocity.y
            }
        }
    },
    manageEnemiesCollisonWithPlatforms() {
        this.enemies.forEach(enem => {
            if (!this.map.layer.some((row, rowIndex) => {
                    if (this.isSomeTileColliding(row, rowIndex, enem.enemiePosition, enem.enemieSize)) {
                        enem.enemieVelocity.y = 0
                        enem.enemiePosition.y = this.map.getTileYAxis(rowIndex) - enem.enemieSize.h
                    }
                })) {
                enem.enemieVelocity.y = -6
                enem.enemiePosition.y -= enem.enemieVelocity.y
            }
        })
    },
    generateRandomEnemie() {
        if (this.framesCounter % 300 === 0) {
            this.enemies.push(new FloorEnemie(this.ctx,
                this.enemiesSources[Math.floor(Math.random() * this.enemiesSources.length)],
                2,
                this.framesCounter,
                Math.random() * (this.canvasSize.w - 150),
                0,
                100,
                90,
                this.starterEnemieVel[Math.floor(Math.random() * this.starterEnemieVel.length)],
                1,
                this.canvasSize.w,
                0))
            this.enemies.forEach(enem => enem.createImgEnemie())
        }
        this.enemies.forEach((enem, i) => {
            enem.enemiePosition.y > this.canvasSize.w + 90 ? this.enemies.splice(i, 1) : null
        })
    },
    isCollidingEnemies() {
        return this.enemies.some(enem => {
            return (
                this.player.playerPosition.x + this.player.playerSize.w >= enem.enemiePosition.x &&
                this.player.playerPosition.y + this.player.playerSize.h >= enem.enemiePosition.y &&
                this.player.playerPosition.x <= enem.enemiePosition.x + enem.enemieSize.w &&
                this.player.playerPosition.y < enem.enemiePosition.y + enem.enemieSize.h
            )
        })
    },

}



// isPlayerCollidingRainbows() {
//     return this.player.rainbowsConstructed.some(rainbow => {
//         if (rainbow.actualRainbowDirection === "right") {
//             if (
//                 this.player.playerPosition.x + this.player.playerSize.w - 20 >= rainbow.rainbowPosition.facingRigth.x &&
//                 this.player.playerPosition.y + this.player.playerSize.h >= rainbow.rainbowPosition.facingRigth.y &&
//                 this.player.playerPosition.x <= rainbow.rainbowPosition.facingRigth.x + rainbow.rainbowSize.w &&
//                 this.player.playerPosition.y < rainbow.rainbowPosition.facingRigth.y + rainbow.rainbowSize.h
//             ) {
//                 this.actualRainbowCollissionY = rainbow.rainbowPosition.facingRigth.y
//                 return true
//             }
//         } else if (rainbow.actualRainbowDirection === "left") {
//             if (
//                 this.player.playerPosition.x + this.player.playerSize.w >= rainbow.rainbowPosition.facingLeft.x - rainbow.rainbowSize.w &&
//                 this.player.playerPosition.y + this.player.playerSize.h >= rainbow.rainbowPosition.facingLeft.y &&
//                 this.player.playerPosition.x <= rainbow.rainbowPosition.facingLeft.x - 20 &&
//                 this.player.playerPosition.y < rainbow.rainbowPosition.facingLeft.y + rainbow.rainbowSize.h
//             ) {
//                 this.actualRainbowCollissionY = rainbow.rainbowPosition.facingLeft.y
//                 return true
//             }
//         }

//     })
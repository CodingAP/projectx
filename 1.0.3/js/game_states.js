class GameManager {
    constructor() {
        this.states = {}

        this.currentState = null;
    }

    setState(state) {
        key = '', mouse = -1;
        this.currentState = this.states[state.name];
        if (!this.currentState) {
            this.addState(state);
            this.currentState = this.states[state.name];
        }
    }

    addState(state) {
        this.states[state.name] = state;
    }

    show() {
        this.currentState.show();
    }

    update() {
        this.currentState.update();
    }

    getKeys(key, state) {
        this.currentState.getKeys(key, state);
    }

    getMouse(button, state) {
        this.currentState.getMouse(button, state);
    }
}

class GameState {
    constructor(name) {
        this.name = name;
    }

    show() {
        console.log('Default State Show');
    }

    update() {
        console.log('Default State Update');
    }

    getKeys(key, state) {
        console.log(key, state);
    }

    getMouse(button, state) {
        console.log(button, state);
    }
}

class MainMenuState extends GameState {
    constructor() {
        super('MAIN_MENU');

        this.mainMenu = new UIComponent();
        this.mainMenu.addComponent(UIComponent.POSITION, new RelativeComponent(0), new RelativeComponent(0));
        this.mainMenu.addComponent(UIComponent.SIZE, new RelativeComponent(1), new RelativeComponent(1));
        this.title = new TextUI(this.mainMenu, 'Project X', {
            color: '#fff'
        })
        this.title.addComponent(UIComponent.POSITION, new RelativeComponent(0.5), new RelativeComponent(0.4));
        this.title.addComponent(UIComponent.SIZE, new RelativeComponent(0), new RelativeComponent(0.3));
        this.playButton = new ButtonUI(this.mainMenu, {
            drawing: ButtonUI.BASIC,
            text: 'Play'
        })
        this.playButton.addComponent(UIComponent.POSITION, new RelativeComponent(0.5), new RelativeComponent(0.6));
        this.playButton.addComponent(UIComponent.SIZE, new RelativeComponent(0.2), new RatioComponent(0.5));
    }

    show() {
        context.fillStyle = '#555';
        context.fillRect(0, 0, canvas.width, canvas.height);
        this.title.show();
        this.playButton.show();
    }

    update() {
        this.mainMenu.updateComponent();
        this.title.updateComponent();
        this.playButton.updateComponent();

        if (this.playButton.clicked()) {
            gameManager.setState(gameState);
        }
    }

    getKeys(key, state) { }

    getMouse(button, state) { }
}

class GameplayState extends GameState {
    constructor() {
        super('GAME');

        this.player = new Player();
        this.player.uiInfo.name = 'Player' + (Math.floor(Math.random() * 1000000));
        this.enemyManager = new EnemyManager();
        this.camera = new Camera();

        this.gameplay = new UIComponent();
        this.gameplay.addComponent(UIComponent.POSITION, new RelativeComponent(0), new RelativeComponent(0));
        this.gameplay.addComponent(UIComponent.SIZE, new RelativeComponent(0.75), new RelativeComponent(1));

        this.playerUI = new UIComponent();
        this.playerUI.addComponent(UIComponent.POSITION, new RelativeComponent(0.75), new RelativeComponent(0));
        this.playerUI.addComponent(UIComponent.SIZE, new RelativeComponent(0.25), new RelativeComponent(1));

        this.playerInfo = new TextUI(this.playerUI, this.player.uiInfo.name + ' - Level ' + this.player.level, {
            color: '#fff'
        })
        this.playerInfo.addComponent(UIComponent.POSITION, new LeftComponent(200), new TopComponent(75));
        this.playerInfo.addComponent(UIComponent.SIZE, new RelativeComponent(0.15), new RatioComponent(1));

        this.versionInfo = new TextUI(this.playerUI, '1.0.3 - ' + frameRate, {
            color: '#fff'
        })
        this.versionInfo.addComponent(UIComponent.POSITION, new RightComponent(200), new BottomComponent(75));
        this.versionInfo.addComponent(UIComponent.SIZE, new RelativeComponent(0.15), new RatioComponent(1));
    }

    show() {
        let tileSize = 50;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();
        context.translate(this.gameplay.position.x + this.gameplay.width / 2, this.gameplay.position.y + this.gameplay.height / 2);
        context.translate(-this.camera.position.x, -this.camera.position.y);

        let cameraBounds = {
            minX: this.camera.position.x - this.gameplay.width / 1.5,
            maxX: this.camera.position.x + this.gameplay.width / 1.5,
            minY: this.camera.position.y - this.gameplay.height / 1.5,
            maxY: this.camera.position.y + this.gameplay.height / 1.5
        }

        let tile = 0;
        for (let y = mapBounds.y; y < mapBounds.y + mapBounds.height; y += tileSize) {
            tile++;
            if (y < cameraBounds.minY || y > cameraBounds.maxY) continue;
            for (let x = mapBounds.x; x < mapBounds.x + mapBounds.width; x += tileSize) {
                tile++;
                if (x < cameraBounds.minX || x > cameraBounds.maxX) continue;
                context.fillStyle = (tile % 2 == 0) ? '#0a0' : '#070';
                context.fillRect(x, y, tileSize, tileSize);
            }
        }

        this.enemyManager.show();
        this.player.show();

        context.restore();

        this.playerUI.show({
            backgroundColor: '#555',
            strokeColor: '#555'
        });
        this.playerInfo.show();
    }

    update() {
        this.gameplay.updateComponent();
        this.playerUI.updateComponent();
        this.playerInfo.updateComponent();

        this.camera.followPointSmooth(this.player.position);
        this.camera.restrict({
            width: this.gameplay.width,
            height: this.gameplay.height
        }, mapBounds);

        if (!this.player.dead) {
            this.player.followMouse(this.camera, this.gameplay);
            this.player.update();
            this.player.collideWithEnemies(this.enemyManager);
        } else {
            this.player.reset();
            gameManager.setState(mainMenuState)
        }
        this.enemyManager.update(this.player);

        this.playerInfo.text = this.player.uiInfo.name + ' - Level ' + this.player.level;
        this.versionInfo.text = '1.0.3 - ' + frameRate;
    }

    getKeys(key, state) {
        if (key == 'Escape') gameManager.setState(pausedState);
        this.player.getKeys(key, state);
    }

    getMouse(button, state) {
        this.player.getMouse(button, state);
    }
}

class PausedState extends GameState {
    constructor() {
        super('PAUSED');

        this.mainMenu = new UIComponent();
        this.mainMenu.addComponent(UIComponent.POSITION, new RelativeComponent(0), new RelativeComponent(0));
        this.mainMenu.addComponent(UIComponent.SIZE, new RelativeComponent(1), new RelativeComponent(1));
        this.title = new TextUI(this.mainMenu, 'Paused', {
            color: '#fff'
        })
        this.title.addComponent(UIComponent.POSITION, new RelativeComponent(0.5), new RelativeComponent(0.4));
        this.title.addComponent(UIComponent.SIZE, new RelativeComponent(0), new RelativeComponent(0.3));
        this.playButton = new ButtonUI(this.mainMenu, {
            drawing: ButtonUI.BASIC,
            text: 'Back to Game'
        })
        this.playButton.addComponent(UIComponent.POSITION, new RelativeComponent(0.5), new RelativeComponent(0.5));
        this.playButton.addComponent(UIComponent.SIZE, new RelativeComponent(0.2), new RatioComponent(0.2));
        this.menuButton = new ButtonUI(this.mainMenu, {
            drawing: ButtonUI.BASIC,
            text: 'Main Menu'
        })
        this.menuButton.addComponent(UIComponent.POSITION, new RelativeComponent(0.5), new RelativeComponent(0.6));
        this.menuButton.addComponent(UIComponent.SIZE, new RelativeComponent(0.2), new RatioComponent(0.2));
    }

    show() {
        this.mainMenu.show({
            backgroundColor: '#555',
            strokeColor: '#555'
        });
        this.title.show();
        this.playButton.show();
        this.menuButton.show();
    }

    update() {
        this.mainMenu.updateComponent();
        this.title.updateComponent();
        this.playButton.updateComponent();
        this.menuButton.updateComponent();

        if (this.playButton.clicked()) {
            gameManager.setState(gameState);
        } else if (this.menuButton.clicked()) {
            gameManager.setState(mainMenuState);
        }
    }

    getKeys(key, state) { }

    getMouse(button, state) { }
}
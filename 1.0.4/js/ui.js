class UIComponent {
    constructor(parent) {
        this.canvasUI = {};
        this.canvasUI.position = { x: 0, y: 0 };
        this.canvasUI.width = canvas.width;
        this.canvasUI.height = canvas.height;

        this.parent = parent || this.canvasUI;
        this.position = { x: 0, y: 0 };
        this.width = 0;
        this.height = 0;
        this.components = [];
    }

    addComponent(type, ...args) {
        this.components[type] = args;
    }

    updateComponent() {
        if (this.parent == this.canvasUI) {
            this.parent.position = { x: 0, y: 0 };
            this.parent.width = canvas.width;
            this.parent.height = canvas.height;
        }

        let widthComponent = this.components[1][0];
        let heightComponent = this.components[1][1];
        let relativeW = false;
        let relativeH = false;

        switch (widthComponent.type) {
            case 'REL':
                this.width = this.parent.width * widthComponent.value;
                break;
            case 'ABS':
                this.width = widthComponent.value;
                break;
            case 'RAT':
                relativeW = true;
                break
        }

        switch (heightComponent.type) {
            case 'REL':
                this.height = this.parent.height * heightComponent.value;
                break;
            case 'ABS':
                this.height = heightComponent.value;
                break;
            case 'RAT':
                relativeH = true;
                break;
        }

        if (relativeW) {
            if (relativeH) return;
            this.width = widthComponent.value * this.height;
        } else if (relativeH) {
            this.height = heightComponent.value * this.width;
        }

        let xComponent = this.components[0][0];
        let yComponent = this.components[0][1];

        let offsetX = (this.parent == this.canvasUI ? 0 : -this.width / 2);
        let offsetY = (this.parent == this.canvasUI ? 0 : -this.height / 2);

        switch (xComponent.type) {
            case 'REL':
                this.position.x = (this.parent.width * xComponent.value) + this.parent.position.x + offsetX;
                break;
            case 'LEFT':
                this.position.x = this.parent.position.x + xComponent.value + offsetX;
                break;
            case 'RITE':
                this.position.x = (this.parent.position.x + this.parent.width) - xComponent.value + offsetX;
                break;
        }

        switch (yComponent.type) {
            case 'REL':
                this.position.y = (this.parent.height * yComponent.value) + this.parent.position.y + offsetY;
                break;
            case 'TOP':
                this.position.y = this.parent.position.y + yComponent.value + offsetY;
                break;
            case 'BOT':
                this.position.y = (this.parent.position.y + this.parent.height) - yComponent.value + offsetY;
                break;
        }
    }

    show(options) {
        context.fillStyle = options.backgroundColor || '#fff';
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
        context.strokeStyle = options.strokeColor || '#fff';
        context.lineWidth = options.strokeWidth || 3;
        context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }

    static get POSITION() {
        return 0;
    }

    static get SIZE() {
        return 1;
    }
}

class ButtonUI extends UIComponent {
    constructor(parent, options) {
        super(parent);
        this.options = options;

        this.states = {
            NOTHING: 0,
            HOVERED: 1,
            CLICKED: 2,
            DISABLED: 3
        }
        this.disabled = false;
        this.state = this.states.NOTHING;
    }

    static get BASIC() {
        return 0;
    }

    static get IMAGE() {
        return 1;
    }

    show() {
        let type = this.options.drawing || 0;

        switch (type) {
            case 0:
                switch (this.state) {
                    case this.states.NOTHING:
                        context.fillStyle = this.options.backgroundColor || '#fff';
                        break;
                    case this.states.HOVERED:
                        context.fillStyle = this.options.hoverColor || '#aaa';
                        break;
                    case this.states.CLICKED:
                        context.fillStyle = this.options.clickedColor || '#555';
                        break;
                    case this.states.DISABLED:
                        context.fillStyle = this.options.disabledColor || '#333';
                        break;
                }
                context.fillRect(this.position.x, this.position.y, this.width, this.height);

                context.fillStyle = this.options.textColor || '#000';
                context.strokeStyle = this.options.strokeColor || '#000';
                context.lineWidth = this.options.strokeWidth || 3;

                context.font = this.height / 2 + 'px ' + globalFont;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(this.options.text || 'Button', this.position.x + this.width / 2, this.position.y + this.height / 2);

                context.strokeRect(this.position.x, this.position.y, this.width, this.height);
                break;
            case 1:
                switch (this.state) {
                    case this.states.NOTHING:
                        context.drawImage(this.options.backgroundImage, this.position.x, this.position.y, this.width, this.height);
                        break;
                    case this.states.HOVERED:
                        context.drawImage(this.options.hoverImage, this.position.x, this.position.y, this.width, this.height);
                        break;
                    case this.states.CLICKED:
                        context.drawImage(this.options.clickedImage, this.position.x, this.position.y, this.width, this.height);
                        break;
                    case this.states.DISABLED:
                        context.drawImage(this.options.disabledImage, this.position.x, this.position.y, this.width, this.height);
                        break;
                }
                break;
        }
    }

    clicked() {
        if (!this.disabled) {
            if (mouseX > this.position.x && mouseX < this.position.x + this.width && mouseY > this.position.y && mouseY < this.position.y + this.height) {
                if (mouse == 0) {
                    this.state = this.states.CLICKED;
                    return true;
                } else {
                    this.state = this.states.HOVERED;
                }
            } else {
                this.state = this.states.NOTHING;
            }
        } else {
            this.state = this.states.DISABLED;
        }
    }
}

class ImageUI extends UIComponent {
    constructor(parent, image) {
        super(parent);
        this.image = image;
    }

    show() {
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}

class TextUI extends UIComponent {
    constructor(parent, text, options) {
        super(parent);
        this.text = text;
        this.options = options;
    }

    show() {
        context.fillStyle = this.options.color || '#000';
        context.font = this.height / 2 + 'px ' + globalFont;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.text, this.position.x, this.position.y);
    }
}

class RelativeComponent {
    constructor(value) {
        this.value = value;
        this.type = 'REL';
    }
}

class LeftComponent {
    constructor(value) {
        this.value = value;
        this.type = 'LEFT';
    }
}

class RightComponent {
    constructor(value) {
        this.value = value;
        this.type = 'RITE';
    }
}

class TopComponent {
    constructor(value) {
        this.value = value;
        this.type = 'TOP';
    }
}

class BottomComponent {
    constructor(value) {
        this.value = value;
        this.type = 'BOT';
    }
}

class RatioComponent {
    constructor(value) {
        this.value = value;
        this.type = 'RAT';
    }
}

class StatusBar {
    constructor(min, max) {
        this.min = min;
        this.max = max;
        this.current = min;
    }

    show(options) {
        context.strokeStyle = options.strokeColor;
        context.fillStyle = options.backgroundColor;
        context.fillRect(options.position.x, options.position.y, options.width, options.height);
        context.fillStyle = options.foregroundColor;
        context.lineWidth = 1;
        let width = (this.current / (this.max - this.min)) * options.width;
        context.fillRect(options.position.x, options.position.y, width, options.height);
        context.strokeRect(options.position.x, options.position.y, options.width, options.height);
    }

    changeValue(offset) {
        let newValue = this.current + offset;
        if (newValue > this.max) newValue = this.max;
        if (newValue < this.min) newValue = this.min;
        this.current = newValue;
    }
}

class Minimap {
    constructor() {
        this.objects = [];
    }

    show(options) {
        context.fillStyle = '#090';
        context.fillRect(options.offset.x, options.offset.y, options.width, options.height);

        for (let i = 0; i < this.objects.length; i++) {
            let x = Math.map(this.objects[i].position.x, mapBounds.x, mapBounds.x + mapBounds.width, 0, options.width);
            let y = Math.map(this.objects[i].position.y, mapBounds.y, mapBounds.y + mapBounds.height, 0, options.width);
            context.fillStyle = this.objects[i].minimapColor;
            context.fillRect(options.offset.x + x - 2, options.offset.y + y - 2, 4, 4);
        }
    }

    addObject(object) {
        this.objects.push(object);
    }

    removeObject(object) {
        let index = -1;
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i] == object) index = i;
        }
        if (index != -1) this.objects.splice(index, 1);
    }
}
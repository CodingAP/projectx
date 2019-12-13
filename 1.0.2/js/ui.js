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

class GameUI {
    constructor(entity, constraints) {
        this.entity = entity;
        this.constraints = constraints;
        this.minimap = new Minimap();
        this.minimap.addObject(entity);
    }

    show() {
        let x = this.constraints.offset.x * canvas.width;
        let y = this.constraints.offset.y * canvas.height;
        let width = this.constraints.width * canvas.width;
        let height = this.constraints.height * canvas.height;

        context.fillStyle = '#555';
        context.fillRect(x, y, width, height);

        context.drawImage(resources.logo, x + width * 0.05, y + height * 0.92, 50, 50)

        context.fillStyle = '#fff';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.font = (height / 12) / 2 + 'px Arial'
        context.fillText(this.entity.uiInfo.name + ' - Level ' + this.entity.level, x + 10, y + 10);

        context.fillStyle = '#fff';
        context.textAlign = 'right';
        context.textBaseline = 'bottom';
        context.font = '20px Arial';
        context.fillText('1.0.2 - ' + frameRate, x + width - 10, y + height - 10);

        this.minimap.show({
            offset: { x: x + width / 8, y: y + height / 12 },
            width: width * 3 / 4,
            height: width * 3 / 4
        });

        for (let i = 0; i < this.entity.uiInfo.statBars.length; i++) {
            let statBar = this.entity.uiInfo.statBars[i];

            let statBarX = x + width * 0.1;
            let statBarY = y + height * 0.6 + (i * height * 0.06);
            let statBarWidth = width * 0.8;
            let statBarHeight = height * 0.03;

            this.entity[statBar.var].show({
                strokeColor: statBar.colors.stroke,
                foregroundColor: statBar.colors.foreground,
                backgroundColor: statBar.colors.background,
                position: { x: statBarX, y: statBarY },
                width: statBarWidth,
                height: statBarHeight
            });

            context.fillStyle = statBar.colors.text;
            context.font = statBarHeight * 0.8 + 'px Arial';
            context.textAlign = 'left';
            context.textBaseline = 'top';
            context.fillText(statBar.name, statBarX + statBarHeight * 0.1, statBarY + statBarHeight * 0.1);
        }
    }
}
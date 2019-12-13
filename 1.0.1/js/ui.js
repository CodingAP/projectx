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

class GameUI {
    constructor(entity, constraints) {
        this.entity = entity;
        this.constraints = constraints;
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
        context.fillText(this.entity.uiInfo.name, x + 10, y + 10);

        context.fillStyle = '#fff';
        context.textAlign = 'right';
        context.textBaseline = 'bottom';
        context.font = '20px Arial';
        context.fillText('1.0.1 - ' + frameRate, x + width - 10, y + height - 10);

        context.fillStyle = '#aaa';
        context.fillRect(x + width / 8, y + height / 12, width * 3 / 4, width * 3 / 4);

        this.entity.show(new Vector2D(x + width / 8 + width * 3 / 8, y + height / 12 + width * 3 / 8));
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
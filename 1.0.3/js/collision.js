class CircleCollider {
    constructor(x, y, radius, options = {}) {
        this.debug = false;
        this.type = 'CIRCLE';
        this.rotation = 0;
        this.position = new Vector2D(x, y);
        this.radius = radius;
        this.options = options;
    }

    setPosition(x, y) {
        this.position.set(x, y);
    }

    setRotation(angle) {
        this.rotation = angle;
    }

    show(context) {
        context.fillStyle = this.options.fillColor || '#fff';
        context.strokeStyle = this.options.borderColor || '#000';
        context.beginPath();
        context.ellipse(this.position.x, this.position.y, this.radius, this.radius, 0, 0, Math.TWO_PI);
        if (this.debug) context.fill();
        context.stroke();
        context.closePath();
    }

    collideWith(object) {
        if (object.type == 'CIRCLE') {
            if (this.position.distance(object.position) < this.radius + object.radius) {
                return true;
            }
        } else if (object.type == 'POLY' || object.type == 'RECT') {
            let collision = false;
            for (let i = 0; i < object.points.length; i++) {
                let j = (i + 1) % object.points.length;
                let startPoint = object.points[i];
                let endPoint = object.points[j];
                if (this.position.distance(startPoint) < this.radius || this.position.distance(endPoint) < this.radius) {
                    return true;
                }
                let length = Math.distance(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                let dot = (((this.position.x - startPoint.x) * (endPoint.x - startPoint.x)) + ((this.position.y - startPoint.y) * (endPoint.y - startPoint.y))) / Math.pow(length, 2);
                let closest = new Vector2D(startPoint.x + (dot * (endPoint.x - startPoint.x)), startPoint.y + (dot * (endPoint.y - startPoint.y)));
                let lineDist = closest.distance(startPoint) + closest.distance(endPoint);
                if (lineDist < length + 0.1 && lineDist > length - 0.1) {
                    let dist = closest.distance(this.position);
                    if (dist < this.radius) {
                        return true;
                    }
                }
                if (((startPoint.y > this.position.y) != (endPoint.y > this.position.y)) && (this.position.x < (endPoint.x - startPoint.x) * (this.position.y - startPoint.y) / (endPoint.y - startPoint.y) + startPoint.x)) {
                    collision = !collision;
                }
            }
            return collision;
        } else if (object.type == 'POINT') {
            if (this.position.distance(object.position) < this.radius) {
                return true;
            }
        } else if (object.type == 'LINE') {
            if (this.position.distance(object.startPoint) < this.radius || this.position.distance(object.endPoint) < this.radius) {
                return true;
            }
            let dot = (((this.position.x - object.startPoint.x) * (object.endPoint.x - object.startPoint.x)) + ((this.position.y - object.startPoint.y) * (object.endPoint.y - object.startPoint.y))) / Math.pow(object.length, 2);
            let closest = new Vector2D(object.startPoint.x + (dot * (object.endPoint.x - object.startPoint.x)), object.startPoint.y + (dot * (object.endPoint.y - object.startPoint.y)));
            let lineDist = closest.distance(object.startPoint) + closest.distance(object.endPoint);
            if (lineDist < object.length + 0.1 && lineDist > object.length - 0.1) {
                let dist = closest.distance(this.position);
                if (dist < this.radius) {
                    return true;
                }
            }
            return false;
        } else {
            console.log('This is not a collidable object');
            return false;
        }
    }
}

class PolygonCollider {
    constructor(x, y, points, options = {}) {
        this.debug = false;
        this.type = 'RECT';
        this.position = new Vector2D(x, y);
        this.rotation = -90;
        this.originalPoints = points;
        this.points = [];
        this.normals = [];
        this.velocity = new Vector2D();
        this.options = options;
        if (this.options.sides) {
            this.create(this.options.sides);
        }
        this.calculate();
    }

    setPosition(x, y) {
        this.position.set(x, y);
        this.calculate();
    }

    setRotation(angle) {
        this.rotation = angle;
        this.calculate();
    }

    show(context) {
        context.fillStyle = this.options.fillColor || '#fff';
        context.strokeStyle = this.options.borderColor || '#000';
        context.beginPath();
        for (let i = 0; i <= this.points.length; i++) {
            let p = this.points[i % this.points.length];
            context.lineTo(p.x, p.y);
        }
        if (this.debug) context.fill();
        context.stroke();
        if (this.debug) {
            context.closePath();
            for (let i = 0; i < this.normals.length; i++) {
                context.save();
                context.translate(this.normalPositions[i].x, this.normalPositions[i].y);
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(this.normals[i].x * 25, this.normals[i].y * 25);
                context.stroke();
                context.closePath();
                context.restore();
            }
        }
    }

    create(sides) {
        let angle = Math.TWO_PI / sides;
        for (let i = 0; i < sides; i++) {
            this.originalPoints.push(new Vector2D(this.options.size * Math.cos(angle * i), this.options.size * Math.sin(angle * i)));
        }
    }

    calculate() {
        this.points = [];
        for (let i = 0; i < this.originalPoints.length; i++) {
            let newPoint = this.originalPoints[i].clone();
            newPoint.rotate(this.rotation / (Math.PI / 180));
            newPoint.add(this.position);
            this.points.push(newPoint);
        }

        this.normals = [];
        this.normalPositions = [];
        for (let i = 0; i < this.points.length; i++) {
            let j = (i + 1) % this.points.length;
            let midpoint = new Vector2D((this.points[i].x + this.points[j].x) / 2, (this.points[i].y + this.points[j].y) / 2);
            let normal = new Vector2D(-(this.points[j].y - this.points[i].y), this.points[j].x - this.points[i].x);
            normal.normalize().reverse();
            this.normals.push(normal);
            this.normalPositions.push(midpoint);
        }
    }

    collideWith(object) {
        if (object.type == 'CIRCLE') {
            let collision = false;
            for (let i = 0; i < this.points.length; i++) {
                let j = (i + 1) % this.points.length;
                let startPoint = this.points[i];
                let endPoint = this.points[j];
                if (object.position.distance(startPoint) < object.radius || object.position.distance(endPoint) < object.radius) {
                    return true;
                }
                let length = Math.distance(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                let dot = (((object.position.x - startPoint.x) * (endPoint.x - startPoint.x)) + ((object.position.y - startPoint.y) * (endPoint.y - startPoint.y))) / Math.pow(length, 2);
                let closest = new Vector2D(startPoint.x + (dot * (endPoint.x - startPoint.x)), startPoint.y + (dot * (endPoint.y - startPoint.y)));
                let lineDist = closest.distance(startPoint) + closest.distance(endPoint);
                if (lineDist < length + 0.1 && lineDist > length - 0.1) {
                    let dist = closest.distance(object.position);
                    if (dist < object.radius) {
                        return true;
                    }
                }
                if (((startPoint.y > object.position.y) != (endPoint.y > object.position.y)) && (object.position.x < (endPoint.x - startPoint.x) * (object.position.y - startPoint.y) / (endPoint.y - startPoint.y) + startPoint.x)) {
                    collision = !collision;
                }
            }
            return collision;
        } else if (object.type == 'POLY' || object.type == 'RECT') {
            for (let i = 0; i < 2; i++) {
                let poly1 = this;
                let poly2 = object;
                if (i == 1) {
                    poly1 = object;
                    poly2 = this;
                }

                for (let j = 0; j < poly1.normals.length; j++) {
                    let normal = poly1.normals[j];
                    let min1 = Infinity, max1 = -Infinity;
                    for (let p = 0; p < poly1.points.length; p++) {
                        let q = (poly1.points[p].x * normal.x + poly1.points[p].y * normal.y);
                        if (q < min1) {
                            min1 = q;
                        } if (q > max1) {
                            max1 = q;
                        }
                    }

                    let min2 = Infinity, max2 = -Infinity;
                    for (let p = 0; p < poly2.points.length; p++) {
                        let q = (poly2.points[p].x * normal.x + poly2.points[p].y * normal.y);
                        if (q < min2) {
                            min2 = q;
                        } if (q > max2) {
                            max2 = q;
                        }
                    }

                    if (!(max2 >= min1 && max1 >= min2)) return false;
                }
            }
            return true;
        } else if (object.type == 'POINT') {
            let collision = false;
            for (let i = 0; i < this.points.length; i++) {
                let j = (i + 1) % this.points.length;
                if (((this.points[i].y > object.position.y) != (this.points[j].y > object.position.y)) && (object.position.x < (this.points[j].x - this.points[i].x) * (object.position.y - this.points[i].y) / (this.points[j].y - this.points[i].y) + this.points[i].x)) {
                    collision = !collision;
                }
            }
            return collision;
        } else if (object.type == 'LINE') {
            for (let i = 0; i < this.points.length; i++) {
                let j = (i + 1) % this.points.length;
                let x1 = object.startPoint.x;
                let x2 = object.endPoint.x;
                let x3 = this.points[i].x;
                let x4 = this.points[j].x;

                let y1 = object.startPoint.y;
                let y2 = object.endPoint.y;
                let y3 = this.points[i].y;
                let y4 = this.points[j].y;

                let uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
                let uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

                if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
                    return true;
                }
            }
            return false;
        } else {
            console.log('This is not a collidable object');
            return false;
        }
    }
}

class RectangleCollider {
    constructor(x, y, w, h, options = {}) {
        this.debug = false;
        this.type = 'RECT';
        this.position = new Vector2D(x, y);
        this.width = w;
        this.height = h;
        this.rotation = 0;
        this.originalPoints = [];
        this.points = [];
        this.normals = [];
        this.options = options;
        this.create();
        this.calculate();
    }

    setPosition(x, y) {
        this.position.set(x, y);
        this.calculate();
    }

    setRotation(angle) {
        this.rotation = angle;
        this.calculate();
    }

    setWidth(width) {
        this.width = width;
        this.create();
    }

    setHeight(height) {
        this.height = height;
        this.create();
    }

    show(context) {
        context.fillStyle = this.options.fillColor || '#fff';
        context.strokeStyle = this.options.borderColor || '#000';
        context.beginPath();
        for (let i = 0; i <= this.points.length; i++) {
            let p = this.points[i % this.points.length];
            context.lineTo(p.x, p.y);
        }
        if (this.debug) context.fill();
        context.stroke();
        if (this.debug) {
            context.closePath();
            for (let i = 0; i < this.normals.length; i++) {
                context.save();
                context.translate(this.normalPositions[i].x, this.normalPositions[i].y);
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(this.normals[i].x * 25, this.normals[i].y * 25);
                context.stroke();
                context.closePath();
                context.restore();
            }
        }
    }

    create() {
        this.originalPoints = [];
        this.originalPoints.push(new Vector2D(-this.width / 2, -this.height / 2));
        this.originalPoints.push(new Vector2D(this.width / 2, -this.height / 2));
        this.originalPoints.push(new Vector2D(this.width / 2, this.height / 2));
        this.originalPoints.push(new Vector2D(-this.width / 2, this.height / 2));
        this.calculate();
    }

    calculate() {
        this.points = [];
        for (let i = 0; i < this.originalPoints.length; i++) {
            let newPoint = this.originalPoints[i].clone();
            newPoint.rotate(this.rotation / (Math.PI / 180));
            newPoint.add(this.position);
            this.points.push(newPoint);
        }

        this.normals = [];
        this.normalPositions = [];
        for (let i = 0; i < this.points.length; i++) {
            let j = (i + 1) % this.points.length;
            let midpoint = new Vector2D((this.points[i].x + this.points[j].x) / 2, (this.points[i].y + this.points[j].y) / 2);
            let normal = new Vector2D(-(this.points[j].y - this.points[i].y), this.points[j].x - this.points[i].x);
            normal.normalize().reverse();
            this.normals.push(normal);
            this.normalPositions.push(midpoint);
        }
    }

    collideWith(object) {
        if (object.type == 'CIRCLE') {
            let collision = false;
            for (let i = 0; i < this.points.length; i++) {
                let j = (i + 1) % this.points.length;
                let startPoint = this.points[i];
                let endPoint = this.points[j];
                if (object.position.distance(startPoint) < object.radius || object.position.distance(endPoint) < object.radius) {
                    return true;
                }
                let length = Math.distance(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
                let dot = (((object.position.x - startPoint.x) * (endPoint.x - startPoint.x)) + ((object.position.y - startPoint.y) * (endPoint.y - startPoint.y))) / Math.pow(length, 2);
                let closest = new Vector2D(startPoint.x + (dot * (endPoint.x - startPoint.x)), startPoint.y + (dot * (endPoint.y - startPoint.y)));
                let lineDist = closest.distance(startPoint) + closest.distance(endPoint);
                if (lineDist < length + 0.1 && lineDist > length - 0.1) {
                    let dist = closest.distance(object.position);
                    if (dist < object.radius) {
                        return true;
                    }
                }
                if (((startPoint.y > object.position.y) != (endPoint.y > object.position.y)) && (object.position.x < (endPoint.x - startPoint.x) * (object.position.y - startPoint.y) / (endPoint.y - startPoint.y) + startPoint.x)) {
                    collision = !collision;
                }
            }
            return collision;
        } else if (object.type == 'POLY' || object.type == 'RECT') {
            for (let i = 0; i < 2; i++) {
                let poly1 = this;
                let poly2 = object;
                if (i == 1) {
                    poly1 = object;
                    poly2 = this;
                }

                for (let j = 0; j < poly1.normals.length; j++) {
                    let normal = poly1.normals[j];
                    let min1 = Infinity, max1 = -Infinity;
                    for (let p = 0; p < poly1.points.length; p++) {
                        let q = (poly1.points[p].x * normal.x + poly1.points[p].y * normal.y);
                        if (q < min1) {
                            min1 = q;
                        } if (q > max1) {
                            max1 = q;
                        }
                    }

                    let min2 = Infinity, max2 = -Infinity;
                    for (let p = 0; p < poly2.points.length; p++) {
                        let q = (poly2.points[p].x * normal.x + poly2.points[p].y * normal.y);
                        if (q < min2) {
                            min2 = q;
                        } if (q > max2) {
                            max2 = q;
                        }
                    }

                    if (!(max2 >= min1 && max1 >= min2)) return false;
                }
            }
            return true;
        } else if (object.type == 'POINT') {
            let collision = false;
            for (let i = 0; i < this.points.length; i++) {
                let j = (i + 1) % this.points.length;
                if (((this.points[i].y > object.position.y) != (this.points[j].y > object.position.y)) && (object.position.x < (this.points[j].x - this.points[i].x) * (object.position.y - this.points[i].y) / (this.points[j].y - this.points[i].y) + this.points[i].x)) {
                    collision = !collision;
                }
            }
            return collision;
        } else if (object.type == 'LINE') {
            for (let i = 0; i < this.points.length; i++) {
                let j = (i + 1) % this.points.length;
                let x1 = object.startPoint.x;
                let x2 = object.endPoint.x;
                let x3 = this.points[i].x;
                let x4 = this.points[j].x;

                let y1 = object.startPoint.y;
                let y2 = object.endPoint.y;
                let y3 = this.points[i].y;
                let y4 = this.points[j].y;

                let uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
                let uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

                if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
                    return true;
                }
            }
            return false;
        } else {
            console.log('This is not a collidable object');
            return false;
        }
    }
}

class PointCollider {
    constructor(x, y, options = {}) {
        this.debug = false;
        this.type = 'POINT';
        this.range = 2;
        this.position = new Vector2D(x, y);
        this.options = options;
    }

    setPosition(x, y) {
        this.position.set(x, y);
    }

    show(context) {
        context.strokeStyle = this.options.fillColor || '#000';
        context.beginPath();
        context.ellipse(this.position.x, this.position.y, this.range, this.range, 0, 0, Math.TWO_PI);
        context.stroke();
        context.closePath();
    }

    collideWith(object) {
        if (object.type == 'CIRCLE') {
            if (this.position.distance(object.position) < object.radius) {
                return true;
            }
            return false;
        } else if (object.type == 'POLY' || object.type == 'RECT') {
            let collision = false;
            for (let i = 0; i < object.points.length; i++) {
                let j = (i + 1) % object.points.length;
                if (((object.points[i].y > this.position.y) != (object.points[j].y > this.position.y)) && (this.position.x < (object.points[j].x - object.points[i].x) * (this.position.y - object.points[i].y) / (object.points[j].y - object.points[i].y) + object.points[i].x)) {
                    collision = !collision;
                }
            }
            return collision;
        } else if (object.type == 'POINT') {
            if (Math.distance(this.position.x, this.position.y, object.position.x, object.position.y) < this.range) {
                return true;
            }
            return false;
        } else if (object.type == 'LINE') {
            let dist = this.position.distance(object.startPoint) + this.position.distance(object.endPoint);
            if (dist < object.length + 0.1 && dist > object.length - 0.1) {
                return true;
            }
            return false;
        } else {
            console.log('This is not a collidable object');
            return false;
        }
    }
}

class LineCollider {
    constructor(x1, y1, x2, y2, options = {}) {
        this.debug = false;
        this.type = 'LINE';
        this.startPoint = new Vector2D(x1, y1);
        this.endPoint = new Vector2D(x2, y2);
        this.length = this.startPoint.distance(this.endPoint);
        this.options = options;
    }

    setStartPosition(x, y) {
        this.startPoint.set(x, y);
        this.length = this.startPoint.distance(this.endPoint);
    }

    setEndPosition(x, y) {
        this.endPoint.set(x, y);
        this.length = this.startPoint.distance(this.endPoint);
    }

    show(context) {
        context.strokeStyle = this.options.fillColor || '#000';
        context.beginPath();
        context.moveTo(this.startPoint.x, this.startPoint.y);
        context.lineTo(this.endPoint.x, this.endPoint.y);
        context.stroke();
        context.closePath();
    }

    collideWith(object) {
        if (object.type == 'CIRCLE') {
            if (object.position.distance(this.startPoint) < object.radius || object.position.distance(this.endPoint) < object.radius) {
                return true;
            }
            let dot = (((object.position.x - this.startPoint.x) * (this.endPoint.x - this.startPoint.x)) + ((object.position.y - this.startPoint.y) * (this.endPoint.y - this.startPoint.y))) / Math.pow(this.length, 2);
            let closest = new Vector2D(this.startPoint.x + (dot * (this.endPoint.x - this.startPoint.x)), this.startPoint.y + (dot * (this.endPoint.y - this.startPoint.y)));
            let lineDist = closest.distance(this.startPoint) + closest.distance(this.endPoint);
            if (lineDist < this.length + 0.1 && lineDist > this.length - 0.1) {
                let dist = closest.distance(object.position);
                if (dist < object.radius) {
                    return true;
                }
            }
            return false;
        } else if (object.type == 'POLY' || object.type == 'RECT') {
            for (let i = 0; i < object.points.length; i++) {
                let j = (i + 1) % object.points.length;
                let x1 = this.startPoint.x;
                let x2 = this.endPoint.x;
                let x3 = object.points[i].x;
                let x4 = object.points[j].x;

                let y1 = this.startPoint.y;
                let y2 = this.endPoint.y;
                let y3 = object.points[i].y;
                let y4 = object.points[j].y;

                let uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
                let uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

                if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
                    return true;
                }
            }
            return false;
        } else if (object.type == 'POINT') {
            let dist = object.position.distance(this.startPoint) + object.position.distance(this.endPoint);
            if (dist < this.length + 0.1 && dist > this.length - 0.1) {
                return true;
            }
            return false;
        } else if (object.type == 'LINE') {
            let x1 = this.startPoint.x;
            let x2 = this.endPoint.x;
            let x3 = object.startPoint.x;
            let x4 = object.endPoint.x;

            let y1 = this.startPoint.y;
            let y2 = this.endPoint.y;
            let y3 = object.startPoint.y;
            let y4 = object.endPoint.y;

            let uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
            let uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

            if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
                let intersectionX = x1 + (uA * (x2 - x1));
                let intersectionY = y1 + (uA * (y2 - y1));
                return new Vector2D(intersectionX, intersectionY);
            }
            return false;
        } else {
            console.log('This is not a collidable object');
            return false;
        }
    }
}
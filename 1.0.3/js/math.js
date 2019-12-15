Math.TWO_PI = Math.PI * 2;
Math.HALF_PI = Math.PI / 2;
Math.QUARTER_PI = Math.PI / 4;
Math.toDegrees = function (r) {
    return r * (180 / Math.PI);
}
Math.toRadians = function (d) {
    return d * (Math.PI / 180);
}
Math.lerp = function (v1, v2, a) {
    return a * (v2 - v1) + v1;
}
Math.randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
Math.randomBetween = function (min, max) {
    return Math.random() * (max - min) + min;
}
Math.map = function (n, start1, stop1, start2, stop2) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}
Math.distance = function (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

class Vector2D {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    set(x, y) {
        if (typeof x == 'number') {
            if (y != undefined) {
                this.x = x;
                this.y = y;
            } else {
                this.x = x;
                this.y = x;
            }
        } else {
            this.x = x.x;
            this.y = x.y;
        }
        return this;
    }


    add(x, y) {
        if (typeof v == 'number') {
            if (y != undefined) {
                this.x += x;
                this.y += y;
            } else {
                this.x += x;
                this.y += x;
            }
        } else {
            this.x += x.x;
            this.y += x.y;
        }
        return this;
    }

    subtract(x, y) {
        if (typeof x == 'number') {
            if (y != undefined) {
                this.x -= x;
                this.y -= y;
            } else {
                this.x -= x;
                this.y -= x;
            }
        } else {
            this.x -= x.x;
            this.y -= x.y;
        }
        return this;
    }

    multiply(x, y) {
        if (typeof x == 'number') {
            if (y != undefined) {
                this.x *= x;
                this.y *= y;
            } else {
                this.x *= x;
                this.y *= x;
            }
        } else {
            this.x *= x.x;
            this.y *= x.y;
        }
        return this;
    }

    divide(x, y) {
        if (typeof x == 'number') {
            if (y != undefined) {
                this.x /= x;
                this.y /= y;
            } else {
                this.x /= x;
                this.y /= x;
            }
        } else {
            this.x /= x.x;
            this.y /= x.y;
        }
        return this;
    }

    normalize() {
        let mag = this.getMagnitude();
        if (mag != 0) this.divide(mag)
        return this;
    }

    dot(v) {
        let normThis = new Vector2D(this.x, this.y).normalize();
        let normV = new Vector2D(v.x, v.y).normalize();
        let dotProduct = normThis.x * normV.x + normThis.y * normV.y;
        return dotProduct;
    }

    setMagnitude(mag) {
        this.normalize().multiply(mag);
        return this;
    }

    getMagnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    project(v) {
        let dotProduct = this.x * v.x + this.y * v.y;
        let projectionAmount = dotProduct / (v.getMagnitude() * v.getMagnitude());
        this.multiply(projectionAmount);
        return this;
    }

    reflectAcrossAxis(axis) {
        let clone = this.clone();
        this.project(axis).multiply(2).subtract(clone);
        return this;
    }

    setAngle(angle) {
        this.set(Math.cos(Math.toRadians(angle)), Math.sin(Math.toRadians(angle)));
        return this;
    }

    rotate(angle) {
        let clone = this.clone();
        this.x = clone.x * Math.cos(Math.toRadians(angle)) - clone.y * Math.sin(Math.toRadians(angle));
        this.y = clone.x * Math.sin(Math.toRadians(angle)) + clone.y * Math.cos(Math.toRadians(angle));
        return this;
    }

    getAngle() {
        return Math.toDegrees(Math.atan(this.y / this.x));
    }

    reverse() {
        this.multiply(-1);
        return this;
    }

    inverse() {
        this.x = 1 / this.x;
        this.y = 1 / this.y;
        return this;
    }

    lerp(x, y, amount) {
        let v = new Vector2D();
        let a_ = amount;
        if (typeof x == 'number') {
            v.set(x, y);
        } else {
            v.set(x);
            a_ = y;
        }
        this.x = Math.lerp(this.x, v.x, a_);
        this.y = Math.lerp(this.y, v.y, a_);
        return this;
    }

    clamp(minX, maxX, minY, maxY) {
        if (this.x < minX) {
            this.x = minX;
        } if (this.x > maxX) {
            this.x = maxX;
        } if (this.y < minY) {
            this.y = minY;
        } if (this.y > maxY) {
            this.y = maxY;
        }
    }

    random(scale) {
        this.x = Math.cos(Math.randomBetween(0, Math.TWO_PI)) * scale;
        this.y = Math.sin(Math.randomBetween(0, Math.TWO_PI)) * scale;
        return this;
    }

    distance(x, y) {
        let v = new Vector2D();
        if (x == 'number') {
            v.set(x, y);
        } else {
            v.set(x);
        }
        return Math.sqrt(Math.pow(v.x - this.x, 2) + Math.pow(v.y - this.y, 2));
    }

    clone() {
        return new Vector2D(this.x, this.y);
    }

    toString() {
        return 'X: ' + this.x + ', Y: ' + this.y;
    }
}
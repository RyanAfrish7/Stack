export class Animate {
    constructor() {
        this.animations = new Map();
    }

    registerAnimation(options) {
        const animation = new Animation(this, options);
        if (!this.animations.has(animation.object)) {
            this.animations.set(animation.object, new Map());
        }
        this.animations.get(animation.object).set(animation.property, animation);

        return animation;
    }

    stopAnimation(animation) {
        this.animations.get(animation.object).delete(animation.property);
    }

    animate(timestamp) {
        for (const map of this.animations.values()) {
            for (const animation of map.values()) {
                animation.animate(timestamp);
            }
        }
    }
}

export class Animation {
    constructor(animator, options) {
        this.animator = animator;
        this.object = options.target;
        this.property = options.property;

        if(options.from) {
            this.object[this.property] = options.from;
        }

        this.value = {
            from: this.object[this.property],
            to: options.to
        };
        this.duration = options.duration;
        this.direction = options.direction || 'normal';
        this.loop = options.loop || 1;
    }

    animate(timestamp) {
        if (this.startTimestamp + this.duration < timestamp) {
            this.loop -= 1;
            if (this.loop === 0) {
                this.animator.stopAnimation(this);
            } else {
                this.startTimestamp = timestamp;
            }
        }

        if (this.startTimestamp !== undefined) {
            // this.object[this.property] += (timestamp - this.startTimestamp) / this.duration * (this.to - this.object[this.property]);
            let progress;
            if(this.direction === 'normal')
                progress = Math.sin((timestamp - this.startTimestamp) / this.duration * Math.PI / 2);
            else if(this.direction === 'reverse')
                progress = 1 - Math.sin((timestamp - this.startTimestamp) / this.duration * Math.PI / 2);
            else if(this.direction === 'alternate')
                progress = Math.sin((timestamp - this.startTimestamp) / this.duration * Math.PI);
            this.object[this.property] = this.value.from * (1 - progress) + this.value.to * progress;
        } else {
            this.startTimestamp = performance.now();
        }
        console.log(this.object[this.property], this.value.from, this.value.to)
    }
}
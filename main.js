export class MainLoop {

    constructor(updateFunction, renderFunction) {
        this.dt = 0;
        this.last = window.performance.now();
        this.step = 1/30;
        this.isNeedsRender = true;

        this.actions = {};
        this.updateFunction = updateFunction;
        this.renderFunction = renderFunction;
    }

    registerKeyBindings(keyBinding) {

        // TODO superceeded by window.onkeypress()

        window.addEventListener("keydown", function (e) {
                this.actions[keyBinding[e.keyCode]] = true;
            }.bind(this)
        );

        window.addEventListener("keyup", function (e) {
                this.actions[keyBinding[e.keyCode]] = false;
            }.bind(this)
        );
    }

    start() {
        window.requestAnimationFrame(function() {this.frame()}.bind(this));
    }

    needsRender() {
        this.isNeedsRender = true;
    }

    frame() {
        let now = window.performance.now();

        // If browser looses focus then dt will become very large
        // when focus is resumed; so cap dt at 1.0 secs
        this.dt = this.dt + Math.min(1, (now - this.last) / 1000);
  
        while (this.dt > this.step) {
            this.dt = this.dt - this.step;
  
           // increment by a fixed step
           if (this.updateFunction(this.step, this.actions)) {
               this.isNeedsRender = true;
           }
        }
  
        if (this.isNeedsRender) {
            this.isNeedsRender = false;
            // pass remainder into render so it could be used for smoothing (interpolation)
            // (at this point dt < step)
            this.renderFunction(this.dt);
        }
  
        this.last = now;
  
        window.requestAnimationFrame(function() {this.frame()}.bind(this));
    }
} 

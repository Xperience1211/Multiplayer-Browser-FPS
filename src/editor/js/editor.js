import Vue from "./vue.js";
import map from "lodash/map";

new Vue({
    el: "#editor",
    data() {
        return {
            draw_object: null,
            grid: {
                cell_size: 32,
                rows: 16,
                cols: 16
            },
            level: {
                objects: [
                    {
                        id: "wall-1",
                        x: 1,
                        y: 1,
                        w: 1,
                        h: 1
                    }
                ]
            }
        };
    },
    computed: {
        levelViewStyle() {
            const { cols, rows, cell_size } = this.grid;
            return {
                width: cols * cell_size + "px",
                height: rows * cell_size + "px"
            };
        },
        cellStyle() {
            return {
                width: this.grid.cell_size + "px",
                height: this.grid.cell_size + "px"
            };
        },
        levelRects() {
            const { cell_size } = this.grid;
            return map(this.level.objects, obj => {
                const { id, x, y, w, h } = obj;
                const style = {
                    top: y * cell_size + "px",
                    left: x * cell_size + "px",
                    width: w * cell_size + "px",
                    height: h * cell_size + "px"
                };

                return { id, style };
            });
        }
    },
    methods: {
        drawObjectBegin(x, y) {
            console.log("Begin");
            this.draw_object = this.addObject(x, y);
        },
        drawObject(x, y) {
            if (this.draw_object !== null) {
                console.log("Draw");
                this.draw_object.w = x - this.draw_object.x + 1;
                this.draw_object.h = y - this.draw_object.y + 1;
            }
        },
        drawObjectEnd(x, y) {
            if (this.draw_object !== null) {
                console.log("End");
                this.draw_object = null;
            }
        },
        addObject(x, y, w = 1, h = 1) {
            const id = Date.now().toString(16);
            const obj = { id, x, y, w, h };
            this.level.objects.push(obj);
            return obj;
        }
    }
});

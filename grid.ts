function locRow(l: tiles.Location): number {
    return (l as any)._row
}
function locCol(l: tiles.Location): number {
    return (l as any)._col
}

const DATA_ROW = "__gridRow"
const DATA_COL = "__gridCOL"

//% color=#8c6049 icon="\uf00a"
//% groups='["Grid"]'
namespace grid {
    let _currentGrid: Grid;

    export class Grid {
        public sprites: Sprite[][];
        public columns: number;
        public rows: number;

        constructor(protected tm: tiles.TileMap) {
            this.columns = tm.areaWidth() >> tm.scale;
            this.rows = tm.areaHeight() >> tm.scale;

            this.sprites = []
            for (let x = 0; x < this.columns; x++) {
                this.sprites[x] = []
            }
        }

        public place(sprite: Sprite, loc: tiles.Location) {
            if (sprite.flags & sprites.Flag.Destroyed)
                return
            const x = locCol(loc)
            if (x < 0 || this.columns <= x)
                return
            const y = locRow(loc)
            if (y < 0 || this.rows <= y)
                return
            this.remove(sprite);
            this.remove(this.sprites[x][y])
            this.sprites[x][y] = sprite
            const d = sprite.data()
            d[DATA_COL] = x
            d[DATA_ROW] = y
            loc.place(sprite)
        }

        public remove(sprite: Sprite) {
            if (!sprite)
                return
            const d = sprite.data()
            const c: number = d[DATA_COL]
            const r: number = d[DATA_ROW]
            if (c === undefined || r === undefined)
                return
            this.sprites[c][r] = undefined
        }
    }

    function currentGrid(): Grid {
        if (!_currentGrid) {
            const tm = game.currentScene().tileMap
            if (!tm)
                throw "Cannot use sprite grid; no tilemap has been set";
            _currentGrid = new Grid(tm)
        }
        return _currentGrid;
    }

    //% block="grid place %sprite=variables_get(mySprite) on top of $loc=mapgettile"
    export function place(sprite: Sprite, loc: tiles.Location) {
        currentGrid().place(sprite, loc);
    }

    //% block="grid location of $sprite=variables_get(mySprite)"
    export function getLocation(sprite: Sprite): tiles.Location {
        //return tiles.getTileLocation(screenCoordinateToTile(s.x), screenCoordinateToTile(s.y));
        const d = sprite.data()
        const r = d[DATA_ROW]
        const c = d[DATA_COL]
        if (r === undefined || c === undefined)
            return null
        return game.currentScene().tileMap.getTile(c, r)
    }

    //% block="add $loc=mapgettile cols $columns rows $rows"
    export function add(loc: tiles.Location, columns: number, rows: number): tiles.Location {
        const c = locCol(loc)
        const r = locRow(loc)
        return game.currentScene().tileMap.getTile(c + columns, r + rows)
    }

    //% block="move $sprite=variables_get(mySprite) by cols $columns rows $rows"
    export function move(sprite: Sprite, columns: number, rows: number) {
        const loc = getLocation(sprite)
        const c = locCol(loc)
        const r = locRow(loc)
        const newLoc = game.currentScene().tileMap.getTile(c + columns, r + rows)
        place(sprite, newLoc);        
    }

    //% block="swap $sprite1=variables_get(mySprite) and $sprite2=variables_get(mySprite2)"
    export function swap(sprite1: Sprite, sprite2: Sprite) {
        let l1 = getLocation(sprite1)
        if (!l1)
            return
        let l2 = getLocation(sprite2)
        if (!l2)
            return
        place(sprite1, l2)
        place(sprite2, l1)
    }

    //% block="grid move $sprite=variables_get(mySprite) with buttons"
    export function moveWithButtons(sprite: Sprite) {
        controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
            move(sprite, 0, -1)
        })
        controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
            move(sprite, 0, 1)
        })
        controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
            move(sprite, -1, 0)
        })
        controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
            move(sprite, 1, 0)
        })
    }
}
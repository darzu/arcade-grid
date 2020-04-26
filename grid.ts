function locRow(l: tiles.Location): number {
    return (l as any)._row
}
function locCol(l: tiles.Location): number {
    return (l as any)._col
}

//% color=#c96a3a icon="\uf00a"
//% groups='["Grid"]'
namespace grid {
    export class Grid {
        public sprites: Sprite[][];

        constructor(protected tm: tiles.TileMap) {
            const columns = tm.areaWidth() >> tm.scale;
            const rows = tm.areaHeight() >> tm.scale;

            this.sprites = []
            for (let x = 0; x < columns; x++) {
                this.sprites[x] = []
            }
        }

        public place(sprite: Sprite, loc: tiles.Location) {
            if (sprite.flags & sprites.Flag.Destroyed)
                return
            const x = locCol(loc)
            const y = locRow(loc)
            this.sprites[x][y] = sprite
            loc.place(sprite)
        }
    }

    //% block
    //% blockSetVariable=spriteGrid
    export function newSpriteGrid(): Grid {
        const tm = game.currentScene().tileMap
        if (!tm)
            throw "No tilemap set; cannot create a Grid";
        return new Grid(tm)
    }

    //% block="in %grid=variables_get(spriteGrid) place %sprite=variables_get(mySprite) on top of $loc=mapgettile"
    export function place(grid: Grid, sprite: Sprite, loc: tiles.Location) {
        return grid.place(sprite, loc);
    }
}
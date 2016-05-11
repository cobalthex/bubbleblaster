import animate;
import ui.View;
import ui.TextView;
import ui.ImageView;
import ui.ScoreView;
import ui.ParticleEngine as ParticleEngine;
import ui.resource.Image as Image;
import math.geom.Vec2D as Vec2D;
import math.geom.Line as Line;
import math.util as util;
import src.Bubble as Bubble;
import src.Cannon as Cannon;

var score = 0;
var padding = 10;

exports = Class(ui.ImageView, function(supr)
{
    this.init = function(opts)
    {
        opts = merge(opts, {
            x: 0,
            y: 0,
            width: GC.app.width,
            height: GC.app.height,
            image: 'resources/images/ui/bg1_center.png'
        });

        supr(this, 'init', [opts]);

        this.build();
    };

    var bubbleSize = 32;
    var bubbleColors = ['red', 'yellow', 'green', 'blue', 'purple'];
    var headerImage = new Image({ url: 'resources/images/ui/bg1_header.png' });
    var yOffset = 80;
    var yHeight = bubbleSize * (Math.sqrt(3) / 2);
    var nColumns = [10, 9];
    var nRows = 5;

    this.spawn = function(options)
    {
        var bubble = new Bubble(options);
        bubble.style.width = bubble.style.height = bubbleSize;
        bubble.style.offsetX = bubble.style.offsetY = -bubbleSize / 2;
        this.addSubview(bubble);
        return bubble;
    }

    this.countRemaining = function()
    {
        return this.bubbles.reduce(function(acc, val)
        {
            return acc + val.reduce(function(acc, val) { return acc + (val ? 1 : 0); }, 0);
        }, 0);
    }

    this.getXOffset = function(row)
    {
        return (this.style.width - (bubbleSize * (nColumns[row % 2] - 1))) / 2;
    }

    this.getCellAt = function(x, y)
    {
        var r = bubbleSize / 2;
        y = Math.floor((y + r - yOffset) / yHeight);
        x = Math.floor((x + r - this.getXOffset(y)) / bubbleSize);
        return { x: x, y: y };
    }

    //is a cell occupied by a bubble
    this.isOccupied = function(cellX, cellY)
    {
        if (cellX < 0 || cellY < 0
            || cellY >= this.bubbles.length
            || cellX >= this.bubbles[cellY].length)
            return false;
        return !!this.bubbles[cellY][cellX];
    }

    //is a point (x,y) colliding with a ball in a cell
    this.isColliding = function(x, y, cellX, cellY)
    {
        if (!this.isOccupied(cellX, cellY))
            return false;

        var cell = this.bubbles[cellY][cellX];
        return new Line(x, y, cell.style.x, cell.style.y).getLength() <= bubbleSize;
    }

    //pop a bubble
    this.popOne = function(bubble)
    {
        bubble.removeFromSuperview();
        this.emit('bubble:popped');
    }

    //starting at cell(X|Y), check for chains of at least 3 and pop (using a bfs search)
    this.pop = function(color, cell)
    {
        var chain = [];
        var queue = [this.bubbles[cell.y][cell.x]];
        while (queue.length > 0)
        {
            var first = queue.shift();

            if (!first
                || !this.isOccupied(first.cell.x, first.cell.y)
                || this.bubbles[first.cell.y][first.cell.x].color != color)
                continue;

            var left, right;
            //search left and right until finding a bubble that does not match
            for (left = first.cell.x;
                 left >= 0
                 && (this.bubbles[first.cell.y][left] ? this.bubbles[first.cell.y][left].color : null) == color;
                 left--);

            for (right = first.cell.x;
                 right <= this.bubbles[first.cell.y].length
                 && (this.bubbles[first.cell.y][right] ? this.bubbles[first.cell.y][right].color : null) == color;
                 right++);


            //repeat the process for the rows below and above
            for (var i = left + 1; i < right; i++)
            {
                chain.push(this.bubbles[first.cell.y][i]);
                this.bubbles[first.cell.y][i] = null;

                if (this.isOccupied(i, first.cell.y - 1))
                    queue.push(this.bubbles[first.cell.y - 1][i]);
                if (this.isOccupied(i, first.cell.y + 1))
                    queue.push(this.bubbles[first.cell.y + 1][i]);

                var dir = first.cell.y % 2 == 0 ? -1 : 1;
                if (this.isOccupied(i + dir, first.cell.y - 1))
                    queue.push(this.bubbles[first.cell.y - 1][i + dir]);
                if (this.isOccupied(i + dir, first.cell.y + 1))
                    queue.push(this.bubbles[first.cell.y + 1][i + dir]);
            }
        }

        if (chain.length > 2)
        {
            var particles = this.particles.obtainParticleArray(chain.length);
            for (var i in chain)
            {
                this.popOne(chain[i]);

                particles[i].width = 32;
                particles[i].height = 20;
                particles[i].x = chain[i].style.x - particles[i].width / 2;
                particles[i].y = chain[i].style.y - particles[i].height / 2;
                particles[i].image = 'resources/images/particles/10.png';
                particles[i].dopacity = -1;
                particles[i].dy = -10;
                particles[i].delay = i * 100;
            }
            this.particles.emitParticles(particles);

            this.detach();
        }
        else
        {
            for (var i in chain)
                this.bubbles[chain[i].cell.y][chain[i].cell.x] = chain[i];
        }
    }

    //peform a mark and sweep and drop any bubbles that aren't reachable from the ceiling
    this.detach = function()
    {
        //bfs search to mark all reachable bubbles
        var queue = this.bubbles[0].slice(0);
        while (queue.length > 0)
        {
            var first = queue.shift();

            if (!first || first.marked)
                continue;

            var left, right;
            //search left and right until finding a bubble that does not match
            for (left = first.cell.x; left >= 0 && this.isOccupied(left, first.cell.y); left--);
            for (right = first.cell.x; right < this.bubbles[first.cell.y].length && this.isOccupied(right, first.cell.y); right++);

            //repeat the process for the rows below and above
            for (var i = left + 1; i < right; i++)
            {
                this.bubbles[first.cell.y][i].marked = true;

                if (this.isOccupied(i, first.cell.y - 1))
                    queue.push(this.bubbles[first.cell.y - 1][i]);
                if (this.isOccupied(i, first.cell.y + 1))
                    queue.push(this.bubbles[first.cell.y + 1][i]);

                var dir = first.cell.y % 2 == 0 ? -1 : 1;
                if (this.isOccupied(i + dir, first.cell.y - 1))
                    queue.push(this.bubbles[first.cell.y - 1][i + dir]);
                if (this.isOccupied(i + dir, first.cell.y + 1))
                    queue.push(this.bubbles[first.cell.y + 1][i + dir]);
            }
        }

        //detach all bubbles that were not marked (and reset all the others)
        for (var y = 0; y < this.bubbles.length; y++)
        {
            for (var x = 0; x < this.bubbles[y].length; x++)
            {
                if (!this.isOccupied(x, y))
                    continue;

                if (!this.bubbles[y][x].marked)
                {
                    this.bubbles[y][x].falling = true;
                    this.bubbles[y][x] = null;
                }
                else
                    this.bubbles[y][x].marked = false;
            }
        }
    }

    this.tick = function(dt)
    {
        this.particles.runTick(dt);

        if (this.visibleScore < this.score)
        {
            this.visibleScore = Math.min(this.score, this.visibleScore + 10);
            this.scoreboard.setText(this.visibleScore.toString());
        }

        if (!this.active)
            return;

        //perform a spacial search for collision detection
        var colliding = false;

        var pos = { x: this.active.style.x, y: this.active.style.y };
        var cell = this.getCellAt(pos.x, pos.y);
        cell.x = Math.max(0, Math.min(nColumns[cell.y % 2], cell.x));

        //if currently inside an occupied cell, push back out
        if (this.isOccupied(cell.x, cell.y))
        {
            var bubble = this.bubbles[cell.y][cell.x];
            var length = (bubbleSize + 2) - new Line(pos.x, pos.y, bubble.style.x, bubble.style.y).getLength();
            var norm = this.active.velocity.getUnitVector();
            pos.x -= (norm.x * length);
            pos.y -= (norm.y * length);
            cell = this.getCellAt(pos.x, pos.y);
            cell.x = Math.max(0, Math.min(nColumns[cell.y % 2], cell.x));
            colliding = true;
        }

        //check all 6 points around active bubble for collisions
        //assuming cell looks like
        // a/\b
        // c||d
        // e\/f
        colliding |= this.isColliding(pos.x, pos.y, cell.x - 1, cell.y - 1); //a
        colliding |= this.isColliding(pos.x, pos.y, cell.x + 1, cell.y - 1); //b
        colliding |= this.isColliding(pos.x, pos.y, cell.x + 1, cell.y); //d
        colliding |= this.isColliding(pos.x, pos.y, cell.x + 1, cell.y + 1); //f
        colliding |= this.isColliding(pos.x, pos.y, cell.x - 1, cell.y + 1); //e
        colliding |= this.isColliding(pos.x, pos.y, cell.x - 1, cell.y); //c

        if (colliding || pos.y <= 80)
        {
            this.active.velocity.x = 0;
            this.active.velocity.y = 0;

            //align to the grid
            this.active.style.y = yOffset + (cell.y * yHeight);
            this.active.style.x = this.getXOffset(cell.y) + (cell.x * bubbleSize);

            //add a new row to accomodate
            if (cell.y >= this.bubbles.length)
                this.bubbles.push(new Array(nColumns[cell.y % 2]));

            this.active.cell = cell;
            this.bubbles[cell.y][cell.x] = this.active;

            this.pop(this.active.color, cell);

            //make the staged bubble visible
            if (this.next.length > 1)
                this.next[1].style.opacity = 1;

            //move the previously staged bubble to the chamber
            if (this.next.length > 0)
            {
                this.next[0].style.x = this.cannon.barrel.style.x + this.cannon.barrel.style.anchorX;
                this.next[0].style.y = this.cannon.barrel.style.y + this.cannon.barrel.style.anchorY;
                this.next[0].style.zIndex = 2;
                this.next[0].style.opacity = 0.5;
            }
            else if (this.countRemaining() > 0)
                this.emit('game:lose');

            if (this.countRemaining() < 1)
                this.emit('game:win');

            //the screen has been filled
            if (pos.y >= this.cannon.base.style.y - bubbleSize)
            {
                this.emit('game:lose');
                this.active = null;
                return;
            }

            this.active = null;
        }
        else
        {
            this.active.style.x = pos.x;
            this.active.style.y = pos.y;
        }
    };

    this.bubbles = [];
    this.next = [];
    this.active = null;
    this.score = this.visibleScore = 0;

    this.build = function()
    {
        this.on('app:start', function()
        {
            this.active = null;
            this.score = this.visibleScore = 0;

            while (this.bubbles.length > 0)
            {
                var top = this.bubbles.pop();
                while (top.length > 0)
                {
                    var bubble = top.pop();
                    if (bubble)
                        bubble.removeFromSuperview();
                }
            }

            //spawn bubbles
            for (var y = 0; y < nRows; y++)
            {
                var cols = nColumns[y % 2];
                var xOffset = this.getXOffset(y);

                var row = [];

                for (var x = 0; x < cols; x++)
                {
                    row.push(this.spawn({
                        x: xOffset + (x * bubbleSize),
                        y: yOffset + (y * yHeight),
                        cellX: x,
                        cellY: y,
                        color: bubbleColors[util.random(0, bubbleColors.length)]
                    }));
                }
                this.bubbles.push(row);
            }

            for (var i = 0; i < 50; i++)
                this.next.push(this.spawn({ color: bubbleColors[util.random(0, bubbleColors.length)], x: 50, y: 440, opacity: 0 }));

            this.next[0].style.x = this.cannon.barrel.style.x + this.cannon.barrel.style.anchorX;
            this.next[0].style.y = this.cannon.barrel.style.y + this.cannon.barrel.style.anchorY;
            this.next[0].style.opacity = 0.5;
            this.next[0].style.zIndex = 2;
            animate(this.next[1]).then({ opacity: 1 }, 1000);

        }.bind(this));

        this.header = new ui.ImageView({
            superview: this,
            x: 0,
            y: 0,
            width: GC.app.width,
            height: yOffset,
            image: headerImage,
        });

        this.cannon = new Cannon();
        this.addSubview(this.cannon);

        this.scoreboard = new ui.ScoreView({
            superview: this,
            x: 0,
            y: 10,
            scale: 0.8,
            width: GC.app.width / 0.8,
            height: 50,
            characterData: {
                '0': { 'image': 'resources/images/ui/score/score0.png' },
                '1': { 'image': 'resources/images/ui/score/score1.png' },
                '2': { 'image': 'resources/images/ui/score/score2.png' },
                '3': { 'image': 'resources/images/ui/score/score3.png' },
                '4': { 'image': 'resources/images/ui/score/score4.png' },
                '5': { 'image': 'resources/images/ui/score/score5.png' },
                '6': { 'image': 'resources/images/ui/score/score6.png' },
                '7': { 'image': 'resources/images/ui/score/score7.png' },
                '8': { 'image': 'resources/images/ui/score/score8.png' },
                '9': { 'image': 'resources/images/ui/score/score9.png' }
            }
        });

        this.particles = new ParticleEngine({
            superview: this,
            width: 1,
            height: 1,
            zIndex: 1,
            initCount: 50
        });

        this.on('InputSelect', function(event, point)
        {
            //already an active bubble
            if (this.active || this.next.length < 1)
                return;

            var theta = this.cannon.barrel.style.r - (Math.PI / 2); //cannon's rotation is already clamped
            var vel = new Vec2D({ magnitude: 500, angle: theta });

            this.active = this.next.shift();
            this.active.velocity = vel;
            this.active.style.zIndex = 0;
            this.active.style.opacity = 1;
        });

        this.on('bubble:popped', function()
        {
            this.score += 10;
        });
    };
});
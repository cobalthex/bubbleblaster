import animate;
import ui.ImageView;
import ui.resource.Image as Image;
import math.geom.Vec2D as Vec2D;
import src.soundcontroller as soundcontroller;

var bubbleColors = ['red', 'yellow', 'green', 'blue', 'purple'];
var bubbleImages = {};
for (var i in bubbleColors)
{
	var color = bubbleColors[i];
	bubbleImages[color] = new Image({ url: 'resources/images/bubbles/ball_' + color + '.png' });
}

exports = Class(ui.ImageView, function(supr)
{
	this.init = function(opts)
	{
		var image = bubbleImages[opts.color];
		opts = merge(opts, {
			image:  image,
			width:  image.getWidth(),
			height: image.getHeight(),
		});

		this.color = opts.color;
		this.velocity = opts.velocity ? opts.velocity : new Vec2D({ x: 0, y: 0 });
		this.falling  = !!opts.falling;
		this.cell = { x: opts.cellX, y: opts.cellY };
		this.pos = { x: 0, y: 0 };

		supr(this, 'init', [opts]);

		var sound = soundcontroller.getSound();
	}

	//update position of bubble
	//if not falling, position is stored in pos{x,y} (updated from style.x/y)
	this.tick = function(dt)
	{
		dt = dt / 1000;

		if (this.falling)
			this.velocity.y += 50;

		if (this.velocity.y != 0)
		{
			this.style.x = this.style.x + (this.velocity.x * dt);
			this.style.y = this.style.y + (this.velocity.y * dt);

			//bounce of the side walls
			if (this.style.x > GC.app.width - (this.style.width / 2))
				this.velocity.x *= -1;
			else if (this.style.x < this.style.width / 2)
				this.velocity.x *= -1;

			//stick to the roof
			if (this.style.y <= 80)
				this.style.y = 80;
		}

		if (this.style.y > GC.app.height - this.style.height)
		{
			this.getSuperview().emit('bubble:popped');
			this.removeFromSuperview();
		}
	};
});
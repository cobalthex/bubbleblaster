import animate;
import ui.View;
import ui.ImageView;
import ui.resource.Image as Image;
import src.soundcontroller as soundcontroller;

exports = Class(ui.View, function(supr)
{
	this.init = function(opts)
	{
		opts = merge(opts, {
			zIndex: 1,
			layout: 'box'
		});

		supr(this, 'init', [opts]);
		this.build();

		var sound = soundcontroller.getSound();
	}

	this.build = function()
	{
		var baseImage = new Image({ url: 'resources/images/cannon/base.png' });
		var barrelImage = new Image({ url: 'resources/images/cannon/barrel.png' });

		var scale = 0.8;

		var baseWidth = baseImage.getWidth() * scale;
		var baseHeight = baseImage.getHeight() * scale;
		this.base = new ui.ImageView({
			superview: this,
			image: baseImage,
			x: (GC.app.width - baseWidth) / 2,
			y: GC.app.height - baseHeight + 40,
			width: baseWidth,
			height: baseHeight
		});

		var barrelWidth = barrelImage.getWidth() * scale;
		var barrelHeight = barrelImage.getHeight() * scale;
		this.barrel = new ui.ImageView({
			superview: this,
			image: barrelImage,
			x: (GC.app.width - barrelWidth) / 2,
			y: GC.app.height - baseHeight - 40,
			width: barrelWidth,
			height: barrelHeight,
			anchorX: barrelWidth / 2,
			anchorY: barrelHeight / 2 + 10,
		});

		var track = function(event, point)
		{
		    var x = this.barrel.style.x + this.barrel.style.anchorX;
		    var y = this.barrel.style.y + this.barrel.style.anchorY;
		    var r = Math.atan2(point.x - x, y - point.y);
		    r = r < -1.2 ? -1.2 : (r > 1.2 ? 1.2 : r); //clamp to upward angles
		    this.barrel.style.r = r;
		}.bind(this);

		this.on('InputStart', track);
		this.on('InputMove', track);
	};
});
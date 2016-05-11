import ui.View;
import ui.ImageView;
import ui.resource.Image as Image;

exports = Class(ui.ImageView, function(supr)
{
	this.init = function(opts)
	{
		opts = merge(opts, {
			x: 0,
			y: 0,
			image: 'resources/images/ui/bg1_center.png'
		});

		supr(this, 'init', [opts]);

		this.build();
	};

	this.build = function()
	{
		var loseImage = new Image({ url: 'resources/images/ui/lose.png' });
		var lose = new ui.ImageView({
			superview: this,
			x: (GC.app.width - loseImage.getWidth()) / 2,
			y: 50,
			width: loseImage.getWidth(),
			height: loseImage.getHeight(),
			image: loseImage
		});

		var scale = 0.5;
		var backImage = new Image({ url: 'resources/images/ui/back.png' });
		var backButton = new ui.ImageView({
			superview: this,
			x: (GC.app.width - (backImage.getWidth() * scale)) / 2,
			y: GC.app.height - 80,
			scale: scale,
			width: backImage.getWidth(),
			height: backImage.getHeight(),
			image: backImage
		});

		backButton.on('InputSelect', function()
		{
			this.emit('reset');
		}.bind(this));
	};
});

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
		var logoImage = new Image({ url: 'resources/images/ui/logo.png' });
		var logo = new ui.ImageView({
			superview: this,
			x: (GC.app.width - logoImage.getWidth()) / 2,
			y: 50,
			width: logoImage.getWidth(),
			height: logoImage.getHeight(),
			image: logoImage
		});

		var playImage = new Image({ url: 'resources/images/ui/play.png' });
		var startButton = new ui.ImageView({
			superview: this,
			x: (GC.app.width - playImage.getWidth()) / 2,
			y: 300,
			width: playImage.getWidth(),
			height: playImage.getHeight(),
			image: playImage
		});

		startButton.on('InputSelect', bind(this, function()
		{
			this.emit('title:start');
		}));
	};
});

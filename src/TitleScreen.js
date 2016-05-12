import animate;
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
			y: 100,
			opacity: 0,
			width: logoImage.getWidth(),
			height: logoImage.getHeight(),
			image: logoImage
		});

		var playImage = new Image({ url: 'resources/images/ui/play.png' });
		var playButton = new ui.ImageView({
			superview: this,
			x: (GC.app.width - playImage.getWidth()) / 2,
			y: 300,
			opacity: 0,
			width: playImage.getWidth(),
			height: playImage.getHeight(),
			image: playImage
		});

		playButton.on('InputSelect', function()
		{
			if (playButton.style.opacity < 1)
				return;

			this.emit('title:start');
			animate(playButton).now({ opacity: 0 }, 1000);
		}.bind(this));


		this.on('app:start', function()
		{
			animate(playButton).now({ opacity: 1 }, 1000);
			animate(logo).now({ opacity: 1, y: 50 }, 1000);
		});
	};
});

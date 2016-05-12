import ui.View;
import ui.ImageView;
import ui.ScoreView;
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
		this.on('app:start', function(score)
		{
			this.scoreboard.setText(score.toString());
		}.bind(this));

        this.scoreboard = new ui.ScoreView({
            superview: this,
            x: 0,
            y: GC.app.height / 1.6,
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

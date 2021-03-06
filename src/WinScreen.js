import ui.View;
import ui.ImageView;
import ui.ScoreView;
import ui.resource.Image as Image;
import ui.ParticleEngine as ParticleEngine;
import math.util as util;
import math.geom.Vec2D as Vec2D;

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

	this.tick = function(dt)
	{
		this.particles.runTick(dt);
	};

	this.build = function()
	{
        var colors = ['red', 'yellow', 'green', 'blue', 'purple'];
		this.on('app:start', function(score)
		{
			this.scoreboard.setText(score.toString());

	        this.emitter = setInterval(function()
	        {
	        	var particles = this.particles.obtainParticleArray(10);
	            for (var i = 0; i < 10; i++)
	            {
	                var vec = new Vec2D({ magnitude: 1000, angle: -util.random(75, 105) / 180 * Math.PI });
	                particles[i].width = particles[i].height = util.random(22, 42);
	                particles[i].x = (GC.app.width - particles[i].width) / 2;
	                particles[i].y = GC.app.height + 50;
	                particles[i].image = 'resources/images/bubbles/ball_' + colors[util.random(0, colors.length)] + '.png';
	                particles[i].dx = vec.x;
	                particles[i].dy = vec.y;
	                particles[i].ddy = 1000;
	                particles[i].delay = i * 50;
	                particles[i].ttl = 3000;
	            }
	            this.particles.emitParticles(particles);
	        }.bind(this), 500);
		}.bind(this));

        this.particles = new ParticleEngine({
            superview: this,
            width: 1,
            height: 1,
            initCount: 50
        });

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

		var winImage = new Image({ url: 'resources/images/ui/win.png' });
		var win = new ui.ImageView({
			superview: this,
			x: (GC.app.width - winImage.getWidth()) / 2,
			y: 50,
			width: winImage.getWidth(),
			height: winImage.getHeight(),
			image: winImage
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
			clearInterval(this.emitter);
		}.bind(this));
	};
});

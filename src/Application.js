import device;
import ui.StackView as StackView;
import ui.ImageView as ImageView;
import src.TitleScreen as TitleScreen;
import src.GameScreen as GameScreen;
import src.LoseScreen as LoseScreen;
import src.WinScreen as WinScreen;
import src.soundcontroller as soundcontroller;

/* Your application inherits from GC.Application, which is
 * exported and instantiated when the game is run.
 */
exports = Class(GC.Application, function ()
{  
    this.width = 320;
    this.height = 0;

  	/* Run after the engine is created and the scene graph is in
  	 * place, but before the resources have been loaded.
  	 */
  	this.initUI = function()
    {
        this.width = 320;
        this.height = Math.max(480, (device.height / device.width) * this.width);

  		var titleScreen = new TitleScreen();
		var gameScreen = new GameScreen();
        var winScreen = new WinScreen();
        var loseScreen = new LoseScreen();

  		this.view.style.backgroundColor = 'black';

  		// Create a stackview of size 320x480, then scale it to fit horizontally
  		// Add a new StackView to the root of the scene graph
  		var rootView = new StackView({
            superview: this,
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
            clip: true,
            scale: device.width / 320
  		});

        rootView.push(titleScreen);
        titleScreen.emit('app:start');

        var sound = soundcontroller.getSound();

        titleScreen.on('title:start', function()
        {
            sound.play('levelmusic');
            rootView.push(gameScreen);
            gameScreen.emit('app:start');
        });

        var resetGame = function()
        {
            rootView.pop();
            rootView.pop();
            titleScreen.emit('app:start');
        }
        winScreen.on('reset', resetGame);
        loseScreen.on('reset', resetGame);

        gameScreen.on('game:lose', function(score)
        {
            rootView.push(loseScreen);
            loseScreen.emit('app:start', score);
        });
        gameScreen.on('game:win', function(score)
        {
            rootView.push(winScreen);
            winScreen.emit('app:start', score);
        });
  	};

  	this.launchUI = function() { };
});

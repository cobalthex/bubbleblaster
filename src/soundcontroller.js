import AudioManager;

exports.sound = null;

/* Initialize the audio files if they haven't been already.
 */
exports.getSound = function () {
  if (!exports.sound) {
    exports.sound = new AudioManager({
      path: 'resources/sounds',
      files: {
        levelmusic: {
          path: 'music',
          volume: 0.5,
          background: true,
          loop: true
        },
        pop: {
          path: 'effects',
          background: false
        },
        shoot: {
          path: 'effects',
          background: false,
        }
      }
    });
  }
  return exports.sound;
};

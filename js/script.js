var UTIL = (function() {
    let util = {};

    util.minMax = function(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    util.map = function(x1, x2, y2) {
      return x1 * y2 / x2;
    }

    return util;
})();

var ACE = (function() {
  let ace = {
    width: null
  };

  const AUDIO_URL = '/js/slideventura.mp3';
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let webAudioSupported = !!AudioContextClass;
  let audioContext = null;
  let gainNode = null;
  let audioBuffer = null;
  let bufferSource = null;
  let loadAudioPromise = null;
  let isPlaying = false;

  var $text = document.getElementById('text');
  var currentPosition = 0;
  var targetPosition = 0;
  var backgroundPosition = 0;
  var currentStep = 0;
  var totalStep = 26;

  let $body, $img;

  ace.init = function() {
      $body  = document.querySelector('body');
      $img = document.querySelector('#img');

      window.addEventListener('resize', function() {
        ACE.getWidth();
      }, true);
      ACE.getWidth();

      $body.addEventListener('mousemove', ACE.move);
      $body.addEventListener('touchmove', ACE.move);

      try {
        audioContext = new AudioContext();
        gainNode = audioContext.createGain();
        gainNode.gain.value = 0;
        gainNode.connect(audioContext.destination);
      } catch (err) {
        audioContext = null;
        gainNode = null;
      }

      loadAudioBuffer().then(function() {
            if (!bufferSource && audioBuffer) {
              bufferSource = audioContext.createBufferSource();
              bufferSource.buffer = audioBuffer;
              bufferSource.loop = true;
              bufferSource.connect(gainNode);
            }
          });

        let startAudio = function() {
          if(isPlaying){
            return;
          }
          isPlaying = true;

          console.log('start');
          $text.style.display = 'none';
          audioContext.resume().then(() => {
            bufferSource.start(0);
          });


          $body.removeEventListener('click', startAudio);
        };

      document.querySelector('#img').addEventListener('click', startAudio);

      $text.style.display = 'block';

      requestAnimationFrame(ACE.animation);
  }

  ace.getWidth = function() {
    let rect = document.getElementById('img').getBoundingClientRect();
    ACE.width = rect.width;
  }

  ace.move = function(e) {
    let currentX;

    if (typeof e.pageX === 'number' && !isNaN(e.pageX)) {
      currentX = e.pageX;
    } else if (e.touches && e.touches.length) {
      let touch = e.touches[e.touches.length - 1];
      currentX = touch.pageX;
    } else if (e.changedTouches && e.changedTouches.length) {
      let touch = e.changedTouches[e.changedTouches.length - 1];
      currentX = touch.pageX;
    } else {
      return;
    }
    let rect = $img.getBoundingClientRect();
    let offsetLeft = rect.left + window.scrollX;
    currentX = UTIL.minMax(currentX - offsetLeft, 0, ACE.width);

    targetPosition = ACE.width - currentX;
  }

  ace.animation = function() {
    currentPosition += (targetPosition - currentPosition) / 6;
    currentStep = Math.round(UTIL.map(currentPosition, ACE.width, totalStep));

    backgroundPosition = Math.max(currentStep, 1) * (ACE.width);


    $img.style.backgroundPositionX =  backgroundPosition + 'px';

    if(isPlaying){
      if (currentStep > 0 && currentStep <= totalStep) {
      let level = UTIL.map(Math.min(Math.max(currentStep - 4, 0), totalStep - 10), totalStep - 10, 0.5);

      gainNode.gain.value = level;
    } else {
      gainNode.gain.value = 0;
    }
    }


    requestAnimationFrame(ACE.animation);
  }

  function loadAudioBuffer() {
    if (!audioContext) {
      return Promise.reject();
    }
    if (audioBuffer) {
      return Promise.resolve(audioBuffer);
    }
    if (loadAudioPromise) {
      return loadAudioPromise;
    }
    loadAudioPromise = fetch(AUDIO_URL)
      .then(function(response) {
        return response.arrayBuffer();
      })
      .then(function(arrayBuffer) {
        return new Promise(function(resolve, reject) {
          audioContext.decodeAudioData(arrayBuffer, resolve, reject);
        });
      })
      .then(function(decodedBuffer) {
        audioBuffer = decodedBuffer;
        return audioBuffer;
      })
      .catch(function(error) {
        loadAudioPromise = null;
        throw error;
      });
    return loadAudioPromise;
  }

  return ace;
})();

ACE.init();

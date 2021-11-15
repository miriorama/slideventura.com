var ACE = (function(){
  var audio = new Audio('/res/slideventura.mp3');
  audio.loop = true;
  audio.volume = 0.5;

  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0];

  var $text = document.getElementById('text');
  var width = document.getElementById('img').offsetWidth;
  var height;
  var currentPosition = 0;
  var targetPosition = 0;
  var backgroundPosition = 0;
  var currentStep = 0;
  var totalStep = 26;

  var ace = {
    init: function() {

      window.addEventListener('resize', function() {
        width = document.getElementById('img').offsetWidth;
      }, true);

      $('body').on('mousemove touchmove', function(e) {
        var currentX;

        if (!isNaN(e.pageX)) {
          currentX = e.pageX;
        } else {
          var touch = event.targetTouches[event.targetTouches.length-1];
          currentX = touch.pageX;
        }
        currentX = minMax(currentX - $('#img').offset().left, 0, width);

        targetPosition = width - currentX;
      });

      $('body').on('click', function(e) {
        audio.play();
        $text.style.display = 'none';
      });

      audio.play();
      if (audio.paused) {
        $text.style.display = 'block';
      }

      function anim(timestamp) {

        currentPosition += (targetPosition - currentPosition) / 6;
        currentStep = Math.round(map(currentPosition, width, totalStep));

			  backgroundPosition = Math.floor(currentStep, 1) * width;

        $('#img').css('background-position-x', backgroundPosition + 'px');

        if (currentStep > 0 && currentStep <= totalStep) {
            audio.volume = map(Math.min(Math.max(currentStep - 4, 0), totalStep - 10), totalStep - 10, 0.5);
        } else {
          audio.volume = 0;
        }
        requestAnimationFrame(anim);
      }
      requestAnimationFrame(anim);

      function map(x1, x2, y2) {
        return x1 * y2 / x2;
      }

      function minMax(value, min, max) {
        return Math.max(min, Math.min(max, value));
      }
    }
  }

  return {
    init: function() {
      return ace.init();
    }
  }
})();

ACE.init();
window.addEventListener('message', function(e) {
  if (!e || !e.data || e.data.type !== 'calculadora-height') return;
  var iframes = document.querySelectorAll('iframe[data-calculadora="1"]');
  for (var i = 0; i < iframes.length; i++) {
    iframes[i].style.height = e.data.value + 'px';
  }
});
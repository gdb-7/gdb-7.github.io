// Landing sequence controller
(function(){
  const root = document.documentElement;
  const reduced = root.classList.contains('reduced-motion');
  const seven = document.querySelector('.landing__frame--seven');
  const onit  = document.querySelector('.landing__frame--onit');

  if (!seven || !onit) return;

  // Sequence timings (ms)
  const FADE_IN  = 800;
  const HOLD     = 2200;
  const FADE_OUT = 650;

  function show(el){
    el.style.opacity = '1';
    el.style.transform = 'none';
  }
  function hide(el){
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
  }

  function runSequence(){
    if (reduced){
      // Reduced motion: show ON IT immediately, no 7
      hide(seven);
      show(onit);
      return;
    }

    // Start with '7'
    show(seven);
    hide(onit);

    // Hold, then fade out 7 → fade in ON IT
    setTimeout(() => {
      hide(seven);
      setTimeout(() => {
        show(onit);
      }, FADE_OUT);
    }, HOLD + FADE_IN);
  }

  // Reset when user scrolls back to top
  function onScroll(){
    const topSection = document.getElementById('top');
    if (!topSection) return;

    const rect = topSection.getBoundingClientRect();
    const atTop = rect.top === 0; // visible from top

    // When top is fully visible, restart sequence
    if (atTop && !reduced){
      hide(onit);
      hide(seven);
      // slight delay to feel natural
      setTimeout(runSequence, 200);
    }
  }

  // Kick off
  runSequence();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

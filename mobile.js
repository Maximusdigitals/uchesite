// Simple mobile nav toggle. Adds/removes .open on .navbar and updates aria-expanded.
(function(){
  document.addEventListener('click', function(e){
    var btn = e.target.closest('.nav-toggle');
    if(!btn) return;
    var navbar = btn.closest('.navbar');
    if(!navbar) return;
    var isOpen = navbar.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close nav when clicking outside on small screens
  document.addEventListener('click', function(e){
    var navbar = document.querySelector('.navbar');
    if(!navbar) return;
    if(!navbar.classList.contains('open')) return;
    if(e.target.closest('.navbar')) return; // clicked inside
    navbar.classList.remove('open');
    var btn = navbar.querySelector('.nav-toggle');
    if(btn) btn.setAttribute('aria-expanded','false');
  });

  // Close nav on escape
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      var navbar = document.querySelector('.navbar');
      if(navbar && navbar.classList.contains('open')){
        navbar.classList.remove('open');
        var btn = navbar.querySelector('.nav-toggle');
        if(btn) btn.setAttribute('aria-expanded','false');
      }
    }
  });
})();

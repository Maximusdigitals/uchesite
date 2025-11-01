// Minimal lightbox: attaches to all images and opens a dismissible overlay showing the full image.
(function(){
  'use strict'
  function createOverlay(){
    let overlay = document.getElementById('simple-lightbox')
    if(overlay) return overlay
    overlay = document.createElement('div')
    overlay.id = 'simple-lightbox'
    overlay.innerHTML = `
      <div class="slb-backdrop" tabindex="-1">
        <button class="slb-close" aria-label="Close">✕</button>
        <div class="slb-inner">
          <img class="slb-image" src="" alt=""/>
          <div class="slb-caption"></div>
          <div class="slb-info" aria-hidden="true">
            <div class="slb-info-row">
              <span class="slb-price"></span>
              <span class="slb-status"></span>
              <span class="slb-dimensions"></span>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(overlay)
    return overlay
  }

  function open(src, alt, imgEl){
    const overlay = createOverlay()
    const img = overlay.querySelector('.slb-image')
    const cap = overlay.querySelector('.slb-caption')
    const info = overlay.querySelector('.slb-info')
    const priceEl = overlay.querySelector('.slb-price')
    const statusEl = overlay.querySelector('.slb-status')
    const dimsEl = overlay.querySelector('.slb-dimensions')

    img.src = src
    img.alt = alt || ''
    cap.textContent = alt || ''

    // Populate info from data attributes if available
    const price = imgEl && imgEl.dataset && imgEl.dataset.price ? imgEl.dataset.price : ''
    const status = imgEl && imgEl.dataset && imgEl.dataset.status ? imgEl.dataset.status : ''
    const dims = imgEl && imgEl.dataset && imgEl.dataset.dimensions ? imgEl.dataset.dimensions : ''

    // Show or hide fields
    if(price){ priceEl.textContent = price; priceEl.style.display = '' } else { priceEl.style.display = 'none' }
    if(status){
      statusEl.textContent = status; statusEl.style.display = ''
      // Normalize status text to assign CSS classes
      const st = (status || '').toString().trim().toLowerCase()
      statusEl.classList.remove('available','sold')
      if(st === 'available' || st === 'available ' || st === 'in stock') statusEl.classList.add('available')
      if(st === 'sold' || st === 'sold out' || st === 'unavailable') statusEl.classList.add('sold')
    } else { statusEl.style.display = 'none' }
    if(dims){ dimsEl.textContent = dims; dimsEl.style.display = '' } else { dimsEl.style.display = 'none' }

    // If no info at all, hide the info bar
    if(!price && !status && !dims){ info.style.display = 'none' } else { info.style.display = '' }

    overlay.classList.add('open')
    document.body.classList.add('slb-open')
    // focus the close button for keyboard users
    const btn = overlay.querySelector('.slb-close')
    try{ btn.focus() }catch(_){}
  }

  function close(){
    const overlay = document.getElementById('simple-lightbox')
    if(!overlay) return
    overlay.classList.remove('open')
    document.body.classList.remove('slb-open')
    const img = overlay.querySelector('.slb-image')
    if(img) img.src = ''
  }

  function onDocClick(e){
    const img = e.target.closest && e.target.closest('img')
    if(!img) return
    // ignore images that are part of controls (unlikely) or SVG images without src
    if(img.closest && img.closest('#simple-lightbox')) return
  const a = img.closest && img.closest('a')
    // If the image is inside an anchor that points to an HTML page or an internal anchor,
    // allow normal navigation (these are site links like portraits.html, commissions.html).
    if(a){
      const href = (a.getAttribute && a.getAttribute('href')) || ''
      const hrefLower = (href || '').toLowerCase()
      if(hrefLower.endsWith('.html') || hrefLower.startsWith('#') || hrefLower === '' ){
        // let the browser navigate normally
        return
      }
    }
    // Otherwise open the image in the lightbox. Prefer data-full if present.
    const full = img.dataset && img.dataset.full ? img.dataset.full : img.src
    if(a) e.preventDefault()
    open(full, img.alt || '', img)
  }

  function init(){
    // Debug helpers: log clicks on page anchors to .html and on images to trace event handling.
    try{
      document.querySelectorAll('a[href$=".html"]').forEach(a => {
        a.addEventListener('click', (ev) => {
          console.log('DEBUG: anchor.html clicked', { href: a.getAttribute('href'), defaultPrevented: ev.defaultPrevented, target: ev.target.tagName })
        }, {capture:true})
      })
      document.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', (ev) => {
          const a = img.closest && img.closest('a')
          console.log('DEBUG: img click', { src: img.getAttribute('src'), inAnchor: !!a, anchorHref: a && a.getAttribute && a.getAttribute('href'), defaultPrevented: ev.defaultPrevented })
        }, {capture:true})
      })
    }catch(_){ }

    // Force navigation for portfolio cards / .html anchors if something else blocks the click.
    try{
      document.querySelectorAll('a.portfolio-card, a[href$=".html"]').forEach(a => {
        a.addEventListener('click', function(e){
          const href = (this.getAttribute && this.getAttribute('href')) || ''
          if(!href || !href.toLowerCase().endsWith('.html')) return
          // allow ctrl/meta or middle-click to open in new tab
          if(e.ctrlKey || e.metaKey || e.button === 1) return
          console.log('DEBUG: forcing navigation to', href)
          e.preventDefault()
          window.location.href = href
        }, {capture:true})
      })
    }catch(_){ }

    document.addEventListener('click', function(e){
      // if clicking on overlay backdrop or close button
      if(e.target.matches && (e.target.matches('.slb-close') || e.target.matches('#simple-lightbox .slb-backdrop') )){
        close(); return
      }
      onDocClick(e)
    }, true)

    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close() })
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})();
(function(){
  const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
  function initLightbox(){
    try{
      console.log('initLightbox running')
    
    }catch(err){ console.error('initLightbox start error', err); }
    try{
    const lb = createOrGetLightbox()
    const lbImage = lb.querySelector('#lb-image')
    const lbCaption = lb.querySelector('#lb-caption')
    let btnClose = lb.querySelector('#lb-close')
    let btnPrev = lb.querySelector('#lb-prev')
    let btnNext = lb.querySelector('#lb-next')
    // Defensive: if any control is missing (due to DOM issues), create them so listeners can attach
    if(!btnClose){
      btnClose = document.createElement('button')
      btnClose.id = 'lb-close'
      btnClose.className = 'lb-close'
      btnClose.setAttribute('aria-label','Close')
      btnClose.textContent = '✕'
      lb.appendChild(btnClose)
      console.warn('lightbox: created fallback close button')
    }
    if(!btnPrev){
      btnPrev = document.createElement('button')
      btnPrev.id = 'lb-prev'
      btnPrev.className = 'lb-prev'
      btnPrev.setAttribute('aria-label','Previous')
      btnPrev.textContent = '‹'
      lb.appendChild(btnPrev)
      console.warn('lightbox: created fallback prev button')
    }
    if(!btnNext){
      btnNext = document.createElement('button')
      btnNext.id = 'lb-next'
      btnNext.className = 'lb-next'
      btnNext.setAttribute('aria-label','Next')
      btnNext.textContent = '›'
      lb.appendChild(btnNext)
      console.warn('lightbox: created fallback next button')
    }
    // Ensure lightbox is focusable
    lb.setAttribute('tabindex','-1')
  let current = -1
  let lastFocused = null

    // Prepare images: select images inside .card wrappers so every image inside a card will be handled
    const imgs = Array.from(document.querySelectorAll('.card img'))
    imgs.forEach(img => {
      if(img.dataset.prepared) return
      // If the author supplied data-thumb, keep it and store full in data-full
      if(img.dataset.thumb){
        img.dataset.src = img.dataset.thumb
      } else if(!img.dataset.src){
        img.dataset.src = img.src || ''
      }
      // If data-full provided, keep it; else set data-full to original if present
      if(!img.dataset.full){
        // prefer any explicit data-full, otherwise try parent anchor href, otherwise fallback to data-src
        const parentA = img.closest && img.closest('a')
        const anchorHref = parentA && parentA.getAttribute && parentA.getAttribute('href')
        img.dataset.full = img.dataset.full || anchorHref || img.dataset.src
      }
      // Set placeholder to avoid heavy downloads
      img.src = PLACEHOLDER
      img.decoding = 'async'
      img.loading = 'lazy'
      img.dataset.prepared = '1'
    })

    // Debug: report counts
    try{
      const cards = Array.from(document.querySelectorAll('.card'))
      console.log('lightbox: found', cards.length, 'cards and', imgs.length, 'images')
      // expose a small debug API for manual inspection
      window.__lightbox_debug = window.__lightbox_debug || {}
      window.__lightbox_debug.counts = { cards: cards.length, images: imgs.length }
    }catch(e){ console.warn('lightbox debug info failed', e) }

    // IntersectionObserver loads thumbnails
    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            const el = entry.target
            el.src = el.dataset.src || el.src
            el.classList.remove('lazy-thumb')
            el.addEventListener('load', () => el.classList.remove('loading'))
            observer.unobserve(el)
          }
        })
      }, {rootMargin: '200px'})
      imgs.forEach(i => {
        i.classList.add('lazy-thumb','loading')
        io.observe(i)
      })
    } else {
      // Fallback: load all after idle
      setTimeout(() => imgs.forEach(i => { i.src = i.dataset.src || i.src; i.classList.remove('lazy-thumb','loading') }), 500)
    }

    function getCards(){ return Array.from(document.querySelectorAll('.card')) }

    function openByIndex(index){
      const cards = getCards()
      const card = cards[index]
      if(!card) return
      openByCard(card)
    }

    function openByCard(card){
      const cards = getCards()
      const index = cards.indexOf(card)
      if(index === -1) return
      const img = card.querySelector('img')
      const caption = card.querySelector('.meta h3')?.textContent?.trim() || ''
      // Use highest priority: data-full, data-src, src
      const full = img?.dataset?.full || img?.dataset?.src || img?.src || ''
      if(!full) return
  current = index
  // save last focused element to restore on close
  try{ lastFocused = document.activeElement }catch(_){}
      lbImage.src = ''
      lbImage.alt = caption
      lbCaption.textContent = caption
  lb.classList.add('open')
  console.log('lightbox: opened index', current)
  // make the lightbox accessible
  lb.setAttribute('aria-hidden','false')
  lb.setAttribute('role','dialog')
  lb.setAttribute('aria-modal','true')
  lb.tabIndex = -1
  try{ lb.focus() }catch(_){}
      document.body.classList.add('lightbox-open')
      // Show spinner (CSS-driven)
      lb.classList.add('loading')
      lbImage.onload = () => { lb.classList.remove('loading'); lbImage.classList.add('loaded') }
      lbImage.onerror = () => { lb.classList.remove('loading'); lbCaption.textContent = caption + ' (failed to load)'}
      // start loading full-res
      lbImage.src = full
    }

    function close(){
      console.log('lightbox: close requested')
      lb.classList.remove('open')
      lb.setAttribute('aria-hidden','true')
      document.body.classList.remove('lightbox-open')
      lbImage.src = ''
      current = -1
      // restore focus to where the user was
      try{ if(lastFocused && lastFocused.focus) lastFocused.focus(); }catch(_){}
    }

    function prev(){
      const cards = getCards()
      if(cards.length === 0) return
      openByIndex((current - 1 + cards.length) % cards.length)
    }
    function next(){
      const cards = getCards()
      if(cards.length === 0) return
      openByIndex((current + 1) % cards.length)
    }

    // Delegated click handler (logs clicks for debugging).
    // If an image is wrapped in an <a href="...">, we preventDefault and open the lightbox.
    document.addEventListener('click', function(e){
      const card = e.target.closest && e.target.closest('.card')
      if(card){
        const tag = e.target.tagName && e.target.tagName.toLowerCase()
        // allow buttons to behave normally
        if(tag === 'button') return
        // If clicked element is within an anchor, prevent navigation so we can open the lightbox
        const anchor = e.target.closest && e.target.closest('a')
        if(anchor && anchor.classList && anchor.classList.contains('no-lightbox')) return
        if(anchor) e.preventDefault()
        let anchorHref = anchor && anchor.getAttribute && anchor.getAttribute('href')
        try{
          const cards = Array.from(document.querySelectorAll('.card'))
          const idx = cards.indexOf(card)
          const cap = card.querySelector('.meta h3')?.textContent?.trim() || ''
          console.log('lightbox: card click', { index: idx, caption: cap, href: anchorHref })
        }catch(_){ }
        // Try to open the lightbox. If for some reason it doesn't open (DOM/CSS issue), fall back to opening the linked image in a new tab.
        try{
          openByCard(card)
          // small timeout to check if lightbox opened; if not, fallback to new tab
          setTimeout(() => {
            const lb = document.getElementById('lightbox')
            const opened = lb && lb.classList && lb.classList.contains('open')
            if(!opened && anchorHref){
              console.warn('lightbox: failed to open overlay, falling back to new tab for', anchorHref)
              window.open(anchorHref, '_blank')
            }
          }, 120)
        }catch(err){
          console.error('lightbox: openByCard failed', err)
          if(anchorHref) window.open(anchorHref, '_blank')
        }
      }
    })

    btnClose.addEventListener('click', close)
    btnPrev.addEventListener('click', prev)
    btnNext.addEventListener('click', next)

    document.addEventListener('keydown', (e) => {
      if(lb.classList.contains('open')){
        if(e.key === 'Escape') close()
        if(e.key === 'ArrowLeft') prev()
        if(e.key === 'ArrowRight') next()
      }
    })

    // backdrop click
    lb.addEventListener('click', (e) => { if(e.target === lb) close() })

    // touch swipe
    let touchStartX = 0, touchStartY = 0
    lb.addEventListener('touchstart', (e) => { const t = e.touches[0]; touchStartX = t.clientX; touchStartY = t.clientY }, {passive:true})
    lb.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0]
      const dx = t.clientX - touchStartX; const dy = t.clientY - touchStartY
      const absX = Math.abs(dx); const absY = Math.abs(dy); const threshold = 40
      if(absX > absY && absX > threshold){ if(dx > 0) prev(); else next() }
      else if(absY > absX && dy > threshold){ close() }
    })

  // expose for testing
  const api = { openByCard, openByIndex, close, prev, next }
  window.__lightbox = api
  return api
    }catch(err){ console.error('initLightbox error', err); }
  }

  function createOrGetLightbox(){
    let lb = document.getElementById('lightbox')
    if(lb) return lb
    lb = document.createElement('div')
    lb.id = 'lightbox'
    lb.className = 'lightbox'
    lb.setAttribute('aria-hidden','true')
    lb.innerHTML = `
      <button class="lb-close" id="lb-close" aria-label="Close">✕</button>
      <button class="lb-prev" id="lb-prev" aria-label="Previous">‹</button>
      <div class="lb-content">
        <img id="lb-image" src="" alt="" />
        <div id="lb-caption" class="lb-caption"></div>
      </div>
      <button class="lb-next" id="lb-next" aria-label="Next">›</button>
    `
    document.body.appendChild(lb)
    return lb
  }

  // Initialize on DOMContentLoaded
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initLightbox)
  } else { initLightbox() }
})();

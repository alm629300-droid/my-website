(function(){
  const byId = (id)=>document.getElementById(id);
  const grid = byId('lessonsGrid');
  const searchInput = byId('searchInput');
  const chips = [...document.querySelectorAll('.chip')];
  const loopToggle = byId('loopToggle');
  const repeatCountSel = byId('repeatCount');
  const yearSpan = byId('year');
  yearSpan.textContent = new Date().getFullYear();

  let activeCat = 'all';
  let query = '';

  function renderCards(){
    grid.innerHTML = '';
    const q = query.trim().toLowerCase();
    const filtered = LESSONS.filter(item => {
      const matchesCat = (activeCat === 'all') || (item.category === activeCat);
      const matchesText = !q || item.sentence.toLowerCase().includes(q) || (item.translation && item.translation.toLowerCase().includes(q));
      return matchesCat && matchesText;
    });

    if(filtered.length === 0){
      grid.innerHTML = '<p class="muted">لا توجد نتائج مطابقة.</p>';
      return;
    }

    filtered.forEach(item => {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `
        <span class="cat">${labelForCat(item.category)}</span>
        <h3 class="sentence">${item.sentence}</h3>
        <div class="preview" data-id="${item.id}" aria-label="تشغيل الفيديو لجملة: ${item.sentence}">
          <div class="play">▶</div>
        </div>
        <div class="actions">
          <button class="open">عرض الفيديو</button>
          <button class="secondary copy">نسخ الجملة</button>
        </div>
      `;
      el.querySelector('.open').addEventListener('click', () => openModal(item));
      el.querySelector('.preview').addEventListener('click', () => openModal(item));
      el.querySelector('.copy').addEventListener('click', () => {
        navigator.clipboard.writeText(item.sentence).then(()=>{
          el.querySelector('.copy').textContent = '✔ تم النسخ';
          setTimeout(()=> el.querySelector('.copy').textContent = 'نسخ الجملة', 1200);
        });
      });
      grid.appendChild(el);
    });
  }

  function labelForCat(cat){
    switch(cat){
      case 'daily': return 'جمل يومية';
      case 'work': return 'جمل عمل';
      case 'travel': return 'جمل سفر';
      case 'friday': return 'جمل الجمعة';
      default: return 'أخرى';
    }
  }

  // Search
  searchInput.addEventListener('input', e => {
    query = e.target.value;
    renderCards();
  });

  // Category chips
  chips.forEach(ch => {
    ch.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      ch.classList.add('active');
      activeCat = ch.dataset.cat;
      renderCards();
    });
  });

  // Modal controls
  const modal = byId('modal');
  const closeModalBtn = byId('closeModal');
  const modalSentence = byId('modalSentence');
  const modalTransl = byId('modalTransl');
  const video = byId('modalVideo');
  const videoSrc = byId('modalSrc');
  const playBtn = byId('playBtn');
  const replayBtn = byId('replayBtn');
  const slowerBtn = byId('slowerBtn');
  const fasterBtn = byId('fasterBtn');

  let remainingRepeats = 1;

  function openModal(item){
    modalSentence.textContent = item.sentence;
    modalTransl.textContent = item.translation || '';
    videoSrc.src = item.videoSrc;
    video.load();
    setupRepeatBehavior();
    modal.classList.remove('hidden');
    setTimeout(()=> video.play(), 50);
  }

  function closeModal(){
    video.pause();
    modal.classList.add('hidden');
  }
  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{
    if(e.target === modal) closeModal();
  });

  playBtn.addEventListener('click', ()=> video.play());
  replayBtn.addEventListener('click', ()=> {
    video.currentTime = 0;
    video.play();
  });
  slowerBtn.addEventListener('click', ()=> { video.playbackRate = Math.max(0.25, (video.playbackRate - 0.25)); });
  fasterBtn.addEventListener('click', ()=> { video.playbackRate = Math.min(2, (video.playbackRate + 0.25)); });

  function setupRepeatBehavior(){
    // Loop toggle has priority, then repeat count
    const countVal = repeatCountSel.value;
    if(loopToggle.checked || countVal === 'infinite'){
      video.loop = true;
      remainingRepeats = Infinity;
    } else {
      video.loop = false;
      remainingRepeats = parseInt(countVal, 10) || 1;
    }
  }

  loopToggle.addEventListener('change', setupRepeatBehavior);
  repeatCountSel.addEventListener('change', setupRepeatBehavior);

  video.addEventListener('ended', ()=>{
    if(remainingRepeats === Infinity) return; // loop=true handles it
    remainingRepeats--;
    if(remainingRepeats > 0){
      video.currentTime = 0;
      video.play();
    }
  });

  // Keyboard shortcuts inside modal
  document.addEventListener('keydown', (e)=>{
    if(modal.classList.contains('hidden')) return;
    if(e.key === 'Escape') closeModal();
    if(e.key === ' ') { e.preventDefault(); video.paused ? video.play() : video.pause(); }
    if(e.key === 'ArrowLeft') video.currentTime = Math.max(0, video.currentTime - 2);
    if(e.key === 'ArrowRight') video.currentTime = Math.min(video.duration, video.currentTime + 2);
  });

  // Initial render
  renderCards();
})();
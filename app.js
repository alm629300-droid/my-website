// app.js - handles dropdown, search shortcut, small interactions
document.addEventListener('DOMContentLoaded', function(){
  // Dropdown toggle
  document.querySelectorAll('.dropbtn').forEach(btn => {
    btn.addEventListener('click', function(e){
      const dd = this.nextElementSibling;
      dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function(e){
    if(!e.target.closest('.dropdown')){
      document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
    }
  });

  // Search button and Enter key (fast client-side navigation to courses page with query in hash)
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  function doSearch(){
    const q = searchInput.value.trim();
    // Navigate to courses page and pass query via hash
    window.location.href = 'courses.html' + (q ? ('#q=' + encodeURIComponent(q)) : '');
  }
  if(searchBtn) searchBtn.addEventListener('click', doSearch);
  if(searchInput) searchInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter') doSearch();
  });

  // Copy buttons on course cards (on courses.html)
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', function(){
      const text = this.getAttribute('data-copy') || '';
      navigator.clipboard.writeText(text).then(()=>{
        const previous = this.textContent;
        this.textContent = '✔ تم النسخ';
        setTimeout(()=> this.textContent = previous, 1200);
      });
    });
  });

  // On courses.html, filter by hash query
  if(window.location.pathname.endsWith('courses.html')){
    const hash = window.location.hash;
    if(hash.startsWith('#q=')){
      const q = decodeURIComponent(hash.slice(3));
      // simple client-side filter: hide cards not matching the q in title or description
      document.querySelectorAll('.courses-grid .card').forEach(card => {
        const title = card.querySelector('h3')?.textContent || '';
        const desc = card.querySelector('p')?.textContent || '';
        const match = (title + ' ' + desc).toLowerCase().includes(q.toLowerCase());
        card.style.display = match ? '' : 'none';
      });
    }
  }

  // set years
  const y = new Date().getFullYear();
  ['year','year2','year3','year4'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.textContent = y;
  });
});
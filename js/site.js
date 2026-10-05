(() => {
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const attr = esc;
  const chunk = (arr, n) => Array.from({length: Math.ceil(arr.length/n)}, (_,i) => arr.slice(i*n,i*n+n));
  const goodLink = v => v && v !== '#' && v !== 'None';
  const logoHtml = nickname => `|<b>${esc(nickname.slice(0,4))}</b><span>${esc(nickname.slice(4))}</span><i>_</i>`;

  function photoHtml(path, alt) {
    return path ? `<img src="${attr(path)}" alt="${attr(alt)}">` : `<div class="empty-photo">${esc(alt.toUpperCase())}</div>`;
  }
  function favicon(link) {
    try { return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(link).hostname)}&sz=128`; }
    catch { return ''; }
  }

  function carousel(name, pagesHtml) {
    if (!pagesHtml.length) return `<div class="cert-empty">Nothing added yet.</div>`;
    return `<div class="carousel-shell" data-carousel="${attr(name)}">
      <div class="carousel-nav"><button class="carousel-btn" type="button" data-prev aria-label="Previous">‹</button><span class="carousel-counter" data-counter></span><button class="carousel-btn" type="button" data-next aria-label="Next">›</button></div>
      <div class="carousel-viewport"><div class="carousel-track" data-track>${pagesHtml.join('')}</div></div>
    </div>`;
  }

  function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(carousel => {
      const track = carousel.querySelector('[data-track]');
      const pages = [...carousel.querySelectorAll('.carousel-page')];
      const prev = carousel.querySelector('[data-prev]');
      const next = carousel.querySelector('[data-next]');
      const counter = carousel.querySelector('[data-counter]');
      const viewport = carousel.querySelector('.carousel-viewport');
      if (!track || !pages.length) return;
      let index=0, sx=0, sy=0;
      const render=()=>{track.style.transform=`translate3d(-${index*100}%,0,0)`; if(prev)prev.disabled=index===0; if(next)next.disabled=index===pages.length-1; if(counter)counter.textContent=`${index+1} / ${pages.length}`};
      const go=d=>{index=Math.max(0,Math.min(pages.length-1,index+d));render()};
      prev?.addEventListener('click',()=>go(-1)); next?.addEventListener('click',()=>go(1));
      viewport?.addEventListener('touchstart',e=>{sx=e.changedTouches[0].clientX;sy=e.changedTouches[0].clientY},{passive:true});
      viewport?.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)go(dx<0?1:-1)},{passive:true});
      render();
    });
  }

  function initLightbox() {
    const box=$('#imageLightbox'), image=$('#lightboxImage'), title=$('#lightboxTitle');
    const close=()=>{box?.classList.remove('show');box?.setAttribute('aria-hidden','true');if(image)image.src='';document.body.classList.remove('no-scroll')};
    document.addEventListener('click',e=>{
      const btn=e.target.closest('.preview-button:not([disabled])');
      if(btn?.dataset.image && box && image){image.src=btn.dataset.image;image.alt=btn.dataset.title||'Preview';if(title)title.textContent=btn.dataset.title||'';box.classList.add('show');box.setAttribute('aria-hidden','false');document.body.classList.add('no-scroll')}
      if(e.target.closest('[data-close-lightbox]')) close();
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }

  function initMenu() {
    const toggle=$('#menuToggle'), sidebar=$('#sidebar');
    toggle?.addEventListener('click',()=>{const open=sidebar.classList.toggle('mobile-open');toggle.setAttribute('aria-expanded',open?'true':'false');toggle.textContent=open?'×':'☰'});
    sidebar?.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{sidebar.classList.remove('mobile-open');toggle?.setAttribute('aria-expanded','false');if(toggle)toggle.textContent='☰'}));
  }

  async function load() {
    try {
      const res=await fetch('data/portfolio.json',{cache:'no-store'}); if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const d=await res.json(), s=d.settings||{};
      document.title=`${s.nickname||'HackYoU'} — ${s.headline||'Portfolio'}`;
      document.querySelectorAll('[data-logo]').forEach(el=>el.innerHTML=logoHtml(s.nickname||'HackYoU'));
      $('#nickname').textContent=s.nickname||'HackYoU'; $('#headline').textContent=s.headline||''; $('#heroText').textContent=s.hero_text||'';
      if(s.hero_bg) $('#home').style.setProperty('--hero',`url("${s.hero_bg}")`);
      $('#avatar').innerHTML=s.avatar?`<img src="${attr(s.avatar)}" alt="${attr(s.nickname||'Avatar')}">`:'<span>⌁</span>';
      $('#heroTags').innerHTML=(d.hero_tags||[]).map((x,i)=>`<span class="tag ${i===0?'hot':''}">${esc(x)}</span>`).join('');
      $('#socials').innerHTML=[['LinkedIn',s.linkedin,'in'],['GitHub',s.github,'◉'],['Telegram',s.telegram,'➤'],['Email',s.email?`mailto:${s.email}`:'','✉']].map(([label,url,icon])=>goodLink(url)?`<a href="${attr(url)}" aria-label="${label}" ${label!=='Email'?'target="_blank" rel="noopener noreferrer"':''}>${icon}</a>`:'').join('');
      $('#profilePhoto').innerHTML=photoHtml(s.profile_photo,'Profile photo'); $('#workPhoto').innerHTML=photoHtml(s.work_photo,'Work photo');
      $('#aboutText').innerHTML=[s.about_1,s.about_2,s.about_3].filter(Boolean).map(x=>`<p>${esc(x)}</p>`).join('');
      $('#meta').innerHTML=`<span>⌖ ${esc(s.location||'')}</span><span>▣ ${esc(s.work_mode||'')}</span><span>● ${esc(s.availability||'')}</span>`;
      $('#experienceList').innerHTML=(d.experience||[]).map(e=>`<article class="job"><b>${esc(e.title)}</b><small>${esc(e.date)}</small><em>${esc(e.company)}</em><ul>${String(e.description||'').split(/\r?\n/).filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article>`).join('');
      const groups={}; (d.skills||[]).forEach(x=>(groups[x.category]??=[]).push(x)); $('#skillsList').innerHTML=Object.entries(groups).map(([cat,items])=>`<div class="skill-group"><strong>${esc(cat)}</strong><div class="chips">${items.map(x=>`<span>${esc(x.name)}</span>`).join('')}</div></div>`).join('');

      const certPages=chunk(d.certificates||[],2).map(page=>`<div class="carousel-page"><div class="cert-page-grid">${page.map(c=>`<article class="cert ${String(c.name).includes('eJPT')?'ejpt':''}"><button class="cert-image-button preview-button" type="button" data-image="${attr(c.image||'')}" data-title="${attr(c.name||'')}" ${c.image?'':'disabled'} aria-label="Open ${attr(c.name||'certificate')}">${c.image?`<img src="${attr(c.image)}" alt="${attr(c.name)} certificate"><span class="image-hint">CLICK TO EXPAND</span>`:'<div class="cert-placeholder"><span>+</span><small>ADD CERTIFICATE IMAGE</small></div>'}</button><div class="cert-body"><div class="cert-title-row"><b>${esc(c.name)}</b>${c.date?`<small class="cert-date">${esc(c.date)}</small>`:''}</div><small class="cert-issuer">${esc(c.issuer)}</small>${c.description?`<span class="cert-description">${esc(c.description)}</span>`:''}<div class="cert-actions">${c.file?`<a class="cert-link" href="${attr(c.file)}" target="_blank" rel="noopener">Open certificate ↗</a>`:''}${goodLink(c.link)?`<a class="cert-link" href="${attr(c.link)}" target="_blank" rel="noopener">Verify ↗</a>`:''}</div></div></article>`).join('')}</div></div>`);
      $('#certificatesList').innerHTML=carousel('certificates',certPages);

      const galleryPages=chunk(d.gallery||[],6).map(page=>`<div class="carousel-page"><div class="gallery-page-grid">${page.map(g=>`<button class="gallery-image-button preview-button" type="button" data-image="${attr(g.image)}" data-title="${attr(g.title||'Gallery photo')}" aria-label="Open ${attr(g.title||'gallery photo')}"><img src="${attr(g.image)}" alt="${attr(g.title||'Gallery photo')}" loading="lazy"></button>`).join('')}</div></div>`);
      $('#galleryList').innerHTML=carousel('gallery',galleryPages);

      $('#projectsList').innerHTML=(d.projects||[]).map(p=>`<article class="project-box"><b>${esc(p.title)}</b><p>${esc(p.description)}</p><div class="chips">${String(p.tags||'').split(',').map(x=>x.trim()).filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}</div>${goodLink(p.link)?`<a class="cert-link" href="${attr(p.link)}" target="_blank" rel="noopener">Open project ↗</a>`:''}</article>`).join('');
      $('#ctfList').innerHTML=(d.ctf||[]).map(c=>{const logo=c.icon||favicon(c.link), inner=`<div class="ctf-head"><span class="ctf-logo-wrap">${logo?`<img class="ctf-logo" src="${attr(logo)}" alt="${attr(c.name)} icon" loading="lazy"><span class="ctf-fallback">${esc((c.name||'?')[0].toUpperCase())}</span>`:`<span class="ctf-fallback always">${esc((c.name||'?')[0].toUpperCase())}</span>`}</span><span class="ctf-name"><b>${esc(c.name)}</b><small>${goodLink(c.link)?'Open profile ↗':''}</small></span><i>${esc(c.status)}</i></div><p>${esc(c.description)}</p>`;return goodLink(c.link)?`<a class="ctf-item ctf-clickable" href="${attr(c.link)}" target="_blank" rel="noopener noreferrer">${inner}</a>`:`<article class="ctf-item">${inner}</article>`}).join('');
      $('#contactsList').innerHTML=[['in','LinkedIn',s.linkedin,s.linkedin_label],['◉','GitHub',s.github,s.github_label],['➤','Telegram',s.telegram,s.telegram_label],['✉','Email',s.email?`mailto:${s.email}`:'',s.email]].map(([icon,label,url,sub])=>goodLink(url)?`<a class="contact" href="${attr(url)}" ${label!=='Email'?'target="_blank" rel="noopener noreferrer"':''}><b>${icon}</b><span>${label}<small>${esc(sub||'')}</small></span></a>`:'').join('');
      $('#footer').innerHTML=`| ${esc(s.nickname||'HackYoU')}_ <span>${esc(s.footer_text||'')}</span><span>“${esc(s.quote||'')}”</span>`;
      initCarousels();
    } catch (e) {
      console.error(e); const main=document.querySelector('main'); if(main)main.insertAdjacentHTML('afterbegin','<div class="load-error">Could not load data/portfolio.json. If you opened index.html directly, start a local web server: <b>python3 -m http.server 8000</b></div>');
    }
  }
  initMenu(); initLightbox(); load();
})();

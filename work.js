const workTabs=[...document.querySelectorAll('[data-work-tab]')];
const workPanels=workTabs.map(tab=>document.getElementById(tab.dataset.workTab));
function selectWorkView(selectedTab,moveToTop=false){
  const selectedPanel=document.getElementById(selectedTab.dataset.workTab);
  for(const tab of workTabs){const selected=tab===selectedTab;tab.classList.toggle('active',selected);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;}
  for(const panel of workPanels)panel.hidden=panel!==selectedPanel;
  if(moveToTop)window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
workTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectWorkView(tab,true));
  tab.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();const next=workTabs[(index+(event.key==='ArrowRight'?1:-1)+workTabs.length)%workTabs.length];next.focus();selectWorkView(next);}});
});
document.querySelectorAll('.experiments-bottom [data-work-tab]').forEach(button=>button.addEventListener('click',()=>selectWorkView(workTabs.find(tab=>tab.dataset.workTab===button.dataset.workTab),true)));
document.querySelectorAll('[data-placeholder-link]').forEach(link=>link.addEventListener('click',event=>event.preventDefault()));
document.querySelectorAll('[data-tab-group]').forEach(group=>{
  const tabs=[...group.querySelectorAll('[role="tab"]')];
  tabs.forEach((tab,index)=>{
    const select=()=>{for(const item of tabs){const active=item===tab;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!active;}};
    tab.addEventListener('click',select);
    tab.addEventListener('keydown',event=>{let nextIndex=index;if(event.key==='ArrowDown'||event.key==='ArrowRight')nextIndex=(index+1)%tabs.length;else if(event.key==='ArrowUp'||event.key==='ArrowLeft')nextIndex=(index-1+tabs.length)%tabs.length;else return;event.preventDefault();tabs[nextIndex].focus();tabs[nextIndex].click();});
  });
});
const conceptModal=document.getElementById('concept-preview-modal');
const conceptModalTitle=document.getElementById('concept-preview-title');
const conceptModalKicker=document.getElementById('concept-preview-kicker');
const conceptModalDescription=document.getElementById('concept-preview-description');
const conceptModalBody=document.getElementById('concept-preview-body');
const conceptModalViewer=conceptModal?.querySelector('.concept-modal-viewer');
let lastPreviewTrigger=null;
let ebookPageObserver=null;
function clearConceptPreviewMedia(){ebookPageObserver?.disconnect();ebookPageObserver=null;conceptModalViewer?.querySelector('video')?.pause();conceptModalViewer?.querySelector('spline-viewer')?.remove();conceptModalViewer?.querySelector('iframe')?.remove();conceptModalViewer?.querySelector('.ebook-pages')?.remove();}
function closeConceptPreview(){if(!conceptModal||conceptModal.hidden)return;clearConceptPreviewMedia();conceptModal.hidden=true;conceptModal.classList.remove('spline-modal','pdf-modal');document.body.classList.remove('preview-open');lastPreviewTrigger?.focus();}
document.querySelectorAll('[data-preview-modal]').forEach(button=>button.addEventListener('click',()=>{
  lastPreviewTrigger=button;
  const type=button.dataset.previewModal;
  const splineUrl=button.dataset.splineUrl;
  conceptModalTitle.textContent=button.dataset.previewTitle||'Preview';
  const video=button.dataset.previewVideo;
  conceptModalKicker.textContent=type==='product'?'PRODUCT CONCEPT':type==='spline'?'SPLINE INTERACTION':type==='pdf'?(button.dataset.previewKicker||'E-BOOK PREVIEW'):'MOTION PREVIEW';
  conceptModalBody.replaceChildren();
  if(type==='pdf'){
    conceptModalDescription.hidden=true;
    const pages=Number(button.dataset.previewPages)||18;
    const pagePath=button.dataset.previewPagePath||'assets/education-ebook-pages/page-';
    const pageExtension=(button.dataset.previewPageExtension||'jpg').replace(/^\./,'');
    const pageList=document.createElement('div');
    pageList.className='ebook-pages';
    pageList.setAttribute('aria-label',`${conceptModalTitle.textContent}, ${pages} pages`);
    for(let page=1;page<=pages;page++){
      const image=document.createElement('img');
      const pageUrl=`${pagePath}${String(page).padStart(2,'0')}.${pageExtension}`;
      image.alt=`Page ${page} of ${conceptModalTitle.textContent}`;
      image.decoding='async';
      // Preserve the source page shape. E-books supply their shared page ratio;
      // long reports can use a distinct ratio so their content is not squashed.
      if(button.dataset.previewPageRatio)image.style.aspectRatio=button.dataset.previewPageRatio;
      if(page===1){image.src=pageUrl;image.fetchPriority='high';}
      else image.dataset.src=pageUrl;
      pageList.append(image);
    }
    conceptModalViewer.replaceChildren(pageList);
    conceptModal.classList.add('pdf-modal');
  }else if(video){
    conceptModalDescription.textContent=button.dataset.previewDescription||'';
    conceptModalDescription.hidden=!conceptModalDescription.textContent;
    const copy=button.closest('.concept-card')?.querySelector('.concept-preview-copy');
    if(copy)conceptModalBody.append(copy.content.cloneNode(true));
    const videoType=video.toLowerCase().endsWith('.mp4')?'video/mp4':'video/webm';
    conceptModalViewer.innerHTML=`<video controls autoplay playsinline><source src="${video}" type="${videoType}">Your browser does not support this video.</video>`;
    const previewVideo=conceptModalViewer.querySelector('video');
    if(button.dataset.previewVideoFit==='square')previewVideo.classList.add('square-fit-preview-video');
    previewVideo?.play().catch(()=>{});
  }else if(splineUrl){
    conceptModalDescription.hidden=false;
    conceptModalDescription.textContent=button.dataset.previewDescription||'';
    conceptModalBody.replaceChildren();
    conceptModalViewer.replaceChildren();
    const viewer=document.createElement('spline-viewer');
    viewer.setAttribute('url',splineUrl);
    viewer.setAttribute('aria-label',`${conceptModalTitle.textContent} interactive 3D scene`);
    conceptModalViewer.append(viewer);
    conceptModal.classList.add('spline-modal');
  }else{
    conceptModalDescription.hidden=true;
    conceptModalBody.replaceChildren();
    conceptModalViewer.innerHTML=`<div class="concept-modal-placeholder"><span>${type==='spline'?'[SPLINE EMBED WILL GO HERE]':'[VIDEO FILE WILL GO HERE]'}</span><i aria-hidden="true">↗</i></div>`;
  }
  conceptModal.hidden=false;
  document.body.classList.add('preview-open');
  if(type==='pdf'){
    const pendingPages=conceptModalViewer.querySelectorAll('.ebook-pages img[data-src]');
    if('IntersectionObserver' in window){
      ebookPageObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const image=entry.target;image.src=image.dataset.src;delete image.dataset.src;ebookPageObserver.unobserve(image);}}),{root:conceptModalViewer,rootMargin:'700px 0px'});
      pendingPages.forEach(image=>ebookPageObserver.observe(image));
    }else pendingPages.forEach(image=>{image.src=image.dataset.src;delete image.dataset.src;});
  }
  conceptModal.querySelector('.concept-modal-close').focus();
}));
conceptModal?.querySelectorAll('[data-modal-close]').forEach(element=>element.addEventListener('click',closeConceptPreview));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeConceptPreview();});
const artLightbox=document.getElementById('art-lightbox');
const artLightboxImage=artLightbox?.querySelector('.art-lightbox-image');
let lastArtTrigger=null;
function closeArtLightbox(){if(!artLightbox||artLightbox.hidden)return;artLightbox.hidden=true;artLightboxImage.removeAttribute('src');document.body.classList.remove('preview-open');lastArtTrigger?.focus();}
document.querySelectorAll('[data-art-preview]').forEach(button=>button.addEventListener('click',event=>{
  if(event.target.closest('a'))return;
  lastArtTrigger=button;
  artLightboxImage.src=button.dataset.artPreview;
  artLightbox.hidden=false;
  document.body.classList.add('preview-open');
  artLightbox.querySelector('.art-lightbox-close').focus();
}));
document.querySelectorAll('.social-post-card[role="button"]').forEach(card=>card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();card.click();}}));
artLightbox?.addEventListener('click',event=>{if(event.target===artLightbox||event.target.closest('.art-lightbox-close'))closeArtLightbox();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeArtLightbox();});

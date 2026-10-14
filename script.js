document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{const target=document.querySelector(link.getAttribute('href'));if(target){event.preventDefault();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}}));
document.querySelectorAll('.topbar').forEach(header=>{
  const toggle=header.querySelector('.menu-toggle');
  const nav=header.querySelector('#site-navigation');
  if(!toggle||!nav)return;
  const setOpen=open=>{
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
    nav.classList.toggle('is-open',open);
  };
  toggle.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true'));
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setOpen(false)));
  document.addEventListener('click',event=>{if(!header.contains(event.target))setOpen(false)});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){setOpen(false);toggle.focus()}});
  matchMedia('(min-width: 721px)').addEventListener('change',event=>{if(event.matches)setOpen(false)});
});

const storyReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!storyReducedMotion&&'IntersectionObserver'in window){
  document.body.classList.add('has-reveal');
  const storyObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');storyObserver.unobserve(entry.target);}}),{threshold:.16});
  document.querySelectorAll('.story-reveal').forEach(element=>storyObserver.observe(element));
  const parallaxItems=[...document.querySelectorAll('[data-parallax]')];
  let storyFrame=false;
  const moveStoryImages=()=>{for(const item of parallaxItems){const distance=item.getBoundingClientRect().top-innerHeight*.5;item.style.setProperty('--story-shift',`${Math.max(-14,Math.min(14,distance*-.018))}px`);item.classList.add('story-parallax');}storyFrame=false;};
  addEventListener('scroll',()=>{if(!storyFrame){requestAnimationFrame(moveStoryImages);storyFrame=true;}},{passive:true});
  moveStoryImages();
}
const storyVideos=document.querySelectorAll('video[data-play-in-view]');
if('IntersectionObserver'in window){
  const videoObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    const video=entry.target;
    if(entry.isIntersecting) video.play().catch(()=>{});
    else video.pause();
  }),{threshold:.35});
  storyVideos.forEach(video=>videoObserver.observe(video));
}else storyVideos.forEach(video=>video.play().catch(()=>{}));

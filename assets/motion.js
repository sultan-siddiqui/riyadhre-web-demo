/* Native scrolling and original flat SVG choreography, in the Riyadh Re palette. */
(function(){
 'use strict';
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let context=null;
 const video=document.getElementById('hero-video');
 const filmControl=document.querySelector('.hero-video-control');
 let videoVisible=true,filmPaused=false;
 const interactiveTimelines=new Map();

 function splitLines(){document.querySelectorAll('[data-lines]').forEach(el=>{if(el.querySelector('.line-mask'))return;el.innerHTML=el.innerHTML.split(/<br\s*\/?\s*>/i).map(line=>`<span class="line-mask"><span class="line-content">${line}</span></span>`).join('');});}
 function syncFilmControl(){
  if(!video||!filmControl)return;
  filmControl.setAttribute('aria-label',video.paused?'Play brand film':'Pause brand film');
  filmControl.querySelector('span').textContent=video.paused?'Play film':'Pause film';
  const path=filmControl.querySelector('path');
  path.setAttribute('d',video.paused?'M8 5 18 12 8 19Z':'M9 6v12M15 6v12');
  path.setAttribute('fill',video.paused?'currentColor':'none');
  path.setAttribute('stroke',video.paused?'none':'currentColor');
 }
 function manageVideo(){
  if(!video)return;
  if(preference.matches||filmPaused||!videoVisible||document.hidden){video.pause();syncFilmControl();}
  else video.play().then(syncFilmControl).catch(()=>{document.body.classList.add('video-blocked');syncFilmControl();});
 }
 function bindFilm(){
  if(!video)return;
  video.muted=true;
  video.addEventListener('play',syncFilmControl);video.addEventListener('pause',syncFilmControl);
  video.addEventListener('error',()=>{document.body.classList.add('video-blocked');if(filmControl)filmControl.hidden=true;});
  filmControl?.addEventListener('click',()=>{filmPaused=!filmPaused;manageVideo();});
  const observer=new IntersectionObserver(entries=>{videoVisible=entries[0].isIntersecting;manageVideo();},{threshold:.05});observer.observe(video.closest('.home-hero'));
  document.addEventListener('visibilitychange',manageVideo);
  manageVideo();
 }
 function bindExplorer(){
  const labels={treaty:'01 / TREATY REINSURANCE',facultative:'02 / FACULTATIVE REINSURANCE',property:'03 / PROPERTY & CASUALTY',specialty:'04 / SPECIALTY LINES'};
  document.querySelectorAll('.solutions-explorer').forEach(section=>{
   const rows=section.querySelectorAll('[data-solution]');
   function select(row){
    const key=row.dataset.solution;
    rows.forEach(other=>other.classList.toggle('is-active',other===row));
    section.querySelectorAll('[data-solution-panel]').forEach(panel=>{const current=panel.dataset.solutionPanel===key;panel.classList.toggle('is-current',current);panel.setAttribute('aria-hidden',String(!current));});
    section.querySelector('.scene-label').textContent=labels[key];
   }
   rows.forEach(row=>{row.addEventListener('pointerenter',()=>select(row));row.addEventListener('focus',()=>select(row));});
   if(rows[0])select(rows[0]);
  });
 }
 function bindIllustrations(){
  document.querySelectorAll('[data-value-motion]').forEach(button=>{
   const play=()=>{if(!preference.matches)interactiveTimelines.get(button)?.restart();};
   button.addEventListener('pointerenter',play);button.addEventListener('focus',play);button.addEventListener('click',play);
  });
  document.querySelectorAll('.capability-grid article').forEach(card=>{
   const play=()=>{if(!preference.matches)interactiveTimelines.get(card.querySelector('[data-risk-graphic]'))?.restart();};
   card.addEventListener('pointerenter',play);card.addEventListener('focusin',play);
  });
 }
 function valueTimeline(button,gsap){
  const q=s=>button.querySelectorAll(s);
  const timeline=gsap.timeline({paused:true,defaults:{duration:1.15,ease:'power2.inOut'}});
  const type=Number(button.dataset.valueMotion);
  if(type===0){
   timeline.fromTo(q('.partner-left'),{x:-14},{x:12},0).fromTo(q('.partner-right'),{x:14},{x:-12},0)
    .fromTo(q('.value-connection'),{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:1},.3)
    .fromTo(q('.value-core'),{scale:.5,svgOrigin:'150 100'},{scale:1.35},.3)
    .to(q('.partner-left'),{x:0,duration:1},1.5).to(q('.partner-right'),{x:0,duration:1},1.5)
    .to(q('.value-core'),{scale:1,duration:1},1.5);
  }else if(type===1){
   timeline.fromTo(q('.growth-rings .halo-contour'),{scale:.78,svgOrigin:'150 109',opacity:.4},{scale:1,opacity:.75,stagger:.065},0)
    .fromTo(q('.growth-line'),{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:1.6},.25)
    .fromTo(q('.growth-point'),{attr:{cy:147}},{attr:{cy:49},duration:1.6},.25)
    .to(q('.growth-point'),{attr:{cy:147},duration:.9},2.1);
  }else{
   timeline.fromTo(q('.trust-rings .halo-contour'),{opacity:.4},{opacity:.8,stagger:.065},0)
    .fromTo(q('.trust-seal'),{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:1.65},.15)
    .fromTo(q('.trust-core'),{scale:.65,opacity:0,svgOrigin:'150 100'},{scale:1,opacity:1,duration:.9},1.1);
  }
  return timeline;
 }
 function riskTimeline(el,gsap){
  const q=s=>el.querySelectorAll(s);
  const drawing=q('.risk-drawing path');drawing.forEach(path=>path.setAttribute('pathLength','1'));
  const timeline=gsap.timeline({paused:true,defaults:{ease:'power2.inOut'}});
  timeline.fromTo(drawing,{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:1.45,stagger:.07},0)
   .fromTo(q('.risk-halo .halo-contour'),{opacity:.18},{opacity:.65,duration:1.4,stagger:.08},0);
  if(q('.crane-load').length)timeline.fromTo(q('.crane-load'),{y:-12},{y:0,duration:1.5},.4);
  if(q('.risk-flame').length)timeline.fromTo(q('.risk-flame'),{y:4,opacity:.6},{y:-3,opacity:1,duration:1.1},.5).to(q('.risk-flame'),{y:0,duration:1.1},1.7);
  if(q('.portfolio-block').length)timeline.fromTo(q('.portfolio-block'),{scaleY:.6,transformOrigin:'50% 100%'},{scaleY:1,duration:1.5,stagger:.13},.2);
  if(q('.network-nodes circle').length)timeline.fromTo(q('.network-nodes circle'),{opacity:.25},{opacity:1,duration:.8,stagger:.14},.3);
  if(q('.cyber-core').length)timeline.fromTo(q('.cyber-core'),{scale:.85,svgOrigin:'150 100'},{scale:1,duration:1.2},.6);
  if(q('.credit-point').length)timeline.fromTo(q('.credit-point'),{attr:{cx:100,cy:101}},{attr:{cx:188,cy:55},duration:1.9},.3).to(q('.credit-point'),{attr:{cx:100,cy:101},duration:.8},2.6);
  if(q('.capacity-node').length)timeline.fromTo(q('.capacity-node'),{x:-12},{x:12,duration:1.3,stagger:.15},.2).to(q('.capacity-node'),{x:0,duration:1.2},1.8);
  if(q('.partner-left').length)timeline.fromTo(q('.partner-left'),{x:-12},{x:8,duration:1.4},0).to(q('.partner-left'),{x:0,duration:1.1},1.6);
  if(q('.partner-right').length)timeline.fromTo(q('.partner-right'),{x:12},{x:-8,duration:1.4},0).to(q('.partner-right'),{x:0,duration:1.1},1.6);
  return timeline;
 }
 function revealSections(gsap){
  // Animate individual content, never a dialog's ancestor: profiles retain full contrast.
  const selector='.eyebrow,h2:not([data-lines]),p,.button,.trust-heading,.trust-rating,.trust-item,.solution-row,.news-meta,.news-card h3,.news-card>.text-link,.person-role,.person-card>h3,.person-card>.text-link,.news-controls';
  document.querySelectorAll('main section').forEach(section=>{
   section.dataset.scrollReveal='true';
   const candidates=[...section.querySelectorAll(selector)].filter(el=>el.closest('section')===section&&!el.closest('dialog,[data-reveal],.story-chapter,.contact-form,.job,.career-general,.office-address,.home-hero'));
   section.querySelectorAll('.contact-form,.job,.career-general,.office-address').forEach(el=>{if(el.closest('section')===section)candidates.push(el);});
   candidates.filter(el=>!candidates.some(parent=>parent!==el&&parent.contains(el))).forEach((el,i)=>{
    gsap.fromTo(el,{y:20,opacity:0},{y:0,opacity:1,duration:1.05,delay:Math.min(i%3*.055,.11),scrollTrigger:{trigger:el,start:'top 96%',once:true}});
   });
  });
  document.querySelectorAll('.site-footer .footer-statement,.site-footer .footer-main>div,.site-footer .footer-bottom').forEach(el=>{
   gsap.fromTo(el,{y:20,opacity:0},{y:0,opacity:1,duration:1.05,scrollTrigger:{trigger:el,start:'top 97%',once:true}});
  });
  document.querySelectorAll('.article-body p,.article-source,.article-meta,.section-nav').forEach(el=>{
   gsap.fromTo(el,{y:16,opacity:0},{y:0,opacity:1,duration:1,scrollTrigger:{trigger:el,start:'top 96%',once:true}});
  });
 }
 function choreograph(){
  context?.revert();context=null;interactiveTimelines.clear();
  document.body.classList.toggle('motion-reduced',preference.matches);
  if(preference.matches||!window.gsap||!window.ScrollTrigger){manageVideo();return;}
  const gsap=window.gsap;gsap.registerPlugin(window.ScrollTrigger);
  try{
   context=gsap.context(()=>{
    gsap.config({force3D:false});
    gsap.defaults({ease:'power3.out'});
    document.querySelectorAll('[data-lines]').forEach(el=>{
     const hero=el.closest('.home-hero,.page-hero,.article-header');
     gsap.fromTo(el.querySelectorAll('.line-content'),{yPercent:105,opacity:.2},{yPercent:0,opacity:1,duration:1.2,stagger:.11,delay:hero?.1:0,scrollTrigger:hero?undefined:{trigger:el,start:'top 94%',once:true}});
    });
    document.querySelectorAll('[data-reveal]').forEach(el=>{
     const hero=el.closest('.home-hero,.page-hero');
     gsap.fromTo(el,{y:20,opacity:0},{y:0,opacity:1,duration:1.1,delay:hero?.3:0,scrollTrigger:hero?undefined:{trigger:el,start:'top 96%',once:true}});
    });
    revealSections(gsap);
    document.querySelectorAll('.image-reveal').forEach(el=>{gsap.fromTo(el,{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:1.4,scrollTrigger:{trigger:el,start:'top 95%',once:true}});});
    document.querySelectorAll('.brand-art:not(.story-art)').forEach(el=>{
     gsap.fromTo(el.querySelector('.brand-pattern'),{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:1.6,scrollTrigger:{trigger:el,start:'top 95%',once:true}});
     gsap.fromTo(el.querySelector('.brand-line'),{x:20,opacity:0},{x:0,opacity:.85,duration:1.3,delay:.2,scrollTrigger:{trigger:el,start:'top 95%',once:true}});
    });
    document.querySelectorAll('.page-art .brand-pattern').forEach(el=>{gsap.fromTo(el,{x:12},{x:-12,ease:'none',scrollTrigger:{trigger:el.closest('.page-hero'),start:'top top',end:'bottom top',scrub:1.5}});});
    document.querySelectorAll('[data-value-motion]').forEach(button=>{
     const timeline=valueTimeline(button,gsap);interactiveTimelines.set(button,timeline);
     window.ScrollTrigger.create({trigger:button,start:'top 90%',once:true,onEnter:()=>timeline.restart()});
    });
    document.querySelectorAll('[data-risk-graphic]').forEach(el=>{
     const timeline=riskTimeline(el,gsap);interactiveTimelines.set(el,timeline);
     window.ScrollTrigger.create({trigger:el,start:'top 91%',once:true,onEnter:()=>timeline.restart()});
    });
    const story=document.querySelector('.risk-story');
    if(story){
     const flow=gsap.timeline({scrollTrigger:{trigger:story,start:'top top+=110',end:'bottom bottom',scrub:1.4}});
     flow.fromTo(story.querySelector('.story-contours'),{scale:.96,svgOrigin:'1920 1182'},{scale:1,duration:1,ease:'none'},0)
      .fromTo(story.querySelectorAll('.story-contour'),{strokeOpacity:.65},{strokeOpacity:1,stagger:.015,duration:.3,ease:'none'},0)
      .fromTo(story.querySelector('.story-trace'),{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:1,ease:'none'},0);
     story.querySelectorAll('.story-chapter').forEach(chapter=>{
      gsap.fromTo(chapter.querySelectorAll('h3,p,.text-link'),{y:20,opacity:.1},{y:0,opacity:1,duration:1.15,stagger:.11,scrollTrigger:{trigger:chapter,start:'top 90%',once:true}});
     });
    }
    document.querySelectorAll('.detail-photo .photo,.contact-city .photo,.article-image .photo').forEach(el=>{gsap.fromTo(el,{scale:1.06,y:10},{scale:1.06,y:-10,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:1.6}});});
    document.querySelectorAll('.floating-portrait').forEach((el,i)=>{gsap.fromTo(el,{y:12+i*6},{y:-12,scrollTrigger:{trigger:el.closest('.people-intro'),start:'top 75%',end:'bottom 60%',scrub:1.6}});});
    document.querySelectorAll('.teaser-portraits img,.floating-portrait .portrait').forEach(el=>{gsap.fromTo(el,{opacity:0},{opacity:1,duration:1.2,scrollTrigger:{trigger:el,start:'top 95%',once:true}});});
    document.querySelectorAll('.hero-photo-tile').forEach(el=>{gsap.fromTo(el,{y:20,opacity:0},{y:0,opacity:1,duration:1.2,delay:.2});});
   });
  }catch(error){context?.revert();context=null;console.warn('Motion restored to its static layout.',error);}
  manageVideo();
 }
 function boot(){
  splitLines();bindExplorer();bindFilm();bindIllustrations();choreograph();
  preference.addEventListener('change',choreograph);
  document.querySelectorAll('.job').forEach(job=>job.addEventListener('toggle',()=>{if(job.open&&!preference.matches&&window.gsap){window.gsap.fromTo(job.querySelector('.job-body'),{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:.55});window.ScrollTrigger?.refresh();}}));
  window.addEventListener('load',()=>window.ScrollTrigger?.refresh(),{once:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

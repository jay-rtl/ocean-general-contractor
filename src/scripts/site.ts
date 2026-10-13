import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);

let disposePage: (()=>void) | undefined;

function initialize() {
  disposePage?.();
  const abort = new AbortController();
  const {signal}=abort;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktopQuery=window.matchMedia('(min-width: 801px) and (pointer: fine)');
  const desktop=desktopQuery.matches;
  let lenis:Lenis|undefined;
  const cleanup:Array<()=>void>=[];
  if(!reduced && desktop){
    lenis=new Lenis({duration:0.85,smoothWheel:true,anchors:true});
    lenis.on('scroll',ScrollTrigger.update);
    const tick=(time:number)=>lenis?.raf(time*1000);
    gsap.ticker.add(tick);
    cleanup.push(()=>{gsap.ticker.remove(tick);lenis?.destroy();});
  }

  const menuButton=document.querySelector<HTMLButtonElement>('.menu-toggle');
  const menu=document.querySelector<HTMLElement>('.mobile-menu');
  const closeMenu=(returnFocus=false)=>{
    menuButton?.setAttribute('aria-expanded','false');
    menuButton?.setAttribute('aria-label','Open navigation');
    menu?.classList.remove('open');
    if(menu)menu.inert=true;
    document.body.classList.remove('menu-open');
    lenis?.start();
    if(returnFocus)menuButton?.focus({preventScroll:true});
  };
  menuButton?.addEventListener('click',()=>{
    if(menuButton.getAttribute('aria-expanded')==='true'){closeMenu(true);return;}
    menuButton.setAttribute('aria-expanded','true');menuButton.setAttribute('aria-label','Close navigation');
    if(menu){menu.inert=false;menu.classList.add('open');}
    document.body.classList.add('menu-open');lenis?.stop();
    menu?.querySelector<HTMLAnchorElement>('a')?.focus({preventScroll:true});
  },{signal});
  menu?.addEventListener('click',(event)=>{if((event.target as HTMLElement).closest('a'))closeMenu();},{signal});
  document.addEventListener('keydown',(event)=>{
    if(menuButton?.getAttribute('aria-expanded')!=='true')return;
    if(event.key==='Escape'){closeMenu(true);return;}
    if(event.key==='Tab' && menu){
      const links=[menuButton,...menu.querySelectorAll<HTMLAnchorElement>('a')];
      const first=links[0],last=links[links.length-1];
      if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
    }
  },{signal});
  window.addEventListener('resize',()=>{if(window.innerWidth>800)closeMenu();},{signal});

  const context=gsap.context(()=>{
    gsap.to('.scroll-progress',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:true}});
    if(reduced)return;
    let entered=false;
    try{entered=sessionStorage.getItem('ocean-entered')==='1';sessionStorage.setItem('ocean-entered','1');}catch{/* Animation preference storage is optional. */}
    const entrance=document.querySelector('.brand-entrance');
    if(entrance && !entered){
      gsap.set(entrance,{display:'flex'});
      gsap.timeline().from('.entrance-line',{scale:.6,rotation:0,opacity:0,duration:.45}).from('.brand-entrance>span,.brand-entrance>small',{opacity:0,y:10,stagger:.1,duration:.35},.1).to(entrance,{yPercent:-100,duration:.65,ease:'power3.inOut'},.65).set(entrance,{display:'none'});
    }
    if(document.querySelector('.headline-line'))gsap.from('.headline-line',{y:45,opacity:0,stagger:.13,duration:1.1,ease:'power3.out',delay:entrance && !entered ? .9 : .05});
    if(desktop){
      if(document.querySelector('.hero-photo'))gsap.fromTo('.hero-photo',{scale:1.05},{scale:1.14,yPercent:5,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.utils.toArray<HTMLElement>('.project-image').forEach(el=>gsap.fromTo(el,{clipPath:'inset(8% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:{trigger:el,start:'top 92%',end:'top 40%',scrub:.7}}));
    }
    gsap.utils.toArray<HTMLElement>('.intro h2,.philosophy h2,.section-heading h2').forEach(el=>gsap.from(el,{y:22,opacity:.3,duration:.9,scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
    gsap.utils.toArray<HTMLElement>('.step-line').forEach(el=>gsap.from(el,{scaleX:0,transformOrigin:'left',duration:1,scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
    document.querySelectorAll<HTMLElement>('.header-cta,.round-arrow').forEach(el=>{
      if(!desktop)return;
      el.addEventListener('pointermove',(event)=>{const rect=el.getBoundingClientRect();gsap.to(el,{x:(event.clientX-rect.left-rect.width/2)*.09,y:(event.clientY-rect.top-rect.height/2)*.12,duration:.3});},{signal});
      el.addEventListener('pointerleave',()=>gsap.to(el,{x:0,y:0,duration:.4}),{signal});
    });
  });

  const slides=Array.from(document.querySelectorAll<HTMLElement>('.review-slide'));
  let reviewIndex=0;
  const changeReview=(direction:number)=>{
    if(!slides.length)return;
    slides[reviewIndex].hidden=true;reviewIndex=(reviewIndex+direction+slides.length)%slides.length;slides[reviewIndex].hidden=false;
    const count=document.querySelector('.review-count');if(count)count.textContent=`0${reviewIndex+1} / 0${slides.length}`;
    if(!reduced)gsap.fromTo(slides[reviewIndex],{opacity:0,x:direction*12},{opacity:1,x:0,duration:.35,clearProps:'transform,opacity'});
  };
  document.querySelector('[data-review-prev]')?.addEventListener('click',()=>changeReview(-1),{signal});
  document.querySelector('[data-review-next]')?.addEventListener('click',()=>changeReview(1),{signal});
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    let count=0;
    document.querySelectorAll<HTMLElement>('.gallery-grid .project-card').forEach(card=>{card.hidden=filter!=='All' && card.dataset.category!==filter;if(!card.hidden)count++;});
    const status=document.querySelector('[data-filter-status]');if(status)status.textContent=`${count} ${count===1?'project':'projects'} shown`;
    if(!reduced)gsap.fromTo('.gallery-grid .project-card:not([hidden])',{opacity:.2,y:12},{opacity:1,y:0,duration:.4,stagger:.05,clearProps:'transform,opacity'});
    ScrollTrigger.refresh();
  },{signal}));

  setupForm(signal);
  const architecture=document.querySelector<HTMLElement>('[data-architecture]');
  if(architecture && desktop && !reduced){
    let pending=false;
    const observer=new IntersectionObserver(async entries=>{
      if(!entries.some(entry=>entry.isIntersecting)||pending)return;
      pending=true;observer.disconnect();
      try{const {mountArchitecture}=await import('./architecture');if(!signal.aborted)cleanup.push(mountArchitecture(architecture));}catch{ /* Keep the accessible static architectural study. */ }
    },{rootMargin:'200px'});
    observer.observe(architecture);cleanup.push(()=>observer.disconnect());
  }
  const refresh=()=>ScrollTrigger.refresh();
  document.fonts.ready.then(()=>{if(!signal.aborted)refresh();});
  window.addEventListener('load',refresh,{once:true,signal});
  const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery.addEventListener('change',initialize,{once:true,signal});
  desktopQuery.addEventListener('change',initialize,{once:true,signal});
  disposePage=()=>{abort.abort();context.revert();cleanup.forEach(fn=>fn());closeMenu();gsap.killTweensOf('.review-slide,.gallery-grid .project-card');};
}

function setupForm(signal:AbortSignal){
  const form=document.querySelector<HTMLFormElement>('#estimate-form');if(!form)return;
  const params=new URLSearchParams(location.search);
  const service=form.elements.namedItem('service') as HTMLSelectElement;
  const locationField=form.elements.namedItem('location') as HTMLInputElement;
  if(params.has('service'))service.value=params.get('service')||'';
  if(params.has('location'))locationField.value=(params.get('location')||'').slice(0,150);
  const status=document.querySelector<HTMLElement>('#form-status')!;
  const draft=document.querySelector<HTMLElement>('#email-draft')!;
  const draftText=document.querySelector<HTMLTextAreaElement>('#draft-text')!;
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if((form.elements.namedItem('website') as HTMLInputElement).value){status.textContent='Please leave the optional website field empty.';return;}
    let firstInvalid:HTMLElement|undefined;
    const messages:Record<string,string>={name:'Please enter your full name.',email:'Please enter a valid email address.',phone:'Please enter a phone number with at least 7 digits.',service:'Please choose a project type.',location:'Please enter your project city or ZIP code.',description:'Please describe your project in at least 20 characters.'};
    form.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('[required]').forEach(input=>{
      let valid=input.checkValidity() && input.value.trim().length>0;
      if(input.name==='phone')valid=valid && input.value.replace(/\D/g,'').length>=7;
      if(input.name==='description')valid=valid && input.value.trim().length>=20;
      input.setAttribute('aria-invalid',String(!valid));
      const error=document.getElementById(`${input.name}-error`);if(error)error.textContent=valid?'':messages[input.name];
      if(!valid&&!firstInvalid)firstInvalid=input;
    });
    if(firstInvalid){status.textContent='Please check the highlighted fields. Nothing has been sent.';draft.hidden=true;firstInvalid.focus();return;}
    const data=new FormData(form);
    const text=`Project inquiry for Ocean General Contractors\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone')}\nProject: ${service.selectedOptions[0].text}\nLocation: ${data.get('location')}\nPreferred contact: ${data.get('preferred')}\n\nProject details:\n${data.get('description')}`;
    draftText.value=text;draft.hidden=false;
    (document.getElementById('send-email') as HTMLAnchorElement).href=`mailto:bluecollarcorgis@gmail.com?subject=${encodeURIComponent('Project inquiry — '+service.selectedOptions[0].text)}&body=${encodeURIComponent(text)}`;
    status.textContent='Your draft is prepared. Nothing has been sent. Review the details below, then open your email app to send it.';status.focus();
    ScrollTrigger.refresh();
  },{signal});
  form.addEventListener('input',()=>{if(!draft.hidden){draft.hidden=true;status.textContent='Your details changed. Prepare the inquiry again to update your email draft.';}},{signal});
  document.getElementById('copy-draft')?.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(draftText.value);status.textContent='Inquiry copied. Paste it into an email to bluecollarcorgis@gmail.com. Nothing has been sent.';}
    catch{draftText.focus();draftText.select();status.textContent='Select and copy the prepared text, then paste it into your email.';}
  },{signal});
}

document.addEventListener('astro:page-load',initialize);
document.addEventListener('astro:before-swap',()=>{disposePage?.();disposePage=undefined;});

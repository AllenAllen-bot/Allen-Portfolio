
/* 『Allen』 Ronova Experience: enhancement layer, progressive and accessible. */
(() => {
  "use strict";
  const root = document.documentElement;
  const body = document.body;
  if (!body || document.querySelector(".allen-controller")) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const video = document.querySelector("video.allen-video-bg");
  const getPref = (name) => {try{return localStorage.getItem("allen:"+name)}catch(e){return null}};
  const setPref = (name,value) => {try{localStorage.setItem("allen:"+name,String(value))}catch(e){}};
  let focus = getPref("focus") === "true" || (getPref("focus") === null && saveData);
  let paused = getPref("paused") === "true" || (getPref("paused") === null && (reduce.matches || saveData));

  const svgIcon = (name) => {
    const icons = {
      eye:'<path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
      pause:'<path d="M9 5v14M15 5v14"/>',
      play:'<path d="m9 5 10 7-10 7V5Z"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[name]+'</svg>';
  };
  function sigil(){
    const petals=Array.from({length:7},(_,i)=>'<path transform="rotate('+(i*360/7)+' 50 50)" d="M50 45C34 26 38 12 50 5C62 12 66 26 50 45Z" fill="rgba(194,41,89,.52)" stroke="#efc58c" stroke-width="1.65"/>').join("");
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45" fill="none" stroke="rgba(241,193,142,.4)" stroke-width=".75"/><g class="allen-petals">'+petals+'</g><circle cx="50" cy="50" r="12" fill="#250815" stroke="#edbd81" stroke-width="2.2"/><circle cx="50" cy="50" r="5" fill="#edc987"/></svg>';
  }

  const ambient=document.createElement("div");
  ambient.className="allen-ambient";
  ambient.setAttribute("aria-hidden","true");
  body.prepend(ambient);
  const skip=document.createElement("a");
  skip.className="allen-skip";skip.href="#allen-main";skip.textContent="Skip to portfolio content";
  body.prepend(skip);
  const main=document.querySelector("main");
  if (main) { if (!main.id) main.id="allen-main"; skip.href="#"+main.id; main.setAttribute("tabindex","-1"); }

  const progress=document.createElement("div");
  progress.className="allen-progress";progress.setAttribute("aria-hidden","true");
  progress.innerHTML="<span></span>";
  body.append(progress);

  const controller=document.createElement("div");
  controller.className="allen-controller";
  controller.setAttribute("role","group");
  controller.setAttribute("aria-label","Appearance and motion controls");
  controller.innerHTML='<small>CELESTIAL MODE</small><button type="button" class="allen-control" id="allen-focus" aria-pressed="false"></button><button type="button" class="allen-control" id="allen-motion" aria-pressed="false"></button>';
  body.append(controller);
  const focusButton=controller.querySelector("#allen-focus");
  const motionButton=controller.querySelector("#allen-motion");

  function syncFocus(){
    body.classList.toggle("allen-focus-mode",focus);
    focusButton.setAttribute("aria-pressed",String(focus));
    focusButton.setAttribute("aria-label",focus?"Switch to cinematic video mode":"Switch to high-readability focus mode");
    focusButton.innerHTML=svgIcon("eye")+(focus?"Focus: ON":"Cinematic");
  }
  function syncMotion(){
    body.classList.toggle("allen-motion-off",paused);
    motionButton.setAttribute("aria-pressed",String(paused));
    motionButton.setAttribute("aria-label",paused?"Play animated background":"Pause animated background");
    motionButton.innerHTML=svgIcon(paused?"play":"pause")+(paused?"Play":"Pause");
    if (!video) return;
    if (paused || document.hidden) video.pause();
    else {
      const attempt=video.play();
      if(attempt && typeof attempt.catch==="function") attempt.catch(()=>{
        paused=true;setPref("paused",true);
        body.classList.add("allen-motion-off");
        motionButton.setAttribute("aria-pressed","true");
        motionButton.setAttribute("aria-label","Play animated background");
        motionButton.innerHTML=svgIcon("play")+"Play";
      });
    }
  }
  focusButton.addEventListener("click",()=>{focus=!focus;setPref("focus",focus);syncFocus()});
  motionButton.addEventListener("click",()=>{paused=!paused;setPref("paused",paused);syncMotion()});
  document.addEventListener("visibilitychange",()=>syncMotion());
  syncFocus();syncMotion();

  const side=document.querySelector("aside .logo-sub");
  if(side){
    const emblem=document.createElement("div");
    emblem.className="allen-seal-mini";emblem.setAttribute("aria-hidden","true");
    emblem.innerHTML=sigil();
    side.insertAdjacentElement("afterend",emblem);
  }

  const hero=document.querySelector("#allen-main .hero");
  if(hero){
    const portrait=hero.querySelector(".hero-image");
    if(portrait){
      const wrap=document.createElement("div");wrap.className="allen-portrait-wrap";
      portrait.parentNode.insertBefore(wrap,portrait);
      wrap.append(portrait);
      const label=document.createElement("div");label.className="allen-portrait-tag";
      label.textContent="Ronova · visual inspiration";wrap.append(label);
    }
    const heroText=hero.firstElementChild;
    if(heroText){
      const button=document.createElement("button");
      button.type="button";button.className="allen-hero-seal";
      button.innerHTML=sigil()+"<span>THE SEVEN-PETAL SIGIL · EXPLORE ↗</span>";
      button.setAttribute("aria-label","Discover the Ronova-inspired design language");
      heroText.append(button);
      const dialog=document.createElement("dialog");
      dialog.className="allen-design-note";
      dialog.setAttribute("aria-label","About the Ronova-inspired theme");
      dialog.innerHTML='<button type="button" aria-label="Close design note">Close ✕</button>'+sigil()+
        '<span class="allen-note-kicker">『Allen』 · DESIGN ARCHIVE</span>'+
        '<h2>The Crimson Eclipse</h2>'+
        '<p>Inspired by Ronova of Genshin Impact, this personal portfolio uses a seven-petal celestial seal, pale-gold details, and a crimson eclipse atmosphere.</p>'+
        '<p>Behind the aesthetic: game development, programming, and live sound engineering. The content is Gabriel Allen A. Pena’s portfolio, not an official HoYoverse website.</p>';
      body.append(dialog);
      dialog.querySelector("button").addEventListener("click",()=>dialog.close());
      dialog.addEventListener("click",(event)=>{if(event.target===dialog)dialog.close()});
      button.addEventListener("click",()=>{
        if(!reduce.matches&&!paused)burst(button);
        dialog.showModal();
      });
    }
    const mosaic=document.createElement("section");
    mosaic.className="allen-mosaic section";
    mosaic.setAttribute("aria-label","Explore the portfolio disciplines");
    mosaic.innerHTML='<div class="allen-mosaic-head"><div><span class="eyebrow">THE CELESTIAL ARCHIVE</span><h2>Three disciplines. One direction.</h2></div><p>Explore the work, skills, and audio technology behind the crimson design.</p></div>'+
      '<div class="allen-mosaic-grid">'+
      '<a class="allen-mosaic-link" href="gallery.html"><span class="allen-mosaic-index">01 / CREATE</span><div><h3>Game Development</h3><p>Interactive experiments, ideas, and visual projects.</p></div><span class="allen-mosaic-cta">Explore gallery →</span></a>'+
      '<a class="allen-mosaic-link" href="skills.html"><span class="allen-mosaic-index">02 / BUILD</span><div><h3>Programming</h3><p>Web technologies, languages, and evolving skills.</p></div><span class="allen-mosaic-cta">View toolkit →</span></a>'+
      '<a class="allen-mosaic-link" href="https://soniccrest-audio.netlify.app/" target="_blank" rel="noopener noreferrer"><span class="allen-mosaic-index">03 / ENGINEER</span><div><h3>Sound Engineering</h3><p>Live sound, pro audio systems, and technical production.</p></div><span class="allen-mosaic-cta">Visit audio showcase ↗</span></a>'+
      '</div>';
    hero.insertAdjacentElement("afterend",mosaic);
  }
  function burst(el){
    const rect=el.getBoundingClientRect();
    const x=rect.left+Math.min(rect.width,55)/2;
    const y=rect.top+Math.min(rect.height,55)/2;
    for(let i=0;i<7;i++){
      const p=document.createElement("span");
      p.className="allen-petal-burst";
      p.style.left=x+"px";p.style.top=y+"px";
      const angle=(i/7)*Math.PI*2;
      p.style.setProperty("--dx",Math.round(Math.cos(angle)*84)+"px");
      p.style.setProperty("--dy",Math.round(Math.sin(angle)*84)+"px");
      p.style.setProperty("--rotation",(i*100)+"deg");
      body.append(p);
      p.addEventListener("animationend",()=>p.remove(),{once:true});
      setTimeout(()=>p.remove(),1200);
    }
  }
  // Scroll progress and pointer-based lighting, limited to one animation frame per update.
  let scheduled=false;
  const onScroll=()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      const max=Math.max(1,root.scrollHeight-innerHeight);
      root.style.setProperty("--rx-scroll",Math.min(100,Math.max(0,scrollY/max*100))+"%");
      scheduled=false;
    });
  };
  addEventListener("scroll",onScroll,{passive:true});
  addEventListener("resize",onScroll,{passive:true});
  onScroll();
  if(matchMedia("(hover:hover) and (pointer:fine)").matches && !reduce.matches && !saveData){
    let pointerQueued=false,px=0,py=0;
    addEventListener("pointermove",(e)=>{
      px=e.clientX;py=e.clientY;
      if(pointerQueued)return;
      pointerQueued=true;
      requestAnimationFrame(()=>{
        root.style.setProperty("--rx-x",px+"px");
        root.style.setProperty("--rx-y",py+"px");
        pointerQueued=false;
      });
    },{passive:true});
  }
  const revealTargets=[...document.querySelectorAll(".tile,.skill-level-card,.contact-card,.sound-showcase,.allen-mosaic-link,.project")];
  if("IntersectionObserver" in window && !reduce.matches){
    revealTargets.forEach(el=>el.classList.add("allen-scroll-reveal"));
    const observer=new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{if(entry.isIntersecting){
        entry.target.classList.add("allen-visible");observer.unobserve(entry.target);
      }});
    },{threshold:.06,rootMargin:"0px 0px -18px 0px"});
    revealTargets.forEach(el=>observer.observe(el));
    body.classList.add("allen-ready");
  }
  document.querySelectorAll("nav a").forEach(link=>link.addEventListener("click",()=>{
    const nav=document.getElementById("nav");
    if(nav&&nav.classList.contains("open")){
      nav.classList.remove("open");
      document.getElementById("toggle")?.setAttribute("aria-expanded","false");
    }
  }));
  addEventListener("keydown",(e)=>{
    if(e.key==="Escape"){
      const nav=document.getElementById("nav");
      nav?.classList.remove("open");
      document.getElementById("toggle")?.setAttribute("aria-expanded","false");
    }
  });
})();

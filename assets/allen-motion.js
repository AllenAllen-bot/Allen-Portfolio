/* 『Allen』 cinematic motion engine v2. All effects are progressive and optional. */
(() => {
  "use strict";
  const body=document.body;
  if (!body || body.dataset.cinemaMotionInitialized) return;
  body.dataset.cinemaMotionInitialized="true";

  const mq=matchMedia("(prefers-reduced-motion: reduce)");
  const saveData=Boolean(navigator.connection?.saveData);
  const mobile=matchMedia("(max-width: 760px)").matches;
  const fine=matchMedia("(hover: hover) and (pointer: fine)").matches;
  const gentle=mq.matches || saveData;
  const motionOff=()=>gentle || body.classList.contains("a13x-motion-off");
  const eyePath="assets/ronova-golden-eye-reveal.webp";
  const nav=document.querySelector("aside nav");
  const raf=window.requestAnimationFrame.bind(window);

  // Navigation keeps its native links, keyboard focus and mobile-menu behavior.
  document.querySelectorAll("aside nav a").forEach((el,i)=>{
    el.style.setProperty("--motion-index",i);
  });
  document.querySelectorAll(".ronova-top-gallery img").forEach((el,i)=>{
    el.style.setProperty("--panel-index",i);
  });

  // One observer handles both headline masks and section reveals.
  if(!gentle && "IntersectionObserver" in window) {
    const general=[
      ...document.querySelectorAll(
        ".hero > .hero-image, .ronova-lore-heading, .rn-chapter, .rn-archive-controls,"+
        ".audio-dashboard > .audio-controls,.audio-node,.bio-grid,.gallery-heading,"+
        ".a13x-gallery-item,.a13x-experience-head,.a13x-timeline-item,"+
        ".contact-grid,.section > .title,main > .eyebrow,.sound-showcase"
      )
    ].filter(el=>!el.classList.contains("a13x-scroll-reveal") &&
      !el.closest("details:not([open])"));
    const headings=[...document.querySelectorAll(
      "main h1,main h2,.a13x-mosaic-head h2,.ronova-lore-heading h2"
    )].filter(el=>!el.closest("details:not([open])"));
    const targets=[...new Set([...general,...headings])];
    targets.forEach((el,i)=>{
      el.style.setProperty("--cinema-stagger",(i%3*65)+"ms");
      el.classList.add(headings.includes(el)?"cinema-text":"cinema-reveal");
    });
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries) {
        if(!entry.isIntersecting)continue;
        entry.target.classList.add("cinema-visible","cinema-text-visible");
        observer.unobserve(entry.target);
      }
    },{threshold:0.025,rootMargin:"0px 0px -8px 0px"});
    targets.forEach(el=>observer.observe(el));
    body.classList.add("cinema-motion");
    // Reveal panels still closed when the user opens an archive chapter.
    document.querySelectorAll(".rn-chapter").forEach(el=>{
      el.addEventListener("toggle",()=>{
        if(el.open){el.classList.add("cinema-visible");}
      });
    });
  }

  // Seven-petaled golden iris reveal. Uses the user-approved original artwork.
  // Static layout is always available; the animation never traps clicks or focus.
  const portal=document.createElement("div");
  portal.className="celestial-portal";
  portal.setAttribute("aria-hidden","true");
  portal.innerHTML='<div class="celestial-portal-glow"></div>'+
   '<div class="celestial-portal-orbit"></div>'+
   '<div class="celestial-eye-shell"><img src="'+eyePath+'" alt="" width="480" height="480" decoding="async"></div>'+
   '<div class="celestial-portal-flare"></div>';
  body.append(portal);
  let navigating=false;
  if(!motionOff()) {
    portal.classList.add("celestial-entrance");
    // Begin immediately after DOM initialization rather than waiting for large video metadata.
    raf(()=>portal.classList.add("celestial-portal-visible"));
    // Safety timeout ensures animation never lingers if image loading fails.
    setTimeout(()=>portal.classList.remove("celestial-portal-visible","celestial-entrance"),1700);
  }
  document.addEventListener("click",e=>{
    if(e.defaultPrevented || motionOff() || navigating || e.button!==0 ||
       e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)return;
    const link=e.target.closest("a[href]");
    if(!link || link.hasAttribute("download") ||
       (link.target && link.target!=="_self"))return;
    let dest;
    try{dest=new URL(link.href,location.href)}catch{return}
    if(dest.origin!==location.origin || !/\.html$|\/$/.test(dest.pathname) ||
       (dest.pathname===location.pathname && dest.search===location.search))return;
    e.preventDefault();
    navigating=true;
    portal.classList.remove("celestial-entrance","celestial-portal-visible");
    portal.classList.add("celestial-leaving");
    setTimeout(()=>{location.assign(dest.href)},520);
  });
  addEventListener("pageshow",e=>{
    if(e.persisted){navigating=false;portal.classList.remove("celestial-leaving")}
  });

  // Decorative perspective field. Actual artwork and background video are untouched.
  const plane=document.createElement("div");
  plane.className="cinema-depth-field";
  plane.setAttribute("aria-hidden","true");
  plane.innerHTML='<div class="cinema-depth-halo cinema-depth-near"></div>'+
    '<div class="cinema-depth-halo cinema-depth-far"></div>';
  body.append(plane);

  // Petals stay behind panels, text and controls, and do not capture taps.
  if(!gentle) {
    const layer=document.createElement("div");
    layer.className="cinema-petal-field";
    layer.setAttribute("aria-hidden","true");
    const amount=mobile?8:16;
    for(let i=0;i<amount;i++) {
      const petal=document.createElement("span");
      petal.className="cinema-petal";
      petal.style.setProperty("--petal-x",((i*61.8+17)%100).toFixed(2)+"%");
      petal.style.setProperty("--petal-size",(5+(i*13)%10)+"px");
      petal.style.setProperty("--petal-duration",(11+(i*7)%12)+"s");
      petal.style.setProperty("--petal-delay",(-i*1.3)+"s");
      petal.style.setProperty("--petal-sway",((i%2?1:-1)*(45+(i*11)%100))+"px");
      layer.append(petal);
    }
    body.append(layer);
  }

  // 3D glass tilt is limited to precise pointers; touch users retain stable layout.
  if(!gentle && fine) {
    const cards=document.querySelectorAll(
      ".tile,.skill-level-card,.project,.a13x-mosaic-link,.audio-node,.contact-card,.a13x-gallery-item"
    );
    cards.forEach(card=>{
      card.classList.add("cinema-tilt-card");
      let pending=false;
      let pointer=null;
      card.addEventListener("pointermove",e=>{
        if(motionOff() || e.pointerType==="touch")return;
        pointer={x:e.clientX,y:e.clientY};
        if(pending)return;
        pending=true;
        raf(()=>{
          pending=false;
          if(!pointer)return;
          const r=card.getBoundingClientRect();
          const x=Math.max(-1,Math.min(1,(pointer.x-r.left)/r.width*2-1));
          const y=Math.max(-1,Math.min(1,(pointer.y-r.top)/r.height*2-1));
          card.style.transform="perspective(900px) rotateX("+(-y*7).toFixed(2)+
            "deg) rotateY("+(x*9).toFixed(2)+"deg) translate3d(0,-3px,0)";
          card.style.setProperty("--tilt-x",((x+1)*50).toFixed(1)+"%");
          card.style.setProperty("--tilt-y",((y+1)*50).toFixed(1)+"%");
        });
      },{passive:true});
      const reset=()=>{pointer=null;card.style.removeProperty("transform")};
      card.addEventListener("pointerleave",reset,{passive:true});
      card.addEventListener("blur",reset,true);
    });
  }

  // Reuse existing progress bar. One scroll RAF also drives subtle parallax.
  const button=document.createElement("button");
  button.type="button";
  button.className="cinema-back-top";
  button.setAttribute("aria-label","Back to top");
  button.title="Back to top";
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V4m-7 7 7-7 7 7"/></svg>';
  body.append(button);
  button.addEventListener("click",()=>{
    scrollTo({top:0,behavior:motionOff()?"auto":"smooth"});
  });

  let queued=false;
  function update(){
    queued=false;
    const y=window.scrollY||document.documentElement.scrollTop||0;
    body.classList.toggle("cinema-scrolled",y>50);
    button.classList.toggle("cinema-show",y>350);
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    document.documentElement.style.setProperty("--cinema-scroll",Math.min(1,y/max).toFixed(4));
    if(!motionOff()) {
      const d=Math.min(y,mobile?900:1900);
      plane.style.setProperty("--depth-near",(-d*(mobile?.045:.075)).toFixed(1)+"px");
      plane.style.setProperty("--depth-far",(d*(mobile?.025:.045)).toFixed(1)+"px");
    }else{
      plane.style.setProperty("--depth-near","0px");
      plane.style.setProperty("--depth-far","0px");
    }
  }
  function schedule(){if(queued)return;queued=true;raf(update)}
  addEventListener("scroll",schedule,{passive:true});
  addEventListener("resize",schedule,{passive:true});
  addEventListener("pageshow",schedule);
  update();
})();
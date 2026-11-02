/* 『Allen』 cinematic motion: no external animation library or media downloads. */
(() => {
  "use strict";
  const body=document.body;
  if (!body || body.dataset.cinemaMotionInitialized) return;
  body.dataset.cinemaMotionInitialized="true";
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData=Boolean(navigator.connection?.saveData);
  const gentle=reduce || saveData;

  // Menu animations are visual only: leave existing links and menu toggle intact.
  document.querySelectorAll("aside nav a").forEach((link,index) => {
    link.style.setProperty("--motion-index",index);
  });
  document.querySelectorAll(".ronova-top-gallery img").forEach((img,index) => {
    img.style.setProperty("--panel-index",index);
  });

  if(!gentle && typeof IntersectionObserver==="function") {
    const targets=[
      ...document.querySelectorAll(
        ".hero > div:first-child, .hero > .hero-image, .ronova-lore-heading, " +
        ".rn-chapter, .rn-archive-controls, .audio-dashboard > .audio-controls, " +
        ".audio-node, .bio-grid, .gallery-heading, .a13x-gallery-item, " +
        ".a13x-experience-head, .a13x-timeline-item, .a13x-experience-foot, " +
        ".contact-grid, .section > .title, main > .eyebrow"
      )
    ].filter(el => !el.classList.contains("a13x-scroll-reveal") &&
      !el.closest("details:not([open])") && !el.closest(".rn-archive[hidden]"));

    // Hidden styles only apply once an observer is available.
    targets.forEach((el,index) => {
      el.classList.add("cinema-reveal");
      el.style.setProperty("--cinema-stagger",((index % 3)*65)+"ms");
    });
    const observer=new IntersectionObserver(entries => {
      for(const entry of entries) {
        if(!entry.isIntersecting) continue;
        entry.target.classList.add("cinema-visible");
        observer.unobserve(entry.target);
      }
    },{threshold:0.04,rootMargin:"0px 0px -12px 0px"});
    targets.forEach(el => observer.observe(el));
    body.classList.add("cinema-motion");
  }

  const button=document.createElement("button");
  button.type="button";
  button.className="cinema-back-top";
  button.setAttribute("aria-label","Back to top");
  button.title="Back to top";
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V4m-7 7 7-7 7 7"/></svg>';
  body.append(button);
  button.addEventListener("click", () => {
    window.scrollTo({top:0,behavior:gentle || body.classList.contains("a13x-motion-off")?"auto":"smooth"});
  });

  let queued=false;
  function update() {
    queued=false;
    const y=window.scrollY || document.documentElement.scrollTop || 0;
    body.classList.toggle("cinema-scrolled",y>50);
    button.classList.toggle("cinema-show",y>350);
    const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    document.documentElement.style.setProperty("--cinema-scroll",Math.min(1,y/max).toFixed(4));
  }
  function schedule() {
    if(queued)return;queued=true;requestAnimationFrame(update);
  }
  window.addEventListener("scroll",schedule,{passive:true});
  window.addEventListener("resize",schedule,{passive:true});
  window.addEventListener("pageshow",schedule);
  update();
})();
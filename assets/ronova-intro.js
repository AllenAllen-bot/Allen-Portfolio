/* The Ronova intro runs on first entry and on browser refresh, not on every menu click. */
(()=>{
 "use strict";
 const root=document.documentElement;
 if(!root.classList.contains("ronova-intro-armed"))return;
 window.__ronovaIntroAlive=true;
 const body=document.body;
 const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 const saveData=Boolean(navigator.connection?.saveData);
 let savedPause=false;
 try{savedPause=localStorage.getItem("a13x:videoUserPaused")==="true"}catch{}
 if(reduced||saveData||savedPause){
   root.classList.remove("ronova-intro-armed");
   document.dispatchEvent(new Event("ronova:intro-finished"));
   return;
 }
 try{sessionStorage.setItem("allen:intro:played","1")}catch{}
 const backdrop=document.querySelector("video.a13x-video-bg");
 // Do not request the heavy background while the opening cinematic is playing.
 if(backdrop)backdrop.pause();
 const layout=document.querySelector("body > .layout");
 const wasInert=layout?.hasAttribute("inert");
 const oldAria=layout?.getAttribute("aria-hidden");
 if(layout){layout.setAttribute("inert","");layout.setAttribute("aria-hidden","true")}
 const layer=document.createElement("section");
 layer.className="ronova-intro-screen";
 layer.setAttribute("role","dialog");
 layer.setAttribute("aria-modal","true");
 layer.setAttribute("aria-label","Ronova cinematic introduction");
 layer.innerHTML=
  '<div class="ronova-intro-haze" aria-hidden="true"></div>'+
  '<video class="ronova-intro-video" playsinline webkit-playsinline preload="auto" muted poster="assets/ronova-intro-poster.jpg" disablepictureinpicture>'+
    '<source src="assets/ronova-intro-video.mp4" type="video/mp4">'+
  '</video>'+
  '<div class="ronova-intro-vignette" aria-hidden="true"></div>'+
  '<div class="ronova-intro-toolbar">'+
    '<span class="ronova-intro-label">RONOVA · RULER OF DEATH</span>'+
    '<div class="ronova-intro-controls">'+
      '<button class="ronova-intro-button ronova-intro-audio" type="button" aria-pressed="false">Sound off</button>'+
      '<button class="ronova-intro-button ronova-intro-skip" type="button">Skip intro</button>'+
    '</div></div>'+
  '<div class="ronova-intro-progress" aria-hidden="true"><span></span></div>';
 body.append(layer);
 const video=layer.querySelector("video");
 const skip=layer.querySelector(".ronova-intro-skip");
 const audio=layer.querySelector(".ronova-intro-audio");
 const bar=layer.querySelector(".ronova-intro-progress span");
 video.muted=true;video.volume=.65;video.playsInline=true;
 let finished=false,started=false;
 let startDeadline,overallDeadline,stallDeadline,exitDeadline;
 let cleanupStarted=false;
 function finish(){
   if(finished)return;
   finished=true;
   clearTimeout(startDeadline);clearTimeout(overallDeadline);clearTimeout(stallDeadline);
   video.pause();
   layer.classList.add("is-exiting");
   root.classList.add("ronova-intro-reveal");
   if(layout){
     if(!wasInert)layout.removeAttribute("inert");
     if(oldAria===null)layout.removeAttribute("aria-hidden");
     else layout.setAttribute("aria-hidden",oldAria);
   }
   // Request and play the background only after the opening video has ended or been skipped.
   document.dispatchEvent(new Event("ronova:intro-finished"));
   exitDeadline=setTimeout(()=>{
     if(cleanupStarted)return;cleanupStarted=true;
     layer.remove();root.classList.remove("ronova-intro-armed","ronova-intro-reveal");
   },1370);
 }
 skip.addEventListener("click",finish);
 audio.addEventListener("click",()=>{
   video.muted=!video.muted;
   audio.textContent=video.muted?"Sound off":"Sound on";
   audio.setAttribute("aria-pressed",String(!video.muted));
 });
 const escape=e=>{if(e.key==="Escape"){e.preventDefault();finish()}};
 document.addEventListener("keydown",escape);
 video.addEventListener("ended",finish,{once:true});
 video.addEventListener("error",finish,{once:true});
 video.addEventListener("timeupdate",()=>{
   if(video.duration&&isFinite(video.duration)){
     bar.style.width=Math.min(100,video.currentTime/video.duration*100).toFixed(2)+"%";
   }
 });
 function playing(){
   started=true;clearTimeout(startDeadline);clearTimeout(stallDeadline);
   layer.classList.add("is-playing");
 }
 video.addEventListener("playing",playing);
 video.addEventListener("waiting",()=>{
   if(started && !finished){
     clearTimeout(stallDeadline);
     stallDeadline=setTimeout(finish,8500);
   }
 });
 startDeadline=setTimeout(()=>{if(!started)finish()},8500);
 overallDeadline=setTimeout(finish,30000);
 // Begin with one second of total darkness, then fade in as the first frames play.
 setTimeout(()=>{
   if(finished)return;
   try{
     const promise=video.play();
     if(promise && typeof promise.catch==="function")promise.catch(finish);
   }catch{finish()}
 },1000);
})();

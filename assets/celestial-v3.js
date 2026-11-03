/* Coordinated celestial interaction layer. The existing cinematic engine still owns card tilt, scroll reveals and intro transitions. */
(()=>{
"use strict";
if(document.documentElement.dataset.celestialV3)return;
document.documentElement.dataset.celestialV3="on";
const body=document.body,root=document.documentElement;
const reduce=matchMedia("(prefers-reduced-motion:reduce)");
const fine=matchMedia("(hover:hover) and (pointer:fine)");
const mobile=matchMedia("(max-width:760px)");
const saveData=!!navigator.connection?.saveData;
const motion=()=>!reduce.matches&&!saveData&&!body.classList.contains("a13x-motion-off");
const pointerMotion=()=>motion()&&fine.matches&&!mobile.matches;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const atmosphere=document.createElement("div");
atmosphere.className="v3-atmosphere";atmosphere.setAttribute("aria-hidden","true");
atmosphere.innerHTML='<span class="v3-eclipse"></span><span class="v3-halo"></span>';
body.append(atmosphere);
const cursor=document.createElement("div");
cursor.className="v3-cursor";cursor.setAttribute("aria-hidden","true");
body.append(cursor);
let x=innerWidth/2,y=innerHeight/2,pending=false;
const positionCursor=()=>{cursor.style.transform="translate3d("+x+"px,"+y+"px,0) translate(-50%,-50%)";};
function update(){
pending=false;
const active=motion(),pointer=pointerMotion(),factor=mobile.matches?.35:1;
const px=pointer?(x/Math.max(innerWidth,1)-.5)*24*factor:0;
const py=pointer?(y/Math.max(innerHeight,1)-.5)*18*factor:0;
root.style.setProperty("--v3-px",px.toFixed(1)+"px");
root.style.setProperty("--v3-py",(py-(active?Math.min(scrollY,1600)*.035*factor:0)).toFixed(1)+"px");
root.style.setProperty("--v3-eclipse",active?(Math.min(scrollY,1600)*.07*factor).toFixed(1)+"px":"0px");
positionCursor();
cursor.classList.toggle("v3-cursor-show",pointer&&document.hasFocus()&&!body.classList.contains("v3-sidebar-hover"));
atmosphere.classList.toggle("v3-still",!active);
}
function schedule(){if(!pending){pending=true;requestAnimationFrame(update)}}
addEventListener("scroll",schedule,{passive:true});addEventListener("resize",schedule,{passive:true});
addEventListener("focus",schedule);addEventListener("blur",schedule);
reduce.addEventListener?.("change",schedule);fine.addEventListener?.("change",schedule);mobile.addEventListener?.("change",schedule);
document.addEventListener("pointermove",e=>{if(e.pointerType!=="touch"){x=e.clientX;y=e.clientY;positionCursor();schedule()}},{passive:true});
document.addEventListener("pointerover",e=>{if(e.pointerType!=="touch"){x=e.clientX;y=e.clientY;positionCursor()}body.classList.toggle("v3-sidebar-hover",!!e.target.closest("aside nav"));cursor.classList.toggle("v3-hot",!!e.target.closest("a,button,summary,input,select,textarea"));schedule()},{passive:true});
document.addEventListener("pointerout",e=>{if(!e.relatedTarget){body.classList.remove("v3-sidebar-hover");cursor.classList.remove("v3-cursor-show")}},{passive:true});
document.getElementById("a13x-motion")?.addEventListener("click",()=>requestAnimationFrame(schedule));
schedule();

// Enhance existing glass and tilt without installing a competing perspective engine.
document.querySelectorAll(".cinema-tilt-card,.glass,.rn-chapter,.a13x-gallery-item").forEach(e=>e.classList.add("v3-glass"));
// Buttons shift only with CSS translate, independent of existing 3D transforms.
if(fine.matches&&!mobile.matches&&!saveData){
document.querySelectorAll(".btn,.actions a,.a13x-hero-seal,.gallery-filter,.a13x-control").forEach(el=>{
el.classList.add("v3-magnetic");let queued=false,last;
el.addEventListener("pointermove",e=>{if(!pointerMotion()||e.pointerType==="touch")return;last=e;if(queued)return;queued=true;requestAnimationFrame(()=>{
queued=false;if(!last)return;const r=el.getBoundingClientRect();
el.style.setProperty("--mx",clamp((last.clientX-r.left-r.width/2)*.16,-9,9).toFixed(1)+"px");
el.style.setProperty("--my",clamp((last.clientY-r.top-r.height/2)*.16,-7,7).toFixed(1)+"px");
})},{passive:true});
const reset=()=>{last=null;el.style.removeProperty("--mx");el.style.removeProperty("--my")};
el.addEventListener("pointerleave",reset,{passive:true});el.addEventListener("blur",reset);
});
}
// Sliding nav indicator adds to existing nav hover CSS.
const nav=document.querySelector("aside nav");
if(nav){
const marker=document.createElement("span");marker.className="v3-nav-marker";marker.setAttribute("aria-hidden","true");nav.prepend(marker);
const selected=nav.querySelector("a.active");
const place=el=>{if(!el||!el.getClientRects().length||!motion()){marker.style.opacity=0;return;}marker.style.opacity=1;marker.style.top=el.offsetTop+"px";marker.style.height=el.offsetHeight+"px"};
nav.querySelectorAll("a").forEach(a=>{a.addEventListener("pointerenter",()=>place(a),{passive:true});a.addEventListener("focus",()=>place(a))});
nav.addEventListener("pointerleave",()=>place(selected),{passive:true});
nav.addEventListener("focusout",()=>requestAnimationFrame(()=>place(nav.contains(document.activeElement)?document.activeElement.closest("a"):selected)));
addEventListener("resize",()=>place(selected),{passive:true});
document.getElementById("toggle")?.addEventListener("click",()=>requestAnimationFrame(()=>place(selected)));
requestAnimationFrame(()=>place(selected));
}
// One gallery filtering/viewer system. Original inline click listeners are removed from gallery.html.
const tiles=[...document.querySelectorAll(".a13x-gallery-item")];
if(tiles.length){
const tabs=[...document.querySelectorAll(".portfolio-tabs .gallery-filter")];
const count=document.getElementById("gallery-count");
const dialog=document.getElementById("a13x-gallery-modal");
const photo=dialog?.querySelector("img"),close=dialog?.querySelector("#a13x-gallery-close");
let visible=tiles.slice(),index=0,lastFocus=null;
const controls=document.createElement("div");controls.className="v3-viewer-controls";
controls.innerHTML='<button type="button" data-v3-prev aria-label="Previous photo">‹</button><span aria-live="polite" data-v3-count></span><button type="button" data-v3-next aria-label="Next photo">›</button><button type="button" data-v3-zoom aria-pressed="false">Zoom +</button>';
dialog?.append(controls);
const zoom=controls.querySelector("[data-v3-zoom]");
function resetZoom(){dialog?.classList.remove("v3-zoomed");zoom.setAttribute("aria-pressed","false");zoom.textContent="Zoom +";}
function show(n){if(!visible.length||!photo)return;index=(n+visible.length)%visible.length;const img=visible[index].querySelector("img");photo.src=img.currentSrc||img.src;photo.alt=img.alt;controls.querySelector("[data-v3-count]").textContent=(index+1)+" / "+visible.length;resetZoom()}
tiles.forEach(tile=>{
tile.addEventListener("click",()=>{if(!dialog?.showModal)return;lastFocus=document.activeElement;show(visible.indexOf(tile));dialog.showModal();close?.focus()});
const img=tile.querySelector("img");img?.addEventListener("error",()=>{if(img.dataset.fallback){const fallback=img.dataset.fallback;delete img.dataset.fallback;img.src=fallback}},{once:true});
});
controls.querySelector("[data-v3-prev]").addEventListener("click",()=>show(index-1));
controls.querySelector("[data-v3-next]").addEventListener("click",()=>show(index+1));
zoom.addEventListener("click",()=>{const value=dialog.classList.toggle("v3-zoomed");zoom.setAttribute("aria-pressed",String(value));zoom.textContent=value?"Zoom −":"Zoom +"});
close?.addEventListener("click",()=>dialog.close());dialog?.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
dialog?.addEventListener("close",()=>{resetZoom();if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true})});
dialog?.addEventListener("keydown",e=>{if(e.key==="ArrowRight"){e.preventDefault();show(index+1)}if(e.key==="ArrowLeft"){e.preventDefault();show(index-1)}});
function apply(key,button){
tabs.forEach(t=>{let on=t===button;t.classList.toggle("active",on);t.setAttribute("aria-pressed",String(on))});
visible=tiles.filter(t=>key==="all"||t.dataset.galleryCategories?.split(" ").includes(key));
tiles.forEach(t=>{const on=visible.includes(t);t.hidden=!on;t.classList.remove("v3-photo-enter");if(on&&motion())requestAnimationFrame(()=>t.classList.add("v3-photo-enter"))});
if(count)count.textContent=visible.length+" image"+(visible.length===1?"":"s");
if(dialog?.open)dialog.close();
}
tabs.forEach(tab=>tab.addEventListener("click",()=>apply(tab.dataset.galleryFilter,tab)));
if(tabs.length)apply("all",tabs.find(t=>t.dataset.galleryFilter==="all")||tabs[0]);
}
})();

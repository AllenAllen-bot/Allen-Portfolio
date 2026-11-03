(()=>{
"use strict";
const archive=document.querySelector(".rn-archive");
if(archive){
 const chapters=Array.from(archive.querySelectorAll("details"));
 document.querySelector("[data-archive-expand]")?.addEventListener("click",()=>chapters.forEach(c=>c.open=true));
 document.querySelector("[data-archive-collapse]")?.addEventListener("click",()=>chapters.forEach(c=>c.open=false));
}
const root=document.querySelector(".audio-dashboard");
if(!root)return;
const source=root.querySelector("#audio-source");
const speaker=root.querySelector("#audio-system");
const sub=root.querySelector("#audio-sub");
const amp=root.querySelector("#audio-amp");
const detail=root.querySelector("#audio-detail");
const catalog=root.querySelector("#audio-catalog");
if(!source||!speaker||!sub||!amp||!detail)return;
const families=[
 ["L Series","https://www.l-acoustics.com/loudspeakers/l-series/",[
  ["L1","Large-format long-throw PULS line source"],
  ["L1D","Large-format progressive downfill PULS"],
  ["L2","16-channel PULS line source"],
  ["L2D","Progressive-coverage L2 downfill"]
 ]],
 ["K Series","https://www.l-acoustics.com/loudspeakers/k-series/",[
  ["KIVA II","Compact variable-curvature line source"],
  ["KARA II","Dual 8-inch variable-curvature line source"],
  ["KARA IIi","Fixed-installation Kara II"],
  ["K3","Dual 12-inch variable-curvature line source"],
  ["K3i","Fixed-installation K3"],
  ["K2","Large-format three-way variable-curvature line source"],
  ["K1","Large-format three-way line source"]
 ]],
 ["A Series","https://www.l-acoustics.com/loudspeakers/a-series/",[
  ["A10 Focus","Compact medium-throw Focus"],
  ["A10 Wide","Compact medium-throw Wide"],
  ["A10i Focus","Fixed-installation A10 Focus"],
  ["A10i Wide","Fixed-installation A10 Wide"],
  ["A15 Focus","Medium-throw Focus"],
  ["A15 Wide","Medium-throw Wide"],
  ["A15i Focus","Fixed-installation A15 Focus"],
  ["A15i Wide","Fixed-installation A15 Wide"]
 ]],
 ["S Series","https://www.l-acoustics.com/loudspeakers/s-series/",[
  ["Soka","Architectural colinear source"],
  ["Soka inWall","In-wall colinear source"],
  ["Syva","Wide-coverage colinear source"]
 ]],
 ["X Series","https://www.l-acoustics.com/loudspeakers/x-series/",[
  ["X4i","Ultra-compact fixed-installation point source"],
  ["X4r","Recessed-installation point source"],
  ["5XT","Compact point source"],
  ["X6i","Fixed-installation point source"],
  ["X8","8-inch coaxial point source"],
  ["X8i","Fixed-installation coaxial point source"],
  ["X12","12-inch point source"],
  ["X15 HiQ","15-inch monitor with external amplification"]
 ]]
];
const subs=[
 ["None","No subwoofer included"],
 ["CS1","Four 21-inch large-format cardioid subwoofer"],
 ["KS28","Dual 18-inch high-power subwoofer"],
 ["KS21","21-inch high-power subwoofer"],
 ["KS21i","Fixed-installation KS21"],
 ["SB18","18-inch subwoofer"],
 ["SB18 IIi","Fixed-installation SB18"],
 ["SB15m","15-inch compact subwoofer"],
 ["SB10i","Fixed-installation 10-inch subwoofer"],
 ["SB10r","Recessed-installation 10-inch subwoofer"],
 ["SB6i","Ultra-shallow dual 6.5-inch subwoofer"],
 ["SB6r","Recessed-installation dual 6.5-inch subwoofer"],
 ["K1-SB","K1 dual 15-inch bass extension"],
 ["Syva Low","Syva dual 12-inch bass extension"],
 ["Syva Sub","Syva 12-inch bass extension"]
];
const amps=[
 ["LA7.16","16-channel amplified controller; required by L1/L1D"],
 ["LA7.16i","16-channel installation amplified controller"],
 ["LA12X","Four-channel high-power amplified controller"],
 ["LA4X","Four-channel amplified controller"],
 ["LA2Xi","Installation amplified controller with bridge modes"],
 ["LA1.16i","16-channel installation amplified controller"]
];
const sources={
 mic:["Live microphone","Mic input, preamp and console routing"],
 playback:["Playback device","Playback through interface and FOH routing"],
 instrument:["Live instrument / DI","Instrument or DI to FOH input"],
 digital:["Digital console feed","Routed digital audio feed"]
};
const info=new Map();
families.forEach(group=>group[2].forEach(item=>info.set(item[0],{note:item[1],family:group[0],url:group[1]})));
function lookup(list,name){return list.find(item=>item[0]===name)||list[0]}
function makeOption(parent,item){
 const option=document.createElement("option");
 option.value=item[0];option.textContent=item[0];parent.append(option);
}
speaker.replaceChildren();
families.forEach(group=>{
 const options=document.createElement("optgroup");
 options.label=group[0];
 group[2].forEach(item=>makeOption(options,item));
 speaker.append(options);
});
sub.replaceChildren();subs.forEach(item=>makeOption(sub,item));
amp.replaceChildren();amps.forEach(item=>makeOption(amp,item));
speaker.value="L1";sub.value="CS1";amp.value="LA7.16";
if(catalog){
 catalog.replaceChildren();
 const groups=[...families,["Subwoofers","https://www.l-acoustics.com/loudspeakers/subwoofer-series/",subs.slice(1)],["Amplified Controllers","https://www.l-acoustics.com/electronics/",amps]];
 groups.forEach(group=>{
  const item=document.createElement("section");item.className="audio-catalog-group";
  const heading=document.createElement("h4");heading.textContent=group[0];item.append(heading);
  const tags=document.createElement("div");tags.className="audio-model-chips";
  group[2].forEach(product=>{
   const chip=document.createElement("span");chip.textContent=product[0];chip.title=product[1];tags.append(chip);
  });
  item.append(tags);
  const link=document.createElement("a");link.href=group[1];link.target="_blank";link.rel="noopener noreferrer";link.textContent="View official range ↗";item.append(link);
  catalog.append(item);
 });
}
function setText(selector,value){
 const el=root.querySelector(selector);if(el)el.textContent=value;
}
function render(){
 const chosen=info.get(speaker.value)||info.get("L1");
 const bass=lookup(subs,sub.value);
 let notice="";
 if((speaker.value==="L1"||speaker.value==="L1D")&&amp.value!=="LA7.16"){
  amp.value="LA7.16";notice="L1/L1D require the LA7.16; controller reset. ";
 }
 const controller=lookup(amps,amp.value);
 const origin=sources[source.value]||sources.mic;
 const output=bass[0]==="None"?speaker.value:speaker.value+" + "+bass[0];
 setText("[data-audio-source]",origin[0]);
 setText("[data-audio-source-note]",origin[1]);
 setText("[data-audio-amp]",controller[0]);
 setText("[data-audio-amp-note]",controller[1]);
 setText("[data-audio-output]",output);
 setText("[data-audio-output-note]",chosen.note+(bass[0]==="None"?"":". "+bass[1]));
 setText("[data-audio-family]",chosen.family);
 setText("[data-audio-model-note]",chosen.note);
 const official=root.querySelector("[data-audio-official]");
 if(official)official.href=chosen.url;
 detail.textContent=notice+"Signal path: "+origin[0]+" → FOH console → system distribution / optional P1 processing → "+controller[0]+" → "+output+". Verify the current L-Acoustics presets, channel assignments, cabling, power, rigging and acoustic design. This selector demonstrates the catalog, not guaranteed equipment compatibility.";
}
[source,speaker,sub,amp].forEach(select=>select.addEventListener("change",render));
render();
})();
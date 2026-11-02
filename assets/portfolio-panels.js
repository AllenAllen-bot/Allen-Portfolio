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
const source=root.querySelector("#audio-source"),system=root.querySelector("#audio-system"),detail=root.querySelector("#audio-detail");
const configs={
 mic:{name:"Microphone",description:"Captures acoustic sound and converts it into an electrical audio signal."},
 playback:{name:"Playback device",description:"A laptop or player sends prerecorded audio to the mixing console."}
};
const output={
 active:{name:"Active loudspeaker",description:"Built-in amplification and processing reside in the powered enclosure."},
 passive:{name:"Amplifier → passive loudspeaker",description:"An appropriately matched external amplifier powers the passive loudspeaker. Consult manufacturer specifications."}
};
function render(){
 const a=configs[source.value],b=output[system.value];
 root.querySelector('[data-audio-source]').textContent=a.name;
 root.querySelector('[data-audio-source-note]').textContent=a.description;
 root.querySelector('[data-audio-output]').textContent=b.name;
 root.querySelector('[data-audio-output-note]').textContent=b.description;
 detail.textContent=source.value==="mic"?
 "Signal path: microphone → mixer input and gain stage → equalization / signal management → "+b.name+". This is a conceptual example, not a wiring or calibration prescription.":
 "Signal path: playback source → mixer or audio interface → signal management → "+b.name+". Check connector types, routing, and gain structure using the actual equipment manuals.";
}
source.addEventListener("change",render);system.addEventListener("change",render);render();
})();
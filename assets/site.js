document.getElementById('toggle')?.addEventListener('click',()=>{const n=document.getElementById('nav');const open=n.classList.toggle('open');document.getElementById('toggle').setAttribute('aria-expanded',String(open));});document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));const filter=b.dataset.filter;document.querySelectorAll('[data-category]').forEach(el=>el.hidden=filter!=='all'&&el.dataset.category!==filter);}));document.querySelector('#contact-form')?.addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;const s=encodeURIComponent(f.elements.subject.value);const t=encodeURIComponent('From: '+f.elements.name.value+' ('+f.elements.email.value+')\n\n'+f.elements.message.value);location.href='mailto:lourdesaguelo21@gmail.com?subject='+s+'&body='+t;});
// Classroom gallery preview: uses native dialog instead of activating legacy template scripts.
const galleryDialog=document.getElementById('gallery-dialog');
document.querySelectorAll('.gallery-zoom').forEach(button=>button.addEventListener('click',()=>{if(!galleryDialog)return;const original=button.querySelector('img');const preview=galleryDialog.querySelector('img');preview.src=original.src;preview.alt=original.alt;galleryDialog.showModal();}));
galleryDialog?.querySelector('.gallery-close')?.addEventListener('click',()=>galleryDialog.close());
galleryDialog?.addEventListener('click',event=>{if(event.target===galleryDialog)galleryDialog.close()});

// Masonry category filters on the professor-style portfolio page.
const masonry=document.getElementById('masonry-gallery');
if(masonry){
const items=[...masonry.querySelectorAll('.masonry-item')];
const projects=document.getElementById('gallery-projects');
const empty=document.getElementById('empty-gallery');
function activateGalleryFilter(category){
let visible=0;
items.forEach(item=>{const match=category==='all'||item.dataset.category.split(' ').includes(category);item.hidden=category==='projects'||!match;if(!item.hidden)visible++});
projects.hidden=category!=='projects';masonry.hidden=category==='projects';empty.hidden=category==='projects'||visible>0;
document.querySelectorAll('.side-filter').forEach(btn=>{let active=btn.dataset.filter===category;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});
}
document.querySelectorAll('.side-filter').forEach(btn=>btn.addEventListener('click',()=>activateGalleryFilter(btn.dataset.filter)));
activateGalleryFilter('all');
}

/* Ilustración pendiente: si una imagen no existe aún, se muestra un marcador */
document.querySelectorAll('.page figure img').forEach(function(img){
  function miss(){ img.closest('figure').classList.add('pending'); }
  img.addEventListener('error',miss);
  if(img.complete && img.naturalWidth===0 && img.getAttribute('loading')!=='lazy') miss();
});

(function(){
  const synth = window.speechSynthesis;
  let current = null; // {btn, audio}
  const setBtn = (btn,on)=>{ btn.setAttribute('aria-pressed',on?'true':'false'); btn.querySelector('span').textContent = on?'Parar lectura':'Leer en voz alta'; };
  const stopAll = ()=>{
    if(current){ current.audio.pause(); current.audio.currentTime=0; setBtn(current.btn,false); current=null; }
    if(synth && synth.speaking) synth.cancel();
    document.querySelectorAll('.read-aloud').forEach(b=>setBtn(b,false));
  };
  function speakFallback(btn){
    if(!synth){ setBtn(btn,false); return; }
    const ch = document.getElementById(btn.dataset.target);
    const parts = [ch.querySelector('h2').textContent, ...[...ch.querySelectorAll('.text p, .chapter-end p')].map(p=>p.textContent)];
    const u = new SpeechSynthesisUtterance(parts.join('. '));
    u.lang='es-ES'; u.rate=0.9; u.pitch=1.1;
    const v = synth.getVoices().find(v=>v.lang && v.lang.startsWith('es'));
    if(v) u.voice=v;
    u.onend=()=>setBtn(btn,false);
    synth.speak(u);
    setBtn(btn,true);
  }
  document.querySelectorAll('.read-aloud').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const wasOn = btn.getAttribute('aria-pressed')==='true';
      stopAll();
      if(wasOn) return;
      // Voz grabada: audio/capitulo-N.mp3 (si no existe, se usa la voz del navegador)
      const n = btn.dataset.target.replace('capitulo-','');
      const audio = new Audio('audio/capitulo-'+n+'.mp3');
      audio.preload = 'auto';
      audio.addEventListener('ended',()=>{ setBtn(btn,false); current=null; });
      audio.addEventListener('error',()=>{ current=null; speakFallback(btn); }, {once:true});
      current = {btn, audio};
      setBtn(btn,true);
      audio.play().catch(()=>{ /* si falla el error handler hace el plan B */ });
    });
  });
  const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }),{threshold:.15});
  document.querySelectorAll('.page').forEach(p=>io.observe(p));
})();

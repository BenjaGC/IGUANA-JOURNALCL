/* ============================================================
   IGUANA JOURNAL — JavaScript (todo interactivo)
   ============================================================ */

/* ---------- Toast ---------- */
let _tt;
function toast(msg, ic){
  const t=document.getElementById('toast');
  t.querySelector('.t-ic').textContent = ic||'✓';
  t.querySelector('.t-msg').textContent = msg;
  t.classList.add('show'); clearTimeout(_tt);
  _tt=setTimeout(()=>t.classList.remove('show'),2400);
}

document.addEventListener('DOMContentLoaded', ()=>{
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const backdrop = document.getElementById('navBackdrop');

  const closeMenu = () => {
    if (toggle) toggle.classList.remove('open');
    if (navLinks) navLinks.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };

  /* ---------- SCROLL SUAVE personalizado (easing) ---------- */
  let _scrolling = false;
  function smoothScrollTo(targetY, duration){
    duration = duration || 900;
    const startY = window.pageYOffset;
    const diff = targetY - startY;
    if (Math.abs(diff) < 2) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches){ window.scrollTo(0, targetY); return; }
    let start = null;
    _scrolling = true;
    // easeInOutCubic: arranca suave, acelera, y frena suave al final
    const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
    function step(ts){
      if (start === null) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + diff * ease(t));
      if (t < 1) requestAnimationFrame(step);
      else _scrolling = false;
    }
    requestAnimationFrame(step);
  }
  function scrollToTarget(sel, dur){
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if(!el) return;
    const navH = 72; // alto del nav fijo, para no tapar el título
    const y = el.getBoundingClientRect().top + window.pageYOffset - navH;
    smoothScrollTo(Math.max(0, y), dur);
  }
  // Cancelar la animación si el usuario hace scroll manual (rueda/touch)
  ['wheel','touchstart'].forEach(ev=>addEventListener(ev, ()=>{ _scrolling=false; }, {passive:true}));

  // Aplicar a TODOS los enlaces internos (#seccion) de la página
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    const id = a.getAttribute('href');
    if(!id || id === '#') return;
    a.addEventListener('click', e=>{
      const target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      scrollToTarget(target, 950);
      // cerrar menú móvil si está abierto
      closeMenu();
      history.replaceState(null,'',id); // actualiza la URL sin saltar
    });
  });


  /* ---------- Reveal al hacer scroll ---------- */
  const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.14});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  /* ---------- Barra de progreso de lectura ---------- */
  const bar=document.getElementById('readingBar');
  const onScroll=()=>{
    const h=document.documentElement;
    const pct=(h.scrollTop)/(h.scrollHeight-h.clientHeight)*100;
    bar.style.width=pct+'%';
    document.getElementById('nav').classList.toggle('scrolled', h.scrollTop>40);
    document.getElementById('toTop').classList.toggle('show', h.scrollTop>500);
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* ---------- Parallax del hero ---------- */
  const heroImg=document.getElementById('heroImg');
  if(heroImg && !reduce){
    addEventListener('scroll',()=>{const y=Math.min(scrollY,900);heroImg.style.transform=`translateY(${y*0.22}px)`;},{passive:true});
  }

  /* ---------- Hojas que caen ---------- */
  const leaves=document.getElementById('leaves');
  if(leaves && !reduce){
    const emojis=['🍃','🌿','🍃','🍂'];
    for(let i=0;i<14;i++){
      const s=document.createElement('span');
      s.className='leaf-p'; s.textContent=emojis[i%emojis.length];
      s.style.left=Math.random()*100+'%';
      s.style.fontSize=(16+Math.random()*16)+'px';
      s.style.animationDuration=(7+Math.random()*8)+'s';
      s.style.animationDelay=(-Math.random()*12)+'s';
      leaves.appendChild(s);
    }
  }

  /* ---------- Contadores del data-strip ---------- */
  const counters=document.querySelectorAll('.v[data-count]');
  const cio=new IntersectionObserver((es)=>{es.forEach(e=>{
    if(!e.isIntersecting) return;
    const el=e.target, target=+el.dataset.count, suf=el.dataset.suffix||'';
    let c=0; const stp=Math.max(1,Math.ceil(target/30));
    const t=setInterval(()=>{c+=stp;if(c>=target){c=target;clearInterval(t);}el.textContent=c+suf;},40);
    cio.unobserve(el);
  });},{threshold:0.6});
  counters.forEach(c=>cio.observe(c));

  /* ---------- Menú móvil ---------- */
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      navLinks.classList.toggle('open', isOpen);
      if (backdrop) backdrop.classList.toggle('open', isOpen);
      document.body.classList.toggle('no-scroll', isOpen);
    });
  }
  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  /* ---------- Nav activo según sección ---------- */
  const sections=[...document.querySelectorAll('section[id], header[id], div[id]')].filter(s=>document.querySelector(`.nav-link[href="#${s.id}"]`));
  const sio=new IntersectionObserver((es)=>{es.forEach(e=>{
    if(e.isIntersecting){
      document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+e.target.id));
    }
  });},{rootMargin:'-40% 0px -55% 0px'});
  sections.forEach(s=>sio.observe(s));

  /* ---------- Tilt 3D en imagen intro ---------- */
  document.querySelectorAll('.tilt').forEach(el=>{
    if(reduce) return;
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-0.5, y=(e.clientY-r.top)/r.height-0.5;
      el.style.transform=`perspective(800px) rotateY(${x*8}deg) rotateX(${-y*8}deg)`;
    });
    el.addEventListener('mouseleave',()=>{el.style.transform='';});
  });

  /* ---------- ANATOMÍA interactiva ---------- */
  const parts={
    ojo:{ic:'👁️',t:'Visión panorámica',x:'Sus ojos a los lados de la cabeza le dan un campo visual amplísimo para detectar depredadores y movimiento a gran distancia.'},
    pineal:{ic:'🔆',t:'Tercer ojo (pineal)',x:'En la parte superior de la cabeza tiene un ojo parietal que percibe luz y sombras: detecta aves rapaces que se acercan desde arriba.'},
    papada:{ic:'🟢',t:'Papada (gular)',x:'El pliegue bajo el mentón regula la temperatura y, al inflarse, sirve para intimidar rivales o cortejar.'},
    cresta:{ic:'🦕',t:'Cresta dorsal',x:'La hilera de espinas a lo largo del lomo es defensiva y exhibe dominancia; es más prominente en los machos.'},
    cola:{ic:'🌀',t:'Cola látigo',x:'Mide hasta dos tercios de su longitud total. La usan como látigo para defenderse y como timón al nadar. Puede desprenderse para escapar.'},
  };
  const aiIc=document.getElementById('aiIc'), aiTitle=document.getElementById('aiTitle'), aiText=document.getElementById('aiText'), aiCard=document.getElementById('aiCard');
  function showPart(key){
    const p=parts[key]; if(!p) return;
    aiIc.textContent=p.ic; aiTitle.textContent=p.t; aiText.textContent=p.x;
    aiCard.classList.remove('pop'); void aiCard.offsetWidth; aiCard.classList.add('pop');
    document.querySelectorAll('[data-part]').forEach(el=>el.classList.toggle('active', el.dataset.part===key));
  }
  document.querySelectorAll('[data-part]').forEach(el=>el.addEventListener('click',()=>showPart(el.dataset.part)));

  /* ---------- GALERÍA → Lightbox ---------- */
  const lb=document.getElementById('lightbox'), lbImg=document.getElementById('lbImg'), lbClose=document.getElementById('lbClose');
  document.querySelectorAll('.b[data-full]').forEach(b=>{
    b.addEventListener('click',()=>{lbImg.src=b.dataset.full;lb.classList.add('open');});
  });
  const closeLb=()=>lb.classList.remove('open');
  lbClose.addEventListener('click',closeLb);
  lb.addEventListener('click',e=>{if(e.target===lb)closeLb();});
  addEventListener('keydown',e=>{if(e.key==='Escape')closeLb();});

  /* ---------- DATOS CURIOSOS rotativos ---------- */
  const facts=[
    'Aunque son excelentes trepadoras, las iguanas verdes son nadadoras excepcionales. Si se sienten amenazadas, se lanzan al agua y bucean para escapar.',
    'Pueden sobrevivir caídas de hasta 12 metros sin lastimarse, gracias a su cola y a un cuerpo ligero y flexible.',
    'Su “tercer ojo” en la cabeza no forma imágenes, pero detecta cambios de luz para alertarlas de depredadores aéreos.',
    'Las iguanas regulan su temperatura tomando sol: por eso las ves quietas sobre ramas al amanecer.',
    'Cuando dos machos compiten, hacen “head-bobbing”: mueven la cabeza arriba y abajo para mostrar dominancia.',
    'Pueden vivir hasta 20 años en libertad y superar los 2 metros contando la cola.',
    'Son totalmente herbívoras: hojas, flores y frutas. ¡Nada de insectos en su dieta adulta!',
  ];
  let fi=0;
  const dykText=document.getElementById('dykText');
  function nextFact(){
    fi=(fi+1)%facts.length;
    dykText.classList.add('fade');
    setTimeout(()=>{dykText.textContent=facts[fi];dykText.classList.remove('fade');},300);
  }
  document.getElementById('dykMore').addEventListener('click',nextFact);
  // Botón "Dato al azar" del hero lleva a curiosidades y muestra uno
  document.getElementById('factBtn').addEventListener('click',()=>{
    scrollToTarget('#dyk', 1000);
    fi=Math.floor(Math.random()*facts.length);
    setTimeout(()=>{dykText.classList.add('fade');setTimeout(()=>{dykText.textContent=facts[fi];dykText.classList.remove('fade');},300);},500);
    toast('¡Dato curioso desbloqueado!','🦎');
  });

  /* ---------- QUIZ ---------- */
  const quiz=[
    {q:'¿De qué se alimenta la iguana verde adulta?',o:['Insectos y gusanos','Hojas, flores y frutas','Peces pequeños','Carroña'],c:1},
    {q:'¿Para qué sirve su “tercer ojo” pineal?',o:['Ver bajo el agua','Detectar luz y depredadores aéreos','Ver de noche','Atraer pareja'],c:1},
    {q:'¿Cómo escapa si está sobre el agua?',o:['Corre por la rama','Se hace la muerta','Se lanza y bucea','Vuela'],c:2},
    {q:'¿Qué hacen los machos para mostrar dominancia?',o:['Cambian de color','Mueven la cabeza (head-bobbing)','Rugen','Cavan túneles'],c:1},
    {q:'¿Cuánto puede medir contando la cola?',o:['50 cm','1 metro','Hasta 2 metros','5 metros'],c:2},
  ];
  let qi=0, score=0, answered=false;
  const qText=document.getElementById('qText'), qOptions=document.getElementById('qOptions'),
        qScore=document.getElementById('qScore'), qTotal=document.getElementById('qTotal'), qNext=document.getElementById('qNext');
  qTotal.textContent=quiz.length;
  function renderQ(){
    answered=false; qNext.disabled=true;
    const item=quiz[qi];
    qText.textContent=`${qi+1}. ${item.q}`;
    qOptions.innerHTML='';
    item.o.forEach((opt,idx)=>{
      const b=document.createElement('button');
      b.className='q-opt'; b.textContent=opt;
      b.addEventListener('click',()=>{
        if(answered) return; answered=true;
        const correct=idx===item.c;
        if(correct){ b.classList.add('correct'); score++; qScore.textContent=score; toast('¡Correcto! 🦎','✓'); }
        else { b.classList.add('wrong'); qOptions.children[item.c].classList.add('correct'); toast('Casi… revisa la respuesta','✗'); }
        [...qOptions.children].forEach(c=>c.disabled=true);
        qNext.disabled=false;
      });
      qOptions.appendChild(b);
    });
  }
  qNext.addEventListener('click',()=>{
    qi++;
    if(qi>=quiz.length){
      qText.textContent=`¡Terminaste! 🎉 Obtuviste ${score} de ${quiz.length}.`;
      qOptions.innerHTML='';
      qNext.textContent='Reintentar ↻'; qNext.disabled=false;
      qi=-1; score=0; qScore.textContent=0;
      qNext.onclick=()=>{ qNext.textContent='Siguiente →'; qNext.onclick=null; qi=0; renderQ(); };
    } else { renderQ(); }
  });
  renderQ();

  /* ---------- Newsletter ---------- */
  const ctaForm=document.getElementById('ctaForm'), ctaNote=document.getElementById('ctaNote');
  ctaForm.addEventListener('submit',e=>{
    e.preventDefault();
    const email=document.getElementById('ctaEmail').value;
    ctaNote.textContent='¡Listo! Te suscribiste con '+email+' 🦎💚';
    ctaForm.reset();
    toast('¡Suscripción confirmada!','💚');
  });

  document.getElementById('toTop').addEventListener('click',()=>smoothScrollTo(0, 900));
});

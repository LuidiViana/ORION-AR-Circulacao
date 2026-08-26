(() => {
  const intro = document.getElementById('intro');
  const startButton = document.getElementById('startButton');
  const scene = document.getElementById('arScene');
  const hud = document.getElementById('hud');
  const status = document.getElementById('status');
  const target = document.getElementById('target');
  const flowLayer = document.getElementById('flowLayer');
  const heartGlow = document.getElementById('heartGlow');
  const quiz = document.getElementById('quiz');
  const quizResult = document.getElementById('quizResult');
  const closeQuiz = document.getElementById('closeQuiz');

  let found = false;
  let flowRunning = false;
  let pulseRunning = false;
  let flowFrame = null;
  let pulseFrame = null;
  let flowDots = [];

  // Polyline paths in target coordinates (approximate educational visualization).
  const bluePath = [
    [-0.34,-0.92,0.05],[-0.43,-0.72,0.05],[-0.43,-0.40,0.05],[-0.32,-0.18,0.05],
    [-0.18,0.02,0.05],[-0.07,-0.08,0.05]
  ];
  const redPath = [
    [0.05,-0.08,0.05],[0.18,0.02,0.05],[0.31,0.20,0.05],[0.39,0.45,0.05],
    [0.39,0.75,0.05],[0.27,0.99,0.05]
  ];
  const lungBluePath = [
    [-0.07,-0.08,0.06],[-0.15,0.10,0.06],[-0.25,0.25,0.06],[-0.36,0.42,0.06]
  ];
  const lungRedPath = [
    [0.05,-0.08,0.06],[0.15,0.10,0.06],[0.25,0.25,0.06],[0.34,0.42,0.06]
  ];

  function lerp(a,b,t){ return a+(b-a)*t; }

  function pointOnPath(path, t) {
    if (!path.length) return [0,0,0];
    const n = path.length - 1;
    const scaled = Math.max(0, Math.min(0.999999, t)) * n;
    const i = Math.floor(scaled);
    const local = scaled - i;
    const a = path[i], b = path[Math.min(i+1,n)];
    return [lerp(a[0],b[0],local), lerp(a[1],b[1],local), lerp(a[2],b[2],local)];
  }

  function makeDot(color, radius=0.018) {
    const el = document.createElement('a-sphere');
    el.setAttribute('radius', radius);
    el.setAttribute('color', color);
    el.setAttribute('material', 'shader: flat; opacity: 0.95');
    flowLayer.appendChild(el);
    return el;
  }

  function buildFlow() {
    if (flowDots.length) return;
    const configs = [
      {path: bluePath, color:'#4d7cff', offset:0.00},
      {path: bluePath, color:'#9bb6ff', offset:0.28},
      {path: redPath, color:'#ff4d4d', offset:0.12},
      {path: redPath, color:'#ff9a9a', offset:0.43},
      {path: lungBluePath, color:'#4d7cff', offset:0.62},
      {path: lungRedPath, color:'#ff4d4d', offset:0.34}
    ];
    flowDots = configs.map(c => ({...c, el:makeDot(c.color)}));
  }

  function animateFlow(ts) {
    if (!flowRunning) return;
    const speed = 0.000035;
    flowDots.forEach(d => {
      const t = ((ts * speed) + d.offset) % 1;
      const p = pointOnPath(d.path, t);
      d.el.object3D.position.set(p[0],p[1],p[2]);
    });
    flowFrame = requestAnimationFrame(animateFlow);
  }

  function setFlow(on) {
    buildFlow();
    flowRunning = on;
    flowDots.forEach(d => d.el.setAttribute('visible', on));
    if (on) {
      cancelAnimationFrame(flowFrame);
      flowFrame = requestAnimationFrame(animateFlow);
      status.textContent = 'Fluxo sanguíneo animado.';
    } else {
      cancelAnimationFrame(flowFrame);
      status.textContent = found ? 'Imagem reconhecida. Experiência pronta.' : 'Procurando a imagem…';
    }
  }

  function animatePulse(ts) {
    if (!pulseRunning) return;
    const phase = (ts % 1100) / 1100;
    const s = 1 + 0.12 * Math.max(0, Math.sin(phase * Math.PI * 2));
    heartGlow.object3D.scale.set(s,s,s);
    pulseFrame = requestAnimationFrame(animatePulse);
  }

  function setPulse(on) {
    pulseRunning = on;
    heartGlow.setAttribute('material', `shader: flat; opacity: ${on ? 0.75 : 0}`);
    if (on) {
      cancelAnimationFrame(pulseFrame);
      pulseFrame = requestAnimationFrame(animatePulse);
      status.textContent = 'Batimento cardíaco em destaque.';
    } else {
      cancelAnimationFrame(pulseFrame);
      heartGlow.object3D.scale.set(1,1,1);
      status.textContent = found ? 'Imagem reconhecida. Experiência pronta.' : 'Procurando a imagem…';
    }
  }

  function speak() {
    if (!('speechSynthesis' in window)) {
      status.textContent = 'Narração não disponível neste navegador.';
      return;
    }
    speechSynthesis.cancel();
    const text = 'O sangue pobre em oxigênio chega ao átrio direito e passa ao ventrículo direito. O ventrículo direito envia o sangue aos pulmões pela artéria pulmonar. Nos pulmões, o sangue recebe oxigênio e retorna ao coração pelas veias pulmonares. O átrio esquerdo recebe esse sangue, que passa ao ventrículo esquerdo. O ventrículo esquerdo bombeia o sangue rico em oxigênio para o corpo pela aorta.';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.92;
    speechSynthesis.speak(utterance);
    status.textContent = 'Narração em andamento.';
  }

  startButton.addEventListener('click', () => {
    intro.classList.add('hidden');
    scene.classList.remove('hidden');
    hud.classList.remove('hidden');
    status.textContent = 'Solicitando câmera…';
  });

  target.addEventListener('targetFound', () => {
    found = true;
    status.textContent = 'Imagem reconhecida! Toque em Fluxo para iniciar.';
    setPulse(true);
  });

  target.addEventListener('targetLost', () => {
    found = false;
    status.textContent = 'Imagem perdida. Aponte novamente para a página.';
  });

  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'flow') setFlow(!flowRunning);
      if (action === 'pulse') setPulse(!pulseRunning);
      if (action === 'narration') speak();
      if (action === 'quiz') {
        quiz.classList.remove('hidden');
        quizResult.textContent = '';
      }
    });
  });

  document.querySelectorAll('[data-answer]').forEach(btn => {
    btn.addEventListener('click', () => {
      const correct = btn.dataset.answer === 'yes';
      quizResult.textContent = correct ? '✅ Correto! O ventrículo esquerdo bombeia sangue rico em oxigênio para o corpo.' : '❌ Vamos tentar novamente. Pense na câmara que envia o sangue para a aorta.';
    });
  });

  closeQuiz.addEventListener('click', () => quiz.classList.add('hidden'));

  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(flowFrame);
    cancelAnimationFrame(pulseFrame);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  });
})();

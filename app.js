/**
 * ARCANE DEAD — Script Oficial da Apresentação
 * Rolagem Contínua, Scrollspy, Cronômetro de 10 Minutos, Simulador Interativo e Web Audio
 */

// =============================================================================
// 1. ÁUDIO SINTETIZADO (Web Audio API nativo)
// =============================================================================
class ArcaneAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playSpell(element) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      if (element === 'fogo') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      } else if (element === 'gelo') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(1700, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      } else { // pestilencia
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.4);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  playWarning() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.setValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.35);
    } catch (e) {}
  }
}

const audio = new ArcaneAudio();

// =============================================================================
// 2. CRONÔMETRO MESTRE (10 MINUTOS CRONOMETRADOS)
// =============================================================================
const BLOCKS_CONFIG = [
  { id: 1, name: "Conceito e Tema", startSec: 0, endSec: 90, duration: "1m30s" },
  { id: 2, name: "Identidade Visual", startSec: 90, endSec: 180, duration: "1m30s" },
  { id: 3, name: "Demonstração", startSec: 180, endSec: 300, duration: "2m00s" },
  { id: 4, name: "Do Conceito ao Jogo", startSec: 300, endSec: 420, duration: "2m00s" },
  { id: 5, name: "Como foi o Processo", startSec: 420, endSec: 510, duration: "1m30s" },
  { id: 6, name: "Divisão e Fecho", startSec: 510, endSec: 600, duration: "1m30s" }
];

class PresentationTimer {
  constructor() {
    this.totalSeconds = 600; // 10 minutos
    this.elapsedSeconds = 0;
    this.isRunning = false;
    this.interval = null;
    this.hasWarnedOvertime = false;

    this.digitsEl = document.getElementById('timer-digits');
    this.badgeEl = document.getElementById('timer-status-badge');
    this.progressFillEl = document.getElementById('progress-fill');
    this.btnToggleEl = document.getElementById('btn-timer-toggle');
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    audio.init();
    this.updateControlsUI();
    this.interval = setInterval(() => {
      this.elapsedSeconds++;
      this.tick();
    }, 1000);
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.interval);
    this.updateControlsUI();
  }

  toggle() {
    if (this.isRunning) this.pause();
    else this.start();
  }

  reset() {
    this.pause();
    this.elapsedSeconds = 0;
    this.hasWarnedOvertime = false;
    this.tick();
    this.updateControlsUI();
  }

  tick() {
    const mins = Math.floor(this.elapsedSeconds / 60);
    const secs = this.elapsedSeconds % 60;
    if (this.digitsEl) {
      this.digitsEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} / 10:00`;
    }

    const pct = Math.min(100, (this.elapsedSeconds / this.totalSeconds) * 100);
    if (this.progressFillEl) {
      this.progressFillEl.style.width = `${pct}%`;
    }

    const currentBlock = BLOCKS_CONFIG.find(b => this.elapsedSeconds >= b.startSec && this.elapsedSeconds < b.endSec) || BLOCKS_CONFIG[BLOCKS_CONFIG.length - 1];
    
    if (this.badgeEl) {
      if (this.elapsedSeconds >= this.totalSeconds) {
        this.badgeEl.textContent = "TEMPO ESGOTADO!";
        this.badgeEl.className = "timer-badge danger";
        if (!this.hasWarnedOvertime) {
          audio.playWarning();
          this.hasWarnedOvertime = true;
        }
      } else {
        const timeInBlock = this.elapsedSeconds - currentBlock.startSec;
        const blockLen = currentBlock.endSec - currentBlock.startSec;
        if (timeInBlock >= blockLen - 15) {
          this.badgeEl.textContent = "Reta Final do Bloco";
          this.badgeEl.className = "timer-badge warning";
        } else {
          this.badgeEl.textContent = `No Ritmo (${currentBlock.name})`;
          this.badgeEl.className = "timer-badge";
        }
      }
    }
  }

  updateControlsUI() {
    if (this.btnToggleEl) {
      this.btnToggleEl.innerHTML = this.isRunning 
        ? `<span class="icon">⏸</span> Pausar`
        : `<span class="icon">▶</span> Iniciar`;
      this.btnToggleEl.className = this.isRunning ? "btn-timer primary" : "btn-timer";
    }
  }
}

const timer = new PresentationTimer();

// =============================================================================
// 3. SCROLLSPY & ROLAGEM SUAVE ENTRE SEÇÕES
// =============================================================================
let activeBlockId = 1;

function scrollToBlock(blockNumber) {
  const target = document.getElementById(`bloco-${blockNumber}`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
    audio.playClick();
  }
}

function initScrollspy() {
  const sections = document.querySelectorAll('.presentation-section');
  const navPills = document.querySelectorAll('.nav-pill-btn');
  const activeBadge = document.getElementById('brand-active-section');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const blockNum = parseInt(entry.target.dataset.blockNumber);
        if (blockNum) {
          activeBlockId = blockNum;
          navPills.forEach(pill => {
            pill.classList.toggle('active', parseInt(pill.dataset.blockTarget) === blockNum);
          });
          if (activeBadge) {
            const blockConfig = BLOCKS_CONFIG[blockNum - 1];
            activeBadge.textContent = `✦ Bloco ${blockNum}: ${blockConfig.name}`;
          }
          updatePrompterContent(blockNum);
        }
      }
    });
  }, {
    rootMargin: "-20% 0px -60% 0px",
    threshold: 0
  });

  sections.forEach(sec => observer.observe(sec));
}

// =============================================================================
// 4. GUIAS DE FALA E ROTEIRO
// =============================================================================
const PROMPTER_DATA = {
  1: {
    title: "Bloco 01 — Conceito e Tema",
    tip: "Foque em passar o sentimento do jogo nos primeiros momentos.",
    mustSay: [
      "Nome: <strong>Arcane Dead</strong> (Roguelike Tático em C# e Web).",
      "Frase de impacto: <em>'Toda magia deixa um eco. Toda morte cobra um nome.'</em>",
      "Inspirações: Darkest Dungeon (atmosfera sombria e estados alterados), Diablo e Roguelikes clássicos.",
      "Mostre o moodboard e a transição da ideia inicial para a versão final jogável."
    ]
  },
  2: {
    title: "Bloco 02 — Identidade Visual",
    tip: "Destaque a paleta, os 3 heróis e a coerência estética.",
    mustSay: [
      "Apresente a paleta de cores: Ouro Arcano (#c9a227), Roxo Corrupção (#8a65ce) e Fundo Abissal (#07040d).",
      "Tipografia gótica/serifada trazendo clima de antigo grimório medieval.",
      "Apresente os 3 Magos (Ignis, Nivor, Mortis) e seus respectivos Selos e Chefes.",
      "<strong>Harmonia Multiplataforma:</strong> Harmonizar a mesma identidade estética entre Terminal Console (ASCII), Windows Forms (GDI+) e Navegador Web (Blazor/Phaser)."
    ]
  },
  3: {
    title: "Bloco 03 — Demonstração Prática",
    tip: "Sequência demonstrativa que destaca o poder do sistema de combate.",
    mustSay: [
      "1. Ciclo Elemental Triangular (Fogo queima Pestilência, Pestilência apodrece Gelo, Gelo apaga Fogo).",
      "2. Estados Alterados Dinâmicos (Queimadura com dano contínuo, Congelamento com perda de turno, Veneno acumulativo).",
      "3. Mecânicas exclusivas de cada Mago (Intensidade, Espessura, Carga Necrótica).",
      "4. Use o Simulador Interativo na tela para disparar um feitiço e provar o cálculo de fraqueza ao vivo!"
    ]
  },
  4: {
    title: "Bloco 04 — Do Conceito ao Jogo [POO]",
    tip: "Explique sem jargões complexos: 'Todo personagem compartilha o mesmo molde, o que muda é como cada um calcula seus bônus.'",
    mustSay: [
      "Hierarquia Base: Classe abstrata <code>Personagem</code> herdada por <code>Mago</code> e <code>Inimigo</code>.",
      "Polimorfismo Real: <code>CalcularBonusDeAcao()</code> muda a lógica conforme a classe do herói.",
      "Interfaces Transversais: <code>IUsavel</code> (magias e itens) e <code>IRecompensavel</code> (inimigos e baús).",
      "Separação Total de Camadas: O motor de regras não sabe se está rodando no Console ou na Web.",
      "Corte de Escopo Consciente: Priorização de 3 rotas balanceadas em vez de 11 inacabadas."
    ]
  },
  5: {
    title: "Bloco 05 — Como foi o Processo",
    tip: "Transparência técnica: um balanço sincero de desafios e aprendizados de engenharia.",
    mustSay: [
      "Organização e Ferramentas: C# .NET 8, Blazor WebAssembly, Phaser, Git/GitHub.",
      "O que funcionou: Divisão modular em camadas permitiu avançar Web e Console em paralelo.",
      "O que demandou atenção: A sincronização do motor de turnos com animações assíncronas no navegador e mapeamento de spritesheets.",
      "O que faríamos com +2 semanas: Sistema de talentos em árvore e novos magos arcanos."
    ]
  },
  6: {
    title: "Bloco 06 — Equipe e Encerramento",
    tip: "Apresentação dos integrantes e encerramento com o repositório.",
    mustSay: [
      "Gabriel: Ignis (Mago da Chama).",
      "Alex: Nivor (Mago da Geada).",
      "Gabriel: Mortis (Mago da Pestilência).",
      "Aprendizados: Arquitetura Limpa, desacoplamento na prática e gestão de escopo.",
      "Aponte para o link do repositório no GitHub para encerramento!"
    ]
  }
};

function updatePrompterContent(blockId) {
  const data = PROMPTER_DATA[blockId];
  if (!data) return;

  const titleEl = document.getElementById('prompter-block-title');
  const tipEl = document.getElementById('prompter-tip-text');
  const listEl = document.getElementById('prompter-checklist-items');

  if (titleEl) titleEl.textContent = data.title;
  if (tipEl) tipEl.textContent = data.tip;
  if (listEl) {
    listEl.innerHTML = data.mustSay.map(item => `<li>${item}</li>`).join('');
  }
}

function toggleTeleprompter() {
  const drawer = document.getElementById('teleprompter-drawer');
  if (drawer) {
    drawer.classList.toggle('open');
    audio.playClick();
  }
}

// Redirecionamento caso acesse #roteiro ou /roteiro
if (window.location.hash === '#roteiro' || window.location.pathname.endsWith('/roteiro')) {
  window.location.href = 'roteiro.html';
}

// =============================================================================
// 5. SIMULADOR DE COMBATE INTERATIVO
// =============================================================================
const SIM_MAGOS = {
  ignis: {
    name: "Ignis",
    element: "fogo",
    elementLabel: "Chama",
    hp: 120,
    maxHp: 120,
    mana: 80,
    maxMana: 80,
    sprite: "Imagens/UI_Magos_Assets_NULL/IGNIS_Mago.png",
    spells: [
      { id: "faisca", name: "Faísca", cost: 10, power: 30, elem: "fogo", desc: "Dano direto de chama", icon: "Imagens/spells/ignis/faisca.png" },
      { id: "chama-crescente", name: "Chama Crescente", cost: 25, power: 65, elem: "fogo", desc: "Aplica Queimadura (+15/turno)", icon: "Imagens/spells/ignis/chama-crescente.png" },
      { id: "inferno-arcano", name: "Inferno Arcano", cost: 50, power: 120, elem: "fogo", desc: "Explosão de chamas suprema", icon: "Imagens/UI_Magos_Assets_NULL/05_gema_vermelha_grande.png" }
    ]
  },
  nivor: {
    name: "Nivor",
    element: "gelo",
    elementLabel: "Geada",
    hp: 140,
    maxHp: 140,
    mana: 70,
    maxMana: 70,
    sprite: "Imagens/UI_Magos_Assets_NULL/NIVOR_Mago.png",
    spells: [
      { id: "estilhaco", name: "Estilhaço de Gelo", cost: 10, power: 28, elem: "gelo", desc: "Disparo perfurante", icon: "Imagens/spells/nivor/estilhaco-de-gelo.png" },
      { id: "prisao-glacial", name: "Prisão Glacial", cost: 25, power: 55, elem: "gelo", desc: "Aplica Congelamento", icon: "Imagens/spells/nivor/prisao-glacial.png" },
      { id: "zero-absoluto", name: "Zero Absoluto", cost: 45, power: 110, elem: "gelo", desc: "Nevasca devastadora", icon: "Imagens/UI_Magos_Assets_NULL/06_gema_azul_grande.png" }
    ]
  },
  mortis: {
    name: "Mortis",
    element: "pestilencia",
    elementLabel: "Pestilência",
    hp: 110,
    maxHp: 110,
    mana: 90,
    maxMana: 90,
    sprite: "Imagens/UI_Magos_Assets_NULL/MORTIS_Mago.png",
    spells: [
      { id: "toque-putrido", name: "Toque Pútrido", cost: 12, power: 32, elem: "pestilencia", desc: "Drena vida e causa dano", icon: "Imagens/spells/mortis/toque-putrido.png" },
      { id: "nuvem-toxica", name: "Nuvem Tóxica", cost: 28, power: 60, elem: "pestilencia", desc: "Envenena o alvo", icon: "Imagens/spells/mortis/nuvem-toxica.png" },
      { id: "colheita-almas", name: "Colheita de Almas", cost: 55, power: 130, elem: "pestilencia", desc: "Ruptura necrótica final", icon: "Imagens/UI_Magos_Assets_NULL/07_gema_verde_grande.png" }
    ]
  }
};

const SIM_BOSS = {
  name: "Colosso Decomposto",
  element: "pestilencia",
  elementLabel: "Pestilência",
  hp: 350,
  maxHp: 350,
  sprite: "Imagens/bosses/colosso-decomposto/topdown.png"
};

let simState = {
  currentMagoKey: 'ignis',
  magoHp: 120,
  magoMana: 80,
  bossHp: 350,
  isBusy: false
};

function initCombatSimulator() {
  if (!document.getElementById('sim-player-sprite')) return;
  selectSimMago('ignis');
  resetCombatSim();
}

function selectSimMago(magoKey) {
  const data = SIM_MAGOS[magoKey];
  if (!data) return;
  simState.currentMagoKey = magoKey;
  simState.magoHp = data.hp;
  simState.magoMana = data.mana;

  document.querySelectorAll('.btn-mago-select').forEach(b => {
    b.classList.toggle('active', b.dataset.mago === magoKey);
  });

  const spriteEl = document.getElementById('sim-player-sprite');
  const nameEl = document.getElementById('sim-player-name');
  if (spriteEl) spriteEl.src = data.sprite;
  if (nameEl) nameEl.textContent = `${data.name} (${data.elementLabel})`;

  const spellsContainer = document.getElementById('sim-spells-container');
  if (spellsContainer) {
    spellsContainer.innerHTML = data.spells.map((spell, idx) => `
      <button class="btn-spell" onclick="castSimSpell(${idx})">
        <img src="${spell.icon}" class="spell-icon-thumb" alt="${spell.name}">
        <div class="spell-info-text">
          <strong>${spell.name}</strong>
          <small>Custo: ${spell.cost} Mana</small>
        </div>
      </button>
    `).join('');
  }

  updateSimUI();
  logCombatMessage(`Mago ${data.name} assumiu a linha de combate.`, 'normal');
}

function castSimSpell(spellIndex) {
  if (simState.isBusy) return;
  const magoData = SIM_MAGOS[simState.currentMagoKey];
  const spell = magoData.spells[spellIndex];
  if (!spell) return;

  if (simState.magoMana < spell.cost) {
    logCombatMessage(`Mana insuficiente para lançar ${spell.name}!`, 'warn');
    return;
  }

  simState.isBusy = true;
  simState.magoMana -= spell.cost;
  audio.playSpell(spell.elem);

  const playerSprite = document.getElementById('sim-player-sprite');
  const bossSprite = document.getElementById('sim-boss-sprite');
  if (playerSprite) playerSprite.classList.add('cast-anim');

  setTimeout(() => {
    if (playerSprite) playerSprite.classList.remove('cast-anim');
    
    let mult = 1.0;
    let effectText = "";

    if (spell.elem === 'fogo' && SIM_BOSS.element === 'pestilencia') {
      mult = 1.5;
      effectText = " 🔥 [VANTAGEM ELEMENTAL! Fogo queima Pestilência (1.5x) + QUEIMANDO]";
    } else if (spell.elem === 'gelo' && SIM_BOSS.element === 'fogo') {
      mult = 1.5;
      effectText = " ❄️ [VANTAGEM ELEMENTAL! Gelo apaga Fogo (1.5x) + CONGELADO]";
    } else if (spell.elem === 'pestilencia' && SIM_BOSS.element === 'gelo') {
      mult = 1.5;
      effectText = " ☠️ [VANTAGEM ELEMENTAL! Pestilência corrompe Gelo (1.5x) + ENVENENADO]";
    }

    const totalDamage = Math.floor(spell.power * mult);
    simState.bossHp = Math.max(0, simState.bossHp - totalDamage);

    if (bossSprite) bossSprite.classList.add('hit-anim');
    setTimeout(() => {
      if (bossSprite) bossSprite.classList.remove('hit-anim');
    }, 400);

    logCombatMessage(`${magoData.name} conjurou ${spell.name}! Causou ${totalDamage} de dano!${effectText}`, mult > 1 ? 'crit' : 'normal');
    updateSimUI();

    if (simState.bossHp <= 0) {
      logCombatMessage(`⚔️ O ${SIM_BOSS.name} foi expurgado! Vitória da Ordem Arcana!`, 'crit');
      simState.isBusy = false;
      return;
    }

    setTimeout(() => {
      bossCounterAttack();
    }, 750);
  }, 300);
}

function bossCounterAttack() {
  const bossDamage = Math.floor(18 + Math.random() * 12);
  simState.magoHp = Math.max(0, simState.magoHp - bossDamage);

  const playerSprite = document.getElementById('sim-player-sprite');
  if (playerSprite) {
    playerSprite.classList.add('hit-anim');
    setTimeout(() => playerSprite.classList.remove('hit-anim'), 400);
  }

  logCombatMessage(`💀 ${SIM_BOSS.name} usou Golpe de Colapso! Causou ${bossDamage} de dano.`, 'warn');
  
  const magoData = SIM_MAGOS[simState.currentMagoKey];
  simState.magoMana = Math.min(magoData.maxMana, simState.magoMana + 15);
  updateSimUI();

  if (simState.magoHp <= 0) {
    logCombatMessage(`O mago sucumbiu ao miasma do colosso...`, 'warn');
  }

  simState.isBusy = false;
}

function updateSimUI() {
  const magoData = SIM_MAGOS[simState.currentMagoKey];
  
  const playerHpFill = document.getElementById('sim-player-hp-fill');
  const playerManaFill = document.getElementById('sim-player-mana-fill');
  if (playerHpFill) {
    const hpPct = (simState.magoHp / magoData.maxHp) * 100;
    playerHpFill.style.width = `${hpPct}%`;
  }
  if (playerManaFill) {
    const manaPct = (simState.magoMana / magoData.maxMana) * 100;
    playerManaFill.style.width = `${manaPct}%`;
  }

  const bossHpFill = document.getElementById('sim-boss-hp-fill');
  if (bossHpFill) {
    const bossHpPct = (simState.bossHp / SIM_BOSS.maxHp) * 100;
    bossHpFill.style.width = `${bossHpPct}%`;
  }
}

function resetCombatSim() {
  const data = SIM_MAGOS[simState.currentMagoKey];
  simState.magoHp = data.hp;
  simState.magoMana = data.mana;
  simState.bossHp = SIM_BOSS.maxHp;
  simState.isBusy = false;
  updateSimUI();
  logCombatMessage(`--- Batalha reiniciada ---`, 'normal');
}

function logCombatMessage(text, type = 'normal') {
  const logBox = document.getElementById('sim-combat-log');
  if (!logBox) return;
  const entry = document.createElement('div');
  entry.className = `combat-log-entry ${type}`;
  entry.textContent = `> ${text}`;
  logBox.appendChild(entry);
  logBox.scrollTop = logBox.scrollHeight;
}

// =============================================================================
// 6. CANVAS DE PARTÍCULAS ARCANAS
// =============================================================================
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 45;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 1,
      speedY: -(Math.random() * 0.8 + 0.3),
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      color: Math.random() > 0.4 ? 'rgba(201, 162, 39, ' : 'rgba(138, 101, 206, '
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color + '1)';
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// =============================================================================
// 7. ATALHOS DE TECLADO & FULLSCREEN
// =============================================================================
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}

function toggleShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) modal.classList.toggle('active');
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
        scrollToBlock(parseInt(e.key));
        break;
      case ' ':
        e.preventDefault();
        timer.toggle();
        break;
      case 'f':
      case 'F':
        toggleFullScreen();
        break;
      case 'p':
      case 'P':
        toggleTeleprompter();
        break;
      case 't':
      case 'T':
        timer.toggle();
        break;
      case 'r':
      case 'R':
        timer.reset();
        break;
      case 'h':
      case 'H':
      case '?':
        toggleShortcutsModal();
        break;
      case 'Escape':
        const modal = document.getElementById('shortcuts-modal');
        if (modal && modal.classList.contains('active')) modal.classList.remove('active');
        const drawer = document.getElementById('teleprompter-drawer');
        if (drawer && drawer.classList.contains('open')) drawer.classList.remove('open');
        break;
    }
  });
}

// =============================================================================
// 8. INICIALIZAÇÃO GERAL
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  setupKeyboardShortcuts();
  initScrollspy();
  initCombatSimulator();
  updatePrompterContent(1);

  // Botões de Navegação Rápida
  document.querySelectorAll('.nav-pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetBlock = parseInt(btn.dataset.blockTarget);
      scrollToBlock(targetBlock);
    });
  });

  // Copiar HEX de paleta
  document.querySelectorAll('.swatch-card').forEach(card => {
    card.addEventListener('click', () => {
      const hex = card.querySelector('.swatch-hex')?.textContent;
      if (hex && navigator.clipboard) {
        navigator.clipboard.writeText(hex);
        const nameEl = card.querySelector('.swatch-name');
        if (nameEl) {
          const orig = nameEl.textContent;
          nameEl.textContent = 'COPIADO!';
          setTimeout(() => nameEl.textContent = orig, 1200);
        }
      }
    });
  });
});

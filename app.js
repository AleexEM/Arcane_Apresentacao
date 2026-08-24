/**
 * ARCANE DEAD — Script Oficial da Apresentação
 * 3D Parallax Tilt, Roda Elemental, Grimório Interativo, Inspetor de Rotas & POO
 */

// =============================================================================
// 1. ÁUDIO SINTETIZADO LEVE (Web Audio API)
// =============================================================================
class ArcaneSfx {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playBeep(freq = 440, type = 'sine', duration = 0.08) {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }
}

const sfx = new ArcaneSfx();

// =============================================================================
// 2. 3D PARALLAX TILT NOS CARDS
// =============================================================================
function init3DTilt() {
  const cards = document.querySelectorAll('.tilt-target');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

// =============================================================================
// 3. GRIMÓRIO INTERATIVO DE MAGIAS (SEÇÃO 02)
// =============================================================================
const SPELLBOOK_DATA = {
  ignis: [
    {
      name: "Faísca",
      cost: "10 Mana",
      icon: "Imagens/spells/ignis/faisca.png",
      desc: "Disparo rápido de fogo que atinge o alvo com precisão, ideal para iniciar turnos e finalizar inimigos fragilizados.",
      formula: "Dano: (AtaqueMágico * 1.2) + 15"
    },
    {
      name: "Chama Crescente",
      cost: "25 Mana",
      icon: "Imagens/spells/ignis/chama-crescente.png",
      desc: "Evoca uma labareda contínua que incendeia o alvo, infligindo o estado Queimadura por 3 rodadas consecutivas.",
      formula: "Dano: (AtaqueMágico * 1.8) + Queimadura (15/rodada)"
    },
    {
      name: "Inferno Arcano",
      cost: "50 Mana",
      icon: "Imagens/UI_Magos_Assets_NULL/05_gema_vermelha_grande.png",
      desc: "Ruptura piromântica suprema de Ignis. Canaliza a totalidade da chama e amplifica o dano quanto menor for a vida atual do conjurador.",
      formula: "Dano: (AtaqueMágico * 3.2) * (1 + (1 - VidaAtual/VidaMax))"
    }
  ],
  nivor: [
    {
      name: "Estilhaço de Gelo",
      cost: "10 Mana",
      icon: "Imagens/spells/nivor/estilhaco-de-gelo.png",
      desc: "Dispara lâminas pontiagudas de quartzo congelado capazes de perfurar 30% da armadura do adversário.",
      formula: "Dano: (AtaqueMágico * 1.1) [Ignora 30% da Defesa]"
    },
    {
      name: "Prisão Glacial",
      cost: "25 Mana",
      icon: "Imagens/spells/nivor/prisao-glacial.png",
      desc: "Congela as articulações do alvo com gelo perene, forçando a perda completa do próximo turno de ação do inimigo.",
      formula: "Dano: (AtaqueMágico * 1.5) + Congelamento (1 Turno)"
    },
    {
      name: "Zero Absoluto",
      cost: "45 Mana",
      icon: "Imagens/UI_Magos_Assets_NULL/06_gema_azul_grande.png",
      desc: "Uma nevasca destrutiva que cobre toda a arena, concedendo a Nivor um escudo arcano acumulativo equivalente ao dano infligido.",
      formula: "Dano: (AtaqueMágico * 2.8) + Barreira de Gelo (50% Dano)"
    }
  ],
  mortis: [
    {
      name: "Toque Pútrido",
      cost: "12 Mana",
      icon: "Imagens/spells/mortis/toque-putrido.png",
      desc: "Corrompe a matéria orgânica do adversário, drenando vitalidade direta para restaurar a vida de Mortis.",
      formula: "Dano: (AtaqueMágico * 1.3) [Drena 40% do Dano em Vida]"
    },
    {
      name: "Nuvem Tóxica",
      cost: "28 Mana",
      icon: "Imagens/spells/mortis/nuvem-toxica.png",
      desc: "Expeli uma névoa de miasma fétido que aplica acúmulos progressivos de Veneno Necrótico no alvo.",
      formula: "Dano: (AtaqueMágico * 1.6) + 2x Cargas de Veneno"
    },
    {
      name: "Colheita de Almas",
      cost: "55 Mana",
      icon: "Imagens/UI_Magos_Assets_NULL/07_gema_verde_grande.png",
      desc: "Detona todas as infecções e debuffs presentes no inimigo. O dano é multiplicado exponencialmente pelo total de status ativos.",
      formula: "Dano: (AtaqueMágico * 2.5) * (1 + 0.4 * TotalDeStatus)"
    }
  ]
};

function switchSpellbookMago(magoKey) {
  sfx.playBeep(580, 'sine', 0.05);

  document.querySelectorAll('.btn-spell-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tabMago === magoKey);
  });

  const spells = SPELLBOOK_DATA[magoKey] || [];
  const gridEl = document.getElementById('spellbook-grid');
  if (!gridEl) return;

  gridEl.innerHTML = spells.map(spell => `
    <div class="spell-showcase-card tilt-target" onclick="sfx.playBeep(720, 'triangle', 0.08)">
      <div class="spell-card-top">
        <img src="${spell.icon}" alt="${spell.name}" class="spell-card-icon" />
        <div class="spell-card-title">
          <h5>${spell.name}</h5>
          <span class="spell-card-cost">Custo: ${spell.cost}</span>
        </div>
      </div>
      <p class="spell-card-desc">${spell.desc}</p>
      <div class="spell-card-formula">
        <code>${spell.formula}</code>
      </div>
    </div>
  `).join('');

  init3DTilt();
}

// =============================================================================
// 4. RODA ELEMENTAL INTERATIVA (SEÇÃO 03)
// =============================================================================
let currentAttackerElem = 'fogo';
let currentTargetElem = 'pestilencia';

const ELEMENT_LABELS = {
  fogo: { name: 'Chama (Fogo)', icon: '🔥', class: 'elem-fire' },
  gelo: { name: 'Geada (Gelo)', icon: '❄️', class: 'elem-frost' },
  pestilencia: { name: 'Pestilência (Veneno)', icon: '☠️', class: 'elem-poison' }
};

function setAttackerElement(elem) {
  currentAttackerElem = elem;
  sfx.playBeep(480, 'sine', 0.06);

  document.querySelectorAll('.triad-column:first-child .btn-element-pick').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.querySelector(`.triad-column:first-child .btn-element-pick.${elem === 'fogo' ? 'fire' : elem === 'gelo' ? 'frost' : 'poison'}`);
  if (activeBtn) activeBtn.classList.add('active');

  updateTriadCalculation();
}

function setTargetElement(elem) {
  currentTargetElem = elem;
  sfx.playBeep(520, 'sine', 0.06);

  document.querySelectorAll('.triad-column:last-child .btn-element-pick').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.querySelector(`.triad-column:last-child .btn-element-pick.${elem === 'fogo' ? 'fire' : elem === 'gelo' ? 'frost' : 'poison'}`);
  if (activeBtn) activeBtn.classList.add('active');

  updateTriadCalculation();
}

function updateTriadCalculation() {
  const orbAttacker = document.getElementById('triad-orb-attacker');
  const orbTarget = document.getElementById('triad-orb-target');
  const badgeResult = document.getElementById('triad-result-badge');
  const statusResult = document.getElementById('triad-status-result');

  const attData = ELEMENT_LABELS[currentAttackerElem];
  const tgtData = ELEMENT_LABELS[currentTargetElem];

  if (orbAttacker) {
    orbAttacker.textContent = attData.icon;
    orbAttacker.className = `triad-orb ${attData.class}`;
  }
  if (orbTarget) {
    orbTarget.textContent = tgtData.icon;
    orbTarget.className = `triad-orb ${tgtData.class}`;
  }

  // Lógica de cálculo
  let multiplier = 1.0;
  let type = 'neutral';
  let badgeText = '1.0x Dano Neutro';
  let statusText = 'Sem bônus elemental.';

  if (currentAttackerElem === 'fogo' && currentTargetElem === 'pestilencia') {
    multiplier = 1.5;
    type = 'advantage';
    badgeText = '🔥 1.5x Dano Crítico (Vantagem Elemental)';
    statusText = 'O fogo purga o miasma: Aplica Queimadura contínua por 3 rodadas (+15 dano/turno).';
  } else if (currentAttackerElem === 'pestilencia' && currentTargetElem === 'gelo') {
    multiplier = 1.5;
    type = 'advantage';
    badgeText = '☠️ 1.5x Dano Crítico (Vantagem Elemental)';
    statusText = 'A pestilência apodrece o gelo: Aplica Veneno Necrótico que dobra a cada turno de ação.';
  } else if (currentAttackerElem === 'gelo' && currentTargetElem === 'fogo') {
    multiplier = 1.5;
    type = 'advantage';
    badgeText = '❄️ 1.5x Dano Crítico (Vantagem Elemental)';
    statusText = 'O gelo apaga a chama: Aplica Congelamento Profundo (Alvo perde 100% da ação no próximo turno).';
  } else if (
    (currentAttackerElem === 'fogo' && currentTargetElem === 'gelo') ||
    (currentAttackerElem === 'gelo' && currentTargetElem === 'pestilencia') ||
    (currentAttackerElem === 'pestilencia' && currentTargetElem === 'fogo')
  ) {
    multiplier = 0.75;
    type = 'disadvantage';
    badgeText = '🛡️ 0.75x Dano Reduzido (Desvantagem Elemental)';
    statusText = 'O elemento atacante é dissipado pela resistência natural do alvo. Não aplica estados alterados.';
  } else {
    multiplier = 1.0;
    type = 'neutral';
    badgeText = '⚖️ 1.0x Dano Normal (Confronto Entre Elementos Iguais)';
    statusText = 'Dano padrão calculado puramente com base no Ataque Mágico e na Defesa do alvo.';
  }

  if (badgeResult) {
    badgeResult.textContent = badgeText;
    badgeResult.className = `triad-result-badge ${type}`;
  }
  if (statusResult) {
    statusResult.textContent = statusText;
  }
}

// =============================================================================
// 5. INSPETOR DE ROTAS COM HOTSPOTS (SEÇÃO 03)
// =============================================================================
const ROUTES_DATA = {
  cemiterio: {
    title: "Cemitério Torcido",
    tag: "Rota da Pestilência",
    mapImg: "Imagens/gui/mapa-cemiterio-hd.png",
    desc: "Pântanos fúnebres cobertos por névoas de miasma e criptas ancestrais profanadas. O solo venenoso drena vitalidade a cada travessia.",
    boss: "Colosso Decomposto",
    weakness: "Chama / Fogo (Ignis)",
    weaknessColor: "#ff5e36",
    hazard: "Névoa Miasmática (Dano Contínuo de Veneno)",
    hotspots: [
      { id: 1, top: '25%', left: '20%', label: '1', title: 'Portão dos Esquecidos', desc: 'Entrada fortificada do cemitério onde hordas de carniçais vigiam a primeira rota.' },
      { id: 2, top: '50%', left: '45%', label: '2', title: 'Câmara do Selo Rompido', desc: 'Altar de oferendas necróticas que gera baús amaldiçoados e emboscadas com monstros de elite.' },
      { id: 3, top: '75%', left: '80%', label: '3', title: 'Túmulo do Colosso', desc: 'Arena final da rota onde o Colosso Decomposto aguarda os magos com ataques em área devoradores.' }
    ]
  },
  mina: {
    title: "Mina de Cristal",
    tag: "Rota da Geada",
    mapImg: "Imagens/gui/mapa-vila-hd.png",
    desc: "Cavernas gélidas e minas abandonadas incrustadas de quartzo arcano. As baixas temperaturas reduzem a velocidade de conjuração dos heróis.",
    boss: "Vigia Congelado",
    weakness: "Pestilência / Veneno (Mortis)",
    weaknessColor: "#4ade80",
    hazard: "Solo Escorregadio & Cristais Cortantes",
    hotspots: [
      { id: 1, top: '30%', left: '25%', label: '1', title: 'Poço dos Mineiros', desc: 'Túnel de descida infestado de golens de gelo e estalactites pontiagudas.' },
      { id: 2, top: '55%', left: '50%', label: '2', title: 'Caverna de Quartzo', desc: 'Santuário de recarga de mana protegido por espectros congelados.' },
      { id: 3, top: '70%', left: '78%', label: '3', title: 'Plataforma do Vigia', desc: 'O topo da mina onde o Vigia Congelado ergue pilares de gelo milenar.' }
    ]
  },
  forja: {
    title: "Forja Rubra",
    tag: "Rota da Chama",
    mapImg: "Imagens/gui/mapa-fortaleza-hd.png",
    desc: "Fortaleza vulcânica cravada no centro de uma cratera de magma ardente. O calor extremo exige rapidez para evitar superaquecimento.",
    boss: "General de Cinzas",
    weakness: "Geada / Gelo (Nivor)",
    weaknessColor: "#38bdf8",
    hazard: "Geysers de Magma & Calor Opressivo",
    hotspots: [
      { id: 1, top: '28%', left: '22%', label: '1', title: 'Ponte das Brasas', desc: 'Passagem suspensa sobre rios de lava com defensores blindados em escamas de dragão.' },
      { id: 2, top: '52%', left: '48%', label: '2', title: 'Fornalha Primordial', desc: 'Oficina ancestral com armas e relíquias raras protegidas por piromantes renegados.' },
      { id: 3, top: '78%', left: '75%', label: '3', title: 'Trono do General', desc: 'Câmara do titânico General de Cinzas, cujo frenesi a 50% de HP explode o piso da arena.' }
    ]
  }
};

function switchRoute(routeKey) {
  sfx.playBeep(620, 'sine', 0.05);

  document.querySelectorAll('.btn-route-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.route === routeKey);
  });

  const data = ROUTES_DATA[routeKey];
  if (!data) return;

  const mapImg = document.getElementById('route-active-map-img');
  const tagLabel = document.getElementById('route-tag-label');
  const nameTitle = document.getElementById('route-name-title');
  const descText = document.getElementById('route-desc-text');
  const bossName = document.getElementById('route-boss-name');
  const elemRec = document.getElementById('route-element-rec');
  const hazardDesc = document.getElementById('route-hazard-desc');
  const hotspotsContainer = document.getElementById('map-hotspots-container');
  const detailBox = document.getElementById('hotspot-active-detail');

  if (mapImg) mapImg.src = data.mapImg;
  if (tagLabel) tagLabel.textContent = data.tag;
  if (nameTitle) nameTitle.textContent = data.title;
  if (descText) descText.textContent = data.desc;
  if (bossName) bossName.textContent = data.boss;
  if (elemRec) {
    elemRec.textContent = data.weakness;
    elemRec.style.color = data.weaknessColor;
  }
  if (hazardDesc) hazardDesc.textContent = data.hazard;

  if (detailBox) {
    detailBox.innerHTML = `<span class="hotspot-hint">Passe o mouse ou clique nos pontos numerados do mapa para inspecionar cada nó tático.</span>`;
  }

  if (hotspotsContainer) {
    hotspotsContainer.innerHTML = data.hotspots.map(h => `
      <div class="hotspot-pin" style="top: ${h.top}; left: ${h.left};" onclick="showHotspotInfo('${routeKey}', ${h.id})" title="${h.title}">
        ${h.label}
      </div>
    `).join('');
  }
}

function showHotspotInfo(routeKey, hotspotId) {
  sfx.playBeep(750, 'sine', 0.06);
  const route = ROUTES_DATA[routeKey];
  if (!route) return;
  const hotspot = route.hotspots.find(h => h.id === hotspotId);
  if (!hotspot) return;

  const detailBox = document.getElementById('hotspot-active-detail');
  if (detailBox) {
    detailBox.innerHTML = `
      <strong style="color:var(--gold-glow); font-family:var(--font-title); font-size:0.95rem; display:block; margin-bottom:0.2rem;">
        📍 Nó ${hotspot.label}: ${hotspot.title}
      </strong>
      <span>${hotspot.desc}</span>
    `;
  }
}

// =============================================================================
// 6. INSPETOR INTERATIVO DE POO C# (SEÇÃO 04)
// =============================================================================
const POO_DATA = {
  personagem: {
    title: "Classe Abstrata Base: Personagem",
    code: `<span class="code-keyword">public abstract class</span> <span class="code-type">Personagem</span>
{
    <span class="code-keyword">public string</span> Nome { <span class="code-keyword">get</span>; <span class="code-keyword">protected set</span>; }
    <span class="code-keyword">public int</span> Vida { <span class="code-keyword">get</span>; <span class="code-keyword">protected set</span>; }
    <span class="code-keyword">public int</span> VidaMaxima { <span class="code-keyword">get</span>; <span class="code-keyword">protected set</span>; }
    <span class="code-keyword">public int</span> Defesa { <span class="code-keyword">get</span>; <span class="code-keyword">protected set</span>; }
    <span class="code-keyword">public List</span>&lt;<span class="code-type">EfeitoEstado</span>&gt; StatusAtivos { <span class="code-keyword">get</span>; } = <span class="code-keyword">new</span>();

    <span class="code-comment">// Método polimórfico de atenuação de dano</span>
    <span class="code-keyword">public virtual void</span> <span class="code-func">ReceberDano</span>(<span class="code-keyword">int</span> valorBruto, <span class="code-type">Elemento</span> elemento)
    {
        <span class="code-keyword">int</span> danoFinal = Math.Max(1, valorBruto - Defesa);
        Vida = Math.Max(0, Vida - danoFinal);
    }

    <span class="code-keyword">public abstract void</span> <span class="code-func">ExecutarTurno</span>();
}`,
    explanation: "A classe base unifica o contrato biológico e mecânico de qualquer entidade que participa da batalha. Centraliza a mitigação de dano por defesa, controle de vida e a lista polimórfica de estados alterados ativos.",
    badges: [
      "Abstração Pura: Sem dependência de tela",
      "Polimorfismo em ReceberDano()",
      "Lista heterogênea de EfeitoEstado"
    ]
  },
  mago: {
    title: "Classe Especializada: Mago (Herança)",
    code: `<span class="code-keyword">public class</span> <span class="code-type">Mago</span> : <span class="code-type">Personagem</span>
{
    <span class="code-keyword">public int</span> Mana { <span class="code-keyword">get</span>; <span class="code-keyword">private set</span>; }
    <span class="code-keyword">public int</span> ManaMaxima { <span class="code-keyword">get</span>; <span class="code-keyword">private set</span>; }
    <span class="code-keyword">public TipoMago</span> Especializacao { <span class="code-keyword">get</span>; }
    <span class="code-keyword">public List</span>&lt;<span class="code-type">Habilidade</span>&gt; Grimorio { <span class="code-keyword">get</span>; } = <span class="code-keyword">new</span>();

    <span class="code-keyword">public override void</span> <span class="code-func">ExecutarTurno</span>()
    {
        <span class="code-comment">// Regeneração natural de mana e cálculo da passiva de herói</span>
        Mana = Math.Min(ManaMaxima, Mana + 10);
    }

    <span class="code-keyword">public void</span> <span class="code-func">Conjurar</span>(<span class="code-type">IUsavel</span> magia, <span class="code-type">Personagem</span> alvo)
    {
        magia.<span class="code-func">Usar</span>(<span class="code-keyword">this</span>, alvo);
    }
}`,
    explanation: "Especialização do herói jogador com regras adicionais de gerenciamento de mana, lista de magias aprendidas e progressão de nível de 1 a 30.",
    badges: [
      "Herança direta de Personagem",
      "Consumo desacoplado via interface IUsavel",
      "Especializações: Ignis, Nivor, Mortis"
    ]
  },
  inimigo: {
    title: "Classe Especializada: Inimigo (IA de Decisão)",
    code: `<span class="code-keyword">public class</span> <span class="code-type">Inimigo</span> : <span class="code-type">Personagem</span>, <span class="code-type">IRecompensavel</span>
{
    <span class="code-keyword">public int</span> RecompensaXP { <span class="code-keyword">get</span>; }
    <span class="code-keyword">public int</span> MoedasDropadas { <span class="code-keyword">get</span>; }

    <span class="code-keyword">public override void</span> <span class="code-func">ExecutarTurno</span>()
    {
        <span class="code-comment">// Árvore de decisão da IA (ataque, defesa ou fúria)</span>
        <span class="code-type">AcaoCombate</span> proximaAcao = <span class="code-func">DecidirAcao</span>();
        proximaAcao.<span class="code-func">Executar</span>();
    }

    <span class="code-keyword">public</span> <span class="code-type">Espolio</span> <span class="code-func">EntregarRecompensa</span>()
    {
        <span class="code-keyword">return new</span> <span class="code-type">Espolio</span>(RecompensaXP, MoedasDropadas);
    }
}`,
    explanation: "Modela monstros comuns e chefes. Contém a árvore de decisão para escolher ações automaticamente e implementa a entrega de recompensas pós-combate.",
    badges: [
      "Implementa IRecompensavel",
      "Árvore de Decisão Desacoplada (DecidirAcao)",
      "Transição de Fases aos 50% de HP"
    ]
  },
  interfaces: {
    title: "Interfaces Transversais: IUsavel & IRecompensavel",
    code: `<span class="code-keyword">public interface</span> <span class="code-type">IUsavel</span>
{
    <span class="code-keyword">string</span> Nome { <span class="code-keyword">get</span>; }
    <span class="code-keyword">int</span> CustoRecurso { <span class="code-keyword">get</span>; }
    <span class="code-keyword">void</span> <span class="code-func">Usar</span>(<span class="code-type">Personagem</span> conjurador, <span class="code-type">Personagem</span> alvo);
}

<span class="code-keyword">public interface</span> <span class="code-type">IRecompensavel</span>
{
    <span class="code-type">Espolio</span> <span class="code-func">EntregarRecompensa</span>();
}`,
    explanation: "As interfaces conectam classes que não compartilham a mesma árvore de herança. A interface IUsavel permite disparar Magias e Itens de inventário pela mesma assinatura no motor de turnos.",
    badges: [
      "IUsavel implementada por Magias e Itens",
      "IRecompensavel implementada por Inimigos e Baús",
      "Polimorfismo puro sem herança forçada"
    ]
  },
  camadas: {
    title: "Arquitetura Limpa em 3 Camadas",
    code: `<span class="code-comment">// [1] CAMADA DE APRESENTAÇÃO (Console / WinForms / Web)</span>
<span class="code-comment">// Apenas renderiza estado e dispara intenções do usuário</span>

<span class="code-comment">// [2] CAMADA DE SERVIÇOS & REGRAS (ArcaneDead.Engine)</span>
<span class="code-keyword">public class</span> <span class="code-type">MotorTurnos</span>
{
    <span class="code-keyword">public void</span> <span class="code-func">ProcessarTurno</span>(<span class="code-type">Personagem</span> atacante, <span class="code-type">IUsavel</span> acao, <span class="code-type">Personagem</span> alvo)
    {
        acao.<span class="code-func">Usar</span>(atacante, alvo);
        <span class="code-func">AvaliarEstadosAlterados</span>(alvo);
    }
}

<span class="code-comment">// [3] CAMADA DE DOMÍNIO PURO (ArcaneDead.Core)</span>
<span class="code-comment">// Personagem, Mago, Inimigo, EfeitoEstado, Elemento</span>`,
    explanation: "Desacoplamento total: a camada de domínio puro não possui nenhuma referência a bibliotecas gráficas ou de console. Toda a lógica de combate é 100% testável por testes unitários.",
    badges: [
      "Camada Core com 0 dependências externas",
      "MotorTurnos orquestra a fila assíncrona/síncrona",
      "Pronto para novas plataformas sem alterar regras"
    ]
  }
};

function switchPooTab(tabKey) {
  sfx.playBeep(600, 'sine', 0.05);

  document.querySelectorAll('.btn-poo-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.poo === tabKey);
  });

  const data = POO_DATA[tabKey];
  if (!data) return;

  const displayEl = document.getElementById('poo-inspector-display');
  if (!displayEl) return;

  displayEl.innerHTML = `
    <div class="poo-grid-view">
      <div class="code-viewer-panel">
        <div class="code-header-bar">
          <span>${data.title}</span>
          <span>C# .NET 8</span>
        </div>
        <pre class="code-snippet-box"><code>${data.code}</code></pre>
      </div>

      <div class="code-explanation-sidebar">
        <h4 class="code-explanation-title">${data.title}</h4>
        <p class="code-explanation-text">${data.explanation}</p>
        <div class="poo-feature-badges">
          ${data.badges.map(b => `<div class="poo-badge-row"><strong>✓</strong> ${b}</div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

// =============================================================================
// 7. CANVAS DE PARTÍCULAS REATIVAS AO CURSOR
// =============================================================================
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  let mouse = { x: -1000, y: -1000 };

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  const particles = [];
  const particleCount = 45;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      speedY: -(Math.random() * 0.7 + 0.2),
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.45 ? 'rgba(201, 162, 39, ' : 'rgba(138, 101, 206, '
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;

      // Reação magnética suave ao cursor
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        const force = (120 - dist) / 120;
        p.x -= (dx / dist) * force * 1.5;
        p.y -= (dy / dist) * force * 1.5;
      }

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color + '0.8)';
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// =============================================================================
// 8. REVEAL SUAVE AO ROLAR
// =============================================================================
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-item');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.08
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

// =============================================================================
// 9. INICIALIZAÇÃO GERAL
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initScrollReveal();
  init3DTilt();

  // Inicializar Grimório, Roda Elemental, Rotas e POO
  switchSpellbookMago('ignis');
  updateTriadCalculation();
  switchRoute('cemiterio');
  switchPooTab('personagem');

  // Copiar código HEX da paleta com feedback suave
  document.querySelectorAll('.swatch-card').forEach(card => {
    card.addEventListener('click', () => {
      const hex = card.dataset.hex || card.querySelector('.swatch-hex')?.textContent;
      if (hex && navigator.clipboard) {
        navigator.clipboard.writeText(hex);
        sfx.playBeep(650, 'sine', 0.08);
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

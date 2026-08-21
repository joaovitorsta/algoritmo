// ==================== ESTADO DO JOGO ====================
const gameState = {
    class: "guerreiro",
    level: 1,
    health: 100,
    maxHealth: 100,
    gold: 25,
    inventory: ["Tocha"],
    currentStep: 1
};

// Configurações das Classes de Personagem
const classConfigs = {
    guerreiro: { title: "Guerreiro do Abismo", icon: "⚔️", bonusHp: 30, bonusGold: 0, extraItem: "Escudo de Madeira" },
    mago: { title: "Mago Arcano", icon: "🔮", bonusHp: 0, bonusGold: 10, extraItem: "Pergaminho de Fogo" },
    ladino: { title: "Ladino Sombrio", icon: "🗡️", bonusHp: 10, bonusGold: 35, extraItem: "Gazuas de Aço" }
};

// Mapeamento dos Elementos do DOM
const dom = {
    // Telas
    coverScreen: document.getElementById('cover-screen'),
    gameScreen: document.getElementById('game-screen'),
    btnStartGame: document.getElementById('btn-start-game'),
    btnRestart: document.getElementById('btn-restart'),
    classCards: document.querySelectorAll('.class-card'),

    // Elementos HUD
    playerAvatar: document.getElementById('player-avatar'),
    playerClassTitle: document.getElementById('player-class-title'),
    playerLevel: document.getElementById('player-level'),
    healthBar: document.getElementById('health-bar'),
    healthVal: document.getElementById('health-val'),
    goldVal: document.getElementById('gold-val'),
    statusBadge: document.getElementById('status-badge'),

    // Elementos de História
    locationTitle: document.getElementById('location-title'),
    storyCard: document.getElementById('story-card'),
    storyText: document.getElementById('story-text'),
    choicesContainer: document.getElementById('choices-container'),

    // Sidebar
    inventoryList: document.getElementById('inventory-list'),
    inventoryCount: document.getElementById('inventory-count'),
    logBox: document.getElementById('log-box')
};

// ==================== BASE DE DADOS DE HISTÓRIA ====================
const storyTree = {
    1: {
        location: "Entrada do Abismo",
        text: "Você se encontra na garganta do Abismo Sombrio. A névoa dança ao redor de suas botas enquanto o eco de sussurros antigos ecoa das profundezas.",
        status: "saudavel",
        choices: [
            { text: "Avançar pelo Túnel dos Cristais à esquerda", nextStep: 2, log: "Entrou no Túnel dos Cristais." },
            { text: "Descender pela Ravina Molhada à direita", nextStep: 3, log: "Iniciou descida pela ravina." }
        ]
    },
    2: {
        location: "Túnel dos Cristais",
        text: "Cristais púrpuras emitem um brilho pulsante nas paredes. Um Goblin Guardião dorme pesadamente sobre um baú reforçado.",
        status: "saudavel",
        choices: [
            { 
                text: "Tentar roubar o baú silenciosamente", 
                nextStep: 4, 
                log: "O guardião despertou e emboscou você!",
                effect: () => applyDamage(25)
            },
            { 
                text: "Lançar feitiço no guardião", 
                nextStep: 5, 
                requiredItem: "Pergaminho de Fogo",
                log: "Você incinerou o guardião com o Pergaminho!",
                effect: () => removeItem("Pergaminho de Fogo")
            },
            { 
                text: "Contornar o guardião usando escudo de proteção", 
                nextStep: 5, 
                requiredItem: "Escudo de Madeira",
                log: "Seu escudo bloqueou o alerta e você passou ileso."
            }
        ]
    },
    3: {
        location: "Ravina Molhada",
        text: "Um rio subterrâneo corre com força total. Um barqueiro esquelético ergue sua lanterna silenciosamente.",
        status: "saudavel",
        choices: [
            { 
                text: "Pagar 20 moedas para a travessia", 
                nextStep: 6, 
                requiredGold: 20,
                log: "Atravessou o rio em segurança com o barqueiro.",
                effect: () => updateGold(-20)
            },
            { 
                text: "Tentar nadar na correnteza fria", 
                nextStep: 7, 
                log: "A correnteza o esmagou contra as rochas!",
                effect: () => applyDamage(40)
            }
        ]
    },
    4: {
        location: "Confronto do Guardião",
        text: "Você sofreu danos do ataque do goblin, mas conseguiu derrotá-lo e pegou uma Chave Dourada do seu cinto.",
        status: "ferido",
        choices: [
            { 
                text: "Coletar a chave e avançar para o Portal", 
                nextStep: 6, 
                log: "Adicionou a Chave Dourada ao inventário.",
                effect: () => addItem("Chave Dourada")
            }
        ]
    },
    5: {
        location: "Câmara dos Tesouros",
        text: "Com o guardião fora do caminho, você abre o baú e descobre um tesouro lendário contendo 60 moedas e uma Poção Sagrada!",
        status: "saudavel",
        choices: [
            { 
                text: "Coletar tesouro e avançar para o Salão Final", 
                nextStep: 8, 
                log: "Encontrou tesouro precioso no baú!",
                effect: () => {
                    updateGold(60);
                    addItem("Poção Sagrada");
                }
            }
        ]
    },
    6: {
        location: "Portal do Destino",
        text: "Uma imensa porta de ferro trancada com entalhes de dragão bloqueia a saída do abismo.",
        status: "saudavel",
        choices: [
            { 
                text: "Usar a Chave Dourada na fechadura", 
                nextStep: 9, 
                requiredItem: "Chave Dourada",
                log: "Destrancou o Portal do Destino!" 
            },
            { 
                text: "Usar Gazuas de Aço para arrombar", 
                nextStep: 9, 
                requiredItem: "Gazuas de Aço",
                log: "Arrombou a fechadura com maestria!" 
            },
            { 
                text: "Tentar quebrar a porta no soco", 
                nextStep: 7, 
                log: "A porta rígida quebrou seus ossos!",
                effect: () => applyDamage(100)
            }
        ]
    },
    7: {
        location: "Morte no Abismo",
        text: "Suas forças se esgotaram e a escuridão do abismo o consumiu para sempre...",
        status: "ferido",
        choices: [
            { text: "Recomeçar do Início", nextStep: 1, log: "Reiniciando a jornada..." }
        ]
    },
    8: {
        location: "Caminho da Glória",
        text: "Luz solar brilha ao longe. Você encontrou o caminho direto para a liberdade e glória!",
        status: "vitoria",
        choices: [
            { text: "Emergir Vitorioso", nextStep: 9, log: "Você conquistou o Abismo Sombrio!" }
        ]
    },
    9: {
        location: "Superfície — Vitória!",
        text: "Você escapou do Abismo Sombrio com suas riquezas e tornou-se uma lenda viva!",
        status: "vitoria",
        choices: [
            { text: "Jogar Novamente", nextStep: 1, log: "Preparando nova aventura..." }
        ]
    }
};

// ==================== MANIPULAÇÃO DE CLASSES DE PERSONAGEM ====================

// Uso de forEach para adicionar addEventListener nos cards de seleção de classe
dom.classCards.forEach(card => {
    card.addEventListener('click', () => {
        dom.classCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        gameState.class = card.dataset.class;
    });
});

// Configura os atributos iniciais baseados na classe escolhida
function applyClassStats() {
    const config = classConfigs[gameState.class];
    gameState.maxHealth = 100 + config.bonusHp;
    gameState.health = gameState.maxHealth;
    gameState.gold = 25 + config.bonusGold;
    gameState.inventory = ["Tocha", config.extraItem];

    dom.playerAvatar.innerText = config.icon;
    dom.playerClassTitle.innerText = config.title;
}

// ==================== LÓGICA DE JOGO E ESTADO ====================

function applyDamage(amount) {
    gameState.health = Math.max(0, gameState.health - amount);
    updateHUD();
    if (gameState.health === 0) {
        renderStep(7);
    }
}

function updateGold(amount) {
    gameState.gold = Math.max(0, gameState.gold + amount);
    updateHUD();
}

function addItem(item) {
    if (!gameState.inventory.includes(item)) {
        gameState.inventory.push(item);
        renderInventory();
    }
}

function removeItem(item) {
    gameState.inventory = gameState.inventory.filter(i => i !== item);
    renderInventory();
}

function updateHUD() {
    const healthPercent = (gameState.health / gameState.maxHealth) * 100;
    dom.healthBar.style.width = `${healthPercent}%`;
    dom.healthVal.innerText = `${gameState.health} / ${gameState.maxHealth}`;
    dom.goldVal.innerText = gameState.gold;

    if (gameState.health < gameState.maxHealth * 0.4) {
        dom.statusBadge.dataset.state = "ferido";
        dom.statusBadge.innerText = "Ferido";
    }
}

function addLog(text) {
    const entry = document.createElement('div');
    entry.classList.add('log-entry');
    entry.innerText = `> ${text}`;
    dom.logBox.appendChild(entry);
    dom.logBox.scrollTop = dom.logBox.scrollHeight;
}

// ==================== RENDERIZAÇÃO DO DOM (FOREACH & EVENTS) ====================

// Renderização dinâmica do inventário usando forEach
function renderInventory() {
    dom.inventoryList.innerHTML = '';
    
    gameState.inventory.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('inventory-item');
        li.innerHTML = `<span>📦</span> <span>${item}</span>`;
        dom.inventoryList.appendChild(li);
    });

    dom.inventoryCount.innerText = `${gameState.inventory.length}/6`;
}

// Renderização das etapas da história
function renderStep(stepId) {
    if (stepId === 1) resetGame();

    const step = storyTree[stepId];
    gameState.currentStep = stepId;

    // Atualização de atributos dataset no DOM
    dom.storyCard.dataset.step = stepId;
    dom.statusBadge.dataset.state = step.status;

    // Manipulação textual do DOM
    dom.locationTitle.innerText = step.location;
    dom.storyText.innerText = step.text;
    dom.statusBadge.innerText = step.status.toUpperCase();

    // Limpa a lista de escolhas
    dom.choicesContainer.innerHTML = '';

    // Uso do método forEach para criar dinamicamente os botões de ação
    step.choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('btn-choice');
        
        let reqText = '';
        let canSelect = true;

        if (choice.requiredItem && !gameState.inventory.includes(choice.requiredItem)) {
            canSelect = false;
            reqText = ` (Requer: ${choice.requiredItem})`;
        }
        if (choice.requiredGold && gameState.gold < choice.requiredGold) {
            canSelect = false;
            reqText = ` (Requer: ${choice.requiredGold} Ouro)`;
        }

        button.innerHTML = `<span>${choice.text}${reqText}</span> <span>➔</span>`;
        button.disabled = !canSelect;

        // Adiciona evento de clique a cada opção gerada
        button.addEventListener('click', () => {
            if (choice.effect) choice.effect();
            if (choice.log) addLog(choice.log);
            renderStep(choice.nextStep);
        });

        dom.choicesContainer.appendChild(button);
    });
}

function resetGame() {
    applyClassStats();
    dom.logBox.innerHTML = '';
    addLog("Nova jornada iniciada no Abismo.");
    updateHUD();
    renderInventory();
}

// ==================== EVENT LISTENERS PRINCIPAIS ====================

// Transição da Tela Inicial/Capa para o Jogo
dom.btnStartGame.addEventListener('click', () => {
    dom.coverScreen.classList.remove('active');
    dom.coverScreen.classList.add('hidden');

    dom.gameScreen.classList.remove('hidden');
    dom.gameScreen.classList.add('active');

    resetGame();
    renderStep(1);
});

// Reiniciar Aventura
dom.btnRestart.addEventListener('click', () => {
    resetGame();
    renderStep(1);
});

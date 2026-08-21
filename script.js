// ==================== ESTADO DO JOGO ====================
const gameState = {
    health: 100,
    gold: 25,
    inventory: ["Tocha", "Poção de Cura"],
    currentStep: 1
};

// ==================== MAPEAMENTO DE ELEMENTOS DO DOM ====================
const elements = {
    // Telas
    coverScreen: document.getElementById('cover-screen'),
    gameScreen: document.getElementById('game-screen'),
    btnStart: document.getElementById('btn-start'),
    btnRestart: document.getElementById('btn-restart'),
    
    // Elementos do Jogo
    storyCard: document.getElementById('story-card'),
    storyText: document.getElementById('story-text'),
    locationTag: document.getElementById('location-tag'),
    choicesContainer: document.getElementById('choices-container'),
    healthBar: document.getElementById('health-bar'),
    healthVal: document.getElementById('health-val'),
    goldVal: document.getElementById('gold-val'),
    statusBadge: document.getElementById('status-badge'),
    inventoryList: document.getElementById('inventory-list'),
    logBox: document.getElementById('log-box')
};

// ==================== BANCO DE DADOS DA HISTÓRIA ====================
const storyTree = {
    1: {
        location: "Entrada do Abismo",
        text: "Você está diante da colossal entrada do Abismo Sombrio. O ar é frio e o som do vento causa calafrios. Com sua tocha acesa, você avista duas passagens.",
        status: "normal",
        choices: [
            { text: "Entrar pelo túnel rochoso à esquerda", nextStep: 2, log: "Você entrou no túnel escuro." },
            { text: "Descender pelo caminho à direita", nextStep: 3, log: "Você desceu o caminho inclinado." }
        ]
    },
    2: {
        location: "Túnel dos Cristais",
        text: "Cristais roxos iluminam levemente o caminho. Um goblin guardião dorme profundamente ao lado de um baú antigo.",
        status: "perigo",
        choices: [
            { 
                text: "Tentar roubar o baú silenciosamente", 
                nextStep: 4, 
                log: "O goblin acordou e atacou você antes de fugir!",
                effect: () => applyDamage(20)
            },
            { 
                text: "Usar Poção de Cura e passar com cuidado", 
                nextStep: 5, 
                requiredItem: "Poção de Cura",
                log: "Você bebeu a poção, recuperou vida e contornou o inimigo.",
                effect: () => {
                    healPlayer(30);
                    removeItem("Poção de Cura");
                }
            }
        ]
    },
    3: {
        location: "Rio Subterrâneo",
        text: "Um rio de águas escuras e turbulentas corta a caverna. Um barqueiro misterioso aguarda em silêncio.",
        status: "normal",
        choices: [
            { 
                text: "Pagar 15 moedas de ouro para atravessar", 
                nextStep: 6, 
                requiredGold: 15,
                log: "Você pagou o barqueiro e atravessou o rio em segurança.",
                effect: () => updateGold(-15)
            },
            { 
                text: "Tentar atravessar a nadar", 
                nextStep: 7, 
                log: "A correnteza era forte demais! Você foi arrastado e ferido.",
                effect: () => applyDamage(40)
            }
        ]
    },
    4: {
        location: "Sala do Guardião",
        text: "Você sofreu danos, mas encontrou uma Chave Dourada deixada para trás pelo goblin em fuga.",
        status: "perigo",
        choices: [
            { 
                text: "Pegar a Chave Dourada e prosseguir", 
                nextStep: 8, 
                log: "Chave Dourada adicionada ao inventário.",
                effect: () => addItem("Chave Dourada")
            }
        ]
    },
    5: {
        location: "Câmara Secreta",
        text: "Você encontrou uma sala escondida cheia de suprimentos e um baú com 40 moedas de ouro!",
        status: "normal",
        choices: [
            { 
                text: "Pegar o ouro e ir para o Salão Principal", 
                nextStep: 8, 
                log: "Você recolheu 40 moedas de ouro.",
                effect: () => updateGold(40)
            }
        ]
    },
    6: {
        location: "Portal Antigo",
        text: "O barqueiro o deixou em uma grande câmara com um portal trancado por uma fechadura de ouro.",
        status: "normal",
        choices: [
            { 
                text: "Usar a Chave Dourada para abrir o portal", 
                nextStep: 9, 
                requiredItem: "Chave Dourada",
                log: "Você destrancou o portal com a chave!" 
            },
            { 
                text: "Forçar a passagem pelas pedras ao lado", 
                nextStep: 7, 
                log: "As pedras desmoronaram sobre você!" 
            }
        ]
    },
    7: {
        location: "Derrota no Abismo",
        text: "Seus ferimentos foram graves demais e suas forças se esgotaram nas trevas...",
        status: "perigo",
        choices: [
            { text: "Tentar novamente", nextStep: 1, log: "Reiniciando a aventura..." }
        ]
    },
    8: {
        location: "Salão do Destino",
        text: "Uma grande luz dourada surge ao fim do corredor. É a saída secreta do Abismo Sombrio!",
        status: "normal",
        choices: [
            { text: "Marchar em direção à luz e escapar", nextStep: 9, log: "Você escapou da caverna com vida!" }
        ]
    },
    9: {
        location: "Superfície - Vitória!",
        text: "Parabéns! Você emergiu vitorioso sob o céu estrelado, carregando riquezas e glória!",
        status: "vitoria",
        choices: [
            { text: "Jogar novamente", nextStep: 1, log: "Iniciando nova jornada..." }
        ]
    }
};

// ==================== LÓGICA DE TRANSIÇÃO DE TELAS ====================
// EventListener no botão da Capa para Iniciar a História
elements.btnStart.addEventListener('click', () => {
    // Esconde a tela de capa e exibe a tela de jogo
    elements.coverScreen.classList.remove('active');
    elements.coverScreen.classList.add('hidden');
    
    elements.gameScreen.classList.remove('hidden');
    elements.gameScreen.classList.add('active');

    // Inicializa a aventura no passo 1
    initGame();
});

// EventListener para reiniciar o jogo
elements.btnRestart.addEventListener('click', () => {
    initGame();
});

// ==================== FUNÇÕES DE ATUALIZAÇÃO DO ESTADO ====================
function applyDamage(amount) {
    gameState.health = Math.max(0, gameState.health - amount);
    updateHealthUI();
    if (gameState.health === 0) {
        renderStep(7); // Tela de derrota
    }
}

function healPlayer(amount) {
    gameState.health = Math.min(100, gameState.health + amount);
    updateHealthUI();
}

function updateHealthUI() {
    elements.healthBar.style.width = `${gameState.health}%`;
    elements.healthVal.innerText = `${gameState.health} HP`;
}

function updateGold(amount) {
    gameState.gold = Math.max(0, gameState.gold + amount);
    elements.goldVal.innerText = `${gameState.gold} Moedas`;
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

function addLog(message) {
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry');
    logEntry.innerText = `> ${message}`;
    elements.logBox.appendChild(logEntry);
    elements.logBox.scrollTop = elements.logBox.scrollHeight;
}

// ==================== RENDERIZAÇÃO DO DOM (FOREACH) ====================

// Renderiza o inventário utilizando o método forEach
function renderInventory() {
    elements.inventoryList.innerHTML = '';
    
    gameState.inventory.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('item-chip');
        li.innerText = item;
        elements.inventoryList.appendChild(li);
    });
}

// Renderiza o passo atual da história e gera os botões dinamicamente
function renderStep(stepId) {
    const node = storyTree[stepId];
    gameState.currentStep = stepId;

    // Uso de atributos data-* para manipular estados do DOM
    elements.storyCard.dataset.step = stepId;
    elements.locationTag.dataset.location = node.location.toLowerCase().replace(/\s+/g, '-');
    elements.statusBadge.dataset.state = node.status;
    
    // Atualização de textos
    elements.locationTag.innerText = node.location;
    elements.statusBadge.innerText = node.status.toUpperCase();
    elements.storyText.innerText = node.text;

    // Limpa opções anteriores
    elements.choicesContainer.innerHTML = '';

    // Uso do forEach para iterar pelas escolhas e criar os botões com addEventListener
    node.choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('btn-choice');
        button.innerText = choice.text;

        // Validação de requisitos (Itens ou Ouro)
        let requirementMet = true;
        if (choice.requiredItem && !gameState.inventory.includes(choice.requiredItem)) {
            requirementMet = false;
            button.innerText += ` [Requer: ${choice.requiredItem}]`;
        }
        if (choice.requiredGold && gameState.gold < choice.requiredGold) {
            requirementMet = false;
            button.innerText += ` [Requer: ${choice.requiredGold} Ouro]`;
        }

        button.disabled = !requirementMet;

        // Escutador de evento de clique para avançar na história
        button.addEventListener('click', () => {
            if (choice.effect) choice.effect();
            if (choice.log) addLog(choice.log);
            renderStep(choice.nextStep);
        });

        elements.choicesContainer.appendChild(button);
    });
}

// Reinicia todos os dados
function initGame() {
    gameState.health = 100;
    gameState.gold = 25;
    gameState.inventory = ["Tocha", "Poção de Cura"];
    elements.logBox.innerHTML = '';
    
    updateHealthUI();
    updateGold(0);
    renderInventory();
    addLog("Você iniciou a sua jornada.");
    renderStep(1);
}

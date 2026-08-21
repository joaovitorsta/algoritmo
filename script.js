// Estado global do jogador
const playerState = {
    health: 100,
    gold: 25,
    inventory: ["Tocha", "Poção de Cura"],
    currentStep: 1,
    status: "normal"
};

// Mapeamento dos elementos do DOM
const dom = {
    storyText: document.getElementById('story-text'),
    locationTag: document.getElementById('location-tag'),
    choicesContainer: document.getElementById('choices-container'),
    storyCard: document.getElementById('story-card'),
    healthBar: document.getElementById('health-bar'),
    healthVal: document.getElementById('health-val'),
    goldVal: document.getElementById('gold-val'),
    statusBadge: document.getElementById('status-badge'),
    inventoryList: document.getElementById('inventory-list'),
    logBox: document.getElementById('log-box'),
    restartBtn: document.getElementById('restart-btn')
};

// Base de dados expandida da aventura
const storyNodes = {
    1: {
        location: "Entrada da Caverna",
        text: "Diante de você está a colossal Boca do Abismo. O vento uiva alto e a escuridão é densa. Você segura sua tocha acesa enquanto observa duas passagens.",
        status: "normal",
        choices: [
            { text: "Entrar pelo túnel rochoso à esquerda", nextStep: 2, actionLog: "Você entrou no túnel escuro." },
            { text: "Seguir o caminho descendente à direita", nextStep: 3, actionLog: "Você desceu a encosta inclinada." }
        ]
    },
    2: {
        location: "Túnel dos Cristais",
        text: "Cristais púrpuras cobrem as paredes. À frente, um goblin guardião dorme encostado em um baú ornamentado.",
        status: "perigo",
        choices: [
            { 
                text: "Tentar roubar o baú furtivamente", 
                nextStep: 4, 
                actionLog: "Você tentou passar sem fazer barulho.",
                effect: () => updateHealth(-20)
            },
            { 
                text: "Usar Poção de Cura para recuperar energia e contornar", 
                nextStep: 5, 
                requiredItem: "Poção de Cura",
                actionLog: "Você usou uma poção de cura e contornou o inimigo com calma.",
                effect: () => {
                    updateHealth(30);
                    removeItem("Poção de Cura");
                }
            }
        ]
    },
    3: {
        location: "Rio Subterrâneo",
        text: "Um rio de águas rápidas bloqueia a passagem. Há um barqueiro misterioso com uma canoa de madeira escura.",
        status: "normal",
        choices: [
            { 
                text: "Pagar 15 moedas de ouro para atravessar", 
                nextStep: 6, 
                requiredGold: 15,
                actionLog: "Você pagou o barqueiro para fazer a travessia.",
                effect: () => updateGold(-15)
            },
            { 
                text: "Tentar atravessar o rio a nadar", 
                nextStep: 7, 
                actionLog: "Você se jogou na correnteza violenta.",
                effect: () => updateHealth(-40)
            }
        ]
    },
    4: {
        location: "Emboscada!",
        text: "O goblin acorda, ataca com uma adaga e escapa rindo! Você sofreu dano, mas encontrou uma Chave Dourada no chão.",
        status: "perigo",
        choices: [
            { 
                text: "Pegar a chave e avançar para o Salão Principal", 
                nextStep: 8, 
                actionLog: "Você coletou a chave e avançou.",
                effect: () => addItem("Chave Dourada")
            }
        ]
    },
    5: {
        location: "Caminho Oculto",
        text: "Você contornou o guardião em segurança e encontrou um baú abandonado contendo 50 moedas de ouro!",
        status: "normal",
        choices: [
            { 
                text: "Coletar o tesouro e prosseguir", 
                nextStep: 8, 
                actionLog: "Você coletou 50 moedas de ouro.",
                effect: () => updateGold(50)
            }
        ]
    },
    6: {
        location: "An Câmara do Portal",
        text: "O barqueiro o deixa com segurança diante de uma grande porta selada com uma fechadura de ouro maciço.",
        status: "normal",
        choices: [
            { 
                text: "Usar a Chave Dourada na fechadura", 
                nextStep: 9, 
                requiredItem: "Chave Dourada",
                actionLog: "Você destrancou o portal com a Chave Dourada." 
            },
            { 
                text: "Procurar outro caminho pelas pedras", 
                nextStep: 7, 
                actionLog: "Você tentou escalada arriscada." 
            }
        ]
    },
    7: {
        location: "Abismo Profundo",
        text: "As feridas sofridas no caminho foram severas demais. As forças faltaram e a escuridão tomou conta...",
        status: "perigo",
        choices: [
            { text: "Tentar novamente", nextStep: 1, actionLog: "Reiniciando a jornada..." }
        ]
    },
    8: {
        location: "Salão Principal",
        text: "Você encontra a lendária Porta do Destino. Um brilho dourado indica que a saída final está logo adiante.",
        status: "normal",
        choices: [
            { 
                text: "Abrir a porta e escapar com as riquezas", 
                nextStep: 9, 
                actionLog: "Você alcançou a saída!" 
            }
        ]
    },
    9: {
        location: "Superfície - Vitória",
        text: "Você emergiu do abismo sob o céu estrelado! A aventura foi concluída com sucesso!",
        status: "vitoria",
        choices: [
            { text: "Jogar novamente", nextStep: 1, actionLog: "Iniciando nova partida..." }
        ]
    }
};

// Funções de atualização de estado do jogador
function updateHealth(amount) {
    playerState.health = Math.max(0, Math.min(100, playerState.health + amount));
    dom.healthBar.style.width = `${playerState.health}%`;
    dom.healthVal.innerText = `${playerState.health} HP`;
    if (playerState.health <= 0) {
        renderStep(7);
    }
}

function updateGold(amount) {
    playerState.gold = Math.max(0, playerState.gold + amount);
    dom.goldVal.innerText = `${playerState.gold} Moedas`;
}

function addItem(item) {
    if (!playerState.inventory.includes(item)) {
        playerState.inventory.push(item);
        renderInventory();
    }
}

function removeItem(item) {
    playerState.inventory = playerState.inventory.filter(i => i !== item);
    renderInventory();
}

function addLog(text) {
    const entry = document.createElement('div');
    entry.classList.add('log-entry');
    entry.innerText = `> ${text}`;
    dom.logBox.appendChild(entry);
    dom.logBox.scrollTop = dom.logBox.scrollHeight;
}

// Renderização dinâmica do inventário usando forEach
function renderInventory() {
    dom.inventoryList.innerHTML = '';
    playerState.inventory.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('item-tag');
        li.dataset.item = item;
        li.innerText = item;
        dom.inventoryList.appendChild(li);
    });
}

// Renderização da cena principal
function renderStep(stepId) {
    if (stepId === 1) resetGameData();

    const node = storyNodes[stepId];
    playerState.currentStep = stepId;

    // Atualização de atributos 'data'
    dom.storyCard.dataset.location = node.location.toLowerCase().replace(/\s+/g, '-');
    dom.statusBadge.dataset.state = node.status;
    dom.statusBadge.innerText = node.status.toUpperCase();

    // Manipulação do DOM
    dom.locationTag.innerText = node.location;
    dom.storyText.innerText = node.text;
    dom.choicesContainer.innerHTML = '';

    // Uso de forEach para gerar opções interativas
    node.choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('btn-choice');
        button.innerText = choice.text;

        // Validação de requisitos (Itens e Ouro)
        let canChoose = true;
        if (choice.requiredItem && !playerState.inventory.includes(choice.requiredItem)) {
            canChoose = false;
            button.innerText += ` [Requer: ${choice.requiredItem}]`;
        }
        if (choice.requiredGold && playerState.gold < choice.requiredGold) {
            canChoose = false;
            button.innerText += ` [Requer: ${choice.requiredGold} Ouro]`;
        }

        button.disabled = !canChoose;

        // Manipulação do addEventListener com execução de efeitos e transição
        button.addEventListener('click', () => {
            if (choice.effect) choice.effect();
            if (choice.actionLog) addLog(choice.actionLog);
            renderStep(choice.nextStep);
        });

        dom.choicesContainer.appendChild(button);
    });
}

function resetGameData() {
    playerState.health = 100;
    playerState.gold = 25;
    playerState.inventory = ["Tocha", "Poção de Cura"];
    dom.logBox.innerHTML = '';
    updateHealth(0);
    updateGold(0);
    renderInventory();
}

// Event Listeners globais
dom.restartBtn.addEventListener('click', () => {
    addLog("O jogo foi reiniciado.");
    renderStep(1);
});

document.addEventListener('DOMContentLoaded', () => {
    renderStep(1);
});

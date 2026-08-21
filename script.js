// Seleção de elementos do DOM usando IDs e Classes
const storyTextElement = document.getElementById('story-text');
const choicesContainer = document.getElementById('choices-container');
const storyCard = document.getElementById('story-card');
const statusBar = document.getElementById('status');

// Objeto contendo os dados da aventura interativa
const storyData = {
    1: {
        text: "Você acorda na entrada de uma caverna escura. À sua esquerda há um caminho iluminado por cristais e à direita ouve-se o barulho de água corrente.",
        choices: [
            { text: "Explorar o caminho dos cristais", nextStep: 2 },
            { text: "Seguir o som de água corrente", nextStep: 3 }
        ]
    },
    2: {
        text: "Os cristais azuis emitem um brilho intenso e você encontra um pedestal com um tomo antigo trancado.",
        choices: [
            { text: "Tentar forçar a trava do livro", nextStep: 4 },
            { text: "Ignorar o livro e procurar uma saída", nextStep: 5 }
        ]
    },
    3: {
        text: "Você chega a um lago subterrâneo cristalino. Uma pequena criatura luminosa emerge da água encarando você.",
        choices: [
            { text: "Oferecer uma fruta que está na sua mochila", nextStep: 6 },
            { text: "Ficar assustado e sair correndo", nextStep: 1 }
        ]
    },
    4: {
        text: "A trava era uma armadilha mágica! Uma luz envolve o ambiente e você acorda de volta na entrada da caverna.",
        choices: [
            { text: "Recomeçar aventura", nextStep: 1 }
        ]
    },
    5: {
        text: "Passando por trás do pedestal, você encontra um túnel aberto que leva direto à superfície. Você escapou!",
        choices: [
            { text: "Jogar novamente", nextStep: 1 }
        ]
    },
    6: {
        text: "A criatura aceita a fruta, ganha sua confiança e mostra uma passagem secreta guiando você em segurança até a saída!",
        choices: [
            { text: "Jogar novamente", nextStep: 1 }
        ]
    }
};

// Função para atualizar o DOM e renderizar o estado atual do jogo
function renderStep(stepId) {
    const currentStep = storyData[stepId];

    // Atualização de atributos 'data' no DOM
    storyCard.dataset.step = stepId;
    
    // Atualiza status conforme a etapa
    if (stepId === 5 || stepId === 6) {
        statusBar.innerText = "Vitória!";
        statusBar.style.color = "#04d361";
    } else if (stepId === 4) {
        statusBar.innerText = "Derrota!";
        statusBar.style.color = "#fba94c";
    } else {
        statusBar.innerText = "Exploração";
        statusBar.style.color = "#04d361";
    }

    // Manipulação direta do texto do elemento
    storyTextElement.innerText = currentStep.text;

    // Limpa os botões anteriores do container
    choicesContainer.innerHTML = '';

    // Uso do método forEach para iterar sobre as escolhas e criar botões dinamicamente
    currentStep.choices.forEach((choice) => {
        const button = document.createElement('button');
        button.innerText = choice.text;
        button.classList.add('btn-choice');
        
        // Define um atributo data no botão recém-criado
        button.dataset.nextStep = choice.nextStep;

        // Uso do addEventListener para escutar cliques nos botões
        button.addEventListener('click', (event) => {
            const nextStep = event.target.dataset.nextStep;
            renderStep(nextStep);
        });

        // Adiciona o botão ao container no DOM
        choicesContainer.appendChild(button);
    });
}

// Inicializa a aventura assim que o carregamento do documento é concluído
document.addEventListener('DOMContentLoaded', () => {
    renderStep(1);
});

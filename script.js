// Pegando os elementos do DOM
const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

// Função para converter markdown em HTML usando showdown.js
const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}

// Função assíncrona para enviar a pergunta à IA
const perguntarAI = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash" // Modelo da Gemini
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const pergunta = `você é um especialista assistente em ${game}, e responda as perguntas do usuario com base no seu conhecimento do jogo, estrategias, build e dicas. com a regra de que, se você não sabe a resposta, responda com um "não sei" e não invente respostas. outra regra é se a pergunta não estiver relacionada ao jogo, responda com "Essa pergunta não está relacionada ao game", mais uma, só considere a data atual ${new Date().toLocaleDateString()}, e sempre faça a pesquisa no patch atual, para dar uma resposta coerente. e nunca responda itens que você não tenha certeza que não existe no patch atual. responda sempre de forma resumida e completa, e me responda de forma coerente, e não tente explicar nada, apenas de a resposta sem nenhuma explicação, NUNCA ESQUEÇA DESSA REGRA: apenas em tópicos, formate sempre a esquerda: ${question}`
  const contents = [{
    parts: [{ text: pergunta }]
  }]

  const tools = [{
    google_search: {}
  }
  ]
  const response = await fetch(geminiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ contents, tools })
  })

  // Verifica se houve erro na requisição
  if (!response.ok) {
    throw new Error(`Erro da API: ${response.status} - ${response.statusText}`)
  }

  const data = await response.json()

  // Retorna a resposta da IA (ou mensagem padrão)
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Nenhuma resposta recebida.'
}

// Função para lidar com o envio do formulário
const sendForm = async (event) => {
  event.preventDefault()

  const apiKey = apiKeyInput.value.trim()
  const game = gameSelect.value.trim()
  const question = questionInput.value.trim()

  console.log({ apiKey, game, question })

  if (!apiKey || !game || !question) {
    alert('Por favor, preencha todos os campos')
    return
  }

  askButton.disabled = true
  askButton.textContent = 'Perguntando...'
  askButton.classList.add('loading')

  try {
    // AIzaSyBXCdT00WCNhK8R4bVFUys179_T6yUatk8
    // Faz a pergunta para a IA
    const text = await perguntarAI(question, game, apiKey)

    // Verifica se existe um elemento com classe .response-content dentro de aiResponse
    let responseContainer = aiResponse.querySelector('.response-content')
    if (!responseContainer) {
      // Se não existir, cria um e adiciona dentro de aiResponse
      responseContainer = document.createElement('div')
      responseContainer.classList.add('response-content')
      aiResponse.appendChild(responseContainer)
    }

    // Insere a resposta convertida em HTML
    responseContainer.innerHTML = markdownToHTML(text)

  } catch (error) {
    console.log('Erro: ', error)
    aiResponse.innerHTML = `<p class="error">Erro ao obter resposta: ${error.message}</p>`
  } finally {
    // Restaura o botão
    askButton.disabled = false
    askButton.textContent = 'Perguntar'
    askButton.classList.remove('loading')
  }
}

// Adiciona o evento de envio do formulário
form.addEventListener('submit', sendForm)

// Também permite enviar clicando diretamente no botão
askButton.addEventListener('click', sendForm)

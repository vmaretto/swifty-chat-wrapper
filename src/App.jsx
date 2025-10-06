import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'swifty', 
      text: 'Ciao! Sono Swifty, il tuo assistente per Switch Food Explorer. Come posso aiutarti oggi?' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('ricetta') || lowerMessage.includes('recipe')) {
      return 'Puoi creare ricette personalizzate usando il form sulla pagina! Basta compilare gli ingredienti e le istruzioni. Vuoi che ti guidi passo dopo passo?';
    } else if (lowerMessage.includes('ingredienti') || lowerMessage.includes('ingredients')) {
      return 'Gli ingredienti possono essere aggiunti uno alla volta. Ricorda di specificare le quantità per ottenere calcoli nutrizionali accurati!';
    } else if (lowerMessage.includes('aiuto') || lowerMessage.includes('help')) {
      return 'Sono qui per aiutarti con Switch Food Explorer! Posso rispondere a domande su ricette, ingredienti, valori nutrizionali e molto altro. Cosa ti serve?';
    } else if (lowerMessage.includes('ciao') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Ciao! Benvenuto su Switch Food Explorer. Posso aiutarti a creare ricette gustose e salutari!';
    } else if (lowerMessage.includes('grazie') || lowerMessage.includes('thanks')) {
      return 'Prego! Sono sempre qui se hai bisogno di altro aiuto.';
    } else {
      return 'Capisco la tua domanda. Prova a usare il form sulla pagina per esplorare le funzionalità di Switch Food Explorer. Se hai bisogno di assistenza specifica, chiedi pure!';
    }
  };

  const handleSend = () => {
    if (inputValue.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        sender: 'swifty',
        text: generateResponse(inputValue)
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-stone-50">
      {/* Iframe - Occupa l'intera area */}
      <iframe
        src="https://switch-food-explorer.posti.world/recipe-creation"
        className="absolute inset-0 h-full w-full border-0"
        title="Switch Food Explorer"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-pointer-lock allow-top-navigation"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      {/* Chatbot flottante */}
      <div className="pointer-events-none absolute bottom-6 right-6 flex flex-col items-end gap-4">
        {isChatOpen && (
          <div className="pointer-events-auto w-80 sm:w-96 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-400 to-green-500 px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-bold text-emerald-600 shadow-md">
                  S
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Swifty</h1>
                  <p className="text-xs text-emerald-50">Chat Assistant per Switch Food Explorer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="rounded-full p-2 text-white transition hover:bg-emerald-500/40"
              >
                ✕
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex h-96 flex-col bg-stone-50">
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.sender === 'user'
                          ? 'rounded-br-sm bg-emerald-500 text-white'
                          : 'rounded-bl-sm border border-stone-200 bg-white text-stone-800 shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }}></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '150ms' }}></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-stone-200 bg-white p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Scrivi un messaggio..."
                    className="flex-1 rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    onClick={handleSend}
                    disabled={inputValue.trim() === ''}
                    className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Invia
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsChatOpen((prev) => !prev)}
          className="pointer-events-auto flex items-center gap-3 rounded-full bg-emerald-500 px-5 py-3 text-sm font-medium text-white shadow-xl transition hover:bg-emerald-600"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-base font-bold text-emerald-600 shadow">
            S
          </span>
          <span>{isChatOpen ? 'Nascondi chat' : 'Apri chat'}</span>
        </button>
      </div>
    </div>
  );
}

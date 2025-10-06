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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-50">
      {/* Sidebar Chatbot - Sempre visibile */}
      <div className="w-96 bg-white shadow-2xl flex flex-col border-r border-stone-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-400 to-green-500 px-6 py-5 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-emerald-600 text-xl shadow-md">
            S
          </div>
          <div>
            <h1 className="font-bold text-white text-xl">Swifty</h1>
            <p className="text-emerald-50 text-sm">Chat Assistant per Switch Food Explorer</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-stone-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-white rounded-br-sm'
                    : 'bg-white text-stone-800 rounded-bl-sm shadow-sm border border-stone-200'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-stone-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-stone-200">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 bg-white border-t border-stone-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scrivi un messaggio..."
              className="flex-1 px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm bg-stone-50"
            />
            <button
              onClick={handleSend}
              disabled={inputValue.trim() === ''}
              className="px-5 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-sm"
            >
              Invia
            </button>
          </div>
        </div>
      </div>

      {/* Iframe - Occupa il resto dello spazio */}
      <div className="flex-1 relative">
        <iframe
          src="https://switch-food-explorer.posti.world/recipe-creation"
          className="absolute inset-0 w-full h-full border-0"
          title="Switch Food Explorer"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-pointer-lock allow-top-navigation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
}

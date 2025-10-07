import React, { useState, useRef, useEffect } from 'react';

async function callChatGPT(recipeJson, userMessage) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeJson, message: userMessage })
  });

  if (!res.ok) {
    console.error('Errore nella risposta dell’API:', res.statusText);
    return 'Non riesco a contattare ChatGPT in questo momento. Riprova più tardi.';
  }

  const data = await res.json();
  return data.reply || 'Nessuna risposta da Swifty.';
}

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [recipeData, setRecipeData] = useState(null);
  const [recipeSource, setRecipeSource] = useState(null);
  const [isIframeLive, setIsIframeLive] = useState(false);
  const [iframeError, setIframeError] = useState(null);
  const messagesEndRef = useRef(null);
  const recipeDataRef = useRef(null);
  const isAutoAnalysisActive = useRef(false);
  const lastIframeErrorType = useRef(null);

  const iframeStatus = iframeError
    ? { label: '⚠️ errore', className: 'text-amber-200' }
    : isIframeLive
    ? { label: '🟢 live', className: 'text-green-300' }
    : { label: '🔴 offline', className: 'text-red-300' };
  const iframeErrorMessage = describeIframeError(iframeError);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result ?? '');
        setRecipeData(jsonData);

        const recipeName = jsonData?.metadata?.name || 'Senza nome';
        const servings =
          jsonData?.metadata?.servings ??
          jsonData?.metadata?.portions ??
          jsonData?.servings ??
          jsonData?.portions ??
          1;

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: 'swifty',
            text: `✅ Ricetta caricata correttamente: ${recipeName} (${servings} porzioni)`
          }
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: 'swifty',
            text: '⚠️ Errore: il file non è un JSON valido.'
          }
        ]);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const handleSend = async () => {
    const trimmedMessage = inputValue.trim();

    if (trimmedMessage === '') {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmedMessage
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const reply = await callChatGPT(recipeData, trimmedMessage);

      const botResponse = {
        id: Date.now() + 1,
        sender: 'swifty',
        text: reply
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.warn('Errore inatteso durante la chiamata a ChatGPT:', error);

      const fallbackResponse = {
        id: Date.now() + 1,
        sender: 'swifty',
        text: 'Si è verificato un problema inatteso durante la chiamata a ChatGPT. Per favore riprova più tardi.'
      };

      setMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-stone-50">
      <iframe
        src="https://switch-food-explorer.posti.world/recipe-creation"
        className="absolute inset-0 h-full w-full border-0"
        title="Switch Food Explorer"
      />

      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-4">
        {isChatOpen && (
          <div className="w-80 sm:w-96 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-400 to-green-500 px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-bold text-emerald-600 shadow-md">
                  S
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-white">Swifty</h1>
                    <span className={`text-xs ${iframeStatus.className}`}>
                      {iframeStatus.label}
                    </span>
                  </div>
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

            <div className="flex h-96 flex-col bg-stone-50">
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const rowAlignment = isUser ? 'justify-end' : 'justify-start';
                  const bubbleVariant = isUser
                    ? 'rounded-br-sm bg-emerald-500 text-white'
                    : 'rounded-bl-sm border border-stone-200 bg-white text-stone-800 shadow-sm';

                  return (
                    <div key={msg.id} className={`flex ${rowAlignment}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${bubbleVariant}`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-stone-200 bg-white p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <label
                      htmlFor="fileUpload"
                      className="flex items-center justify-center rounded-xl border border-emerald-500 text-emerald-600 px-4 py-3 text-sm font-medium cursor-pointer hover:bg-emerald-50 transition"
                    >
                      📎 Allega ricetta
                    </label>
                    <input
                      id="fileUpload"
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="text-xs text-stone-500">
                      {recipeData ? 'Ricetta caricata' : 'Nessuna ricetta'}
                    </span>

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

                  {recipeData && (
                    <div className="text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded-lg mt-1 p-2 max-h-24 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-[11px]">
                        {JSON.stringify(recipeData.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {recipeData ? (
                    <p className="text-xs text-emerald-600">🟢 Ricetta caricata</p>
                  ) : (
                    <p className="text-xs text-stone-400">Nessuna ricetta allegata</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsChatOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-full bg-emerald-500 px-5 py-3 text-sm font-medium text-white shadow-xl transition hover:bg-emerald-600"
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

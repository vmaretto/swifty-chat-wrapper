import React, { useState, useRef, useEffect, useCallback } from 'react';

const selectTextContent = (root, selectors = []) => {
  for (const selector of selectors) {
    const element = root.querySelector(selector);
    if (element) {
      const value = element.value ?? element.textContent;
      if (value) {
        return value.trim();
      }
    }
  }
  return '';
};

const extractIngredients = (doc) => {
  const ingredientSelectors = [
    '.ingredient-row',
    '[data-testid="ingredient-row"]',
    '.IngredientRow',
    '[data-component="IngredientRow"]'
  ];

  for (const selector of ingredientSelectors) {
    const rows = Array.from(doc.querySelectorAll(selector));
    if (rows.length) {
      return rows
        .map((row) => {
          const name = selectTextContent(row, [
            '.ingredient-name',
            '[data-testid="ingredient-name"]',
            '.IngredientName',
            '[data-component="IngredientName"]',
            'input[name*="ingredient-name"]',
            '.name'
          ]);

          const quantity = selectTextContent(row, [
            '.ingredient-quantity',
            '[data-testid="ingredient-quantity"]',
            '.IngredientQuantity',
            '[data-component="IngredientQuantity"]',
            'input[name*="ingredient-quantity"]',
            '.quantity'
          ]);

          if (!name && !quantity) {
            return null;
          }

          return {
            name: name || '',
            quantity: quantity || ''
          };
        })
        .filter(Boolean);
    }
  }

  return [];
};

export const extractRecipeDataFromIframe = async () => {
  const iframe = document.querySelector('iframe');

  if (!iframe || !iframe.contentWindow) {
    return null;
  }

  try {
    const doc = iframe.contentWindow.document;

    if (!doc) {
      return null;
    }

    const recipeName = selectTextContent(doc, [
      'input[name="recipe-name"]',
      '[data-testid="recipe-name"]',
      '.recipe-name input',
      '.RecipeName input',
      '.recipe-name',
      '.RecipeName',
      'h1'
    ]);

    const carbon = selectTextContent(doc, [
      '.carbon-footprint',
      '[data-testid="carbon-footprint"]',
      '.CarbonFootprint',
      '[data-component="CarbonFootprint"]',
      'span[data-label="carbon"]'
    ]);

    const water = selectTextContent(doc, [
      '.water-footprint',
      '[data-testid="water-footprint"]',
      '.WaterFootprint',
      '[data-component="WaterFootprint"]',
      'span[data-label="water"]'
    ]);

    const calories = selectTextContent(doc, [
      '.calories',
      '[data-testid="calories"]',
      '.Calories',
      '[data-component="Calories"]',
      'span[data-label="calories"]'
    ]);

    const instructions = selectTextContent(doc, [
      '.instructions',
      '[data-testid="instructions"]',
      '.Instructions',
      '[data-component="Instructions"]',
      'textarea[name="instructions"]'
    ]);

    const ingredients = extractIngredients(doc);

    return {
      metadata: {
        name: recipeName || 'Ricetta senza nome',
        creation_date: new Date().toISOString(),
        version: '1.0'
      },
      metrics: {
        carbon_footprint: carbon || '',
        water_footprint: water || '',
        calories: calories || ''
      },
      ingredients,
      instructions: instructions || '',
      notes: 'Estratti automaticamente da Switch Food Explorer'
    };
  } catch (error) {
    console.warn('Errore lettura iframe:', error);
    return null;
  }
};

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
  const [isIframeLive, setIsIframeLive] = useState(false);
  const messagesEndRef = useRef(null);
  const recipeDataRef = useRef(null);
  const isAutoAnalysisActive = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    const pollIframe = async () => {
      const newData = await extractRecipeDataFromIframe();

      if (!isMounted) {
        return;
      }

      if (newData) {
        setIsIframeLive(true);

        const previousData = recipeDataRef.current;
        const normalizedData = {
          ...newData,
          metadata: {
            ...newData.metadata,
            creation_date: previousData?.metadata?.creation_date || newData.metadata.creation_date
          }
        };

        const hasChanged = JSON.stringify(previousData) !== JSON.stringify(normalizedData);

        if (hasChanged) {
          recipeDataRef.current = normalizedData;
          setRecipeData(normalizedData);
          console.log('SFE data aggiornata:', normalizedData);
        }
      } else {
        setIsIframeLive(false);
      }
    };

    const interval = setInterval(pollIframe, 5000);

    pollIframe();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const callChatGPT = useCallback(async (recipeJson, userMessage) => {
    try {
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
    } catch (error) {
      console.error('Errore nella chiamata a /api/chat:', error);
      return 'Si è verificato un errore di rete. Controlla la connessione e riprova.';
    }
  }, []);

  useEffect(() => {
    if (!recipeData || isAutoAnalysisActive.current) {
      return;
    }

    let isCancelled = false;

    const triggerAutoAnalysis = async () => {
      isAutoAnalysisActive.current = true;

      try {
        const reply = await callChatGPT(
          recipeData,
          'Analizza la ricetta attuale e suggerisci miglioramenti in termini di sostenibilità e valori nutrizionali.'
        );

        if (!isCancelled) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              sender: 'swifty',
              text: reply
            }
          ]);
        }
      } finally {
        isAutoAnalysisActive.current = false;
      }
    };

    triggerAutoAnalysis();

    return () => {
      isCancelled = true;
      isAutoAnalysisActive.current = false;
    };
  }, [callChatGPT, recipeData]);

  const handleSend = async () => {
    const trimmedMessage = inputValue.trim();

    if (trimmedMessage === '') return;

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
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-white">Swifty</h1>
                    <span className={`text-xs ${isIframeLive ? 'text-green-300' : 'text-red-300'}`}>
                      {isIframeLive ? '🟢 live' : '🔴 offline'}
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
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '300ms' }} />
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

# Swifty Chat Wrapper

Questa guida ti spiega come provare il progetto in locale senza pubblicare nulla su GitHub.

## 1. Controlla di avere gli strumenti necessari
1. Installa [Node.js](https://nodejs.org/) versione **18 o superiore**. L'installer include già **npm**.
2. Apri un terminale (su Windows "Prompt dei comandi" oppure "PowerShell").
3. Verifica che tutto sia installato correttamente:
   ```bash
   node -v
   npm -v
   ```
   Se vedi i numeri di versione, puoi continuare.

## 2. Scarica il progetto in locale
Hai due possibilità:
- **Clona il repository** (se usi Git):
  ```bash
  git clone https://github.com/<tuo-account>/swifty-chat-wrapper.git
  cd swifty-chat-wrapper
  ```
- **Scarica lo ZIP da GitHub**: clicca su "Code" → "Download ZIP", estrai la cartella sul tuo computer e apri il terminale dentro quella cartella.

## 3. Installa le dipendenze
All'interno della cartella del progetto esegui una sola volta:
```bash
npm install
```
Questo comando scarica tutte le librerie necessarie nel tuo computer (rimangono solo in locale).

## 4. Avvia l'ambiente di sviluppo
Per vedere il sito in esecuzione con aggiornamento automatico:
```bash
npm run dev
```
Il terminale ti mostrerà un indirizzo simile a `http://localhost:5173`. Aprilo nel browser: vedrai l'app con il chatbot in basso a destra. Ogni volta che modifichi i file dentro `src/`, la pagina si aggiorna da sola.

> **Suggerimento:** puoi chiudere il server premendo `Ctrl + C` nel terminale.

## 5. Creare la build di produzione (opzionale)
Se vuoi simulare il comportamento della versione pubblicata:
```bash
npm run build
npm run preview
```
`npm run preview` avvia un server locale di sola lettura. Bloccalo con `Ctrl + C` quando hai finito.

## 6. Lavora senza toccare GitHub
Finché non esegui `git push`, le modifiche restano solo sul tuo computer. Per gestirle:
- Controlla lo stato dei file modificati con:
  ```bash
  git status
  ```
- Per annullare una modifica su un file:
  ```bash
  git restore nome-file
  ```
- Per salvare temporaneamente modifiche senza committarle:
  ```bash
  git stash
  ```

Quando sei soddisfatto, puoi facoltativamente creare un branch e fare commit in locale:
```bash
git checkout -b nome-del-tuo-branch
# modifica i file
git add .
git commit -m "Messaggio del commit"
```
Ricorda: **niente verrà caricato su GitHub** finché non lanci `git push`.

## 7. Creare un branch e aprire una Pull Request
Se preferisci provare le modifiche su un branch separato in modo da poter tornare facilmente indietro:

1. Assicurati di trovarti sul branch principale aggiornato:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Crea un nuovo branch descrittivo:
   ```bash
   git checkout -b feature/chat-widget
   ```
3. Applica le tue modifiche, quindi salva il lavoro con commit chiari:
   ```bash
   git add .
   git commit -m "Descrivi la modifica"
   ```
4. Carica il branch sul tuo repository remoto (solo questo branch, non `main`):
   ```bash
   git push -u origin feature/chat-widget
   ```
5. Vai su GitHub e scegli **Compare & pull request** per aprire la PR dal branch `feature/chat-widget` verso `main`.
6. Dopo il merge (o se vuoi sospendere il lavoro) puoi tornare al branch principale e rimuovere il branch locale:
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/chat-widget   # elimina il branch locale
   git push origin --delete feature/chat-widget  # elimina il branch remoto (opzionale)
   ```

Finché resti sul branch secondario, il branch `main` rimane pulito: puoi cambiare branch in qualunque momento per tornare alla versione originale.

## 8. Domande frequenti
- **Il progetto smette di funzionare?** Riapri il terminale, vai nella cartella del progetto e rilancia `npm run dev`.
- **Vuoi tornare alla versione originale?**
  ```bash
  git reset --hard
  git clean -fd
  ```
  (Attenzione: cancella tutte le modifiche locali.)
- **Serve reinstallare le dipendenze?** Puoi ripetere `npm install` in qualsiasi momento; se qualcosa va storto elimina la cartella `node_modules` e lancia di nuovo `npm install`.

## 9. Accesso a Switch Food Explorer
Il flusso di autenticazione di Switch Food Explorer reindirizza a domini che impostano intestazioni di sicurezza molto restrittive. Per evitare schermate vuote o errori di caricamento, l'applicazione integra un proxy lato Vercel che rimuove le intestazioni bloccanti e mantiene attiva la sessione durante i redirect.

Quando l'app rileva comunque un problema di caricamento (ad esempio se l'autenticazione richiede un passaggio manuale), mostra un banner con due opzioni:

- **Apri in nuova scheda**: apre Switch Food Explorer in una scheda separata del browser.
- **Riprova**: ricarica l'iframe interno dopo aver completato l'accesso.

Seguendo questi passaggi puoi provare ogni modifica in locale, in modo sicuro e senza toccare il repository remoto.

### 🔄 Proxy di autenticazione per Switch Food Explorer

L’app utilizza una route proxy (`/api/switch`) per incorporare Switch Food Explorer all’interno dell’iframe. Il proxy:

- rimuove gli header X-Frame-Options e CSP che impediscono l’embedding,
- riscrive i cookie con `SameSite=None; Secure`,
- segue i redirect di autenticazione,
- e gestisce lo streaming completo di tutte le risorse (HTML, JS, CSS, immagini).

Non sono necessarie modifiche lato Switch Food Explorer.

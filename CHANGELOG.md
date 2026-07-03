# Changelog

Kronika vývoja **Pantheon: Dice of Destiny**. Formát vychádza z
[Keep a Changelog](https://keepachangelog.com/) a projekt sa drží
[sémantického verzovania](https://semver.org/).

Odkazy pod jednotlivými fázami vedú na commit, ktorý danú prácu priniesol.

## [0.9.0] — Dokumentácia a CI/CD

### Pridané
- **CHANGELOG.md** — táto kronika, prelinkovaná z README.
- **README.md** — kompletný redesign: odznaky so živým stavom CI, galéria
  screenshotov, tabuľka technológií, obsah, rýchly štart.
- **CI: testy a build** (`.github/workflows/ci.yml`) — pri každom pushi a
  pull requeste spustí unit testy a typovú kontrolu (app + worker).
- **CI: automatický Android build** (`.github/workflows/android.yml`) — pri
  každom pushi do `main` sa automaticky zostaví APK s verziou odvodenou z
  `package.json` (`versionName`) a čísla behu (`versionCode`), priloží sa
  ako stiahnuteľný artefakt behu; k tagom `v*` navyše vytvorí GitHub Release
  s priloženým APK.

---

## [0.8.0] — Originálne arty a formfactor kariet

### Pridané
- Nahradenie vygenerovaných „astrálnych erbov" originálnymi AI portrétmi
  postáv pre všetkých 16 kariet.
- Nový formfactor karty v ruke: art vypĺňa hornú polovicu karty od okraja po
  okraj, kryštál many prekrýva art, pod ním banner s menom, text schopností a
  lišta štatistík — rovnaký jazyk ako karty na ploche a v Sieni Božstiev.

([b016b15](https://github.com/bucala/Navia/commit/b016b15), [17c0023](https://github.com/bucala/Navia/commit/17c0023))

## [0.7.0] — Tematické menu, Duch Arény a lokalizácia SK/EN

### Pridané
- **Autentické tematické hlavné menu**: ozdobný panel so zlatým dvojitým
  rámom, hviezdna obloha s hmlovinami a vinetou namiesto pôvodného
  jednoduchého pozadia. Položky: Hra jedného hráča · Hra viacerých hráčov
  (online / Pass & Play) · Balíčky · Sieň Božstiev · Rebríček · Nastavenia.
- **Hra jedného hráča** proti **Duchovi Arény** — jednoduchá, no funkčná AI
  (`src/game/ai.ts`): vykladá jednotky, útočí podľa pravidla predného voja,
  platí za kockové schopnosti; hrá po jednom kroku, aby boli jej ťahy
  sledovateľné. Krytá testom AI vs AI dohraným do víťaza.
- **Traja noví hrdinovia** v Sieni Božstiev (spolu 8): **Khadga, Štít
  Chrámu** (sanskrit *khaḍga*, strážcovia Angkoru), **Cuauhtli, Orlí
  Rytier** (aztécki *cuāuhpipiltin*) a plná identita pôvodnej karty Gorila —
  **Mahákapi, Obrnený Titan** (budhistická džátaka o Veľkej opici).
- **Kompletná dvojjazyčnosť SK/EN** (`src/i18n/`): slovenčina predvolená,
  angličtina typovo vynútená ako paralelný preklad každého reťazca — UI,
  názvy a texty kariet, príbehy kódexu a **samotný priebeh hry**. Engine
  loguje štruktúrované kľúče správ a chybové kódy namiesto pevných textov,
  takže si ich každý klient (aj server) vykreslí vo vlastnom jazyku.
  Prepínanie jazyka, zvuku a mena hráča v Nastaveniach.
- Označovanie textov a objektov je v celej hre vypnuté (vstupné polia
  ostávajú editovateľné).

([6358fae](https://github.com/bucala/Navia/commit/6358fae))

## [0.6.0] — Fáza 5: D1 účty, ELO rating a Deckbuilder

### Pridané
- **Anonymné účty** — `POST /api/profile` vydá playerId + tajný kľúč
  uložený v prehliadači; prihlásenie umožňuje aj premenovanie.
- **ELO rating** (K=32), zapisovaný priamo `GameRoom` Durable Objectom po
  skončení hodnoteného zápasu medzi dvomi prihlásenými hráčmi — presne raz,
  spolu s históriou zápasov a riadkom v hernom logu.
- **🏆 Rebríček** — top 10 hráčov podľa ELO.
- **🃏 Deckbuilder** — balíčky 15–25 kariet, max 2 kópie od karty; pravidlá
  zdieľané medzi klientom a serverom (`src/game/deck.ts`), server balíček pri
  vstupe do zápasu opäť validuje a overuje vlastníctvo. Aktívny balíček
  nahradí štartovací v online zápase.
- D1 schéma (`migrations/`): `players`, `decks`, `matches`.

([aece273](https://github.com/bucala/Navia/commit/aece273))

## [0.5.0] — Fáza 4: Matchmaking a Android

### Pridané
- **„Rýchla hra"** — globálny `Matchmaker` Durable Object páruje hľadajúcich
  hráčov: prvý čaká vo fronte, druhý sa okamžite spáruje do spoločnej
  miestnosti. Opustené fronty rieši heartbeat + TTL.
- **PWA** — web manifest s ikonou, inštalovateľná z prehliadača.
- **Capacitor Android projekt** (`android/`) — export do APK; adresa
  nasadeného backendu sa do mobilného buildu zapeká cez `VITE_API_BASE`.

([d349089](https://github.com/bucala/Navia/commit/d349089))

## [0.4.0] — Fáza 3: Vizuálna vrstva

### Pridané
- **Art pipeline** pre všetky karty (`src/ui/CardArt.tsx`) — obrázky z
  `public/art/` s emoji fallbackom, kým súbor chýba.
- **Plnohodnotná 3D animácia kocky** (CSS transform, žiadne canvas/WebGL) s
  dopadom a odskokom; otrasenie obrazovky pri padnutej šestke.
- **Animácie súboja** cez Framer Motion — výpad útočníka, záblesk zásahu,
  lietajúce čísla poškodenia/liečenia, úmrtia jednotiek.
- **Kamenná/astrálna aréna** a **procedurálne zvuky** cez WebAudio (rachot
  kocky, úspech/neúspech, zásah) s prepínačom stlmenia — bez jediného
  zvukového súboru.

([e6404dd](https://github.com/bucala/Navia/commit/e6404dd))

## [0.3.0] — Fáza 2: Online multiplayer

### Pridané
- **Cloudflare Worker** router + **`GameRoom` Durable Object**: jedna
  inštancia na zápas, jediná autorita nad stavom hry aj hodmi kociek
  (klient si nikdy nehádže sám).
- Prísne typovaný **WebSocket protokol** (`src/net/protocol.ts`) a klientsky
  hook `useMultiplayerGame`.
- **Lobby** s kódom miestnosti / pozvánkovou linkou (`?room=KÓD`); reconnect
  cez hráčsky token vráti hráča na jeho miesto.

([c2150cc](https://github.com/bucala/Navia/commit/c2150cc))

## [0.2.0] — Päť postáv a Sieň Božstiev

### Pridané
- Prvých päť postáv integrovaných ako hrateľné karty s vlastnými menami,
  príbehmi a kultúrnymi odkazmi.
- **Sieň Božstiev** (`src/ui/Codex.tsx`) — listovateľný kódex postáv.

([b539a94](https://github.com/bucala/Navia/commit/b539a94))

## [0.1.0] — Fáza 1: Core Engine

### Pridané
- **Game Design Document** (`docs/GDD.md`).
- **TypeScript dátové modely kariet** (`src/game/types.ts`,
  `src/game/cards.ts`) — jednotky, kúzla, frakcie, kľúčové slová.
- **Kockový engine D6** (`src/game/dice.ts`) — základný hod, Výhoda (2× D6,
  lepší výsledok), Push-your-luck reťaz s Overloadom na 6.
- **Herný engine** (`src/game/engine.ts`) — čistý reducer nad stavom hry:
  mana ramp, línie Vanguard/Sanctum, ochranný múr predného voja, statusy
  Láva (∞) a Kyselina (∞), Vyhubenie tokenov, plošné útoky do kríža, presuny
  agilných jednotiek a víťazná podmienka (Nexus 30 HP).
- **Lokálna Pass & Play hra** pre dvoch hráčov na jednom zariadení.

([be9fb16](https://github.com/bucala/Navia/commit/be9fb16))


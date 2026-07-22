# Changelog

Kronika vývoja **Navia**. Formát vychádza z
[Keep a Changelog](https://keepachangelog.com/) a projekt sa drží
[sémantického verzovania](https://semver.org/).

Odkazy pod jednotlivými fázami vedú na commit, ktorý danú prácu priniesol —
pridávajú sa spätne v momente, keď je commit už na vetve (najnovšia položka
teda dočasne odkaz mať nemusí).

## [0.12.1] — Oprava poškodených assetov a čitateľnosti UI

### Opravené
- **62 binárnych súborov bolo poškodených** commitom `68d67e8` (16 artov
  kariet, 15 favicon/PWA ikon, 15 Android launcher/adaptívnych ikon, 11
  Capacitor splash obrazoviek a 5 screenshotov v README) — každý súbor, cez
  ktorý táto zmena prešla, mal svoje bajty (vrátane hlavičky JPG/PNG)
  nahradené UTF-8 náhradným znakom, čo poukazuje na to, že prešli cez
  textový/UTF-8 kanál namiesto binárneho čítania/zápisu. Výsledkom boli
  nefunkčné (nerenderovateľné) obrázky ~1,7–1,8× väčšie než originál. Art
  kariet, splash obrazovky a screenshoty obnovené z posledného čistého
  commitu (`1cc79b4`); favicon/PWA a Android ikony prerenderované nanovo
  cez `npm run icons` priamo z loga.
- **Nečitateľný text na obrazovkách Rebríček, Ako hrať, Nastavenia a
  Balíčky** — tieto štyri obrazovky vykresľovali svetlosivý text (navrhnutý
  pre pôvodnú tmavú astrálnu tému) priamo na svetlom kamenno-pergamenovom
  pozadí bez tmavého podkladu, takže boli miestami až úplne nečitateľné.
  Obsah je teraz zabalený do existujúceho `.menu-panel` (rovnaký zlatý
  rámovaný panel ako hlavné menu).
- Screenshoty v README galérii preosnímané proti aktuálnemu (opravenému)
  vzhľadu appky.
- Faktické nezrovnalosti v README (neúplná tabuľka frakcií/kariet, README
  odkaz na GDD tváriaci sa ako aktuálny stav) a v CHANGELOG (chýbajúce
  položky pre vizuálnu identitu aj kamenno-pergamenový redizajn nižšie).

([ad0e249](https://github.com/bucala/Navia/commit/ad0e249), [854b83d](https://github.com/bucala/Navia/commit/854b83d), [53b28a4](https://github.com/bucala/Navia/commit/53b28a4))

## [0.12.0] — Kamenno-pergamenový redizajn a responzivita

### Pridané
- **Svetlá kamenná/pergamenová téma** nahrádza pôvodnú tmavú astrálnu —
  vysokorozlíšené ilustrované pozadie arény (ľadová polovica súpera,
  džungľová polovica hráča), prekreslené App ikony a Android splash
  obrazovky v novej palete.
- **Responzívne rozloženie**: odstránené vodorovné aj zvislé pretekanie
  stránky, vycentrované línie na ploche, karty v ruke sa už neorezávajú,
  zbaliteľný panel s priebehom zápasu, priblíženie portrétu v Sieni
  Božstiev na mobile.
- **Android**: haptická odozva pri hraní kariet/kockách, oprava buildu pod
  Java 21.

### Poznámka
Táto práca pristála priamo na `main` mimo bežného PR flow tejto vetvy;
záznam je doplnený spätne, keďže v čase commitov CHANGELOG nebol
aktualizovaný.

([6809685](https://github.com/bucala/Navia/commit/6809685), [cd98edb](https://github.com/bucala/Navia/commit/cd98edb), [00f3f67](https://github.com/bucala/Navia/commit/00f3f67), [68d67e8](https://github.com/bucala/Navia/commit/68d67e8))

## [0.11.0] — Vizuálna identita: logo, ikony a rámy kariet

### Pridané
- **Logo a značka Navia** (`public/art/branding/`) — kamenná tabuľka s
  ohnivým nápisom „NAVIA" a piatimi zvieracími medailónmi (byvol, opica,
  slon, orol, medveď), zjednodušená štvorcová značka pre malé rozmery a
  samostatná priehľadná verzia pre Android adaptívne ikony. Priamy upload
  obrázka z chatu do repozitára nie je možný, takže ide o vektorovú
  rekonštrukciu podľa referenčného obrázka, nie pixel kópiu.
- **Generátor ikon** (`npm run icons` → `scripts/generate-icons.mjs`,
  balík `sharp`) — z loga vyrenderuje celú sadu favicon/PWA manifest ikon
  (16–512 px vrátane maskable) aj Android launcher/adaptívne ikony vo
  všetkých hustotách (`mipmap-*`), adaptívne pozadie zladené s farbou loga.
- **Editovateľné SVG rámy kariet** (`public/art/frames/`) — ornamentálne
  9-slice rámy podľa vzácnosti (`frame-common/rare/legendary.svg`) cez CSS
  `border-image`, aplikované na kartu v ruke, jednotku na ploche aj veľký
  art panel v Sieni Božstiev. Priehľadný stred necháva presvitať existujúci
  frakčný gradient/art — nič nie je zapečené v kóde, súbory sa dajú
  nahradiť/upraviť priamo.
- Dlaždicovateľná kamenná textúra hernej plochy, vyhĺbený rám slotov
  jednotiek (`slot-alcove.svg`), kruhové medailóny portrétov v zozname
  postáv Siene Božstiev a rohové/deliace ornamenty hlavného menu.
- Dokumentácia šablón: `public/art/frames/README.md`,
  `public/art/branding/README.md`.
- **docs/website-brief.md** — hotový prompt na vygenerovanie
  marketingovej/landing stránky pre Naviu (značka, paleta, štruktúra
  sekcií, texty čerpané priamo z herných dát, dostupné assety).

([8e2305f](https://github.com/bucala/Navia/commit/8e2305f))

## [0.10.1] — Bezpečnosť CI workflowov a drobné opravy dokumentácie

### Opravené
- **`persist-credentials: false`** na `actions/checkout` v oboch workflowoch
  (`ci.yml`, `android.yml`) — job iba builduje/testuje, nepotrebuje ponechaný
  GitHub token v git configu pre ďalšie kroky (`npm ci`, `npm run build`),
  ktoré spúšťajú kód tretích strán.
- **Android Release sa už nepublikuje s nepodpísaným debug APK.** Ak nie sú
  nastavené signing secrets, push tagu `v*` teraz release jednoducho
  nevytvorí (debug APK ostáva dostupný ako artefakt behu); predtým by sa
  aj bez podpisu vytvoril verejný GitHub Release s debug buildom.
- Názov Android artefaktu zjednotený na `navia-v*` (bol `pantheon-dice-of-destiny-v*`).
- README: opravené kotvy v obsahu (GitHub z ID nadpisu odstráni emoji aj
  medzeru za ním, takže napr. `#-galéria` bolo nefunkčné — správne je
  `#galéria`), spresnený názov Android artefaktu a pridaný jazyk `text` do
  bloku so štruktúrou projektu.
- CHANGELOG: doplnené odkazy na commit pre 0.9.0 a 0.10.0.

## [0.10.0] — Oprava značky Navia, hrateľnosti a pravidlá v menu

### Opravené
- **Hlavné menu, hlavička, `<title>`, PWA manifest, Android app label aj
  Capacitor appName** doteraz natvrdo zobrazovali anglický text „Pantheon:
  Dice of Destiny" bez ohľadu na zvolený jazyk. Hra sa teraz všade
  jednotne volá **Navia** (GDD názov „Pantheon: Dice of Destiny" ostáva ako
  pracovný podtitul dokumentu).
- **Hlavná herná slučka bola prakticky nehrateľná pre nového hráča**: karta
  v ruke, ktorú si hráč nemohol dovoliť (napr. 6-manová karta na 1. ťahu s
  1 manou), sa aj tak dala „vybrať" a všetky prázdne sloty sa ukázali ako
  platný cieľ; kliknutie potom tvrdo zlyhalo na „Nedostatok many" bez
  ďalšieho vysvetlenia — pri hociktorej drahšej karte to pôsobilo, akoby hra
  vôbec nereagovala na klikanie. Výber karty aj cieľové kúzlo teraz
  kontrolujú manu už pri highlighte slotov a namiesto tichého zlyhania sa
  zobrazí jasná hláška („Nedostatok many — táto karta stojí X, máš Y.").

### Pridané
- **📜 Ako hrať** — nová položka v hlavnom menu s pravidlami hry (cieľ,
  mana a fázy ťahu, pravidlo predného voja, kockový systém vrátane Výhody
  a Push-your-luck reťazí, prehľad kľúčových slov, víťazná podmienka),
  plne dvojjazyčná.

([11c6c5f](https://github.com/bucala/Navia/commit/11c6c5f))

---

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

([0b506ba](https://github.com/bucala/Navia/commit/0b506ba))

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


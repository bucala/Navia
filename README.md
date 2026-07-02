# Navia — Pantheon: Dice of Destiny

Ovládni silu zvieracích božstiev! Zostav balíček z mýtických tvorov, vylož svoje karty do taktických línií, prebuď pradávnu mágiu divočiny a rozdrv súperov v neľútostnom dueli — o osude každého útoku rozhoduje Božský hod kockou (D6).

Kompletný herný návrh nájdeš v **[Game Design Document (docs/GDD.md)](docs/GDD.md)**.

## Stav projektu — Fáza 1 ✅ · Fáza 2 ✅ · Fáza 3 ✅ · Fáza 4 ✅ · Fáza 5 ✅

Hotové sú všetky štyri fázy MVP z GDD (§7) plus Fáza 5 (perzistencia z GDD §5.2):

- **TypeScript dátové modely kariet** (`src/game/types.ts`, `src/game/cards.ts`) — jednotky, kúzla, frakcie, kľúčové slová.
- **Kockový engine D6** (`src/game/dice.ts`) — základný hod, Výhoda (2× D6, lepší výsledok), Push-your-luck reťaz s Overloadom na 6.
- **Herný engine** (`src/game/engine.ts`) — čistý reducer nad stavom hry: mana ramp, línie Vanguard/Sanctum, ochranný múr predného voja, statusy Láva (∞) a Kyselina (∞), Vyhubenie tokenov, plošné útoky do kríža, presuny agilných jednotiek a víťazná podmienka (Nexus 30 HP).
- **Základná React plocha + lokálna Pass & Play hra** (`src/ui/LocalGame.tsx`) pre dvoch hráčov na jednom zariadení, s animovaným hodom kociek a záznamom priebehu zápasu.
- **Online multiplayer (Fáza 2)** — Cloudflare Worker (`src/worker/index.ts`) + **Durable Object `GameRoom`** (`src/worker/GameRoom.ts`): jedna inštancia na zápas, jediná autorita nad stavom hry aj hodmi kociek (klient si nikdy nehádže sám). Prísne typovaný WebSocket protokol (`src/net/protocol.ts`), klientsky hook `useMultiplayerGame` a lobby s kódom miestnosti / pozvánkovou linkou (`?room=KÓD`). Reconnect cez hráčsky token vráti hráča na jeho miesto.
- **Sieň Božstiev** (`src/ui/Codex.tsx`) — listovateľný kódex postáv s príbehmi a kultúrnymi odkazmi.
- **Vizuálna vrstva (Fáza 3)** — art pipeline pre všetky karty (`src/ui/CardArt.tsx`: obrázky z `public/art/` s emoji fallbackom, viď tamojší README), plnohodnotná **3D animácia kocky** s dopadom a odskokom (GDD §6), otrasenie obrazovky pri šestke, animácie útokov (výpad útočníka, záblesk zásahu, lietajúce čísla poškodenia/liečenia, úmrtia jednotiek cez Framer Motion), kamenná/astrálna aréna a **procedurálne zvuky** cez WebAudio (rachot kocky, úspech/neúspech, zásah) s prepínačom stlmenia.
- **Matchmaking — „Rýchla hra" (Fáza 4)** — globálny **Matchmaker Durable Object** (`src/worker/Matchmaker.ts`) páruje hľadajúcich hráčov: prvý čaká vo fronte, druhý sa okamžite spáruje do spoločnej miestnosti. Opustené fronty rieši heartbeat + TTL, zrušenie hľadania je explicitná akcia hráča.
- **PWA + Android (Fáza 4)** — web manifest s ikonou (inštalovateľná PWA) a **Capacitor** projekt v `android/` pre export do APK; adresa backendu sa do mobilného buildu zapeká cez `VITE_API_BASE`.
- **Účty, ELO a Deckbuilder — D1 (Fáza 5)** — anonymné profily (playerId + tajný kľúč v localStorage, `POST /api/profile`), **ELO rating** (K=32) zapisovaný priamo GameRoom Durable Objectom po skončení hodnoteného zápasu (obaja hráči s profilom), história zápasov, **🏆 Rebríček** (top 10) a **🃏 Deckbuilder**: balíčky 15–25 kariet, max 2 kópie, serverová validácia aj vlastníctvo; aktívny balíček sa použije v online zápase namiesto štartovacieho. Schéma v `migrations/`.
- **40 unit testov** enginu, kociek, pravidiel balíčkov a ELO (Vitest).

Implementované karty: Megadrak, Pekelné zaklínadlo, Gorila, Papagáj, Zlatý Gryf, Bojový Kohút, Wukong (Opičí Kráľ), Medvebor, Rysoslav, Mahiša, Chepri + základné jednotky pre hrateľnosť testovacieho balíčka.

> Poznámka k balansu: GDD definuje HP, vzácnosť a mechaniky kariet; hodnoty útoku a ceny kockových schopností sú predbežné odhady pre Fázu 1 a doladia sa počas Pass & Play testovania. Emoji glyfy sú dočasná náhrada za art z R2 (Fáza 3).

## Spustenie

```bash
npm install
npx wrangler d1 migrations apply pantheon-db --local   # raz: lokálna D1 schéma
npm run dev          # vývojový server (Vite) — /api sa proxuje na worker
npm run dev:worker   # Cloudflare Worker + DO + D1 lokálne (port 8787)
npm test             # unit testy enginu (Vitest)
npm run build        # typová kontrola (app + worker) + produkčný build
npm run deploy       # build + wrangler deploy na Cloudflare
```

Pred prvým nasadením vytvor produkčnú D1 databázu: `wrangler d1 create pantheon-db`,
vlož vrátené `database_id` do `wrangler.toml` a spusti
`wrangler d1 migrations apply pantheon-db --remote`.

Online hru lokálne spustíš buď cez `npm run build && npm run dev:worker`
(worker servuje aj frontend z `dist/`), alebo počas vývoja dvomi terminálmi:
`npm run dev:worker` + `npm run dev`.

### Android APK (Capacitor)

```bash
# 1. web build s adresou nasadeného Workera (backend nie je v APK)
VITE_API_BASE=https://pantheon-dice-of-destiny.<ucet>.workers.dev npm run build

# 2. skopírovanie web buildu do natívneho projektu
npx cap sync android

# 3. build APK (vyžaduje Android Studio alebo Android SDK + JDK 17)
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

## Štruktúra

```
docs/GDD.md          herný návrh (Game Design Document)
wrangler.toml        Cloudflare Worker + Durable Objects konfigurácia
capacitor.config.ts  Capacitor (Android) konfigurácia; natívny projekt je v android/
src/game/            čistá herná logika (bez UI) — beží u klienta (lokálna hra) aj v Durable Objecte
  types.ts           dátové modely (karty, stav hry, akcie)
  cards.ts           katalóg kariet a testovací balíček
  dice.ts            kockový engine D6
  engine.ts          reducer herných akcií
  lore.ts            príbehy a kultúrne odkazy postáv (Sieň Božstiev)
migrations/          D1 schéma (hráči, balíčky, zápasy)
src/net/             WebSocket protokol, profily (D1 účty) + klientsky hook useMultiplayerGame
src/worker/          Cloudflare Worker router, profil/deck/leaderboard API + GameRoom a Matchmaker DO
src/ui/              React komponenty (Board, karty, kocky, log, kódex, lobby, deckbuilder, rebríček)
src/App.tsx          hlavné menu: lokálna hra / online hra / Sieň Božstiev
```

## Roadmapa (GDD §7)

- [x] **Fáza 1:** Core Engine + lokálna Pass & Play
- [x] **Fáza 2:** Sieťovanie — Cloudflare Durable Objects + WebSockets (server-side authority, lobby, reconnect)
- [x] **Fáza 3:** Assety a frakcie — art pipeline, 3D kocky, animácie útokov, zvuky (samotné obrazové súbory sa doplnia do `public/art/`, neskôr R2)
- [x] **Fáza 4:** Matchmaking („Rýchla hra") a Android — PWA manifest + Capacitor projekt (APK sa builduje lokálne v Android Studio)
- [x] **Fáza 5:** D1 perzistencia — účty, ELO rating, rebríček a deckbuilder (GDD §5.2)

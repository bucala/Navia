# Navia — Pantheon: Dice of Destiny

Ovládni silu zvieracích božstiev! Zostav balíček z mýtických tvorov, vylož svoje karty do taktických línií, prebuď pradávnu mágiu divočiny a rozdrv súperov v neľútostnom dueli — o osude každého útoku rozhoduje Božský hod kockou (D6).

Kompletný herný návrh nájdeš v **[Game Design Document (docs/GDD.md)](docs/GDD.md)**.

## Stav projektu — Fáza 1 ✅ · Fáza 2 ✅

Podľa roadmapy v GDD (§7) je hotová prvá aj druhá fáza:

- **TypeScript dátové modely kariet** (`src/game/types.ts`, `src/game/cards.ts`) — jednotky, kúzla, frakcie, kľúčové slová.
- **Kockový engine D6** (`src/game/dice.ts`) — základný hod, Výhoda (2× D6, lepší výsledok), Push-your-luck reťaz s Overloadom na 6.
- **Herný engine** (`src/game/engine.ts`) — čistý reducer nad stavom hry: mana ramp, línie Vanguard/Sanctum, ochranný múr predného voja, statusy Láva (∞) a Kyselina (∞), Vyhubenie tokenov, plošné útoky do kríža, presuny agilných jednotiek a víťazná podmienka (Nexus 30 HP).
- **Základná React plocha + lokálna Pass & Play hra** (`src/ui/LocalGame.tsx`) pre dvoch hráčov na jednom zariadení, s animovaným hodom kociek a záznamom priebehu zápasu.
- **Online multiplayer (Fáza 2)** — Cloudflare Worker (`src/worker/index.ts`) + **Durable Object `GameRoom`** (`src/worker/GameRoom.ts`): jedna inštancia na zápas, jediná autorita nad stavom hry aj hodmi kociek (klient si nikdy nehádže sám). Prísne typovaný WebSocket protokol (`src/net/protocol.ts`), klientsky hook `useMultiplayerGame` a lobby s kódom miestnosti / pozvánkovou linkou (`?room=KÓD`). Reconnect cez hráčsky token vráti hráča na jeho miesto.
- **Sieň Božstiev** (`src/ui/Codex.tsx`) — listovateľný kódex postáv s príbehmi a kultúrnymi odkazmi (art patrí do `public/art/`, viď tamojší README).
- **35 unit testov** enginu a kociek (Vitest).

Implementované karty: Megadrak, Pekelné zaklínadlo, Gorila, Papagáj, Zlatý Gryf, Bojový Kohút, Wukong (Opičí Kráľ), Medvebor, Rysoslav, Mahiša, Chepri + základné jednotky pre hrateľnosť testovacieho balíčka.

> Poznámka k balansu: GDD definuje HP, vzácnosť a mechaniky kariet; hodnoty útoku a ceny kockových schopností sú predbežné odhady pre Fázu 1 a doladia sa počas Pass & Play testovania. Emoji glyfy sú dočasná náhrada za art z R2 (Fáza 3).

## Spustenie

```bash
npm install
npm run dev          # vývojový server (Vite) — /api sa proxuje na worker
npm run dev:worker   # Cloudflare Worker + Durable Objects lokálne (port 8787)
npm test             # unit testy enginu (Vitest)
npm run build        # typová kontrola (app + worker) + produkčný build
npm run deploy       # build + wrangler deploy na Cloudflare
```

Online hru lokálne spustíš buď cez `npm run build && npm run dev:worker`
(worker servuje aj frontend z `dist/`), alebo počas vývoja dvomi terminálmi:
`npm run dev:worker` + `npm run dev`.

## Štruktúra

```
docs/GDD.md          herný návrh (Game Design Document)
wrangler.toml        Cloudflare Worker + Durable Objects konfigurácia
src/game/            čistá herná logika (bez UI) — beží u klienta (lokálna hra) aj v Durable Objecte
  types.ts           dátové modely (karty, stav hry, akcie)
  cards.ts           katalóg kariet a testovací balíček
  dice.ts            kockový engine D6
  engine.ts          reducer herných akcií
  lore.ts            príbehy a kultúrne odkazy postáv (Sieň Božstiev)
src/net/             WebSocket protokol + klientsky hook useMultiplayerGame
src/worker/          Cloudflare Worker router + GameRoom Durable Object (server authority)
src/ui/              React komponenty (Board, karty, kocky, log, kódex, lobby)
src/App.tsx          hlavné menu: lokálna hra / online hra / Sieň Božstiev
```

## Roadmapa (GDD §7)

- [x] **Fáza 1:** Core Engine + lokálna Pass & Play
- [x] **Fáza 2:** Sieťovanie — Cloudflare Durable Objects + WebSockets (server-side authority, lobby, reconnect)
- [ ] **Fáza 3:** Assety a frakcie — art z R2, animácie útokov
- [ ] **Fáza 4:** Matchmaking a Android (Capacitor)

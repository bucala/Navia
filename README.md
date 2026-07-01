# Navia — Pantheon: Dice of Destiny

Ovládni silu zvieracích božstiev! Zostav balíček z mýtických tvorov, vylož svoje karty do taktických línií, prebuď pradávnu mágiu divočiny a rozdrv súperov v neľútostnom dueli — o osude každého útoku rozhoduje Božský hod kockou (D6).

Kompletný herný návrh nájdeš v **[Game Design Document (docs/GDD.md)](docs/GDD.md)**.

## Stav projektu — Fáza 1: Core Engine ✅

Podľa roadmapy v GDD (§7) je hotová prvá fáza:

- **TypeScript dátové modely kariet** (`src/game/types.ts`, `src/game/cards.ts`) — jednotky, kúzla, frakcie, kľúčové slová.
- **Kockový engine D6** (`src/game/dice.ts`) — základný hod, Výhoda (2× D6, lepší výsledok), Push-your-luck reťaz s Overloadom na 6.
- **Herný engine** (`src/game/engine.ts`) — čistý reducer nad stavom hry: mana ramp, línie Vanguard/Sanctum, ochranný múr predného voja, statusy Láva (∞) a Kyselina (∞), Vyhubenie tokenov, plošné útoky do kríža, presuny agilných jednotiek a víťazná podmienka (Nexus 30 HP).
- **Základná React plocha + lokálna Pass & Play hra** (`src/App.tsx`, `src/ui/`) pre dvoch hráčov na jednom zariadení, s animovaným hodom kociek a záznamom priebehu zápasu.
- **33 unit testov** enginu a kociek (Vitest).

Implementované karty: Megadrak, Pekelné zaklínadlo, Gorila, Papagáj, Zlatý Gryf, Bojový Kohút, Opičí Kráľ + základné jednotky pre hrateľnosť testovacieho balíčka.

> Poznámka k balansu: GDD definuje HP, vzácnosť a mechaniky kariet; hodnoty útoku a ceny kockových schopností sú predbežné odhady pre Fázu 1 a doladia sa počas Pass & Play testovania. Emoji glyfy sú dočasná náhrada za art z R2 (Fáza 3).

## Spustenie

```bash
npm install
npm run dev      # vývojový server (Vite)
npm test         # unit testy enginu (Vitest)
npm run build    # typová kontrola + produkčný build
```

## Štruktúra

```
docs/GDD.md          herný návrh (Game Design Document)
src/game/            čistá herná logika (bez UI) — v Fáze 2 sa presunie do Cloudflare Durable Object
  types.ts           dátové modely (karty, stav hry, akcie)
  cards.ts           katalóg kariet a testovací balíček
  dice.ts            kockový engine D6
  engine.ts          reducer herných akcií
src/ui/              React komponenty plochy (Board, karty, kocky, log)
src/App.tsx          Pass & Play shell (odovzdávanie zariadenia, overlay kociek)
```

## Roadmapa (GDD §7)

- [x] **Fáza 1:** Core Engine + lokálna Pass & Play
- [ ] **Fáza 2:** Sieťovanie — Cloudflare Durable Objects + WebSockets
- [ ] **Fáza 3:** Assety a frakcie — art z R2, animácie útokov
- [ ] **Fáza 4:** Matchmaking a Android (Capacitor)

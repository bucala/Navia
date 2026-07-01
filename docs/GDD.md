# GAME DESIGN DOCUMENT (GDD)

## Názov projektu: Pantheon: Dice of Destiny

**Verzia dokumentu:** 1.0.0
**Žáner:** Multiplayer Collectible Card Game (CCG) / Tactical Board Game
**Platformy:** Webový prehliadač (Desktop/Mobile), neskôr natívna Android aplikácia (cez Capacitor)
**Sieťový model:** Real-time online multiplayer (1v1) s prechodom na 4 hráčov (Free-for-All / 2v2) v neskorších fázach.

---

## 1. Úvod a Vízia (Pitch)

**Pantheon: Dice of Destiny** je inovatívna kartová hra, ktorá spája prístupnosť a vizuálnu eleganciu hier ako *Hearthstone* s taktickým rozmiestňovaním na hracej ploche (*Gwent*) a nepredvídateľným vzrušením z hádzania kociek (stolové RPG). Hráči preberajú rolu Vyvolávačov (Summoners), ktorí v astrálnych arénach povolávajú do boja mýtické zvieracie božstvá. Jadrom stratégie nie je len to, akú kartu hráč zahrá, ale ako dokáže manažovať riziko pomocou "Božského hodu kockou" (D6).

---

## 2. Herné Mechaniky (Core Gameplay)

### 2.1 Hracie pole (The Arena)

Hracie pole je rozdelené na dve polovice (pre každého hráča). Každá polovica obsahuje dve taktické línie:

* **Vanguard (Predný voj):** Obsahuje 3 až 5 slotov. Sem sa umiestňujú "Tankovia" a "Melee" jednotky. Zabraňujú priamemu útoku na zadnú líniu.
* **Sanctum (Svätyňa):** Zadná línia pre mágov, lietajúce tvory a podporné jednotky. Môžu útočiť na diaľku, ale sú zraniteľnejšie, ak padne Predný voj.

### 2.2 Suroviny a Priebeh ťahu

* **Zdravie hrdinu (Nexus):** Každý hráč začína s 30 HP. Zničenie oponentovho Nexusu znamená výhru.
* **Mana (Božská energia):** Každé kolo hráč získa 1 maximálnu Manu (až do 10). Mana sa používa na vykladanie kariet a aktiváciu špeciálnych "Kockových" schopností.
* **Fázy ťahu:**
  1. *Začiatok ťahu:* Obnova Many, vyhodnotenie statických efektov (napr. krvácanie, popálenie).
  2. *Hlavná fáza:* Vykladanie kariet na prázdne sloty v líniách.
  3. *Bojová fáza:* Deklarovanie útokov a hádzanie kociek.
  4. *Koniec ťahu:* Odovzdanie slova oponentovi.

### 2.3 Kockový systém (The Dice Engine - D6)

Toto je hlavný odlišovací prvok hry. Každá karta útočí pomocou digitálnej 6-stennej kocky.

* **Základný útok:** Nevyžaduje hod kockou, udelí štandardné poškodenie.
* **Aktivácia schopnosti (Dice Requirement):** Ak hráč zaplatí dodatočnú Manu, môže pri útoku "hodiť kockou". Ak padne číslo uvedené na karte (napr. 3+), aktivuje sa devastujúci špeciálny efekt.
* **Modifikátory hodu:**
  * *Advantage (Výhoda):* Hráč hádže dvomi kockami a berie lepší výsledok (typické pre defenzívne karty).
  * *Push-your-luck (Risk):* Možnosť hádzať kockou opakovane pre násobenie efektu, až kým nepadne kritické zlyhanie (číslo 6 na určitých kúzlach).

---

## 3. Dizajn a Anatómia Kariet

Každá karta sa skladá z nasledujúcich UI prvkov:

* **Krištáľ (vľavo hore):** Cena v Mane (od 1 do 10).
* **Art:** Nádherná ilustrácia mytologického božstva.
* **Banner so zlatým drahokamom:** Meno postavy a indikátor vzácnosti (Legendárna).
* **Kvapka krvi (vpravo dole):** Životy (HP) danej karty.
* **Textový box:** Obsahuje ikony mechaník a špeciálnych podmienok.

| Mechanika / Kľúčové slovo | Vizuálna ikona na karte | Popis |
| --- | --- | --- |
| **Plošný útok (AoE)** | Piškvorková mriežka (Tic-tac-toe) | Zasiahne primárny cieľ a susedné sloty (do kríža). |
| **Vyhubenie** | Preškrtnutá myš | Okamžite zabíja tokeny (karty s max 1 HP), ignoruje ich štíty. |
| **Trvalý status (DoT)** | Symbol "∞ krát" | Udeľuje efekt, ktorý pretrváva každé kolo (Oheň, Kyselina). |
| **Risk/Reward Kúzlo** | Srdce a Kocka (s ∞) | Možnosť zosilňovať kúzlo opakovaným hodom, risk zlyhania pri 6. |

---

## 4. Komplexný Roster Kariet a Frakcií

Hra bude obsahovať frakcie definované zadnou stranou karty (referencia na súbor `danny-huynh-dannyhuynh-cardbacks.jpg`, ktorý zobrazuje Magickú, Prírodnú, Lávovú a Ľadovú frakciu).

### Frakcia: Lávový dvor (Útok a Deštrukcia)

* **Megadrak** (finálna karta v `Drak_card.png`, postavená na arte `c7deec0195a7d165ee970e497641b1f5.jpg`)
  * *Pozícia:* Vanguard
  * *Štatistiky:* 6 HP, Legendary.
  * *Schopnosti:*
    * Láva ∞ krát: Jeho prítomnosť trvalo spaľuje nepriateľov.
    * Kyselina ∞ krát: Trvalo znižuje brnenie.
    * Pest Control (Preškrtnutá myš): Zabezpečuje vyčistenie poľa od drobných prekážok.
    * AoE Kocka (3+): Pri úspešnom hode aplikuje piškvorkový plošný útok.

* **Pekelné zaklínadlo** (kúzlo v `peklo_card.png`)
  * *Typ:* Spell (Kúzlo)
  * *Schopnosti:* Vráti 1+ HP hráčovi. Jadrom je mechanika nekonečného hodu ("3+ ∞ krát ak nehodíš 6"). Hráč hádže kockou: pri 3,4,5 sa udelí poškodenie a hádže znova. Pri 1 alebo 2 sa reťaz ukončí bez postihu. Pri 6 sa reťaz ukončí a kúzlo zraní samotného hráča (Overload).

### Frakcia: Prírodný a Zemský Pakt (Obrana a Stabilita)

* **Gorila** (finálna karta v `gorila_card.png`)
  * *Pozícia:* Vanguard (Hlavný Tank)
  * *Štatistiky:* 6 HP, Legendary.
  * *Schopnosti:*
    * Defenzívny hod (5+ Srdce): Schopnosť masívneho liečenia alebo získania brnenia.
    * Výhoda (Ikona kocky x2): Pri každom obrannom/útočnom hode hádže hráč na serveri 2x D6 a vyberá sa lepší výsledok.

### Frakcia: Nebeský Zbor (Mobilita a Podfuky)

* **Papagáj** (finálna karta v `Papagaj_card.png`, postavená na arte `0421280c5c3fdb5ecf8f27e3f44fe9b4.jpg`)
  * *Pozícia:* Sanctum (Zadná línia, Letec)
  * *Štatistiky:* 6 HP, Legendary.
  * *Schopnosti:*
    * Kyselina ∞ krát: Každý útok znižuje obranu cieľa.
    * Stabilita (Ikona kocky 1+): Jeho schopnosť zoslať kyselinu je takmer garantovaná, ignoruje bežné zlyhania kocky.

### Plánované rozšírenia (Základné Assety pre vývoj budúcich frakcií):

* **Zlatý Gryf** (`4de2fdd733192773ad446841bc3f1c30.jpg`): Bude fungovať ako podpora (Healer/Shielder) s plošným buffom pre líniu Vanguard.
* **Bojový Kohút** (`552d16af4b82c3b9c7dc2ec6173f976c.jpg`): Typ "Berserker". Čím nižšie má HP, tým má menší "Dice Requirement" (napr. na plné HP potrebuje hodiť 5+, pri 1 HP mu stačí hodiť 2+ na devastačný útok).
* **Opičí Kráľ** (`d65fcd64e0aab6893065d535b4855a49.jpg`): Agilná jednotka schopná preskakovať medzi Vanguard a Sanctum počas bojovej fázy (uhýbanie sa AoE útokom Megadraka).

---

## 5. Technologická Architektúra a Stack

Projekt je dimenzovaný na moderný "Serverless" prístup, zaručujúci nulovú latenciu, lacnú prevádzku a vysokú škálovateľnosť pre globálny multiplayer.

### 5.1 Frontend (Klient)

* **Framework:** React (Vite) s TypeScriptom pre striktnú typovú kontrolu herných objektov.
* **UI & Stylovanie:** Tailwind CSS.
* **Herný Engine (Animácie):** Framer Motion pre UI prechody (ťahanie kariet, otáčanie kariet). Ak bude logika hracieho poľa vyžadovať pokročilé efekty (častice ohňa, kyseliny), integruje sa Pixi.js pre canvas rendering poľa.
* **Platforma:** PWA (Progressive Web App) s neskorším obalením do **Capacitor.js** pre vydanie na Google Play (Android).

### 5.2 Backend & Cloudflare Architektúra

* **Cloudflare Pages:** Hosting pre skompilovaný React frontend (bleskové načítanie pomocou edge CDN).
* **Cloudflare Workers:** Serverless backend pre routing, autentifikáciu a matchmaking.
* **Cloudflare Durable Objects:** **Kritická vrstva!** Každý herný zápas (Room) je inštanciou Durable Objectu. Udržuje bezpečný stav hry (Zdravie kariet, ťahy, pozície) a je jedinou autoritou, ktorá volá funkciu `Math.random()` pre hádzanie kociek. Pripája hráčov cez WebSockets pre real-time komunikáciu.
* **Cloudflare D1:** Relačná SQLite databáza na hrane siete. Ukladá užívateľské účty, ELO rating, odmeny a zostavené balíčky hráčov (Deckbuilder).
* **Cloudflare R2:** Úložisko pre všetky obrázky s vysokým rozlíšením (`Drak_card.png`, `4de2fdd733192773ad446841bc3f1c30.jpg` a ďalšie).

### 5.3 Komunikácia Klient - Server (Príklad WebSockets)

Stav hry sa mení čisto cez asynchrónne správy:

* `Client -> Server`: `{"action": "PLAY_CARD", "cardId": "papagaj_01", "lane": "sanctum"}`
* `Server -> Clients`: `{"event": "BOARD_UPDATED", "state": {...}}`
* `Client -> Server`: `{"action": "ATTACK_WITH_DICE", "attacker": "megadrak", "target": "gorila"}`
* `Server -> Clients`: `{"event": "DICE_ROLLED", "result": 5, "damageCalculated": 8, "modifiers": ["aoe_triggered"]}`

---

## 6. Zvukový a Vizuálny Smer (Art Direction)

* **Vizuál kariet:** Mytologický, svalnatý, mierne temný fantasy štýl s vysokým kontrastom. Rubové strany (`danny-huynh-dannyhuynh-cardbacks.jpg`) udávajú farebnú paletu UI pre danú frakciu.
* **Vizuál plochy:** Kamenný / Astrálny podklad s vyhĺbenými slotmi pre karty.
* **Animácie Kociek:** Na obrazovke musí pri aktivácii schopnosti prebehnúť plnohodnotná 3D animácia padajúcej kocky (uspokojivý vizuálny aj zvukový efekt odskakovania po stole). Ak hráč hodí 6 (Kritický úspech), obrazovka sa jemne zatrasie.

## 7. Cesta k MVP (Minimum Viable Product)

1. **Fáza 1: Core Engine (Týždne 1-2)**
   * TypeScript dátové modely kariet.
   * Základná React plocha.
   * Lokálna "Pass & Play" hra pre dvoch hráčov na jednom PC pre otestovanie zábavnosti kockovej mechaniky.

2. **Fáza 2: Sieťovanie (Týždne 3-4)**
   * Implementácia Cloudflare Durable Objects.
   * Synchronizácia stavu cez WebSockets.

3. **Fáza 3: Assety a Frakcie (Týždne 5-6)**
   * Nahodenie všetkých vizuálov (Gorila, Drak, Papagáj, Kúzla).
   * Animácie útokov a kociek.

4. **Fáza 4: Matchmaking a Android (Týždne 7-8)**
   * Systém vyhľadávania oponentov.
   * Export do APK cez Capacitor.

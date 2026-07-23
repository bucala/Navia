# Navia — prompt na vytvorenie webovej stránky

Toto je hotový, komplexný prompt — skopíruj celý obsah nižšie (od nadpisu
„## PROMPT" po koniec súboru) do AI nástroja na tvorbu webstránok (Lovable,
v0, Bolt, Claude/ChatGPT s Artifacts a pod.) alebo ho odovzdaj dizajnérovi
či vývojárovi ako zadanie. Časť pred „## PROMPT" je len vysvetlenie pre
teba — do generátora ju kopírovať netreba.

Pred použitím doplň prázdne zátvorky `[...]` (URL nasadenej appky, GitHub
odkaz, prípadne kontakt) — v repozitári tieto hodnoty nie sú, lebo appka
zatiaľ nemusí byť nasadená na produkčnú Cloudflare doménu.

---

## PROMPT

Si skúsený web dizajnér a frontend developer. Vytvor jednostránkovú (single
page, s kotvami na sekcie) marketingovú/landing webstránku pre hru **Navia**.
Stránka musí byť responzívna, rýchla, vizuálne pôsobivá a musí presne
vystihovať charakter hry — mytologický, temno-fantasy, „vytesaný do kameňa
a rozžeravený ohňom". Nešpekuluj s faktami o hre — drž sa presne podkladov
nižšie.

### 1. O hre (elevator pitch)

**Navia** je multiplayer zberateľská kartová hra (CCG), ktorá spája
prístupnosť a vizuálnu eleganciu hier ako *Hearthstone* s taktickým
rozmiestňovaním jednotiek na hracej ploche (v štýle *Gwent*) a
nepredvídateľným vzrušením z hádzania kociek stolových RPG. Hráči preberajú
rolu **Vyvolávačov**, ktorí v astrálnych arénach povolávajú do boja
**mýtické zvieracie božstvá naprieč kultúrami sveta** — slovanského medveďa
Medvebora, čínskeho Opičieho kráľa Wukonga, egyptského skarabea Chepriho,
aztéckeho orlieho rytiera Cuauhtliho a ďalších. Jadrom stratégie nie je len
to, akú kartu hráč zahrá, ale ako dokáže manažovať riziko pomocou
**Božského hodu kockou (D6)**.

Pracovný podtitul projektu (z pôvodného herného návrhu) je *Pantheon: Dice
of Destiny*; hra sa dnes všade volá jednotne **Navia**, s tagline
**„Kocka osudu"** (anglicky *„Dice of Destiny"*).

### 2. Cieľ stránky

- Presvedčiť náhodného návštevníka (fanúšika CCG/stolových hier), aby si
  hru **hneď vyskúšal** — hlavné CTA vedie priamo do hry v prehliadači
  (PWA, žiadna inštalácia potrebná).
- Ukázať kvalitu a hĺbku hry: kockový systém, taktické línie, 16 kariet
  postavených na skutočných mytológiách, ELO rebríček, deckbuilding.
- Osloviť aj vývojársku/open-source komunitu — projekt je plne open source
  (MIT licencia), postavený na Cloudflare Workers/Durable Objects/D1 +
  React/TypeScript.
- Ponúknuť aj Android APK na stiahnutie pre hráčov, ktorí chcú natívnu appku.

### 3. Cieľová skupina

Hráči kartových/stolových hier (Hearthstone, Gwent, Magic, Marvel Snap),
fanúšikovia mytológie a fantasy, príležitostní webhrí (PWA = hraj v
prehliadači bez inštalácie), a menšia vrstva vývojárov/open-source
nadšencov zvedavých na tech stack.

### 4. Značka a vizuálny štýl

**Názov:** Navia
**Tagline:** Kocka osudu / Dice of Destiny
**Nálada:** mytologický, kamenný/runový reliéf, roztavené zlato a oheň,
astrálna noc s hviezdami — nie kreslený/kawaii štýl, skôr temný, svalnatý,
vysokokontrastný fantasy (podobne ako art na kartách).

**Farebná paleta** (presné hodnoty použité v logu a appke):

| Účel | Farby (hex) |
|---|---|
| Ohnivý gradient (logo, akcenty, CTA) | `#ffe58a` → `#f6a723` → `#c2410c` |
| Bronz / zlaté rámy a ornamenty | `#e8c07a` → `#9c6b2e` |
| Kameň (pozadie loga, tabuľky, karty) | `#3b2c1e` / `#241b13` / `#120d08` |
| Astrálne pozadie appky (noc, hmloviny) | `#2b2352` → `#14102b` → `#0a0818`, s jemnými hmlovinami vo fialovej `rgb(88 28 135)`, červenej `rgb(153 27 27)` a zelenej `rgb(6 78 59)` |
| Frakcia Lávový dvor (červená/oranžová) | `red-950` → `orange-900` (Tailwind) |
| Frakcia Prírodný a Zemský Pakt (zelená) | `emerald-950` → `green-900` |
| Frakcia Nebeský Zbor (modrá/indigo) | `sky-950` → `indigo-900` |
| Vzácnosť: bežná / vzácna / legendárna | oceľovosivá `#94a3b8` / fialová `#c084fc` / zlatá `#fbbf24` |

**Typografia:** hrubé, kontrastné bezpätkové/display písmo pre nadpisy
(podobné hernému logu — blokové, mierne „runové"/uholné tvary), čitateľné
humanistické písmo pre telo textu. Nepoužívaj hravé/zaoblené fonty — hra má
seriózny, mytologický tón.

**Logo:** k dispozícii ako čisté SVG (vektor, škáluje bez straty kvality) —
`public/art/branding/navia-logo.svg` (plné logo s nápisom a 5 zvieracími
medailónmi: byvol, opica, slon, orol, medveď na kamennej tabuli) a
`public/art/branding/navia-mark.svg` (zjednodušená štvorcová značka/favicon
s runovým „N"). Ak generátor nemá prístup k súborom repozitára, popíš/vytvor
podobný motív: tmavá kamenná doska s ohnivo-zlatým nápisom „NAVIA" a
runovými zárezmi po okraji.

### 5. Štruktúra stránky (sekcie)

1. **Hero** — logo Navia (veľké, v strede alebo vľavo), tagline „Kocka
   osudu", jedna-dve vety pitchu (bod 1), veľké primárne CTA tlačidlo
   **„Hraj teraz"** (odkaz na `[URL nasadenej appky]`) a sekundárne CTA
   **„Stiahni pre Android"** alebo **„Pozri na GitHube"**. Na pozadí
   astrálna nočná obloha s hmlovinami (paleta vyššie) a jemným
   hviezdnym poprašom; voliteľne animovaný/plávajúci efekt.
2. **Ako sa hrá (kockový systém)** — vysvetli hlavný odlišujúci prvok:
   *Základný útok* (bez rizika, štandardné poškodenie) vs. *hod kockou*
   (priplať manu, hoď D6, pri úspechu sa spustí devastujúci efekt karty).
   Spomeň modifikátory: **Výhoda** (2× D6, berie sa lepší výsledok) a
   **push-your-luck reťaze** (možnosť hádzať opakovane pre násobenie
   efektu, riziko kritického zlyhania na 6/Overload). Vizuálne zdôrazni
   kocku ako hlavný symbol značky.
3. **Taktické línie** — vysvetli Vanguard (predný voj, tankovia/melee,
   chráni zadnú líniu) a Sanctum (zadná línia, mágovia/letci/podpora).
   Zdravie hrdinu je **Nexus s 30 HP**; zničenie súperovho Nexusu = výhra.
4. **Frakcie a postavy** — tri frakcie, každá s vlastnou farbou a
   zameraním (tabuľka nižšie); vizuálne ako 3 karty/stĺpce s farebným
   akcentom frakcie. Pod tým galéria vybraných hrdinov s portrétom, menom
   a jednou vetou z ich príbehu (podklady v bode 7).
5. **Mytológia sveta** — krátka sekcia vyzdvihujúca, že postavy nie sú
   vymyslené naslepo, ale čerpajú zo skutočných mytológií naprieč
   kultúrami (slovanská, čínska, egyptská, aztécka, hinduistická,
   juhoázijská/khmérska, budhistická) — pozri konkrétne odkazy v bode 7.
   Toto je silný diferenciátor oproti bežným fantasy CCG.
6. **Herné režimy** — mriežka/ikony pre: **Hra jedného hráča** (AI súper
   „Duch Arény"), **Online multiplayer** (rýchla hra s matchmakingom alebo
   súkromná miestnosť s pozvánkovou linkou), **Pass & Play** (dvaja hráči
   na jednom zariadení), **Deckbuilder** (vlastné balíčky 15–25 kariet,
   max. 2 kópie od karty), **ELO rebríček** (hodnotené zápasy, systém ELO).
7. **Screenshoty / galéria** — použi (ak má generátor k nim prístup)
   `docs/screenshots/menu.jpg`, `board.jpg`, `codex.jpg`, `decks.jpg`,
   `leaderboard.jpg`. Inak vytvor placeholder rámčeky v pomere 16:10 s
   popiskami „Hlavné menu", „Taktické línie na ploche", „Sieň Božstiev",
   „Deckbuilder", „ELO rebríček".
8. **Dostupnosť platforiem** — PWA (nainštaluj priamo z prehliadača, funguje
   na desktope aj mobile), Android APK na stiahnutie z GitHub Releases/
   Actions. Zdôrazni, že hra beží okamžite vo webovom prehliadači bez
   nutnosti účtu (anonymný profil sa vytvorí automaticky).
9. **Open source / tech** — krátka sekcia pre technicky zvedavých:
   React + TypeScript + Vite + Tailwind CSS na frontende, Cloudflare
   Workers + Durable Objects (server je jediná autorita nad stavom hry aj
   hodmi kociek — žiadny klient si nikdy nehádže sám) + D1 databáza,
   MIT licencia, odkaz na GitHub repozitár.
10. **Jazyky** — hra je plne dvojjazyčná SK/EN (aj priebeh zápasu, nielen
    UI); spomeň to ako drobný, ale peknný detail.
11. **Finálne CTA / pätička** — opakuj „Hraj teraz" tlačidlo, odkazy na
    GitHub, Changelog, licenciu (MIT), prípadný kontakt/komunitu
    `[doplň, ak existuje]`.

### 6. Podklady na obsah — frakcie

| Frakcia | Zameranie | Karty |
|---|---|---|
| 🔥 Lávový dvor | Útok a deštrukcia (trvalé Láva/Kyselina efekty) | Megadrak, Pekelné zaklínadlo, Lávový škriatok |
| 🌿 Prírodný a Zemský Pakt | Obrana a stabilita | Mahákapi, Medvebor, Mahiša, Chepri, Khadga, Kamenný strážca, Zlatý Gryf |
| 🕊️ Nebeský Zbor | Mobilita a podfuky | Wukong, Cuauhtli, Rysoslav, Bojový Kohút, Papagáj, Nebeský vrabec |

### 7. Podklady na obsah — mytologickí hrdinovia (pre sekciu 4/5)

Použi ako krátke citácie/popisky pod portrétmi (skráť podľa potreby):

- **Wukong, Opičí Kráľ** — čínska mytológia, *Cesta na západ*. Nesmrteľný
  šibal, ktorý sa vzoprel samotnému Nebeskému cisárovi; v aréne preskakuje
  medzi líniami rýchlejšie, než stihne súper zdvihnúť ruku.
- **Medvebor, Velesov Šampión** — slovanská mytológia, posvätné zviera boha
  Velesa. Stojí v prednom voji ako živý val; jeho rozťatie kolovratom
  zmetie celú líniu útočníkov.
- **Rysoslav, Žrec Perúna** — slovanská mytológia, hromovládny boh Perún.
  Bývalý žrec premenený na rysa, ktorý zvoláva búrku na celé bojisko.
- **Mahiša, Chrámový Býk** — hinduistická mytológia, byvolí démon
  Mahišásura, ktorého pýchu zlomila bohyňa Durga (sviatok Navarátri).
  Dnes stráži chrám, ktorý kedysi sám zbúral.
- **Chepri, Skarabejský Strážca** — staroegyptská mytológia, boh Chepri so
  skarabeom namiesto tváre, ktorý každé ráno tlačí slnko nad obzor.
  Trpezlivý, tichý, nezničiteľný strážca.
- **Khadga, Štít Chrámu** — juhoázijská/khmérska tradícia (Angkor);
  *khadga* je sanskrit pre nosorožca aj posvätný meč. Nikdy neustupuje.
- **Cuauhtli, Orlí Rytier** — aztécka kultúra, elitní orlí bojovníci
  (*cuāuhpipiltin*) zasvätení bohu slnka Huitzilopochtlimu.
- **Mahákapi, Obrnený Titan** — budhistická/hinduistická džátaka o Veľkej
  opici, ktorá z vlastného tela spravila most na záchranu svojho kmeňa.

### 8. Dostupné assety

- `public/art/branding/navia-logo.svg` — plné logo (wordmark).
- `public/art/branding/navia-mark.svg` — štvorcová značka/favicon.
- `public/icons/icon-{16…512}.png` — hotová sada rastrových ikon.
- `docs/screenshots/*.jpg` — 5 aktuálnych screenshotov appky (1920×1200).
- `public/art/*.jpg` — AI portréty jednotlivých postáv (pre galériu hrdinov).
- `public/art/frames/*.svg` — ornamentálne rámy/textúry (kamenná textúra,
  rámy kariet podľa vzácnosti, ornamenty) — dajú sa použiť ako dekoratívne
  prvky/pozadia na stránke pre konzistentný vizuál s appkou.

### 9. Technické požiadavky

- Plne responzívne (mobil/tablet/desktop), rýchle načítanie (statický
  landing, žiadny zbytočný JS framework, ak to nie je nutné).
- SEO: zmysluplný `<title>`, meta popis, Open Graph + Twitter Card obrázok
  (ideálne screenshot menu alebo logo na astrálnom pozadí).
- Prístupnosť: dostatočný kontrast textu na tmavom pozadí, `alt` texty pri
  obrázkoch, sémantické nadpisy.
- Odkazy vedú na skutočné URL: `[URL appky]`, `[URL GitHub repozitára]`,
  `[URL GitHub Releases pre Android APK]`.
- Jazyk stránky: primárne slovenčina (hra je SK-first); voliteľne
  prepínač SK/EN, keďže appka samotná je plne dvojjazyčná.

### 10. Tón a štýl copywritingu

Sebavedomý, mierne epický, ale bez prehnaného predávania („bombastické"
marketingové frázy typu „revolučná next-gen hra" sa vyhni). Píš vecne o
mechanikách (kocka, línie, ELO) a nechaj mytologické príbehy niesť emóciu.
Hra je hobby/open-source projekt v aktívnom vývoji — netvár sa, že ide o
veľkú komerčnú AAA hru s obchodom, in-app nákupmi či App Store dostupnosťou
(nič také neexistuje: je to PWA + Android APK, zadarmo, open source).

### 11. Čo nerobiť

- Nevymýšľaj recenzie, počty hráčov, hodnotenia ani citácie od
  „fanúšikov" — projekt takéto údaje nemá.
- Nepridávaj obchod/platby/predplatné — hra je zadarmo.
- Nemeň fakty o hre (napr. počet kariet, mechaniky, frakcie) — drž sa
  presne podkladov vyššie.
- Nepoužívaj iné logo/branding než popísané vyššie (žiadne generické
  meč-a-štít CCG klišé ikony namiesto skutočného loga).

# Rámy a ornamenty (art templates)

Tieto SVG súbory sú **editovateľné templaty**, nie hotová grafika — nahraď ich
vlastným súborom rovnakého mena (alebo uprav priamo v Illustrator/Inkscape/
Figma) a hra sa prekreslí bez zásahu do kódu. Nič tu nie je zapečené do JS —
CSS v `src/styles.css` a komponenty v `src/ui/` len odkazujú na tieto cesty.

## Rámy kariet (`frame-*.svg`)

Použité ako CSS [`border-image`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image)
(9-slice) na `CardFace.tsx` (karta v ruke), `UnitToken.tsx` (jednotka na
ploche) a `Codex.tsx` (veľký art panel). Priehľadný stred sa **nevykresľuje**
— cez neho presvitá existujúci frakčný gradient/art, rám dodáva len okraj.

| Súbor | Vzácnosť | Trieda v `styles.css` |
| --- | --- | --- |
| `frame-common.svg` | Bežná | `.card-frame--common`, `.slot-frame--common` |
| `frame-rare.svg` | Vzácna | `.card-frame--rare`, `.slot-frame--rare` |
| `frame-legendary.svg` | Legendárna | `.card-frame--legendary`, `.slot-frame--legendary` |

Ak nahrádzaš tieto súbory:

* nechaj `viewBox="0 0 200 200"` — `border-image-slice` v `styles.css`
  (34 pre common/rare, 40 pre legendary) počíta s týmito rozmermi;
* rohy (0–34 / 166–200, resp. 0–40 / 160–200 pre legendary) sa vykresľujú
  **nezväčšené** — detaily (nity, krídla) tam drž vo vnútri tejto zóny;
* okraje medzi rohmi sa naťahujú (`border-image-repeat: stretch`) — ideálne
  pre jednoduchý kamenný/kovový vzor, nie pre opakujúcu sa textúru;
* stred nechaj priehľadný.

## Herná plocha

* `board-texture.svg` — dlaždicovateľná kamenná textúra (220×220, bezošvá),
  vrstvená pod existujúce žiary v `.arena-bg` (`src/styles.css`). Zmenš/zväčš
  spolu s `background-size` v CSS, inak sa švy rozídu.
* `slot-alcove.svg` — vyhĺbený kamenný rám prázdneho/obsadeného slotu na
  ploche (`.slot-alcove`), rovnaká 9-slice technika ako rámy kariet
  (`viewBox 0 0 200 200`, slice 28).

## Portréty a menu

* `medallion.svg` — kruhový bronzový rámik prekrytý cez portrét v zozname
  postáv v Sieni Božstiev (`Codex.tsx`). Priehľadný stred a okolie — len
  dekoruje okraj kruhu.
* `ornament-corner.svg`, `ornament-divider.svg` — dekorácie hlavného menu
  (`App.tsx`).

Vetva/logo (`navia-logo.svg`, `navia-mark.svg`) je v `public/art/branding/` —
pozri tamojší README pre ikony a ich regeneráciu.

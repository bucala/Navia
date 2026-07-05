# Navia — branding

* `navia-logo.svg` — plné logo (kamenná tabuľka, zvieracie hlavy, ohnivý
  nápis „NAVIA“), použité v hlavnom menu (`src/App.tsx`). Čisté SVG,
  zobrazuje sa priamo v prehliadači bez rasterizácie.
* `navia-mark.svg` — zjednodušená štvorcová značka (runové „N“ na kamennej
  doske), základ pre favicon/app ikony a hlavičku (`src/App.tsx`).
  Je to aj `public/icon.svg` (kópia — pozri nižšie).
* `navia-mark-foreground.svg` — rovnaký glyf ako `navia-mark.svg`, ale bez
  kamenného pozadia (priehľadné), pre Android adaptívne ikony (foreground
  vrstva; pozadie dodáva `@color/ic_launcher_background`).

## Nahradenie loga

Priamy upload obrázka z chatu do repozitára nie je možný — preto je
súčasné logo vektorová rekonštrukcia podľa referenčného obrázka, nie
pixel-perfect kópia. Ak chceš nahradiť vlastným (rastrovým alebo
vektorovým) súborom:

1. Nahraď `navia-mark.svg` (a voliteľne `navia-mark-foreground.svg` bez
   pozadia) — najjednoduchšie je vlastný obrázok zabaliť do `<svg>` s
   `viewBox="0 0 512 512"` a `<image href="data:..." />`, alebo rovno
   nahradiť rastrovým PNG a upraviť `scripts/generate-icons.mjs`, aby čítal
   `.png` namiesto `.svg` (sharp zvládne oboje).
2. `npm run icons` — prerenderuje `public/icons/*.png` (favicon, PWA,
   maskable) aj Android `mipmap-*/ic_launcher*.png` vo všetkých hustotách.
3. `public/icon.svg` je ručná kópia `navia-mark.svg` (favicon cez
   `<link rel="icon" type="image/svg+xml">`) — skopíruj znova, ak meníš mark.

## Farby značky

Kamenná doska `#241b13`/`#2c2013` (rovnaká hodnota je aj
`android/app/src/main/res/values/ic_launcher_background.xml` pre adaptívne
ikony), ohnivý prechod `#ffe58a → #f6a723 → #c2410c`, bronz `#e8c07a →
#9c6b2e`.

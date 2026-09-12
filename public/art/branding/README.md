# Navia — branding

* `navia-logo.webp` — plné logo (kamenná tabuľka, zvieracie hlavy, ohnivý
  nápis „NAVIA“), použité v hlavnom menu (`src/App.tsx`). Maľované rastrové
  logo (~300 KB WebP) — ak ho nahrádzaš, exportuj nový obrázok cez sharp
  (`.resize({ width: 1200 }).webp({ quality: 85 })`) namiesto priameho
  uploadu veľkého PNG/SVG, aby zostal ľahký.
* `navia-mark.svg` — zjednodušená štvorcová značka (runové „N“ na kamennej
  doske), základ pre favicon/app ikony a hlavičku (`src/App.tsx`).
  Generátor ju kopíruje aj do `public/icon.svg`.
* `navia-mark-foreground.svg` — rovnaký glyf ako `navia-mark.svg`, ale bez
  kamenného pozadia (priehľadné), pre Android adaptívne ikony (foreground
  vrstva; pozadie dodáva `@color/ic_launcher_background`).
* Android splash je udržiavateľný XML drawable
  `android/app/src/main/res/drawable/navia_splash.xml`. Používa vygenerovanú
  launcher ikonu na tmavom kamennom pozadí; Android 12+ používa adaptívnu
  foreground vrstvu a rovnakú farbu pozadia cez `values/styles.xml`.

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
   Android splash tieto launcher výstupy preberie automaticky, samostatné
   splash PNG súbory sa negenerujú.
3. Generátor zároveň obnoví `public/icon.svg`, ktorý používa
   `<link rel="icon" type="image/svg+xml">`.

## Farby značky

Kamenná doska `#241b13`, tmavé splash pozadie `#120d08` (farba dosky je aj
`android/app/src/main/res/values/ic_launcher_background.xml` pre adaptívne
ikony), ohnivý prechod `#ffe58a → #f6a723 → #c2410c`, bronz `#e8c07a →
#9c6b2e`.

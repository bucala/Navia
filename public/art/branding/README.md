# Navia — branding

* `navia-logo.webp` — plné maľované logo so zvieracími hlavami a ohnivým
  nápisom „NAVIA“, použité v hlavnom menu (`src/App.tsx`). Je exportované
  zo zdrojového PNG na šírku 1200 px ako WebP s kvalitou 85.
* `../../icons/icon-512.png` — kanonický štvorcový erb s ohnivým „N“. Používa
  sa v hlavičke a ako zdroj všetkých favicon, PWA a Android ikon.
* Android splash je udržiavateľný XML drawable
  `android/app/src/main/res/drawable/navia_splash.xml`. Používa vygenerovanú
  launcher ikonu na tmavom kamennom pozadí; Android 12+ používa adaptívnu
  foreground vrstvu a rovnakú farbu pozadia cez `values/styles.xml`.

## Nahradenie loga a ikon

1. Plné logo optimalizuj cez sharp:
   `.resize({ width: 1200 }).webp({ quality: 85, alphaQuality: 100 })`
   a ulož ako `navia-logo.webp`.
2. Nahraď `public/icons/icon-512.png` štvorcovým PNG s priehľadnosťou.
3. Spusti `npm run icons`. Generátor vytvorí všetky menšie webové ikony,
   PWA maskable ikonu s nepriehľadným pozadím a bezpečným odsadením, aj
   Android launcher, okrúhle a adaptívne ikony vo všetkých hustotách.
   Android splash tieto launcher výstupy preberie automaticky; samostatné
   splash PNG súbory sa negenerujú.

## Farby značky

Kamenná doska `#241b13`, tmavé splash pozadie `#120d08` (farba dosky je aj
`android/app/src/main/res/values/ic_launcher_background.xml` pre adaptívne
ikony), ohnivá oranžová a tmavý bronz.

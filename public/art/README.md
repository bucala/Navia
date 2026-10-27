# Art kariet

> Rámy kariet/plochy a značka hry sú samostatne v [`frames/`](frames/README.md)
> a [`branding/`](branding/README.md) — tento README je len o postavičkách nižšie.

Finálne AI obrázky sú nasadené pre 13 postáv;
zvyšných 6 kariet používa vygenerované placeholder „astrálne erby" —
prepíš ich súbormi s rovnakým názvom (WebP, pomer na výšku 7:9, šírka 640 px)
a hra ich zobrazí automaticky.

## Dodané party (postavy z chatu)

| Súbor | Postava | Karta |
| --- | --- | --- |
| `wukong.webp` | Opičí kráľ so zlatou palicou a ohnivým drakom | Wukong, Opičí Kráľ |
| `gorila.webp` | Obrnený sivý opičí titan v zlatej zbroji | Mahákapi, Obrnený Titan |
| `khadga.webp` | Nosorožec so štítom pred chrámami Angkoru | Khadga, Štít Chrámu |
| `cuauhtli.webp` | Orlí bojovník s aztéckymi motívmi v ruinách | Cuauhtli, Orlí Rytier |
| `medvebor.webp` | Medvedí bojovník v slovanskej zbroji s kolovratom | Medvebor, Velesov Šampión |
| `mahisa.webp` | Byvolí bojovník s tyrkysmi pred chrámovými ruinami | Mahiša, Chrámový Býk |
| `chepri.webp` | Chrobačí bojovník so skarabejským pancierom v džungli | Chepri, Skarabejský Strážca |
| `rysoslav.webp` | Rysí šaman s runovou palicou medzi idolmi | Rysoslav, Žrec Perúna |
| `megadrak.webp` | Červený drak (art `c7deec0195a7d165ee970e497641b1f5.jpg`) | Megadrak |
| `bojovy_kohut.webp` | Bojový kohút s krídlami (art `552d16af...jpg`) | Bojový Kohút |
| `salamandra.webp` | Jašterí kováč s lávovými šupinami a kladivom vo výhni | Salamandra, Duch Výhne |
| `ohnivak.webp` | Ohnivý vták v zlatej zbroji nad slovanským hradiskom | Vták Ohnivák |
| `mesha.webp` | Baraní bojovník v plameňoch pred Agniho chrámom | Meša, Agniho Baran |

## Zvyšné karty (art sa doplní neskôr)

| Súbor | Karta |
| --- | --- |
| `papagaj.webp` | Papagáj |
| `zlaty_gryf.webp` | Zlatý Gryf |
| `pekelne_zaklinadlo.webp` | Pekelné zaklínadlo |
| `lavovy_skriatok.webp` | Lávový škriatok |
| `kamenny_strazca.webp` | Kamenný strážca |
| `nebesky_vrabec.webp` | Nebeský vrabec |

## Portréty (výrezy hláv)

`portraits/<cardId>.webp` sú štvorcové výrezy hláv (160 px) pre zoznam v
Sieni Božstiev. Generuje ich `npm run portraits` podľa tabuľky stredov hláv v
`scripts/generate-portraits.mjs` — pri novom arte tam doplň riadok
(`[súbor, stredX, stredY, veľkosť]` ako podiel rozmerov obrázka).

## Rub karty

`frames/card-back.svg` je jednotná zadná strana všetkých kariet (otáčanie v
ruke, súperova ruka, Sieň Božstiev).

Neskôr sa tieto súbory presunú do Cloudflare R2 (viď GDD §5.2).

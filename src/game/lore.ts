/**
 * Kódex — príbehy a kultúrne odkazy postáv pre Sieň Božstiev.
 *
 * Art files are expected under public/art/ (see public/art/README.md);
 * the codex falls back to the card glyph until they are added.
 */

export interface LoreEntry {
  cardId: string;
  /** Domovská mytológia / kultúrny odkaz. */
  culture: string;
  /** Príbeh postavy v aréne Pantheonu. */
  story: string;
}

export const LORE: LoreEntry[] = [
  {
    cardId: 'opici_kral',
    culture:
      'Čínska mytológia — Sun Wu-kchung, Opičí kráľ z klasického románu Cesta na západ (Wu Čcheng-en, 16. storočie). Nesmrteľný šibal, ktorý sa vzoprel samotnému Nebeskému cisárovi.',
    story:
      'Zrodil sa z kamenného vajca na Hore kvetov a ovocia a bleskovo si podmanil opičí národ. Od Dračieho kráľa Východného mora ukradol zlatú palicu Žu-i, čo váži osemtisíc kilogramov, a vymazal svoje meno z Knihy mŕtvych. V astrálnych arénach Pantheonu bojuje z čistej radosti — preskakuje medzi líniami rýchlejšie, než stihne súper zdvihnúť ruku, a jeho ohnivý drak mu krúži pri pätách ako verný tieň.',
  },
  {
    cardId: 'medvebor',
    culture:
      'Slovanská mytológia — medveď je posvätným zvieraťom boha Velesa, pána lesov, stád a podsvetia. Kolovrat na jeho hrudi je prastarý slnečný symbol ochrany.',
    story:
      'Keď volchvovia v zabudnutej svätyni prosili Velesa o ochrancu, z hlbín hory vyšiel medveď v železe, s runami vpálenými do kože a sekerou, ktorú nezdvihne desať mužov. Medvebor nehovorí — počúva. Stojí v prednom voji ako živý val a jeho rozťatie kolovratom dokáže jedným oblúkom zmiesť celú líniu útočníkov. Vraví sa, že kým Medvebor stojí, Veles sa na bojisko pozerá.',
  },
  {
    cardId: 'rysoslav',
    culture:
      'Slovanská mytológia — žrec bol pohanský kňaz starých Slovanov; Perún je hromovládny boh nebies a spravodlivosti, ktorého idoly stáli na posvätných vŕškoch.',
    story:
      'Rysoslav bol kedysi človekom — najvyšším žrecom Perúnovej svätyne nad riekou. Keď svätyňu vypálili, prosil hromovládcu o silu dokončiť obrady predkov. Perún mu dal telo rysa, oči, čo vidia cez hmlu sveta, a palicu s vtáčou lebkou, v ktorej spí blesk. V zadnej línii Sanctum kreslí runové kruhy a keď kocka padne správne, nebo nad arénou sčernie a Perúnov hnev udrie do každého nepriateľa naraz.',
  },
  {
    cardId: 'mahisa',
    culture:
      'Hinduistická mytológia — Mahišásura, byvolí démon, ktorého pýchu zlomila bohyňa Durga. Sviatok Navarátri dodnes oslavuje víťazstvo svetla nad jeho vzdorom.',
    story:
      'Po prehratej vojne s bohyňou blúdil zlomený byvolí obor svetom, kým nenašiel ruiny chrámu, ktorý kedysi sám zbúral. Namiesto pomsty ho začal strážiť. Mahiša dnes nosí tyrkysové kamene pokory na rohoch a do arén Pantheonu vstupuje, aby odčinil svoju pýchu — jeho splašený výpad však stále otriasa zemou ako v časoch, keď sa ho báli aj bohovia.',
  },
  {
    cardId: 'chepri',
    culture:
      'Staroegyptská mytológia — Cheprer (Chepri), boh so skarabeom namiesto tváre, ktorý každé ráno tlačí slnečný kotúč ponad obzor. Skarabeus je symbolom znovuzrodenia.',
    story:
      'V zelenom šere zabudnutého chrámu sa z tisícročnej chryzalidy vyliahol strážca s pancierom z čierneho smaragdu. Chepri si pamätá každé ráno sveta — a preto sa nebojí žiadnej noci. Jeho krovky odrazia sekeru aj kúzlo a keď sa zdá, že padne, obráti sa k slnku a jeho pancier sa znovuzrodí ako úsvit. Trpezlivý, tichý a nezničiteľný: presne taký, akého si predný voj žiada.',
  },
];

export function getLore(cardId: string): LoreEntry | undefined {
  return LORE.find((entry) => entry.cardId === cardId);
}

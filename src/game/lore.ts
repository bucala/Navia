/**
 * Kódex — príbehy a kultúrne odkazy postáv pre Sieň Božstiev.
 * Všetko dvojjazyčne (sk/en); art súbory patria do public/art/.
 */
import type { LocalizedText } from './types';

export interface LoreEntry {
  cardId: string;
  /** Domovská mytológia / kultúrny odkaz. */
  culture: LocalizedText;
  /** Príbeh postavy v aréne Pantheonu. */
  story: LocalizedText;
}

export const LORE: LoreEntry[] = [
  {
    cardId: 'opici_kral',
    culture: {
      sk: 'Čínska mytológia — Sun Wu-kchung, Opičí kráľ z klasického románu Cesta na západ (Wu Čcheng-en, 16. storočie). Nesmrteľný šibal, ktorý sa vzoprel samotnému Nebeskému cisárovi.',
      en: 'Chinese mythology — Sun Wukong, the Monkey King of the classic novel Journey to the West (Wu Cheng’en, 16th century). An immortal trickster who defied the Jade Emperor himself.',
    },
    story: {
      sk: 'Zrodil sa z kamenného vajca na Hore kvetov a ovocia a bleskovo si podmanil opičí národ. Od Dračieho kráľa Východného mora ukradol zlatú palicu Žu-i, čo váži osemtisíc kilogramov, a vymazal svoje meno z Knihy mŕtvych. V astrálnych arénach Pantheonu bojuje z čistej radosti — preskakuje medzi líniami rýchlejšie, než stihne súper zdvihnúť ruku, a jeho ohnivý drak mu krúži pri pätách ako verný tieň.',
      en: 'Born from a stone egg on the Mountain of Flowers and Fruit, he conquered the monkey nation in a heartbeat. From the Dragon King of the Eastern Sea he stole the golden staff Ruyi, eight thousand kilograms heavy, and struck his name from the Book of the Dead. In the astral arenas of the Pantheon he fights for pure joy — hopping between lanes faster than any foe can raise a hand, his fiery dragon circling his heels like a loyal shadow.',
    },
  },
  {
    cardId: 'medvebor',
    culture: {
      sk: 'Slovanská mytológia — medveď je posvätným zvieraťom boha Velesa, pána lesov, stád a podsvetia. Kolovrat na jeho hrudi je prastarý slnečný symbol ochrany.',
      en: 'Slavic mythology — the bear is the sacred beast of Veles, lord of forests, herds and the underworld. The kolovrat on his chest is an ancient solar symbol of protection.',
    },
    story: {
      sk: 'Keď volchvovia v zabudnutej svätyni prosili Velesa o ochrancu, z hlbín hory vyšiel medveď v železe, s runami vpálenými do kože a sekerou, ktorú nezdvihne desať mužov. Medvebor nehovorí — počúva. Stojí v prednom voji ako živý val a jeho rozťatie kolovratom dokáže jedným oblúkom zmiesť celú líniu útočníkov. Vraví sa, že kým Medvebor stojí, Veles sa na bojisko pozerá.',
      en: 'When the volkhvy of a forgotten shrine begged Veles for a protector, a bear clad in iron strode out of the mountain’s depths, runes seared into his hide and an axe ten men could not lift. Medvebor does not speak — he listens. He stands in the vanguard like a living rampart, and his kolovrat cleave can sweep a whole line of attackers in one arc. They say that as long as Medvebor stands, Veles is watching the battlefield.',
    },
  },
  {
    cardId: 'rysoslav',
    culture: {
      sk: 'Slovanská mytológia — žrec bol pohanský kňaz starých Slovanov; Perún je hromovládny boh nebies a spravodlivosti, ktorého idoly stáli na posvätných vŕškoch.',
      en: 'Slavic mythology — a zhrets was a pagan priest of the old Slavs; Perun is the thunder-wielding god of the heavens and justice, whose idols stood on sacred hills.',
    },
    story: {
      sk: 'Rysoslav bol kedysi človekom — najvyšším žrecom Perúnovej svätyne nad riekou. Keď svätyňu vypálili, prosil hromovládcu o silu dokončiť obrady predkov. Perún mu dal telo rysa, oči, čo vidia cez hmlu sveta, a palicu s vtáčou lebkou, v ktorej spí blesk. V zadnej línii Sanctum kreslí runové kruhy a keď kocka padne správne, nebo nad arénou sčernie a Perúnov hnev udrie do každého nepriateľa naraz.',
      en: 'Rysoslav was once a man — high priest of Perun’s shrine above the river. When the shrine was burned, he begged the thunder-lord for the strength to finish the rites of his ancestors. Perun gave him the body of a lynx, eyes that see through the world’s mist, and a bird-skull staff with a sleeping bolt inside. From the Sanctum he draws runic circles, and when the die lands true, the sky above the arena darkens and Perun’s wrath strikes every foe at once.',
    },
  },
  {
    cardId: 'mahisa',
    culture: {
      sk: 'Hinduistická mytológia — Mahišásura, byvolí démon, ktorého pýchu zlomila bohyňa Durga. Sviatok Navarátri dodnes oslavuje víťazstvo svetla nad jeho vzdorom.',
      en: 'Hindu mythology — Mahishasura, the buffalo demon whose pride was broken by the goddess Durga. The festival of Navaratri still celebrates the victory of light over his defiance.',
    },
    story: {
      sk: 'Po prehratej vojne s bohyňou blúdil zlomený byvolí obor svetom, kým nenašiel ruiny chrámu, ktorý kedysi sám zbúral. Namiesto pomsty ho začal strážiť. Mahiša dnes nosí tyrkysové kamene pokory na rohoch a do arén Pantheonu vstupuje, aby odčinil svoju pýchu — jeho splašený výpad však stále otriasa zemou ako v časoch, keď sa ho báli aj bohovia.',
      en: 'After losing his war against the goddess, the broken buffalo giant wandered the world until he found the ruins of a temple he had once torn down himself. Instead of revenge, he began to guard it. Mahisha now wears turquoise stones of humility on his horns and enters the Pantheon’s arenas to atone for his pride — yet his stampede still shakes the earth as it did when even gods feared him.',
    },
  },
  {
    cardId: 'chepri',
    culture: {
      sk: 'Staroegyptská mytológia — Cheprer (Chepri), boh so skarabeom namiesto tváre, ktorý každé ráno tlačí slnečný kotúč ponad obzor. Skarabeus je symbolom znovuzrodenia.',
      en: 'Ancient Egyptian mythology — Khepri, the god with a scarab for a face, who pushes the solar disc over the horizon every morning. The scarab is a symbol of rebirth.',
    },
    story: {
      sk: 'V zelenom šere zabudnutého chrámu sa z tisícročnej chryzalidy vyliahol strážca s pancierom z čierneho smaragdu. Chepri si pamätá každé ráno sveta — a preto sa nebojí žiadnej noci. Jeho krovky odrazia sekeru aj kúzlo a keď sa zdá, že padne, obráti sa k slnku a jeho pancier sa znovuzrodí ako úsvit. Trpezlivý, tichý a nezničiteľný: presne taký, akého si predný voj žiada.',
      en: 'In the green gloom of a forgotten temple, a guardian with a shell of black emerald hatched from a thousand-year chrysalis. Khepri remembers every morning the world has ever had — which is why no night frightens him. His wing-cases turn aside axe and spell alike, and when he seems about to fall, he turns to the sun and his shell is reborn like the dawn. Patient, silent, indestructible: exactly what a vanguard asks for.',
    },
  },
  {
    cardId: 'khadga',
    culture: {
      sk: 'Juhoázijská tradícia — khadga je sanskritské slovo pre nosorožca aj pre posvätný meč. Kamenné tváre za jeho chrbtom pripomínajú chrámy Angkoru, ktorých brány strážili zvieratá-ochrancovia.',
      en: 'South Asian tradition — khadga is the Sanskrit word for both the rhinoceros and a sacred sword. The stone faces behind him echo the temples of Angkor, whose gates were watched by animal guardians.',
    },
    story: {
      sk: 'Keď džungľa pohltila chrámové mesto, kňazi odliali posledný zvon do podoby štítu a vložili doň mená všetkých, čo mesto bránili. Štít si vybral svojho nositeľa sám: nosorožca, ktorý sto rokov spal pri bráne. Khadga odvtedy necúvol ani o krok. Neponáhľa sa, neútočí prvý — len dvíha runový val a čaká, kým sa oň rozbijú vlny nepriateľov ako rieka o kameň.',
      en: 'When the jungle swallowed the temple city, its priests recast the last bell into a shield and set within it the names of everyone who had defended the walls. The shield chose its own bearer: a rhinoceros that had slept by the gate for a hundred years. Khadga has not taken a single step back since. He does not hurry, he does not strike first — he simply raises the runic rampart and waits for the waves of enemies to break against him like a river against stone.',
    },
  },
  {
    cardId: 'cuauhtli',
    culture: {
      sk: 'Aztécka kultúra — cuāuhtli znamená v nahuatli „orol“. Orlí bojovníci (cuāuhpipiltin) boli elitou aztéckej armády a zasväcovali svoje víťazstvá slnečnému bohu Huitzilopochtlimu.',
      en: 'Aztec culture — cuāuhtli means “eagle” in Nahuatl. The eagle warriors (cuāuhpipiltin) were the elite of the Aztec army, dedicating their victories to the sun god Huitzilopochtli.',
    },
    story: {
      sk: 'Keď padlo posledné mesto jeho ľudu, najstarší orlí rytier vyniesol slnečný amulet na vrchol zrúcanej pyramídy a prosil oblohu, aby vojna jeho národa nebola zabudnutá. Slnko mu odpovedalo perím a pazúrmi. Cuauhtli teraz krúži nad arénami Pantheonu ako živá spomienka — a keď sa z výšky vrhne strmhlav, dopadne s váhou celého padlého impéria.',
      en: 'When the last city of his people fell, the eldest eagle knight carried the sun amulet to the top of a ruined pyramid and begged the sky that his nation’s war would not be forgotten. The sun answered him with feathers and talons. Cuauhtli now circles above the Pantheon’s arenas as a living memory — and when he dives, he lands with the weight of an entire fallen empire.',
    },
  },
  {
    cardId: 'gorila',
    culture: {
      sk: 'Budhistická a hinduistická tradícia — Mahákapi („Veľká opica“) je hrdina džátak, príbehov o minulých životoch Budhu: opičí kráľ, ktorý z vlastného tela spravil most, aby zachránil svoj kmeň. Zbroj odkazuje na thajské a khmérske stvárnenia Hanumana.',
      en: 'Buddhist and Hindu tradition — Mahakapi (“Great Monkey”) is a hero of the Jataka tales of the Buddha’s past lives: a monkey king who made a bridge of his own body to save his tribe. The armor echoes Thai and Khmer depictions of Hanuman.',
    },
    story: {
      sk: 'Legenda vraví, že keď jeho kmeň utekal pred lukostrelcami, natiahol sa ponad rieku a nechal tisíc opíc prebehnúť po vlastnom chrbte. Kosti mu vraj odvtedy spevneli na kameň. Mahákapi dnes stojí v prednom voji zaliaty do zlatého brnenia a dym z obetných ohňov sa mu vinie okolo pliec. Neútočí z hnevu — bráni. A keď hodí svoj defenzívny hod, osud mu z úcty ponúkne dve kocky.',
      en: 'Legend says that when his tribe fled the archers, he stretched himself across the river and let a thousand monkeys run over his own back. His bones, they say, have been hard as stone ever since. Mahakapi now stands in the vanguard cast in golden armor, the smoke of offering fires curling around his shoulders. He does not strike out of anger — he defends. And when he makes his defensive roll, fate offers him two dice out of respect.',
    },
  },
];

export function getLore(cardId: string): LoreEntry | undefined {
  return LORE.find((entry) => entry.cardId === cardId);
}

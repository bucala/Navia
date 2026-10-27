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
  {
    cardId: 'salamandra',
    culture: {
      sk: 'Európska alchýmia — Paracelsus (16. storočie) opísal salamandru ako elementála ohňa, bytosť, ktorá žije v plameňoch a nespáli sa. Kováči verili, že prebýva v srdci každej výhne.',
      en: 'European alchemy — Paracelsus (16th century) described the salamander as the elemental of fire, a creature that lives in flames without burning. Smiths believed one dwelt in the heart of every forge.',
    },
    story: {
      sk: 'Keď kováč Lávového dvora prvýkrát roztavil kameň z hory Pantheonu, z taveniny vyliezla jašterica s chvostom zo žeravého uhlia. Odvtedy neodišla. Salamandra nie je veľká ani mocná — ale kam sa dotkne, tam sa oheň chytí, a ten oheň už nikto neuhasí.',
      en: 'When a smith of the Lava Court first melted stone from the Pantheon mountain, a lizard with a tail of glowing coal crawled out of the melt. It never left. The Salamander is neither large nor mighty — but whatever it touches catches fire, and that fire no one can put out.',
    },
  },
  {
    cardId: 'ohnivak',
    culture: {
      sk: 'Slovanské rozprávky — Vták Ohnivák s perím, ktoré svieti ako slnko, je cieľom kráľovských synov v slovenských aj ruských rozprávkach (Žar-ptica). Jediné jeho pero dokáže rozžiariť celú komnatu.',
      en: 'Slavic folk tales — the Firebird, whose feathers shine like the sun, is the quarry of royal princes in Slovak and Russian tales (Zhar-ptitsa). A single feather can light an entire hall.',
    },
    story: {
      sk: 'Kradol zlaté jablká z kráľovskej záhrady, až kým ho najmladší kráľovič nechytil za chvost. Pero mu ostalo v ruke a vták odletel — rovno do astrálnych arén Pantheonu. Tam už nekradne. Preletí ponad predný voj a tam, kam padne jeho iskra, zostane horieť zadná línia nepriateľa.',
      en: 'It stole golden apples from the royal garden until the youngest prince caught it by the tail. A feather stayed in his hand and the bird flew off — straight into the astral arenas of the Pantheon. It steals no more. It soars over the vanguard, and wherever its spark falls, the enemy’s back line is left burning.',
    },
  },
  {
    cardId: 'mesha',
    culture: {
      sk: 'Hinduistická mytológia — Agni, boh ohňa a obetného plameňa, jazdí na baranovi (méša v sanskrte). Baran je jeho vahanou, posvätným nosičom, a symbolom obetnej sily.',
      en: 'Hindu mythology — Agni, god of fire and the sacrificial flame, rides a ram (mesha in Sanskrit). The ram is his vahana, his sacred mount, and a symbol of the offering’s power.',
    },
    story: {
      sk: 'Agni posiela do arény svojho barana vždy, keď obetný oheň horí príliš slabo. Meša nemá rohy z kosti, ale z rozžeraveného bronzu, a keď sa rozbehne, za ním ostáva brázda žiary. Jeho náraz neprerazí len jedného nepriateľa — plamene sa rozlejú po celej línii.',
      en: 'Agni sends his ram into the arena whenever the sacrificial fire burns too low. Mesha’s horns are not bone but glowing bronze, and when he charges, a furrow of embers trails behind him. His charge does not break just one foe — the flames spill along the whole line.',
    },
  },
  {
    cardId: 'megadrak',
    culture: {
      sk: 'Slovenské ľudové rozprávky — šarkan (drak) je odveký protivník hrdinov: stráži zakliate zámky a unesené princezné a jeho dych spaľuje celé kraje. Červený drak je zároveň starým symbolom ohňa a moci v mnohých kultúrach.',
      en: 'Slovak folk tales — the šarkan (dragon) is the heroes’ age-old foe: it guards enchanted castles and stolen princesses, and its breath burns whole lands. The red dragon is also an ancient symbol of fire and power in many cultures.',
    },
    story: {
      sk: 'Kým sa Lávový dvor naučil kovať oceľ, Megadrak už spal v srdci sopky a jeho chrápanie ohrievalo celé údolie. Prebudil ho až rinčot prvej bitky Pantheonu. Odvtedy útočí tam, kde je nepriateľ najhustejší: jeho oheň neuhasne, jeho kyselina rozožiera pancier a drobnú háveď, čo sa mu pletie pod nohy, ani nezaregistruje — jednoducho zmizne.',
      en: 'Before the Lava Court learned to forge steel, Megadrake already slept in the heart of the volcano, his snoring warming the whole valley. Only the clangour of the Pantheon’s first battle woke him. Since then he strikes where the enemy is thickest: his fire never goes out, his acid eats through armor, and the small vermin underfoot he does not even notice — they simply vanish.',
    },
  },
  {
    cardId: 'pekelne_zaklinadlo',
    culture: {
      sk: 'Európske stredoveké grimoáre — knihy ako Kľúč Šalamúnov (Clavicula Salomonis, 14.–15. storočie) opisovali magické kruhy, v ktorých sa zaklínač chránil pri vyvolávaní duchov. Legenda o doktorovi Faustovi pripomína, že každá taká zmluva má svoju cenu.',
      en: 'Medieval European grimoires — books such as the Key of Solomon (Clavicula Salomonis, 14th–15th century) described magic circles that shielded the conjurer while summoning spirits. The legend of Doctor Faustus is a reminder that every such pact has its price.',
    },
    story: {
      sk: 'Zaklínadlo vyryli do čadiča vyhnaní mágovia Lávového dvora a odvtedy ho nikto nedokázal vysloviť bez strachu. Ohnivý kruh poslúcha, kým ho živí odvaha — každá ďalšia vlna plameňa zasiahne nepriateľa a vráti trochu sily tomu, kto ju volá. No kto zatlačí osud príliš ďaleko, tomu sa oheň obráti proti vlastnému Nexusu.',
      en: 'Exiled mages of the Lava Court carved the incantation into basalt, and no one has spoken it without fear since. The circle of fire obeys as long as courage feeds it — each new wave of flame strikes the enemy and returns a little strength to the caller. But whoever pushes fate too far will find the fire turning on their own Nexus.',
    },
  },
  {
    cardId: 'lavovy_skriatok',
    culture: {
      sk: 'Japonský folklór — oni sú rohatí démoni s tesákmi, často s červenou (aka-oni) alebo modrou pleťou. Na sviatok Setsubun ich ľudia vyháňajú hádzaním fazule s pokrikom „Oni wa soto, fuku wa uči!“ — „Démoni von, šťastie dnu!“',
      en: 'Japanese folklore — oni are horned, tusked demons, often red-skinned (aka-oni) or blue. At the Setsubun festival people drive them out by throwing beans and shouting “Oni wa soto, fuku wa uchi!” — “Demons out, luck in!”',
    },
    story: {
      sk: 'Lávové škriatky sa liahnu z iskier, ktoré odletia z kováčskej výhne Lávového dvora. Žijú len chvíľu, ale každá z nich si zapamätá, ako sa zapaľuje. Hrnú sa do boja v kŕdľoch, s maskami vyškierenými od ucha k uchu, a kam sa dotknú, tam niečo začne horieť.',
      en: 'Lava imps hatch from the sparks that fly off the Lava Court’s forge. They live only a moment, but every one of them remembers how to set things alight. They swarm into battle with masks grinning from ear to ear, and wherever they touch, something starts to burn.',
    },
  },
  {
    cardId: 'kamenny_strazca',
    culture: {
      sk: 'Rapa Nui (Veľkonočný ostrov) — moai sú obrie kamenné sochy predkov, ktoré stoja na obradných plošinách ahu chrbtom k moru a hľadia na osady, ktoré chránia. Verilo sa, že nesú manu, posvätnú silu svojho rodu.',
      en: 'Rapa Nui (Easter Island) — moai are giant stone ancestor statues standing on ceremonial ahu platforms with their backs to the sea, gazing over the villages they protect. They were believed to carry mana, the sacred power of their lineage.',
    },
    story: {
      sk: 'Kamenný strážca nevie behať ani kričať. Jeho oči z modrého kryštálu sa rozsvietia len vtedy, keď sa k jeho ľudu blíži nepriateľ — a vtedy sa už nepohne z miesta. Je lacný, nenápadný a úplne nezlomný: prvá stena, o ktorú sa rozbije každý útok.',
      en: 'The Stone Warden cannot run or shout. His eyes of blue crystal light up only when an enemy approaches his people — and then he will not move from the spot. He is cheap, unassuming and utterly unbreakable: the first wall every attack shatters against.',
    },
  },
  {
    cardId: 'zlaty_gryf',
    culture: {
      sk: 'Grécka antika — Herodotos píše o grifoch, polo-orloch a polo-levoch, ktorí na ďalekom severe strážili zlato pred jednookými Arimaspmi. Grif sa stal symbolom bdelosti, ochrany a vznešenosti a dodnes zdobí erby.',
      en: 'Ancient Greece — Herodotus wrote of griffins, half eagle and half lion, guarding gold in the far north from the one-eyed Arimaspians. The griffin became a symbol of vigilance, protection and nobility and still adorns coats of arms today.',
    },
    story: {
      sk: 'Zlatý Gryf kedysi strážil poklady, no Pantheon mu ukázal, že najcennejší poklad stojí v prednom voji. Krúži nad bojiskom, a keď sa jeho zlaté krídla rozžiaria, rany obrancov sa zatiahnu a ich štíty zosilnejú. Neútočí prvý — dáva pozor, aby nikto z jeho línie nepadol zbytočne.',
      en: 'The Golden Gryphon once guarded treasure, but the Pantheon showed him that the most precious treasure stands in the vanguard. He circles above the battlefield, and when his golden wings blaze, the defenders’ wounds close and their shields grow stronger. He does not strike first — he makes sure no one in his line falls in vain.',
    },
  },
  {
    cardId: 'papagaj',
    culture: {
      sk: 'Mayská kultúra — šarlátový ara bol posvätným vtákom slnka. V meste Izamal uctievali boha K’inich K’ak’ Mo’, „ohnivého ara so slnečnou tvárou“, ktorý podľa legendy zostupoval z neba ako plameň a pohlcoval obety.',
      en: 'Maya culture — the scarlet macaw was a sacred bird of the sun. In the city of Izamal people worshipped K’inich K’ak’ Mo’, the “sun-faced fire macaw”, who according to legend descended from the sky as a flame to consume offerings.',
    },
    story: {
      sk: 'Papagáj je kňazom Nebeského zboru a jeho perie nesie všetky farby úsvitu. Z výšky Sanctumu spúšťa dážď žieravej rosy, ktorá rozožiera aj ten najpevnejší pancier. Hovorí sa, že jeho hod kockou nikdy nezlyhá — nie preto, že by mal šťastie, ale preto, že slnko vždy vyjde.',
      en: 'The Parrot is a priest of the Celestial Chorus, and his feathers carry every colour of dawn. From the heights of the Sanctum he lets fall a rain of caustic dew that eats through even the strongest armor. They say his roll of the dice never fails — not because he is lucky, but because the sun always rises.',
    },
  },
  {
    cardId: 'bojovy_kohut',
    culture: {
      sk: 'Európsky folklór — kohút ohlasuje úsvit, a podľa slovanských povier jeho kikiriki zaháňa nečisté sily, ktoré musia pred svitaním zmiznúť. Galský kohút je zasa symbolom Francúzska a odvahy.',
      en: 'European folklore — the rooster heralds the dawn, and Slavic belief holds that its crow drives away the unclean spirits, which must vanish before daybreak. The Gallic rooster is also a symbol of France and of courage.',
    },
    story: {
      sk: 'Bojový Kohút sa nikdy nevzdáva — naopak, čím viac rán utŕži, tým zúrivejšie bojuje. Keď ho súper zrazí na kolená, jeho výkrik prebudí celé bojisko a ďalší úder už takmer nemôže minúť. Jeho perie je ožltnuté od slnka a ostrohy má z kovu, ktorý ukul sám Lávový dvor.',
      en: 'The War Rooster never yields — on the contrary, the more wounds he takes, the more fiercely he fights. When a foe beats him to his knees, his cry wakes the whole battlefield and his next strike can hardly miss. His feathers are bleached gold by the sun, and his spurs are of metal forged by the Lava Court itself.',
    },
  },
  {
    cardId: 'nebesky_vrabec',
    culture: {
      sk: 'Hinduistická a budhistická tradícia — Garuda, zlatý vták a nosič boha Višnu, je vládcom všetkých vtákov a nepriateľom hadov. Je štátnym znakom Thajska aj Indonézie; podoba Nebeského vrabca z neho vychádza.',
      en: 'Hindu and Buddhist tradition — Garuda, the golden bird and mount of the god Vishnu, is king of all birds and enemy of serpents. He is the national emblem of both Thailand and Indonesia; the Sky Sparrow’s form draws on him.',
    },
    story: {
      sk: 'Najmenší z Garudovho rodu nedostal meno po otcovi, ale podľa vrabcov, s ktorými ako mláďa lietal nad chrámovými strechami. Nebeský zbor ho posiela ako prvého: je rýchly, ťažko zasiahnuteľný a z výšky vidí, kde má nepriateľ slabé miesto. Nie je to hrdina z legiend — zatiaľ.',
      en: 'The smallest of Garuda’s kin was named not after his father but after the sparrows he flew with over temple roofs as a fledgling. The Celestial Chorus sends him first: he is quick, hard to hit, and from on high he sees where the enemy is weak. He is no hero of legend — not yet.',
    },
  },
];

export function getLore(cardId: string): LoreEntry | undefined {
  return LORE.find((entry) => entry.cardId === cardId);
}

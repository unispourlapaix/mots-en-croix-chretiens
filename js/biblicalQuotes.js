// Base de données de citations bibliques inspirantes
// Organisées par thème de niveau du jeu

const biblicalQuotes = {
    // Thème: Fondations de la Foi (Niveaux 1-10)
    foundations: [
        {
            text: "Je suis la lumière du monde; celui qui me suit ne marchera pas dans les ténèbres",
            ref: "Jean 8:12",
            theme: "Lumière"
        },
        {
            text: "L'amour est patient, l'amour est plein de bonté",
            ref: "1 Corinthiens 13:4",
            theme: "Amour"
        },
        {
            text: "Heureux ceux qui procurent la paix, car ils seront appelés fils de Dieu",
            ref: "Matthieu 5:9",
            theme: "Paix"
        },
        {
            text: "La foi est une ferme assurance des choses qu'on espère",
            ref: "Hébreux 11:1",
            theme: "Foi"
        },
        {
            text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique",
            ref: "Jean 3:16",
            theme: "Vie"
        },
        {
            text: "L'espérance ne trompe point, car l'amour de Dieu est répandu dans nos cœurs",
            ref: "Romains 5:5",
            theme: "Espérance"
        },
        {
            text: "La grâce de Dieu, source de salut pour tous les hommes, a été manifestée",
            ref: "Tite 2:11",
            theme: "Grâce"
        },
        {
            text: "Priez sans cesse, rendez grâces en toutes choses",
            ref: "1 Thessaloniciens 5:17-18",
            theme: "Prière"
        },
        {
            text: "Car la parole de Dieu est vivante et efficace",
            ref: "Hébreux 4:12",
            theme: "Parole"
        },
        {
            text: "Heureux ceux qui ont le cœur pur, car ils verront Dieu",
            ref: "Matthieu 5:8",
            theme: "Pureté"
        }
    ],

    // Thème: Croissance Spirituelle (Niveaux 11-20)
    growth: [
        {
            text: "Comme des enfants nouveau-nés, désirez le lait spirituel et pur",
            ref: "1 Pierre 2:2",
            theme: "Croissance"
        },
        {
            text: "L'Éternel est mon berger: je ne manquerai de rien",
            ref: "Psaume 23:1",
            theme: "Providence"
        },
        {
            text: "Je vous exhorte à marcher d'une manière digne de la vocation qui vous a été adressée",
            ref: "Éphésiens 4:1",
            theme: "Vocation"
        },
        {
            text: "Persévérez dans la prière, veillez-y avec actions de grâces",
            ref: "Colossiens 4:2",
            theme: "Persévérance"
        },
        {
            text: "Affermissez-vous dans la grâce qui est en Jésus-Christ",
            ref: "2 Timothée 2:1",
            theme: "Affermissement"
        },
        {
            text: "Laissez-vous transformer par le renouvellement de l'intelligence",
            ref: "Romains 12:2",
            theme: "Renouvellement"
        },
        {
            text: "Le fruit de l'Esprit, c'est l'amour, la joie, la paix",
            ref: "Galates 5:22",
            theme: "Fruit"
        },
        {
            text: "Vous êtes le sel de la terre, vous êtes la lumière du monde",
            ref: "Matthieu 5:13-14",
            theme: "Témoignage"
        },
        {
            text: "Fortifiez-vous dans le Seigneur et par sa force toute-puissante",
            ref: "Éphésiens 6:10",
            theme: "Force"
        },
        {
            text: "Croissez dans la grâce et dans la connaissance de notre Seigneur",
            ref: "2 Pierre 3:18",
            theme: "Connaissance"
        }
    ],

    // Thème: Épreuves et Restauration (Niveaux 21-35)
    restoration: [
        {
            text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos",
            ref: "Matthieu 11:28",
            theme: "Repos"
        },
        {
            text: "L'Éternel est près de ceux qui ont le cœur brisé",
            ref: "Psaume 34:19",
            theme: "Réconfort"
        },
        {
            text: "Il guérit ceux qui ont le cœur brisé, et il panse leurs blessures",
            ref: "Psaume 147:3",
            theme: "Guérison"
        },
        {
            text: "Ne crains rien, car je suis avec toi",
            ref: "Ésaïe 41:10",
            theme: "Courage"
        },
        {
            text: "Je vous donnerai un cœur nouveau, et je mettrai en vous un esprit nouveau",
            ref: "Ézéchiel 36:26",
            theme: "Nouveau Cœur"
        },
        {
            text: "Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner",
            ref: "1 Jean 1:9",
            theme: "Pardon"
        },
        {
            text: "Il y a de la joie devant les anges de Dieu pour un seul pécheur qui se repent",
            ref: "Luc 15:10",
            theme: "Repentance"
        },
        {
            text: "Là où le péché a abondé, la grâce a surabondé",
            ref: "Romains 5:20",
            theme: "Grâce"
        },
        {
            text: "Si quelqu'un est en Christ, il est une nouvelle créature",
            ref: "2 Corinthiens 5:17",
            theme: "Renouveau"
        },
        {
            text: "Car je connais les projets que j'ai formés sur vous, projets de paix et non de malheur",
            ref: "Jérémie 29:11",
            theme: "Espoir"
        },
        {
            text: "L'Éternel, ton Dieu, est au milieu de toi, un héros qui sauve",
            ref: "Sophonie 3:17",
            theme: "Salut"
        },
        {
            text: "Je ne te condamne pas; va, et ne pèche plus",
            ref: "Jean 8:11",
            theme: "Miséricorde"
        },
        {
            text: "Celui qui cache ses transgressions ne prospère point, mais celui qui les avoue trouve miséricorde",
            ref: "Proverbes 28:13",
            theme: "Transparence"
        },
        {
            text: "Dieu veut que tous les hommes soient sauvés et parviennent à la connaissance de la vérité",
            ref: "1 Timothée 2:4",
            theme: "Vérité"
        },
        {
            text: "L'amour couvre une multitude de péchés",
            ref: "1 Pierre 4:8",
            theme: "Amour"
        }
    ],

    // Thème: Transformation (Niveaux 36-50)
    transformation: [
        {
            text: "Voici, je fais toutes choses nouvelles",
            ref: "Apocalypse 21:5",
            theme: "Nouveauté"
        },
        {
            text: "Revêtez-vous de l'homme nouveau, créé selon Dieu dans une justice et une sainteté",
            ref: "Éphésiens 4:24",
            theme: "Homme Nouveau"
        },
        {
            text: "Vous avez été régénérés par une semence incorruptible, par la parole vivante de Dieu",
            ref: "1 Pierre 1:23",
            theme: "Régénération"
        },
        {
            text: "Ne vous conformez pas au siècle présent",
            ref: "Romains 12:2",
            theme: "Différence"
        },
        {
            text: "Tu me feras connaître le sentier de la vie",
            ref: "Psaume 16:11",
            theme: "Chemin"
        },
        {
            text: "L'Éternel affermit les pas de l'homme",
            ref: "Psaume 37:23",
            theme: "Direction"
        },
        {
            text: "Je vous ai appelés par votre nom, vous êtes à moi",
            ref: "Ésaïe 43:1",
            theme: "Identité"
        },
        {
            text: "Quiconque invoquera le nom du Seigneur sera sauvé",
            ref: "Romains 10:13",
            theme: "Salut"
        },
        {
            text: "L'Éternel restaure mon âme, il me conduit dans les sentiers de la justice",
            ref: "Psaume 23:3",
            theme: "Restauration"
        },
        {
            text: "Dieu nettoie ton cœur et te rend pur",
            ref: "Psaume 51:12",
            theme: "Purification"
        },
        {
            text: "Renouvelle en moi un esprit bien disposé",
            ref: "Psaume 51:12",
            theme: "Renouvellement"
        },
        {
            text: "C'est lui qui pardonne toutes tes iniquités, qui guérit toutes tes maladies",
            ref: "Psaume 103:3",
            theme: "Guérison"
        },
        {
            text: "Je t'instruirai et te montrerai la voie que tu dois suivre",
            ref: "Psaume 32:8",
            theme: "Guidance"
        },
        {
            text: "L'Éternel te conduira continuellement",
            ref: "Ésaïe 58:11",
            theme: "Conduite"
        },
        {
            text: "Celui qui est en vous est plus grand que celui qui est dans le monde",
            ref: "1 Jean 4:4",
            theme: "Victoire"
        }
    ],

    // Thème: Vie Chrétienne Pratique (Niveaux 51-65)
    practice: [
        {
            text: "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur",
            ref: "Colossiens 3:23",
            theme: "Travail"
        },
        {
            text: "Que votre parole soit toujours accompagnée de grâce",
            ref: "Colossiens 4:6",
            theme: "Paroles"
        },
        {
            text: "Soyez bons les uns envers les autres, compatissants",
            ref: "Éphésiens 4:32",
            theme: "Bonté"
        },
        {
            text: "Portez les fardeaux les uns des autres",
            ref: "Galates 6:2",
            theme: "Solidarité"
        },
        {
            text: "Aimez-vous les uns les autres d'un amour fraternel",
            ref: "Romains 12:10",
            theme: "Fraternité"
        },
        {
            text: "Pardonnez-vous réciproquement, comme Dieu vous a pardonné en Christ",
            ref: "Éphésiens 4:32",
            theme: "Pardon"
        },
        {
            text: "Réjouissez-vous avec ceux qui se réjouissent; pleurez avec ceux qui pleurent",
            ref: "Romains 12:15",
            theme: "Empathie"
        },
        {
            text: "Que la paix de Christ règne dans vos cœurs",
            ref: "Colossiens 3:15",
            theme: "Paix"
        },
        {
            text: "Ne rendez à personne le mal pour le mal",
            ref: "Romains 12:17",
            theme: "Bien"
        },
        {
            text: "Recherchez ce qui contribue à la paix et à l'édification mutuelle",
            ref: "Romains 14:19",
            theme: "Édification"
        },
        {
            text: "Soyez toujours joyeux, priez sans cesse, rendez grâces en toutes choses",
            ref: "1 Thessaloniciens 5:16-18",
            theme: "Joie"
        },
        {
            text: "Que l'amour soit sans hypocrisie",
            ref: "Romains 12:9",
            theme: "Sincérité"
        },
        {
            text: "Ayez en vous les sentiments qui étaient en Jésus-Christ",
            ref: "Philippiens 2:5",
            theme: "Humilité"
        },
        {
            text: "Faites tout sans murmures ni hésitations",
            ref: "Philippiens 2:14",
            theme: "Obéissance"
        },
        {
            text: "Soyez les imitateurs de Dieu, comme des enfants bien-aimés",
            ref: "Éphésiens 5:1",
            theme: "Imitation"
        }
    ],

    // Thème: Sainteté et Amour (Niveaux 66-77)
    holiness: [
        {
            text: "Vous serez saints, car je suis saint",
            ref: "1 Pierre 1:16",
            theme: "Sainteté"
        },
        {
            text: "Recherchez la paix avec tous, et la sanctification",
            ref: "Hébreux 12:14",
            theme: "Sanctification"
        },
        {
            text: "Dieu nous a appelés à la sanctification",
            ref: "1 Thessaloniciens 4:7",
            theme: "Appel"
        },
        {
            text: "Soyez parfaits, comme votre Père céleste est parfait",
            ref: "Matthieu 5:48",
            theme: "Perfection"
        },
        {
            text: "Dieu est amour; et celui qui demeure dans l'amour demeure en Dieu",
            ref: "1 Jean 4:16",
            theme: "Amour"
        },
        {
            text: "Aimons, non pas en paroles et avec la langue, mais en actions et avec vérité",
            ref: "1 Jean 3:18",
            theme: "Action"
        },
        {
            text: "Tu aimeras ton prochain comme toi-même",
            ref: "Matthieu 22:39",
            theme: "Prochain"
        },
        {
            text: "Aimez vos ennemis, bénissez ceux qui vous maudissent",
            ref: "Matthieu 5:44",
            theme: "Ennemis"
        },
        {
            text: "L'amour ne périt jamais",
            ref: "1 Corinthiens 13:8",
            theme: "Éternité"
        },
        {
            text: "Demeurez dans mon amour",
            ref: "Jean 15:9",
            theme: "Demeurer"
        },
        {
            text: "À ceci tous connaîtront que vous êtes mes disciples, si vous avez de l'amour",
            ref: "Jean 13:35",
            theme: "Disciples"
        },
        {
            text: "Marchez dans l'amour, comme Christ nous a aimés",
            ref: "Éphésiens 5:2",
            theme: "Marche"
        }
    ],

    // Citations pour les niveaux BONUS
    bonus: [
        {
            text: "Il n'y a plus ni Juif ni Grec, ni esclave ni libre, ni homme ni femme; car tous vous êtes un en Jésus-Christ",
            ref: "Galates 3:28",
            theme: "Unité"
        },
        {
            text: "Dieu ne fait point de favoritisme",
            ref: "Actes 10:34",
            theme: "Égalité"
        },
        {
            text: "Il a fait d'un seul sang toutes les nations",
            ref: "Actes 17:26",
            theme: "Humanité"
        },
        {
            text: "Où que vous soyez deux ou trois assemblés en mon nom, je suis au milieu de vous",
            ref: "Matthieu 18:20",
            theme: "Présence"
        },
        {
            text: "Rendez à César ce qui est à César, et à Dieu ce qui est à Dieu",
            ref: "Matthieu 22:21",
            theme: "Justice"
        },
        {
            text: "J'étais étranger, et vous m'avez recueilli",
            ref: "Matthieu 25:35",
            theme: "Hospitalité"
        },
        {
            text: "Tu aimeras l'étranger; car vous avez été étrangers dans le pays d'Égypte",
            ref: "Deutéronome 10:19",
            theme: "Étranger"
        },
        {
            text: "La terre est à l'Éternel et tout ce qu'elle renferme",
            ref: "Psaume 24:1",
            theme: "Création"
        },
        {
            text: "Louez l'Éternel, vous toutes les nations, célébrez-le, vous tous les peuples",
            ref: "Psaume 117:1",
            theme: "Louange"
        }
    ]
};

// Fonction pour obtenir une citation selon le niveau
function getQuoteForLevel(levelNumber) {
    let category, index;

    // Niveaux BONUS (vérifier d'abord)
    if (levelNumber > 77 || levelNumber === 0) {
        const bonusIndex = Math.abs(levelNumber - 77) % biblicalQuotes.bonus.length;
        return biblicalQuotes.bonus[bonusIndex];
    }

    // Niveaux réguliers
    if (levelNumber <= 10) {
        category = biblicalQuotes.foundations;
        index = (levelNumber - 1) % category.length;
    } else if (levelNumber <= 20) {
        category = biblicalQuotes.growth;
        index = (levelNumber - 11) % category.length;
    } else if (levelNumber <= 35) {
        category = biblicalQuotes.restoration;
        index = (levelNumber - 21) % category.length;
    } else if (levelNumber <= 50) {
        category = biblicalQuotes.transformation;
        index = (levelNumber - 36) % category.length;
    } else if (levelNumber <= 65) {
        category = biblicalQuotes.practice;
        index = (levelNumber - 51) % category.length;
    } else {
        category = biblicalQuotes.holiness;
        index = (levelNumber - 66) % category.length;
    }

    return category[index];
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { biblicalQuotes, getQuoteForLevel };
}

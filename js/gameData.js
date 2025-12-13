// Données du jeu - Niveaux et mots
const gameData = {
    fr: {
        levels: [
            {
                // Niveau 1 - Introduction avec mots en croix (grille 10x10)
                words: [
                    {
                        word: "JESUS",
                        clue: "Lumière qui guide nos pas dans l'obscurité de la vie",
                        path: [[1,3], [2,3], [3,3], [3,4], [3,5]], // Mot coudé en L
                        direction: "bent"
                    },
                    {
                        word: "AMOUR",
                        clue: "Force divine qui transforme les cœurs et unit les âmes",
                        path: [[4,0], [4,1], [4,2], [4,3], [4,4]], // Horizontal
                        direction: "horizontal"
                    },
                    {
                        word: "PAIX",
                        clue: "Sérénité profonde qui apaise l'âme tourmentée",
                        path: [[6,2], [6,3], [7,3], [8,3]], // Coudé en L inversé
                        direction: "bent"
                    },
                    {
                        word: "FOI",
                        clue: "Confiance qui illumine le chemin de l'espoir",
                        path: [[2,6], [2,7], [2,8]], // Horizontal
                        direction: "horizontal"
                    },
                    {
                        word: "VIE",
                        clue: "Don précieux qui fleurit dans l'amour éternel",
                        path: [[6,7], [7,7], [8,7]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // Niveau 2 - Vertus chrétiennes avec croix complexes (grille 10x10)
                words: [
                    {
                        word: "ESPERANCE",
                        clue: "Lumière qui brille même dans la nuit la plus sombre",
                        path: [[0,2], [1,2], [2,2], [2,3], [2,4], [2,5], [3,5], [4,5], [5,5]], // Coudé en escalier
                        direction: "bent"
                    },
                    {
                        word: "GRACE",
                        clue: "Cadeau immérité qui élève l'âme vers la beauté",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PRIERE",
                        clue: "Dialogue du cœur qui ouvre les portes du ciel",
                        path: [[7,1], [7,2], [7,3], [8,3], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "AMOUR",
                        clue: "Essence divine qui brise les chaînes et libère l'esprit",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4]], // Horizontal
                        direction: "horizontal"
                    },
                    {
                        word: "FOI",
                        clue: "Ancre de l'âme dans la tempête de l'existence",
                        path: [[0,7], [1,7], [2,7]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // Niveau 3 - Mystères de la foi (grille 10x10)
                words: [
                    {
                        word: "ETERNITE",
                        clue: "Océan sans rivages où l'amour ne s'éteint jamais",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "GLOIRE",
                        clue: "Splendeur rayonnante qui révèle la beauté divine",
                        path: [[3,0], [3,1], [3,2], [3,3], [3,4], [3,5]], // Horizontal croisant ETERNITE
                        direction: "horizontal"
                    },
                    {
                        word: "SAINT",
                        clue: "Cœur purifié qui reflète la lumière céleste",
                        path: [[4,6], [5,6], [6,6], [7,6], [8,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "CIEL",
                        clue: "Demeure d'espoir où toute larme sera séchée",
                        path: [[1,7], [2,7], [3,7], [4,7]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ANGE",
                        clue: "Messager de tendresse qui veille sur nos chemins",
                        path: [[8,0], [8,1], [8,2], [8,3]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Niveau 4 - Œuvres divines (grille 10x10)
                words: [
                    {
                        word: "MIRACLE",
                        clue: "Œuvre de l'amour qui transforme l'impossible en espoir",
                        path: [[1,3], [2,3], [3,3], [3,4], [3,5], [3,6], [3,7]], // Coudé en L
                        direction: "bent"
                    },
                    {
                        word: "PROPHETE",
                        clue: "Voix de sagesse qui éveille les âmes endormies",
                        path: [[0,0], [1,0], [2,0], [3,0], [4,0], [5,0], [6,0], [7,0]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "GUERISON",
                        clue: "Restauration douce des corps et des cœurs brisés",
                        path: [[5,2], [5,3], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "FORCE",
                        clue: "Courage qui naît dans l'âme quand l'amour habite",
                        path: [[1,8], [2,8], [3,8], [4,8], [5,8]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // Niveau 5 - Qualités spirituelles (grille 10x10)
                words: [
                    {
                        word: "SAGESSE",
                        clue: "Lumière intérieure qui guide vers la vérité du cœur",
                        path: [[2,1], [2,2], [2,3], [3,3], [4,3], [5,3], [6,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "PATIENCE",
                        clue: "Art de cultiver l'espoir dans les saisons d'attente",
                        path: [[4,5], [5,5], [6,5], [6,6], [6,7], [6,8], [7,8], [8,8]], // Coudé en escalier
                        direction: "bent"
                    },
                    {
                        word: "HUMILITE",
                        clue: "Grandeur de l'âme qui s'abaisse pour s'élever",
                        path: [[0,6], [1,6], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "COURAGE",
                        clue: "Force de l'esprit qui transforme la peur en victoire",
                        path: [[8,0], [8,1], [8,2], [8,3], [8,4], [8,5], [8,6]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Niveau 6 - Processus spirituels (grille 10x10)
                words: [
                    {
                        word: "COMMUNION",
                        clue: "Union sacrée où deux cœurs ne font qu'un dans l'amour",
                        path: [[1,1], [1,2], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "REPENTANCE",
                        clue: "Retour vers la lumière qui libère et renouvelle",
                        path: [[2,5], [2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7]], // Coudé en L
                        direction: "bent"
                    },
                    {
                        word: "ADOPTION",
                        clue: "Don d'appartenance qui fait de nous une famille aimée",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4], [5,5], [5,6], [5,7]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Niveau 7 - Attributs de Dieu (grille 10x10)
                words: [
                    {
                        word: "PROVIDENCE",
                        clue: "Tendresse infinie qui veille sur chaque instant de vie",
                        path: [[0,2], [1,2], [2,2], [2,3], [2,4], [2,5], [2,6], [2,7], [2,8], [3,8]], // Coudé complexe
                        direction: "bent"
                    },
                    {
                        word: "JUSTICE",
                        clue: "Équilibre parfait qui restaure et guérit avec amour",
                        path: [[4,1], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "MAJESTE",
                        clue: "Beauté sublime qui inspire respect et émerveillement",
                        path: [[5,5], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // Niveau 8 - Doctrines avancées (grille 10x10) - Défi final!
                words: [
                    {
                        word: "EXALTATION",
                        clue: "Élévation de l'âme vers les sommets de l'amour divin",
                        path: [[0,3], [0,4], [0,5], [1,5], [2,5], [3,5], [4,5], [5,5], [6,5], [7,5]], // Coudé en croix
                        direction: "bent"
                    },
                    {
                        word: "REDEMPTION",
                        clue: "Libération qui transforme nos chaînes en ailes d'espoir",
                        path: [[2,0], [2,1], [2,2], [2,3], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "REVELATION",
                        clue: "Dévoilement des mystères qui illuminent notre destinée",
                        path: [[4,6], [4,7], [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]], // Coudé en U
                        direction: "bent"
                    }
                ]
            },
            {
                // Niveau 9 - Fruits de l'Esprit (grille 10x10)
                words: [
                    {
                        word: "GENEROSITE",
                        clue: "Partage qui multiplie la joie et enrichit les cœurs",
                        path: [[0,1], [1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "BONTE",
                        clue: "Douceur de l'âme qui embrasse tous avec tendresse",
                        path: [[3,3], [3,4], [3,5], [3,6], [3,7]], // Horizontal
                        direction: "horizontal"
                    },
                    {
                        word: "JOIE",
                        clue: "Flamme intérieure qui brille même dans l'adversité",
                        path: [[5,5], [6,5], [7,5], [8,5]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PAIX",
                        clue: "Havre de sérénité au milieu des tempêtes",
                        path: [[1,8], [2,8], [3,8], [4,8]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // Niveau 10 - Promesses divines (grille 10x10)
                words: [
                    {
                        word: "DELIVRANCE",
                        clue: "Liberté qui brise toutes les chaînes de l'oppression",
                        path: [[1,0], [1,1], [1,2], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "VICTOIRE",
                        clue: "Triomphe de l'amour sur toutes les ténèbres",
                        path: [[3,5], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "RESTAURATION",
                        clue: "Renouveau qui fait toutes choses nouvelles et belles",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3], [9,2]], // Coudé en L
                        direction: "bent"
                    }
                ]
            },
            {
                // Niveau 11 - Vertus cardinales (grille 10x10)
                words: [
                    {
                        word: "TEMPERANCE",
                        clue: "Équilibre sage qui cultive l'harmonie intérieure",
                        path: [[0,3], [1,3], [2,3], [3,3], [4,3], [4,4], [4,5], [4,6], [4,7], [4,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "PRUDENCE",
                        clue: "Discernement qui éclaire les choix avec sagesse",
                        path: [[2,0], [2,1], [2,2], [2,3], [3,3], [4,3], [5,3], [6,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "VERITE",
                        clue: "Lumière qui révèle la réalité dans sa pureté",
                        path: [[6,5], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // Niveau 12 - Dons spirituels (grille 10x10)
                words: [
                    {
                        word: "DISCERNEMENT",
                        clue: "Vision spirituelle qui distingue la vérité de l'illusion",
                        path: [[0,2], [0,3], [0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "COMPASSION",
                        clue: "Empathie profonde qui partage la souffrance d'autrui",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "ESPERANCE",
                        clue: "Certitude vivante d'un avenir radieux dans l'amour",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4], [6,4], [7,4], [8,4], [9,4]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // Niveau 13 - Paroles de vie (grille 10x10)
                words: [
                    {
                        word: "PARDON",
                        clue: "Grâce qui libère et guérit toutes les blessures",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "MISERICORDE",
                        clue: "Tendresse infinie qui accueille sans condition",
                        path: [[3,4], [3,5], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8]], // Coudé complexe
                        direction: "bent"
                    },
                    {
                        word: "CHARITE",
                        clue: "Amour en action qui transforme le monde",
                        path: [[0,7], [1,7], [2,7], [3,7], [4,7], [5,7], [6,7]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "LOUANGE",
                        clue: "Chant de gratitude qui monte vers les cieux",
                        path: [[7,0], [7,1], [7,2], [7,3], [7,4], [7,5], [7,6]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Niveau 14 - Chemin spirituel (grille 10x10)
                words: [
                    {
                        word: "TRANSFORMATION",
                        clue: "Métamorphose divine qui fait naître une créature nouvelle",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [9,4], [9,5]], // Coudé complexe
                        direction: "bent"
                    },
                    {
                        word: "PERSEVERANCE",
                        clue: "Force tranquille qui ne renonce jamais à l'espoir",
                        path: [[2,6], [2,7], [2,8], [3,8], [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]], // Coudé en U
                        direction: "bent"
                    }
                ]
            },
            {
                // Niveau 15 - Lumière et ténèbres (grille 10x10)
                words: [
                    {
                        word: "LUMIERE",
                        clue: "Clarté divine qui dissipe toutes les ombres",
                        path: [[2,1], [2,2], [2,3], [2,4], [2,5], [2,6], [2,7]], // Horizontal
                        direction: "horizontal"
                    },
                    {
                        word: "DELIVRANCE",
                        clue: "Salut qui ouvre les portes de la liberté éternelle",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PURETE",
                        clue: "Innocence retrouvée qui reflète la beauté originelle",
                        path: [[4,6], [5,6], [6,6], [7,6], [8,6], [9,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "CONSOLATION",
                        clue: "Réconfort qui sèche les larmes et apaise les douleurs",
                        path: [[6,0], [6,1], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4], [9,5], [9,6], [9,7]], // Coudé complexe
                        direction: "bent"
                    }
                ]
            },
            {
                // Niveau 16 - Fidélité et engagement (grille 10x10)
                words: [
                    {
                        word: "FIDELITE",
                        clue: "Constance du cœur qui traverse toutes les saisons",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ALLIANCE",
                        clue: "Promesse sacrée qui unit les âmes pour l'éternité",
                        path: [[3,4], [3,5], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "CONSECRATION",
                        clue: "Don total de soi qui reflète l'amour absolu",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3], [9,2], [9,1]], // Coudé en L
                        direction: "bent"
                    },
                    {
                        word: "DEVOTION",
                        clue: "Attachement du cœur qui nourrit la flamme spirituelle",
                        path: [[0,5], [1,5], [2,5], [3,5], [4,5], [5,5], [6,5], [7,5]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // Niveau 17 - Richesses spirituelles (grille 10x10)
                words: [
                    {
                        word: "BENEDICTION",
                        clue: "Faveur céleste qui enrichit l'âme de grâces infinies",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3]], // Vertical avec coude
                        direction: "bent"
                    },
                    {
                        word: "ABONDANCE",
                        clue: "Plénitude divine qui comble au-delà de toute mesure",
                        path: [[2,5], [2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "HERITAGE",
                        clue: "Trésor éternel transmis aux enfants de lumière",
                        path: [[5,0], [5,1], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // Niveau 18 - Protection divine (grille 10x10)
                words: [
                    {
                        word: "REFUGE",
                        clue: "Abri sacré où l'âme trouve repos et sécurité",
                        path: [[2,2], [3,2], [4,2], [5,2], [6,2], [7,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "FORTERESSE",
                        clue: "Rempart inébranlable qui protège des tempêtes",
                        path: [[1,4], [1,5], [1,6], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "BOUCLIER",
                        clue: "Défense céleste qui détourne tout mal",
                        path: [[3,8], [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "SECURITE",
                        clue: "Confiance paisible en la providence divine",
                        path: [[8,0], [8,1], [8,2], [8,3], [8,4], [8,5], [8,6], [8,7]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Niveau 19 - Renouveau (grille 10x10)
                words: [
                    {
                        word: "RENAISSANCE",
                        clue: "Nouveau départ qui fait fleurir l'espoir éternel",
                        path: [[0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "REGENERATION",
                        clue: "Transformation profonde qui restaure la vie originelle",
                        path: [[2,5], [2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,6], [9,5]], // Coudé en U
                        direction: "bent"
                    },
                    {
                        word: "ESPOIR",
                        clue: "Lumière qui ne s'éteint jamais dans le cœur aimant",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4], [5,5]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Niveau 20 - Gloire finale (grille 10x10) - Défi ultime!
                words: [
                    {
                        word: "RESURRECTION",
                        clue: "Victoire éclatante de la vie sur la mort éternelle",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "GLORIFICATION",
                        clue: "Élévation suprême vers la plénitude de l'amour divin",
                        path: [[2,5], [2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,6], [9,5], [9,4]], // Coudé complexe
                        direction: "bent"
                    },
                    {
                        word: "PLENITUDE",
                        clue: "Accomplissement parfait de toutes les promesses célestes",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU BONUS 1 - Grâce divine (grille 10x10)
                words: [
                    {
                        word: "GRACE",
                        clue: "Don céleste qui embellit nos vies de bienveillance",
                        path: [[2,3], [3,3], [4,3], [5,3], [6,3]], // Vertical
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "TOLERANCE",
                        clue: "Acceptation bienveillante qui unit dans la différence",
                        path: [[3,5], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8]], // Coudé
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "BIENVEILLANCE",
                        clue: "Regard aimant qui voit le meilleur en chacun",
                        path: [[1,0], [1,1], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,1], [9,0]], // Coudé complexe
                        direction: "bent",
                        bonus: true
                    }
                ],
                bonusWords: ["GRACE", "TOLERANCE", "BIENVEILLANCE"]
            },
            {
                // NIVEAU BONUS 2 - Amour universel (grille 10x10)
                words: [
                    {
                        word: "MISERICORDE",
                        clue: "Pardon infini qui embrasse toutes les fragilités humaines",
                        path: [[0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [9,4], [9,5]], // Coudé en L
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "COMPASSION",
                        clue: "Cœur qui ressent la peine d'autrui comme la sienne",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]], // Coudé
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "TENDRESSE",
                        clue: "Douceur qui enveloppe et réchauffe les âmes",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]], // Coudé
                        direction: "bent",
                        bonus: true
                    }
                ],
                bonusWords: ["MISERICORDE", "COMPASSION", "TENDRESSE"]
            },
            {
                // NIVEAU BONUS 3 - Fraternité (grille 10x10)
                words: [
                    {
                        word: "FRATERNITE",
                        clue: "Lien sacré qui fait de tous les humains une seule famille",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Vertical
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "SOLIDARITE",
                        clue: "Force collective qui soulève et soutient chacun",
                        path: [[2,4], [2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "PARTAGE",
                        clue: "Geste qui multiplie la joie en la divisant",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]], // Coudé en L
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "UNITE",
                        clue: "Harmonie qui naît de la diversité réconciliée",
                        path: [[1,5], [2,5], [3,5], [4,5], [5,5]], // Vertical
                        direction: "vertical",
                        bonus: true
                    }
                ],
                bonusWords: ["FRATERNITE", "SOLIDARITE", "PARTAGE", "UNITE"]
            },
            {
                // NIVEAU BONUS 4 - Vaincre la division (grille 10x10)
                words: [
                    {
                        word: "RECONCILIATION",
                        clue: "Pont qui unit ce que la haine a séparé",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4], [9,5]], // Coudé en L
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "ACCEPTATION",
                        clue: "Accueil de la différence qui enrichit nos vies",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8], [9,9]], // Coudé
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "GUERISON",
                        clue: "Restauration des cœurs brisés par la discorde",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2]], // Coudé
                        direction: "bent",
                        bonus: true
                    }
                ],
                bonusWords: ["RECONCILIATION", "ACCEPTATION", "GUERISON"]
            },
            {
                // NIVEAU BONUS 5 - Lumière contre les ténèbres (grille 10x10)
                words: [
                    {
                        word: "VERITE",
                        clue: "Clarté qui dissipe les ombres du mensonge",
                        path: [[2,2], [3,2], [4,2], [5,2], [6,2], [7,2]], // Vertical
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "HUMILITE",
                        clue: "Antidote à l'orgueil qui aveugle l'âme",
                        path: [[3,4], [3,5], [4,5], [5,5], [6,5], [7,5], [8,5], [9,5]], // Coudé
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "GENEROSITE",
                        clue: "Générosité qui brise les chaînes de l'avarice",
                        path: [[1,7], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]], // Coudé
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "PAIX",
                        clue: "Harmonie qui éteint les flammes de la guerre",
                        path: [[0,5], [1,5], [2,5], [3,5]], // Vertical
                        direction: "vertical",
                        bonus: true
                    }
                ],
                bonusWords: ["VERITE", "HUMILITE", "GENEROSITE", "PAIX"]
            },
            {
                // NIVEAU BONUS 6 - Amour universel contre la haine (grille 10x10)
                words: [
                    {
                        word: "INCLUSION",
                        clue: "Dieu aime tous ses enfants sans exception ni rejet",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Vertical
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "RESPECT",
                        clue: "Dignité de chaque personne créée à l'image divine",
                        path: [[3,4], [3,5], [4,5], [5,5], [6,5], [7,5], [8,5]], // Coudé
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "EGALITE",
                        clue: "Justice contre racisme homophobie et toute discrimination",
                        path: [[2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7]], // Vertical
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "AMOUR",
                        clue: "Dieu est amour pour tous exemple :il n'est pas homophobe",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4]], // Horizontal
                        direction: "horizontal",
                        bonus: true
                    }
                ],
                bonusWords: ["INCLUSION", "RESPECT", "EGALITE", "AMOUR"]
            },
            {
                // NIVEAU BONUS 7 - Justice et Vérité (grille 10x10)
                words: [
                    {
                        word: "SINCERITE",
                        clue: "Authenticité qui démasque le mensonge",
                        path: [[1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3]], // Vertical
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "JUGEMENT",
                        clue: "Discernement juste libre de condamnation",
                        path: [[3,5], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]], // Coudé
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "TRANSPARENCE",
                        clue: "Clarté qui brise les masques de l'hypocrisie",
                        path: [[2,8], [2,9], [3,9], [4,9], [5,9], [6,9], [7,9], [8,9], [9,9], [9,8], [9,7], [9,6]], // Coudé complexe
                        direction: "bent",
                        bonus: true
                    }
                ],
                bonusWords: ["SINCERITE", "JUGEMENT", "TRANSPARENCE"]
            },
            {
                // NIVEAU BONUS 8 - Reconstruction (grille 10x10)
                words: [
                    {
                        word: "RESTAURATION",
                        clue: "Renouvellement qui répare ce que la haine a détruit",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4]], // Coudé
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "PARDON",
                        clue: "Libération qui brise le cycle de la vengeance",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6]], // Vertical
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "RENAISSANCE",
                        clue: "Nouveau départ qui efface la dissolution",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3]], // Coudé en L
                        direction: "bent",
                        bonus: true
                    }
                ],
                bonusWords: ["RESTAURATION", "PARDON", "RENAISSANCE"]
            },
            {
                // NIVEAU BONUS 9 - Accueil de l'étranger et des migrants (grille 10x10)
                words: [
                    {
                        word: "HOSPITALITE",
                        clue: "Accueillir l'étranger comme Jésus lui-même",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3]], // Coudé
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "ETRANGER",
                        clue: "Celui qui vient d'ailleurs et mérite notre accueil",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]], // Coudé
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "REFUGE",
                        clue: "Protection offerte aux migrants et réfugiés",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7]], // Coudé
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "ACCUEIL",
                        clue: "Dieu n'est pas anti-migrant il accueille tous",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2]], // Coudé
                        direction: "bent",
                        bonus: true
                    }
                ],
                bonusWords: ["HOSPITALITE", "ETRANGER", "REFUGE", "ACCUEIL"]
            },
            {
                // NIVEAU 29 - Grâce pour tous (grille 10x10)
                words: [
                    {
                        word: "REDEMPTION",
                        clue: "Salut offert même au meurtrier qui se repent",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "GRACE",
                        clue: "Don gratuit qui accueille le voleur repentant",
                        path: [[3,4], [4,4], [5,4], [6,4], [7,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PARDON",
                        clue: "Miséricorde qui libère le menteur de ses chaînes",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "AMOUR",
                        clue: "Dieu aime même ceux que le monde rejette",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // NIVEAU 30 - Transformation du cœur criminel (grille 10x10)
                words: [
                    {
                        word: "CHANGEMENT",
                        clue: "Dieu transforme le meurtrier en messager d'amour",
                        path: [[0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "NOUVELLEVIE",
                        clue: "Renaissance offerte au criminel repenti",
                        path: [[2,5], [2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "ESPOIR",
                        clue: "Avenir possible même pour le pire des pécheurs",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4], [5,5]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // NIVEAU 31 - Appel universel à la grâce (grille 10x10)
                words: [
                    {
                        word: "INVITATION",
                        clue: "Dieu appelle le voleur à revenir vers lui",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ACCUEIL",
                        clue: "Bras ouverts même pour le criminel endurci",
                        path: [[3,4], [3,5], [4,5], [5,5], [6,5], [7,5], [8,5]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "MISERICORDE",
                        clue: "Compassion qui embrasse le menteur repentant",
                        path: [[1,7], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8], [9,9]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "AMOUR",
                        clue: "Dieu n'abandonne personne à son passé",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // NIVEAU 32 - Restauration du meurtrier (grille 10x10)
                words: [
                    {
                        word: "REHABILITATION",
                        clue: "Dieu reconstruit celui qui a pris une vie",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [9,4]], // Coudé complexe
                        direction: "bent"
                    },
                    {
                        word: "DIGNITE",
                        clue: "Valeur restaurée même après le pire crime",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "NOUVELLE",
                        clue: "Identité renouvelée par la grâce divine",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 33 - Pardon pour le menteur (grille 10x10)
                words: [
                    {
                        word: "VERITE",
                        clue: "Arrête de mentir, choisis la vérité maintenant",
                        path: [[2,2], [3,2], [4,2], [5,2], [6,2], [7,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "SINCERITE",
                        clue: "Parle vrai désormais, Dieu t'aide à changer",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PURIFICATION",
                        clue: "Renonce au mensonge avec l'aide de Dieu",
                        path: [[3,6], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8], [9,9], [9,6], [9,5]], // Coudé complexe
                        direction: "bent"
                    },
                    {
                        word: "GRACE",
                        clue: "Dieu pardonne et te donne la force de changer",
                        path: [[0,5], [1,5], [2,5], [3,5], [4,5]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // NIVEAU 34 - Miséricorde pour le voleur (grille 10x10)
                words: [
                    {
                        word: "RESTITUTION",
                        clue: "Dieu aide le voleur à réparer et à renaître",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "GENEROSITE",
                        clue: "Transformation du voleur en donneur généreux",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "PARDON",
                        clue: "Grâce qui libère celui qui a dérobé",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "AMOUR",
                        clue: "Dieu voit au-delà du vol et aime la personne",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // NIVEAU 35 - Amour inconditionnel (grille 10x10)
                words: [
                    {
                        word: "INCONDITIONNEL",
                        clue: "Amour de Dieu sans limite pour tous les pécheurs",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [9,4], [9,5]], // Coudé complexe
                        direction: "bent"
                    },
                    {
                        word: "ACCEPTANCE",
                        clue: "Dieu t'accueille pour te transformer, pas te laisser ainsi",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "GRACE",
                        clue: "Pardon gratuit qui t'appelle à vivre autrement",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // NIVEAU 36 - Seconde chance divine (grille 10x10)
                words: [
                    {
                        word: "RECOMMENCEMENT",
                        clue: "Nouveau départ offert au meurtrier qui pleure",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4], [9,5]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "OCCASION",
                        clue: "Opportunité divine pour le criminel repentant",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "ESPERANCE",
                        clue: "Avenir radieux même après le pire passé",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 37 - Personne n'est trop loin (grille 10x10)
                words: [
                    {
                        word: "AUCUNLIMITE",
                        clue: "Grâce de Dieu atteint même le plus perdu",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "RECHERCHE",
                        clue: "Dieu poursuit le meurtrier pour le sauver",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "COMPASSION",
                        clue: "Cœur de Dieu brisé pour le criminel perdu",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "AMOUR",
                        clue: "Dieu aime le pécheur tout en haïssant le péché",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // NIVEAU 38 - Victoire de la grâce (grille 10x10)
                words: [
                    {
                        word: "TRIOMPHE",
                        clue: "Victoire de l'amour sur le passé criminel",
                        path: [[2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "TRANSFORMATION",
                        clue: "Métamorphose du meurtrier en témoin d'amour",
                        path: [[0,4], [0,5], [1,5], [2,5], [3,5], [4,5], [5,5], [6,5], [7,5], [8,5], [9,5], [9,6], [9,7], [9,8]], // Coudé complexe
                        direction: "bent"
                    },
                    {
                        word: "DELIVRANCE",
                        clue: "Libération totale même pour le pire criminel",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "GRACE",
                        clue: "Don final qui sauve tous ceux qui se repentent",
                        path: [[1,7], [2,7], [3,7], [4,7], [5,7]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // NIVEAU 39 - Transformation par le changement (grille 10x10)
                words: [
                    {
                        word: "METAMORPHOSE",
                        clue: "Changement profond qui révèle notre vraie nature",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "EVOLUTION",
                        clue: "Croissance progressive vers la plénitude",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "NOUVEAUTE",
                        clue: "Fraîcheur divine dans chaque transformation",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "RENOUVEAU",
                        clue: "Printemps de l'âme qui embrasse le changement",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4], [6,4], [7,4], [8,4], [9,4]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 40 - Accepter le changement (grille 10x10)
                words: [
                    {
                        word: "ACCEPTATION",
                        clue: "Sagesse d'embrasser ce qui doit changer",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "LACHERPRISE",
                        clue: "Libération de l'ancien pour accueillir le nouveau",
                        path: [[2,5], [2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8], [9,9]], // Coudé complexe
                        direction: "bent"
                    },
                    {
                        word: "CONFIANCE",
                        clue: "Foi qui guide à travers les changements",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "COURAGE",
                        clue: "Force nécessaire pour oser changer",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // NIVEAU 41 - Changement intérieur (grille 10x10)
                words: [
                    {
                        word: "INTROSPECTION",
                        clue: "Regard profond qui révèle où changer",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "MEDITATION",
                        clue: "Silence où germe la transformation",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "CONSCIENCE",
                        clue: "Éveil intérieur qui précède tout changement",
                        path: [[5,0], [5,1], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "VOLONTE",
                        clue: "Décision ferme d'embrasser la transformation",
                        path: [[1,5], [2,5], [3,5], [4,5], [5,5], [6,5], [7,5]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // NIVEAU 42 - Courage du changement (grille 10x10)
                words: [
                    {
                        word: "AUDACE",
                        clue: "Hardiesse de quitter l'ancien pour le nouveau",
                        path: [[2,2], [3,2], [4,2], [5,2], [6,2], [7,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "DETERMINATION",
                        clue: "Résolution ferme face à la résistance au changement",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "RESILIENCE",
                        clue: "Force de rebondir dans chaque transition",
                        path: [[1,8], [2,8], [3,8], [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "BRAVOURE",
                        clue: "Valeur qui affronte l'inconnu avec espoir",
                        path: [[5,0], [5,1], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 43 - Renouveau constant (grille 10x10)
                words: [
                    {
                        word: "PERPETUEL",
                        clue: "Changement continu de l'âme en croissance",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "DYNAMISME",
                        clue: "Énergie vivante qui embrasse chaque transition",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ADAPTATION",
                        clue: "Flexibilité qui danse avec les saisons de vie",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "CROISSANCE",
                        clue: "Expansion infinie de l'esprit transformé",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "VIE",
                        clue: "Essence même du changement perpétuel",
                        path: [[6,5], [7,5], [8,5]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // NIVEAU 44 - Brisement du cœur (grille 10x10)
                words: [
                    {
                        word: "BRISEMENT",
                        clue: "Cœur brisé qui s'ouvre à la transformation divine",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "HUMILIATION",
                        clue: "Abaissement qui prépare l'élévation spirituelle",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "CONTRITION",
                        clue: "Regret profond qui ouvre à la grâce rédemptrice",
                        path: [[2,7], [2,8], [3,8], [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "ABANDON",
                        clue: "Lâcher-prise total qui précède le renouveau",
                        path: [[5,0], [5,1], [6,1], [7,1], [8,1], [9,1], [9,2]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 45 - Renouvellement de l'esprit (grille 10x10)
                words: [
                    {
                        word: "RENOUVELLEMENT",
                        clue: "Restauration totale de l'être intérieur",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4], [9,5], [9,6]], // Coudé complexe
                        direction: "bent"
                    },
                    {
                        word: "REGENERATION",
                        clue: "Naissance nouvelle par la grâce transformatrice",
                        path: [[2,7], [2,8], [3,8], [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5]], // Coudé en U
                        direction: "bent"
                    },
                    {
                        word: "FRAICHEUR",
                        clue: "Nouveauté divine qui rafraîchit l'âme avec douceur",
                        path: [[5,0], [5,1], [6,1], [7,1], [8,1], [9,1], [9,2], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 46 - Recommencer après la chute (grille 10x10)
                words: [
                    {
                        word: "RELEVEMENT",
                        clue: "Se relever avec force et dignité retrouvée",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "RECOMMENCEMENT",
                        clue: "Nouveau départ offert après chaque chute",
                        path: [[2,4], [2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8], [9,9]], // Coudé complexe
                        direction: "bent"
                    },
                    {
                        word: "REDEMARRE",
                        clue: "Capacité divine de repartir à zéro",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 47 - Reconstruction après destruction (grille 10x10)
                words: [
                    {
                        word: "RECONSTRUCTION",
                        clue: "Édification nouvelle sur les ruines du passé",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "REBATIR",
                        clue: "Reconstruire avec espoir et confiance renouvelée",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "REFONDATION",
                        clue: "Nouvelles bases solides pour un nouveau départ",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "ESPOIR",
                        clue: "Lumière qui guide la reconstruction",
                        path: [[1,5], [2,5], [3,5], [4,5], [5,5], [6,5]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // NIVEAU 48 - Nettoyage spirituel et renouveau (grille 10x10)
                words: [
                    {
                        word: "PURIFICATION",
                        clue: "Dieu nettoie ton cœur et te rend pur",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "RAFFINEMENT",
                        clue: "Dieu te fait grandir et révèle ta vraie beauté",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "RENOUVEAU",
                        clue: "Tout peut recommencer à neuf avec Dieu",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "LUMIERE",
                        clue: "La lumière de Dieu montre le bon chemin",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // NIVEAU 49 - Restauration divine (grille 10x10)
                words: [
                    {
                        word: "RESTAURATION",
                        clue: "Dieu restaure et renouvelle avec tendresse",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "REPARATION",
                        clue: "Guérison des blessures profondes de l'âme",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "REINTEGRATION",
                        clue: "Retour à la plénitude après la fragmentation",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5], [9,6], [9,7]], // Coudé long
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 50 - Renaissance après mort (grille 10x10)
                words: [
                    {
                        word: "RESURRECTION",
                        clue: "Vie nouvelle qui jaillit de la mort du vieil homme",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "RENAISSANCE",
                        clue: "Naître à nouveau après le brisement total",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "REVEIL",
                        clue: "Éveil spirituel après le sommeil de la mort",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "VIE",
                        clue: "Souffle divin qui ranime les cendres",
                        path: [[6,0], [7,0], [8,0]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // NIVEAU 51 - Nouveau commencement (grille 10x10)
                words: [
                    {
                        word: "INAUGURATION",
                        clue: "Début solennel d'une nouvelle saison",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "NOUVEAUTE",
                        clue: "Fraîcheur divine d'un nouveau chapitre",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "COMMENCEMENT",
                        clue: "Premier pas dans une existence renouvelée",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3], [9,2]], // Coudé en L
                        direction: "bent"
                    },
                    {
                        word: "AUBE",
                        clue: "Lumière joyeuse d'un nouveau jour qui commence",
                        path: [[5,0], [6,0], [7,0], [8,0]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // NIVEAU 52 - Guérison des blessures (grille 10x10)
                words: [
                    {
                        word: "GUERISON",
                        clue: "Restauration douce et complète de l'être",
                        path: [[2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "CICATRISATION",
                        clue: "Processus lent de fermeture des plaies profondes",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "PANSEMENT",
                        clue: "Soin divin sur les blessures du cœur",
                        path: [[1,8], [2,8], [3,8], [4,8], [5,8], [6,8], [7,8], [8,8], [9,8]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "SOIN",
                        clue: "Attention tendre de Dieu pour les brisés",
                        path: [[5,0], [6,0], [7,0], [8,0]], // Vertical
                        direction: "vertical"
                    }
                ]
            },
            {
                // NIVEAU 53 - Espérance du recommencement (grille 10x10)
                words: [
                    {
                        word: "ESPERANCE",
                        clue: "Confiance que tout peut recommencer",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PROMESSE",
                        clue: "Engagement divin de faire toutes choses nouvelles",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "AVENIR",
                        clue: "Futur lumineux rempli d'espoir et de promesses",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "RESTAURATION",
                        clue: "Certitude que Dieu restaure tout",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3], [9,2]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "JOIE",
                        clue: "Bonheur retrouvé après les larmes",
                        path: [[8,0], [8,1], [8,2], [8,3]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // NIVEAU 54 - Lâcher prise (grille 10x10)
                words: [
                    {
                        word: "LACHERPRISE",
                        clue: "Abandonner le contrôle pour accueillir la grâce",
                        path: [[0,1], [1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1], [9,2]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "CONFIANCE",
                        clue: "Foi qui remplace la peur du lâcher-prise",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ABANDON",
                        clue: "Se remettre entièrement entre les mains divines",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "LIBERTE",
                        clue: "Résultat du lâcher-prise authentique",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 55 - Briser les chaînes (grille 10x10)
                words: [
                    {
                        word: "CHAINES",
                        clue: "Liens qui nous emprisonnent et doivent être brisés",
                        path: [[1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "BRISER",
                        clue: "Action de destruction libératrice des entraves",
                        path: [[0,3], [1,3], [2,3], [3,3], [4,3], [5,3]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "DELIVRANCE",
                        clue: "Libération totale des liens qui retiennent",
                        path: [[3,5], [4,5], [5,5], [6,5], [7,5], [8,5], [9,5], [9,6], [9,7], [9,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "PUISSANCE",
                        clue: "Force divine qui brise toute chaîne",
                        path: [[5,7], [6,7], [7,7], [8,7], [9,7], [9,6], [9,5], [9,4], [9,3]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "LIBRE",
                        clue: "État après la rupture des chaînes",
                        path: [[2,9], [3,9], [4,9], [5,9], [6,9]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // NIVEAU 56 - Libération (grille 10x10)
                words: [
                    {
                        word: "LIBERATION",
                        clue: "Sortie de la captivité vers la vie nouvelle",
                        path: [[1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1], [9,2]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "RELEASE",
                        clue: "Relâcher ce qui nous retenait captifs",
                        path: [[0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "AFFRANCHISSEMENT",
                        clue: "Émancipation totale de toute servitude",
                        path: [[2,5], [3,5], [4,5], [5,5], [6,5], [7,5], [8,5], [9,5], [9,6], [9,7], [9,8], [8,8], [7,8], [6,8], [5,8], [4,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "SORTIE",
                        clue: "Passage de l'esclavage à la liberté",
                        path: [[4,7], [5,7], [6,7], [7,7], [8,7], [9,7]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // NIVEAU 57 - Avancer sans regarder en arrière (grille 10x10)
                words: [
                    {
                        word: "AVANCER",
                        clue: "Marcher vers l'avenir sans se retourner",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "REGARDENAVANT",
                        clue: "Fixer les yeux sur ce qui est devant",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "OUBLI",
                        clue: "Laisser derrière ce qui est passé",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PROGRESSION",
                        clue: "Mouvement constant vers l'avant",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3], [9,2]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "FUTUR",
                        clue: "Direction du regard libéré du passé",
                        path: [[7,0], [7,1], [7,2], [7,3], [7,4]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // NIVEAU 58 - Bouger dans la foi (grille 10x10)
                words: [
                    {
                        word: "BOUGER",
                        clue: "Se mettre en mouvement par la foi",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "MOUVEMENT",
                        clue: "Action qui brise la stagnation",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "DYNAMISME",
                        clue: "Énergie qui propulse vers l'avant",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "ACTION",
                        clue: "Manifestation concrète du mouvement",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ELAN",
                        clue: "Impulsion qui met en marche",
                        path: [[7,0], [7,1], [8,1], [9,1]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 59 - Détachement (grille 10x10)
                words: [
                    {
                        word: "DETACHEMENT",
                        clue: "Séparation d'avec ce qui entrave la liberté",
                        path: [[0,1], [1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1], [9,2]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "SEPARATION",
                        clue: "Rupture nécessaire avec l'ancien",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "RENONCEMENT",
                        clue: "Abandon volontaire de ce qui retient",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8], [8,8], [7,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "LACHER",
                        clue: "Desserrer la prise sur le passé",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 60 - Rupture des liens (grille 10x10)
                words: [
                    {
                        word: "RUPTURE",
                        clue: "Cassure libératrice des attachements toxiques",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "LIENS",
                        clue: "Attachements qui doivent être coupés",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "COUPE",
                        clue: "Action tranchante qui libère",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "EMANCIPATION",
                        clue: "Affranchissement de tout lien contraignant",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3], [9,2]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "INDEPENDANCE",
                        clue: "État de celui qui a rompu les chaînes",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 61 - Marcher vers l'avant (grille 10x10)
                words: [
                    {
                        word: "MARCHER",
                        clue: "Avancer pas à pas vers la promesse",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PERSEVERANCE",
                        clue: "Continue même quand le chemin est difficile",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5], [9,6]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "TENACITE",
                        clue: "Détermination à ne pas reculer",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "ROUTE",
                        clue: "Chemin qui mène loin du passé",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8]], // Horizontal
                        direction: "horizontal"
                    },
                    {
                        word: "AVANT",
                        clue: "Direction unique du regard libéré",
                        path: [[7,0], [7,1], [8,1], [9,1], [9,2]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 62 - Laisser partir (grille 10x10)
                words: [
                    {
                        word: "LAISSERPARTIR",
                        clue: "Permettre au passé de s'envoler",
                        path: [[0,1], [1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1], [9,2], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "PARDON",
                        clue: "Libération de soi en libérant l'autre",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ACCEPTATION",
                        clue: "Accueillir que certaines choses doivent partir",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8], [8,8], [7,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "PAIX",
                        clue: "Tranquillité après avoir lâché prise",
                        path: [[5,8], [6,8], [7,8], [8,8]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // NIVEAU 63 - Liberté nouvelle (grille 10x10)
                words: [
                    {
                        word: "LIBERTE",
                        clue: "État glorieux de celui qui a tout lâché",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "NOUVELLE",
                        clue: "Fraîche comme un recommencement",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "VICTOIRE",
                        clue: "Triomphe sur les chaînes du passé",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ENVOL",
                        clue: "S'élever libéré de tout poids",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8]], // Horizontal
                        direction: "horizontal"
                    },
                    {
                        word: "RENAISSANCE",
                        clue: "Vie nouvelle après avoir brisé les chaînes",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 64 - Armure de Dieu : Ceinture de la vérité (grille 10x10)
                words: [
                    {
                        word: "CEINTURE",
                        clue: "Première pièce de l'armure qui maintient tout ensemble",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "VERITE",
                        clue: "Ce qui ceint les reins du guerrier spirituel",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "INTEGRITE",
                        clue: "Qualité de celui qui marche dans la vérité",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "SINCERITE",
                        clue: "Authenticité qui soutient toute l'armure",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "HONNETE",
                        clue: "Caractère de celui qui porte la ceinture",
                        path: [[7,0], [7,1], [8,1], [9,1], [9,2], [9,3], [9,4]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 65 - Armure de Dieu : Cuirasse de la justice (grille 10x10)
                words: [
                    {
                        word: "CUIRASSE",
                        clue: "Protection du cœur dans le combat spirituel",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "JUSTICE",
                        clue: "Droiture qui protège le cœur du croyant",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "DROITURE",
                        clue: "Rectitude morale qui blinde l'âme",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "PURETE",
                        clue: "Intégrité qui fortifie le cœur",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8]], // Horizontal
                        direction: "horizontal"
                    },
                    {
                        word: "SAINTETE",
                        clue: "Consécration qui renforce la protection",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 66 - Armure de Dieu : Chaussures de l'évangile (grille 10x10)
                words: [
                    {
                        word: "CHAUSSURES",
                        clue: "Équipement des pieds pour annoncer la bonne nouvelle",
                        path: [[0,1], [1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "EVANGILE",
                        clue: "Bonne nouvelle de paix que nous portons",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PAIX",
                        clue: "Message que portent nos pas",
                        path: [[3,6], [4,6], [5,6], [6,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PROCLAMATION",
                        clue: "Action de celui qui a chaussé l'évangile",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3], [9,2]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "PREPARATION",
                        clue: "État de celui prêt à marcher pour Christ",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5], [9,6]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 67 - Armure de Dieu : Bouclier de la foi (grille 10x10)
                words: [
                    {
                        word: "BOUCLIER",
                        clue: "Protection mobile contre les flèches enflammées",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "FOI",
                        clue: "Confiance qui éteint les traits du malin",
                        path: [[0,4], [1,4], [2,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "CONFIANCE",
                        clue: "Assurance qui repousse les attaques",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "PROTECTION",
                        clue: "Défense que procure la foi solide",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "VICTOIRE",
                        clue: "Issue du combat avec le bouclier levé",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 68 - Armure de Dieu : Casque du salut (grille 10x10)
                words: [
                    {
                        word: "CASQUE",
                        clue: "Protection de la tête et des pensées",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "SALUT",
                        clue: "Espérance qui garde l'esprit du guerrier",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ESPERANCE",
                        clue: "Certitude qui protège nos pensées",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "PENSEES",
                        clue: "Ce que le casque garde du découragement",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "REDEMPTION",
                        clue: "Réalité qui fortifie notre esprit",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 69 - Armure de Dieu : Épée de l'Esprit (grille 10x10)
                words: [
                    {
                        word: "EPEE",
                        clue: "Seule arme offensive de l'armure spirituelle",
                        path: [[1,2], [2,2], [3,2], [4,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ESPRIT",
                        clue: "Celui qui manie la parole comme une épée",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PAROLE",
                        clue: "Lame tranchante qui discerne tout",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ECRITURE",
                        clue: "Arme puissante du combattant spirituel",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "TRANCHANTE",
                        clue: "Efficacité de la parole de Dieu",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 70 - Armure complète : Le combat spirituel (grille 10x10)
                words: [
                    {
                        word: "COMBATTONS",
                        clue: "Engagement actif dans la guerre spirituelle",
                        path: [[0,1], [1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "REVETUS",
                        clue: "État de celui qui porte toute l'armure",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "TENIRFERME",
                        clue: "Posture du guerrier équipé de l'armure complète",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8], [8,8], [7,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "RESISTEZ",
                        clue: "Impératif pour celui qui porte l'armure",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 71 - 1 Corinthiens 13 : L'amour est patient (grille 10x10)
                words: [
                    {
                        word: "AMOUR",
                        clue: "Don suprême qui dépasse tout",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PATIENT",
                        clue: "Première qualité de l'amour véritable",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "LONGANIME",
                        clue: "Capacité d'endurer sans se lasser",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "ATTENTE",
                        clue: "Sagesse de celui qui aime patiemment",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "DOUCEUR",
                        clue: "Attitude tendre de l'amour patient",
                        path: [[6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 72 - 1 Corinthiens 13 : L'amour est serviable (grille 10x10)
                words: [
                    {
                        word: "SERVIABLE",
                        clue: "Deuxième qualité de l'amour qui donne",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "BONTE",
                        clue: "Bienveillance active envers autrui",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "GENEREUX",
                        clue: "Disposition du cœur qui aime servir",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "COMPASSION",
                        clue: "Sentiment qui pousse à servir l'autre",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "DON",
                        clue: "Acte naturel de l'amour serviable",
                        path: [[7,0], [8,0], [9,0]], // Horizontal
                        direction: "horizontal"
                    }
                ]
            },
            {
                // NIVEAU 73 - 1 Corinthiens 13 : L'amour ne jalouse pas (grille 10x10)
                words: [
                    {
                        word: "JALOUSIE",
                        clue: "Ce que l'amour authentique ignore totalement",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ENVIE",
                        clue: "Désir malsain absent de l'amour vrai",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "CONTENTEMENT",
                        clue: "Satisfaction qui remplace la jalousie",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8], [8,8], [7,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "REJOUIS",
                        clue: "Réaction de l'amour devant le bonheur d'autrui",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "CELEBRE",
                        clue: "L'amour fête les succès des autres",
                        path: [[6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 74 - 1 Corinthiens 13 : L'amour ne se vante pas (grille 10x10)
                words: [
                    {
                        word: "VANTARDISE",
                        clue: "Attitude étrangère à l'amour véritable",
                        path: [[1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1], [9,2]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "ORGUEIL",
                        clue: "Ce dont l'amour ne s'enfle jamais",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "HUMILITE",
                        clue: "Vertu opposée à la vantardise",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "MODESTIE",
                        clue: "Simplicité de celui qui aime vraiment",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "DISCRET",
                        clue: "Caractère de l'amour qui n'attire pas l'attention sur soi",
                        path: [[6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 75 - 1 Corinthiens 13 : L'amour excuse tout (grille 10x10)
                words: [
                    {
                        word: "EXCUSETOUT",
                        clue: "L'amour couvre toutes les fautes",
                        path: [[0,1], [1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "CROITTOUT",
                        clue: "L'amour fait confiance sans limites",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ESPERETOUT",
                        clue: "L'amour garde l'espérance en toute circonstance",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8], [8,8]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "SUPPORTETOUT",
                        clue: "L'amour endure toutes choses avec patience",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3], [9,2], [9,1]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 76 - 1 Corinthiens 13 : L'amour ne périt jamais (grille 10x10)
                words: [
                    {
                        word: "JAMAIS",
                        clue: "Temporalité de l'amour - il ne finit pas",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ETERNEL",
                        clue: "Nature intemporelle de l'amour véritable",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "DEMEURER",
                        clue: "Ce que font foi, espérance et amour",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "PERMANENT",
                        clue: "Caractère stable de l'amour divin",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "PERITJAMAIS",
                        clue: "Affirmation centrale : l'amour ne tombe jamais",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    }
                ]
            },
            {
                // NIVEAU 77 - 1 Corinthiens 13 : L'amour est le plus grand (grille 10x10)
                words: [
                    {
                        word: "PLUSGRAND",
                        clue: "Suprématie de l'amour sur toutes les vertus",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "FOI",
                        clue: "Première des trois vertus qui demeurent",
                        path: [[0,4], [1,4], [2,4]], // Vertical
                        direction: "vertical"
                    },
                    {
                        word: "ESPERANCE",
                        clue: "Deuxième des trois vertus qui demeurent",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "CHARITE",
                        clue: "Troisième et plus grande des vertus qui demeurent",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]], // Coudé
                        direction: "bent"
                    },
                    {
                        word: "EXCELLENCE",
                        clue: "Qualité suprême de l'amour agape",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5]], // Coudé
                        direction: "bent"
                    }
                ]
            }
        ]
    },

    en: {
        levels: [
            {
                // Level 1 - Introduction with crosswords (10x10 grid)
                words: [
                    {
                        word: "JESUS",
                        clue: "Light that guides our steps through life's darkness",
                        path: [[1,3], [2,3], [3,3], [3,4], [3,5]],
                        direction: "bent"
                    },
                    {
                        word: "LOVE",
                        clue: "Divine force that transforms hearts and unites souls",
                        path: [[4,0], [4,1], [4,2], [4,3]],
                        direction: "horizontal"
                    },
                    {
                        word: "PEACE",
                        clue: "Deep serenity that soothes the troubled soul",
                        path: [[6,2], [6,3], [7,3], [8,3], [9,3]],
                        direction: "bent"
                    },
                    {
                        word: "FAITH",
                        clue: "Trust that illuminates the path of hope",
                        path: [[2,6], [2,7], [2,8], [3,8], [4,8]],
                        direction: "bent"
                    },
                    {
                        word: "LIFE",
                        clue: "Precious gift that blooms in eternal love",
                        path: [[6,7], [7,7], [8,7], [9,7]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 2 - Christian virtues with complex crosses (10x10 grid)
                words: [
                    {
                        word: "HOPE",
                        clue: "Light that shines even in the darkest night",
                        path: [[0,2], [1,2], [2,2], [3,2]],
                        direction: "vertical"
                    },
                    {
                        word: "GRACE",
                        clue: "Unmerited gift that lifts the soul toward beauty",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6]],
                        direction: "vertical"
                    },
                    {
                        word: "PRAYER",
                        clue: "Dialogue of the heart that opens heaven's doors",
                        path: [[7,1], [7,2], [7,3], [8,3], [9,3], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "LOVE",
                        clue: "Divine essence that breaks chains and frees the spirit",
                        path: [[5,0], [5,1], [5,2], [5,3]],
                        direction: "horizontal"
                    },
                    {
                        word: "FAITH",
                        clue: "Anchor of the soul in the storm of existence",
                        path: [[0,7], [1,7], [2,7], [3,7], [4,7]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 3 - Mysteries of faith (10x10 grid)
                words: [
                    {
                        word: "ETERNITY",
                        clue: "Ocean without shores where love never fades",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]],
                        direction: "vertical"
                    },
                    {
                        word: "GLORY",
                        clue: "Radiant splendor that reveals divine beauty",
                        path: [[3,0], [3,1], [3,2], [3,3], [3,4]],
                        direction: "horizontal"
                    },
                    {
                        word: "SAINT",
                        clue: "Purified heart that reflects heavenly light",
                        path: [[4,6], [5,6], [6,6], [7,6], [8,6]],
                        direction: "vertical"
                    },
                    {
                        word: "HEAVEN",
                        clue: "Home of hope where every tear will be dried",
                        path: [[1,7], [2,7], [3,7], [4,7], [5,7], [6,7]],
                        direction: "vertical"
                    },
                    {
                        word: "ANGEL",
                        clue: "Heavenly messenger bearing good news",
                        path: [[8,2], [8,3], [8,4], [8,5], [8,6]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 4 - Gifts of the Spirit (10x10 grid)
                words: [
                    {
                        word: "JOY",
                        clue: "Gift that makes the heart overflow with gratitude",
                        path: [[2,1], [2,2], [2,3]],
                        direction: "horizontal"
                    },
                    {
                        word: "KINDNESS",
                        clue: "Gentle force that heals and restores",
                        path: [[0,5], [1,5], [2,5], [3,5], [4,5], [5,5], [6,5], [7,5]],
                        direction: "vertical"
                    },
                    {
                        word: "PATIENCE",
                        clue: "Virtue that awaits with a serene heart",
                        path: [[4,0], [4,1], [4,2], [4,3], [4,4], [4,5], [4,6], [4,7]],
                        direction: "horizontal"
                    },
                    {
                        word: "GOODNESS",
                        clue: "Pure fruit that nourishes souls",
                        path: [[6,2], [7,2], [8,2], [9,2], [9,3], [9,4], [9,5], [9,6]],
                        direction: "bent"
                    },
                    {
                        word: "TRUTH",
                        clue: "Light that dispels shadows of doubt",
                        path: [[1,8], [2,8], [3,8], [4,8], [5,8]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 5 - Biblical figures (10x10 grid)
                words: [
                    {
                        word: "MOSES",
                        clue: "He who received the law on the mountain",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2]],
                        direction: "vertical"
                    },
                    {
                        word: "DAVID",
                        clue: "Shepherd who became king, man after God's heart",
                        path: [[2,5], [3,5], [4,5], [5,5], [6,5]],
                        direction: "vertical"
                    },
                    {
                        word: "ABRAHAM",
                        clue: "Father of faith who trusted God's promise",
                        path: [[3,0], [3,1], [3,2], [3,3], [3,4], [3,5], [3,6]],
                        direction: "horizontal"
                    },
                    {
                        word: "PAUL",
                        clue: "Apostle who spread the Gospel to nations",
                        path: [[7,3], [7,4], [7,5], [7,6]],
                        direction: "horizontal"
                    },
                    {
                        word: "MARY",
                        clue: "Mother chosen to bring light into the world",
                        path: [[5,7], [6,7], [7,7], [8,7]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 6 - Parables (10x10 grid)
                words: [
                    {
                        word: "SEED",
                        clue: "Small beginning that grows into great faith",
                        path: [[1,3], [2,3], [3,3], [4,3]],
                        direction: "vertical"
                    },
                    {
                        word: "TREASURE",
                        clue: "Hidden riches worth giving all to obtain",
                        path: [[2,5], [3,5], [4,5], [5,5], [6,5], [7,5], [8,5], [9,5]],
                        direction: "vertical"
                    },
                    {
                        word: "LIGHT",
                        clue: "What should not be hidden under a bushel",
                        path: [[4,0], [4,1], [4,2], [4,3], [4,4]],
                        direction: "horizontal"
                    },
                    {
                        word: "SHEPHERD",
                        clue: "One who leaves ninety-nine to find the lost",
                        path: [[6,1], [6,2], [6,3], [6,4], [6,5], [6,6], [6,7], [6,8]],
                        direction: "horizontal"
                    },
                    {
                        word: "PEARL",
                        clue: "Great worth for which a merchant sells all",
                        path: [[8,7], [9,7], [9,6], [9,5], [9,4]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 7 - Fruits of the Spirit (10x10 grid)
                words: [
                    {
                        word: "LOVE",
                        clue: "Greatest fruit that never fails",
                        path: [[2,2], [2,3], [2,4], [2,5]],
                        direction: "horizontal"
                    },
                    {
                        word: "JOY",
                        clue: "Deep gladness that circumstances cannot steal",
                        path: [[0,6], [1,6], [2,6]],
                        direction: "vertical"
                    },
                    {
                        word: "PEACE",
                        clue: "Tranquility that surpasses understanding",
                        path: [[4,1], [4,2], [4,3], [4,4], [4,5]],
                        direction: "horizontal"
                    },
                    {
                        word: "PATIENCE",
                        clue: "Endurance with a calm spirit",
                        path: [[1,7], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7]],
                        direction: "vertical"
                    },
                    {
                        word: "KINDNESS",
                        clue: "Gentle compassion shown to all",
                        path: [[6,0], [6,1], [6,2], [6,3], [6,4], [6,5], [6,6], [6,7]],
                        direction: "horizontal"
                    },
                    {
                        word: "GOODNESS",
                        clue: "Moral excellence reflecting God's character",
                        path: [[8,2], [8,3], [8,4], [8,5], [8,6], [8,7], [8,8], [8,9]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 8 - Acts of worship (10x10 grid)
                words: [
                    {
                        word: "PRAISE",
                        clue: "Joyful declaration of God's greatness",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2]],
                        direction: "vertical"
                    },
                    {
                        word: "WORSHIP",
                        clue: "Heartfelt adoration of the Creator",
                        path: [[2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4]],
                        direction: "vertical"
                    },
                    {
                        word: "PRAYER",
                        clue: "Intimate conversation with our Father",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6]],
                        direction: "vertical"
                    },
                    {
                        word: "SONG",
                        clue: "Melody that lifts our hearts to heaven",
                        path: [[5,0], [5,1], [5,2], [5,3]],
                        direction: "horizontal"
                    },
                    {
                        word: "OFFERING",
                        clue: "Gift given with a grateful heart",
                        path: [[7,7], [7,8], [7,9], [8,9], [9,9], [9,8], [9,7], [9,6]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 9 - Words of Jesus (10x10 grid)
                words: [
                    {
                        word: "FOLLOW",
                        clue: "Come after me and learn my ways",
                        path: [[1,1], [2,1], [3,1], [4,1], [5,1], [6,1]],
                        direction: "vertical"
                    },
                    {
                        word: "BELIEVE",
                        clue: "Trust in me and you shall have life",
                        path: [[2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3]],
                        direction: "vertical"
                    },
                    {
                        word: "ABIDE",
                        clue: "Remain in me and bear much fruit",
                        path: [[3,5], [3,6], [3,7], [3,8], [3,9]],
                        direction: "horizontal"
                    },
                    {
                        word: "TRUST",
                        clue: "Do not let your hearts be troubled",
                        path: [[5,6], [6,6], [7,6], [8,6], [9,6]],
                        direction: "vertical"
                    },
                    {
                        word: "COME",
                        clue: "All who are weary, I will give you rest",
                        path: [[7,8], [8,8], [9,8], [9,7]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 10 - The Church (10x10 grid)
                words: [
                    {
                        word: "CHURCH",
                        clue: "Body of believers united in Christ",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2]],
                        direction: "vertical"
                    },
                    {
                        word: "FELLOWSHIP",
                        clue: "Community of faith sharing life together",
                        path: [[2,4], [2,5], [2,6], [2,7], [2,8], [2,9], [3,9], [4,9], [5,9], [6,9]],
                        direction: "bent"
                    },
                    {
                        word: "UNITY",
                        clue: "Oneness in spirit and purpose",
                        path: [[4,0], [4,1], [4,2], [4,3], [4,4]],
                        direction: "horizontal"
                    },
                    {
                        word: "SERVE",
                        clue: "Use your gifts to build up others",
                        path: [[6,5], [7,5], [8,5], [9,5], [9,6]],
                        direction: "bent"
                    },
                    {
                        word: "WITNESS",
                        clue: "Tell others of the good news",
                        path: [[8,1], [8,2], [8,3], [8,4], [8,5], [8,6], [8,7]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 11 - Cardinal Virtues (10x10 grid)
                words: [
                    {
                        word: "TEMPERANCE",
                        clue: "Wise balance that cultivates inner harmony",
                        path: [[0,3], [1,3], [2,3], [3,3], [4,3], [4,4], [4,5], [4,6], [4,7], [4,8]],
                        direction: "bent"
                    },
                    {
                        word: "PRUDENCE",
                        clue: "Discernment that illuminates choices with wisdom",
                        path: [[2,0], [2,1], [2,2], [2,3], [3,3], [4,3], [5,3], [6,3]],
                        direction: "bent"
                    },
                    {
                        word: "TRUTH",
                        clue: "Light that reveals reality in its purity",
                        path: [[6,5], [6,6], [7,6], [8,6], [9,6]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 12 - Spiritual Gifts (10x10 grid)
                words: [
                    {
                        word: "DISCERNMENT",
                        clue: "Spiritual vision that distinguishes truth from illusion",
                        path: [[0,2], [0,3], [0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4]],
                        direction: "bent"
                    },
                    {
                        word: "COMPASSION",
                        clue: "Deep empathy that shares the suffering of others",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]],
                        direction: "bent"
                    },
                    {
                        word: "ASSURANCE",
                        clue: "Living certainty of a radiant future in love",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4], [6,4], [7,4], [8,4], [9,4]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 13 - Words of Life (10x10 grid)
                words: [
                    {
                        word: "PARDON",
                        clue: "Grace that liberates and heals all wounds",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2]],
                        direction: "vertical"
                    },
                    {
                        word: "TENDERNESS",
                        clue: "Infinite gentleness that welcomes without condition",
                        path: [[3,4], [3,5], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]],
                        direction: "bent"
                    },
                    {
                        word: "CHARITY",
                        clue: "Love in action that transforms the world",
                        path: [[0,7], [1,7], [2,7], [3,7], [4,7], [5,7], [6,7]],
                        direction: "vertical"
                    },
                    {
                        word: "WORSHIP",
                        clue: "Song of gratitude rising to the heavens",
                        path: [[7,0], [7,1], [7,2], [7,3], [7,4], [7,5], [7,6]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 14 - Spiritual Path (10x10 grid)
                words: [
                    {
                        word: "TRANSFORMATION",
                        clue: "Divine metamorphosis that births a new creation",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [9,4], [9,5]],
                        direction: "bent"
                    },
                    {
                        word: "PERSEVERANCE",
                        clue: "Quiet strength that never abandons hope",
                        path: [[2,6], [2,7], [2,8], [3,8], [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 15 - Light and Darkness (10x10 grid)
                words: [
                    {
                        word: "LIGHT",
                        clue: "Divine clarity that dispels all shadows",
                        path: [[2,1], [2,2], [2,3], [2,4], [2,5]],
                        direction: "horizontal"
                    },
                    {
                        word: "LIBERATION",
                        clue: "Salvation that opens the gates of eternal freedom",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4]],
                        direction: "vertical"
                    },
                    {
                        word: "PURITY",
                        clue: "Restored innocence reflecting original beauty",
                        path: [[4,6], [5,6], [6,6], [7,6], [8,6], [9,6]],
                        direction: "vertical"
                    },
                    {
                        word: "CONSOLATION",
                        clue: "Comfort that dries tears and soothes sorrows",
                        path: [[6,0], [6,1], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4], [9,5], [9,6], [9,7]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 16 - Faithfulness and Commitment (10x10 grid)
                words: [
                    {
                        word: "FIDELITY",
                        clue: "Constancy of heart that endures through all seasons",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]],
                        direction: "vertical"
                    },
                    {
                        word: "COVENANT",
                        clue: "Sacred promise that unites souls for eternity",
                        path: [[3,4], [3,5], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6]],
                        direction: "bent"
                    },
                    {
                        word: "CONSECRATION",
                        clue: "Total gift of self reflecting absolute love",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3], [9,2], [9,1]],
                        direction: "bent"
                    },
                    {
                        word: "DEVOTION",
                        clue: "Attachment of heart that nurtures the spiritual flame",
                        path: [[0,5], [1,5], [2,5], [3,5], [4,5], [5,5], [6,5], [7,5]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 17 - Spiritual Riches (10x10 grid)
                words: [
                    {
                        word: "BENEDICTION",
                        clue: "Heavenly favor enriching the soul with infinite grace",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3]],
                        direction: "bent"
                    },
                    {
                        word: "ABUNDANCE",
                        clue: "Divine fullness that fills beyond all measure",
                        path: [[2,5], [2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7]],
                        direction: "bent"
                    },
                    {
                        word: "HERITAGE",
                        clue: "Eternal treasure passed to children of light",
                        path: [[5,0], [5,1], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 18 - Divine Protection (10x10 grid)
                words: [
                    {
                        word: "REFUGE",
                        clue: "Sacred shelter where the soul finds rest and safety",
                        path: [[2,2], [3,2], [4,2], [5,2], [6,2], [7,2]],
                        direction: "vertical"
                    },
                    {
                        word: "STRONGHOLD",
                        clue: "Unshakable rampart protecting from every storm",
                        path: [[1,4], [1,5], [1,6], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6]],
                        direction: "bent"
                    },
                    {
                        word: "SHIELD",
                        clue: "Heavenly defense that turns away all evil",
                        path: [[3,8], [4,8], [5,8], [6,8], [7,8], [8,8]],
                        direction: "vertical"
                    },
                    {
                        word: "SECURITY",
                        clue: "Peaceful confidence in divine providence",
                        path: [[8,0], [8,1], [8,2], [8,3], [8,4], [8,5], [8,6], [8,7]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 19 - Renewal (10x10 grid)
                words: [
                    {
                        word: "RENAISSANCE",
                        clue: "New beginning that makes eternal hope blossom",
                        path: [[0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "REGENERATION",
                        clue: "Deep transformation restoring original life",
                        path: [[2,5], [2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,6], [9,5]],
                        direction: "bent"
                    },
                    {
                        word: "HOPE",
                        clue: "Light that never fades in the loving heart",
                        path: [[5,0], [5,1], [5,2], [5,3]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 20 - Final Glory (10x10 grid) - Ultimate challenge!
                words: [
                    {
                        word: "RESURRECTION",
                        clue: "Radiant victory of life over eternal death",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3]],
                        direction: "bent"
                    },
                    {
                        word: "GLORIFICATION",
                        clue: "Supreme elevation toward the fullness of divine love",
                        path: [[2,5], [2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,6], [9,5], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "FULLNESS",
                        clue: "Perfect fulfillment of all heavenly promises",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2]],
                        direction: "bent"
                    }
                ]
            },
            {
                // BONUS LEVEL 1 - Divine Grace (10x10 grid)
                words: [
                    {
                        word: "GRACE",
                        clue: "Heavenly gift that beautifies our lives with kindness",
                        path: [[2,3], [3,3], [4,3], [5,3], [6,3]],
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "TOLERANCE",
                        clue: "Benevolent acceptance that unites us in our differences",
                        path: [[3,5], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "BENEVOLENCE",
                        clue: "Loving gaze that sees the best in everyone",
                        path: [[1,0], [1,1], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,1], [9,0]],
                        direction: "bent",
                        bonus: true
                    }
                ],
                bonusWords: ["GRACE", "TOLERANCE", "BENEVOLENCE"]
            },
            {
                // BONUS LEVEL 2 - Universal Love (10x10 grid)
                words: [
                    {
                        word: "MERCY",
                        clue: "Infinite forgiveness that embraces all human frailties",
                        path: [[0,3], [1,3], [2,3], [3,3], [4,3]],
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "COMPASSION",
                        clue: "Heart that feels another's pain as its own",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "TENDERNESS",
                        clue: "Gentle warmth that envelops and comforts souls",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]],
                        direction: "bent",
                        bonus: true
                    }
                ],
                bonusWords: ["MERCY", "COMPASSION", "TENDERNESS"]
            },
            {
                // BONUS LEVEL 3 - Brotherhood (10x10 grid)
                words: [
                    {
                        word: "BROTHERHOOD",
                        clue: "Sacred bond that makes all humanity one family",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,1]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "SOLIDARITY",
                        clue: "Collective strength that lifts and supports each one",
                        path: [[2,4], [2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "SHARING",
                        clue: "Gesture that multiplies joy by dividing it",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "UNITY",
                        clue: "Harmony born from reconciled diversity",
                        path: [[1,5], [2,5], [3,5], [4,5], [5,5]],
                        direction: "vertical",
                        bonus: true
                    }
                ],
                bonusWords: ["BROTHERHOOD", "SOLIDARITY", "SHARING", "UNITY"]
            },
            {
                // BONUS LEVEL 4 - Overcoming Division (10x10 grid)
                words: [
                    {
                        word: "RECONCILIATION",
                        clue: "Divine bridge that mends what hatred has torn",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,3], [9,2], [9,1]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "ACCEPTANCE",
                        clue: "Opening of the heart that welcomes the different",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "HEALING",
                        clue: "Gentle balm that soothes the wounds of the soul",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1]],
                        direction: "bent",
                        bonus: true
                    }
                ],
                bonusWords: ["RECONCILIATION", "ACCEPTANCE", "HEALING"]
            },
            {
                // BONUS LEVEL 5 - Light vs Darkness (10x10 grid)
                words: [
                    {
                        word: "TRUTH",
                        clue: "Light that chases away the shadows of lies",
                        path: [[0,3], [1,3], [2,3], [3,3], [4,3]],
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "HUMILITY",
                        clue: "Virtue that topples destructive pride",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "GENEROSITY",
                        clue: "Open hand that breaks the chains of greed",
                        path: [[1,7], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "PEACE",
                        clue: "Divine harmony that extinguishes the flames of war",
                        path: [[0,5], [1,5], [2,5], [3,5]],
                        direction: "vertical",
                        bonus: true
                    }
                ],
                bonusWords: ["TRUTH", "HUMILITY", "GENEROSITY", "PEACE"]
            },
            {
                // BONUS LEVEL 6 - Universal Love vs Hatred (10x10 grid)
                words: [
                    {
                        word: "INCLUSION",
                        clue: "God loves all His children without exception or rejection",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]],
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "RESPECT",
                        clue: "Dignity of every person created in the divine image",
                        path: [[3,4], [3,5], [4,5], [5,5], [6,5], [7,5], [8,5]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "EQUALITY",
                        clue: "Justice against racism homophobia and all discrimination",
                        path: [[2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7]],
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "LOVE",
                        clue: "God is love for all example: He is not homophobic",
                        path: [[5,0], [5,1], [5,2], [5,3]],
                        direction: "horizontal",
                        bonus: true
                    }
                ],
                bonusWords: ["INCLUSION", "RESPECT", "EQUALITY", "LOVE"]
            },
            {
                // BONUS LEVEL 7 - Justice and Truth (10x10 grid)
                words: [
                    {
                        word: "SINCERITY",
                        clue: "Authenticity that unmasks deception",
                        path: [[1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3]],
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "JUDGMENT",
                        clue: "Fair discernment free from condemnation",
                        path: [[3,5], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "TRANSPARENCY",
                        clue: "Clarity that shatters the masks of hypocrisy",
                        path: [[2,8], [2,9], [3,9], [4,9], [5,9], [6,9], [7,9], [8,9], [9,9], [9,8], [9,7], [9,6]],
                        direction: "bent",
                        bonus: true
                    }
                ],
                bonusWords: ["SINCERITY", "JUDGMENT", "TRANSPARENCY"]
            },
            {
                // BONUS LEVEL 8 - Reconstruction (10x10 grid)
                words: [
                    {
                        word: "RESTORATION",
                        clue: "Renewal that repairs what hatred has destroyed",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "FORGIVENESS",
                        clue: "Liberation that breaks the cycle of revenge",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8], [9,9]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "REBIRTH",
                        clue: "Fresh start that erases dissolution",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]],
                        direction: "bent",
                        bonus: true
                    }
                ],
                bonusWords: ["RESTORATION", "FORGIVENESS", "REBIRTH"]
            },
            {
                // BONUS LEVEL 9 - Welcoming the Stranger and Migrants (10x10 grid)
                words: [
                    {
                        word: "HOSPITALITY",
                        clue: "Welcome the stranger as Jesus Himself",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "STRANGER",
                        clue: "One who comes from elsewhere and deserves our welcome",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6]],
                        direction: "bent",
                        bonus: true
                    },
                    {
                        word: "REFUGE",
                        clue: "Protection offered to migrants and refugees",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8]],
                        direction: "vertical",
                        bonus: true
                    },
                    {
                        word: "WELCOME",
                        clue: "God is not anti-migrant He welcomes all",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2]],
                        direction: "bent",
                        bonus: true
                    }
                ],
                bonusWords: ["HOSPITALITY", "STRANGER", "REFUGE", "WELCOME"]
            },
            {
                // Level 29 - Grace for All (10x10 grid)
                words: [
                    {
                        word: "REDEMPTION",
                        clue: "Salvation offered even to the repentant murderer",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]],
                        direction: "vertical"
                    },
                    {
                        word: "GRACE",
                        clue: "Free gift that welcomes the penitent thief",
                        path: [[3,4], [4,4], [5,4], [6,4], [7,4]],
                        direction: "vertical"
                    },
                    {
                        word: "FORGIVENESS",
                        clue: "Mercy that frees the liar from their chains",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8], [9,9]],
                        direction: "bent"
                    },
                    {
                        word: "LOVE",
                        clue: "God loves even those the world rejects",
                        path: [[5,0], [5,1], [5,2], [5,3]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 30 - Transformation of the Criminal Heart (10x10 grid)
                words: [
                    {
                        word: "CHANGE",
                        clue: "God transforms the murderer into a messenger of love",
                        path: [[0,3], [1,3], [2,3], [3,3], [4,3], [5,3]],
                        direction: "vertical"
                    },
                    {
                        word: "NEWLIFE",
                        clue: "Rebirth offered to the repentant criminal",
                        path: [[2,5], [2,6], [2,7], [3,7], [4,7], [5,7], [6,7]],
                        direction: "bent"
                    },
                    {
                        word: "HOPE",
                        clue: "Future possible even for the worst of sinners",
                        path: [[5,0], [5,1], [5,2], [5,3]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 31 - Universal Call to Grace (10x10 grid)
                words: [
                    {
                        word: "INVITATION",
                        clue: "God calls the thief to return to Him",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]],
                        direction: "vertical"
                    },
                    {
                        word: "WELCOME",
                        clue: "Open arms even for the hardened criminal",
                        path: [[3,4], [3,5], [4,5], [5,5], [6,5], [7,5], [8,5]],
                        direction: "bent"
                    },
                    {
                        word: "MERCY",
                        clue: "Compassion that embraces the repentant liar",
                        path: [[1,7], [2,7], [3,7], [4,7], [5,7]],
                        direction: "vertical"
                    },
                    {
                        word: "LOVE",
                        clue: "God abandons no one to their past",
                        path: [[5,0], [5,1], [5,2], [5,3]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 32 - Restoration of the Murderer (10x10 grid)
                words: [
                    {
                        word: "REHABILITATION",
                        clue: "God rebuilds the one who has taken a life",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "DIGNITY",
                        clue: "Worth restored even after the worst crime",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6]],
                        direction: "vertical"
                    },
                    {
                        word: "NEWNESS",
                        clue: "Identity renewed by divine grace",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 33 - Forgiveness for the Liar (10x10 grid)
                words: [
                    {
                        word: "TRUTH",
                        clue: "Stop lying, choose truth now",
                        path: [[2,2], [3,2], [4,2], [5,2], [6,2]],
                        direction: "vertical"
                    },
                    {
                        word: "SINCERITY",
                        clue: "Speak truth from now on, God helps you change",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4]],
                        direction: "vertical"
                    },
                    {
                        word: "PURIFICATION",
                        clue: "Renounce lying with God's help",
                        path: [[3,6], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8], [9,9], [9,6], [9,5]],
                        direction: "bent"
                    },
                    {
                        word: "GRACE",
                        clue: "God forgives and gives you strength to change",
                        path: [[0,5], [1,5], [2,5], [3,5], [4,5]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 34 - Mercy for the Thief (10x10 grid)
                words: [
                    {
                        word: "RESTITUTION",
                        clue: "God helps the thief to repair and be reborn",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3]],
                        direction: "bent"
                    },
                    {
                        word: "GENEROSITY",
                        clue: "Transformation of the thief into a generous giver",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]],
                        direction: "bent"
                    },
                    {
                        word: "FORGIVENESS",
                        clue: "Grace that frees the one who stole",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3]],
                        direction: "bent"
                    },
                    {
                        word: "LOVE",
                        clue: "God sees beyond the theft and loves the person",
                        path: [[5,0], [5,1], [5,2], [5,3]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 35 - Unconditional Love (10x10 grid)
                words: [
                    {
                        word: "UNCONDITIONAL",
                        clue: "God's limitless love for all sinners",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "ACCEPTANCE",
                        clue: "God welcomes you to transform you, not leave you as is",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]],
                        direction: "bent"
                    },
                    {
                        word: "GRACE",
                        clue: "Free forgiveness that calls you to live differently",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 36 - Divine Second Chance (10x10 grid)
                words: [
                    {
                        word: "NEWBEGINNING",
                        clue: "Fresh start offered to the murderer who weeps",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "OPPORTUNITY",
                        clue: "Divine chance for the repentant criminal",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8], [9,9]],
                        direction: "bent"
                    },
                    {
                        word: "HOPE",
                        clue: "Radiant future even after the darkest past",
                        path: [[4,0], [5,0], [6,0], [7,0]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 37 - No One Too Far (10x10 grid)
                words: [
                    {
                        word: "LIMITLESS",
                        clue: "God's grace reaches even the most lost soul",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]],
                        direction: "vertical"
                    },
                    {
                        word: "PURSUIT",
                        clue: "God chases the murderer to save them",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6]],
                        direction: "bent"
                    },
                    {
                        word: "COMPASSION",
                        clue: "God's heart breaks for the lost criminal",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "LOVE",
                        clue: "God loves the sinner while hating the sin",
                        path: [[5,0], [5,1], [5,2], [5,3]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 38 - Victory of Grace (10x10 grid)
                words: [
                    {
                        word: "TRIUMPH",
                        clue: "Victory of love over criminal past",
                        path: [[2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]],
                        direction: "vertical"
                    },
                    {
                        word: "TRANSFORMATION",
                        clue: "Metamorphosis of murderer into witness of love",
                        path: [[0,4], [0,5], [1,5], [2,5], [3,5], [4,5], [5,5], [6,5], [7,5], [8,5], [9,5], [9,6], [9,7], [9,8]],
                        direction: "bent"
                    },
                    {
                        word: "LIBERATION",
                        clue: "Complete freedom even for the worst criminal",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "GRACE",
                        clue: "Final gift that saves all who repent",
                        path: [[1,7], [2,7], [3,7], [4,7], [5,7]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 39 - Transformation through Change (10x10 grid)
                words: [
                    {
                        word: "METAMORPHOSIS",
                        clue: "Deep change that reveals our true nature",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4], [9,5]],
                        direction: "bent"
                    },
                    {
                        word: "EVOLUTION",
                        clue: "Progressive growth toward fullness",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]],
                        direction: "bent"
                    },
                    {
                        word: "NEWNESS",
                        clue: "Divine freshness in every transformation",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7]],
                        direction: "bent"
                    },
                    {
                        word: "RENEWAL",
                        clue: "Springtime of the soul embracing change",
                        path: [[5,0], [5,1], [5,2], [5,3], [5,4], [6,4], [7,4]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 40 - Accepting Change (10x10 grid)
                words: [
                    {
                        word: "ACCEPTANCE",
                        clue: "Wisdom to embrace what must change",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]],
                        direction: "vertical"
                    },
                    {
                        word: "SURRENDER",
                        clue: "Releasing the old to welcome the new",
                        path: [[2,5], [2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7]],
                        direction: "bent"
                    },
                    {
                        word: "TRUST",
                        clue: "Faith guiding through life's changes",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0]],
                        direction: "vertical"
                    },
                    {
                        word: "COURAGE",
                        clue: "Strength needed to dare to change",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 41 - Inner Change (10x10 grid)
                words: [
                    {
                        word: "INTROSPECTION",
                        clue: "Deep gaze revealing where change is needed",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "MEDITATION",
                        clue: "Silence where transformation takes root",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]],
                        direction: "bent"
                    },
                    {
                        word: "AWARENESS",
                        clue: "Inner awakening preceding all change",
                        path: [[5,0], [5,1], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "RESOLVE",
                        clue: "Firm decision to embrace transformation",
                        path: [[1,5], [2,5], [3,5], [4,5], [5,5], [6,5], [7,5]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 42 - Courage of Change (10x10 grid)
                words: [
                    {
                        word: "DARING",
                        clue: "Boldness to leave the old for the new",
                        path: [[2,2], [3,2], [4,2], [5,2], [6,2], [7,2]],
                        direction: "vertical"
                    },
                    {
                        word: "DETERMINATION",
                        clue: "Firm resolve against resistance to change",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5], [9,6], [9,7]],
                        direction: "bent"
                    },
                    {
                        word: "RESILIENCE",
                        clue: "Strength to bounce back through transitions",
                        path: [[1,8], [2,8], [3,8], [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7]],
                        direction: "bent"
                    },
                    {
                        word: "BRAVERY",
                        clue: "Valor facing the unknown with hope",
                        path: [[5,0], [5,1], [5,2], [6,2], [7,2], [8,2], [9,2]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 43 - Constant Renewal (10x10 grid)
                words: [
                    {
                        word: "PERPETUAL",
                        clue: "Continuous change of the growing soul",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2]],
                        direction: "vertical"
                    },
                    {
                        word: "DYNAMISM",
                        clue: "Living energy embracing each transition",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]],
                        direction: "vertical"
                    },
                    {
                        word: "ADAPTATION",
                        clue: "Flexibility dancing with life's seasons",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7], [8,7], [9,7], [9,8]],
                        direction: "bent"
                    },
                    {
                        word: "GROWTH",
                        clue: "Infinite expansion of transformed spirit",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0]],
                        direction: "vertical"
                    },
                    {
                        word: "LIFE",
                        clue: "Very essence of perpetual change",
                        path: [[6,5], [7,5], [8,5], [9,5]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 44 - Breaking of the Heart (10x10 grid)
                words: [
                    {
                        word: "BREAKING",
                        clue: "Broken heart opening to divine transformation",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]],
                        direction: "vertical"
                    },
                    {
                        word: "HUMILIATION",
                        clue: "Lowering preparing for spiritual elevation",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5]],
                        direction: "bent"
                    },
                    {
                        word: "CONTRITION",
                        clue: "Deep regret opening to redeeming grace",
                        path: [[2,7], [2,8], [3,8], [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7]],
                        direction: "bent"
                    },
                    {
                        word: "ABANDON",
                        clue: "Total release preceding renewal",
                        path: [[5,0], [5,1], [6,1], [7,1], [8,1], [9,1], [9,2]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 45 - Renewal of the Spirit (10x10 grid)
                words: [
                    {
                        word: "REVITALIZATION",
                        clue: "Complete restoration of the inner being",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4], [9,5], [9,6]],
                        direction: "bent"
                    },
                    {
                        word: "REGENERATION",
                        clue: "New birth after the breaking",
                        path: [[2,7], [2,8], [3,8], [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5]],
                        direction: "bent"
                    },
                    {
                        word: "FRESHNESS",
                        clue: "Divine newness refreshing the broken soul",
                        path: [[5,0], [5,1], [6,1], [7,1], [8,1], [9,1], [9,2], [9,3], [9,4]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 46 - Starting Over After the Fall (10x10 grid)
                words: [
                    {
                        word: "RISING",
                        clue: "Standing up again after falling into brokenness",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2]],
                        direction: "vertical"
                    },
                    {
                        word: "NEWBEGINNING",
                        clue: "Fresh start offered after every fall",
                        path: [[2,4], [2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8]],
                        direction: "bent"
                    },
                    {
                        word: "RESTART",
                        clue: "Divine capacity to begin again from zero",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 47 - Reconstruction After Destruction (10x10 grid)
                words: [
                    {
                        word: "RECONSTRUCTION",
                        clue: "New building upon the ruins of the past",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "REBUILD",
                        clue: "Restore what brokenness has destroyed",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6]],
                        direction: "vertical"
                    },
                    {
                        word: "REFOUNDATION",
                        clue: "New foundations after total collapse",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3], [9,2]],
                        direction: "bent"
                    },
                    {
                        word: "HOPE",
                        clue: "Light guiding the reconstruction",
                        path: [[1,5], [2,5], [3,5], [4,5]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 48 - Spiritual Cleansing and Renewal (10x10 grid)
                words: [
                    {
                        word: "CLEANSING",
                        clue: "God cleanses your heart and makes you pure",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]],
                        direction: "vertical"
                    },
                    {
                        word: "REFINEMENT",
                        clue: "God helps you grow and reveals your true beauty",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]],
                        direction: "bent"
                    },
                    {
                        word: "RENEWAL",
                        clue: "Everything can start new with God",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1]],
                        direction: "bent"
                    },
                    {
                        word: "LIGHT",
                        clue: "God's light shows the right path",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 49 - Divine Restoration (10x10 grid)
                words: [
                    {
                        word: "RESTORATION",
                        clue: "God restores what brokenness has broken",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3]],
                        direction: "bent"
                    },
                    {
                        word: "HEALING",
                        clue: "Cure of the soul's deep wounds",
                        path: [[2,6], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7]],
                        direction: "bent"
                    },
                    {
                        word: "REINTEGRATION",
                        clue: "Return to wholeness after fragmentation",
                        path: [[4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5], [9,6], [9,7]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 50 - Rebirth After Death (10x10 grid)
                words: [
                    {
                        word: "RESURRECTION",
                        clue: "New life springing from the old self's death",
                        path: [[0,1], [0,2], [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3]],
                        direction: "bent"
                    },
                    {
                        word: "REBIRTH",
                        clue: "Born anew after total brokenness",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6]],
                        direction: "bent"
                    },
                    {
                        word: "AWAKENING",
                        clue: "Spiritual awakening after death's sleep",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5]],
                        direction: "bent"
                    },
                    {
                        word: "LIFE",
                        clue: "Divine breath reviving the ashes",
                        path: [[6,0], [7,0], [8,0], [9,0]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 51 - New Beginning (10x10 grid)
                words: [
                    {
                        word: "NEWBEGINNING",
                        clue: "Solemn start of a fresh season of life",
                        path: [[0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "NEWNESS",
                        clue: "Divine freshness after the old is gone",
                        path: [[2,5], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6]],
                        direction: "bent"
                    },
                    {
                        word: "BEGINNING",
                        clue: "First step in a renewed existence",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5]],
                        direction: "bent"
                    },
                    {
                        word: "DAWN",
                        clue: "Light following the night of brokenness",
                        path: [[5,0], [6,0], [7,0], [8,0]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 52 - Healing of Wounds (10x10 grid)
                words: [
                    {
                        word: "HEALING",
                        clue: "Restoration of broken parts of the being",
                        path: [[2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]],
                        direction: "vertical"
                    },
                    {
                        word: "SCARHEALING",
                        clue: "Gentle process closing deep wounds",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5]],
                        direction: "bent"
                    },
                    {
                        word: "BANDAGE",
                        clue: "Divine care upon heart's injuries",
                        path: [[1,8], [2,8], [3,8], [4,8], [5,8], [6,8], [7,8]],
                        direction: "vertical"
                    },
                    {
                        word: "CARE",
                        clue: "Tender attention of God for the broken",
                        path: [[5,0], [6,0], [7,0], [8,0]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 53 - Hope of New Beginnings (10x10 grid)
                words: [
                    {
                        word: "HOPE",
                        clue: "Trust that everything can begin anew",
                        path: [[1,2], [2,2], [3,2], [4,2]],
                        direction: "vertical"
                    },
                    {
                        word: "PROMISE",
                        clue: "Divine commitment to make all things new",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4]],
                        direction: "vertical"
                    },
                    {
                        word: "FUTURE",
                        clue: "Bright tomorrow after broken yesterday",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6]],
                        direction: "vertical"
                    },
                    {
                        word: "RESTORATION",
                        clue: "Certainty that God restores everything",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3]],
                        direction: "bent"
                    },
                    {
                        word: "JOY",
                        clue: "Happiness found again after tears",
                        path: [[8,0], [8,1], [8,2]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 54 - Letting Go (10x10 grid)
                words: [
                    {
                        word: "LETTINGGO",
                        clue: "Release control to welcome grace",
                        path: [[0,1], [1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1]],
                        direction: "vertical"
                    },
                    {
                        word: "TRUST",
                        clue: "Faith replacing fear of letting go",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4]],
                        direction: "vertical"
                    },
                    {
                        word: "SURRENDER",
                        clue: "Placing oneself entirely in divine hands",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8]],
                        direction: "bent"
                    },
                    {
                        word: "FREEDOM",
                        clue: "Result of authentic letting go",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 55 - Breaking the Chains (10x10 grid)
                words: [
                    {
                        word: "CHAINS",
                        clue: "Bonds imprisoning us that must be broken",
                        path: [[1,1], [2,1], [3,1], [4,1], [5,1], [6,1]],
                        direction: "vertical"
                    },
                    {
                        word: "BREAK",
                        clue: "Liberating action destroying bonds",
                        path: [[0,3], [1,3], [2,3], [3,3], [4,3]],
                        direction: "vertical"
                    },
                    {
                        word: "DELIVERANCE",
                        clue: "Total liberation from binding ties",
                        path: [[3,5], [4,5], [5,5], [6,5], [7,5], [8,5], [9,5], [9,6], [9,7], [9,8], [8,8]],
                        direction: "bent"
                    },
                    {
                        word: "POWER",
                        clue: "Divine strength breaking every chain",
                        path: [[5,7], [6,7], [7,7], [8,7], [9,7]],
                        direction: "vertical"
                    },
                    {
                        word: "FREE",
                        clue: "State after chains are broken",
                        path: [[2,9], [3,9], [4,9], [5,9]],
                        direction: "vertical"
                    }
                ]
            },
            {
                // Level 56 - Liberation (10x10 grid)
                words: [
                    {
                        word: "LIBERATION",
                        clue: "Stepping out of captivity into new life",
                        path: [[1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1], [9,2]],
                        direction: "bent"
                    },
                    {
                        word: "RELEASE",
                        clue: "Letting go of what held us captive",
                        path: [[0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3]],
                        direction: "vertical"
                    },
                    {
                        word: "EMANCIPATION",
                        clue: "Total freedom from all bondage",
                        path: [[2,5], [3,5], [4,5], [5,5], [6,5], [7,5], [8,5], [9,5], [9,6], [9,7], [9,8], [8,8]],
                        direction: "bent"
                    },
                    {
                        word: "EXODUS",
                        clue: "Journey from slavery to freedom",
                        path: [[4,7], [5,7], [6,7], [7,7], [8,7], [9,7]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 57 - Moving Forward (10x10 grid)
                words: [
                    {
                        word: "FORWARD",
                        clue: "Walking toward the future without turning back",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2]],
                        direction: "vertical"
                    },
                    {
                        word: "LOOKINGAHEAD",
                        clue: "Fixing eyes on what lies before us",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5], [9,6]],
                        direction: "bent"
                    },
                    {
                        word: "FORGET",
                        clue: "Leaving behind what has passed",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6]],
                        direction: "vertical"
                    },
                    {
                        word: "PROGRESSION",
                        clue: "Constant movement toward what's ahead",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3], [9,2]],
                        direction: "bent"
                    },
                    {
                        word: "FUTURE",
                        clue: "Direction of the gaze freed from the past",
                        path: [[7,0], [7,1], [7,2], [7,3], [7,4], [7,5]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 58 - Moving in Faith (10x10 grid)
                words: [
                    {
                        word: "MOVING",
                        clue: "Setting into motion through faith",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2]],
                        direction: "vertical"
                    },
                    {
                        word: "MOVEMENT",
                        clue: "Action that breaks through stagnation",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]],
                        direction: "vertical"
                    },
                    {
                        word: "DYNAMISM",
                        clue: "Energy that propels us forward",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]],
                        direction: "vertical"
                    },
                    {
                        word: "ACTION",
                        clue: "Concrete manifestation of movement",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8]],
                        direction: "vertical"
                    },
                    {
                        word: "DRIVE",
                        clue: "Impulse that sets us in motion",
                        path: [[7,0], [7,1], [8,1], [9,1], [9,2]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 59 - Detachment (10x10 grid)
                words: [
                    {
                        word: "DETACHMENT",
                        clue: "Separation from what hinders freedom",
                        path: [[0,1], [1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1]],
                        direction: "vertical"
                    },
                    {
                        word: "SEPARATION",
                        clue: "Necessary break from the old",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5]],
                        direction: "bent"
                    },
                    {
                        word: "RENUNCIATION",
                        clue: "Voluntary abandonment of what holds back",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8], [8,8], [7,8], [6,8]],
                        direction: "bent"
                    },
                    {
                        word: "RELEASE",
                        clue: "Loosening the grip on the past",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 60 - Breaking Bonds (10x10 grid)
                words: [
                    {
                        word: "BREAKING",
                        clue: "Liberating fracture of toxic attachments",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]],
                        direction: "vertical"
                    },
                    {
                        word: "BONDS",
                        clue: "Attachments that must be severed",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4]],
                        direction: "vertical"
                    },
                    {
                        word: "SEVER",
                        clue: "Cutting action that brings freedom",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6]],
                        direction: "vertical"
                    },
                    {
                        word: "EMANCIPATION",
                        clue: "Complete freedom from all constraints",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3], [9,2]],
                        direction: "bent"
                    },
                    {
                        word: "INDEPENDENCE",
                        clue: "State of one who has broken the chains",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5], [9,6], [9,7]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 61 - Walking Forward (10x10 grid)
                words: [
                    {
                        word: "WALKING",
                        clue: "Moving step by step toward the promise",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2]],
                        direction: "vertical"
                    },
                    {
                        word: "PERSEVERANCE",
                        clue: "Continuing even when the path is difficult",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5], [9,6]],
                        direction: "bent"
                    },
                    {
                        word: "TENACITY",
                        clue: "Determination never to turn back",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]],
                        direction: "bent"
                    },
                    {
                        word: "PATH",
                        clue: "Road leading far from the past",
                        path: [[5,8], [6,8], [7,8], [8,8]],
                        direction: "horizontal"
                    },
                    {
                        word: "AHEAD",
                        clue: "Only direction for the liberated gaze",
                        path: [[7,0], [7,1], [8,1], [9,1], [9,2]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 62 - Letting Go of the Past (10x10 grid)
                words: [
                    {
                        word: "RELEASEPAST",
                        clue: "Allowing yesterday to fly away",
                        path: [[0,1], [1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1], [9,2]],
                        direction: "bent"
                    },
                    {
                        word: "PARDON",
                        clue: "Freeing ourselves by freeing others",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4]],
                        direction: "vertical"
                    },
                    {
                        word: "ACCEPTANCE",
                        clue: "Welcoming that some things must depart",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8], [8,8]],
                        direction: "bent"
                    },
                    {
                        word: "PEACE",
                        clue: "Tranquility after letting go",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8]],
                        direction: "horizontal"
                    }
                ]
            },
            {
                // Level 63 - New Freedom (10x10 grid)
                words: [
                    {
                        word: "FREEDOM",
                        clue: "Glorious state of one who released all",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2]],
                        direction: "vertical"
                    },
                    {
                        word: "NEWFOUND",
                        clue: "Fresh as a new beginning",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]],
                        direction: "vertical"
                    },
                    {
                        word: "VICTORY",
                        clue: "Triumph over the chains of the past",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6]],
                        direction: "vertical"
                    },
                    {
                        word: "SOAR",
                        clue: "Rising free from all burdens",
                        path: [[4,8], [5,8], [6,8], [7,8]],
                        direction: "horizontal"
                    },
                    {
                        word: "REBIRTH",
                        clue: "New life after breaking the chains",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 64 - Armor of God: Belt of Truth (10x10 grid)
                words: [
                    {
                        word: "BELT",
                        clue: "First piece of armor holding everything together",
                        path: [[1,2], [2,2], [3,2], [4,2]],
                        direction: "vertical"
                    },
                    {
                        word: "TRUTH",
                        clue: "What girds the loins of the spiritual warrior",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4]],
                        direction: "vertical"
                    },
                    {
                        word: "INTEGRITY",
                        clue: "Quality of one who walks in truth",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8]],
                        direction: "bent"
                    },
                    {
                        word: "SINCERITY",
                        clue: "Authenticity that supports all the armor",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "HONEST",
                        clue: "Character of the one wearing the belt",
                        path: [[7,0], [7,1], [8,1], [9,1], [9,2], [9,3]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 65 - Armor of God: Breastplate of Righteousness (10x10 grid)
                words: [
                    {
                        word: "BREASTPLATE",
                        clue: "Protection of the heart in spiritual battle",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [9,3], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "JUSTICE",
                        clue: "Righteousness protecting the believer's heart",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4]],
                        direction: "vertical"
                    },
                    {
                        word: "RIGHTNESS",
                        clue: "Moral rectitude that shields the soul",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]],
                        direction: "bent"
                    },
                    {
                        word: "PURITY",
                        clue: "Integrity that strengthens the heart",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8]],
                        direction: "vertical"
                    },
                    {
                        word: "HOLINESS",
                        clue: "Consecration that reinforces protection",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 66 - Armor of God: Shoes of the Gospel (10x10 grid)
                words: [
                    {
                        word: "SHOES",
                        clue: "Footwear for those who proclaim good news",
                        path: [[0,1], [1,1], [2,1], [3,1], [4,1]],
                        direction: "vertical"
                    },
                    {
                        word: "GOSPEL",
                        clue: "Good news of peace we carry on our feet",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4]],
                        direction: "vertical"
                    },
                    {
                        word: "PEACE",
                        clue: "Message our prepared steps bring to the world",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6]],
                        direction: "vertical"
                    },
                    {
                        word: "PROCLAMATION",
                        clue: "Action of those who wear gospel shoes",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3], [9,2]],
                        direction: "bent"
                    },
                    {
                        word: "PREPARATION",
                        clue: "Readiness to walk wherever Christ sends",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5], [9,6]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 67 - Armor of God: Shield of Faith (10x10 grid)
                words: [
                    {
                        word: "SHIELD",
                        clue: "Mobile defense against flaming arrows",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2]],
                        direction: "vertical"
                    },
                    {
                        word: "FAITH",
                        clue: "Trust that extinguishes the enemy's darts",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4]],
                        direction: "vertical"
                    },
                    {
                        word: "TRUST",
                        clue: "Confidence that repels every attack",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6]],
                        direction: "vertical"
                    },
                    {
                        word: "PROTECTION",
                        clue: "Defense provided by solid faith",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "VICTORY",
                        clue: "Outcome when the shield is raised",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 68 - Armor of God: Helmet of Salvation (10x10 grid)
                words: [
                    {
                        word: "HELMET",
                        clue: "Protection for the head and thoughts",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2]],
                        direction: "vertical"
                    },
                    {
                        word: "SALVATION",
                        clue: "Hope that guards the warrior's mind",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4]],
                        direction: "vertical"
                    },
                    {
                        word: "HOPE",
                        clue: "Assurance that shields our thoughts",
                        path: [[2,6], [3,6], [4,6], [5,6]],
                        direction: "vertical"
                    },
                    {
                        word: "THOUGHTS",
                        clue: "What the helmet protects from despair",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]],
                        direction: "bent"
                    },
                    {
                        word: "REDEMPTION",
                        clue: "Reality that strengthens our spirit",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 69 - Armor of God: Sword of the Spirit (10x10 grid)
                words: [
                    {
                        word: "SWORD",
                        clue: "Only offensive weapon in spiritual armor",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2]],
                        direction: "vertical"
                    },
                    {
                        word: "SPIRIT",
                        clue: "Who wields the word as a mighty blade",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4]],
                        direction: "vertical"
                    },
                    {
                        word: "WORD",
                        clue: "Sharp blade that discerns all things",
                        path: [[2,6], [3,6], [4,6], [5,6]],
                        direction: "vertical"
                    },
                    {
                        word: "SCRIPTURE",
                        clue: "Powerful weapon of the spiritual warrior",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5]],
                        direction: "bent"
                    },
                    {
                        word: "PIERCING",
                        clue: "Effectiveness of God's living word",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 70 - Complete Armor: Spiritual Combat (10x10 grid)
                words: [
                    {
                        word: "FIGHTING",
                        clue: "Active engagement in spiritual warfare",
                        path: [[0,1], [1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1]],
                        direction: "vertical"
                    },
                    {
                        word: "CLOTHED",
                        clue: "State of one wearing the full armor",
                        path: [[1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]],
                        direction: "vertical"
                    },
                    {
                        word: "STANDFAST",
                        clue: "Posture of the warrior in full armor",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8]],
                        direction: "bent"
                    },
                    {
                        word: "RESIST",
                        clue: "Command for those who bear the armor",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 71 - 1 Corinthians 13: Love is patient (10x10 grid)
                words: [
                    {
                        word: "LOVE",
                        clue: "Supreme gift that surpasses all",
                        path: [[1,2], [2,2], [3,2], [4,2]],
                        direction: "vertical"
                    },
                    {
                        word: "PATIENT",
                        clue: "First quality of true love",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4]],
                        direction: "vertical"
                    },
                    {
                        word: "LONGSUFFERING",
                        clue: "Capacity to endure without wearying",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8], [8,8], [7,8], [6,8]],
                        direction: "bent"
                    },
                    {
                        word: "WAITING",
                        clue: "Wisdom of one who loves patiently",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7]],
                        direction: "bent"
                    },
                    {
                        word: "GENTLENESS",
                        clue: "Tender attitude of patient love",
                        path: [[6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5], [8,5]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 72 - 1 Corinthians 13: Love is kind (10x10 grid)
                words: [
                    {
                        word: "KIND",
                        clue: "Second quality of love that gives",
                        path: [[1,2], [2,2], [3,2], [4,2]],
                        direction: "vertical"
                    },
                    {
                        word: "GOODNESS",
                        clue: "Active benevolence toward others",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4]],
                        direction: "vertical"
                    },
                    {
                        word: "GENEROUS",
                        clue: "Heart's disposition that loves to serve",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]],
                        direction: "vertical"
                    },
                    {
                        word: "COMPASSION",
                        clue: "Feeling that moves us to serve others",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4]],
                        direction: "bent"
                    },
                    {
                        word: "GIFT",
                        clue: "Natural act of kindness in love",
                        path: [[7,0], [8,0], [9,0], [9,1]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 73 - 1 Corinthians 13: Love is not jealous (10x10 grid)
                words: [
                    {
                        word: "JEALOUSY",
                        clue: "What authentic love never knows",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]],
                        direction: "vertical"
                    },
                    {
                        word: "ENVY",
                        clue: "Unhealthy desire absent from true love",
                        path: [[0,4], [1,4], [2,4], [3,4]],
                        direction: "vertical"
                    },
                    {
                        word: "CONTENTMENT",
                        clue: "Satisfaction that replaces jealousy",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7], [9,8], [8,8]],
                        direction: "bent"
                    },
                    {
                        word: "REJOICE",
                        clue: "Love's response to another's joy",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]],
                        direction: "bent"
                    },
                    {
                        word: "CELEBRATE",
                        clue: "Love honors the success of others",
                        path: [[6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [8,4]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 74 - 1 Corinthians 13: Love does not boast (10x10 grid)
                words: [
                    {
                        word: "BOASTING",
                        clue: "Attitude foreign to true love",
                        path: [[1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1]],
                        direction: "vertical"
                    },
                    {
                        word: "PRIDE",
                        clue: "What love never puffs itself up with",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4]],
                        direction: "vertical"
                    },
                    {
                        word: "HUMILITY",
                        clue: "Virtue opposite to boasting",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6]],
                        direction: "vertical"
                    },
                    {
                        word: "MODESTY",
                        clue: "Simplicity of one who truly loves",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7]],
                        direction: "bent"
                    },
                    {
                        word: "HUMBLE",
                        clue: "Character of love that seeks no attention",
                        path: [[6,0], [7,0], [8,0], [9,0], [9,1], [9,2]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 75 - 1 Corinthians 13: Love bears all things (10x10 grid)
                words: [
                    {
                        word: "BEARSALL",
                        clue: "Love covers every fault",
                        path: [[0,1], [1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1]],
                        direction: "vertical"
                    },
                    {
                        word: "BELIEVESALL",
                        clue: "Love trusts without limits",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [9,5]],
                        direction: "bent"
                    },
                    {
                        word: "HOPESALL",
                        clue: "Love keeps hope in every circumstance",
                        path: [[3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [9,7]],
                        direction: "bent"
                    },
                    {
                        word: "ENDURESALL",
                        clue: "Love endures all things with patience",
                        path: [[5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6], [9,5], [9,4], [9,3]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 76 - 1 Corinthians 13: Love never fails (10x10 grid)
                words: [
                    {
                        word: "NEVER",
                        clue: "Love's temporality - it does not end",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2]],
                        direction: "vertical"
                    },
                    {
                        word: "ETERNAL",
                        clue: "Timeless nature of true love",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4]],
                        direction: "vertical"
                    },
                    {
                        word: "ABIDE",
                        clue: "What faith, hope and love all do",
                        path: [[2,6], [3,6], [4,6], [5,6], [6,6]],
                        direction: "vertical"
                    },
                    {
                        word: "ENDURING",
                        clue: "Stable character of divine love",
                        path: [[4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [9,7], [9,6]],
                        direction: "bent"
                    },
                    {
                        word: "NEVERFAILS",
                        clue: "Central affirmation: love never falls",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5]],
                        direction: "bent"
                    }
                ]
            },
            {
                // Level 77 - 1 Corinthians 13: Love is the greatest (10x10 grid)
                words: [
                    {
                        word: "GREATEST",
                        clue: "Supremacy of love over all virtues",
                        path: [[1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2]],
                        direction: "vertical"
                    },
                    {
                        word: "FAITH",
                        clue: "First of three virtues that remain",
                        path: [[0,4], [1,4], [2,4], [3,4], [4,4]],
                        direction: "vertical"
                    },
                    {
                        word: "HOPE",
                        clue: "Second of three virtues that remain",
                        path: [[2,6], [3,6], [4,6], [5,6]],
                        direction: "vertical"
                    },
                    {
                        word: "LOVE",
                        clue: "Third and greatest of virtues that remain",
                        path: [[4,8], [5,8], [6,8], [7,8]],
                        direction: "vertical"
                    },
                    {
                        word: "EXCELLENCE",
                        clue: "Supreme quality of agape love",
                        path: [[5,0], [6,0], [7,0], [8,0], [9,0], [9,1], [9,2], [9,3], [9,4], [9,5]],
                        direction: "bent"
                    }
                ]
            }
        ]
    }
};

class GameDataManager {
    constructor() {
        this.data = gameData;
        this.currentLanguage = 'fr';
        this.fallbackLanguage = 'fr'; // Toujours le français comme fallback
    }

    /**
     * Change la langue courante
     * @param {string} lang - Code de la langue
     * @returns {boolean} - true si la langue existe
     */
    setLanguage(lang) {
        // Accepter n'importe quelle langue, même si elle n'a pas encore de niveaux traduits
        this.currentLanguage = lang;

        // Créer une entrée vide si elle n'existe pas encore
        if (!this.data[lang]) {
            this.data[lang] = { levels: [] };
        }

        return true;
    }

    /**
     * Récupère un niveau avec fallback automatique vers le français
     * @param {number} levelNumber - Numéro du niveau (1-based)
     * @returns {Object|null} - Données du niveau ou null
     */
    getLevelData(levelNumber) {
        // Déterminer la source de données selon le mode de jeu
        const gameMode = window.game?.gameMode || 'normal';
        
        // Mode Veiller: utiliser les données spécifiques
        if (gameMode === 'veiller' && typeof levelsVeiller !== 'undefined') {
            if (levelNumber < 1 || levelNumber > levelsVeiller.length) {
                return null;
            }
            return levelsVeiller[levelNumber - 1];
        }
        
        // Mode Disciple: utiliser les données spécifiques
        if (gameMode === 'disciple' && typeof levelsDisciple !== 'undefined') {
            if (levelNumber < 1 || levelNumber > levelsDisciple.length) {
                return null;
            }
            return levelsDisciple[levelNumber - 1];
        }
        
        // Mode Proverbes: utiliser les données spécifiques
        if (gameMode === 'proverbes' && typeof levelsProverbes !== 'undefined') {
            if (levelNumber < 1 || levelNumber > levelsProverbes.length) {
                return null;
            }
            return levelsProverbes[levelNumber - 1];
        }
        
        // Mode Sagesse: utiliser les données spécifiques
        if (gameMode === 'sagesse' && typeof levelsSagesse !== 'undefined') {
            if (levelNumber < 1 || levelNumber > levelsSagesse.length) {
                return null;
            }
            return levelsSagesse[levelNumber - 1];
        }
        
        // Mode Couple: utiliser les données spécifiques
        if (gameMode === 'couple' && typeof coupleChretienData !== 'undefined') {
            if (levelNumber < 1 || levelNumber > coupleChretienData.levels.length) {
                return null;
            }
            return coupleChretienData.levels[levelNumber - 1];
        }

        // Mode Normal: utiliser les données standards
        if (levelNumber < 1 || levelNumber > 77) {
            return null;
        }

        // Essayer d'abord la langue courante
        const currentLevels = this.data[this.currentLanguage]?.levels;
        if (currentLevels && currentLevels[levelNumber - 1]) {
            return currentLevels[levelNumber - 1];
        }

        // Fallback vers le français
        const fallbackLevels = this.data[this.fallbackLanguage]?.levels;
        if (fallbackLevels && fallbackLevels[levelNumber - 1]) {
            console.log(`Niveau ${levelNumber}: Fallback vers ${this.fallbackLanguage} pour ${this.currentLanguage}`);
            return fallbackLevels[levelNumber - 1];
        }

        return null;
    }

    /**
     * Récupère le nombre total de niveaux selon le mode de jeu
     * @returns {number} - Nombre total de niveaux
     */
    getTotalLevels() {
        const gameMode = window.game?.gameMode || 'normal';
        
        // Mode Veiller: 88 niveaux
        if (gameMode === 'veiller' && typeof levelsVeiller !== 'undefined') {
            return levelsVeiller.length;
        }
        
        // Mode Disciple: 88 niveaux
        if (gameMode === 'disciple' && typeof levelsDisciple !== 'undefined') {
            return levelsDisciple.length;
        }
        
        // Mode Proverbes: 88 niveaux
        if (gameMode === 'proverbes' && typeof levelsProverbes !== 'undefined') {
            return levelsProverbes.length;
        }
        
        // Mode Sagesse: 88 niveaux
        if (gameMode === 'sagesse' && typeof levelsSagesse !== 'undefined') {
            return levelsSagesse.length;
        }
        
        // Mode Couple: 122 niveaux
        if (gameMode === 'couple' && typeof coupleChretienData !== 'undefined') {
            return coupleChretienData.levels.length;
        }
        
        // Mode Normal: 77 niveaux (toujours en français)
        return this.data[this.fallbackLanguage]?.levels.length || 77;
    }

    /**
     * Récupère tous les niveaux avec fallback
     * @returns {Array} - Tableau de tous les niveaux
     */
    getAllLevels() {
        const totalLevels = this.getTotalLevels();
        const levels = [];

        for (let i = 1; i <= totalLevels; i++) {
            const level = this.getLevelData(i);
            if (level) {
                levels.push(level);
            }
        }

        return levels;
    }

    /**
     * Vérifie si un niveau est traduit dans la langue courante
     * @param {number} levelNumber - Numéro du niveau
     * @returns {boolean} - true si traduit, false si fallback
     */
    isLevelTranslated(levelNumber) {
        if (this.currentLanguage === this.fallbackLanguage) {
            return true;
        }

        const currentLevels = this.data[this.currentLanguage]?.levels;
        return !!(currentLevels && currentLevels[levelNumber - 1]);
    }

    /**
     * Obtient les statistiques de traduction pour la langue courante
     * @returns {Object} - Stats {total, translated, percentage}
     */
    getTranslationStats() {
        const total = this.getTotalLevels();
        const currentLevels = this.data[this.currentLanguage]?.levels || [];
        const translated = currentLevels.length;

        return {
            total,
            translated,
            percentage: Math.round((translated / total) * 100)
        };
    }
}

// Exporter une instance unique
const gameDataManager = new GameDataManager();

// Pour les environnements ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = gameDataManager;
}

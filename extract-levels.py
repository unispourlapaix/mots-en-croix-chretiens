#!/usr/bin/env python3
"""
Script to extract French levels from gameData.js and create modular level files
"""

import re
import json

# Read the gameData.js file
with open('js/gameData.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the French levels section
# Pattern: fr: { levels: [ ... ] }
fr_match = re.search(r'fr:\s*\{\s*levels:\s*\[(.*?)\]\s*\}', content, re.DOTALL)

if fr_match:
    levels_content = fr_match.group(1)

    # Write the French levels to a new file
    with open('js/levels/levels-fr.js', 'w', encoding='utf-8') as f:
        f.write('// Niveaux en français pour Mots En Croix Chrétiens\n')
        f.write('// 77 niveaux avec mots croisés chrétiens\n\n')
        f.write('const levelsFR = [\n')
        f.write(levels_content)
        f.write('\n];\n\n')
        f.write('// Export pour utilisation modulaire\n')
        f.write('if (typeof module !== \'undefined\' && module.exports) {\n')
        f.write('    module.exports = levelsFR;\n')
        f.write('}\n')

    print('OK - Niveaux francais extraits vers js/levels/levels-fr.js')
else:
    print('ERREUR - Impossible de trouver les niveaux francais')

# Find the Spanish levels section
es_match = re.search(r'es:\s*\{\s*levels:\s*\[(.*?)\]\s*\}', content, re.DOTALL)

if es_match:
    levels_content = es_match.group(1)

    # Write the Spanish levels to a new file
    with open('js/levels/levels-es.js', 'w', encoding='utf-8') as f:
        f.write('// Niveles en español para Mots En Croix Chrétiens\n')
        f.write('// Niveles con crucigramas cristianos\n\n')
        f.write('const levelsES = [\n')
        f.write(levels_content)
        f.write('\n];\n\n')
        f.write('// Export para uso modular\n')
        f.write('if (typeof module !== \'undefined\' && module.exports) {\n')
        f.write('    module.exports = levelsES;\n')
        f.write('}\n')

    print('OK - Niveaux espagnols extraits vers js/levels/levels-es.js')
else:
    print('ERREUR - Impossible de trouver les niveaux espagnols')

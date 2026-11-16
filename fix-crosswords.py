#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour corriger les niveaux de coupleChretienData.js
Crée de vraies croix avec des lettres communes partagées
"""

import re
import json

def find_common_letters(word1, word2):
    """Trouve toutes les lettres communes entre deux mots avec leurs positions"""
    common = []
    for i, char1 in enumerate(word1):
        for j, char2 in enumerate(word2):
            if char1 == char2:
                common.append({'letter': char1, 'pos1': i, 'pos2': j})
    return common

def find_best_common_letter(word1, word2):
    """Trouve la meilleure lettre commune pour créer une croix équilibrée"""
    commons = find_common_letters(word1, word2)
    if not commons:
        return None
    
    # Préférer une lettre au milieu des mots pour un meilleur équilibre visuel
    best = None
    best_score = float('inf')
    
    for c in commons:
        # Score basé sur la distance par rapport au milieu de chaque mot
        mid1 = len(word1) / 2
        mid2 = len(word2) / 2
        score = abs(c['pos1'] - mid1) + abs(c['pos2'] - mid2)
        
        if score < best_score:
            best_score = score
            best = c
    
    return best

def generate_horizontal_path(row, start_col, length):
    """Génère un chemin horizontal"""
    return [[row, start_col + i] for i in range(length)]

def generate_vertical_path(start_row, col, length):
    """Génère un chemin vertical"""
    return [[start_row + i, col] for i in range(length)]

def create_crossword_paths(word1, word2):
    """Crée les chemins pour que les mots se croisent vraiment"""
    common = find_best_common_letter(word1, word2)
    
    if not common:
        # Pas de lettre commune : placer perpendiculairement sans croisement
        # Utiliser un décalage pour éviter le chevauchement
        print(f"  ⚠️ Aucune lettre commune entre '{word1}' et '{word2}'")
        return {
            'word1': generate_horizontal_path(2, 1, len(word1)),
            'word2': generate_vertical_path(0, len(word1) + 2, len(word2))
        }
    
    # Place le mot 1 horizontalement au centre
    row1 = max(common['pos2'], 2)  # Assure qu'il y a de l'espace en haut
    col1_start = max(2, 10 - len(word1) // 2)  # Centre approximatif
    word1_path = generate_horizontal_path(row1, col1_start, len(word1))
    
    # Place le mot 2 verticalement pour croiser au point commun
    intersection_col = col1_start + common['pos1']
    row2_start = row1 - common['pos2']
    word2_path = generate_vertical_path(row2_start, intersection_col, len(word2))
    
    print(f"  ✓ '{word1}' et '{word2}' croisés sur '{common['letter']}' à [{row1},{intersection_col}]")
    
    return {
        'word1': word1_path,
        'word2': word2_path
    }

def format_path(path):
    """Formate un path pour l'insertion dans le JS"""
    formatted = ', '.join([f"[{p[0]},{p[1]}]" for p in path])
    return f"[{formatted}]"

# Lecture du fichier
print("📖 Lecture du fichier coupleChretienData.js...")
with open('js/coupleChretienData.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extraire tous les niveaux
print("\n🔍 Analyse des niveaux...")
level_pattern = r'\{\s*words:\s*\[(.*?)\]\s*\}'
levels = re.findall(level_pattern, content, re.DOTALL)

print(f"Trouvé {len(levels)} niveaux\n")

# Analyse et génération des corrections
replacements = []
level_num = 0

for level_content in levels:
    level_num += 1
    
    # Extraire les mots
    word_pattern = r'word:\s*"([^"]+)"'
    words = re.findall(word_pattern, level_content)
    
    if len(words) != 2:
        print(f"❌ Niveau {level_num}: Nombre de mots incorrect ({len(words)})")
        continue
    
    word1, word2 = words
    print(f"Niveau {level_num}: {word1} × {word2}")
    
    # Créer les nouveaux chemins
    paths = create_crossword_paths(word1, word2)
    
    # Extraire les anciens paths
    old_path_pattern = r'path:\s*(\[\[.*?\]\])'
    old_paths = re.findall(old_path_pattern, level_content)
    
    if len(old_paths) != 2:
        print(f"  ❌ Impossible d'extraire les anciens paths")
        continue
    
    # Créer les remplacements
    new_path1 = format_path(paths['word1'])
    new_path2 = format_path(paths['word2'])
    
    # Trouver et remplacer les anciens paths
    # On cherche le pattern complet pour chaque mot
    word1_block = re.search(
        rf'word:\s*"{re.escape(word1)}",\s*clue:.*?path:\s*(\[\[.*?\]\])',
        level_content,
        re.DOTALL
    )
    
    word2_block = re.search(
        rf'word:\s*"{re.escape(word2)}",\s*clue:.*?path:\s*(\[\[.*?\]\])',
        level_content,
        re.DOTALL
    )
    
    if word1_block and word2_block:
        replacements.append({
            'level': level_num,
            'word1': word1,
            'word2': word2,
            'old_path1': word1_block.group(1),
            'new_path1': new_path1,
            'old_path2': word2_block.group(1),
            'new_path2': new_path2
        })

print(f"\n✅ Analyse terminée: {len(replacements)} niveaux à corriger")

# Sauvegarder les remplacements dans un fichier JSON
with open('crossword-replacements.json', 'w', encoding='utf-8') as f:
    json.dump(replacements, f, indent=2, ensure_ascii=False)

print("\n📝 Remplacements sauvegardés dans crossword-replacements.json")
print("\nRésumé:")
print(f"  - Total de niveaux analysés: {len(levels)}")
print(f"  - Niveaux à corriger: {len(replacements)}")

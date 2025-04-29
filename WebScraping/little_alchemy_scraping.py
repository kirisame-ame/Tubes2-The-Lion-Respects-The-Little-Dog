from bs4 import BeautifulSoup
import requests
import csv
import json
from collections import defaultdict

def clean_recipe(recipe):
    """Clean and format recipe combinations"""
    # Split and filter empty components
    parts = [p.strip() for p in recipe.split('+') if p.strip()]
    # Remove duplicates while preserving order
    seen = set()
    return ' + '.join([x for x in parts if not (x in seen or seen.add(x))])

# Fetch and parse webpage
page = requests.get("https://little-alchemy.fandom.com/wiki/Elements_(Little_Alchemy_2)#Tier_2_elements")
soup = BeautifulSoup(page.content, 'html.parser')

data = []

# Process tier sections
for header in soup.find_all(['h2', 'h3']):
    if 'tier' in header.text.lower():
        category = header.get_text(strip=True).replace(' [edit]', '').replace('[]', '')
        table = header.find_next('table')
        
        if table:
            for row in table.find_all('tr')[1:]:  # Skip header row
                cells = row.find_all('td')
                if len(cells) >= 2:
                    element = cells[0].get_text(strip=True)
                    
                    # Process recipes
                    recipes = []
                    list_items = cells[1].find_all('li')
                    
                    if list_items:
                        for li in list_items:
                            raw = li.get_text('+', strip=True)
                            recipes.append(clean_recipe(raw))
                    else:
                        raw = cells[1].get_text('+', strip=True)
                        recipes.append(clean_recipe(raw))
                    
                    # Remove duplicate recipes
                    unique_recipes = []
                    seen = set()
                    for r in recipes:
                        if r not in seen:
                            seen.add(r)
                            unique_recipes.append(r)
                    
                    data.append({
                        'Category': category,
                        'Element': element,
                        'Recipes': ' | '.join(unique_recipes)
                    })

# Write to CSV
with open('data/elements.csv', 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['Category', 'Element', 'Recipes']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader()
    writer.writerows(data)

print(f"Clean CSV created with {len(data)} entries!")

# Read CSV data
with open('data/elements.csv', 'r') as f:
    csv_data = csv.DictReader(f)
    tier_data = defaultdict(list)
    
    for row in csv_data:
        # Process recipes
        recipes = []
        for combination in row['Recipes'].split(' | '):
            components = [c.strip() for c in combination.split(' + ') if c.strip()]
            recipes.append(components)
        
        # Structure element data
        element_entry = {
            "element": row['Element'],
            "recipes": recipes
        }
        
        tier_data[row['Category']].append(element_entry)

# Convert to final JSON structure
json_output = {tier: elements for tier, elements in tier_data.items()}

# Save to file
with open('data/elements.json', 'w') as f:
    json.dump(json_output, f, indent=2)

print("JSON conversion complete!")
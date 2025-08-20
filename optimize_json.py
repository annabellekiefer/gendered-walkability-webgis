import json
import sys

def round_coordinates(obj, precision=6):
    if isinstance(obj, dict):
        return {k: round_coordinates(v, precision) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [round_coordinates(item, precision) for item in obj]
    elif isinstance(obj, float):
        return round(obj, precision)
    return obj

# Datei einlesen
with open(sys.argv[1], 'r') as f:
    data = json.load(f)

# Koordinaten runden
data = round_coordinates(data)

# Kompakt speichern (ohne Leerzeichen)
with open(sys.argv[1].replace('.json', '_optimized.json'), 'w') as f:
    json.dump(data, f, separators=(',', ':'))

print(f"Optimiert: {sys.argv[1]}")
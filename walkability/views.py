from django.shortcuts import render

import json
from django.http import JsonResponse
from django.conf import settings
import os

def edge_geojson(request):
    fname = 'edge.json'  
    path = os.path.join(settings.BASE_DIR, 'walkability', 'static', 'walkability', 'data', fname)
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return JsonResponse(data, safe=False)

def index(request):
    return render(request, 'walkability/index.html')


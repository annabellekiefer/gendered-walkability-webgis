# Interactive WebGIS for gender-sensitive Walkability Assessment in Salzburg

<img width="2552" height="1180" alt="image" src="https://github.com/user-attachments/assets/f5314781-2b4b-4320-b6a3-34ba2d285acd" />

This project presents an **interactive WebGIS** that evaluates walkability in Salzburg with a focus on **gender-sensitive user profiles**.  
While traditional walkability assessments use general indicators, this project adapts the **NetAScore toolbox** with customized weights and indicators for two specific groups:

- **Women walking at night** (focus on lighting, safety, active street fronts)  
- **Caregivers with young children or strollers** (focus on accessibility, gradient, sidewalks, child-friendly facilities)

The results are visualized in an [interactive WebGIS](https://annabellekiefer.github.io/gendered-walkability-webgis/) that allows users to explore differences in walkability across profiles.

---

## Project Structure

```
gendered-walkability-webgis/
│
├── config/                 # Django project configuration (settings, urls)
├── walkability/            # Django app with models, views, templates, static files
│   ├── static/             # JavaScript, CSS, and GeoJSON data
│   ├── templates/          # HTML templates for the WebGIS
│   └── data/               # Input data (JSON)
│
├── netascore/              # NetAScore integration (Docker, configs, SQL, Python scripts)
│   └── data/               # YAML configurations, OSM-derived data, DEM input
│
├── convert_gpkg_to_geojson.py  # Script to convert NetAScore outputs for the WebGIS
├── requirements.txt           # Python dependencies
└── docker-compose.yml         # Docker setup for NetAScore
```

- **Large files** (e.g., `.json` with computed walkability indices) are handled via [Git LFS](https://git-lfs.com/).  
- **Raster data** (e.g., `*.tif`) is ignored in `.gitignore` and must be downloaded manually. 
---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/annabellekiefer/gendered-walkability-webgis.git
cd gendered-walkability-webgis
```

### 2. Install dependencies
Create and activate a virtual environment, then install requirements:
```bash
python -m venv venv
source venv/bin/activate   # (Linux/Mac)
venv\Scripts\activate      # (Windows PowerShell)

pip install -r requirements.txt
```

### 3. Download required data
- **DEM (Digital Elevation Model)**: Required to compute gradient indicators. Download a DEM for [Austria](https://www.data.gv.at/katalog/dataset/b5de6975-417b-4320-afdb-eb2a9e2a1dbf) 

- Place the DEM in `netascore/data/`.  
- Additional input data (OSM extracts, YAML configuration files) are managed within the `netascore/data/` folder.

### 4. Run NetAScore with Docker
Build and run the NetAScore container with:
```bash
docker compose up
```

This will execute the NetAScore workflow and produce walkability indices (geopackages), which can be converted to GeoJSON via:
```bash
python convert_gpkg_to_geojson.py
```

### 5. Run the Django WebGIS
```bash
python manage.py runserver
```

Visit the application locally at:  
http://127.0.0.1:8000/

---

## Documentation

This project is based on the **NetAScore toolbox**:  
[NetAScore Documentation][(https://doi.org/10.1177/23998083241293177)](https://github.com/plus-mobilitylab/netascore-documentation)

The methods extend NetAScore by integrating gender-sensitive indicators such as:
- **Lighting conditions (lit attribute from OSM)**
- **Filtered facility types (night safety facilities, child-friendly amenities)**

---

---

## Credits

- **Project Author**: Annabelle Kiefer 
- Developed as part of the course *Application Development (GIS), University of Salzburg* (2025).

- *Data analysis powered by NetAScore:* 
*Werner, C., Wendel, R., Kaziyeva, D., Stutz, P., van der Meer, L., Effertz, L., Zagel, B., & Loidl, M. (2024). NetAScore: An open and extendible software for segment-scale bikeability and walkability. Environment and Planning B: Urban Analytics and City Science, 0(0). https://doi.org/10.1177/23998083241293177*

---


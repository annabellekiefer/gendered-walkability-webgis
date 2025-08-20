import geopandas as gpd
from pathlib import Path

# Input path & output path
input_path = Path(r"C:\Users\annab\Documents\Master CDE\2.Semester\AD_GIS\gendered-walkability-webgis\netascore\data\netascore_salzburg_walk.gpkg")
output_path = Path(r"C:\Users\annab\Documents\Master CDE\2.Semester\AD_GIS\gendered-walkability-webgis\walkability\static\walkability\data\netascore_salzburg_walk.json")

def convert_gpkg_to_geojson(input_file, output_file):
    print(f"Lade {input_file} ...")
    gdf = gpd.read_file(input_file)
    print(f"{len(gdf)} Features geladen.")

    # Reprojection to WGS 84
    gdf = gdf.to_crs("EPSG:4326")
    print("Reprojection to WGS 84. ")

    print(f"Speichere als {output_file} ...")
    gdf.to_file(output_file, driver="GeoJSON")
    print("✅")

if __name__ == "__main__":
    convert_gpkg_to_geojson(input_path, output_path)

from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('edge/', views.edge_geojson, name='edge_geojson')
]
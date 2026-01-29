import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Typography, Grid, Paper, Tabs, Tab, 
    IconButton, Button, TextField, FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import { Project, KMLData } from '../../types';
import { 
    Layers, MapPinned, Eye, EyeOff, Search, Locate, Upload, File
} from 'lucide-react';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Import omnivore for KML support
// @ts-ignore
import * as omnivore from '@mapbox/leaflet-omnivore';

// Fix for default icons when using webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Extend L with omnivore for KML support
(L as any).omnivore = omnivore;

interface Props {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

interface GISLayer {
    id: string;
    name: string;
    layer: any;
    visible: boolean;
    isAlignment: boolean;
}

interface ChainageMarker {
    id: string;
    position: [number, number];
    chainage: string;
    marker: any;
}

const MapModule: React.FC<Props> = ({ project, onProjectUpdate }) => {
  const mapRef = useRef<any>(null);
  const mapContainerId = 'leaflet-map-container';
  
  const [activeTab, setActiveTab] = useState(0);
  const [mapCursorPos, setMapCursorPos] = useState({ lat: 0, lng: 0 });
  const [activeOverlays, setActiveOverlays] = useState<Record<string, GISLayer>>({});
  const [kmlFiles, setKmlFiles] = useState<KMLData[]>(project.kmlData || []);
  const [kmlLayers, setKmlLayers] = useState<any[]>([]);
  const [chainageMarkers, setChainageMarkers] = useState<ChainageMarker[]>([]);
  const [vehicleMarkers, setVehicleMarkers] = useState<any[]>([]);
  const [assetMarkers, setAssetMarkers] = useState<any[]>([]);
  const [staffMarkers, setStaffMarkers] = useState<any[]>([]);
  const [structureMarkers, setStructureMarkers] = useState<any[]>([]);

  useEffect(() => {
      if (!document.getElementById(mapContainerId) || mapRef.current) return;
      
      const baseLayers = {
          'Street': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
          'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'),
          'Dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png')
      };

      const map = L.map(mapContainerId, {
          zoomControl: false,
          layers: [baseLayers.Street] // Default layer
      }).setView([27.6600, 83.4650], 14);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.control.layers(baseLayers).addTo(map); // Add layer control

      const searchControl = new (GeoSearchControl as any)({
        provider: new OpenStreetMapProvider(),
        style: 'bar',
      });
      map.addControl(searchControl);

      mapRef.current = map;
      map.on('mousemove', (e: any) => setMapCursorPos({ lat: e.latlng.lat, lng: e.latlng.lng }));
      
      // Restore KML layers from project data if any
      if (project.kmlData && project.kmlData.length > 0) {
        project.kmlData.forEach((kmlData: KMLData) => {
          try {
            // Using leaflet-omnivore to parse KML
            // Check if omnivore is available
            if ((L as any).omnivore) {
              const kmlLayer = (L as any).omnivore.kml.parse(kmlData.content);
              kmlLayer.addTo(map);
              kmlLayer.bindPopup((layer: any) => {
                return layer.feature.properties.description || layer.feature.properties.name || 'KML Feature';
              });
                
                const gisLayer: GISLayer = {
                  id: kmlData.id,
                  name: kmlData.name,
                  layer: kmlLayer,
                  visible: true,
                  isAlignment: false
                };
                
                setActiveOverlays(prev => ({ ...prev, [kmlData.id]: gisLayer }));
                setKmlLayers(prev => [...prev, kmlLayer]);
              } else {
                // Alternative approach using DOMParser if omnivore is not available
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(kmlData.content, 'text/xml');
                const placemarks = xmlDoc.getElementsByTagName('Placemark');
                
                if (placemarks.length > 0) {
                  const coordinates = [];
                  for (let i = 0; i < placemarks.length; i++) {
                    const placemark = placemarks[i];
                    const coordElement = placemark.getElementsByTagName('coordinates')[0];
                    if (coordElement) {
                      const coords = coordElement.textContent?.trim().split(' ');
                      if (coords) {
                        coords.forEach(coordStr => {
                          const [lng, lat] = coordStr.split(',').map(Number);
                          if (!isNaN(lat) && !isNaN(lng)) {
                            coordinates.push([lat, lng]);
                          }
                        });
                      }
                    }
                  }
                  
                  if (coordinates.length > 0) {
                    const layerGroup = L.layerGroup();
                    const polyline = L.polyline(coordinates, {color: 'red'}).addTo(layerGroup);
                    layerGroup.addTo(map);
                    
                    const gisLayer: GISLayer = {
                      id: kmlData.id,
                      name: kmlData.name,
                      layer: layerGroup,
                      visible: true,
                      isAlignment: false
                    };
                    
                    setActiveOverlays(prev => ({ ...prev, [kmlData.id]: gisLayer }));
                    setKmlLayers(prev => [...prev, layerGroup]);
                  }
                }
              }
          } catch (error) {
            console.error('Error loading KML layer:', error);
          }
        });
      }
      
      // Display all project elements once the map is initialized
      setTimeout(() => {
        displayAllElements();
        displayChainageMarkers();
      }, 500);
      
      return () => { 
          if (mapRef.current) { 
              mapRef.current.remove(); 
              mapRef.current = null; 
          } 
      };
  }, [project]);

  // Define missing functions
  const displayStructures = () => {
    if (!mapRef.current) return;
    
    // Clear existing structure markers
    structureMarkers.forEach(marker => mapRef.current.removeLayer(marker));
    setStructureMarkers([]);
    
    const newMarkers: any[] = [];
    
    (project.structures || []).forEach(structure => {
      // Structures don't have direct coordinates, skip for now
      // We could implement a reverse geocoding of the location field if needed
      // For now, just skip adding markers for structures
    });
    
    setStructureMarkers(newMarkers);
  };
  
  const displayVehicles = () => {
    if (!mapRef.current) return;
    
    // Clear existing vehicle markers
    vehicleMarkers.forEach(marker => mapRef.current.removeLayer(marker));
    setVehicleMarkers([]);
    
    const newMarkers: any[] = [];
    
    (project.vehicles || []).forEach(vehicle => {
      // Use GPS location or last known location from the vehicle
      let lat, lng;
      
      if (vehicle.gpsLocation && typeof vehicle.gpsLocation.latitude === 'number' && typeof vehicle.gpsLocation.longitude === 'number') {
        lat = vehicle.gpsLocation.latitude;
        lng = vehicle.gpsLocation.longitude;
      } else if (vehicle.lastKnownLocation && typeof vehicle.lastKnownLocation.latitude === 'number' && typeof vehicle.lastKnownLocation.longitude === 'number') {
        lat = vehicle.lastKnownLocation.latitude;
        lng = vehicle.lastKnownLocation.longitude;
      } else {
        // Skip if no valid coordinates available
        return;
      }
      
      // Validate coordinates
      if (isNaN(lat) || isNaN(lng)) {
        return; // Skip invalid coordinates
      }
      
      // Different icons based on vehicle status
      let iconColor = '#3b82f6'; // blue for Active
      if (vehicle.status === 'Maintenance') iconColor = '#ef4444'; // red
      if (vehicle.status === 'Idle') iconColor = '#f59e0b'; // amber
      
      const vehicleIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${iconColor}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
            <path d="M14 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4"/> 
            <circle cx="7.5" cy="13.5" r=".5" fill="none"/> 
            <circle cx="15.5" cy="13.5" r=".5" fill="none"/> 
          </svg>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      const marker = L.marker([lat, lng], { icon: vehicleIcon })
        .addTo(mapRef.current)
        .bindPopup(`<b>${vehicle.plateNumber || 'Unknown Vehicle'}</b><br/>Type: ${vehicle.type}<br/>Status: ${vehicle.status}<br/>Chainage: ${vehicle.chainage || 'N/A'}<br/>Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      
      newMarkers.push(marker);
    });
    
    setVehicleMarkers(newMarkers);
  };
  
  const displayAssets = () => {
    if (!mapRef.current) return;
    
    // Clear existing asset markers
    assetMarkers.forEach(marker => mapRef.current.removeLayer(marker));
    setAssetMarkers([]);
    
    const newMarkers: any[] = [];
    
    // Since Project interface doesn't have 'assets' property, we'll skip adding asset markers
    // We could implement a location-based system for materials if needed
    // For now, just iterate over an empty array
    [].forEach(() => {});
    
    setAssetMarkers(newMarkers);
  };
  
  const displayStaff = () => {
    if (!mapRef.current) return;
    
    // Clear existing staff markers
    staffMarkers.forEach(marker => mapRef.current.removeLayer(marker));
    setStaffMarkers([]);
    
    const newMarkers: any[] = [];
    
    (project.staffLocations || []).forEach(staff => {
      // Use actual coordinates from the staff location data
      const lat = staff.latitude;
      const lng = staff.longitude;
      
      // Different icons based on staff status
      let iconColor = '#8b5cf6'; // purple for Active
      if (staff.status === 'Idle') iconColor = '#64748b'; // gray
      if (staff.status === 'Offline') iconColor = '#9ca3af'; // light gray
      
      const staffIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${iconColor}; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      
      const marker = L.marker([lat, lng], { icon: staffIcon })
        .addTo(mapRef.current)
        .bindPopup(`<b>${staff.userName}</b><br/>Role: ${staff.role}<br/>Status: ${staff.status}<br/>Time: ${new Date(staff.timestamp).toLocaleTimeString()}`);
      
      newMarkers.push(marker);
    });
    
    setStaffMarkers(newMarkers);
  };
  
  // Define displayAllElements function
  const displayAllElements = () => {
    displayVehicles();
    displayAssets();
    displayStaff();
    displayStructures();
  };

  const toggleOverlay = (id: string) => {
      const ov = activeOverlays[id];
      if (ov.visible) mapRef.current.removeLayer(ov.layer);
      else ov.layer.addTo(mapRef.current);
      setActiveOverlays(prev => ({ ...prev, [id]: { ...ov, visible: !ov.visible } }));
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            mapRef.current.setView([latitude, longitude], 16);
            L.marker([latitude, longitude]).addTo(mapRef.current)
                .bindPopup("You are here").openPopup();
        });
    }
  };

  const handleKmlImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files) as File[];
    
    newFiles.forEach(file => {
      if (file.type === 'application/vnd.google-earth.kml+xml' || file.name.toLowerCase().endsWith('.kml')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const kmlContent = e.target?.result as string;
          try {
            if (mapRef.current && kmlContent) {
              // Store KML content in project data
              const kmlData: KMLData = {
                id: `kml-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                content: kmlContent,
                timestamp: Date.now(),
                visible: true
              };
              
              setKmlFiles(prev => {
                const updated = [...prev, kmlData];
                // Update project with new KML data
                onProjectUpdate({ ...project, kmlData: updated });
                return updated;
              });
              // Using leaflet-omnivore to parse KML
              // Check if omnivore is available
              if ((L as any).omnivore) {
                const kmlLayer = (L as any).omnivore.kml.parse(kmlContent);
                kmlLayer.addTo(mapRef.current);
                kmlLayer.bindPopup((layer: any) => {
                  return layer.feature.properties.description || layer.feature.properties.name || 'KML Feature';
                });
                
                const layerId = kmlData.id; // Use the same ID as stored in localStorage
                const gisLayer: GISLayer = {
                  id: layerId,
                  name: file.name,
                  layer: kmlLayer,
                  visible: true,
                  isAlignment: false
                };
                
                setActiveOverlays(prev => ({ ...prev, [layerId]: gisLayer }));
                setKmlLayers(prev => [...prev, kmlLayer]);
                
                // Update asset positions based on new KML data
                setTimeout(() => {
                  displayAssets();
                  displayChainageMarkers();
                }, 100);
              } else {
                // Alternative approach using DOMParser if omnivore is not available
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(kmlContent, 'text/xml');
                const placemarks = xmlDoc.getElementsByTagName('Placemark');
                
                if (placemarks.length > 0) {
                  const coordinates = [];
                  for (let i = 0; i < placemarks.length; i++) {
                    const placemark = placemarks[i];
                    const coordElement = placemark.getElementsByTagName('coordinates')[0];
                    if (coordElement) {
                      const coords = coordElement.textContent?.trim().split(' ');
                      if (coords) {
                        coords.forEach(coordStr => {
                          const [lng, lat] = coordStr.split(',').map(Number);
                          if (!isNaN(lat) && !isNaN(lng)) {
                            coordinates.push([lat, lng]);
                          }
                        });
                      }
                    }
                  }
                  
                  if (coordinates.length > 0) {
                    const layerGroup = L.layerGroup();
                    const polyline = L.polyline(coordinates, {color: 'red'}).addTo(layerGroup);
                    layerGroup.addTo(mapRef.current);
                    
                    const layerId = kmlData.id; // Use the same ID as stored in localStorage
                    const gisLayer: GISLayer = {
                      id: layerId,
                      name: file.name,
                      layer: layerGroup,
                      visible: true,
                      isAlignment: false
                    };
                    
                    setActiveOverlays(prev => ({ ...prev, [layerId]: gisLayer }));
                    setKmlLayers(prev => [...prev, layerGroup]);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error parsing KML file:', error);
          }
        };
        reader.readAsText(file);
      }
    });
    
    // Reset the input to allow importing the same file again
    (event.target as HTMLInputElement).value = '';
  };

  const removeKmlLayer = (layerId: string) => {
    const layerData = activeOverlays[layerId];
    if (layerData && mapRef.current) {
      mapRef.current.removeLayer(layerData.layer);
      const newActiveOverlays = { ...activeOverlays };
      delete newActiveOverlays[layerId];
      setActiveOverlays(newActiveOverlays);
      
      setKmlLayers(prev => prev.filter(layer => layer !== layerData.layer));
      setKmlFiles(prev => {
        const updated = prev.filter(file => file.id !== layerId);
        // Update project with removed KML data
        onProjectUpdate({ ...project, kmlData: updated });
        return updated;
      });
      
      // Update asset positions after removing KML layer
      setTimeout(() => {
        displayAssets();
        displayChainageMarkers();
      }, 100);
    }
  };

  // Function to add vehicle markers to the map

  

  // Helper function to calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Function to create chainage markers at 500m intervals along a path
  const createChainageMarkers = (pathCoords: [number, number][], kmlName: string) => {
    if (!mapRef.current || pathCoords.length < 2) return [];

    const newMarkers: ChainageMarker[] = [];
    let cumulativeDistance = 0;
    let nextMarkerDistance = 0;

    for (let i = 1; i < pathCoords.length; i++) {
      const [lat1, lng1] = pathCoords[i - 1];
      const [lat2, lng2] = pathCoords[i];
      
      const segmentDistance = calculateDistance(lat1, lng1, lat2, lng2);
      cumulativeDistance += segmentDistance;

      // Place markers at 500m intervals
      while (cumulativeDistance >= nextMarkerDistance) {
        // Calculate interpolation factor
        const remainingDistance = cumulativeDistance - nextMarkerDistance;
        const segmentRatio = Math.max(0, (segmentDistance - remainingDistance) / segmentDistance);
        
        const markerLat = lat1 + (lat2 - lat1) * segmentRatio;
        const markerLng = lng1 + (lng2 - lng1) * segmentRatio;
        
        const chainageValue = Math.floor(nextMarkerDistance / 500) * 500;
        const chainageText = `Chainage: ${chainageValue}m`;
        
        // Create a custom marker with chainage text
        const chainageIcon = L.divIcon({
          className: 'chainage-marker',
          html: `<div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; white-space: nowrap; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); text-align: center;">
            ${chainageText}<br/>
            <span style="font-size: 10px; opacity: 0.8; font-weight: normal;">${kmlName}</span>
          </div>`,
          iconSize: [120, 45],
          iconAnchor: [60, 22.5]
        });
        
        const marker = L.marker([markerLat, markerLng], { icon: chainageIcon })
          .addTo(mapRef.current);
        
        const markerId = `chainage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        newMarkers.push({
          id: markerId,
          position: [markerLat, markerLng],
          chainage: chainageText,
          marker: marker
        });
        
        nextMarkerDistance += 500; // Next marker at 500m interval
      }
    }
    
    return newMarkers;
  };

  // Function to add chainage markers for all KML layers
  const displayChainageMarkers = () => {
    if (!mapRef.current) return;
    
    // Remove existing chainage markers
    chainageMarkers.forEach(markerData => {
      if (mapRef.current.hasLayer(markerData.marker)) {
        mapRef.current.removeLayer(markerData.marker);
      }
    });
    setChainageMarkers([]);
    
    // Add chainage markers for each KML layer
    kmlLayers.forEach(layer => {
      if (layer.getLatLngs) {
        // Handle polyline/polygon layers
        let coords: [number, number][] = [];
        
        const latLngs = layer.getLatLngs();
        if (Array.isArray(latLngs)) {
          if (latLngs[0] && typeof latLngs[0] === 'object' && 'lat' in latLngs[0]) {
            // Simple array of latlngs
            coords = latLngs.map((ll: any) => [ll.lat, ll.lng] as [number, number]);
          } else if (Array.isArray(latLngs[0])) {
            // Array of arrays (for polygons)
            coords = latLngs.flat().map((ll: any) => [ll.lat, ll.lng] as [number, number]);
          }
        }
        
        if (coords.length > 0) {
          // Find the corresponding KML file name for this layer
          let kmlName = 'Road Alignment';
          for (const [id, overlay] of Object.entries(activeOverlays)) {
            if (overlay.layer === layer) {
              kmlName = overlay.name;
              break;
            }
          }
          const newMarkers = createChainageMarkers(coords, kmlName);
          setChainageMarkers(prev => [...prev, ...newMarkers]);
        }
      }
    });
  };

  // Clean up markers when component unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        vehicleMarkers.forEach(marker => mapRef.current.removeLayer(marker));
        assetMarkers.forEach(marker => mapRef.current.removeLayer(marker));
        staffMarkers.forEach(marker => mapRef.current.removeLayer(marker));
        chainageMarkers.forEach(marker => mapRef.current.removeLayer(marker.marker));
      }
    };
  }, []);

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
       <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
           <Box>
                <Typography variant="h5" fontWeight="900">Map Center</Typography>
                <Typography variant="body2" color="text.secondary">GIS Baseline & Asset Registry</Typography>
           </Box>
           <Box display="flex" gap={1.5} alignItems="center">
                <input
                  accept=".kml,application/vnd.google-earth.kml+xml"
                  id="kml-upload-button-file"
                  multiple
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleKmlImport}
                />
                <label htmlFor="kml-upload-button-file">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<Upload size={16} />}
                    size="small"
                  >
                    Import KML
                  </Button>
                </label>
                {kmlLayers.length > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MapPinned size={16} />}
                    onClick={() => {
                      // Calculate and display total chainage of loaded KML
                      let totalDistance = 0;
                      for (const kmlLayer of kmlLayers) {
                        if (kmlLayer.getLatLngs) {
                          let coords: [number, number][] = [];
                          
                          const latLngs = kmlLayer.getLatLngs();
                          if (Array.isArray(latLngs)) {
                            if (latLngs[0] && typeof latLngs[0] === 'object' && 'lat' in latLngs[0]) {
                              // Simple array of latlngs
                              coords = latLngs.map((ll: any) => [ll.lat, ll.lng] as [number, number]);
                            } else if (Array.isArray(latLngs[0])) {
                              // Array of arrays (for polygons)
                              coords = latLngs.flat().map((ll: any) => [ll.lat, ll.lng] as [number, number]);
                            }
                          }
                          
                          // Calculate total distance of this KML path
                          for (let i = 1; i < coords.length; i++) {
                            const [lat1, lng1] = coords[i - 1];
                            const [lat2, lng2] = coords[i];
                            totalDistance += calculateDistance(lat1, lng1, lat2, lng2);
                          }
                        }
                      }
                      alert(`Total chainage of loaded KML: ${(totalDistance / 1000).toFixed(2)} km (${Math.round(totalDistance)} m)`);
                    }}
                  >
                    Show KML Chainage
                  </Button>
                )}
           </Box>
       </Box>
       <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
           <Grid item xs={12} md={9}>
               <Paper sx={{ height: '100%', width: '100%', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                   <div id={mapContainerId} style={{ height: '100%', width: '100%' }} />
                   <Box sx={{ position: 'absolute', bottom: 20, left: 20, zIndex: 1000, display: 'flex', gap: 1 }}>
                        <Paper sx={{ p: 1.5, borderRadius: 2, display: 'flex', gap: 3, bgcolor: 'rgba(255,255,255,0.9)' }}>
                            <Typography variant="caption" fontWeight="900">LAT: {mapCursorPos.lat.toFixed(6)}</Typography>
                            <Typography variant="caption" fontWeight="900">LNG: {mapCursorPos.lng.toFixed(6)}</Typography>
                        </Paper>
                        <IconButton onClick={handleLocateMe} sx={{ bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2, '&:hover': { bgcolor: 'white' } }}>
                            <Locate size={18} />
                        </IconButton>
                   </Box>
               </Paper>
           </Grid>
           <Grid item xs={12} md={3}>
               <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden' }} variant="outlined">
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
                        <Tab icon={<Layers size={18}/>} label="Layers" />
                        <Tab icon={<MapPinned size={18}/>} label="Assets" />
                    </Tabs>
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                        {activeTab === 0 && ( // Layers tab
                            <>
                                {/* KML Overlays */}
                                <Box mb={2}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>KML Layers</Typography>
                                    {(Object.values(activeOverlays) as GISLayer[]).map(ov => (
                                        <Paper key={ov.id} variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" fontWeight="bold">{ov.name}</Typography>
                                            <Box display="flex" gap={0.5}>
                                                <IconButton size="small" onClick={() => toggleOverlay(ov.id)}>{ov.visible ? <Eye size={14}/> : <EyeOff size={14}/>}</IconButton>
                                                <IconButton size="small" onClick={() => removeKmlLayer(ov.id)} color="error"><File size={14}/></IconButton>
                                            </Box>
                                        </Paper>
                                    ))}
                                    {Object.keys(activeOverlays).length === 0 && (
                                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>No KML layers loaded.</Typography>
                                    )}
                                </Box>
                                
                                {/* Asset Layers */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Asset Visibility</Typography>
                                    <Paper variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" fontWeight="bold">Vehicles/Fleet</Typography>
                                        <Box display="flex" gap={0.5}>
                                            <IconButton size="small" onClick={() => {
                                              // Toggle vehicle markers visibility
                                              vehicleMarkers.forEach(marker => {
                                                if (mapRef.current.hasLayer(marker)) {
                                                  mapRef.current.removeLayer(marker);
                                                } else {
                                                  mapRef.current.addLayer(marker);
                                                }
                                              });
                                            }}>
                                              {vehicleMarkers.length > 0 ? <Eye size={14}/> : <EyeOff size={14}/>}</IconButton>
                                        </Box>
                                    </Paper>
                                    <Paper variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" fontWeight="bold">Structural Assets</Typography>
                                        <Box display="flex" gap={0.5}>
                                            <IconButton size="small" onClick={() => {
                                              // Toggle structural asset markers visibility
                                              assetMarkers.forEach(marker => {
                                                if (mapRef.current.hasLayer(marker)) {
                                                  mapRef.current.removeLayer(marker);
                                                } else {
                                                  mapRef.current.addLayer(marker);
                                                }
                                              });
                                            }}>
                                              {assetMarkers.length > 0 ? <Eye size={14}/> : <EyeOff size={14}/>}</IconButton>
                                        </Box>
                                    </Paper>
                                    <Paper variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" fontWeight="bold">Staff Locations</Typography>
                                        <Box display="flex" gap={0.5}>
                                            <IconButton size="small" onClick={() => {
                                              // Toggle staff markers visibility
                                              staffMarkers.forEach(marker => {
                                                if (mapRef.current.hasLayer(marker)) {
                                                  mapRef.current.removeLayer(marker);
                                                } else {
                                                  mapRef.current.addLayer(marker);
                                                }
                                              });
                                            }}>
                                              {staffMarkers.length > 0 ? <Eye size={14}/> : <EyeOff size={14}/>}</IconButton>
                                        </Box>
                                    </Paper>
                                    <Paper variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" fontWeight="bold">Chainage Markers</Typography>
                                        <Box display="flex" gap={0.5}>
                                            <IconButton size="small" onClick={() => {
                                              // Toggle chainage markers visibility
                                              chainageMarkers.forEach(markerData => {
                                                if (mapRef.current.hasLayer(markerData.marker)) {
                                                  mapRef.current.removeLayer(markerData.marker);
                                                } else {
                                                  mapRef.current.addLayer(markerData.marker);
                                                }
                                              });
                                            }}>
                                              {chainageMarkers.length > 0 ? <Eye size={14}/> : <EyeOff size={14}/>}</IconButton>
                                        </Box>
                                    </Paper>
                                </Box>
                            </>
                        )}
                        {activeTab === 1 && ( // Assets tab
                            <>
                                <Box mb={2}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Fleet ({project.vehicles.length})</Typography>
                                    {project.vehicles.map((vehicle, index) => (
                                        <Paper key={`vehicle-${index}`} variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="caption" fontWeight="bold">{vehicle.type}</Typography>
                                                <Typography variant="caption" color="text.secondary"> - {vehicle.plateNumber}</Typography>
                                            </Box>
                                            <Chip 
                                                label={vehicle.status} 
                                                size="small" 
                                                sx={{ 
                                                    fontSize: '0.7rem',
                                                    height: '20px',
                                                    ...(vehicle.status === 'Active' && { bgcolor: 'success.light', color: 'success.dark' }),
                                                    ...(vehicle.status === 'Maintenance' && { bgcolor: 'error.light', color: 'error.dark' }),
                                                    ...(vehicle.status === 'Idle' && { bgcolor: 'warning.light', color: 'warning.dark' })
                                                }} 
                                            />
                                        </Paper>
                                    ))}
                                </Box>
                                
                                <Box mb={2}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Structure Assets ({project.structures?.length || 0})</Typography>
                                    {project.structures?.map((asset, index) => (
                                        <Paper key={`asset-${index}`} variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="caption" fontWeight="bold">{asset.name}</Typography>
                                                <Typography variant="caption" color="text.secondary"> - {asset.type}</Typography>
                                            </Box>
                                            <Chip 
                                                label={asset.status} 
                                                size="small" 
                                                sx={{ 
                                                    fontSize: '0.7rem',
                                                    height: '20px',
                                                    ...(asset.status === 'Completed' && { bgcolor: 'success.light', color: 'success.dark' }),
                                                    ...(asset.status === 'In Progress' && { bgcolor: 'warning.light', color: 'warning.dark' }),
                                                    ...(asset.status === 'Not Started' && { bgcolor: 'grey.light', color: 'grey.dark' })
                                                }} 
                                            />
                                        </Paper>
                                    )) || <Typography variant="caption" color="text.secondary">No structure assets available</Typography>}
                                </Box>
                                
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Staff Locations ({project.staffLocations.length})</Typography>
                                    {project.staffLocations.map((staff, index) => (
                                        <Paper key={`staff-${index}`} variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="caption" fontWeight="bold">{staff.userName}</Typography>
                                                <Typography variant="caption" color="text.secondary"> - {staff.role}</Typography>
                                            </Box>
                                            <Chip 
                                                label={staff.status} 
                                                size="small" 
                                                sx={{ 
                                                    fontSize: '0.7rem',
                                                    height: '20px',
                                                    ...(staff.status === 'Active' && { bgcolor: 'success.light', color: 'success.dark' }),
                                                    ...(staff.status === 'Idle' && { bgcolor: 'info.light', color: 'info.dark' }),
                                                    ...(staff.status === 'Offline' && { bgcolor: 'grey.light', color: 'grey.dark' })
                                                }} 
                                            />
                                        </Paper>
                                    ))}
                                </Box>
                            </>
                        )}
                    </Box>
                    <Box p={2} bgcolor="#0f172a" color="white"><Typography variant="caption" fontWeight="900">WGS84 Registry</Typography></Box>
               </Paper>
           </Grid>
       </Grid>
    </Box>
  );
};

export default MapModule;
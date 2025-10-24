// Unused file that was made for map display of player birth locations
// Now kept for potential future use


// Boundary data using WMS services for efficient tile-based rendering
// US: Official National Map WMS service
// Canada: ArcGIS FeatureServer (fallback to vector data)

// Function to create WMS layer for US states
function createUSStatesWMSLayer() {
    return new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: 'https://carto.nationalmap.gov/arcgis/services/govunits/mapserver/WMSServer',
            params: {
                'LAYERS': '21', // State or Territory Small-Scale features layer
                'TILED': true,
                'FORMAT': 'image/png',
                'TRANSPARENT': true
            },
            serverType: 'mapserver'
            // Removed attributions to prevent USGS text in middle of map
        }),
        opacity: 0.7
    });
}

// Function to fetch Canadian provinces from ArcGIS FeatureServer (vector data)
async function fetchCanadianProvinces() {
    try {
        const response = await fetch(
            'https://services.arcgis.com/zmLUiqh7X11gGV2d/arcgis/rest/services/Canada_Provinical_boundaries_generalized/FeatureServer/0/query?' +
            'where=1%3D1&outFields=postal,Name_EN&returnGeometry=true&spatialRel=esriSpatialRelIntersects&' +
            'outSR=4326&f=geojson'
        );
        
        if (!response.ok) {
            throw new Error(`Failed to fetch Canadian provinces: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Canadian provinces:', error);
        return null;
    }
}

// Function to create boundary layers - hybrid approach using WMS + vector
async function createBoundaryLayers() {
    const layers = [];
    
    try {
        // Add US states as WMS layer (efficient tile-based rendering)
        const usStatesWMS = createUSStatesWMSLayer();
        layers.push({
            layer: usStatesWMS,
            type: 'wms',
            name: 'US States (WMS)'
        });
        
        // Add Canadian provinces as vector layer (more control over styling)
        const canadianData = await fetchCanadianProvinces();
        
        if (canadianData && canadianData.features) {
            const format = new ol.format.GeoJSON();
            const features = [];
            
            canadianData.features.forEach(geoFeature => {
                const olFeature = format.readFeature(geoFeature, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });
                
                // Set properties for identification
                olFeature.set('name', geoFeature.properties.Name_EN || 'Unknown Province');
                olFeature.set('type', 'province');
                olFeature.set('code', geoFeature.properties.postal || 'Unknown');
                
                features.push(olFeature);
            });
            
            const canadianProvincesLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: features
                }),
                style: function(feature) {
                    return getCanadianProvinceStyle(feature);
                },
                opacity: 0.8
            });
            
            layers.push({
                layer: canadianProvincesLayer,
                type: 'vector',
                name: 'Canadian Provinces (Vector)'
            });
        }
        
    } catch (error) {
        console.error('Error creating boundary layers:', error);
    }
    
    return layers;
}

// Function to get styling for Canadian provinces (vector layer)
function getCanadianProvinceStyle(feature) {
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#d32f2f', // Red for Canadian provinces
            width: 2,
            lineDash: [8, 4]
        }),
        fill: new ol.style.Fill({
            color: 'rgba(211, 47, 47, 0.06)'
        })
    });
}

// Legacy function maintained for compatibility
function getBoundaryStyle(feature) {
    const type = feature.get('type');
    const isProvince = type === 'province';
    
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: isProvince ? '#d32f2f' : '#1976d2', // Red for Canadian provinces, blue for US states
            width: isProvince ? 2 : 1.8,
            lineDash: isProvince ? [8, 4] : [6, 3]
        }),
        fill: new ol.style.Fill({
            color: isProvince ? 'rgba(211, 47, 47, 0.06)' : 'rgba(25, 118, 210, 0.04)'
        })
    });
}

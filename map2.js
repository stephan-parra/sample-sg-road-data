document.addEventListener('DOMContentLoaded', function() {
    // ✅ Show loading overlay while fetching data
    function showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    // ✅ Hide loading overlay when data is ready
    function hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }
    

    const map = new maplibregl.Map({
        container: 'map',
        style: {
            "version": 8,
            "sources": {
                "osm-tiles": {
                    "type": "raster",
                    "tiles": [
                        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    ],
                    "tileSize": 256
                }
            },
            "layers": [{
                "id": "osm-tiles",
                "type": "raster",
                "source": "osm-tiles",
                "minzoom": 0,
                "maxzoom": 19
            }]
        },
        center: [103.8198, 1.3000],
        zoom: 13
    });

    window.map = map;

    // ✅ Add Scale Bar Control
    var scale = new maplibregl.ScaleControl({
        maxWidth: 150, // Adjust width of scale bar
        unit: 'metric' // Use 'imperial' for miles
    });
    map.addControl(scale, 'bottom-left'); // Position: bottom-left


    // Scale-to-Zoom Mapping
    const scaleToZoom = {
        250: 18,
        500: 16,
        1250: 15,
        2500: 14,
        5000: 12
    };

    // Change map zoom based on scale selection
    document.getElementById('scale-select').addEventListener('change', function() {
        const selectedScale = this.value;
        const zoomLevel = scaleToZoom[selectedScale];

        if (zoomLevel !== undefined) {
            map.flyTo({
                zoom: zoomLevel,
                essential: true
            });
        }
    });

    map.on('load', function() {
        map.addSource('sg-roads', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/XenithIG_duct_line.json'
        });        

        map.addLayer({
            'id': 'sg-roads-layer',
            'type': 'line',
            'source': 'sg-roads',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#ff0000',
                'line-width': 2
            }
        });

        map.on('click', 'sg-roads-layer', function (e) {
            var feature = e.features[0];
            var props = feature.properties;
        
            new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                    <div style="font-family: Roboto, sans-serif; font-size: 14px;">
                        <strong>PCID:</strong> ${props.pcid || 'N/A'}<br>
                        <strong>Source Type:</strong> ${props.source_feature_type || 'N/A'}<br>
                        <strong>Status:</strong> ${props.status || 'N/A'}
                    </div>
                `)
                .addTo(map);
        });
        
        map.on('mouseenter', 'sg-roads-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'sg-roads-layer', () => {
            map.getCanvas().style.cursor = '';
        });        

        map.addSource('asset-points', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/XenithIG_manholes_point.json'
        });        

        map.addLayer({
            'id': 'asset-points-layer',
            'type': 'circle',
            'source': 'asset-points',
            'paint': {
                'circle-radius': 5,
                'circle-color': '#FF0000'
            },
            'layout': {
                'visibility': 'visible'
            }
        });

        map.addSource('asset-line-network', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Telstra_rdd_fiberroute.json'
        });        

        map.addLayer({
            'id': 'asset-line-network-layer',
            'type': 'line',
            'source': 'asset-line-network',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#CC02F5',
                'line-width': 2
            }
        });

        map.addSource('telstra-2a3', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Telstra_2a3_2b2_fiber_route.json'
        });
        
        map.addLayer({
            id: 'telstra-2a3-layer',
            type: 'line',
            source: 'telstra-2a3',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#0099FF', 'line-width': 2 }
        });
        
        document.getElementById('toggle-telstra-2a3').addEventListener('change', function(e) {
            map.setLayoutProperty('telstra-2a3-layer', 'visibility', e.target.checked ? 'visible' : 'none');
        });

        map.addSource('telecom-italia', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/TeleconItalia_fiber_route.json'
        });
        
        map.addLayer({
            id: 'telecom-italia-layer',
            type: 'line',
            source: 'telecom-italia',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#006400', 'line-width': 2 }
        });
        
        document.getElementById('toggle-telecom-italia').addEventListener('change', function(e) {
            map.setLayoutProperty('telecom-italia-layer', 'visibility', e.target.checked ? 'visible' : 'none');
        });
        
        map.addSource('tata', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Tata_fiber_route.json'
        });
        
        map.addLayer({
            id: 'tata-layer',
            type: 'line',
            source: 'tata',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#8B0000', 'line-width': 2 }
        });
        
        document.getElementById('toggle-tata').addEventListener('change', function(e) {
            map.setLayoutProperty('tata-layer', 'visibility', e.target.checked ? 'visible' : 'none');
        });
        
        map.addSource('reach-ntp', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Reach_ntp_fiber_route.json'
        });
        
        map.addLayer({
            id: 'reach-ntp-layer',
            type: 'line',
            source: 'reach-ntp',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#FC7208', 'line-width': 2 }
        });
        
        document.getElementById('toggle-reach-ntp').addEventListener('change', function(e) {
            map.setLayoutProperty('reach-ntp-layer', 'visibility', e.target.checked ? 'visible' : 'none');
        });
        
        map.addSource('reach-cls', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Reach_cls_fiber_route.json'
        });
        
        map.addLayer({
            id: 'reach-cls-layer',
            type: 'line',
            source: 'reach-cls',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#800080', 'line-width': 2 }
        });
        
        document.getElementById('toggle-reach-cls').addEventListener('change', function(e) {
            map.setLayoutProperty('reach-cls-layer', 'visibility', e.target.checked ? 'visible' : 'none');
        });
        
        map.addSource('keppel-pipe', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Keppel_pipeline_line.json'
        });
        
        map.addLayer({
            id: 'keppel-pipe-layer',
            type: 'line',
            source: 'keppel-pipe',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#00CED1', 'line-width': 2 }
        });
        
        document.getElementById('toggle-keppel-pipe').addEventListener('change', function(e) {
            map.setLayoutProperty('keppel-pipe-layer', 'visibility', e.target.checked ? 'visible' : 'none');
        });
        
        map.addSource('keppel-manhole', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Keppel_manholes_point.json'
        });
        
        map.addLayer({
            id: 'keppel-manhole-layer',
            type: 'circle',
            source: 'keppel-manhole',
            paint: {
                'circle-radius': 4,
                'circle-color': '#1E90FF'
            }
        });
        
        document.getElementById('toggle-keppel-manhole').addEventListener('change', function(e) {
            map.setLayoutProperty('keppel-manhole-layer', 'visibility', e.target.checked ? 'visible' : 'none');
        });
        
        map.addSource('orange', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Orange_fiber_route.json'
        });
        
        map.addLayer({
            id: 'orange-layer',
            type: 'line',
            source: 'orange',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#FF7F50', 'line-width': 2 }
        });
        
        document.getElementById('toggle-orange').addEventListener('change', function(e) {
            map.setLayoutProperty('orange-layer', 'visibility', e.target.checked ? 'visible' : 'none');
        });
        
        map.addSource('flag', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Flag_telecom_duct.json'
        });
        
        map.addLayer({
            id: 'flag-layer',
            type: 'line',
            source: 'flag',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#A0522D', 'line-width': 2 }
        });
        
        document.getElementById('toggle-flag').addEventListener('change', function(e) {
            map.setLayoutProperty('flag-layer', 'visibility', e.target.checked ? 'visible' : 'none');
        });


        document.getElementById('toggle-roads').addEventListener('change', function(e) {
            map.setLayoutProperty(
                'sg-roads-layer',
                'visibility',
                e.target.checked ? 'visible' : 'none'
            );
        });

        document.getElementById('toggle-asset-points').addEventListener('change', function(e) {
            map.setLayoutProperty(
                'asset-points-layer',
                'visibility',
                e.target.checked ? 'visible' : 'none'
            );
        });

        document.getElementById('toggle-high-voltage').addEventListener('change', function(e) {
            map.setLayoutProperty(
                'asset-line-network-layer',
                'visibility',
                e.target.checked ? 'visible' : 'none'
            );
        });

        // Fetch traffic data from the API
        fetch('https://api.data.gov.sg/v1/transport/traffic-images')
            .then(response => response.json())
            .then(data => {
                // Convert API data to GeoJSON format
                const features = data.items[0].cameras.map(camera => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [camera.location.longitude, camera.location.latitude]
                    },
                    properties: {
                        camera_id: camera.camera_id,
                        image: camera.image,
                        timestamp: camera.timestamp
                    }
                }));

                const geojsonData = {
                    type: 'FeatureCollection',
                    features: features
                };

                // Add the traffic assets source
                map.addSource('traffic-assets', {
                    type: 'geojson',
                    data: geojsonData
                });

                // Add the traffic assets layer
                map.addLayer({
                    'id': 'traffic-assets-layer',
                    'type': 'circle',
                    'source': 'traffic-assets',
                    'paint': {
                        'circle-radius': 6,
                        'circle-color': '#FF5733'
                    }
                });

                // Add event listener for traffic assets toggle
                document.getElementById('toggle-traffic-assets').addEventListener('change', function(e) {
                    map.setLayoutProperty(
                        'traffic-assets-layer',
                        'visibility',
                        e.target.checked ? 'visible' : 'none'
                    );
                });

                // Add click event for Traffic Assets layer
                map.on('click', 'traffic-assets-layer', function(e) {
                    var coordinates = e.lngLat;
                    var properties = e.features[0].properties;

                    // Create a popup and set its content with modern styling
                    new maplibregl.Popup({
                            maxWidth: '450px'
                        })
                        .setLngLat(coordinates)
                        .setHTML(
                            '<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; padding: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);">' +
                            '<table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">' +
                            '<tr><td style="font-size: 14px; color: #333; font-weight: normal; border: 1px solid #ddd; padding: 8px;">Camera ID:</td><td style="border: 1px solid #ddd; padding: 8px;">' + properties.camera_id + '</td></tr>' +
                            '<tr><td style="font-size: 14px; color: #333; font-weight: normal; border: 1px solid #ddd; padding: 8px;">Image:</td><td style="border: 1px solid #ddd; padding: 8px;"><img src="' + properties.image + '" alt="Camera Image" style="width:300px;height:auto;display:block;margin-top:5px;margin-bottom:5px;border-radius:4px;"></td></tr>' +
                            '<tr><td style="font-size: 14px; color: #333; font-weight: normal; border: 1px solid #ddd; padding: 8px;">Timestamp:</td><td style="border: 1px solid #ddd; padding: 8px;">' + properties.timestamp + '</td></tr>' +
                            '</table>' +
                            '</div>'
                        )
                        .addTo(map);
                });

                // ✅ Ensure Cursor Changes on Hover Over Traffic Assets
                map.on('mouseenter', 'traffic-assets-layer', function() {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'traffic-assets-layer', function() {
                    map.getCanvas().style.cursor = '';
                });
            })
            .catch(error => console.error('Error fetching traffic data:', error));

        // ✅ Add Mapbox Draw for polygon selection
        var draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                polygon: true,
                trash: true
            },
            styles: [{
                    "id": "gl-draw-polygon-fill",
                    "type": "fill",
                    "filter": ["all", ["==", "$type", "Polygon"],
                        ["!=", "mode", "static"]
                    ],
                    "paint": {
                        "fill-color": "#FFD700", // Bright yellow fill
                        "fill-opacity": 0.2 // Semi-transparent
                    }
                },
                {
                    "id": "gl-draw-polygon-stroke",
                    "type": "line",
                    "filter": ["all", ["==", "$type", "Polygon"],
                        ["!=", "mode", "static"]
                    ],
                    "layout": {
                        "line-cap": "round",
                        "line-join": "round"
                    },
                    "paint": {
                        "line-color": "#5E0AFA", // Bright orange-red border
                        "line-width": 4 // Thicker border for visibility
                    }
                },
                {
                    "id": "gl-draw-polygon-midpoint",
                    "type": "circle",
                    "filter": ["all", ["==", "$type", "Point"],
                        ["==", "meta", "midpoint"]
                    ],
                    "paint": {
                        "circle-radius": 5,
                        "circle-color": "#000",
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#FFD700"
                    }
                },
                {
                    "id": "gl-draw-point",
                    "type": "circle",
                    "filter": ["all", ["==", "$type", "Point"],
                        ["!=", "meta", "midpoint"]
                    ],
                    "paint": {
                        "circle-radius": 5,
                        "circle-color": "#FF0000", // Red color for the initial point
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#FFFFFF"
                    }
                }
            ]
        });

        map.addControl(draw, 'top-left');

        document.getElementById('draw-polygon').addEventListener('click', function() {
            draw.changeMode('draw_polygon');
            map.getCanvas().style.cursor = 'crosshair'; // Change cursor to target (crosshair)
            document.getElementById('draw-instructions').style.display = 'block'; //Map instructions are displayed
        });

        const downloadableLayers = {
            'sg-roads-layer': 'sg-roads',
            'asset-points-layer': 'asset-points',
            'asset-line-network-layer': 'asset-line-network',
            'telstra-2a3-layer': 'telstra-2a3',
            'telecom-italia-layer': 'telecom-italia',
            'tata-layer': 'tata',
            'reach-ntp-layer': 'reach-ntp',
            'reach-cls-layer': 'reach-cls',
            'keppel-pipe-layer': 'keppel-pipe',
            'keppel-manhole-layer': 'keppel-manhole',
            'orange-layer': 'orange',
            'flag-layer': 'flag',
            'traffic-assets-layer': 'traffic-assets'
          };          

        // ✅ When a polygon is drawn, highlight and download selected features
        map.on('draw.create', function(e) {
            var drawnPolygon = e.features[0];
        
            if (!drawnPolygon) {
                console.error('No polygon drawn');
                return;
            }
        
            document.getElementById('draw-instructions').style.display = 'none';
            map.getCanvas().style.cursor = '';
            showLoading();
        
            const layersToCheck = [
                { id: 'sg-roads-layer', sourceId: 'sg-roads', filename: 'xenith_ducts.geojson' },
                { id: 'asset-points-layer', sourceId: 'asset-points', filename: 'manholes.geojson' },
                { id: 'asset-line-network-layer', sourceId: 'asset-line-network', filename: 'telstra_rdd.geojson' },
                { id: 'telstra-2a3-layer', sourceId: 'telstra-2a3', filename: 'telstra_2a3_2b2.geojson' },
                { id: 'telecom-italia-layer', sourceId: 'telecom-italia', filename: 'telecom_italia.geojson' },
                { id: 'tata-layer', sourceId: 'tata', filename: 'tata.geojson' },
                { id: 'reach-ntp-layer', sourceId: 'reach-ntp', filename: 'reach_ntp.geojson' },
                { id: 'reach-cls-layer', sourceId: 'reach-cls', filename: 'reach_cls.geojson' },
                { id: 'keppel-pipe-layer', sourceId: 'keppel-pipe', filename: 'keppel_pipe.geojson' },
                { id: 'keppel-manhole-layer', sourceId: 'keppel-manhole', filename: 'keppel_manhole.geojson' },
                { id: 'orange-layer', sourceId: 'orange', filename: 'orange.geojson' },
                { id: 'flag-layer', sourceId: 'flag', filename: 'flag.geojson' },
                { id: 'traffic-assets-layer', sourceId: 'traffic-assets', filename: 'traffic_assets.geojson' }
            ];
        
            const zip = new JSZip();
        
            layersToCheck.forEach(({ id, sourceId, filename }) => {
                const source = map.getSource(sourceId);
                if (!source) return;
        
                const data = source._data || source._options?.data;
                if (!data || !data.features) return;
        
                const intersected = data.features.filter(feature => {
                    try {
                        return turf.booleanIntersects(feature, drawnPolygon);
                    } catch (e) {
                        console.warn(`Intersection check failed for ${filename}`, e);
                        return false;
                    }
                });
        
                if (intersected.length > 0) {
                    const fc = {
                        type: 'FeatureCollection',
                        features: intersected
                    };
                    zip.file(filename, JSON.stringify(fc, null, 2));
                }
            });
        
            zip.generateAsync({ type: "blob" }).then(function(content) {
                hideLoading();
                saveAs(content, "selected_features.zip");
            }).catch(err => {
                hideLoading();
                console.error("ZIP generation error", err);
            });
        });
        

        // ✅ Reset Map Button Functionality
        document.getElementById('reset-map').addEventListener('click', function() {
            // ✅ Remove drawn polygon
            var allDrawnFeatures = draw.getAll();
            if (allDrawnFeatures.features.length > 0) {
                draw.deleteAll(); // Remove all drawn polygons
            }

            // ✅ Reset `sg-roads` to its original data
            fetch('https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/XenithIG_duct_line.json')
                .then(response => response.json())
                .then(originalData => {
                    if (map.getSource('sg-roads')) {
                        map.getSource('sg-roads').setData(originalData);
                    }
                })
                .catch(error => console.error('Error resetting sg-roads data:', error));

            // ✅ Remove the filtered-features layer if it exists
            if (map.getLayer('filtered-features-layer')) {
                map.removeLayer('filtered-features-layer');
                map.removeSource('filtered-features');
            }

            // ✅ Restore visibility of all layers
            map.setLayoutProperty('sg-roads-layer', 'visibility', 'visible');
            map.setLayoutProperty('asset-points-layer', 'visibility', 'visible');
            map.setLayoutProperty('asset-line-network-layer', 'visibility', 'visible');
            map.setLayoutProperty('traffic-assets-layer', 'visibility', 'visible');

            // ✅ Re-center the map to its original position
            map.flyTo({
                center: [103.8198, 1.3000],
                zoom: 13,
                essential: true
            });

            console.log("Map reset to original state.");
        });

        // 🆕 Toggle All Layers Button
        const toggleAllBtn = document.getElementById('toggle-all-layers');

        if (toggleAllBtn) {
        let allVisible = true;

        toggleAllBtn.addEventListener('click', () => {
            const layerToggles = document.querySelectorAll('.sidebar input[type="checkbox"]');

            layerToggles.forEach(checkbox => {
            checkbox.checked = !allVisible;
            checkbox.dispatchEvent(new Event('change')); // Triggers each checkbox toggle
            });

            allVisible = !allVisible;
            toggleAllBtn.classList.toggle('toggled');
        });
        } else {
        console.warn('Toggle all layers button not found in the DOM');
        }
    }); // 🔹 Make sure this stays at the end of the `map.on('load', function () { ... })` block
});
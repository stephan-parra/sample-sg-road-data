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
        const geojsonCache = {};

        const layerConfigs = [
            {
                id: 'sg-roads-layer', sourceId: 'sg-roads',
                url: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/XenithIG_duct_line.json',
                type: 'line',
                paint: { 'line-color': '#FF0000', 'line-width': 2 },
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                toggleId: 'toggle-roads',
                filename: 'xenith_ducts.geojson'
            },
            {
                id: 'asset-points-layer', sourceId: 'asset-points',
                url: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/XenithIG_manholes_point.json',
                type: 'circle',
                paint: { 'circle-radius': 5, 'circle-color': '#FF0000' },
                layout: { visibility: 'visible' },
                toggleId: 'toggle-asset-points',
                filename: 'manholes.geojson'
            },
            {
                id: 'asset-line-network-layer', sourceId: 'asset-line-network',
                url: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Telstra_rdd_fiberroute.json',
                type: 'line',
                paint: { 'line-color': '#CC02F5', 'line-width': 2 },
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                toggleId: 'toggle-high-voltage',
                filename: 'telstra_rdd.geojson'
            },
            {
                id: 'telstra-2a3-layer', sourceId: 'telstra-2a3',
                url: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Telstra_2a3_2b2_fiber_route.json',
                type: 'line',
                paint: { 'line-color': '#0099FF', 'line-width': 2 },
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                toggleId: 'toggle-telstra-2a3',
                filename: 'telstra_2a3_2b2.geojson'
            },
            {
                id: 'telecom-italia-layer', sourceId: 'telecom-italia',
                url: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/TeleconItalia_fiber_route.json',
                type: 'line',
                paint: { 'line-color': '#006400', 'line-width': 2 },
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                toggleId: 'toggle-telecom-italia',
                filename: 'telecom_italia.geojson'
            },
            {
                id: 'tata-layer', sourceId: 'tata',
                url: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Tata_fiber_route.json',
                type: 'line',
                paint: { 'line-color': '#8B0000', 'line-width': 2 },
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                toggleId: 'toggle-tata',
                filename: 'tata.geojson'
            },
            {
                id: 'reach-ntp-layer', sourceId: 'reach-ntp',
                url: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Reach_ntp_fiber_route.json',
                type: 'line',
                paint: { 'line-color': '#FC7208', 'line-width': 2 },
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                toggleId: 'toggle-reach-ntp',
                filename: 'reach_ntp.geojson'
            },
            {
                id: 'reach-cls-layer', sourceId: 'reach-cls',
                url: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Reach_cls_fiber_route.json',
                type: 'line',
                paint: { 'line-color': '#800080', 'line-width': 2 },
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                toggleId: 'toggle-reach-cls',
                filename: 'reach_cls.geojson'
            },
            {
                id: 'keppel-pipe-layer', sourceId: 'keppel-pipe',
                url: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Keppel_pipeline_line.json',
                type: 'line',
                paint: { 'line-color': '#00CED1', 'line-width': 2 },
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                toggleId: 'toggle-keppel-pipe',
                filename: 'keppel_pipe.geojson'
            },
            {
                id: 'keppel-manhole-layer', sourceId: 'keppel-manhole',
                url: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Keppel_manholes_point.json',
                type: 'circle',
                paint: { 'circle-radius': 4, 'circle-color': '#1E90FF' },
                layout: {},
                toggleId: 'toggle-keppel-manhole',
                filename: 'keppel_manhole.geojson'
            },
            {
                id: 'orange-layer', sourceId: 'orange',
                url: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Orange_fiber_route.json',
                type: 'line',
                paint: { 'line-color': '#FF7F50', 'line-width': 2 },
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                toggleId: 'toggle-orange',
                filename: 'orange.geojson'
            },
            {
                id: 'flag-layer', sourceId: 'flag',
                url: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/added-sg-assets/Flag_telecom_duct.json',
                type: 'line',
                paint: { 'line-color': '#A0522D', 'line-width': 2 },
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                toggleId: 'toggle-flag',
                filename: 'flag.geojson'
            }
        ];

        layerConfigs.forEach(cfg => {
            fetch(cfg.url)
                .then(res => res.json())
                .then(geojson => {
                    geojsonCache[cfg.sourceId] = geojson;

                    map.addSource(cfg.sourceId, {
                        type: 'geojson',
                        data: geojson
                    });

                    map.addLayer({
                        id: cfg.id,
                        type: cfg.type,
                        source: cfg.sourceId,
                        paint: cfg.paint,
                        layout: cfg.layout || {}
                    });

                    if (cfg.toggleId) {
                        const checkbox = document.getElementById(cfg.toggleId);
                        if (checkbox) {
                            checkbox.addEventListener('change', (e) => {
                                map.setLayoutProperty(cfg.id, 'visibility', e.target.checked ? 'visible' : 'none');
                            });
                        }
                    }
                    // 🟢 Restore sg-roads click popup
                    if (cfg.id === 'sg-roads-layer') {
                        map.on('click', cfg.id, function (e) {
                            const feature = e.features[0];
                            const props = feature.properties;

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

                        map.on('mouseenter', cfg.id, () => {
                            map.getCanvas().style.cursor = 'pointer';
                        });

                        map.on('mouseleave', cfg.id, () => {
                            map.getCanvas().style.cursor = '';
                        });
                    }
                })
                .catch(err => console.error(`Error loading layer ${cfg.sourceId}:`, err));
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

        document.getElementById('download-data').addEventListener('click', function() {
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
            const drawnPolygon = e.features[0];
            if (!drawnPolygon) return;

            document.getElementById('draw-instructions').style.display = 'none';
            map.getCanvas().style.cursor = '';
            showLoading();

            const zip = new JSZip();

            layerConfigs.forEach(cfg => {
                const data = geojsonCache[cfg.sourceId];
                if (!data || !data.features) return;

                const intersected = data.features.filter(feature => {
                    try {
                        return turf.booleanIntersects(feature, drawnPolygon);
                    } catch (e) {
                        console.warn(`Intersection check failed for ${cfg.filename}`, e);
                        return false;
                    }
                });

                if (intersected.length > 0) {
                    zip.file(cfg.filename, JSON.stringify({
                        type: 'FeatureCollection',
                        features: intersected
                    }, null, 2));
                }
            });

            zip.generateAsync({ type: 'blob' })
                .then(content => {
                    hideLoading();
                    saveAs(content, 'selected_features.zip');
                })
                .catch(err => {
                    hideLoading();
                    console.error('ZIP generation error', err);
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
document.addEventListener('DOMContentLoaded', function() {
    // ✅ Show loading overlay while fetching data
    function showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    // ✅ Hide loading overlay when data is ready
    function hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    var map = new maplibregl.Map({
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
        center: [103.8198, 1.3421],
        zoom: 13
    });

    map.on('load', function() {
        map.addSource('sg-roads', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/main/SG_Roads.geojson'
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

        map.addSource('asset-points', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/main/AssetPoints1.geojson'
        });

        map.addLayer({
            'id': 'asset-points-layer',
            'type': 'circle',
            'source': 'asset-points',
            'paint': {
                'circle-radius': 7,
                'circle-color': '#0000FF'
            },
            'layout': {
                'visibility': 'visible'
            }
        });

        map.addSource('asset-line-network', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/main/AssetLineNetwork2.geojson'
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

                // Change the cursor to a pointer when the mouse is over the Traffic Assets layer
                map.on('mouseenter', 'traffic-assets-layer', function() {
                    map.getCanvas().style.cursor = 'pointer';
                });

                // Change it back to default when it leaves
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

        // ✅ When a polygon is drawn, highlight and download selected features
        map.on('draw.create', function(e) {
            var drawnPolygon = e.features[0];

            if (!drawnPolygon) {
                console.error('No polygon drawn');
                return;
            }

            console.log('Polygon Drawn:', drawnPolygon.geometry);

            document.getElementById('draw-instructions').style.display = 'none'; // Hide instructions
            map.getCanvas().style.cursor = ''; // Reset cursor

            showLoading(); // ✅ Show loading spinner while fetching data

            fetch('https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/main/SG_Roads.geojson')
                .then(response => response.json())
                .then(roadsData => {
                    var filteredFeatures = roadsData.features.filter(feature => {
                        return turf.booleanIntersects(feature, drawnPolygon);
                    });

                    hideLoading(); // ✅ Hide loading spinner after data is fetched

                    console.log('Filtered Roads:', filteredFeatures.length);

                    if (filteredFeatures.length > 0) {
                        var filteredGeoJSON = {
                            type: "FeatureCollection",
                            features: filteredFeatures
                        };

                        // ✅ Add filtered roads as a new layer on the map
                        if (map.getLayer('filtered-features-layer')) {
                            map.getSource('filtered-features').setData(filteredGeoJSON);
                        } else {
                            map.addSource('filtered-features', {
                                type: "geojson",
                                data: filteredGeoJSON
                            });

                            map.addLayer({
                                id: "filtered-features-layer",
                                type: "line",
                                source: "filtered-features",
                                layout: {
                                    "line-join": "round",
                                    "line-cap": "round"
                                },
                                paint: {
                                    "line-color": "#00FF00", // Green highlight for selected features
                                    "line-width": 3
                                }
                            });
                        }

                        // ✅ Wait 2 seconds before downloading to allow user to see selection
                        setTimeout(() => {
                            var blob = new Blob([JSON.stringify(filteredGeoJSON, null, 2)], {
                                type: "application/json"
                            });
                            var url = URL.createObjectURL(blob);
                            var a = document.createElement("a");
                            a.href = url;
                            a.download = "selected_features.geojson";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }, 2000);
                    } else {
                        console.warn("No features found inside the polygon.");
                    }
                })
                .catch(error => {
                    hideLoading();
                    console.error('Error fetching sg-roads data:', error);
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
            fetch('https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/main/SG_Roads.geojson')
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
                center: [103.8198, 1.3421],
                zoom: 13,
                essential: true
            });

            console.log("Map reset to original state.");
        });

    }); // 🔹 Make sure this stays at the end of the `map.on('load', function () { ... })` block

});
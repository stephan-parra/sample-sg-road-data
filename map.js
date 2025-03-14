document.addEventListener('DOMContentLoaded', function () {
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

    var annotationMode = false;
    var annotations = [];

    document.getElementById('annotation-mode').addEventListener('click', function () {
        annotationMode = !annotationMode;
        this.textContent = annotationMode ? 'Exit Annotation Mode' : 'Toggle Annotation Mode';
    });

    map.on('click', function (e) {
        if (annotationMode) {
            var coordinates = [e.lngLat.lng, e.lngLat.lat];
            var marker = new maplibregl.Marker()
                .setLngLat(coordinates)
                .addTo(map);

            annotations.push(coordinates);
            console.log('Annotation added at:', coordinates);
        }
    });

    map.on('load', function () {
        map.addSource('places', {
            type: 'geojson',
            data: 'data.geojson'
        });

        map.addLayer({
            'id': 'places-layer',
            'type': 'circle',
            'source': 'places',
            'paint': {
                'circle-radius': 6,
                'circle-color': '#007cbf'
            }
        });

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
                'circle-color': '#4411ED'
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

        document.getElementById('toggle-roads').addEventListener('change', function (e) {
            map.setLayoutProperty(
                'sg-roads-layer',
                'visibility',
                e.target.checked ? 'visible' : 'none'
            );
        });

        document.getElementById('toggle-asset-points').addEventListener('change', function (e) {
            map.setLayoutProperty(
                'asset-points-layer',
                'visibility',
                e.target.checked ? 'visible' : 'none'
            );
        });

        document.getElementById('toggle-high-voltage').addEventListener('change', function (e) {
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
                    document.getElementById('toggle-traffic-assets').addEventListener('change', function (e) {
                        map.setLayoutProperty(
                            'traffic-assets-layer',
                            'visibility',
                            e.target.checked ? 'visible' : 'none'
                        );
                    });
    
                    // Add click event for Traffic Assets layer
                    map.on('click', 'traffic-assets-layer', function (e) {
                        var coordinates = e.lngLat;
                        var properties = e.features[0].properties;
    
                        // Create a popup and set its content with modern styling
                        new maplibregl.Popup({ maxWidth: '450px' })
                            .setLngLat(coordinates)
                            .setHTML(
                                '<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; padding: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);">' +
                                '<table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">' +
                                '<tr><td style="font-size: 14px; color: #333; font-weight: normal; border: 1px solid #ddd; padding: 8px;">Camera ID:</td><td style="border: 1px solid #ddd; padding: 8px;">' + properties.camera_id + '</td></tr>' +
                                '<tr><td style="font-size: 14px; color: #333; font-weight: normal; border: 1px solid #ddd; padding: 8px;">Image:</td><td style="border: 1px solid #ddd; padding: 8px;"><img src="' + properties.image + '" alt="Camera Image" style="width:100px;height:auto;display:block;margin-top:5px;margin-bottom:5px;border-radius:4px;"></td></tr>' +
                                '<tr><td style="font-size: 14px; color: #333; font-weight: normal; border: 1px solid #ddd; padding: 8px;">Timestamp:</td><td style="border: 1px solid #ddd; padding: 8px;">' + properties.timestamp + '</td></tr>' +
                                '</table>' +
                                '</div>'
                            )
                            .addTo(map);
                    });
    
                    // Change the cursor to a pointer when the mouse is over the Traffic Assets layer
                    map.on('mouseenter', 'traffic-assets-layer', function () {
                        map.getCanvas().style.cursor = 'pointer';
                    });
    
                    // Change it back to default when it leaves
                    map.on('mouseleave', 'traffic-assets-layer', function () {
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
            }
        });

        map.addControl(draw, 'top-left');

        document.getElementById('draw-polygon').addEventListener('click', function () {
            draw.changeMode('draw_polygon');
        });

        // ✅ When a polygon is drawn, filter sg-roads inside it
        map.on('draw.create', function (e) {
            var drawnPolygon = e.features[0];

            if (!drawnPolygon) {
                console.error('No polygon drawn');
                return;
            }

            console.log('Polygon Drawn:', drawnPolygon.geometry);

            // Get current sg-roads data
            fetch('https://raw.githubusercontent.com/stephan-parra/sample-sg-road-data/main/SG_Roads.geojson')
                .then(response => response.json())
                .then(roadsData => {
                    var filteredFeatures = roadsData.features.filter(feature => {
                        return turf.booleanIntersects(feature, drawnPolygon);
                    });

                    console.log('Filtered Roads:', filteredFeatures.length);

                    // Update the sg-roads source with filtered data
                    map.getSource('sg-roads').setData({
                        type: 'FeatureCollection',
                        features: filteredFeatures
                    });
                })
                .catch(error => console.error('Error fetching sg-roads data:', error));
        });
    });
});

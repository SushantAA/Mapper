mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: ag, // starting position [lng, lat]
    zoom: 11 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(ag)
    .addTo(map);
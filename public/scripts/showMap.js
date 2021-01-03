mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
    center: ag.geometry.coordinates, // starting position [lng, lat]
    zoom: 11 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(ag.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset:25 })
            .setHTML(
                `<h3>${ag.title}</h3><p>${ag.location}</p>`
            )
    )
    .addTo(map);
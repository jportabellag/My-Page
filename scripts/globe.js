window.addEventListener("DOMContentLoaded", () => {
    const darkGlobeTexture = '//unpkg.com/three-globe/example/img/earth-dark.jpg';
    const lightGlobeTexture = '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

    const world = Globe()(document.getElementById('globe'))
        .globeImageUrl(darkGlobeTexture)
        .backgroundColor('rgba(0,0,0,0)');

    window.setGlobeTheme = (isLight) => {
        world.globeImageUrl(isLight ? lightGlobeTexture : darkGlobeTexture);
    };

    window.setGlobeTheme(document.body.classList.contains("body-light"));

    world.pointsData([
        {
            lat: 41.3851,
            lng: 2.1734,
            size: 0.35,
            color: '#7dd3fc'
        }
    ]);

    world.pointAltitude(0.02);
    world.pointColor('color');

    // glow radar
    world.ringsData([
        {
            lat: 41.3851,
            lng: 2.1734,
            maxR: 4,
            propagationSpeed: 1.2,
            repeatPeriod: 1200
        }
    ]);

    world.ringColor(() => '#7dd3fc');
    world.ringMaxRadius('maxR');
    world.ringPropagationSpeed('propagationSpeed');
    world.ringRepeatPeriod('repeatPeriod');

    // cámara
    world.pointOfView(
        { lat: 41.3851, lng: 2.1734, altitude: 1.8 },
        1500
    );

    // 🔥 AQUÍ DENTRO (IMPORTANTE)
    world.controls().enableZoom = false;
    world.controls().enablePan = false;
    world.controls().enableRotate = false;

});

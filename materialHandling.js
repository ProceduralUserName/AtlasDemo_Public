window.currentMaterial = 'Wooden'; // Default material

window.setMaterial = function(material) {
    currentMaterial = material;
    document.getElementById('currentMaterialDisplay').textContent = 'Current Material: ' + currentMaterial;
};

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('wood').addEventListener('click', function() {
        setMaterial('Wooden');
    });

    document.getElementById('chainlink').addEventListener('click', function() {
        setMaterial('Chainlink');
    });

    document.getElementById('plastic').addEventListener('click', function() {
        setMaterial('Plastic');
    });

    // Initial display of the default material
    document.getElementById('currentMaterialDisplay').textContent = 'Current Material: ' + currentMaterial;
});

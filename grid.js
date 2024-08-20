(function() {
    var gridSize = 50; // Define the size of the grid

    function createGrid(canvas, gridsize) {
        gridSize = gridsize
        for (var i = 0; i < (canvas.width / gridSize); i++) {
            canvas.add(new fabric.Line([i * gridSize, 0, i * gridSize, canvas.height], {
                stroke: '#ccc',
                selectable: false, // Make grid lines not selectable
                evented: false
            }));
            canvas.add(new fabric.Line([0, i * gridSize, canvas.width, i * gridSize], {
                stroke: '#ccc',
                selectable: false, // Make grid lines not selectable
                evented: false
            }));
        }
    }

    function snapToGrid(value) {
        return Math.round(value / gridSize) * gridSize;
    }

    window.GridUtils = {
        createGrid: createGrid,
        snapToGrid: snapToGrid
    };
})();

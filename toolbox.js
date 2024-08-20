document.addEventListener('DOMContentLoaded', function() {
    // This script assumes the canvas object is available globally.
    // Modify the script to pass the canvas object if necessary.
    function setMode(mode) {
        currentMode = mode;
        isDrawing = false;
        window.canvas.isDrawingMode = false;
        setGateMode(mode === 'gate'); // Activate or deactivate gate mode

        // Toggle control point visibility for gates
        window.canvas.forEachObject(function(obj) {
            if (obj.type === 'rect' && obj.controlPoint) {
                obj.controlPoint.set({
                    visible: mode === 'select',
                    evented: mode === 'select'
                });
            }
            if (obj.type === 'customLine' && obj.controls) {
                //console.log(obj);
                
                obj.controls.startControl.set({
                    visible: mode === 'select',
                    evented: mode === 'select'
                });
                obj.controls.endControl.set({
                    visible: mode === 'select',
                    evented: mode === 'select'
                });
            }
        });
        window.canvas.renderAll();
    }

    document.getElementById('fenceMode').addEventListener('click', function() {
        setMode('fence');
    });

    document.getElementById('gateMode').addEventListener('click', function() {
        setMode('gate');
        setGateMode(true);
    });

    document.getElementById('selectMode').addEventListener('click', function() {
        setMode('select')
    });
    
    var gridsize;
    document.getElementById('gridSize').addEventListener('change', function(){
        gridsize = document.getElementById('gridSize').value
        console.log(gridsize)
        
    })
    document.getElementById('clear').addEventListener('click', function() {       
        // window.canvas.clear();
        // GridUtils.createGrid(canvas,gridsize);
        // lengths = [];
        // gates = []; // Clear the gates array
        // Utility.updateFenceLengths(); // Clear the list
    });
});

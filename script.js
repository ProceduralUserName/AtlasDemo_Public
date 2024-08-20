

document.addEventListener('DOMContentLoaded', function() {

    // GRID CREATION

    window.canvas = new fabric.Canvas('canvas', {
        width: 1000,
        height: 800,
        selection: false
    });
    var gridsize = 50; // Define grid size (assuming it's the same as in grid.js)
    GridUtils.createGrid(canvas, gridsize);

    
    var isDrawing = false;
    window.currentMode = 'fence';
    var startPoint;
    var currentLine;
    window.lengths = []; // Array to store lengths of all fence lines
    window.gates = [];
    var input = 1;
    

    

    

    document.getElementById('distanceMultiplier').addEventListener('change', function(){
        input = document.getElementById('distanceMultiplier').value
        
    })
    document.getElementById('gridSize').addEventListener('change', function(){
        gridsize = document.getElementById('gridSize').value
        canvas.clear();
        GridUtils.createGrid(canvas, gridsize);
        window.lengths = [];
        window.gates = [];
        

        Utility.updateFenceLengths(input, gridsize); // Clear the list
        
    })
    document.getElementById('fenceMode').addEventListener('click', function() {
        Utility.setMode('fence');
    });

    document.getElementById('gateMode').addEventListener('click', function() {
        Utility.setMode('gate');
    });

    document.getElementById('selectMode').addEventListener('click', function() {
        Utility.setMode('select');
        
    });

    document.getElementById('objectGroup').addEventListener('click', function(){
        Utility.setMode('object');
    })


    document.getElementById('clear').addEventListener('click', function() {
       
        
        canvas.clear();
        GridUtils.createGrid(canvas, gridsize);
        window.lengths = [];
        window.gates = [];
        Utility.updateFenceLengths(input, gridsize); // Clear the list
    });

    
    

    
    

    canvas.on('object:added', function() {
        Utility.updateFenceLengths(input, gridsize);
    });
    
    canvas.on('object:modified', function() {
        Utility.updateFenceLengths(input, gridsize);
    });
    
    canvas.on('object:removed', function() {
        Utility.updateFenceLengths(input, gridsize);
    });


    canvas.on('mouse:down', function(o) {
        var color = "black";
        switch (currentMaterial){
            case 'Wooden':
                currentMaterial = 'Wooden';
                color = 'brown';
                break;
            case 'Chainlink':
                currentMaterial === 'Chainlink'
                color = 'gray';
                break;
            case 'Plastic':
                currentMaterial === 'Plastic'
                color = 'black'
                break;
        }
        
        if (currentMode === 'fence') {
            isDrawing = true;
            var pointer = canvas.getPointer(o.e);
            startPoint = { x: Utility.snapToGrid(pointer.x, gridsize), y: Utility.snapToGrid(pointer.y, gridsize) };

            currentLine = new fabric.CustomLine([startPoint.x, startPoint.y, startPoint.x, startPoint.y], {
                stroke: color,
                strokeWidth: 2,
                selectable: false, // Ensure the line is not selectable during drawing
                evented: false, // Ensure the line is not interactive
                customProperty: 'my custom value', // Custom property example
                displayLength: 0, // Initialize displayLength
                material: currentMaterial
            });
            canvas.add(currentLine);
        }
    });

    canvas.on('mouse:move', function(o) {

        
        if (!isDrawing || !currentLine) return;

        var pointer = canvas.getPointer(o.e);
        var x2 = Utility.snapToGrid(pointer.x, gridsize);
        var y2 = Utility.snapToGrid(pointer.y, gridsize);

        currentLine.set({ x2: x2, y2: y2 });
        canvas.renderAll();


        // Calculate the length and position for the length text
        var length = Utility.calculateLengthInput(startPoint.x, startPoint.y, x2, y2, input, gridsize);
        currentLine.set('displayLength', length); // Update displayLength property

        var midX = (startPoint.x + x2) / 2 ;
        var midY = (startPoint.y + y2) / 2 - 10; // Slightly above the line

        // Create or update length text
        if (!currentLine.lengthText) {
            currentLine.lengthText = new fabric.Text(length + ' ft', {
                left: midX,
                top: midY,
                fontSize: 16, // Increased font size
                fill: 'black',
                selectable: false,
                evented: false // Ensure the text does not interfere with interactions
            });
            canvas.add(currentLine.lengthText);
        } else {
            currentLine.lengthText.set({ text: length + ' ft', left: midX - 5, top: midY - 10 });
        }
        canvas.renderAll();
    });

    canvas.on('mouse:up', function(o) {
        if (currentMode === 'fence') {
            isDrawing = false;
            currentLine.setCoords();

            // Disable scaling and rotating
            currentLine.set({
                hasControls: false,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true
            });

            // Finalize the length text
            var pointer = canvas.getPointer(o.e);
            var x2 = Utility.snapToGrid(pointer.x, gridsize);
            var y2 = Utility.snapToGrid(pointer.y, gridsize) ;

            var length = Utility.calculateLengthInput(startPoint.x, startPoint.y, x2, y2, input, gridsize);
            
            currentLine.set('displayLength', length); // Update displayLength property
            
            var midX = (startPoint.x + x2) / 2;
            var midY = (startPoint.y + y2) / 2 ;

            if (currentLine.lengthText) {
                currentLine.lengthText.set({ text: length + ' ft', left: midX + 3, top: midY -20});
            } else {
                currentLine.lengthText = new fabric.Text(length + ' ft', {
                    left: midX,
                    top: midY - 10,
                    fontSize: 16, // Increased font size
                    fill: 'black',
                    selectable: false,
                    evented: false // Ensure the text does not interfere with interactions
                });
                canvas.add(currentLine.lengthText);
            }
           

            // Store the length data
            Utility.addControlPoints(currentLine, input, gridsize);
        
            // Update the entire list of lengths
            
            Utility.updateFenceLengths(input, gridsize);

            currentLine = null;
            startPoint = null;
            canvas.renderAll();
        }
    });

    // Prevent default selection behavior
    canvas.on('mouse:down', function(o) {
        if (currentMode !== 'fence') {
            canvas.selection = false;
        }
    });

    canvas.on('mouse:move', function(o) {
        if (currentMode !== 'fence') {
            canvas.selection = false;
        }
    });

    // Snapping functionality when moving objects in select mode
    canvas.on('object:moving', function(e) {
        var obj = e.target;
        // if (currentMode === 'select') {
        //     if (obj.line) {
        //         // Handle the movement of control points
        //         if (obj === obj.line.controls.startControl) {
        //             obj.line.set({
        //                 x1: Utility.snapToGrid(obj.left, gridsize),
        //                 y1: Utility.snapToGrid(obj.top, gridsize)
        //             });
        //         } else if (obj === obj.line.controls.endControl) {
        //             obj.line.set({
        //                 x2: Utility.snapToGrid(obj.left, gridsize),
        //                 y2: Utility.snapToGrid(obj.top, gridsize)
        //             });
        //         }
        //         Utility.updateLengthText(obj.line, input, gridsize);
        //         canvas.renderAll();
        //         Utility.updateFenceLengths(input, gridsize);
        //     }
        // }
    });
});

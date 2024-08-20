document.addEventListener('DOMContentLoaded', function() {
    window.canvas = new fabric.Canvas('canvas', {
        width: 1000,
        height: 800,
        selection: false // Disable the selection box
    });

    GridUtils.createGrid(canvas);

    var gridSize = 50; // Define grid size (assuming it's the same as in grid.js)
    var isDrawing = false;
    var currentMode = 'fence';
    var startPoint;
    var currentLine;
    var lengthText;
    var lengths = []; // Array to store lengths of all fence lines

    function snapToGrid(value) {
        return Math.round(value / gridSize) * gridSize;
    }

    function calculateLength(x1, y1, x2, y2) {
        var dx = Math.abs(x2 - x1);
        var dy = Math.abs(y2 - y1);
        var lengthInFeet = Math.sqrt(dx * dx + dy * dy) / gridSize;
        return lengthInFeet.toFixed(1); // Round to 1 decimal point
    }

    function setMode(mode) {
        currentMode = mode;
        isDrawing = false;
        canvas.isDrawingMode = (mode === 'draw');
        canvas.selection = false; // Disable the selection box for all modes
        canvas.forEachObject(function(obj) {
            // Ensure lines and grid lines are never selectable
            if (obj.type === 'line' && obj.stroke !== '#ccc') {
                obj.selectable = false;
                obj.evented = false;
            }
            // Ensure grid lines are never selectable
            if (obj.type === 'circle' && obj.line) {
                obj.selectable = (mode === 'select');
                obj.evented = (mode === 'select');
                obj.visible = (mode === 'select'); // Hide control points when not in select mode
            }
        });
        canvas.renderAll();
    }

    document.getElementById('fenceMode').addEventListener('click', function() {
        setMode('fence');
    });

    document.getElementById('gateMode').addEventListener('click', function() {
        // Placeholder for gate functionality
    });

    document.getElementById('selectMode').addEventListener('click', function() {
        setMode('select');
    });

    document.getElementById('clear').addEventListener('click', function() {
        canvas.clear();
        GridUtils.createGrid(canvas);
        lengths = [];
        Utility.updateLengthList(lengths); // Clear the list
    });

    function addControlPoints(line) {
        var startControl = new fabric.Circle({
            left: snapToGrid(line.x1),
            top: snapToGrid(line.y1),
            radius: 5,
            fill: 'red',
            hasControls: false,
            hasBorders: false,
            selectable: true,
            visible: (currentMode === 'select'), // Visible only in select mode
            originX: 'center',
            originY: 'center'
        });

        var endControl = new fabric.Circle({
            left: snapToGrid(line.x2),
            top: snapToGrid(line.y2),
            radius: 5,
            fill: 'red',
            hasControls: false,
            hasBorders: false,
            selectable: true,
            visible: (currentMode === 'select'), // Visible only in select mode
            originX: 'center',
            originY: 'center'
        });

        startControl.line = line;
        endControl.line = line;

        startControl.on('moving', function(event) {
            var pointer = canvas.getPointer(event.e);
            var x = snapToGrid(pointer.x);
            var y = snapToGrid(pointer.y);
            startControl.set({ left: x, top: y });
            startControl.line.set({ x1: x, y1: y });
            updateLengthText(startControl.line);
            canvas.renderAll();
        });

        endControl.on('moving', function(event) {
            var pointer = canvas.getPointer(event.e);
            var x = snapToGrid(pointer.x);
            var y = snapToGrid(pointer.y);
            endControl.set({ left: x, top: y });
            endControl.line.set({ x2: x, y2: y });
            updateLengthText(endControl.line);
            canvas.renderAll();
        });

        canvas.add(startControl);
        canvas.add(endControl);

        line.controls = { startControl, endControl };
    }

    function updateLengthText(line) {
        var length = calculateLength(line.x1, line.y1, line.x2, line.y2);
        line.set('displayLength', length);

        var midX = (line.x1 + line.x2) / 2;
        var midY = (line.y1 + line.y2) / 2 - 10;

        if (line.lengthText) {
            canvas.remove(line.lengthText);
        }

        line.lengthText = new fabric.Text(length + ' ft', {
            left: midX,
            top: midY,
            fontSize: 16,
            fill: 'black',
            selectable: false,
            evented: false
        });

        canvas.add(line.lengthText);
    }

    canvas.on('mouse:down', function(o) {
        if (currentMode === 'fence') {
            isDrawing = true;
            var pointer = canvas.getPointer(o.e);
            startPoint = { x: snapToGrid(pointer.x), y: snapToGrid(pointer.y) };

            currentLine = new fabric.CustomLine([startPoint.x, startPoint.y, startPoint.x, startPoint.y], {
                stroke: 'black',
                strokeWidth: 2,
                selectable: false, // Ensure the line is not selectable during drawing
                evented: false, // Ensure the line is not interactive
                customProperty: 'my custom value', // Custom property example
                displayLength: 0 // Initialize displayLength
            });
            canvas.add(currentLine);
        }
    });

    canvas.on('mouse:move', function(o) {
        if (!isDrawing || !currentLine) return;

        var pointer = canvas.getPointer(o.e);
        var x2 = snapToGrid(pointer.x);
        var y2 = snapToGrid(pointer.y);

        currentLine.set({ x2: x2, y2: y2 });
        canvas.renderAll();

        // Calculate the length and position for the length text
        var length = calculateLength(startPoint.x, startPoint.y, x2, y2);
        currentLine.set('displayLength', length); // Update displayLength property

        var midX = (startPoint.x + x2) / 2;
        var midY = (startPoint.y + y2) / 2 - 10; // Slightly above the line

        // Remove existing temporary length text if any
        if (lengthText) {
            canvas.remove(lengthText);
        }

        lengthText = new fabric.Text(length + ' ft', {
            left: midX,
            top: midY,
            fontSize: 16, // Increased font size
            fill: 'black',
            selectable: false,
            evented: false // Ensure the text does not interfere with interactions
        });

        canvas.add(lengthText);
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

            // Finalize the length text and add it to the canvas
            var pointer = canvas.getPointer(o.e);
            var x2 = snapToGrid(pointer.x);
            var y2 = snapToGrid(pointer.y);

            var length = calculateLength(startPoint.x, startPoint.y, x2, y2);
            currentLine.set('displayLength', length); // Update displayLength property

            var midX = (startPoint.x + x2) / 2;
            var midY = (startPoint.y + y2) / 2 - 10;

            var finalizedLengthText = new fabric.Text(length + ' ft', {
                left: midX,
                top: midY - 10,
                fontSize: 16, // Increased font size
                fill: 'black',
                selectable: false,
                evented: false // Ensure the text does not interfere with interactions
            });

            currentLine.lengthText = finalizedLengthText;
            //canvas.add(finalizedLengthText);
            canvas.renderAll();

            // Store the length data
            lengths.push(length);

            // Update the entire list of lengths
            Utility.updateLengthList(lengths);

            addControlPoints(currentLine);

            currentLine = null;
            lengthText = null; // Clear the temporary length text
            startPoint = null;
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
        if (currentMode === 'select') {
            if (obj.line) {
                // Handle the movement of control points
                if (obj === obj.line.controls.startControl) {
                    obj.line.set({
                        x1: snapToGrid(obj.left),
                        y1: snapToGrid(obj.top)
                    });
                } else if (obj === obj.line.controls.endControl) {
                    obj.line.set({
                        x2: snapToGrid(obj.left),
                        y2: snapToGrid(obj.top)
                    });
                }
                updateLengthText(obj.line);
                canvas.renderAll();
            }
        }
    });

    // Function to get stored lengths
    window.getLengths = function() {
        return lengths;
    };
});

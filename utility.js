window.Utility = {
    updateLengthList: function(lengths, gates, input) {
        var lengthsList = document.getElementById('lengthsList');
        lengthsList.innerHTML = ''; // Clear the list
        
        lengths.forEach(function(line) {
            var listItem = document.createElement('li');
            listItem.textContent = line.material + ' Fence: ' + (line.displayLength) + ' ft';
            lengthsList.appendChild(listItem);
        });
        
        
        
        gates.forEach(function(item) {
          
            
            var listItem = document.createElement('li');
            listItem.textContent = item.controlPoint.gate.material + ' Gate (2ft)';
            lengthsList.appendChild(listItem);
        });
        Utility.updateTotals(lengths, gates, input);
    },
    updateTotals: function(lengths, gates, input) {
        var woodTotal = 0;
        var chainlinkTotal = 0;
        var plasticTotal = 0;
        var gatesTotal = 0;

        lengths.forEach(function(line) {
            var length = parseFloat(line.displayLength);
            if (line.material === 'Wooden') woodTotal += length;
            if (line.material === 'Chainlink') chainlinkTotal += length;
            if (line.material === 'Plastic') plasticTotal += length;
        });

        gates.forEach(function(gate) {
            gatesTotal += 2;
        });

        document.getElementById('woodTotal').textContent = 'Wood: ' + (woodTotal ).toFixed(1) + ' ft';
        document.getElementById('chainlinkTotal').textContent = 'Chainlink: ' + (chainlinkTotal).toFixed(1) + ' ft';
        document.getElementById('plasticTotal').textContent = 'Plastic: ' + (plasticTotal ).toFixed(1) + ' ft';
        document.getElementById('gatesTotal').textContent = 'Gates: ' + (gatesTotal ).toFixed(1) + ' ft';
    },
    removeObject: function(canvas, target) {
        if (target && target.type !== 'line' && target.stroke !== '#ccc') {
            canvas.remove(target);
            canvas.renderAll();
        }
    },
    // Set mode function for draw and select. 
    setMode: function(mode) {
        currentMode = mode;
        isDrawing = false;
        window.canvas.isDrawingMode = (mode === 'draw');
        window.canvas.selection = false; // Disable the selection box for all modes
        window.canvas.forEachObject(function(obj) {
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

            if (obj.type === 'image'){
                obj.selectable = (mode === 'select');
                obj.evented = (mode === 'select');
            }
        });
        window.canvas.renderAll();
    },
    addControlPoints: function(line,input, gridsize) {

        
        var startControl = new fabric.Circle({
            left: Utility.snapToGrid(line.x1, gridsize),
            top: Utility.snapToGrid(line.y1, gridsize),
            radius: 5,
            fill: 'red',
            hasControls: false,
            hasBorders: false,
            selectable: true,
            visible: (currentMode === "select"), // Visible only in select mode
            originX: 'center',
            originY: 'center'
        });

        var endControl = new fabric.Circle({
            left: Utility.snapToGrid(line.x2, gridsize),
            top: Utility.snapToGrid(line.y2, gridsize),
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
            var pointer = window.canvas.getPointer(event.e);
            var x = Utility.snapToGrid(pointer.x, gridsize);
            var y = Utility.snapToGrid(pointer.y, gridsize);
            startControl.set({ left: x, top: y });
            startControl.line.set({ x1: x, y1: y });
            Utility.updateLengthText(startControl.line, input, gridsize);
            window.canvas.renderAll();
            Utility.updateFenceLengths(input, gridsize) ;
        });

        endControl.on('moving', function(event) {
            var pointer = window.canvas.getPointer(event.e);
            var x = Utility.snapToGrid(pointer.x, gridsize);
            var y = Utility.snapToGrid(pointer.y, gridsize);
            endControl.set({ left: x, top: y });
            endControl.line.set({ x2: x, y2: y });
            Utility.updateLengthText(endControl.line, input, gridsize);
            window.canvas.renderAll();
            Utility.updateFenceLengths(input, gridsize);
        });

        window.canvas.add(startControl);
        window.canvas.add(endControl);
        
        
        line.controls = { startControl, endControl };
    },
    calculateAdjustedLength: function(line, input, gridsize) {
        var length = parseFloat(Utility.calculateLengthInput(line.x1, line.y1, line.x2, line.y2, input, gridsize));
        
        gates.forEach(function(gate) {
            var distanceToLine = Math.sqrt(Math.pow(gate.x - ((line.x1 + line.x2) / 2), 2) + Math.pow(gate.y - ((line.y1 + line.y2) / 2), 2));
            if (distanceToLine < 100) {
                length -= gate.width;
            }
        });
        return length.toFixed(1);
    },
    updateFenceLengths:function(input, gridsize) {
        lengths = window.canvas.getObjects().filter(obj => obj.type === 'customLine')
        lengths.forEach(function(line) {
            line.displayLength = Utility.calculateAdjustedLength(line, input, gridsize);
        });
        var gates = window.canvas.getObjects().filter(obj => obj.type === 'rect');
        

        Utility.updateLengthList(lengths, gates, input);
    },
    calculateLength: function(x1, y1, x2, y2) {
        var dx = Math.abs(x2 - x1);
        var dy = Math.abs(y2 - y1);
        var lengthInFeet = Math.sqrt(dx * dx + dy * dy) / 50;
        lengthInFeet = lengthInFeet;
        return lengthInFeet.toFixed(1); // Round to 1 decimal point
    },
    calculateLengthInput: function(x1, y1, x2, y2,input, gridsize) {
        

        var dx = Math.abs(x2 - x1);
        var dy = Math.abs(y2 - y1);
        var lengthInFeet = Math.sqrt(dx * dx + dy * dy) / gridsize; 
        lengthInFeet = lengthInFeet * input;
        return lengthInFeet.toFixed(1); // Round to 1 decimal point
    },
    snapToGrid: function(value, gridsize) {
        return Math.round(value / gridsize) * gridsize;
    },
    updateLengthText: function(line, input, gridsize) {
        if (line.type === 'customLine') { // Ensure only lines have length text
            var length = Utility.calculateLengthInput(line.x1, line.y1, line.x2, line.y2, input, gridsize);
            
            line.set('displayLength', length);

            var midX = (line.x1 + line.x2) / 2;
            var midY = (line.y1 + line.y2) / 2 - 10;

            if (line.lengthText) {
                window.canvas.remove(line.lengthText);
            }

            line.lengthText = new fabric.Text(length + ' ft', {
                left: midX + 3,
                top: midY - 10,
                fontSize: 16,
                fill: 'black',
                selectable: false,
                evented: false
            });

            window.canvas.add(line.lengthText);
        }
    }

















};

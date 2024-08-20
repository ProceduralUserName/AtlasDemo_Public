document.addEventListener('DOMContentLoaded', function() {
    const canvas = window.canvas; // Assuming the Fabric.js canvas is globally accessible
    let selectedObject = null;

    // Create the context menu
    const contextMenu = document.getElementById('contextMenu');
    const deleteOption = document.getElementById('deleteOption');
    const contextInfo = document.getElementById('contextInfo');

    const HIT_DISTANCE = 20; // Distance threshold for hit detection

    // Function to show the context menu
    function showContextMenu(event, target, input) {
        event.preventDefault();
        selectedObject = target;
        // Update the context menu info
        if (target.type === 'customLine') {
            contextInfo.textContent = `Info: Length - ${target.displayLength}  ft, Material - ${target.material}`;
        } else if (target.type === 'rect') {
            contextInfo.textContent = `Info: Gate - 2 ft, ${target.controlPoint.gate.material}`;
        } else if ( target.type === 'image'){
            contextInfo.textContent = 'Info: Tree';
        }

        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.classList.add('visible');
    }

    // Function to hide the context menu
    function hideContextMenu() {
        contextMenu.classList.remove('visible');
    }

    // Function to check if a point is near a line
    function isPointNearLine(x1, y1, x2, y2, px, py, threshold) {
        const dist = Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1) /
            Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));
        return dist <= threshold;
    }
    function isPointInRect(rect, pointer) {
        const rectX1 = rect.left;
        const rectY1 = rect.top;
        const rectX2 = rect.left + rect.getScaledWidth();
        const rectY2 = rect.top + rect.getScaledHeight();

        return (pointer.x >= rectX1 && pointer.x <= rectX2 && pointer.y >= rectY1 && pointer.y <= rectY2);
    }

    function isPointNearImage(img, pointer, threshold) {
         // Calculate the center of the image
         const imgCenterX = img.left + (img.getScaledWidth()) / 2;
         const imgCenterY = img.top + (img.getScaledHeight()) / 2;
     
         // Calculate the distance from the pointer to the center of the image
         //const distance = Math.sqrt(Math.pow(pointer.x - imgCenterX, 2) + Math.pow(pointer.y - imgCenterY, 2));
         const distance = (pointer.x - imgCenterX) + (pointer.y - imgCenterY)
         // Return true if the distance is within the threshold
         return distance <= threshold;
    }
    
    var input = 1;
    document.getElementById('distanceMultiplier').addEventListener('change', function(){
        input = document.getElementById('distanceMultiplier').value;
    })
    var gridsize = 50;
    document.getElementById('gridSize').addEventListener('change', function(){
        gridsize = document.getElementById('gridSize').value;
    })
    // Add event listener to the canvas for right-click
    document.addEventListener('contextmenu', function(event) {
        // Prevent default context menu from showing
        event.preventDefault();

        
        
        // Get the Fabric.js pointer
        const pointer = canvas.getPointer(event);

        // Iterate over all objects to find the one under the pointer or within the hit distance
        const objects = canvas.getObjects();
        let target = null;
        for (let i = objects.length - 1; i >= 0; i--) {
            if (objects[i].type === 'customLine') {
                if (isPointNearLine(objects[i].x1, objects[i].y1, objects[i].x2, objects[i].y2, pointer.x, pointer.y, HIT_DISTANCE)) {
                    target = objects[i];
                    break;
                }
            } else if (objects[i].type === 'rect' && isPointInRect(objects[i], pointer)) {
                target = objects[i];
                break;
            } else if (objects[i].type === 'image' && isPointNearImage(objects[i], pointer, 100)){
                target = objects[i];
                //target = findNearestImage(pointer, 50)
                break;
            }
        }

        // Show the custom context menu if a target is found
        if (target && (target.type === 'customLine' || target.type === 'rect' || target.type === 'image')) {
            showContextMenu(event, target, input);
        } else {
            hideContextMenu();
        }
    });

    // Handle delete option click
    deleteOption.addEventListener('click', function() {
        if (selectedObject) {
            if (selectedObject.type === 'customLine') {
                // Remove the line and its associated elements
                removeLineAndAssociatedElements(selectedObject);
                updateFenceLengths(input, gridsize);
            } else if (selectedObject.type === 'rect') {
                // Remove the gate and update lengths
                const gateIndex = gates.findIndex(gate => gate === selectedObject);
                if (gateIndex > -1) {
                    gates.splice(gateIndex, 1);
                }
                console.log(selectedObject);
                
                removeGateAndControl(selectedObject)

                updateFenceLengths(input, gridsize);
               
            } else if (selectedObject.type === 'image'){
                canvas.remove(selectedObject);
            }


            canvas.renderAll();
            hideContextMenu();
        }
    });
    function updateFenceLengths() {
        const lengths = canvas.getObjects().filter(obj => obj.type === 'customLine');
        lengths.forEach(function(line) {
            line.displayLength = Utility.calculateAdjustedLength(line, input, gridsize);
        });
        const gates = canvas.getObjects().filter(obj => obj.type === 'rect');
        Utility.updateLengthList(lengths, gates, input);
    }
   
    function removeGateAndControl(gate){
        if(gate.controlPoint){
            canvas.remove(gate.controlPoint);
        }
        canvas.remove(gate)
    }
    function removeLineAndAssociatedElements(line) {
        if (line.controls) {
            canvas.remove(line.controls.startControl);
            canvas.remove(line.controls.endControl);
        }
        if (line.lengthText) {
            canvas.remove(line.lengthText);
        }
        canvas.remove(line);
    }
    // Hide context menu on click outside
    document.addEventListener('click', function(event) {
        if (!contextMenu.contains(event.target)) {
            hideContextMenu();
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var gateBox;
    var isGateMode = false;
    var snappingDistance = 100; // Distance within which snapping happens
    var gateWidth = 40; // Assuming grid size is 50, gate will be slightly smaller
    var gateHeight = 30;

    window.setGateMode = function(active) {
        isGateMode = active;
        if (isGateMode) {
            createGateBox();
        } else {
            if (gateBox) {
                canvas.remove(gateBox);
                if (gateBox.controlPoint) {
                    canvas.remove(gateBox.controlPoint);
                }
                gateBox = null;
            }
        }
    };

    function createGateBox() {
        gateBox = new fabric.Rect({
            width: gateWidth,
            height: gateHeight,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 2,
            left: -gateWidth / 2, // Start off-screen
            top: -gateHeight / 2,  // Start off-screen
            selectable: false,
            evented: false,
            originX: 'center',
            originY: 'center'
        });
        canvas.add(gateBox);
        canvas.renderAll();
    }

    function updateGateBoxPosition(pointer) {
        if (!gateBox) return;

        var closestFence = null;
        var closestDistance = Infinity;
        var snappingPoint = { x: pointer.x, y: pointer.y };
        var angle = 0;

        canvas.forEachObject(function(obj) {
            if (obj.type === 'customLine') {
                var p1 = { x: obj.x1, y: obj.y1 };
                var p2 = { x: obj.x2, y: obj.y2 };
                var projection = projectPointOntoLineSegment(pointer, p1, p2);
                var distance = Math.sqrt(Math.pow(pointer.x - projection.x, 2) + Math.pow(pointer.y - projection.y, 2));
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestFence = obj;
                    snappingPoint = projection;
                    angle = calculateAngle(p1, p2);
                }
            }
        });

        if (closestDistance < snappingDistance) {
            gateBox.set({ left: snappingPoint.x, top: snappingPoint.y, angle: angle });
            if (gateBox.controlPoint) {
                gateBox.controlPoint.set({ left: snappingPoint.x, top: snappingPoint.y });
            }
        } else {
            gateBox.set({ left: pointer.x, top: pointer.y, angle: 0 });
            if (gateBox.controlPoint) {
                gateBox.controlPoint.set({ left: pointer.x, top: pointer.y });
            }
        }

        canvas.renderAll();
    }

    window.gates = [];

    function placeGate() {
        if (!gateBox) return;
        gateBox.set({ selectable: true, evented: true });

        var pointer = canvas.getPointer(event.e);
        var closestFence = null;
        var closestDistance = Infinity;
        canvas.forEachObject(function(obj) {
            if (obj.type === 'customLine') {
                var p1 = { x: obj.x1, y: obj.y1 };
                var p2 = { x: obj.x2, y: obj.y2 };
                var projection = projectPointOntoLineSegment(pointer, p1, p2);
                var distance = Math.sqrt(Math.pow(pointer.x - projection.x, 2) + Math.pow(pointer.y - projection.y, 2));
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestFence = obj;
                }
            }
        });

        if (closestFence && closestDistance < snappingDistance) {
            var gate = {
                x: gateBox.left,
                y: gateBox.top,
                width: 2, // The width of the gate in feet
                material: closestFence.material
            };
            gates.push(gate);

            // Add a control point for the gate
            var controlPoint = new fabric.Circle({
                left: gateBox.left,
                top: gateBox.top,
                radius: 5,
                fill: 'blue',
                hasControls: false,
                hasBorders: false,
                selectable: true,
                originX: 'center',
                originY: 'center',
                visible: currentMode === 'select',
                evented: currentMode === 'select'
            });

            controlPoint.gate = gate;
            gateBox.controlPoint = controlPoint;

            controlPoint.on('moving', function(event) {
                var pointer = canvas.getPointer(event.e);
                var closestFence = findNearestFence(pointer);


                
            
                controlPoint.set({ left: x, top: y });
                controlPoint.gate.x = x;
                controlPoint.gate.y = y;
                // Utility.updateLengthText(startControl.line, input, gridsize);
                // window.canvas.renderAll();
                // Utility.updateFenceLengths(input, gridsize) ;




                if (closestFence) {
                    var p1 = { x: closestFence.x1, y: closestFence.y1 };
                    var p2 = { x: closestFence.x2, y: closestFence.y2 };
                    var projection = projectPointOntoLineSegment(pointer, p1, p2);

                    controlPoint.set({ left: projection.x, top: projection.y });
                    if (gateBox) {
                        gateBox.set({ left: projection.x, top: projection.y });
                        gate.x = projection.x;
                        gate.y = projection.y;
                    }
                } else {
                    var x = GridUtils.snapToGrid(pointer.x);
                    var y = GridUtils.snapToGrid(pointer.y);
                    controlPoint.set({ left: x, top: y });
                    if (gateBox) {
                        gateBox.set({ left: x, top: y });
                        gate.x = x;
                        gate.y = y;
                    }
                }

                canvas.renderAll();
                Utility.updateFenceLengths();
            });

            // Attach a "modified" event to the control point to update the gateBox when it stops moving
            controlPoint.on('modified', function() {
                if (gateBox) {
                    gateBox.set({ left: controlPoint.left, top: controlPoint.top });
                    canvas.renderAll();
                }
            });

            canvas.add(controlPoint);
        }

        gateBox = null;
        canvas.renderAll();
    }

    canvas.on('mouse:move', function(o) {
        if (isGateMode && gateBox) {
            var pointer = canvas.getPointer(o.e);
            updateGateBoxPosition(pointer);
        }
    });

    canvas.on('mouse:down', function(o) {
        if (isGateMode && gateBox) {
            placeGate();
        }
    });

    function projectPointOntoLineSegment(point, p1, p2) {
        var A = point.x - p1.x;
        var B = point.y - p1.y;
        var C = p2.x - p1.x;
        var D = p2.y - p1.y;

        var dot = A * C + B * D;
        var len_sq = C * C + D * D;
        var param = (len_sq !== 0) ? dot / len_sq : -1;

        var xx, yy;

        if (param < 0) {
            xx = p1.x;
            yy = p1.y;
        } else if (param > 1) {
            xx = p2.x;
            yy = p2.y;
        } else {
            xx = p1.x + param * C;
            yy = p1.y + param * D;
        }

        return { x: xx, y: yy };
    }

    function calculateAngle(p1, p2) {
        var angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        return angle;
    }

    function findNearestFence(pointer) {
        var closestFence = null;
        var closestDistance = Infinity;

        canvas.forEachObject(function(obj) {
            if (obj.type === 'customLine') {
                var p1 = { x: obj.x1, y: obj.y1 };
                var p2 = { x: obj.x2, y: obj.y2 };
                var projection = projectPointOntoLineSegment(pointer, p1, p2);
                var distance = Math.sqrt(Math.pow(pointer.x - projection.x, 2) + Math.pow(pointer.y - projection.y, 2));
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestFence = obj;
                }
            }
        });

        return closestFence;
    }
});

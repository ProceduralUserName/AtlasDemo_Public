document.addEventListener('DOMContentLoaded', function() {
    let selectedObjectType = null;

    // Function to handle object selection from the dropdown
    function selectObjectType(event) {
        selectedObjectType = event.target.value;
        enterObjectPlacementMode();
    }

    // Function to enter object placement mode
    function enterObjectPlacementMode() {
        canvas.defaultCursor = 'crosshair';

        canvas.on('mouse:down', function(event) {
            if(window.currentMode !== "object"){
                return;
            }
            if (selectedObjectType) {
                const pointer = canvas.getPointer(event.e);
                placeObjectOnGrid(pointer.x, pointer.y, selectedObjectType);
                
            }
        });

       
    }

    // Function to place the selected object on the grid
    function placeObjectOnGrid(x, y, objectType) {
        let imgUrl;
        let scale = 1.0
        // Example object types with corresponding image URLs
        switch (objectType) {
            case 'Tree':
                imgUrl = 'images/tree.png';
                scale = 0.08
                break;
            case 'Rock':
                imgUrl = 'images/rock.png';
                break;
            case 'Bench':
                imgUrl = 'images/bench.png';
                break;
            default:
                console.error('Unknown object type:', objectType);
                return;
        }

        fabric.Image.fromURL(imgUrl, function(img) {
            img.set({
                left: x,
                top: y,
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale,
                selectable: false
            });
            canvas.add(img);
            canvas.renderAll();
            
        });
        canvas.on('mouse:up', function(event){
            window.currentMode === 'select'
        })
    }

    // Event listener for the object dropdown
    const objectDropdown = document.getElementById('objectDropdown');
    objectDropdown.addEventListener('change', selectObjectType);
});

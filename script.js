document.getElementById('imageInput').addEventListener('change', handleImageUpload);
document.getElementById('scaleSlider').addEventListener('input', updateScale);
document.getElementById('gridSize').addEventListener('change', drawPixelArt);
document.getElementById('saveButton').addEventListener('click', savePixelArt);

let img, imageData, gridSize = 64;
let colorMap = {};
let colors = [];

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img = new Image();
            img.onload = function() {
                gridSize = parseInt(document.getElementById('gridSize').value);
                const tempCanvas = document.createElement('canvas');
                const tempContext = tempCanvas.getContext('2d');
                
                // Set temporary canvas to the selected grid size
                tempCanvas.width = gridSize;
                tempCanvas.height = gridSize;

                // Draw image onto the temporary canvas at selected grid size
                tempContext.drawImage(img, 0, 0, gridSize, gridSize);
                imageData = tempContext.getImageData(0, 0, gridSize, gridSize);
                extractColors(); // Extract colors to build the palette
                drawPixelArt();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function extractColors() {
    colorMap = {};
    colors = [];
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        const key = `${r}-${g}-${b}`;
        if (!colorMap[key]) {
            colorMap[key] = colors.length;
            colors.push([r, g, b]);
        }
    }
}

function updateScale() {
    const scale = document.getElementById('scaleSlider').value;
    document.getElementById('scaleValue').innerText = `${scale}%`;
    drawPixelArt();
}

function drawPixelArt() {
    if (!imageData) return;
    
    const scale = document.getElementById('scaleSlider').value / 100;
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const data = imageData.data;
    
    // Calculate the pixel size and canvas size
    const pixelSize = 10 * scale;
    const canvasSize = gridSize * pixelSize;
    
    // Set canvas dimensions
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw each pixel as a block with the specified scale
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const index = (y * gridSize + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];

            const colorIndex = colorMap[`${r}-${g}-${b}`];
            const [colorR, colorG, colorB] = colors[colorIndex] || [r, g, b];

            context.fillStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${a / 255})`;
            context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
    }
}

function savePixelArt() {
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'pixel_art.png';
    link.click();
}
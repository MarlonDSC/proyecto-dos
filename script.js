const algorithms = [
    { name: 'burbuja', func: '_burbuja', elementId: 'burbuja-bars' },
    { name: 'busqueda_binaria', func: '_busqueda_binaria', elementId: 'busqueda-binaria-bars' },
    { name: 'busqueda_secuencial', func: '_busqueda_secuencial', elementId: 'busqueda-secuencial-bars' },
    { name: 'insercion', func: '_insercion', elementId: 'insercion-bars' },
    { name: 'quick_sort', func: '_quick_sort', elementId: 'quick-sort-bars' },
];

const originalArray = [64, 25, 12, 22, 11];
const animationSpeed = 500; // Cambiar según se desee

const createBars = (array, elementId) => {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    array.forEach(value => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value * 2}px`; // Escalar para que sea visible
        container.appendChild(bar);
    });
};

const animateSorting = (sortedArray, elementId) => {
    let index = 0;
    const interval = setInterval(() => {
        if (index >= sortedArray.length) {
            clearInterval(interval);
            return;
        }
        createBars(sortedArray[index], elementId);
        index++;
    }, animationSpeed);
};

const runAlgorithm = async (wasmFile, funcName, originalArray, elementId) => {
    const response = await fetch(wasmFile);
    const buffer = await response.arrayBuffer();
    const module = await WebAssembly.compile(buffer);
    const instance = await WebAssembly.instantiate(module);
    const { memory, [funcName]: func } = instance.exports;

    const length = originalArray.length;
    const bytesPerElement = Int32Array.BYTES_PER_ELEMENT;
    const wasmMemory = new Int32Array(memory.buffer, 0, length);
    wasmMemory.set(originalArray);

    const sortedArray = [];
    const snapshotMemory = new Int32Array(memory.buffer, 0, length);

    if (funcName.includes('busqueda')) {
        const result = func(0, length, 22); // Suponiendo que el valor a buscar es 22
        console.log(`Resultado de ${funcName}: ${result}`);
        return;
    }

    const sortArray = (arr) => {
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    sortedArray.push([...arr]);
                }
            }
        }
    };

    sortArray([...originalArray]);
    animateSorting(sortedArray, elementId);
};

algorithms.forEach(algo => {
    createBars(originalArray, algo.elementId);
    runAlgorithm(`dist/${algo.name}.wasm`, algo.func, originalArray, algo.elementId);
});

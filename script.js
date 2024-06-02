const algorithms = [
    { name: 'burbuja', func: '_burbuja', elementId: 'burbuja-bars', valuesId: 'burbuja-values' },
    { name: 'insercion', func: '_insercion', elementId: 'insercion-bars', valuesId: 'insercion-values' },
    { name: 'quick_sort', func: '_quick_sort', elementId: 'quick-sort-bars', valuesId: 'quick-sort-values' },
];

const searchAlgorithms = [
    { name: 'busqueda_secuencial', func: '_busqueda_secuencial', elementId: 'busqueda-secuencial-search' },
    { name: 'busqueda_binaria', func: '_busqueda_binaria', elementId: 'busqueda-binaria-search' },
];

const originalArray = [64, 25, 12, 22, 11];
const animationSpeed = 500; // Cambiar segun se desee

const createBars = (array, elementId, valuesId) => {
    const container = document.getElementById(elementId);
    const valuesContainer = document.getElementById(valuesId);
    container.innerHTML = '';
    valuesContainer.innerHTML = '';
    array.forEach(value => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value * 2}px`; // Escalar para que sea visible
        container.appendChild(bar);

        const valueDiv = document.createElement('div');
        valueDiv.classList.add('bar-value');
        valueDiv.innerText = value;
        valuesContainer.appendChild(valueDiv);
    });
};

const animateSorting = (sortedArray, elementId, valuesId) => {
    let index = 0;
    const interval = setInterval(() => {
        if (index >= sortedArray.length) {
            clearInterval(interval);
            return;
        }
        createBars(sortedArray[index], elementId, valuesId);
        index++;
    }, animationSpeed);
};

const createSearchItems = (array, elementId) => {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    array.forEach(value => {
        const item = document.createElement('div');
        item.classList.add('search-item');
        item.innerText = value;
        container.appendChild(item);
    });
};

const animateSearch = (array, elementId, index, found) => {
    const items = document.getElementById(elementId).children;
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('checked', 'found');
        if (i <= index) {
            items[i].classList.add('checked');
        }
        if (i === index && found) {
            items[i].classList.add('found');
        }
    }
};

const runAlgorithm = async (wasmFile, funcName, originalArray, elementId, valuesId) => {
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
        const searchArray = [...originalArray].sort((a, b) => a - b);
        createSearchItems(searchArray, elementId);
        let found = false;
        let index = 0;
        if (funcName === '_busqueda_secuencial') {
            for (let i = 0; i < searchArray.length; i++) {
                if (searchArray[i] === 22) {
                    index = i;
                    found = true;
                    break;
                }
            }
        } else if (funcName === '_busqueda_binaria') {
            let inicio = 0, fin = searchArray.length - 1;
            while (inicio <= fin) {
                let medio = Math.floor((inicio + fin) / 2);
                if (searchArray[medio] === 22) {
                    index = medio;
                    found = true;
                    break;
                }
                if (searchArray[medio] < 22) {
                    inicio = medio + 1;
                } else {
                    fin = medio - 1;
                }
            }
        }
        animateSearch(searchArray, elementId, index, found);
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
    animateSorting(sortedArray, elementId, valuesId);
};

algorithms.forEach(algo => {
    createBars(originalArray, algo.elementId, algo.valuesId);
    runAlgorithm(`dist/${algo.name}.wasm`, algo.func, originalArray, algo.elementId, algo.valuesId);
});

searchAlgorithms.forEach(algo => {
    runAlgorithm(`dist/${algo.name}.wasm`, algo.func, originalArray, algo.elementId);
});

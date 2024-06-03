const algorithms = [
    { name: 'burbuja', func: 'burbuja', elementId: 'burbuja-bars', valuesId: 'burbuja-values' },
    { name: 'insercion', func: 'insercion', elementId: 'insercion-bars', valuesId: 'insercion-values' },
    { name: 'quick_sort', func: 'quick_sort', elementId: 'quick-sort-bars', valuesId: 'quick-sort-values' },
];

const searchAlgorithms = [
    { name: 'busqueda_secuencial', func: 'busqueda_secuencial', elementId: 'busqueda-secuencial-search' },
    { name: 'busqueda_binaria', func: 'busqueda_binaria', elementId: 'busqueda-binaria-search' },
];

const originalArray = [
    64, 25, 12, 22, 11, 45, 67, 89, 34, 23, 78, 56, 90, 21, 43, 76, 54, 32, 98, 87,
    65, 123, 234, 345, 456, 567, 678, 789, 890, 910, 876, 765, 654, 543, 432, 321,
    210, 111, 222, 333, 444, 555, 666, 777, 888, 999, 112, 223, 334, 445, 556, 667,
    778, 889, 990, 101, 202, 303, 404, 505, 606, 707, 808, 909, 100, 200, 300, 400,
    500, 600, 700, 800, 900, 110, 220, 330, 440, 550, 660, 770, 880, 990, 102, 204,
    306, 408, 510, 612, 714, 816, 918, 103, 206, 309, 412, 515, 618, 721, 824, 927
];

const searchArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const createBars = (array, elementId, valuesId) => {
    const container = document.getElementById(elementId);
    const valuesContainer = document.getElementById(valuesId);
    container.innerHTML = '';
    valuesContainer.innerHTML = array.join(', ');
    array.forEach(value => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value * 0.5}px`; // Escalar para que sea visible
        container.appendChild(bar);
    });
};

const animateSorting = (sortedArray, elementId, valuesId, animationSpeed) => {
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

const animateSearch = (array, elementId, steps, animationSpeed) => {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    steps.forEach((step, index) => {
        setTimeout(() => {
            const row = document.createElement('div');
            row.classList.add('search-row');
            step.slice(0, -1).forEach((value, i) => {
                const item = document.createElement('div');
                item.classList.add('search-item');
                item.innerText = value;
                if (i === step[step.length - 1]) {
                    item.classList.add('result');
                }
                row.appendChild(item);
            });
            container.appendChild(row);
        }, animationSpeed * index);
    });
};

const runSortWorker = (wasmFile, funcName, originalArray, elementId, valuesId) => {
    const worker = new Worker('sortWorker.js');
    const startTime = performance.now();
    worker.postMessage({ wasmFile, funcName, originalArray });

    worker.onmessage = (e) => {
        const { type, steps } = e.data;
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        if (type === 'sort') {
            console.log(`Execution time for ${funcName}: ${executionTime}ms`);
            if (steps && steps.length) {
                animateSorting(steps, elementId, valuesId, executionTime / steps.length);
            } else {
                console.error('No steps received for sorting.');
            }
        } else if (type === 'error') {
            console.error(`Error from worker: ${e.data.message}`);
        }
    };

    worker.onerror = (e) => {
        console.error(`Error in worker: ${e.message}`);
    };
};

const runSearchWorker = (wasmFile, funcName, originalArray, elementId) => {
    const worker = new Worker('searchWorker.js');
    const startTime = performance.now();
    worker.postMessage({ wasmFile, funcName, originalArray });

    worker.onmessage = (e) => {
        const { type, steps } = e.data;
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        if (type === 'search') {
            console.log(`Execution time for ${funcName}: ${executionTime}ms`);
            if (steps && steps.length) {
                animateSearch(originalArray, elementId, steps, executionTime / steps.length);
            } else {
                console.error('No steps received for search.');
            }
        } else if (type === 'error') {
            console.error(`Error from worker: ${e.data.message}`);
        }
    };

    worker.onerror = (e) => {
        console.error(`Error in worker: ${e.message}`);
    };
};

const runAllWorkers = () => {
    algorithms.forEach(algo => {
        createBars(originalArray, algo.elementId, algo.valuesId);
        runSortWorker(`dist/${algo.name}.wasm`, algo.func, originalArray, algo.elementId, algo.valuesId);
    });

    searchAlgorithms.forEach(algo => {
        createSearchItems(searchArray, algo.elementId);
        runSearchWorker(`dist/${algo.name}.wasm`, algo.func, searchArray, algo.elementId);
    });
};

// Run all workers
runAllWorkers();
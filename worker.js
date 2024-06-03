onmessage = async (e) => {
    const { wasmFile, funcName, originalArray } = e.data;
    const response = await fetch(wasmFile);
    const buffer = await response.arrayBuffer();
    const module = await WebAssembly.compile(buffer);
    const instance = await WebAssembly.instantiate(module);
    const { memory, [funcName]: func } = instance.exports;

    const length = originalArray.length;
    const wasmMemory = new Int32Array(memory.buffer, 0, length);
    wasmMemory.set(originalArray);

    if (funcName.includes('busqueda')) {
        const searchArray = [...originalArray].sort((a, b) => a - b);
        let found = false;
        let steps = [];
        if (funcName === '_busqueda_secuencial') {
            for (let i = 0; i < searchArray.length; i++) {
                steps.push({ index: i, found: searchArray[i] === 22 });
                if (searchArray[i] === 22) {
                    found = true;
                    break;
                }
            }
        } else if (funcName === '_busqueda_binaria') {
            let inicio = 0, fin = searchArray.length - 1;
            while (inicio <= fin) {
                let medio = Math.floor((inicio + fin) / 2);
                steps.push({ index: medio, found: searchArray[medio] === 22 });
                if (searchArray[medio] === 22) {
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
        postMessage({ type: 'search', steps });
        return;
    }

    const sortedArray = [];
    if (funcName === '_burbuja') {
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length - i - 1; j++) {
                if (wasmMemory[j] > wasmMemory[j + 1]) {
                    [wasmMemory[j], wasmMemory[j + 1]] = [wasmMemory[j + 1], wasmMemory[j]];
                    sortedArray.push([...wasmMemory]);
                }
            }
        }
    } else if (funcName === '_insercion') {
        for (let i = 1; i < length; i++) {
            let key = wasmMemory[i];
            let j = i - 1;
            while (j >= 0 && wasmMemory[j] > key) {
                wasmMemory[j + 1] = wasmMemory[j];
                j = j - 1;
            }
            wasmMemory[j + 1] = key;
            sortedArray.push([...wasmMemory]);
        }
    } else if (funcName === '_quick_sort') {
        const quickSort = (arr, left, right) => {
            let len = arr.length,
                pivot,
                partitionIndex;
            if (left < right) {
                pivot = right;
                partitionIndex = partition(arr, pivot, left, right);
                quickSort(arr, left, partitionIndex - 1);
                quickSort(arr, partitionIndex + 1, right);
                sortedArray.push([...arr]);
            }
            return arr;
        };

        const partition = (arr, pivot, left, right) => {
            let pivotValue = arr[pivot],
                partitionIndex = left;
            for (let i = left; i < right; i++) {
                if (arr[i] < pivotValue) {
                    [arr[i], arr[partitionIndex]] = [arr[partitionIndex], arr[i]];
                    partitionIndex++;
                }
            }
            [arr[right], arr[partitionIndex]] = [arr[partitionIndex], arr[right]];
            return partitionIndex;
        };

        quickSort(wasmMemory, 0, length - 1);
    }

    postMessage({ type: 'sort', sortedArray });
};

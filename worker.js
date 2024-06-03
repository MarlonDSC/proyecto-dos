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
    postMessage({ type: 'sort', sortedArray });
};

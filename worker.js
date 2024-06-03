onmessage = async (e) => {
    const { wasmFile, funcName, originalArray } = e.data;
    const response = await fetch(wasmFile);
    const buffer = await response.arrayBuffer();
    const module = await WebAssembly.compile(buffer);
    const instance = await WebAssembly.instantiate(module, {
        env: {
            memory: new WebAssembly.Memory({ initial: 256, maximum: 256 }),
            table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
        },
    });

    console.log('Exported functions:', Object.keys(instance.exports));

    // Remove the leading underscore from funcName
    const { memory, [funcName.replace(/^_/, '')]: func } = instance.exports;

    if (typeof func !== 'function') {
        console.error(`Exported function ${funcName} is not a function`);
        return;
    }

    const length = originalArray.length;
    const wasmMemory = new Int32Array(memory.buffer, 0, length);
    wasmMemory.set(originalArray);

    const sortedArray = [];

    const snapshotMemory = () => {
        sortedArray.push([...wasmMemory]);
    };

    if (funcName.includes('busqueda')) {
        const searchArray = [...originalArray].sort((a, b) => a - b);
        let steps = [];
        let found = false;

        if (funcName === '_busqueda_secuencial' || funcName === '_busqueda_binaria') {
            for (let i = 0; i < searchArray.length; i++) {
                wasmMemory.set(searchArray);
                const result = func(i, 22);
                steps.push({ index: i, found: result === 1 });
                if (result === 1) {
                    found = true;
                    break;
                }
            }
        }

        postMessage({ type: 'search', steps });
        return;
    }

    if (funcName === '_burbuja' || funcName === '_insercion' || funcName === '_quick_sort') {
        func(0, length);
        snapshotMemory();
    }

    postMessage({ type: 'sort', sortedArray });
};
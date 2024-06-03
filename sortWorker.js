onmessage = async (e) => {
    const { wasmFile, funcName, originalArray } = e.data;
    try {
        const response = await fetch(wasmFile);
        const buffer = await response.arrayBuffer();
        const module = await WebAssembly.compile(buffer);
        const instance = await WebAssembly.instantiate(module, {
            env: {
                memory: new WebAssembly.Memory({ initial: 256, maximum: 256 }),
                table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
                _emscripten_memcpy_js: (dest, src, num) => {
                    const mem = new Uint8Array(instance.exports.memory.buffer);
                    mem.set(mem.subarray(src, src + num), dest);
                },
                emscripten_resize_heap: (size) => {
                    console.warn(`emscripten_resize_heap called with size ${size}`);
                    return false;
                }
            },
        });

        console.log('Exported functions:', Object.keys(instance.exports));

        const { memory, [funcName]: func, get_steps, get_step_count } = instance.exports;

        if (typeof func !== 'function') {
            console.error(`Exported function ${funcName} is not a function`);
            return;
        }

        const length = originalArray.length;
        const wasmMemory = new Int32Array(memory.buffer, 0, length);
        wasmMemory.set(originalArray);

        func(wasmMemory.byteOffset / 4, length);

        const stepCount = get_step_count();
        const steps = [];
        for (let i = 0; i < stepCount; i++) {
            const step = new Int32Array(memory.buffer, get_steps() + i * length * 4, length);
            steps.push([...step]);
        }

        postMessage({ type: 'sort', steps });
    } catch (error) {
        console.error('Error in WebAssembly processing:', error);
        postMessage({ type: 'error', message: error.message });
    }
};
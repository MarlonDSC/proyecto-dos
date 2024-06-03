#include <emscripten/emscripten.h>
#include <stdlib.h>
#include <string.h>

int* steps = NULL;
int step_count = 0;
int step_capacity = 0;

void add_step(int* arr, int n) {
    if (step_count == step_capacity) {
        step_capacity = step_capacity == 0 ? 10 : step_capacity * 2;
        steps = realloc(steps, step_capacity * n * sizeof(int));
    }
    memcpy(&steps[step_count * n], arr, n * sizeof(int));
    step_count++;
}

EMSCRIPTEN_KEEPALIVE
void insercion(int* arr, int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
            add_step(arr, n);
        }
        arr[j + 1] = key;
        add_step(arr, n);
    }
}

EMSCRIPTEN_KEEPALIVE
int* get_steps() {
    return steps;
}

EMSCRIPTEN_KEEPALIVE
int get_step_count() {
    return step_count;
}
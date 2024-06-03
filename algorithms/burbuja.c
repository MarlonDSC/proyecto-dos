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
void burbuja(int* arr, int n) {
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
                add_step(arr, n);
            }
        }
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
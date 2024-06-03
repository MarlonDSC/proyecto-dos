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

void swap(int* a, int* b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int partition(int arr[], int low, int high, int n) {
    int pivot = arr[high];
    int i = (low - 1);
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(&arr[i], &arr[j]);
            add_step(arr, n);
        }
    }
    swap(&arr[i + 1], &arr[high]);
    add_step(arr, n);
    return (i + 1);
}

void quickSort(int arr[], int low, int high, int n) {
    if (low < high) {
        int pi = partition(arr, low, high, n);
        quickSort(arr, low, pi - 1, n);
        quickSort(arr, pi + 1, high, n);
    }
}

EMSCRIPTEN_KEEPALIVE
void quick_sort(int* arr, int n) {
    quickSort(arr, 0, n - 1, n);
}

EMSCRIPTEN_KEEPALIVE
int* get_steps() {
    return steps;
}

EMSCRIPTEN_KEEPALIVE
int get_step_count() {
    return step_count;
}

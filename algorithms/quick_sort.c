#include <emscripten/emscripten.h>

void swap(int* a, int* b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int particion(int arr[], int bajo, int alto) {
    int pivote = arr[alto];
    int i = (bajo - 1);
    for (int j = bajo; j <= alto - 1; j++) {
        if (arr[j] < pivote) {
            i++;
            swap(&arr[i], &arr[j]);
        }
    }
    swap(&arr[i + 1], &arr[alto]);
    return (i + 1);
}

EMSCRIPTEN_KEEPALIVE
void quick_sort(int arr[], int bajo, int alto) {
    if (bajo < alto) {
        int pi = particion(arr, bajo, alto);
        quick_sort(arr, bajo, pi - 1);
        quick_sort(arr, pi + 1, alto);
    }
}

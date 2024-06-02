#include <emscripten/emscripten.h>

EMSCRIPTEN_KEEPALIVE
int busqueda_binaria(int arr[], int n, int x) {
    int inicio = 0, fin = n - 1;
    while (inicio <= fin) {
        int medio = inicio + (fin - inicio) / 2;
        if (arr[medio] == x)
            return medio;
        if (arr[medio] < x)
            inicio = medio + 1;
        else
            fin = medio - 1;
    }
    return -1;
}

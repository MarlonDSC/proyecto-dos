#include <emscripten/emscripten.h>

EMSCRIPTEN_KEEPALIVE
int busqueda_secuencial(int arr[], int n, int x) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == x)
            return i;
    }
    return -1;
}

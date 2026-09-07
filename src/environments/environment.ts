export const environment = {
  production: false,
  // IP de la red local (Ethernet de esta máquina) en vez de "localhost" —
  // así el panel funciona tanto abierto en esta PC como desde otro
  // dispositivo de la misma red (celular, otra PC). Si esta IP cambia
  // (otra red, reinicio del router), actualízala aquí.
  apiUrl: 'http://192.168.200.26:8000/api/v1',
};

# XPlay-personal raspberry server

Raspberry WEB server to acces your xbox remote and play from everythere in this world.

### Instalation

```sh
git clone https://github.com/cikpak/xplay-personal.git && cd xplay-personal && bash ./configure.sh
```

### Environment
```
PORT           - port for requests listening
XBOX_ON_TRIES  - number of tries to power on xbox through WOL
XBOX_ON_DELAY  - delay between xbox power on tries in milliseconds
```
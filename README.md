# PressPlay

Une petite borne d'arcade rétro dans le navigateur : six jeux réunis dans un hub, plus deux jeux standalone. HTML / CSS / JavaScript vanilla, **zéro dépendance à l’exécution**, un fichier = un jeu.

Esthétique brutaliste : noir profond, vert acide (`#CCFF00`), typo monospace, scanlines.

## Contenu

| Fichier | Jeu | Contrôles |
| --- | --- | --- |
| `hub.html` | Borne arcade (6 jeux) | souris, tactile (d-pad) ou clavier, `P` / bouton `PAUSE` |
| `pong.html` | Pong — édition brutaliste | souris / tactile, `P` pour pause |
| `captur.html` | Renault Captur Arcade (course d'évitement) | flèches gauche / droite |

### Jeux du hub

- **Pong** — premiers à 5 points, IA équilibrée. Souris / tactile.
- **Breakout** — 5 niveaux, raquette à la souris, briques dures, bonus (vie, multi-balle, raquette géante, ralenti, roquettes, balle de feu) et malus (accélération, raquette réduite). Clic = roquette, `P` = pause.
- **Snake** — flèches ou d-pad, niveaux de vitesse.
- **Space Invaders** — 3 vagues, flèches pour bouger, `Espace` pour tirer, d-pad tactile.
- **Tetris** — niveaux de vitesse, flèches, `Haut` = rotation, `Espace` = chute rapide, d-pad tactile.
- **Asteroids** — vagues progressives, `Gauche`/`Droite` = rotation, `Haut` = poussée, `Espace` = tirer, d-pad tactile.

## Lancer

Aucun build. Ouvre directement un fichier dans un navigateur :

```sh
open hub.html
```

Ou sers le dossier :

```sh
python3 -m http.server
```

## Détails techniques

- **Audio** : synthèse procédurale via la Web Audio API (`AudioController`) — aucun fichier son. Bouton `AUDIO: ON/OFF` dans le hub.
- **Scores** : meilleurs scores persistés par jeu dans `localStorage` (`PLAY_HI_<GAME>`), affichés dans le menu et sauvegardés même en quittant une partie.
- **Pause** : bouton `PAUSE`, touche `P` ou `Échap`, auto-pause quand la fenêtre perd le focus — physique, timers et effets sont gelés.
- **Tactile** : d-pad + bouton action affichés sur les jeux qui en ont besoin ; Pong et Breakout se jouent directement au doigt.
- **Audio** : mute persistant (`PLAY_MUTED`).
- **Rendu** : un seul `<canvas>` plein écran, boucle `requestAnimationFrame`, particules, screen shake, scanlines.

## Test

Smoke test optionnel (dev), avec Chrome installé :

```sh
npm install
npm test
```

## Licence

[MIT](LICENSE)

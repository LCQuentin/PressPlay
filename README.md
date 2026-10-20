# PressPlay

Une petite borne d'arcade rétro dans le navigateur : six jeux réunis dans un hub, plus deux jeux standalone. HTML / CSS / JavaScript vanilla, **zéro dépendance**, un fichier = un jeu.

Esthétique brutaliste : noir profond, vert acide (`#CCFF00`), typo monospace, scanlines.

## Contenu

| Fichier | Jeu | Contrôles |
| --- | --- | --- |
| `hub.html` | Borne arcade (6 jeux) | souris / clavier selon le jeu, `P` ou bouton `PAUSE` |
| `pong.html` | Pong — édition brutaliste | souris / tactile, `P` pour pause |
| `captur.html` | Renault Captur Arcade (course d'évitement) | flèches gauche / droite |

### Jeux du hub

- **Pong** — premiers à 5 points. Souris.
- **Breakout** — 5 niveaux, raquette à la souris, briques dures, bonus (vie, multi-balle, raquette géante, ralenti, roquettes, balle de feu) et malus (accélération, raquette réduite). Clic = roquette, `P` = pause.
- **Snake** — flèches pour démarrer et se déplacer.
- **Space Invaders** — flèches pour bouger, `Espace` pour tirer.
- **Tetris** — flèches, `Haut` = rotation, `Espace` = chute rapide.
- **Asteroids** — `Gauche`/`Droite` = rotation, `Haut` = poussée, `Espace` = tirer.

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
- **Scores** : meilleurs scores persistés par jeu dans `localStorage` (`PLAY_HI_<GAME>`).
- **Pause** : bouton `PAUSE`, touche `P` ou `Échap` dans le hub — physique, timers et effets sont gelés.
- **Rendu** : un seul `<canvas>` plein écran, boucle `requestAnimationFrame`, particules, screen shake, scanlines.

## Licence

[MIT](LICENSE)

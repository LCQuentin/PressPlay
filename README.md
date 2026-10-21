# PressPlay

**Jouer :** https://lcquentin.github.io/PressPlay/

Une petite borne d'arcade rétro dans le navigateur : douze jeux réunis dans un hub, plus deux jeux standalone. HTML / CSS / JavaScript vanilla, **zéro dépendance à l’exécution**, un fichier = un jeu. Installable en PWA, jouable offline.

Esthétique brutaliste : noir profond, vert acide (`#CCFF00`), typo monospace, scanlines.

## Contenu

| Fichier | Jeu | Contrôles |
| --- | --- | --- |
| `index.html` | Landing / choix de la borne, PWA | souris / tactile |
| `hub.html` | Borne arcade (12 jeux) | souris, tactile (d-pad), clavier ou manette, `P` / `PAUSE` |
| `pong.html` | Pong — édition brutaliste | souris / tactile, `P` pour pause |
| `captur.html` | Renault Captur Arcade (course d'évitement) | flèches gauche / droite |

### Jeux du hub

- **Pong** — 1 joueur (IA facile/normale/difficile) ou **2 joueurs local** (`W`/`S` vs flèches), premiers à 5. Souris / tactile en 1 joueur.
- **Breakout** — 5 niveaux à motifs (damier, pyramide, colonnes, diamant) puis **mode sans fin** ; briques dures, bonus (vie, multi-balle, raquette géante, ralenti, roquettes, balle de feu) et malus (accélération, raquette réduite). Clic = roquette.
- **Snake** — niveaux de vitesse, **obstacles à partir du niveau 2** ; flèches ou d-pad.
- **Space Invaders** — 3 vagues, **UFO bonus** et **boss** à la dernière vague ; flèches, `Espace`, d-pad tactile.
- **Tetris** — **pièce suivante, réserve (`C`/`Shift`), ghost piece** et sac de 7 pièces ; niveaux de vitesse ; `Haut` = rotation, `Espace` = chute rapide.
- **Asteroids** — vagues progressives, **UFO**, **bouclier** ramassable ; `Gauche`/`Droite`, `Haut`, `Espace`, d-pad tactile.
- **Neon Maze** — labyrinthe 15×13, 3 fantômes, 4 super-pilules et 3 niveaux ; flèches ou d-pad. Les fantômes chassent, fuient et se laissent manger.
- **Tron** — **2 joueurs local** : `A`/`D` contre `Gauche`/`Droite`, traînées lumineuses, premier à 3 manches. Clavier uniquement.
- **Lunar** — alunissage vectoriel : gravité, rotation, poussée et carburant ; 3 plateformes multiplicatrices, 3 vies, 5 alunissages pour le succès. Flèches + `Espace` (ou bouton tactile).
- **Echo** — Simon 4 pads : séquence lumineuse et sonore, clic/tactile ou touches `1`–`4`, séquence de 10 pour le succès.
- **Defcon** — Missile Command : 3 villes à défendre, missiles entrants, clic/tactile pour intercepter, vagues progressives et 5 vagues pour le succès.
- **Hopper** — Frogger : route, rivière, rondins, 5 maisons, 3 vies et chrono ; flèches ou d-pad. 3 maisons pour le succès.

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
- **Records** : top 5 par jeu avec initiales 3 lettres, stats (parties, victoires Pong) et 14 succès locaux.
- **Défi du jour** : un jeu tournant (hors Tron 2 joueurs), seedé de façon déterministe par la date ; classement local du jour. Aucun serveur.
- **Réglages** : volume, musique, haptics, scanlines/CRT, mouvement réduit, langue FR/EN, taille des contrôles tactiles — persistés dans `PLAY_SETTINGS`.
- **Manette** : d-pad/stick + bouton action ; bouton Start = pause. Vérifiable sur les jeux clavier (et paddle Pong/Breakout).
- **Debug** : ajouter `?debug` à l’URL pour un overlay FPS/état/score.
- **Pause** : bouton `PAUSE`, touche `P` ou `Échap`, auto-pause quand la fenêtre perd le focus — physique, timers et effets sont gelés.
- **Tactile** : d-pad + bouton action affichés sur les jeux qui en ont besoin ; Pong et Breakout se jouent directement au doigt.
- **Audio** : mute persistant (`PLAY_MUTED`), musique procédurale (désactivable), haptics sur mobile.
- **Langue** : interface, messages et HUD en FR/EN (sélection dans les réglages).
- **Rendu** : un seul `<canvas>` plein écran, boucle `requestAnimationFrame`, particules, screen shake, scanlines.

## PWA / déploiement

- Le site est statique : `index.html` (landing), `hub.html`, `pong.html`, `captur.html`.
- `manifest.webmanifest` + `sw.js` : installation en PWA et cache offline. Le `start_url` est `hub.html`.
- Pages GitHub : activer **Settings → Pages → Source: GitHub Actions** ; le workflow `.github/workflows/pages.yml` publie le site à chaque push sur `main`.
- Le workflow `.github/workflows/ci.yml` lance le smoke test et les régressions avec Chromium.

## Test

Smoke test optionnel (dev), avec Chrome installé (ou Chromium Playwright) :

```sh
npm install
npx playwright install chromium
npm test
```

## Licence

[MIT](LICENSE)

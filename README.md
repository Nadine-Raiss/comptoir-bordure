# Comptoir de la Bordure

Boutique de démonstration générée **en direct avec GitHub Copilot**, déployée sur
Azure Static Web Apps.

Support de la session *« Que les agents soient avec vous »* — Nadine Raiss &
Philippe Paiola.

---

## Le principe

Le dépôt contient un **squelette vide** : la page affiche « Ouverture prochaine ».
Le catalogue, l'habillage et l'assistant sont écrits **sur scène**, par Copilot,
à partir de deux fichiers :

| Fichier | Rôle |
|---|---|
| `catalogue.json` | 15 références, 4 rayons, stocks et ruptures |
| `.github/copilot-instructions.md` | Palette, règles de style, accessibilité, interdiction des images externes |

C'est la démonstration : **le prompt fait trois lignes, tout le reste est écrit
une fois dans un fichier versionné.**

---

## Installation sur une machine neuve

### Prérequis

| Outil | Vérification |
|---|---|
| **Node.js 20+** | `node --version` |
| **Azure CLI** | `az --version` |
| **VS Code 1.10+** | Copilot est intégré, rien à installer |
| **Abonnement Copilot** | actif sur le compte connecté à VS Code |

### Mise en place — 3 minutes

```powershell
git clone https://github.com/Nadine-Raiss/comptoir-bordure.git
cd comptoir-bordure
npm install

az login                 # tenant PHILPDEMO
az account set --subscription "The Mordor"

code .
```

### Vérifier que le déploiement passe

```powershell
.\deployer.ps1 -Nom portail-resistance -Rg RG-DEMO-PP
```

Doit finir sur `HTTP 200`. **À faire une fois la veille**, pas le jour même.

---

## Réglages VS Code avant de monter

- Copilot en mode **`Agent`** — `Ask` ne crée aucun fichier
- Modèle **Claude Sonnet 5**, effort de réflexion **`Low`**, contexte **200K**
- Zoom **+2 crans**, thème **clair** pour l'éditeur (le vidéoprojecteur écrase le sombre)
- `Ctrl`+`B` pour masquer l'explorateur — 20 % d'écran gagné

---

## La séquence

### 1. Le prompt *(~2 min)*

```
Crée une boutique web moderne inspirée d'un univers galactique permettant de
parcourir les livres et produits dérivés du catalogue. Ajoute une zone
permettant de converser avec un assistant qui conseille à partir de ce catalogue.

Une seule page, pleine largeur. Fais d'abord ce qui se voit.
```

Puis **`Keep`** pour valider les fichiers.

### 2. La mise en ligne *(~40 s)*

```powershell
.\deployer.ps1 -Nom portail-resistance -Rg RG-DEMO-PP -Ouvrir
```

Le script lit le nom d'hôte depuis Azure : aucune URL en dur.

---

## Filet de sécurité

Si Copilot cale ou produit quelque chose d'inutilisable :

```powershell
git checkout secours
.\deployer.ps1 -Nom portail-resistance -Rg RG-DEMO-PP -Ouvrir
```

La branche **`secours`** contient une version complète déjà générée et testée.
Deux commandes, quarante secondes.

> Si vous l'utilisez sur scène, **dites-le**. La session est vendue comme non
> répétée : « là je bascule sur une version de secours, et voilà pourquoi ».

---

## Recommencer à zéro

```powershell
git checkout main
git reset --hard
git clean -fd src
.\deployer.ps1 -Nom portail-resistance -Rg RG-DEMO-PP
```

Le site réaffiche « Ouverture prochaine ». Répétable autant de fois que voulu.

---

## Structure

```
catalogue.json                    les données — Copilot les lit tout seul
.github/copilot-instructions.md   les règles — lues à chaque demande
src/horizon.ts                    scène de fond SVG (deux soleils, dunes)
src/styles.css                    variables de palette, page d'attente
src/main.ts                       vide — Copilot écrit ici
deployer.ps1                      build + déploiement + vérification
```

**Rien n'est généré à l'avance sur `main`.** `src/horizon.ts` est la seule
illustration fournie : elle est trop longue à dessiner en direct.

---

## Propriété intellectuelle

Univers de space opera **original**. Aucun nom, vaisseau, personnage, emblème
ou réplique d'une œuvre existante. Aucune photo, aucune ressource externe :
toutes les illustrations sont des SVG écrits à la main.

C'est une règle du projet, inscrite dans `copilot-instructions.md`.

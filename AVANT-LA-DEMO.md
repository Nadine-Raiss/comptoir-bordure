# AVANT LA DÉMO

### La liste, dans l'ordre. Rien d'autre à retenir.

---

## LA VEILLE *(15 min, une seule fois)*

Sur **le PC de Philippe**, avec lui :

```powershell
git clone https://github.com/Nadine-Raiss/comptoir-bordure.git
cd comptoir-bordure
npm install

az login          # tenant PHILPDEMO / « The Mordor »
```

Puis le contrôle complet :

```powershell
.\avant-scene.ps1 -Nom portail-resistance -Rg RG-DEMO-PP
```

**Tu dois voir `TOUT EST PRÊT` et 6 lignes vertes.** Si non, tu as toute la
soirée pour corriger — c'est exactement pour ça qu'on le fait la veille.

### À vérifier aussi, dans VS Code *(le sien)*

- [ ] **GitHub Copilot actif**, mode **`Agent`** *(pas `Ask` — `Ask` ne crée aucun fichier)*
- [ ] Modèle **Claude Sonnet 5**, effort **`Low`**, contexte **200K**
- [ ] Zoom **+2 crans**, thème **clair** pour l'éditeur

### Et un mot à Philippe sur son agent

> Expert-Galaxy a `web_search` actif et **aucun grounding sur le lore**.
> Sans le cadrage que j'ai mis côté serveur, « qui sont les Veilleurs ? »
> renvoie un résultat du monde réel. Une fois ta data source attachée,
> **coupe `web_search`**.

---

## LE JOUR J

> 🔍 **Le contexte Azure dérive tout seul.** Ce matin, `az` pointait vers un
> autre abonnement qu'hier — sans que personne n'y touche. Le script le détecte
> et s'arrête, mais tu perds du temps. Le réflexe, avant tout :
>
> ```powershell
> az account show --query name -o tsv     # doit afficher : The Mordor
> ```
>
> Si ce n'est pas le bon :
> ```powershell
> az account set --subscription 564ee3d9-8b49-4ccb-a51c-16b240dfa94f
> ```

### ⏰ T-15 min — le contrôle *(7 minutes, chronométré)*

```powershell
.\avant-scene.ps1 -Nom portail-resistance -Rg RG-DEMO-PP
```

**Sept minutes, dont cinq d'attente imposée** : déposer le jeton redémarre la
fonction serveur, elle met cinq minutes à revenir. Le script patiente tout seul,
tu n'as rien à faire. Puis le Quartier-Maître répond en 95 s.

> ⚠️ **Ne lance pas ce script dans les 10 minutes avant de monter.**
> Il coupe l'API le temps du redémarrage.

### ⏰ T-5 min — vérification sans risque *(2 à 3 minutes)*

```powershell
.\avant-scene.ps1 -Nom portail-resistance -Rg RG-DEMO-PP -SansJeton
```

Celui-là **ne touche à rien**. Il contrôle seulement.

### ⏰ T-2 min — l'écran

- [ ] Un onglet sur **l'URL publique**, affichant « Ouverture prochaine »
- [ ] VS Code ouvert sur le projet, **`Ctrl`+`B`** pour masquer l'explorateur
- [ ] Le chat Copilot ouvert, en mode **`Agent`**
- [ ] Tous les autres onglets **fermés**

---

## SUR SCÈNE

### Le prompt

```
Crée une boutique web moderne inspirée d'un univers galactique permettant de
parcourir les livres et produits dérivés du catalogue. Ajoute une zone
permettant de converser avec un assistant qui conseille à partir de ce catalogue.

Une seule page, pleine largeur. Fais d'abord ce qui se voit.
```

≈ 2 minutes. Puis **`Keep`**.

### La mise en ligne

```powershell
.\deployer.ps1 -Nom portail-resistance -Rg RG-DEMO-PP -Ouvrir
```

≈ 40 secondes.

---

## SI ÇA CASSE

| Ce qui arrive | Ce que tu tapes |
|---|---|
| **Copilot cale ou produit du n'importe quoi** | `git checkout secours` puis `.\deployer.ps1 -Nom portail-resistance -Rg RG-DEMO-PP -Ouvrir` |
| **« Le jeton d'accès à Fabric a expiré »** | `.\avant-scene.ps1 -Nom portail-resistance -Rg RG-DEMO-PP` — mais c'est 8 min, **mieux vaut enchaîner sur Expert Galaxy** |
| **Le Quartier-Maître ne répond pas** | Repose la question. Sinon : *« je vous le montre dans Fabric »* |
| **Expert Galaxy répond à côté** | *« il a cherché sur le web. C'est exactement le problème dont on parle. »* |
| **Le build échoue** | *« le type-check a bloqué la mise en ligne. C'est ce qu'on lui a demandé de faire. »* |

> Si tu bascules sur `secours`, **dis-le**. La session est vendue comme non
> répétée : *« là je triche, et voilà pourquoi »* passe très bien.

---

## LES 3 CHIFFRES

| | |
|---|---|
| **Ventes** | **1 198 unités** |
| **Chiffre d'affaires** | **1 158 070 crédits** |
| **Attente Quartier-Maître** | **60 à 90 secondes** |

**Ne cite jamais une quantité à commander.** Les stocks (1, 2, 3, 5) sont
stables ; les quantités varient d'un appel à l'autre.

---

## CE QUI PEUT ARRIVER, ET POURQUOI C'EST BIEN

L'obstacle le plus intéressant de toute la démo :

> **Le data agent Fabric refuse une clé d'API.** Il exige une identité
> utilisateur déléguée. Pas de principal de service, pas d'identité managée.

C'est ta démonstration de gouvernance, en une phrase :

> « Cet agent ne voit que ce que **j'ai** le droit de voir dans Fabric. Si je
> n'avais pas accès aux données financières du réseau, je n'obtiendrais rien.
> La gouvernance est restée dans la plateforme de données — pas dans l'agent. »

C'est aussi pour ça qu'il y a un jeton à rafraîchir. **Ce n'est pas une
faiblesse du montage : c'est le sujet.**

# Les sabres laser — questions à poser au Quartier-Maître

> Testé en direct sur l'agent Fabric le **23/09**. Les temps et les chiffres
> ci-dessous sont mesurés, pas estimés.

---

## ⚠️ Le piège à connaître avant tout

**La question naturelle échoue.**

```
Combien de sabres laser vendus ?
```

> *« Je n'ai aucune donnée de vente sur les sabres laser dans les tables
> disponibles. »* — **testé deux fois, deux échecs**

L'agent cherche « sabre laser » dans les désignations et ne trouve rien de
fiable. Or les produits existent bel et bien : `CPT-SL-1` et `CPT-SL-3`.

**La parade : donner les références.** Dès qu'elles apparaissent dans la
question, la réponse tombe juste à tous les coups.

---

## ✅ LA question à poser sur scène

```
Combien de sabres laser avons-nous vendus ? Les références sont CPT-SL-1 et CPT-SL-3.
```

**Temps de réponse : ~60 secondes.**

### Ce que l'agent renvoie

| Référence | Désignation | Unités | Chiffre d'affaires | Rang CA |
|---|---|---:|---:|:---:|
| `CPT-SL-1` | Sabre laser d'entraînement SL-1 | **52** | **75 400 cr** | 3ᵉ |
| `CPT-SL-3` | Sabre laser de service SL-3 | **45** | **171 000 cr** | **1ᵉʳ** |
| | **Total** | **97** | **246 400 cr** | |

Puis, **sans qu'on le demande** :

> **Alerte stock** — `CPT-SL-1` : Base Cendre **1** (seuil 8), Relais Tessara **2** (seuil 9).
> `CPT-SL-3` : Base Cendre **3** (seuil 9), Relais Tessara **5** (seuil 12).

### 🎯 La phrase que ça te donne

> « Le sabre de service SL-3 est le **premier produit du comptoir en chiffre
> d'affaires**. Et il en reste **trois** à Base Cendre.
> Je n'ai pas demandé le stock. J'ai demandé les ventes. »

---

## Les trois autres formulations testées

### Variante « totaux secs » — 61 s ✅

```
Pour les références CPT-SL-1 et CPT-SL-3, donne le total des unités vendues
et le chiffre d'affaires, une ligne par référence.
```

Réponse plus courte, tableau à deux lignes. **À utiliser si tu es en retard** :
moins spectaculaire, mais plus rapide à lire à l'écran.

### Variante « détail complet » — 88 s ⚠️

```
Donne le détail des ventes pour les produits dont la référence commence par CPT-SL
```

Marche, mais renvoie **un tableau mois par mois et base par base** —
illisible au vidéoprojecteur. À éviter sur scène.

### Variante naturelle sans référence — ÉCHEC ❌

```
Combien de sabres laser vendus ?
Combien de sabre laser vendus au total ?
```

**Les deux échouent.** L'agent répond qu'il n'a pas de données.
**Ne les utilise pas.**

---

## Si tu veux enchaîner : les questions d'achat

Une fois les ventes affichées, pour faire le pont vers le Stormtrooper :

```
De quoi manque-t-on, et où ?
```

C'est une **requête d'exemple enregistrée** dans l'agent : elle est rapide et
renvoie directement une liste d'achat priorisée, avec quantités et coûts.

---

## Ce que tu peux dire si la recherche par nom échoue devant la salle

C'est arrivé pendant mes tests. Ne t'excuse pas — explique :

> « Regardez ce qui vient de se passer. J'ai demandé "les sabres laser", il ne
> trouve pas. Je lui donne la **référence**, il trouve immédiatement.
>
> C'est exactement le travail réel sur un agent de données : il ne devine pas
> votre vocabulaire métier. Si je veux qu'il comprenne "sabre laser", je dois
> l'écrire quelque part — dans les instructions, ou dans une requête d'exemple.
>
> Ça se corrige en deux lignes. Mais il faut l'avoir vu. »

**C'est un excellent moment pédagogique**, pas un incident.

---

## Les chiffres à avoir sur papier

| | |
|---|---|
| **Total sabres** | **97 unités** · **246 400 crédits** |
| `CPT-SL-1` entraînement | 52 unités · 75 400 cr · **3ᵉ** en CA |
| `CPT-SL-3` service | 45 unités · **171 000 cr** · **1ᵉʳ** en CA |
| Stocks SL-1 | Cendre **1**/8 · Tessara **2**/9 |
| Stocks SL-3 | Cendre **3**/9 · Tessara **5**/12 |
| Temps de réponse | **~60 secondes** |

> **Les quantités à commander varient d'un appel à l'autre** (7 · 23 · 25 · 26
> selon les essais). **Ne les cite jamais de mémoire.** Les stocks (1, 2, 3, 5),
> eux, sont stables.



# Plan : Application Native avec Capacitor

## Objectif

Transformer votre application web HALA MADRID TV en application native Android et iOS en utilisant Capacitor, sans reecrire le code existant.

## Ce que Capacitor fait

Capacitor emballe votre application React existante dans une coquille native. Votre code reste identique, mais l'application peut etre publiee sur le Google Play Store et l'Apple App Store.

## Etapes a realiser dans Lovable

### Etape 1 : Installer les dependances Capacitor

Ajouter les packages suivants au projet :
- `@capacitor/core`
- `@capacitor/cli` (dev)
- `@capacitor/ios`
- `@capacitor/android`

### Etape 2 : Creer le fichier de configuration Capacitor

Creer `capacitor.config.ts` a la racine du projet avec :
- **appId** : `app.lovable.73064fd28b5240c2b76d341c01c8ff9d`
- **appName** : `hala-madrid-tv`
- **webDir** : `dist`
- **server.url** : URL du sandbox pour le hot-reload en developpement

### Etape 3 : Mettre a jour le service worker PWA

Ajouter `/~oauth` a la liste `navigateFallbackDenylist` dans `vite.config.ts` pour eviter les conflits avec l'authentification OAuth.

---

## Etapes a realiser sur votre ordinateur (apres approbation)

Une fois les modifications faites dans Lovable, vous devrez executer ces commandes sur votre machine :

1. **Exporter vers GitHub** via le bouton dans les parametres du projet
2. **Cloner et installer** :
   ```
   git clone <votre-repo>
   cd <votre-repo>
   npm install
   ```
3. **Ajouter les plateformes** :
   ```
   npx cap add android
   npx cap add ios
   ```
4. **Builder et synchroniser** :
   ```
   npm run build
   npx cap sync
   ```
5. **Lancer l'application** :
   - Android : `npx cap run android` (necessite Android Studio)
   - iOS : `npx cap run ios` (necessite un Mac avec Xcode)

---

## Pre-requis sur votre machine

| Plateforme | Outil requis |
|------------|-------------|
| Android | Android Studio installe |
| iOS | Mac avec Xcode installe |

---

## Details techniques

### Fichiers a creer/modifier

| Fichier | Action |
|---------|--------|
| `capacitor.config.ts` | Creer - Configuration Capacitor |
| `vite.config.ts` | Modifier - Ajouter `navigateFallbackDenylist` pour `/~oauth` |
| `package.json` | Modifier - Ajouter les dependances Capacitor |

### Configuration Capacitor

```text
capacitor.config.ts
├── appId: app.lovable.73064fd28b5240c2b76d341c01c8ff9d
├── appName: hala-madrid-tv
├── webDir: dist
└── server
    ├── url: https://73064fd2-8b52-40c2-b76d-341c01c8ff9d.lovableproject.com?forceHideBadge=true
    └── cleartext: true
```

### Ressource utile

Pour plus de details, consultez le guide officiel : https://docs.lovable.dev/tips-tricks/self-hosting


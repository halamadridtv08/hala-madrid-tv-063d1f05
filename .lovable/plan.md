

## Plan : Boutique E-commerce Premium + Fix Build Error

Ce projet est massif. Je propose de le découper en **phases** pour avancer efficacement sans casser le site existant.

---

### Phase 0 — Fix build error (immédiat)

Le fichier `supabase/functions/notify-moderator-action/index.ts` importe `npm:resend@4.0.0` qui n'existe pas. Il faut le changer en `npm:resend@2.0.0` (comme dans `weekly-moderator-report`).

---

### Phase 1 — Base de données + Stripe (cette session)

**Tables Supabase à créer via migration :**

```text
shop_products
├── id, name, slug, description, price, compare_price
├── category, images (jsonb), variants (jsonb)
├── stock, supplier, is_published, is_featured
├── created_at, updated_at

shop_orders
├── id, user_id, status, total_price
├── payment_status, payment_intent_id
├── shipping_address (jsonb), tracking_number
├── created_at, updated_at

shop_order_items
├── id, order_id, product_id
├── variant (jsonb), quantity, unit_price

shop_reviews
├── id, product_id, user_id, rating, comment
├── is_approved, created_at

shop_cart_items
├── id, user_id, product_id, variant (jsonb), quantity

shop_wishlists
├── id, user_id, product_id

shop_discount_codes
├── id, code, type (percentage/fixed), value
├── min_order, max_uses, current_uses
├── is_active, expires_at
```

RLS : lecture publique pour `shop_products` (publiés), user-scoped pour cart/wishlist/orders, admin-only pour gestion.

**Stripe** : Activer l'intégration Stripe pour le checkout (payment intents).

---

### Phase 2 — Pages frontend (après Phase 1)

**Nouvelles pages :**
- `/shop` — Catalogue avec filtres, recherche, catégories
- `/shop/:slug` — Page produit (galerie, variantes, avis, produits similaires)
- `/shop/cart` — Panier avec drawer animé
- `/shop/checkout` — Checkout multi-étapes + Stripe
- `/shop/orders` — Historique commandes (connecté au profil)

**Nouvelles routes dans App.tsx :**
```text
/shop
/shop/:slug
/shop/cart
/shop/checkout
/shop/orders
```

---

### Phase 3 — Admin boutique

**Nouvel onglet admin "Boutique" :**
- CRUD produits (nom, prix, images, variantes, stock)
- Gestion commandes (statut, tracking)
- Codes promo
- Avis clients (modération)

---

### Phase 4 — UX premium et marketing

- Animations Framer Motion (déjà installé) sur les cartes produits
- Cart drawer animé (slide-in)
- Wishlist avec cœur animé
- Section produits dans les articles de match (cross-selling)
- Newsletter boutique

---

### Ce que je fais maintenant (Phase 0 + début Phase 1)

1. **Fix du build error** (resend@4.0.0 -> resend@2.0.0)
2. **Création des tables Supabase** avec RLS
3. **Activation de Stripe**
4. **Page `/shop`** avec catalogue produits et design dark luxury

Les phases suivantes seront itérées dans les prochains messages.

### Section technique

- Préfixe `shop_` sur toutes les tables pour éviter les conflits avec les tables existantes
- La page Kits existante reste intacte ; la boutique est un module séparé
- Framer Motion (déjà installé) sera utilisé pour les animations au lieu de GSAP (non installé)
- Les variantes produit sont stockées en JSONB pour la flexibilité (taille, couleur, etc.)
- Le panier est persisté en base (pas localStorage) pour les utilisateurs connectés


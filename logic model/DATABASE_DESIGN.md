# Návrh databáze - MMA Club Manager

## 1. Konceptuální model (ERD)

### Entity a jejich vztahy

1.  **Users** (Uživatelé)
    *   Reprezentuje všechny osoby v systému (Admin, Trenér, Člen).
    *   *Role:* Rozlišeno atributem `role_id` nebo Enum.

2.  **Memberships** (Tarify)
    *   Typy členství (např. "Měsíční MMA", "10 vstupů", "VIP").
    *   Definuje cenu a podmínky.

3.  **User_Memberships** (Aktivní členství uživatelů)
    *   Vazební tabulka (M:N rozpad), protože uživatel může mít historii členství.
    *   Uchovává platnost (od-do) a zbývající kredity/vstupy.

4.  **Payments** (Platby)
    *   Evidence plateb za členství.
    *   Vazba na Uživatel a Typ členství.

5.  **Training_Types** (Typy tréninků - Číselník)
    *   Např. "BJJ", "Box", "MMA Sparring", "Kondiční".

6.  **Trainings** (Konkrétní tréninky v rozvrhu)
    *   Konkrétní lekce v čase (Datum, Čas).
    *   Vazba na Trenéra (User) a Typ tréninku.
    *   Kapacita.

7.  **Reservations** (Rezervace)
    *   Vazba Uživatel <-> Trénink.
    *   Stav rezervace (Potvrzeno, Zrušeno).

8.  **Attendance** (Docházka)
    *   Reálný záznam o příchodu.
    *   Může být navázáno na Rezervaci.

9.  **Discounts** (Slevové kódy)
    *   Kódy pro slevu na členství.

10. **Gym_Usage_Log** (Log vytíženosti - pro Trigger/Pohled)
    *   Historická tabulka pro sledování, kolik lidí bylo v gymu.

---

## 2. Logický model (Návrh tabulek)

### `roles` (Číselník)
*   `id` (PK)
*   `name` (Admin, Trainer, Member)

### `users`
*   `id` (PK)
*   `email` (Unique)
*   `password_hash`
*   `first_name`
*   `last_name`
*   `role_id` (FK -> roles)
*   `created_at`
*   `profile_image_url`

### `membership_types`
*   `id` (PK)
*   `name` (Start, Pro, Unlimited)
*   `price`
*   `entries_limit` (NULL = unlimited)
*   `duration_days` (30, 90, 365)

### `discounts`
*   `id` (PK)
*   `code` (Unique)
*   `discount_percent`
*   `valid_until`

### `user_memberships` (Historie členství)
*   `id` (PK)
*   `user_id` (FK -> users)
*   `membership_type_id` (FK -> membership_types)
*   `start_date`
*   `end_date`
*   `remaining_entries`
*   `is_active` (Bool)

### `payments`
*   `id` (PK)
*   `user_id` (FK -> users)
*   `amount`
*   `payment_date`
*   `status` (Paid, Pending)
*   `discount_id` (FK -> discounts, NULL)

### `training_types` (Číselník)
*   `id` (PK)
*   `name` (BJJ, Box...)
*   `description`

### `rooms` (Číselník - volitelné)
*   `id` (PK)
*   `name` (Velká tělocvična, Ring)
*   `capacity`

### `trainings`
*   `id` (PK)
*   `trainer_id` (FK -> users)
*   `training_type_id` (FK -> training_types)
*   `room_id` (FK -> rooms)
*   `start_time` (DateTime)
*   `end_time` (DateTime)
*   `current_capacity` (Calculated/Trigger updated?)
*   `max_capacity`

### `reservations`
*   `id` (PK)
*   `user_id` (FK -> users)
*   `training_id` (FK -> trainings)
*   `created_at`
*   `status` (Active, Cancelled)
*   **Kompozitní unikátnost:** (user_id, training_id)

### `attendance`
*   `id` (PK)
*   `user_id` (FK -> users)
*   `training_id` (FK -> trainings, NULL pokud je to volný vstup)
*   `check_in_time`
*   `check_out_time`

---

## 3. Plnění požadavků zadání

*   **10 Tabulek:** Máme jich navrženo 11.
*   **Číselník:** `roles`, `training_types`, `rooms`.
*   **Kompozitní PK:** Zatím navrženo spíše jako Unique Constraint v `reservations`, ale můžeme udělat tabulku `training_tags` s kompozitním PK.
*   **JSON:** Do `users` můžeme přidat sloupec `metadata` (např. váha, výška, velikost rukavic - nestrukturovaná data).

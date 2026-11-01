# Running MediFlow as a Subscription SaaS

## 1. Model
- **Tenant = organization.** A solo clinic is an organization with one clinic; a hospital group is an organization with many clinics/hospitals.
- The **subscription belongs to the organization**, and its limits apply to all its clinics.
- The platform owner (you) is the `super_admin` and manages plans, tenants, support and platform billing.

```text
You (super_admin) ── sells plans ──> Organization (org_admin)
                                       ├── Clinic A (clinic_admin, reception, doctors…)
                                       └── Hospital B
```

## 2. Suggested plans
Stored in `subscription_plans` — `features` and `limits` are jsonb, so plans change without code changes.

| Plan | Target | Monthly | Yearly | Clinics | Doctors | Staff seats | Patients | Storage |
|---|---|---|---|---|---|---|---|---|
| Starter | Single clinic | ₹1,999 | ₹19,990 | 1 | 3 | 5 | 2,000 | 5 GB |
| Growth | Multi-doctor clinic | ₹4,999 | ₹49,990 | 3 | 15 | 25 | 20,000 | 50 GB |
| Hospital | Hospitals | ₹14,999 | ₹1,49,990 | 10 | 75 | 150 | Unlimited | 500 GB |
| Enterprise | Chains | Custom | Custom | Unlimited | Unlimited | Unlimited | Unlimited | Custom |

Example `limits`: `{"clinics":3,"doctors":15,"seats":25,"patients":20000,"storage_gb":50}`
Example `features`: `{"patient_app":true,"lab":true,"inventory":true,"wallet":true,"whatsapp":false,"api":false,"custom_domain":false}`

(Prices are examples — set your own.)

## 3. Subscription lifecycle
`subscriptions.status`: `trialing → active → past_due → canceled / expired`

| Stage | What happens | Tenant status |
|---|---|---|
| Sign up | org + first clinic + 14-day trial created | `trial` |
| Trial ends, paid | `active`, `period_end` = +1 month/year | `active` |
| Payment fails | `past_due`, 7-day grace, banner shown | `active` |
| Grace over | read-only access, no new bookings | `suspended` |
| Canceled | data kept 90 days, then exportable/archived | `archived` |

## 4. Onboarding flow
1. Owner signs up → `org_admin` role with `org_id`.
2. Creates organization and first clinic (name, city, timezone).
3. Picks plan → row in `subscriptions` (trial).
4. Adds master data: branches, departments, services, taxes.
5. Invites staff via `staff_invites` (role + clinic) → they accept and get `user_roles`.
6. Adds doctors + weekly schedules.
7. Patients book via app or reception; billing starts.

## 5. Enforcing limits
Check before create (server function or DB trigger):
```sql
-- example: block a new doctor beyond plan limit
SELECT (p.limits->>'doctors')::int AS max_doctors,
       (SELECT count(*) FROM doctor_clinics dc JOIN clinics c ON c.id = dc.clinic_id
         WHERE c.org_id = s.org_id AND dc.is_active) AS used
FROM subscriptions s JOIN subscription_plans p ON p.id = s.plan_id
WHERE s.org_id = :org_id AND s.status IN ('active','trialing');
```
Feature flags: hide modules in the UI when `features.<key>` is false, and reject the matching server calls.

## 6. Collecting subscription money
- Use Stripe or Paddle (international) or Razorpay (India) recurring billing.
- Gateway webhook → updates `subscriptions.status` and `period_end`; record events in `audit_logs`.
- Admin portal → **Plans**, **Subscriptions**, **Billing** screens manage this.
- Patient payments (invoices/wallet) are separate: they belong to the clinic, not to you.

## 7. Data isolation
Each tenant only sees rows where `clinic_id`/`org_id` match its `user_roles`. See [roles-and-access.md](./roles-and-access.md).

## 8. Platform KPIs to track
MRR/ARR, active tenants, trial→paid conversion, churn, seats used vs. purchased, appointments per clinic, storage used.

## 9. Operations checklist
- Daily backups; point-in-time restore.
- Audit log for every admin action.
- Data export per tenant (CSV) on request/cancellation.
- Health-data compliance (consent, encryption at rest, access logs — HIPAA / India DPDP).
- Support SLAs per plan via `support_tickets.priority`.

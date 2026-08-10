# Exhaustive Sweep — Method & Universe

*Companion to [the main memo](../README.md). Purpose: replace recall with enumeration.*

---

## Method

Parts I–VII of the main memo covered ~30 verticals chosen by recall and by following what other investors were doing. That is a biased sample — it over-weights whatever is currently written about. This sweep replaces it with the actual taxonomy of the US economy (NAICS 6-digit), screens everything cheaply, and spends research only on survivors.

**Three stages:**

1. **Enumerate** — every 6-digit NAICS industry in the ten sectors where fragmented, buyable SMBs actually live.
2. **Screen** — five gates, all must pass. Cheap, judgement-based, recorded with a reason code so eliminations are auditable and reversible.
3. **Deep-dive** — research only survivors that are *new* (not already covered in Parts I–VII).

### The five gates

| Gate | Test |
|---|---|
| **G1 Fragmented** | Thousands of independent operators; no player above ~10% share |
| **G2 Buyable** | Typical operator has $250k–$5M EBITDA and there is a supply of sellers |
| **G3 Durable asset** | Something scarce survives after AI: licensed crews, permits, routes/position, installed base, plant, or proprietary operating data |
| **G4 Intelligence burden** | ≥20% of the cost base is admin/document/phone work AI can absorb |
| **G5 Unclaimed** | No dominant AI roll-up, and PE not so deep that entry multiples are already bid up |

### Elimination codes

`CONSUMER` wrong shape (discretionary/retail) · `SCALE` naturally concentrated · `COMMODITY` pure price competition, no defensible position · `NO-BURDEN` almost no intelligence work to remove · `NO-ASSET` nothing scarce remains after AI (trade, not company) · `CLAIMED` AI roll-up or PE already dominant · `DYING` profit pool collapsing · `CAPITAL` too asset-heavy for this strategy · `PAYER` a government sets the price

### Sectors deliberately excluded, with reasons

| Sector | Why excluded |
|---|---|
| 11 Agriculture, 21 Mining, 22 Utilities | Commodity price exposure or regulated monopoly; not buyable at this scale |
| 31–32 Manufacturing (food, textile, paper, chemical, plastics) | Mostly branded consumer or commodity process manufacturing — `SCALE`/`COMMODITY`. **Note: 326 plastics/rubber contains custom injection moulders that fit the job-shop thesis — flagged for a later pass.** |
| 42 Wholesale trade | Distribution — thin margins, inventory-heavy, low separable intelligence burden |
| 44–45 Retail | `CONSUMER` |
| 51 Information | Not fragmented SMB; software/media economics |
| 71 Arts & recreation, 72 Accommodation & food | `CONSUMER` / `CAPITAL` |
| 92 Public administration | Not acquirable |

These exclusions are judgement calls, recorded so they can be challenged.

---

## The universe — 10 sectors, ~450 industries

Full 6-digit enumeration retrieved for each. Screened in [`01-screen.md`](./01-screen.md).

| Sector | Title | Codes | Why included |
|---|---|---|---|
| **23** | Construction | 31 | Specialty trade contractors: licensed crews, local density, heavy estimating burden |
| **33** | Manufacturing (metal, machinery, electronics, transport equip, furniture, misc) | ~190 | Job shops: plant + certifications are durable, quoting burden is enormous |
| **48–49** | Transportation & Warehousing | ~50 | Position, licences, dispatch burden |
| **52** | Finance & Insurance | 34 | Agencies, claims adjusting, TPAs — licence-gated document work |
| **53** | Real Estate & Rental/Leasing | 24 | Appraisal, property management, equipment fleets |
| **54** | Professional, Scientific & Technical | 49 | The white-collar heartland — highest AI burden, most contested |
| **56** | Administrative, Support, Waste & Remediation | 43 | The richest sector for this thesis: routes, permits, recurring contracts |
| **61** | Educational Services | 17 | Trade schools as a labour-pipeline asset |
| **62** | Health Care & Social Assistance | 39 | Licence-gated, but much of it is payer-priced |
| **81** | Other Services (repair & maintenance, personal) | 43 | Industrial and equipment repair — the most under-examined block found |

**Source for the taxonomy:** NAICS 6-digit listings, [naics.com](https://www.naics.com/six-digit-naics/), cross-checked against [BLS industry groups](https://www.bls.gov/iag/tgs/iag238.htm) and [Census/IBISWorld establishment counts](https://www.ibisworld.com/classifications/naics/238990/all-other-specialty-trade-contractors/).

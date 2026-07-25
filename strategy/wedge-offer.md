# The Wedge: what to build and sell first

Output of a 10-agent research round (106 evidence findings, 47 candidate workflows, 8 angles)
plus an adversarial critique that found 3 fatal and 13 serious flaws. This is the post-critique
version — the survived recommendation, not the first draft.

---

## THE WEDGE: inbound customer PO, not quoting

A customer PO arrives by email or fax. Today someone opens it, eyeballs it against the quote,
retypes it into the ERP, hand-writes a traveler and tags, and hopes they caught the fine print.

Automate that one handoff: capture the PO → check it against the quote of record and the ERP part
master → **read that customer's quality-clause document** to say what this job must produce and
ship → one review screen → human clicks approve → ERP-ready order + printed job requirements sheet.

**Why not quoting** (the louder, more obvious pain): that's where he loses. Paperless Parts has
800+ shops and native connectors to all 13 job-shop ERPs. The inbox-parsing half is already sold as
a **$497 one-time n8n download** (fabquote.jparosystems.com). Use quoting language to open the
door — *"are quotes going out too slow?"* — then sell the order side, which nobody has claimed.

### The five reasons
1. **No incumbent can reach these shops.** Conexiom's own sales-order-automation page lists SAP,
   NetSuite, Oracle, Dynamics, Infor, Epicor P21, Acumatica, Sage, IFS, Syspro — and *not one* of
   E2, JobBOSS², Global Shop, MIE Trak, Made2Manage, ProShop, QuickBooks Desktop. A 60-person shop
   on E2 literally cannot buy the category leader.
2. **It's a control they're already audited on.** ISO 9001 / AS9100 clause 8.2.3 requires documented
   review of order requirements before committing to supply. *(But see the critique — this is a
   closer, not a reason to buy.)*
3. **Zero pricing liability.** The line to the owner: *"I will not tell you what the job costs or how
   long it takes. That's your knowledge and I won't touch it. I'll kill the typing on either side of it."*
   That single disclaimer neutralizes "what does an ex-EY guy know about my machines."
4. **The differentiator is inside it: reading customer quality clauses.** One small prime publishes
   28 numbered clauses over 10 pages, revised annually; the CoC clause alone mandates 12 data
   elements. Nobody is automating clause interpretation. This is what stops him being a $497 template.
5. **It's the buyer's own words.** *"When I do get the PO... its making tags by hand, inputting
   everything into QuickBooks... I feel like I am doing everything 3 times."*

---

## THE CORRECTION THAT MATTERS MOST

The competitive scan checked the two funded outsiders and **missed the incumbent inside the account.**

**ECI — which owns E2, JobBOSS², M1 and Alliance — already ships an "AI BOM Builder"** in JobBOSS²:
*"Generate draft BOMs from PDFs, Excel files, images, and CSVs. Instantly review and edit."* Same
architecture (document in → structured data out → human review), shipped inside the ERP, by the party
that owns the write path, at zero marginal price.

**So the slot is not structurally empty. It's a 12–24 month timing window.**

Plan for the world where ECI ships PO intake. The durable asset is **not extraction** (commoditizing
now) — it's **customer-specific clause interpretation and cross-system reconciliation**, which ECI has
little reason to build. Pre-empt it in the room:

> "ECI will ship something that reads the document. It will not read your customer's clause sheet and
> tell you this job needs a first article."

---

## THE OFFER (post-critique)

| | Price | Notes |
|---|---|---|
| **Front door** | **Free** 48-hour remote back-check on 20 emailed POs | No site visit, no ERP access. Bounded sample, not free consulting. Half a day of his time. |
| **Order Desk Build** | **$18,500 flat** (first 3 clients $12,000 for reference rights, written expiry) | 3 weeks. **40/40/20** — signature / go-live / acceptance. |
| **Order Desk Care** | **$950–1,250/mo**, 12-mo term | Bounded: 4 layout changes/yr, then $600 each. "Exception handling" = system faults, NOT reviewing their queue. |

**Acceptance test** (only 20% of fee rides on it): over **30 days and ≥100 documents** — every PO
acknowledged same business day (fully in his control) + median keying time cut ≥50% vs. the
stopwatched baseline. *Never* promise an accuracy percentage.

**Explicitly out of scope** — put verbatim in the SOW: no pricing/routings/lead times, no CAD or
geometry, no direct ERP writes, no customer portals, no EDI, no AP. **Format cap: 8 PO layouts + 3
clause docs**, extras at $750/$1,500. **Degraded-scan gate:** >30% true faxes/photocopies → re-scope
or decline (old scans score 47.7 on olmOCR-Bench vs 96.1 for clean text).

**The missing safety feature (ship it):** an **"unmapped content" panel** — page-count reconciliation
plus every region of the document *not* mapped to a field, shown for human eyes. Any detected
handwriting forces a full human read. The design covered misreading; it did not cover **silent
omission** — the margin note, the unscanned second page, the term on the reverse. That's the class of
miss that costs real money, and it's the best demo moment in the product.

**Before client one:** LLC, E&O + cyber cover, liability capped at fees paid, SOW clause naming the
*shop's* approver as reviewer of record for 8.2.3. Budget 1–2 weeks per engagement for vendor onboarding.

---

## SEGMENT: commit to one

The clause-reader moat only exists where rich flowdowns exist — that's aerospace/medical. But the
first draft said "avoid defense/ITAR." Contradiction. Resolve it:

> **Target ISO/AS9100-certified shops running COMMERCIAL aerospace and medical programs.**
> Rich clause documents, no ITAR-controlled technical data, and a compliance calendar that creates
> real dates. Everywhere else he's an extraction tool competing with a $497 download.

---

## QUALIFICATION — ask in this order

1. **"Can an order get into your ERP without someone retyping it — import, staging table, or API?
   Who's done it before?"** *(This is question #1, above volume. No import path = the clerk still
   retypes from a prettier screen, the labor case evaporates, and the acceptance test is unpassable.
   Verify with their reseller/MSP before quoting a fixed price.)*
2. **"How many customer POs did you take in last month?"**
3. "Is an ERP change being discussed in the next 18 months?" *(ECI now markets E2 "for existing
   customers" — migration-in-flight freezes every deal it touches.)*
4. "If I gave you a PO number from March, how long to put the matching quote in front of me?"
   *(>2 min → quote comparison is out of scope.)*
5. "What share of your POs arrive as true faxes or photos?"

---

## THE KILL CRITERION — write it down before getting attached

**Nobody has established PO volume at a 20–150 employee job shop.** The labor case rests on
100–200 POs/month and there is no published data. It's the load-bearing assumption.

> **If the median across the first 15 qualification calls is under 60 POs/month**, the labor story is
> dead. The offer re-anchors on caught errors, missed clauses, and the deferred hire — and the price
> comes down to match.

**15 phone calls answer this for free in two weeks. Do not write a second line of code until they do.**

---

## THE NUMBER TO PLAN AGAINST

One build at a time. **50–60% of every week on sales permanently, including during delivery.**
Day-90 target: **$24–30K collected**, 2 builds delivered, 2 named references, ~$2,000/mo recurring,
pipeline intact.

*(The first draft claimed $48–58K — it double-counted an audit credit it also granted, and assumed
seven weeks of zero selling during delivery with no consequence. That's the textbook solo
feast-famine spiral, scheduled.)*

---

## THE OWNER'S OBJECTIONS, IN HIS OWN VOICE

Rehearse answers to these. They're the real call.

- *"You want $3,500 to come watch Linda type for a day. Four guys this year looked at the place for free."*
- *"Who else have you done this for? Nobody? So I'd be the guinea pig."*
- *"You want 90 days of my POs AND my quotes — my pricing, my customers, my margins. My competitor is
  eleven miles down 22 and I'm supposed to email all that to a guy working out of his house?"*
- *"Say it saves Linda an hour and a half a day. I'm not firing Linda. Where's my money?"*
- *"We get maybe thirty, thirty-five orders a month, half off a blanket already in the system. Your
  whole thing is built for somebody getting two hundred. That's a distributor, not me."*
- *"What happens the day it reads a revision wrong and we run four hundred parts to the old print?
  Who eats that? You got insurance? Show me."*
- *"I called ECI and the guy said they're putting AI in JobBOSS. If I wait a year doesn't that just
  come with what I'm already paying for?"*
- *"My gal's been here nineteen years. She knows Kowalski wants the certs faxed before the truck
  leaves. It's in her head. Your computer doesn't know Kowalski."*
- *"I read that ninety-five percent of these AI projects don't do anything. Why are you the five percent?"*

**On "I'm not firing Linda":** never lead with hours saved. Lead with the deferred hire —
*"You said you need another office person and can't justify one. This is about a quarter of that
person for a fifth of the cost, and the next 20% of revenue doesn't come with a new payroll line."*
BLS median for a production/planning clerk: $53,900 (mean $57,610), ~$70K loaded.

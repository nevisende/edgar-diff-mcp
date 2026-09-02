# Scenario answer

- Harness: agy
- Model: gemini-3.8-flash-high
- Date: 2026-09-02T21:39:47Z
- Wall-clock seconds: 75
- Exit code: 0

## Prompt

Diff Exxon's risk factors between its last two 10-Ks.

## Answer

A diff of ExxonMobil's **Item 1A (Risk Factors)** between its last two Form 10-K filings was performed using the `edgar-diff` MCP tools (`resolve_company`, `list_filings`, `diff_all_items`, and `diff_sections`).

---

### Filing Metadata and Section Statistics

* **Company:** ExxonMobil (`EXXON MOBIL CORP`, CIK: `0000034088`)
* **Base (Older) Filing:** Form 10-K for fiscal year ended 2024-12-31, filed 2025-02-19
  * **Accession:** `0000034088-25-000010`
  * **URL:** `https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm`
  * **Item 1A Paragraph Count:** 47
* **Target (Newer) Filing:** Form 10-K for fiscal year ended 2025-12-31, filed 2026-02-18
  * **Accession:** `0000034088-26-000045`
  * **URL:** `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`
  * **Item 1A Paragraph Count:** 51
* **Diff Statistics (`diff_sections`):**
  * **Status:** `ok`
  * **Overall Paragraph Similarity:** 0.798 (79.8%)
  * **Added Paragraphs:** 6 *(all 6 are pagination markers reading `"Financial Table of Contents"` at target paragraphs 5, 16, 28, 33, 42, 49)*
  * **Removed Paragraphs:** 2 *(base paragraphs 29 and 37 were paragraph breaks in the prior filing that were merged into target paragraphs 31 and 40)*
  * **Changed Paragraphs:** 32
  * **Unchanged Paragraphs:** 13

---

### Key Substantive Changes by Theme

#### 1. Energy Transition, Net-Zero Feasibility, and "Lower-Emissions Future"

Exxon modified several risk disclosures to emphasize the risks of net-zero goals being out of reach, altered its stated ambitions, and shifted terminology from *"energy transition"* to *"lower-emissions future"* or *"meeting society's needs for energy and reducing emissions"*.

* **Net-Zero Feasibility and Ambition:**
  * **Base Filing:**
    > *"The Company’s objective to play a leading role in the energy transition, including the Company’s announced ambition ultimately to achieve net zero with respect to Scope 1 and 2 emissions from operations with continued technology development and government policy support where ExxonMobil is the operator, carries risks that the transition, including underlying technologies, government policies, and markets as discussed in more detail below, will not be available or develop at the pace or in the manner expected by current net-zero scenarios. The success of our strategy for the energy transition will also depend on our ability to recognize key signposts of changes in the global energy system on a timely basis..."*
    > (Accession: `0000034088-25-000010`, Item: `1A`, Paragraph: 27, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm`)
  * **Target Filing:**
    > *"The Company seeks opportunities to play a leading role in the energy transition, including the Company’s announced ambition ultimately to achieve net zero with respect to Scope 1 and 2 emissions from our operated assets with continued technology development and government policy support, which carries risks that the transition, including underlying technologies, government policies, and markets as discussed in more detail below, will not be available or develop at the pace or in the manner expected by current net-zero scenarios. Without supportive policies and the innovations they drive, net zero will remain out of reach – for society and for ExxonMobil. Society’s progress continues to lag in these areas. The success of our strategy in a lower-emissions future will also depend on our ability to recognize key signposts of changes in the global energy system on a timely basis..."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 30, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

* **Heading Change:**
  * **Base Filing:** `"Climate Change and the Energy Transition"` (Accession: `0000034088-25-000010`, Item: `1A`, Paragraph: 26, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm`)
  * **Target Filing:** `"Climate Change and Energy Transition"` (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 29, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

* **Framing of Energy Solutions:**
  * **Base Filing:**
    > *"Achieving societal ambitions to reduce greenhouse gas emissions and ultimately achieve net zero will require new technologies and added infrastructure to reduce the cost and increase the scalability of alternative energy sources, as well as technologies such as carbon capture and storage (CCS)... and succeed through the energy transition will depend in part on the success of these research and collaboration efforts..."*
    > (Accession: `0000034088-25-000010`, Item: `1A`, Paragraph: 30, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm`)
  * **Target Filing:**
    > *"Achieving societal ambitions to reduce greenhouse gas emissions and ultimately achieve net zero will require new technologies and added infrastructure to reduce the cost and increase the scalability of solutions to reduce emissions, as well as technologies such as carbon capture and storage (CCS)... and succeed in a lower-emissions future will depend in part on the success of these research and collaboration efforts..."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 32, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

* **Policy and Market Development:**
  * **Base Filing:**
    > *"The scale of the world’s energy system means that, in addition to developments in technology as discussed above, any successful energy transition will require appropriate support from governments and private participants throughout the global economy."*
    > (Accession: `0000034088-25-000010`, Item: `1A`, Paragraph: 31, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm`)
  * **Target Filing:**
    > *"The scale of the world’s energy system means that, in addition to developments in technology as discussed above, meeting society's needs for energy and reducing emissions will require appropriate support from governments and private participants throughout the global economy."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 34, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

* **Reputation and Investor Pressures:**
  * **Target Filing added:**
    > *"divergent and evolving societal views and investor pressures regarding a future energy transition; and"*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 48, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

---

#### 2. Artificial Intelligence (AI) and Data Centers

Exxon added explicit references to artificial intelligence and data centers across multiple risk sections:

* **Energy Demand from AI Data Centers:**
  * **Target Filing added:**
    > *"government actions to increase strategic reserves to enhance energy security; increased demand for artificial intelligence (AI), including the construction and expansion of AI data centers; changes in customer or consumer preferences..."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 4, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

* **Low-Carbon Data Centers Business Opportunities:**
  * Added `"low-carbon data centers,"` into listings of emerging/lower-emission opportunities:
    * Paragraph 2: > *"Our pursuit of lower-emission and other new business opportunities, including carbon capture and storage, hydrogen and ammonia, lower-emission fuels, ProxximaTM resin systems, carbon materials, low-carbon data centers, and lithium..."* (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 2, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)
    * Paragraph 17: > *"...laws and regulations affecting trading, carbon capture and storage, hydrogen and ammonia, lower-emission fuels, ProxximaTM resin systems, carbon materials, low-carbon data centers, or lithium;"* (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 17, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)
    * Paragraph 32: > *"...including CCS, hydrogen and ammonia, lower-emission fuels, ProxximaTM resin systems, advanced energy-saving materials, low-carbon data centers, lithium, and other technologies."* (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 32, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

* **Internal Adoption of AI in Operations & Decision-Making:**
  * **Base Filing:**
    > *"...including successfully applying advances in the ability to process very large amounts of data to our businesses."*
    > (Accession: `0000034088-25-000010`, Item: `1A`, Paragraph: 39, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm`)
  * **Target Filing:**
    > *"...such as AI, including successfully applying advances in the ability to process and integrate large amounts of data to our businesses and decision-making processes."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 41, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

* **Competitor Use of AI:**
  * **Target Filing added:**
    > *"Technology and expertise provided by industry service companies or AI may also enhance the competitiveness of firms that may not have the internal resources and capabilities of ExxonMobil..."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 47, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

---

#### 3. Opposition Groups, Litigation Risk, and Regulatory Mandates

Exxon added extensive disclosures concerning opposition groups influencing regulatory bodies, class action lawsuits, extraterritorial rules, and compelled disclosures.

* **Opposition Groups and Access Limitations:**
  * **Target Filing added:**
    > *"A number of countries limit access to their oil and gas resources, including by restricting leasing, licensing, or permitting activities directly or indirectly through the influence on these processes by well-funded local or international groups opposing the development of these resources. They also may place resources off-limits from development altogether. Restrictions on production of oil and gas could increase to the extent governments view such measures as a viable approach for pursuing national and global energy, security, and climate policies."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 10, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)
  * **Target Filing added:**
    > *"...may be unable to maintain clear regulatory frameworks in the face of pressure on their systems from well-funded local or international groups opposing development of their resources..."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 12, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

* **Concerted Litigation and Extraterritorial Laws:**
  * **Target Filing added:**
    > *"...we remain exposed to changes in law or interpretation or enforcement of settled law, including changes that result from concerted efforts to increase our legal exposure by groups opposed to the products we provide or international treaties and accords or changes by local jurisdictions encroaching on national regulatory frameworks or global issues or changes resulting from imposition of extraterritorial laws and regulations, and changes in government policy or priorities that could adversely affect our results..."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 13, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

* **Class Actions and Non-Economic Damage Awards:**
  * **Base Filing:**
    > *"We also may be adversely affected by the outcome of litigation or arbitration, especially in countries such as the United States in which very large and unpredictable punitive damage awards may occur; by government enforcement proceedings alleging non-compliance with applicable laws or regulations; or by state and local government actors as well as private plaintiffs acting in parallel that attempt to use the legal system to promote public policy agendas... The continued adoption of similar legal practices in the European Union or elsewhere would broaden this risk and has begun to be applied to some of our competitors in the European Union."*
    > (Accession: `0000034088-25-000010`, Item: `1A`, Paragraph: 24, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm`)
  * **Target Filing:**
    > *"We also may be adversely affected by the outcome of litigation, including class actions or arbitrations, especially in countries such as the United States that permit large and unpredictable punitive and non-economic damage awards. Other jurisdictions adopting similar models to impose liability schemes on our products or operations may present similar risks. We also may be adversely affected by government investigations or enforcement proceedings alleging non-compliance with applicable laws or regulations, or by state and local government actors as well as private plaintiffs acting in parallel that attempt to use the legal system to promote public policy agendas... The continued adoption of similar legal practices in the European Union or elsewhere would broaden this risk."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 26, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

* **Compelled Statements, Penalties, and Production Plan Changes:**
  * **Target Filing added:**
    > *"...require us to make statements we disagree with, or require us to disclose competitively sensitive commercial information or to violate the non-disclosure laws of other countries; and"*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 23, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)
  * **Target Filing added:**
    > *"•government actions to cancel contracts, redenominate the official currency, renounce or default on obligations, impose unwarranted penalties, renegotiate terms unilaterally, expropriate assets, or compel a change in production plans."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 24, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)
  * **Target Filing added:**
    > *"...mandates for disclosure of plans to reduce emissions or reduce the use or production of certain products, mandates for use of specific fuels or technologies... Political actors, non-governmental organizations, and their agents also increasingly seek to collectively advance climate change objectives indirectly..."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 31, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

---

#### 4. Geopolitical Volatility, Supply Influxes, and Alliances

Exxon introduced new risk language regarding potential supply increases from sanctioned/unlocked reserves and shifting geopolitical alliances:

* **Emerging Factors Expanding Global Supply & Opening Sanctioned Resources:**
  * **Target Filing added:**
    > *"There also may be new or emerging factors that could increase global oil, gas, and petrochemical supply levels in the short or long term, such as government policies and actions intended to boost or expand development of domestic or foreign oil and gas reserves or accelerate the pace of production reaching markets, including access to previously unavailable, sanctioned, or protected oil and gas resources or the availability or opening of new shipping routes. Dynamic and unpredictable world events may lead to new oil and gas opportunities becoming available or current opportunities becoming less available or unavailable, and such events may adversely affect our business and results."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 6, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

* **Geopolitical Realignment and Trade Alliances:**
  * **Base Filing:**
    > *"...disruptions in trade alliances or military alliances, or a broader breakdown in global trade, security or public health issues and responses, can also impact the demand for energy and petrochemicals."*
    > (Accession: `0000034088-25-000010`, Item: `1A`, Paragraph: 3, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm`)
  * **Target Filing:**
    > *"...changes in population growth rates or living standards, periods of civil unrest or armed hostilities, escalating geopolitical volatility, government regulation or austerity programs, national or regional trade tariffs, trade sanctions or trade controls, international monetary and currency exchange rate fluctuations, decoupling of economies, disruption, realignment, or breaking of current or historical trade or military alliances or global trade or supply chain networks, changes in international trade patterns or shipping routes, or a broader breakdown in global trade, security or public health, can also impact the supply and demand for energy and petrochemicals. Sovereign debt downgrades, defaults, extended government shutdowns, inability to access debt markets due to rating, banking, or legal constraints, liquidity crises, market bubbles and corrections, the breakup or restructuring of fiscal, monetary, or political systems..."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 3, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

* **Security Concerns & Military Conflicts:**
  * **Target Filing added:**
    > *"Successful operation of particular facilities or projects may be disrupted by civil unrest, military conflict, acts of sabotage, piracy, terrorism, cybersecurity attacks, the application of national security laws or policies that result in restricting our ability to do business in a particular jurisdiction or region, strikes or protests, and other local, national, regional, or global security concerns."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 27, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

---

#### 5. Operations, New Products, and Acquisition Integration

* **Pioneer Acquisition Reference Removed:**
  * **Base Filing:**
    > *"...improve production yields on an ongoing basis and successfully integrate and achieve the anticipated synergies of acquisitions, including the acquisition of Pioneer. This requires continuous management focus..."*
    > (Accession: `0000034088-25-000010`, Item: `1A`, Paragraph: 38, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm`)
  * **Target Filing:**
    > *"...improve production yields on an ongoing basis, and successfully integrate and achieve the anticipated synergies of acquisitions. This requires continuous management focus..."*
    > (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 40, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`)

* **Product Expansions (Ammonia & Proxxima™ Resin):**
  * Consistently modified *"hydrogen"* to *"hydrogen and ammonia"* and *"ProxximaTM systems"* to *"ProxximaTM resin systems"* (Accession: `0000034088-26-000045`, Item: `1A`, Paragraphs 2, 17, 32, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`).

* **Capital Terminology:**
  * Changed *"capital allocation into existing and new businesses"* (Accession: `0000034088-25-000010`, Item: `1A`, Paragraph: 33, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm`) to *"investment into existing and new businesses"* (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 36, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`).

* **Risk Management Heading:**
  * Changed from `"Safety, business controls, and environmental risk management."` (Accession: `0000034088-25-000010`, Item: `1A`, Paragraph: 40, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm`) to `"Safety, business controls, and risk management."` (Accession: `0000034088-26-000045`, Item: `1A`, Paragraph: 43, URL: `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`).


# Scenario answer

- Harness: agy
- Model: gemini-3.8-flash-high
- Date: 2026-09-02T22:05:33Z
- Wall-clock seconds: 118
- Exit code: 0

## Prompt

Diff Exxon's risk factors between its last two 10-Ks.

## Answer

### Filings Compared

* **Base filing (FY2024 10-K):**
  * **Accession:** `0000034088-25-000010`
  * **Filing Date:** `2025-02-19`
  * **Report Date:** `2024-12-31`
  * **URL:** `https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm`
* **Target filing (FY2025 10-K):**
  * **Accession:** `0000034088-26-000045`
  * **Filing Date:** `2026-02-18`
  * **Report Date:** `2025-12-31`
  * **URL:** `https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm`

*(Note on company resolution: `resolve_company` for ticker `XOM` initially yielded CIK `0002115436` [ExxonMobil Holdings Corp], but `list_filings` returned empty results `[]` for form `10-K`. Searching by CIK `0000034088` resolved `EXXON MOBIL CORP`, which contains the full filing history).*

---

### Item 1A (Risk Factors) Change Statistics

* **Base paragraphs:** 47
* **Target paragraphs:** 45
* **Added paragraphs:** 0
* **Removed paragraphs:** 2 *(base paragraphs 29 and 37 were paragraph fragmentation artifacts in the FY2024 filing that were reunited with paragraphs 28 and 36 in the FY2025 filing)*
* **Changed paragraphs:** 32
* **Unchanged paragraphs:** 13
* **Item similarity:** 0.866

---

### 1. Structural / Reconciled Paragraphs

#### Base Paragraph 29
* **Base Text:**
> "may also increase our compliance costs, such as for monitoring or sequestering emissions and complying with increased or mandatory disclosure or due diligence requirements and government mandated energy transition plans."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `29`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
* Re-integrated into Target Paragraph 28:
> "Current, pending, and potential greenhouse gas regulations or policies may also increase our compliance costs, such as for monitoring or sequestering emissions and complying with increased or mandatory disclosure or due diligence requirements and government-mandated energy transition plans."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `28`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

#### Base Paragraphs 37 & 38 (Operational Efficiency & Pioneer)
* **Base Text (Paragraph 37):**
> "Operational efficiency. An important component of ExxonMobil’s competitive performance, especially given the commodity-based nature of many of our businesses, is our ability to operate efficiently, including our ability to manage expenses, improve production"
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `37`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
* **Base Text (Paragraph 38):**
> "yields on an ongoing basis and successfully integrate and achieve the anticipated synergies of acquisitions, including the acquisition of Pioneer. This requires continuous management focus, including technology integration and improvements, cost control, productivity enhancements, harmonizing functions, policies, procedures and processes, regular reappraisal of our asset portfolio, and the recruitment, development, and retention of high caliber employees."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `38`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
* **Target Text (Paragraph 36):**
> "Operational efficiency. An important component of ExxonMobil’s competitive performance, especially given the commodity-based nature of many of our businesses, is our ability to operate efficiently, including our ability to manage expenses, improve production yields on an ongoing basis, and successfully integrate and achieve the anticipated synergies of acquisitions. This requires continuous management focus, including technology integration and improvements, cost control, productivity enhancements, harmonizing functions, policies, procedures and processes, regular reappraisal of our asset portfolio, and the recruitment, development, and retention of high caliber employees."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `36`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

---

### 2. Key Substantive Changes

#### A. Artificial Intelligence (AI) and Data Centers

* **Demand growth from AI & data centers:**
  * **Base Text:**
> "Other demand-related factors. Other factors that may affect the demand for oil, gas, petrochemicals or our other products, and therefore impact our results, include technological improvements in energy efficiency; seasonal weather patterns; increased competitiveness of, or government policy support for, alternative energy sources or potential substitutes for our products; changes in technology that alter fuel choices, such as technological advances in energy storage or other critical areas that make wind, solar, nuclear or other alternatives more competitive for power generation; changes in consumer preferences for our products, including consumer demand for alternative-fueled or electric transportation or alternatives to plastic products; and broad-based changes in personal income levels. See also “Climate Change and the Energy Transition” below."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `4`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "Other demand-related factors. Other factors that may affect the demand for oil, gas, petrochemicals or our other products, and therefore our results, include technological improvements in energy efficiency; seasonal weather patterns; increased competitiveness of, or government policy support for, alternative energy sources or potential substitutes for our products; changes in technology that alter fuel choices, such as technological advances in energy storage or other critical areas that make wind, solar, nuclear, or other alternatives more competitive for power generation; government actions to increase strategic reserves to enhance energy security; increased demand for artificial intelligence (AI), including the construction and expansion of AI data centers; changes in customer or consumer preferences for our products, including consumer demand for alternative-fueled or electric transportation or alternatives to plastic products; and broad-based changes in personal income levels. See also “Climate Change and Energy Transition” below."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `4`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

* **Addition of low-carbon data centers to business opportunities:**
  * **Base Text:**
> "Our pursuit of lower-emission and other new business opportunities, including carbon capture and storage, hydrogen, lower-emission fuels, ProxximaTM systems, carbon materials, and lithium also depends on the growth and development of markets for those products and services, including implementation of supportive and stable government policies and developments in technology to enable those products and services to be provided on a cost-effective basis at commercial scale. See “Climate Change and the Energy Transition” in this Item 1A."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `2`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "Our pursuit of lower-emission and other new business opportunities, including carbon capture and storage, hydrogen and ammonia, lower-emission fuels, ProxximaTM resin systems, carbon materials, low-carbon data centers, and lithium also depends on the growth and development of markets for those products and services, including implementation of supportive and stable government policies and developments in existing and new technology to enable those products and services to be provided on a cost-effective basis at commercial scale. See “Climate Change and Energy Transition” in this Item 1A."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `2`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

* **AI in R&D and decision-making:**
  * **Base Text:**
> "To remain competitive, we must also continuously adapt and capture the benefits of new and emerging technologies, including successfully applying advances in the ability to process very large amounts of data to our businesses."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `39`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "To remain competitive, we must also continuously adapt and capture the benefits of new and emerging technologies, such as AI, including successfully applying advances in the ability to process and integrate large amounts of data to our businesses and decision-making processes."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `37`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

* **AI enhancing competitors:**
  * **Base Text:**
> "Technology and expertise provided by industry service companies may also enhance the competitiveness of firms that may not have the internal resources and capabilities of ExxonMobil or reduce the need for resource-owning countries to partner with private-sector oil and gas companies in order to monetize national resources."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `44`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "Technology and expertise provided by industry service companies or AI may also enhance the competitiveness of firms that may not have the internal resources and capabilities of ExxonMobil or reduce the need for resource-owning countries to partner with private-sector oil and gas companies in order to monetize national resources."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `42`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

---

#### B. Geopolitical Conflicts, Sanctions, Supply Dynamics, and Shipping Routes

* **Emerging global supply factors & access to sanctioned/protected resources:**
  * **Target Text:**
> "There also may be new or emerging factors that could increase global oil, gas, and petrochemical supply levels in the short or long term, such as government policies and actions intended to boost or expand development of domestic or foreign oil and gas reserves or accelerate the pace of production reaching markets, including access to previously unavailable, sanctioned, or protected oil and gas resources or the availability or opening of new shipping routes. Dynamic and unpredictable world events may lead to new oil and gas opportunities becoming available or current opportunities becoming less available or unavailable, and such events may adversely affect our business and results."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `5`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

* **Armed hostilities, alliance disruption, and shipping routes in economic conditions:**
  * **Base Text:**
> "Other factors that affect general economic conditions in the world or in a major region, such as changes in population growth rates, periods of civil unrest, government regulation or austerity programs, national or regional trade tariffs, trade sanctions or trade controls, international monetary and currency exchange rate fluctuations, decoupling of economies, disruptions in trade alliances or military alliances, or a broader breakdown in global trade, security or public health issues and responses, can also impact the demand for energy and petrochemicals."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `3`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "Other factors that affect general economic conditions in the world or in a major region, such as changes in population growth rates or living standards, periods of civil unrest or armed hostilities, escalating geopolitical volatility, government regulation or austerity programs, national or regional trade tariffs, trade sanctions or trade controls, international monetary and currency exchange rate fluctuations, decoupling of economies, disruption, realignment, or breaking of current or historical trade or military alliances or global trade or supply chain networks, changes in international trade patterns or shipping routes, or a broader breakdown in global trade, security or public health, can also impact the supply and demand for energy and petrochemicals."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `3`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

* **Military conflict & global security concerns:**
  * **Base Text:**
> "Security concerns. Successful operation of particular facilities or projects may be disrupted by civil unrest, acts of sabotage, piracy, or terrorism, cybersecurity attacks, the application of national security laws or policies that result in restricting our ability to do business in a particular jurisdiction, strikes or protests, and other local security concerns."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `25`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "Security concerns. Successful operation of particular facilities or projects may be disrupted by civil unrest, military conflict, acts of sabotage, piracy, terrorism, cybersecurity attacks, the application of national security laws or policies that result in restricting our ability to do business in a particular jurisdiction or region, strikes or protests, and other local, national, regional, or global security concerns."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `25`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

---

#### C. Activism, Opposition Groups, and Litigation Risks

* **Influence of opposing groups on leasing and licensing:**
  * **Base Text:**
> "Access limitations. A number of countries limit access to their oil and gas resources, including by restricting leasing or permitting activities, or may place resources off-limits from development altogether."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `9`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "Access limitations. A number of countries limit access to their oil and gas resources, including by restricting leasing, licensing, or permitting activities directly or indirectly through the influence on these processes by well-funded local or international groups opposing the development of these resources. They also may place resources off-limits from development altogether."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `9`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

* **Pressure from opposing groups on legal systems:**
  * **Base Text:**
> "Lack of legal certainty. Some countries in which we do business lack well-developed legal systems, lack political or governmental stability, have not yet adopted or may be unable to maintain clear regulatory frameworks, or may have evolving and unharmonized standards that vary or conflict across jurisdictions."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `11`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "Lack of legal certainty. Some countries in which we do, or seek to do, business lack well-developed legal systems, lack political or governmental stability, may be subject to regime changes, have not yet adopted clear legal frameworks, may be unable to maintain clear regulatory frameworks in the face of pressure on their systems from well-funded local or international groups opposing development of their resources, or may have evolving and unharmonized standards that vary or conflict across jurisdictions."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `11`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

* **Concerted efforts to increase legal exposure & extraterritorial regulations:**
  * **Base Text:**
> "Regulatory and litigation risks. Even in countries with well-developed legal systems where ExxonMobil does business, we remain exposed to changes in law or interpretation of settled law, including changes that result from international treaties and accords or changes by local jurisdictions encroaching on national regulatory frameworks or global issues, and changes in policy that could adversely affect our results, such as:"
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `12`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "Regulatory and litigation risks. Even in countries with well-developed legal systems where ExxonMobil does business, we remain exposed to changes in law or interpretation or enforcement of settled law, including changes that result from concerted efforts to increase our legal exposure by groups opposed to the products we provide or international treaties and accords or changes by local jurisdictions encroaching on national regulatory frameworks or global issues or changes resulting from imposition of extraterritorial laws and regulations, and changes in government policy or priorities that could adversely affect our results, such as:"
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `12`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

* **Expanded litigation risk (class actions, arbitrations, and non-economic damage awards):**
  * **Base Text:**
> "We also may be adversely affected by the outcome of litigation or arbitration, especially in countries such as the United States in which very large and unpredictable punitive damage awards may occur; by government enforcement proceedings alleging non-compliance with applicable laws or regulations; or by state and local government actors as well as private plaintiffs acting in parallel that attempt to use the legal system to promote public policy agendas (including seeking to reduce the production and sale of hydrocarbon products through litigation targeting the Company or other industry participants), gain political notoriety, or obtain monetary awards from the Company. The continued adoption of similar legal practices in the European Union or elsewhere would broaden this risk and has begun to be applied to some of our competitors in the European Union."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `24`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "We also may be adversely affected by the outcome of litigation, including class actions or arbitrations, especially in countries such as the United States that permit large and unpredictable punitive and non-economic damage awards. Other jurisdictions adopting similar models to impose liability schemes on our products or operations may present similar risks. We also may be adversely affected by government investigations or enforcement proceedings alleging non-compliance with applicable laws or regulations, or by state and local government actors as well as private plaintiffs acting in parallel that attempt to use the legal system to promote public policy agendas (including seeking to reduce the production and sale of hydrocarbon products through litigation targeting the Company or other industry participants), gain political notoriety, or obtain monetary awards from the Company. The continued adoption of similar legal practices in the European Union or elsewhere would broaden this risk."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `24`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

* **Mandates requiring statements the company disagrees with:**
  * **Target Text:**
> "•adoption of disclosure regulations that could create competitive disadvantages, require us to incur disproportionate costs, increase legal risk due to a need to rely on uncertain estimates or extrapolations (such as emissions of third parties) and lack of uniform standards across jurisdictions, require us to make statements we disagree with, or require us to disclose competitively sensitive commercial information or to violate the non-disclosure laws of other countries; and"
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `21`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

* **Government penalties and compelled production changes:**
  * **Base Text:**
> "•government actions to cancel contracts, redenominate the official currency, renounce or default on obligations, renegotiate terms unilaterally, or expropriate assets."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `22`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "•government actions to cancel contracts, redenominate the official currency, renounce or default on obligations, impose unwarranted penalties, renegotiate terms unilaterally, expropriate assets, or compel a change in production plans."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `22`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

* **Advertising and insurance regulations:**
  * **Target Text:**
> "•changes in environmental, advertising, insurance or other regulations or laws that penalize us for past or current production of legal and/or permitted products and operations, increase our cost of operation or compliance or reduce or delay available business opportunities, including changes in laws or regulations affecting offshore drilling operations, standards to complete decommissioning, standards for water use or availability, production of our products, emissions, hydraulic fracturing, or production or use of new or recycled plastics, as well as laws and regulations affecting trading, carbon capture and storage, hydrogen and ammonia, lower-emission fuels, ProxximaTM resin systems, carbon materials, low-carbon data centers, or lithium;"
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `15`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

---

#### D. Energy Transition & Net-Zero Realism

* **Net-zero out of reach & lagging societal progress:**
  * **Base Text:**
> "The Company’s objective is to play a leading role in the energy transition, including the Company’s announced ambition ultimately to achieve net zero with respect to Scope 1 and 2 emissions from operations where ExxonMobil is the operator with continued technology development and government policy support, but that transition, including underlying technologies, government policies, and markets as discussed in more detail below, may not develop at the pace or in the manner expected by current net-zero scenarios. The success of our strategy for the energy transition will also depend on our ability to recognize key signposts of changes in the global energy system on a timely basis, and our corresponding ability to direct investment to the technologies and businesses, at the appropriate stage of development, to best capitalize on our competitive strengths."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `27`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "The Company seeks opportunities to play a leading role in the energy transition, including the Company’s announced ambition ultimately to achieve net zero with respect to Scope 1 and 2 emissions from our operated assets with continued technology development and government policy support, which carries risks that the transition, including underlying technologies, government policies, and markets as discussed in more detail below, will not be available or develop at the pace or in the manner expected by current net-zero scenarios. Without supportive policies and the innovations they drive, net zero will remain out of reach – for society and for ExxonMobil. Society’s progress continues to lag in these areas. The success of our strategy in a lower-emissions future will also depend on our ability to recognize key signposts of changes in the global energy system on a timely basis, and our corresponding ability to direct investment to the technologies and businesses, at the appropriate stage of development, to best capitalize on our competitive strengths."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `27`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

* **Reframing from "alternative energy sources" to "solutions to reduce emissions":**
  * **Base Text:**
> "Achieving societal ambitions to reduce greenhouse gas emissions and ultimately achieve net zero will require new technologies and added infrastructure to reduce the cost and increase the scalability of alternative energy sources, as well as technologies such as carbon capture and storage (CCS)."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `30`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "Achieving societal ambitions to reduce greenhouse gas emissions and ultimately achieve net zero will require new technologies and added infrastructure to reduce the cost and increase the scalability of solutions to reduce emissions, as well as technologies such as carbon capture and storage (CCS)."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `29`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*

* **Divergent societal views and investor pressures:**
  * **Base Text:**
> "a perception by investors or others that the Corporation is making insufficient progress with respect to our ambition to play a leading role in the energy transition, or that pursuit of this ambition may result in allocation of capital to investments with reduced returns; and other adverse events such as those described in this Item 1A."
*(accession: `0000034088-25-000010`, item: `1A`, paragraph: `45`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm)*
  * **Target Text:**
> "a perception by investors or others that the Corporation is making insufficient progress with respect to our ambition to play a leading role in the energy transition, or that pursuit of this ambition may result in allocation of capital to investments with reduced returns; divergent and evolving societal views and investor pressures regarding a future energy transition; and other adverse events such as those described in this Item 1A."
*(accession: `0000034088-26-000045`, item: `1A`, paragraph: `43`, url: https://www.sec.gov/Archives/edgar/data/34088/000003408826000045/xom-20251231.htm)*


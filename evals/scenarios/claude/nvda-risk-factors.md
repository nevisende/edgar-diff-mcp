# Scenario answer

- Harness: claude
- Model: sonnet
- Date: 2026-09-02T21:34:43Z
- Wall-clock seconds: 103
- Exit code: 0

## Prompt

What new risk factors did NVIDIA add in its latest 10-K compared with the prior one? Quote the added paragraphs verbatim with citations.

## Answer

Comparing NVIDIA's two most recent 10-Ks — base: accession 0001045810-25-000023 (filed 2025-02-26, FY2025) vs. target: accession 0001045810-26-000021 (filed 2026-02-25, FY2026), Item 1A (Risk Factors) — the diff tool reports 36 added paragraphs, 23 removed, 52 changed out of 235 total paragraphs (similarity 0.81). Several "added" entries are just paragraph-reflow artifacts from re-wrapping existing sentences (e.g. paragraph 71, 77, 114, 212 largely duplicate adjacent unchanged/changed text). The paragraphs below are the ones that introduce genuinely new risk content, quoted verbatim from the tool's output.

**1. New counterparty-risk bullet (supply/commercial arrangements)**
> "•Commercial arrangements expose us to counterparty risks, which may negatively impact our business, financial condition, or results of operations."
Citation: accession 0001045810-26-000021, Item 1A, paragraph 17 — https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm

**2. New Groq IP license risk**
> "We have entered into an intellectual property license arrangement with Groq, Inc., or Groq, that required significant, nonrefundable payments. Successfully incorporating the licensed technology into our architectures and product roadmaps requires significant engineering effort and may not occur on expected timelines or at all. The licensed technology may not achieve the desired results as designed or achieve customer or ecosystem adoption. The economic outcomes of this arrangement depend on our ability to translate the licensed technology into commercially viable products and services over time, and we may be unable to recover the associated costs or realize an adequate return on this spend. If our efforts to use the licensed technology are delayed or unsuccessful, our business, operating results, and financial condition could be negatively impacted."
Citation: accession 0001045810-26-000021, Item 1A, paragraph 44 — same URL as above

**3. New risk: customers'/partners' capital, energy and datacenter buildout capacity**
> "•our customers' and partners' ability to secure capital and energy and to build complex datacenter infrastructure timely; and"
Citation: paragraph 70

> "The availability of data centers, energy, and capital to support the buildout of NVIDIA AI infrastructure by our customers and partners is crucial, and any shortage of these and other necessary resources could impact our future revenue and financial performance. Expanding energy capacity to meet demand is a complex, multi-year process involving significant regulatory, technical, and construction challenges. In addition, access to capital can be particularly constrained for less-capitalized companies, which may face difficulties securing financing for large-scale infrastructure projects. These limitations could delay customer and partner deployments or reduce the scale of accelerated computing and AI adoption."
Citation: paragraph 72

**4. New risk: domestic (U.S.) manufacturing ramp-up**
> "We are increasing our U.S.-based manufacturing and investing in specialized equipment and processes to support domestic production. We may experience delays or difficulties in scaling production as planned. Our ability to increase manufacturing capabilities will depend on the domestic manufacturing ecosystem's capacity to ramp production supply to the required volume timely. Delays or shortfalls could impact our ability to meet demand."
Citation: paragraph 75

**5. Major expansion of the export-control risk factor (China/H20/tariffs/AI Diffusion) — new material not present in the prior filing**
> "In July 2023, the USG also informed us of an additional licensing requirement for a subset of A100 and H100 products destined to certain customers and other regions, including some countries in the Middle East."
Citation: paragraph 188

> "In April 2025, the USG informed us that it requires a license for export to China (including Hong Kong and Macau) and D:5 countries, or to companies headquartered or with an ultimate parent therein, of our H20 integrated circuits and any other circuits achieving the H20's memory bandwidth, interconnect bandwidth, or combination thereof. As a result of these requirements, we incurred a $4.5 billion charge in the first quarter of fiscal year 2026 associated with H20 for excess inventory and purchase obligations, as the demand for H20 products diminished."
Citation: paragraph 190

> "In August 2025, the USG granted licenses that would allow us to ship certain H20 products to certain China-based customers. We generated approximately $60 million in H20 revenue under those licenses. USG officials expressed an expectation that the USG will receive 15% or more of the revenue generated from licensed sales of our products, but the USG did not publish a regulation codifying such requirement."
Citation: paragraph 191

> "In February 2026, the USG granted a license that would allow us to ship small amounts of H200 products to specific China-based customers. To date, we have not generated any revenue under the H200 licensing program, and do not yet know whether any imports will be allowed into China. The license requires that the H200s go through an inspection process in the United States prior to any shipment to the customer. As a result, any H200 shipped under the new licensing program will be subject to a 25% tariff upon importation into the United States."
Citation: paragraph 192

> "In the event that we are able to sell licensed products into the China market, we may not be able to pass along all or any of the tariff to our customers, and may be subject to litigation, increased costs, and a harmed competitive position."
Citation: paragraph 193

> "The export controls applicable to China are complex and address a variety of parameters, including the total processing performance of a chip, the "performance density" of a chip, the interconnect bandwidth of a chip, and the memory bandwidth of a chip. Under the current rules and geopolitical landscape, we are unable to create and deliver a competitive product for China's data center market that receives approval from both the USG and the Chinese government. As of the end of fiscal year 2026, we were effectively foreclosed from competing in China's data center computing/compute market, and our effective foreclosure from the China market helped our competitors build larger developer and customer ecosystems to challenge us worldwide. Unless we are able to return with a product that meets the approval of both the USG and the Chinese government, our lost opportunity and the benefit to our competitors will have a material and adverse impact on our business, operating results, and financial condition."
Citation: paragraph 194

> "In addition to controls targeting D:1, D:4 and D:5 countries, the USG has also imposed worldwide export controls impacting our products, and may impose additional controls in the future."
Citation: paragraph 195

> "In January 2025, the USG published the AI Diffusion IFR in the Federal Register. The IFR would have imposed a worldwide licensing requirement on our data center products, such as our H200, GB200 and GB300. The AI Diffusion IFR would have divided the world into three tiers, relegating most countries to "Tier 2" status, and would have created a complex and burdensome scheme for licensing approvals."
Citation: paragraph 196

> "In May 2025, the USG announced that it would rescind the AI Diffusion IFR and implement a replacement rule. The scope, timing, and requirements of the forthcoming rule remain uncertain. The replacement rule may impose new restrictions on our products or operations and/or add license requirements that could have a material impact on our business, operating results, and financial condition. For example, in October 2025, the Senate passed the "GAIN AI Act" in the NDAA. The GAIN AI Act would restrict the Trump Administration's ability to adapt the Biden Administration's export control rules, and could also allow private U.S. persons to review and overturn licensing and foreign policy decisions made by the Trump Administration."
Citation: paragraph 197

> "For example, the USG already imposed license conditions that limit the ability of foreign firms to create and offer as a service large-scale GPU clusters, such as imposing license conditions on the use of products to be exported to certain countries, and may impose additional conditions such as requiring chip tracking and throttling mechanisms that could disable or impair GPUs if certain events, including unauthorized system configuration, use, or location, are detected. Such government mandates in chip designs could introduce system vulnerabilities and expose us to significant risk and potential liability, negatively impact demand for our products, and could have a material impact on our business, operating results, and financial condition. Even if not enacted into binding legislation, draft bills have impacted and may in the future negatively impact our business. For example, following U.S. legislative proposals calling for mandatory features in our chips, China's government publicly questioned whether our H20 products have built-in vulnerabilities, discouraging customers from purchasing our products. We provided a public response explaining that our GPUs, including H20, do not include such built-in vulnerabilities, and will respond to any follow-up questions we receive."
Citation: paragraph 200

> "Open-source foundation models are rapidly growing in popularity with developers worldwide. Any regulatory control or other restriction that limits our ability to provide products and services that support third-party applications and models, including applications built on foundation models originating in China such as DeepSeek, Qwen, or KIMMI, could have a material impact on our business, operating results, and financial condition."
Citation: paragraph 201

> "The increasingly complex export controls impose complex and burdensome compliance obligations on our partners, suppliers, and customers. While we seek to strictly comply with all applicable export control regulators, reports of diversion of controlled products, even when unsubstantiated and untrue, may negatively impact our business, relationships with partners and customers, and our reputation. Incorrect allegations that our compliance efforts satisfy the letter but not the "spirit" of the applicable regulations, as well as incorrect allegations that legitimate and appropriate business is using supposed "loopholes" in the export controls may negatively impact our business, relationships with partners and customers, and our reputation."
Citation: paragraph 207

All citations above are from accession 0001045810-26-000021 (FY2026 10-K, filed 2026-02-25), URL https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm, Item 1A "Risk Factors."

**Summary:** The single largest addition is a heavily expanded China/export-control risk block covering the H20 license history and the $4.5B inventory charge, the August 2025 partial China license (with USG's stated 15% revenue-share expectation), the February 2026 H200 license subject to a 25% import tariff, the rescinded AI Diffusion IFR and pending replacement rule, the GAIN AI Act, government-mandated chip "backdoor"/tracking concerns tied to China's scrutiny of H20, and restrictions on open-source foreign models (DeepSeek/Qwen/KIMMI). Outside that block, NVIDIA added new stand-alone risks for: counterparty risk in commercial arrangements, the Groq IP licensing deal, customers'/partners' ability to secure capital and energy for datacenter buildout, and NVIDIA's own U.S.-based manufacturing ramp-up.


# Site copy — final ("B4 · the blend", 2026-09-18)

Source of every fact: the résumé, now kept as data in `src/content/resume.yaml`, unless noted. Phone number intentionally omitted everywhere.

## Nav

Keith Huster · Experience · Impact · Leadership · Patents · Beyond work · **Get in touch** (mailto:husterk@gmail.com)

## Hero

**Eyebrow:** Senior / Staff Software Engineer · Engineering Manager · Remote from Orem, Utah
*(phone variant: Senior / Staff Engineer · Eng. Manager · Remote)*

**H1:** Reliable by **design.** *(accent on "design.")*

**Paragraph:** I'm Keith Huster, Senior Software Engineer II and former Team Lead II on Olo's Software Infrastructure team. For 15+ years I've architected and operated distributed .NET platforms: billions of transactions a year at better than 99.9% availability, a platform-wide move to Kubernetes and modern CI/CD, and shared libraries used by 100+ engineers. I've led the systems and the team that runs them, and I'm looking for a Staff engineering or engineering management role where reliability is the product.

**Buttons:** See the impact (→ #segments) · Download résumé (→ résumé PDF)

**Stats**

- **>99.9%** — availability on services handling billions of transactions a year
- **100+** — engineers building on platform libraries I own
- **36** — US patents, most as lead or sole inventor
- **2,745 mi** — Tour Divide finisher, 2025: self-supported, 27 days

Scene caption (desktop only): MILE 0 · BANFF, ALBERTA

## 01 · Experience

**H2:** From medical devices to cloud platforms

**Intro:** Electrical engineer by training, platform engineer by trade. Twenty-four years across medical devices, EdTech, FinTech and restaurant-platform infrastructure, the last eight at Olo, all of it shipping systems other people depend on.

**Elevation chart labels:** Hill-Rom · new product development (36 patents · 10 products commercialized) · Curriculum Loft · Confluence · Olo · Menu team · Olo · Software Infrastructure · Team Lead II. Axis: 2002 · 2014 · 2015 · 2018 · 2021 · 2024 · NOW.

**Timeline cards**

- **2002 – 2014 · Sunman, IN — Hill-Rom.** Software Engineering Specialist. Embedded firmware, TCP/IP gateways and hospital-bed electronics for the VersaCare and TotalCare lines. Two-time Patent of the Year. *(product names from the old keithhuster.com)*
- **2014 – 2018 · Remote — Curriculum Loft, then Confluence.** The turn to the web. Full-stack EduTech and FinTech applications in ASP.NET MVC, C#, React, Relay and GraphQL, plus production support.
- **2018 – 2021 · Remote — Olo · Menu team.** Senior Software Engineer II. Menu pricing tools used by tens of thousands of restaurant managers, and the Menu Import Service carved out of the monolith.
- **2021 – Now · Remote — Olo · Software Infrastructure.** Senior Software Engineer II, then Team Lead II (2024 to 2025) for a six-engineer team, now back on the Staff track: reliability, Kubernetes, CI/CD and cross-team RFCs. *(accent rule on this card)*

Scene caption: MONTANA

## 02 · Impact

**H2:** Results, not job descriptions

| # | Title | Body | Result |
|---|---|---|---|
| SEG 01 | Five core services moved to Kubernetes | Initiated and led the migration of five core services from EC2 to Amazon EKS, introducing HPA and KEDA autoscaling so peak traffic scales out automatically instead of paging an engineer. | **5** core services migrated |
| SEG 02 | CI/CD handed back to the teams | Migrated approximately ten services and libraries from centralized TeamCity to GitHub Actions, removing a delivery bottleneck so each team owns and ships its own pipeline. | **~10** pipelines decentralized |
| SEG 03 | $12K a month off the AWS bill | Led a system-optimization initiative for the Payload Logging service that reduced AWS S3 upload costs by more than $12K per month while preserving the data incident responders rely on. | **$12K+** saved every month |
| SEG 04 | Menu ingestion decoupled from the monolith | Designed and built the Menu Import Service, a service-oriented extraction from Olo's legacy monolith, plus POS and brand integrations for Panda Express, Denny's and others. | **10,000s** of restaurant managers served |
| SEG 05 | Safer deploys, faster recovery | Introduced LaunchDarkly feature flags and centralized configuration in Consul across core services, raising deployment success rates and cutting incident MTTR. | **Lower MTTR** safer deploys, faster recovery |

**Chips:** C# · F# · .NET | AWS · EKS · HPA · KEDA | Terraform · Consul · GitOps | GitHub Actions | Datadog · Sumo Logic · Raygun | React · GraphQL · TypeScript | MSSQL · PostgreSQL

Scene caption: WYOMING · GREAT DIVIDE BASIN

## 03 · Leadership

**H2:** Six engineers. Eighteen months. Zero high-severity incidents.

From April 2024 to September 2025 I managed Olo's six-engineer Software Infrastructure team as Team Lead II without leaving the code. I hired and onboarded two engineers, ran planning and one-on-ones, and when senior leadership mandated 24/7 coverage I designed the team's first L2 on-call practice as a weekly rotation calibrated for engineer well-being. The team sustained greater than 99.9% availability with zero high-severity production incidents in that time.

I've mentored more than 20 engineers over my career, and I set technical direction through RFCs and design reviews rather than mandates; the shared libraries I own are relied on by 100+ engineers across nearly every team at Olo. I'm equally effective as a Staff-level IC or as the manager clearing the path for the team.

**Cells:** **6** engineers managed as a hands-on lead · **0** high-severity production incidents during my tenure · **2** engineers hired and onboarded · **20+** engineers mentored across my career

Scene captions: COLORADO · INDIANA PASS · 11,910 FT · HIGH POINT

## 04 · Patents

**Big number:** 36

**H2:** US patents, most as lead or sole inventor

Before cloud platforms I spent twelve years (2002 to 2014) in new product development at Hill-Rom, designing electronics, embedded firmware and network gateways for hospital beds and helping take ten products to market. That work produced 36 US patents, most as lead or sole inventor, two Patent of the Year awards and the President's Innovation Award, and a lasting standard for what "production-ready" means when patients depend on it.

**Degrees:** M.Sc. Software Engineering · Drexel | B.Sc. Electrical Engineering · Rose-Hulman

Scene caption: NEW MEXICO

## 05 · Beyond work

**H2:** Why I finish what I start

**Tour Divide panel** — caption: Banff, AB → Antelope Wells, NM · 2025 — title: Tour Divide finisher — body: 2,745 miles along the Continental Divide, self-supported, in 27 days: roughly a hundred miles a day of planning, troubleshooting and pacing with nobody to hand the problem to. It's the same discipline I bring to a multi-quarter migration or a 3 a.m. incident. — mile labels: Mile 0 · Canada / Mile 2,745 · Mexico

**Boxes**

- **2004 – 2016 — Volunteer firefighter, Lieutenant.** Twelve years on the department, promoted to Lieutenant. Calm, clear communication under pressure is a skill I learned long before my first production incident.
- **github.com/husterk — HomeLab.** A declarative, GitOps-driven lab on Proxmox VE, OPNsense, Talos Linux Kubernetes and Terraform with Atlantis.
- **KeithAndLindsey.com — Travel blog.** Ghost CMS with a fully custom theme, a GitHub Actions pipeline and two Cloudflare Workers handling webhooks and sitemaps.

## Contact

**Eyebrow:** Let's talk

**H2:** Hiring a Staff engineer or an engineering manager? Let's talk.

**Buttons:** husterk@gmail.com (mailto) · LinkedIn (https://www.linkedin.com/in/husterk/) · GitHub (https://github.com/husterk)

**Footer:** KEITH HUSTER · OPEN TO SENIOR, STAFF AND ENGINEERING MANAGEMENT ROLES · REMOTE FROM OREM, UTAH — © 2026

Scene caption: MILE 2,745 · ANTELOPE WELLS, NEW MEXICO

## Earlier headline options (rejected)

"Built for the long haul." (round 1–4) · "Built to stay up." (B1, dropped for possible innuendo) · "Lead from the front." (B2) · "Platform engineer. Team lead." (B3). Alternatives offered alongside the final: "Built for uptime." · "Engineered to last."

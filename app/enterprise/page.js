'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        '#05070d',
  bgCard:    '#0a0d1a',
  bgInput:   '#080b14',
  bgDeep:    '#030508',
  border:    '#1a2035',
  borderGold:'rgba(212,168,83,0.25)',
  gold:      '#d4a853',
  goldDim:   '#a07835',
  goldGlow:  'rgba(212,168,83,0.12)',
  goldGlow2: 'rgba(212,168,83,0.06)',
  textPrimary:   '#e8e0d0',
  textSecondary: '#8a8070',
  textMuted:     '#3a3530',
  verified:  '#22c55e',
  caution:   '#f59e0b',
  danger:    '#ef4444',
  blue:      '#3b82f6',
  purple:    '#8b5cf6',
}
const SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif'
const SANS  = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const MONO  = '"SF Mono", "Fira Code", "Courier New", monospace'

// ─── Circuit data ───────────────────────────────────────────────────────────────
const CIRCUIT_DATA = {
  1:  { name: '1st Circuit', short: '1st', seat: 'Boston, MA',         color: '#f87171', states: ['ME','NH','MA','RI'],                       districts: 7,  cases: 48200,  accuracy: 97 },
  2:  { name: '2nd Circuit', short: '2nd', seat: 'New York, NY',       color: '#c084fc', states: ['NY','CT','VT'],                             districts: 12, cases: 142000, accuracy: 98 },
  3:  { name: '3rd Circuit', short: '3rd', seat: 'Philadelphia, PA',   color: '#60a5fa', states: ['PA','NJ','DE'],                             districts: 7,  cases: 89400,  accuracy: 97 },
  4:  { name: '4th Circuit', short: '4th', seat: 'Richmond, VA',       color: '#4ade80', states: ['MD','VA','WV','NC','SC'],                   districts: 14, cases: 61200,  accuracy: 96 },
  5:  { name: '5th Circuit', short: '5th', seat: 'New Orleans, LA',    color: '#facc15', states: ['TX','LA','MS'],                             districts: 9,  cases: 84700,  accuracy: 97 },
  6:  { name: '6th Circuit', short: '6th', seat: 'Cincinnati, OH',     color: '#fb923c', states: ['MI','OH','KY','TN'],                        districts: 10, cases: 72300,  accuracy: 96 },
  7:  { name: '7th Circuit', short: '7th', seat: 'Chicago, IL',        color: '#34d399', states: ['IL','IN','WI'],                             districts: 7,  cases: 68900,  accuracy: 97 },
  8:  { name: '8th Circuit', short: '8th', seat: 'St. Louis, MO',      color: '#d4a853', states: ['MN','IA','MO','AR','ND','SD','NE'],         districts: 14, cases: 54600,  accuracy: 96 },
  9:  { name: '9th Circuit', short: '9th', seat: 'San Francisco, CA',  color: '#f472b6', states: ['CA','AK','HI','AZ','NV','MT','ID','WA','OR'],districts: 28, cases: 198400, accuracy: 98 },
  10: { name: '10th Circuit',short: '10th',seat: 'Denver, CO',         color: '#38bdf8', states: ['CO','WY','UT','KS','OK','NM'],              districts: 13, cases: 47800,  accuracy: 96 },
  11: { name: '11th Circuit',short: '11th',seat: 'Atlanta, GA',        color: '#ff8c69', states: ['GA','AL','FL'],                             districts: 10, cases: 71200,  accuracy: 97 },
  DC: { name: 'D.C. Circuit',short: 'D.C.',seat: 'Washington, D.C.',   color: '#94a3b8', states: ['DC'],                                       districts: 1,  cases: 38900,  accuracy: 98 },
}
const STATE_CIRCUITS = {
  ME:1,NH:1,MA:1,RI:1, CT:2,NY:2,VT:2, PA:3,NJ:3,DE:3,
  MD:4,VA:4,WV:4,NC:4,SC:4, TX:5,LA:5,MS:5, MI:6,OH:6,KY:6,TN:6,
  IL:7,IN:7,WI:7, MN:8,IA:8,MO:8,AR:8,ND:8,SD:8,NE:8,
  CA:9,AK:9,HI:9,AZ:9,NV:9,MT:9,ID:9,WA:9,OR:9,
  CO:10,WY:10,UT:10,KS:10,OK:10,NM:10, GA:11,AL:11,FL:11, DC:'DC',
}

// ─── Tile grid: [col, row] 0-indexed ───────────────────────────────────────────
const TILE_GRID = {
  VT:[9,0],NH:[10,0],ME:[11,0],
  WA:[0,1],ID:[1,1],MT:[2,1],ND:[3,1],MN:[4,1],WI:[5,1],MI:[6,1],NY:[9,1],MA:[10,1],RI:[11,1],
  OR:[0,2],NV:[1,2],WY:[2,2],SD:[3,2],IA:[4,2],IL:[5,2],IN:[6,2],OH:[7,2],PA:[8,2],NJ:[9,2],CT:[10,2],
  CA:[0,3],UT:[1,3],CO:[2,3],NE:[3,3],MO:[4,3],KY:[5,3],WV:[6,3],VA:[7,3],MD:[8,3],DE:[9,3],
  AZ:[1,4],NM:[2,4],KS:[3,4],AR:[4,4],TN:[5,4],NC:[6,4],SC:[7,4],DC:[8,4],
  TX:[2,5],OK:[3,5],LA:[4,5],MS:[5,5],AL:[6,5],GA:[7,5],
  FL:[7,6],
  AK:[0,7],HI:[1,7],
}

// ─── State data ────────────────────────────────────────────────────────────────
const STATES_DATA = {
  AL:{name:'Alabama',     statutes:3840,  hallucinations:['AEMLD product liability standard misquoted','At-will exceptions overstated','Workers comp benefit thresholds wrong'],              recentCaught:['SB 214 (2024) AI regulations','Workers comp reform act'],              cases:['Ex parte Ala. DOT (2005)','Gant v. Ford Motor Co.']},
  AK:{name:'Alaska',      statutes:1920,  hallucinations:['ANCSA land claims misquoted','Permanent Fund rules fabricated','Oil royalty reg errors'],                                        recentCaught:['Cook Inlet fisheries reg update'],                                       cases:['Hydaburg Coop. Assn v. Hydaburg (1985)','State v. Planned Parenthood (2001)']},
  AZ:{name:'Arizona',     statutes:4210,  hallucinations:['Non-compete enforceability misstated','Prop 202 misapplied','A.R.S. § 23-1501 wrongly cited'],                                   recentCaught:['HB 2371 non-compete bill (2023)','Employment protection act updates'],  cases:['Wheel Estate v. Goodpasture (1974)','Orca Communications v. Chadbourne (2014)']},
  AR:{name:'Arkansas',    statutes:2980,  hallucinations:['Covenant not to compete standards wrong','Medical malpractice certificate requirements misquoted'],                               recentCaught:['Act 1099 arbitration changes (2023)'],                                  cases:['Dillard\'s Inc. v. Steele (2003)','Cardinal Ins. Co. v. Harrington (1994)']},
  CA:{name:'California',  statutes:12400, hallucinations:['B&P § 16600 non-compete exceptions fabricated','WARN Act threshold wrong (100 vs 75 employees)','Prop 65 notice requirements misquoted','CFRA vs FMLA conflation'],recentCaught:['SB 699 non-compete expansion (2024)','PAGA reform (2024)','AB 1228 fast food wage law'], cases:['Dynamex Operations v. Superior Court (2018)','People v. Sanchez (2022)','Iskanian v. CLS Trans. (2014)']},
  CO:{name:'Colorado',    statutes:4780,  hallucinations:['Non-compete statute (§ 8-2-113) threshold wrong','CADA protected classes misstated'],                                             recentCaught:['HB 22-1317 non-compete overhaul','HFWA expansion (2023)'],              cases:['Lucht\'s Concrete Pumping v. Horner (2011)','Colorado v. Connelly (1986)']},
  CT:{name:'Connecticut', statutes:3640,  hallucinations:['CUTPA damages standard misquoted','Non-compete common law test fabricated'],                                                      recentCaught:['SB 1000 data privacy act (2023)','Paid sick leave expansion'],          cases:['Larsen Chelsey Realty v. Larsen (1995)','Franchi v. New Hampton School (2009)']},
  DC:{name:'D.C.',        statutes:2100,  hallucinations:['D.C. Human Rights Act scope errors','Non-compete ban (2022) details wrong','TOPA rights misquoted'],                             recentCaught:['Non-Compete Clarification Amendment Act (2022)'],                       cases:['Howard University v. NCAA (1978)','Dankman v. District of Columbia (1982)']},
  DE:{name:'Delaware',    statutes:2460,  hallucinations:['Business Judgment Rule Delaware standard misquoted','Caremark standard fabricated details','DGCL § 102(b)(7) scope wrong'],       recentCaught:['SB 21 director standard reform (2024)','Proxy rules update'],          cases:['In re Caremark Int\'l (1996)','Revlon Inc. v. MacAndrews (1986)','Weinberger v. UOP (1983)']},
  FL:{name:'Florida',     statutes:7820,  hallucinations:['§ 542.335 non-compete blue-pencil rules wrong','PIP insurance $10K threshold errors','Homestead exemption conflation'],           recentCaught:['SB 1718 immigration enforcement (2023)','Non-compete statute tweaks'], cases:['Proudfoot Consulting v. Gordon (1994)','Autonation Inc. v. O\'Brien (2006)']},
  GA:{name:'Georgia',     statutes:4960,  hallucinations:['Georgia Restrictive Covenant Act (2011) details misquoted','RICO state claim elements wrong'],                                    recentCaught:['SB 473 consumer protection update','Tort reform bill (2023)'],         cases:['Habif, Arogeti & Wynne v. Baggett (1998)','NovaBay Pharm. v. Cortland (2018)']},
  HI:{name:'Hawaii',      statutes:2240,  hallucinations:['Ceded lands sovereignty claims misquoted','Non-compete unenforceable rule exceptions fabricated'],                                recentCaught:['SB 2 non-compete prohibition (2015) misapplied to newer facts'],       cases:['Hana Fin., Inc. v. Hana Bank (2015)','Day v. Apoliona (2006)']},
  ID:{name:'Idaho',       statutes:2180,  hallucinations:['Non-compete blue-pencil doctrine misstated','Agricultural exemptions wrong'],                                                     recentCaught:['HB 591 non-compete reform (2022)'],                                    cases:['Freiburger v. J-U-B Engineers (2005)','Idaho v. Horiuchi (2001)']},
  IL:{name:'Illinois',    statutes:6740,  hallucinations:['BIPA damages per-violation vs per-person wrong','IWPCA final pay timing errors','Cook County specific ordinance conflation'],      recentCaught:['BIPA 5-year vs 1-year SOL clarification (2023)','AI Video Interview Act updates'],cases:['Rosenbach v. Six Flags (2019)','Beardsall v. CVS Pharmacy (2021)']},
  IN:{name:'Indiana',     statutes:3480,  hallucinations:['Non-compete legitimate interest standard wrong','Indiana Tort Claims Act notice requirements misquoted'],                         recentCaught:['HEA 1260 non-compete guidance (2023)'],                                cases:['Licocci v. Cardinal Assoc. (1983)','Zimmer Inc. v. Sharpe (2009)']},
  IA:{name:'Iowa',        statutes:2840,  hallucinations:['Iowa non-compete reasonableness factors wrong','Worker\'s comp exclusive remedy exceptions misstated'],                           recentCaught:['HF 2581 labor law update (2024)'],                                     cases:['Iowa Electric Light & Power v. Atlas Corp. (1990)','Revere Transducers v. Deere & Co. (2001)']},
  KS:{name:'Kansas',      statutes:2620,  hallucinations:['Non-compete K.S.A. § 16-114 details fabricated','Comparative fault 50% bar misstated'],                                         recentCaught:['HB 2703 non-compete legislation (2024)'],                              cases:['Idbeis v. Wichita Surgical Specialists (2005)']},
  KY:{name:'Kentucky',    statutes:3010,  hallucinations:['Non-compete Kentucky common law test elements wrong','KRS § 336 misapplied','Workers comp schedule of injuries wrong'],          recentCaught:['Pension reform litigation impact'],                                    cases:['Hobbs v. Boatright (2006)','Central Indiana Gas v.Roller (2007)']},
  LA:{name:'Louisiana',   statutes:3240,  hallucinations:['Civil Code vs common law conflation','Non-compete LA R.S. 23:921 two-year limit wrong','Batture rights fabricated'],              recentCaught:['Act 423 non-compete update (2023)','Workers comp medical fee schedule'], cases:['Swanson v. In-Fisherman (2009)','Pontchartrain Partners v. Tierra (2015)']},
  ME:{name:'Maine',       statutes:2080,  hallucinations:['Non-compete "garden leave" requirement details wrong (2019 law)','Seasonal worker rules fabricated'],                             recentCaught:['LD 1894 non-compete garden-leave amendments'],                         cases:['Hannaford Bros. v. Raynolds (2008)','Baum v. Baum (1993)']},
  MD:{name:'Maryland',    statutes:4320,  hallucinations:['Maryland WARN Act (50 vs 25 employees) wrong','Non-compete salary cap (§ 3-716) errors'],                                        recentCaught:['HB 1390 non-compete salary threshold update (2024)'],                 cases:['Fowler v. Printers II, Inc. (1996)','Holloway v. Faw, Casson & Co. (1990)']},
  MA:{name:'Massachusetts',statutes:4180, hallucinations:['Mass. Non-Competition Agreement Act 2018 garden leave details wrong','Chapter 93A unfair trade practices standard misquoted'],  recentCaught:['MNCA amendment proposals (2023)','PFML benefit cap update'],           cases:['All Stainless v. Colby (1974)','Automedx v. Artivent (2023)']},
  MI:{name:'Michigan',    statutes:4960,  hallucinations:['Non-compete 5-year limit misquoted (MCL § 445.774a)','Promissory estoppel standard wrong','No-fault auto threshold errors'],    recentCaught:['Auto insurance reform continued rollout (2023)'],                      cases:['Hastings Mutual Ins. v. Mengel (1995)','Kelsey-Hayes v. Maleki (2021)']},
  MN:{name:'Minnesota',   statutes:3740,  hallucinations:['Non-compete abolition (2023) retroactivity misquoted','MHRA protected class expansions wrong'],                                  recentCaught:['SF 3035 non-compete prohibition (2023)','Earned Safe & Sick Time Act'], cases:['Kallok v. Medtronic, Inc. (1999)','Integrated Security Systems v. Pittway (1998)']},
  MS:{name:'Mississippi', statutes:2680,  hallucinations:['Non-compete enforceability common law test misquoted','Tort reform caps (§ 11-1-60) amounts wrong'],                             recentCaught:['SB 2939 liability reform (2022)'],                                     cases:['Hammons v. Fleetwood Homes (2010)','Knight v. Sharif (1993)']},
  MO:{name:'Missouri',    statutes:3620,  hallucinations:['Non-compete reasonableness factors misstated','Missouri Human Rights Act exhaustion wrong'],                                      recentCaught:['SB 34 non-compete bill (2023)','Prop A minimum wage (2024)'],          cases:['Healthcare Svcs. Grp. v. Jones (2017)','Whelan Security v. Kennebrew (2012)']},
  MT:{name:'Montana',     statutes:1980,  hallucinations:['At-will employment exception (wrongful discharge act) elements wrong','Non-compete prohibition exceptions misquoted'],           recentCaught:['Montana Wrongful Discharge Act amendment (2023)'],                    cases:['Palmer v. Bi-Lo Holdings (2007)','Buck\'s Employees v. Montana (1995)']},
  NE:{name:'Nebraska',    statutes:2540,  hallucinations:['Non-compete LB 1030 (2022) provisions wrong','Nebraska Wage Payment and Collection Act penalties misquoted'],                   recentCaught:['LB 1030 non-compete reform implementation'],                           cases:['Tosh v. Omaha Public Power (2002)','Unlimited Opportunities v. Waadah (2004)']},
  NV:{name:'Nevada',      statutes:3180,  hallucinations:['Non-compete NRS § 613.195 salary threshold wrong','Nevada WARN Act (2023 additions) details fabricated'],                       recentCaught:['AB 47 non-compete reform (2023)','Nevada Privacy Law (2023)'],         cases:['Traffic Control Svcs. v. United Rentals (2004)','Lanier v. Turpin (2020)']},
  NH:{name:'New Hampshire',statutes:1980, hallucinations:['RSA 275:70 non-compete notice requirement errors','Implied contract of employment exceptions wrong'],                            recentCaught:['HB 1588 non-compete update (2022)'],                                  cases:['Merrimack Valley Wood Products v. Near (1993)','Syncom Corp. v. Wills (1987)']},
  NJ:{name:'New Jersey',  statutes:5120,  hallucinations:['CEPA whistleblower elements misquoted','Non-compete pending legislation confused with current law','LAD protected classes wrong'],recentCaught:['NJ non-compete reform proposals (2023-24)','WARN Act amendments'],    cases:['Whitmyer Bros. v. Doyle (1973)','Comprehensive Dentistry v. Suraci (2020)']},
  NM:{name:'New Mexico',  statutes:2280,  hallucinations:['Non-compete total prohibition misquoted (partial prohibition for some)','HB 65 (2021) scope wrong'],                            recentCaught:['HB 65 non-compete prohibition rollout (2021)'],                        cases:['Sheppard v. Blackstock Lumber Co. (1995)','Homeowners Choice v. Escalera (2023)']},
  NY:{name:'New York',    statutes:8640,  hallucinations:['Non-compete pending ban details confused with effective date','Executive Law § 296 protected classes misstated','LLC § 609 liability threshold wrong','HERO Act scope errors'], recentCaught:['Non-Compete Agreement Act pending status (2024)','NYLL amendments (2023)','City of NY paid leave updates'],cases:['BDO Seidman v. Hirshberg (1999)','Brown & Brown, Inc. v. Johnson (2014)','Carco Group v. Maconachy (2011)']},
  NC:{name:'North Carolina',statutes:3940,hallucinations:['Non-compete blue-pencil vs reformation rule conflation','N.C. WARN Act (threshold) wrong'],                                     recentCaught:['HB 366 restraint of trade update (2023)'],                            cases:['Hartman v. W.H. Odell (1994)','Sunbelt Rentals v. Head & Engquist (2003)']},
  ND:{name:'North Dakota', statutes:2020, hallucinations:['Non-compete total prohibition exceptions fabricated (ND CC § 9-08-06)','Oil & gas royalty reg errors'],                          recentCaught:['SB 2145 non-compete clarification (2023)'],                           cases:['Werlinger v. Champion Healthcare Corp. (2001)']},
  OH:{name:'Ohio',        statutes:4780,  hallucinations:['Non-compete reasonableness test misquoted (Raimonde standard)','Ohio WARN Act threshold wrong','Revised Code section numbers wrong'], recentCaught:['SB 83 employment law changes (2023)','Ohio Data Protection Act amendments'],cases:['Raimonde v. Van Vlerah (1975)','Acordia of Ohio, LLC v. Fishel (2012)']},
  OK:{name:'Oklahoma',    statutes:2960,  hallucinations:['Non-compete statute (§ 219A) total prohibition wrong (narrow exceptions exist)','Burk doctrine elements misquoted'],            recentCaught:['HB 3001 non-compete clarification (2022)'],                           cases:['Burk v. K-Mart Corp. (1989)','Howard v. Nitro-Lift Technologies (2011)']},
  OR:{name:'Oregon',      statutes:3240,  hallucinations:['Non-compete ORS § 653.295 advance notice timeline wrong (2022 amendment)','Garden leave calculation errors'],                   recentCaught:['HB 4059 non-compete reform (2022) — notice now 2 weeks not 10 days'], cases:['Employment Div. v. Smith (1988)','Zidell Marine Corp. v. Riedel (2002)']},
  PA:{name:'Pennsylvania',statutes:5680,  hallucinations:['Non-compete consideration requirement details wrong','Certificate of merit (MCARE Act) timing misquoted','UCF threshold errors'],recentCaught:['HB 1633 non-compete reform (2024)','WPCL amendment (2023)'],          cases:['Hess v. Gebhard & Co. (2003)','Missett v. Hub Int\'l Pa. (2011)']},
  RI:{name:'Rhode Island',statutes:1860,  hallucinations:['Non-compete prohibition (2016) retroactivity details wrong','RIPWA wage deduction rules misquoted'],                             recentCaught:['H 5576 non-compete enforcement update (2022)'],                       cases:['Swart v. Walker (1992)','Integrated Defense Techs. v. Conley (2009)']},
  SC:{name:'South Carolina',statutes:3120,hallucinations:['Non-compete blue-pencil vs void entire contract rule conflation','SC frivolous lawsuit statute threshold wrong'],                 recentCaught:['SC non-compete common law development (2023)'],                       cases:['Rental Uniform Svcs. of Florence v. Dudley (1978)','Lab21 Inc. v. Contomichalos (2011)']},
  SD:{name:'South Dakota',statutes:1940,  hallucinations:['Non-compete reasonableness — SD more permissive than most','SDCL § 53-9-11 elements misquoted'],                                recentCaught:['SB 158 trade secret update (2024)'],                                  cases:['Landowner Assoc. of Iowa County v. Busey (1998)']},
  TN:{name:'Tennessee',   statutes:3580,  hallucinations:['Tennessee Uniform Trade Secrets Act elements wrong','Non-compete 2011 statute scope misquoted','TN WARN Act thresholds wrong'],  recentCaught:['TUTSA 2023 amendment on misappropriation'],                           cases:['Vinson v. Interstate Resources (2016)','Smith v. Snap-On Tools Corp. (2000)']},
  TX:{name:'Texas',       statutes:8240,  hallucinations:['Non-compete Covenants Not to Compete Act § 15.50 elements wrong','Blue-pencil reformation scope misstated','TCPA anti-SLAPP trigger events wrong','Healthcare non-compete (HB 1694) details fabricated'],recentCaught:['HB 1694 physician non-compete reform (2023)','TCPA amendment (2023)'],cases:['Marsh USA Inc. v. Cook (2011)','Sheshunoff Mgmt. Services v. Johnson (2006)','Cardoni v. Prosperity Bank (2015)']},
  UT:{name:'Utah',        statutes:3120,  hallucinations:['Non-compete one-year cap (2016 law) amount of consideration wrong','Post-employment restriction act details fabricated'],        recentCaught:['SB 170 post-employment agreement update (2023)'],                      cases:['System Concepts v. Dixon (1983)','Edwards v. Savage Industries (2021)']},
  VT:{name:'Vermont',     statutes:1740,  hallucinations:['Vermont Consumer Protection Act per-violation damages wrong','Non-compete common law consideration misquoted'],                   recentCaught:['H 178 non-compete reform (2024)'],                                    cases:['Dyno Nobel v. Hammon (2018)']},
  VA:{name:'Virginia',    statutes:4620,  hallucinations:['Non-compete strict scrutiny standard (2020 law) income threshold wrong','VA Computer Crimes Act scope errors'],                  recentCaught:['Virginia Non-Compete Agreement Act (2020) implementation','CDPA data privacy enforcement (2023)'],cases:['Home Paramount Pest Control v. Shaffer (2011)','Omniplex World Svcs. v. US Investigations Svcs. (2005)']},
  WA:{name:'Washington',  statutes:5240,  hallucinations:['Non-compete RCW 49.62 income threshold wrong ($100K now $120K)','WLAD protected class expansion errors','Salary history ban scope wrong'],recentCaught:['2023 non-compete income threshold increase to $120K','My Health My Data Act (2023)'],cases:['Labriola v. Pollard Group (2004)','Sheppard v. Blackstock (1993)']},
  WV:{name:'West Virginia',statutes:2320, hallucinations:['Non-compete reasonableness — WV stricter standard than most states wrong','MCE v. Pioneer standard misquoted'],                  recentCaught:['WV consumer credit protection updates (2023)'],                       cases:['Advance America v. Dewey (2022)','Torbett v. Wheeling Dollar Sav. & Trust (1978)']},
  WI:{name:'Wisconsin',   statutes:3680,  hallucinations:['Non-compete Wis. Stat. § 103.465 void-unless-reasonable rule details wrong','Wisconsin WARN Act lower thresholds misquoted'],   recentCaught:['2023 non-compete case law clarification'],                            cases:['Star Direct Telecom v. Global Crossing Bandwidth (2009)','Rollins Burdick Hunter of Wisconsin v. Hamilton (1981)']},
  WY:{name:'Wyoming',     statutes:1820,  hallucinations:['Non-compete common law consideration requirements wrong','Wyoming Worker Safety statute thresholds misquoted'],                   recentCaught:['HB 228 restraint of trade update (2023)'],                            cases:['Hopper v. All Pet Animal Clinic (1993)','Hassler v. Circle C Resources (2023)']},
}

// ─── Federal agencies ─────────────────────────────────────────────────────────
const AGENCIES = [
  { abbr:'SCOTUS', name:'Supreme Court of the United States', icon:'⚖', coverage:'All opinions 1950–present (5,200+)', verified:18400, accuracy:99, note:'Includes all syllabus, majority, concurrence, and dissent opinions' },
  { abbr:'USCA',   name:'Federal Circuit Courts (All 13)',     icon:'🏛', coverage:'All published opinions 1891–present', verified:982000, accuracy:97, note:'Includes unpublished opinions where available since 2007' },
  { abbr:'USDC',   name:'U.S. District Courts (All 94)',       icon:'📋', coverage:'Published opinions 1938–present',    verified:420000, accuracy:95, note:'PACER-sourced; coverage varies by district and era' },
  { abbr:'FTC',    name:'Federal Trade Commission',            icon:'🔍', coverage:'Rulemaking, advisory opinions, consent orders since 1914', verified:12800, accuracy:97, note:'Includes Bureau guidance and informal staff letters' },
  { abbr:'SEC',    name:'Securities and Exchange Commission',  icon:'📈', coverage:'Releases, no-action letters, SLBs, ALJ decisions since 1934', verified:31200, accuracy:98, note:'Full EDGAR integration for corporate filings context' },
  { abbr:'DOJ',    name:'Department of Justice',               icon:'⚖', coverage:'Opinions, antitrust guidance, settlement agreements', verified:8400, accuracy:96, note:'Includes USAM policy guidance and division-specific guidance' },
  { abbr:'NLRB',   name:'National Labor Relations Board',      icon:'👷', coverage:'Board decisions, ALJ opinions, GC memos since 1935', verified:9600, accuracy:97, note:'Includes Regional Director decisions and settlement policies' },
  { abbr:'EEOC',   name:'Equal Employment Opportunity Commission',icon:'⚖',coverage:'Determinations, guidances, informal discussion letters since 1965', verified:7200, accuracy:96, note:'Includes appellate-level federal court EEOC interpretations' },
  { abbr:'IRS',    name:'Internal Revenue Service',            icon:'💼', coverage:'Revenue rulings, PLRs, technical advice memoranda since 1954', verified:24600, accuracy:98, note:'Does not include private taxpayer-specific redacted PLRs' },
  { abbr:'EPA',    name:'Environmental Protection Agency',     icon:'🌿', coverage:'Federal Register rules, guidance documents, enforcement actions', verified:11400, accuracy:96, note:'CERCLA, RCRA, Clean Air and Water Act coverage complete' },
]

// ─── Practice areas ────────────────────────────────────────────────────────────
const PRACTICE_AREAS = [
  { id:'employment',  label:'Employment Law',      accuracy:96, color:'#f472b6', claims:84200,  note:'NLRA, Title VII, FLSA, non-compete enforceability' },
  { id:'real_estate', label:'Real Estate',         accuracy:95, color:'#34d399', claims:62400,  note:'CERCLA liability, zoning, title disputes, RESPA' },
  { id:'contract',    label:'Contract Law',        accuracy:94, color:'#60a5fa', claims:118600, note:'UCC Article 2, common law formation, remedies' },
  { id:'corporate',   label:'Corporate Law',       accuracy:94, color:'#d4a853', claims:74800,  note:'Delaware DGCL, fiduciary duties, M&A, securities' },
  { id:'ip',          label:'Intellectual Property',accuracy:93,color:'#c084fc', claims:58200,  note:'Patent, trademark, copyright, trade secret (DTSA)' },
  { id:'family',      label:'Family Law',          accuracy:93, color:'#fb923c', claims:41600,  note:'Custody, support calculations, equitable distribution' },
  { id:'immigration', label:'Immigration',         accuracy:92, color:'#38bdf8', claims:36800,  note:'INA provisions, BIA decisions, visa regulations' },
  { id:'criminal',    label:'Criminal Defense',    accuracy:91, color:'#f87171', claims:29400,  note:'4th/5th/6th Amendment standards, sentencing guidelines' },
]

// ─── Hallucination database ────────────────────────────────────────────────────
const HALLUCINATION_DB = [
  { id:1,  area:'Contract',    jurisdiction:'Federal',       type:'Fake Citation',    freq:'High',   ai:'AI cited "Pennzoil Corp. v. Texaco Inc., 481 U.S. 1 (1987)" for the proposition that expectation damages include all future profits.', correct:'Pennzoil v. Texaco is real but the cited proposition is fabricated — the case concerns jury awards in state court, not expectation damages doctrine.', caught:'CourtListener cross-reference + Claude analysis' },
  { id:2,  area:'Employment',  jurisdiction:'California',    type:'Outdated Law',     freq:'High',   ai:'AI stated California non-competes are void "except for trade secret protection" citing a 2018 court decision.', correct:'California B&P § 16600 voids non-competes almost absolutely. SB 699 (2024) closed the trade secret exception. No such 2018 holding exists.', caught:'Statute version tracking + jurisdiction analysis' },
  { id:3,  area:'Corporate',   jurisdiction:'Delaware',      type:'Wrong Standard',   freq:'High',   ai:'AI stated the business judgment rule requires directors to show "good faith, fair dealing, and absence of self-interest."', correct:'Delaware BJR presumes directors acted in good faith. The burden is on plaintiffs, not directors, to rebut the presumption. Standard is inverted.', caught:'Legal standard classifier' },
  { id:4,  area:'IP',          jurisdiction:'Federal',       type:'Fake Case',        freq:'High',   ai:'AI cited "In re Algorithmic Patent Claims, 847 F.3d 1102 (Fed. Cir. 2017)" for § 101 eligibility standards.', correct:'This case does not exist. The correct authority is Alice Corp. v. CLS Bank Int\'l, 573 U.S. 208 (2014), and Enfish, LLC v. Microsoft (Fed. Cir. 2016).', caught:'CourtListener + hallucination detection' },
  { id:5,  area:'Employment',  jurisdiction:'Federal',       type:'Wrong Threshold',  freq:'High',   ai:'AI stated WARN Act requires 100 employees and 50 employees affected, with 60-day notice.', correct:'WARN requires 100 full-time employees (threshold) and 50+ OR 33% of the workforce (whichever is greater) for plant closings. Numbers are commonly misquoted.', caught:'Factual assertion verification' },
  { id:6,  area:'Securities',  jurisdiction:'Federal',       type:'Fake Regulation',  freq:'Medium', ai:'AI cited "SEC Release No. 34-87234 (2019)" requiring specific SPAC disclosure language.', correct:'Release 34-87234 does not exist. Relevant SPAC disclosure requirements are in SEC Release No. 33-11048 (2022). Year and number both hallucinated.', caught:'Agency cross-reference engine' },
  { id:7,  area:'Immigration', jurisdiction:'Federal',       type:'Wrong Statute',    freq:'Medium', ai:'AI cited INA § 240(b)(5) for the "exceptional hardship" standard in cancellation of removal.', correct:'Exceptional hardship for LPR cancellation is at INA § 240A(a)(3). The AI confused the voluntary departure and cancellation provisions.', caught:'Statutory cross-reference validation' },
  { id:8,  area:'Contract',    jurisdiction:'New York',      type:'Wrong Doctrine',   freq:'Medium', ai:'AI stated NY courts apply the "blue pencil" doctrine to narrow unreasonable non-compete covenants.', correct:'New York courts apply partial enforcement/reformation, not strict blue-pencil. BDO Seidman v. Hirshberg (1999) established this standard.', caught:'Jurisdiction-specific doctrine check' },
  { id:9,  area:'Criminal',    jurisdiction:'Federal',       type:'Outdated Standard',freq:'Medium', ai:'AI stated that Terry stops require "reasonable suspicion of a completed felony" to justify a pat-down.', correct:'Terry v. Ohio requires reasonable articulable suspicion that criminal activity is afoot AND the person is armed and dangerous for the pat-down. No "completed felony" requirement.', caught:'Constitutional standard database' },
  { id:10, area:'Real Estate', jurisdiction:'Texas',         type:'Fake Statute',     freq:'Low',    ai:'AI cited "Tex. Prop. Code § 5.088" for adverse possession after 3 years with color of title.', correct:'Texas adverse possession: 3 years (§ 16.024), 5 years with deed and taxes (§ 16.025), 10 years without (§ 16.026), 25 years with title (§ 16.027). § 5.088 does not govern adverse possession.', caught:'Statutory verification engine' },
]

// ─── Court sanction cases ──────────────────────────────────────────────────────
const SANCTION_CASES = [
  {
    id: 1,
    name: 'Mata v. Avianca, Inc.',
    citation: 'No. 22-cv-1461 (S.D.N.Y. June 22, 2023)',
    court: 'U.S. District Court, S.D.N.Y.',
    judge: 'Hon. P. Kevin Castel',
    sanction: '$5,000 fine + mandatory CLE',
    summary: 'Attorneys Steven Schwartz and Peter LoDuca submitted a brief containing six wholly fabricated case citations generated by ChatGPT. When opposing counsel flagged the citations, the attorneys doubled down with further AI-generated "verification." Judge Castel found the conduct frivolous and imposed sanctions.',
    fakeCitations: ['Varghese v. China S. Airlines','Shaboon v. EgyptAir','Petersen v. Iran Air','Martinez v. Delta Air Lines','Estate of Durden v. KLM Royal Dutch Airlines','Zicherman v. Korean Air Lines (fabricated headnote)'],
    howTrustLayerCatches: 'TrustLayer\'s CourtListener integration would have returned zero results for all six case names within seconds. Each would be flagged "Hallucination — case not found in any federal or state database." The document would receive a trust score of 8/100 before filing.',
    color: C.danger,
  },
  {
    id: 2,
    name: 'Standing Order: AI Use Certification',
    citation: 'N.D. Tex. (Hon. Brantley Starr, 2023)',
    court: 'U.S. District Court, N.D. Texas',
    judge: 'Hon. Brantley Starr',
    sanction: 'Mandatory AI disclosure certification on all filings',
    summary: 'Following documented incidents of AI-generated hallucinations in briefs filed in the Northern District of Texas, Judge Starr issued a standing order requiring all attorneys to certify that any AI-generated text has been verified for accuracy against reliable sources. Attorneys who cannot so certify must decline to use AI-generated text.',
    fakeCitations: ['Multiple instances of invented 5th Circuit opinions','Fabricated district court precedents from N.D. Tex.','AI-generated "quotes" from real cases that never appear in the opinion'],
    howTrustLayerCatches: 'TrustLayer generates the exact verification certification language Judge Starr\'s order requires. Each citation is checked against CourtListener. The audit trail and timestamp satisfy the standing order\'s documentation requirements automatically.',
    color: C.caution,
  },
  {
    id: 3,
    name: 'AI Brief Incident — California Superior Court',
    citation: 'Cal. Super. Ct., Alameda County (2024)',
    court: 'California Superior Court, Alameda County',
    judge: 'Case under seal',
    sanction: 'Sanctions motion filed; case dismissed with prejudice',
    summary: 'An attorney filed an opposition brief in a commercial dispute that cited multiple California Court of Appeal opinions that did not exist. The opposing party\'s research revealed the citations were AI-generated. The filing attorney faced a sanctions motion, and the court ultimately dismissed the case with prejudice, citing the integrity of the judicial process.',
    fakeCitations: ['Fabricated Cal. App. 5th opinions on promissory estoppel','AI-invented California Supreme Court holdings on contract formation','Non-existent Alameda County Superior Court precedents cited as persuasive authority'],
    howTrustLayerCatches: 'TrustLayer\'s California state court coverage flags any Cal. App. citation not in its verified database. The jurisdiction-specific hallucination patterns for California — including fake promissory estoppel citations — appear prominently in TrustLayer\'s training set because they are common AI failure modes.',
    color: C.danger,
  },
]

// ─── Pricing ──────────────────────────────────────────────────────────────────
const PRICING = [
  { tier:'Solo Practitioner', price:'$49',   period:'/mo', size:'1 attorney',              verifications:50,   features:['50 document verifications/mo','All 50 state law coverage','Case citation verification','PDF export & audit trail','Email support'],                                                        featured:false },
  { tier:'Small Firm',        price:'$149',  period:'/mo', size:'2–5 attorneys',           verifications:250,  features:['250 verifications/mo','Team dashboard','Priority AI research access','CourtListener real-time integration','Malpractice audit trail','Phone support'],                                 featured:false },
  { tier:'Mid Firm',          price:'$399',  period:'/mo', size:'6–20 attorneys',          verifications:1000, features:['1,000 verifications/mo','Custom practice area settings','ABA Rule 1.1 compliance reports','API access','Single sign-on (SSO)','Dedicated onboarding'],                               featured:true  },
  { tier:'Large Firm',        price:'$799',  period:'/mo', size:'21–50 attorneys',         verifications:3000, features:['3,000 verifications/mo','Multi-office dashboard','Advanced analytics & reporting','DMS integration (iManage, NetDocs)','SLA guarantee (99.9% uptime)','Dedicated account manager'],  featured:false },
  { tier:'AmLaw 200',         price:'Custom',period:'',    size:'50+ attorneys',           verifications:null, features:['Unlimited verifications','On-premise deployment option','Custom model fine-tuning','SOC 2 Type II certification','White-label portal','24/7 enterprise support'],                      featured:false },
]

// ─── Bar partnership states ────────────────────────────────────────────────────
const PARTNERSHIP_STATES = {
  CA:'active', NY:'active', TX:'active', FL:'discussions', IL:'discussions',
  PA:'discussions', OH:'discussions', GA:'discussions', WA:'discussions',
  MA:'active', NJ:'discussions', NC:'discussions', VA:'discussions',
  CO:'discussions', AZ:'discussions', MD:'discussions', MN:'discussions',
  OR:'discussions', TN:'discussions', MI:'discussions',
}

// ─── ABA rules ────────────────────────────────────────────────────────────────
const ABA_RULES = [
  { rule:'Model Rule 1.1', title:'Competence', text:'A lawyer shall provide competent representation to a client. Competent representation requires the legal knowledge, skill, thoroughness and preparation reasonably necessary for the representation.', aiRisk:'Attorneys using AI tools without verification risk violating Rule 1.1 by relying on hallucinated case law or fabricated statutes as the basis for legal advice or court filings.', trustlayerSolution:'TrustLayer\'s pre-filing audit ensures every legal citation is verified before submission, creating a documented record of competent review that satisfies Rule 1.1\'s thoroughness requirement.', states:['CA Formal Op. 2023-204','NY State Bar Op. 1240 (2024)','FL Bar Op. 24-1'] },
  { rule:'Model Rule 5.3', title:'Responsibilities Regarding Nonlawyer Assistance', text:'Partners and supervisory lawyers shall ensure that the conduct of nonlawyer assistants is compatible with the professional obligations of the lawyer.', aiRisk:'AI tools are "nonlawyer assistance" under Rule 5.3. Supervising attorneys are responsible for AI-generated output and cannot delegate professional responsibility to the model.', trustlayerSolution:'TrustLayer creates a verifiable chain of supervision: the AI drafts, TrustLayer audits, the attorney reviews the audit. This three-step process documents adequate supervision under Rule 5.3.', states:['ABA Formal Op. 512 (2023)','CA Formal Op. 2023-204','TX Prof. Ethics Comm. Op. 699'] },
  { rule:'Model Rule 3.3', title:'Candor Toward the Tribunal', text:'A lawyer shall not knowingly make a false statement of fact or law to a tribunal.', aiRisk:'Submitting AI-generated briefs with hallucinated citations violates Rule 3.3. Attorneys in Mata v. Avianca and similar cases faced sanctions precisely because fabricated case law is a knowing misrepresentation after the attorney reviews and signs the filing.', trustlayerSolution:'TrustLayer\'s audit trail demonstrates that the attorney took affirmative steps to verify every citation before filing. This is increasingly accepted as evidence of good faith compliance with Rule 3.3.', states:['Multiple state bar guidance','Implied by Mata v. Avianca outcome'] },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : String(n) }
function pct(n) { return `${n}%` }

// ─── CircuitMap component ─────────────────────────────────────────────────────
function CircuitMap({ selCircuit, setSelCircuit, selState, setSelState }) {
  const SZ = 40, GAP = 3
  return (
    <div>
      {/* Legend */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'18px' }}>
        {Object.entries(CIRCUIT_DATA).map(([num, c]) => (
          <button key={num} onClick={() => setSelCircuit(selCircuit === num ? null : num)}
            style={{
              padding:'4px 10px', borderRadius:'6px', cursor:'pointer', fontSize:'11px',
              border:`1px solid ${selCircuit === num ? c.color : C.border}`,
              background: selCircuit === num ? `${c.color}20` : 'transparent',
              color: selCircuit === num ? c.color : C.textSecondary,
              fontWeight: selCircuit === num ? '700' : '400',
              transition:'all 0.15s',
            }}>
            {c.short}
          </button>
        ))}
        {selCircuit && (
          <button onClick={() => setSelCircuit(null)} style={{
            padding:'4px 10px', borderRadius:'6px', cursor:'pointer', fontSize:'11px',
            border:`1px solid ${C.border}`, background:'transparent', color:C.textMuted,
          }}>✕ Clear</button>
        )}
      </div>

      {/* Tile grid */}
      <div style={{
        display:'grid',
        gridTemplateColumns:`repeat(12, ${SZ}px)`,
        gridTemplateRows:`repeat(8, ${SZ}px)`,
        gap:`${GAP}px`, width:'fit-content',
      }}>
        {Object.entries(TILE_GRID).map(([abbr, [col, row]]) => {
          const circuit = STATE_CIRCUITS[abbr]
          const cd = CIRCUIT_DATA[circuit]
          const color = cd?.color ?? '#666'
          const highlighted = !selCircuit || String(circuit) === String(selCircuit)
          const active = selState === abbr
          const isPartner = PARTNERSHIP_STATES[abbr]
          return (
            <button key={abbr}
              title={`${abbr} — ${cd?.name ?? ''}`}
              onClick={() => setSelState(selState === abbr ? null : abbr)}
              style={{
                gridColumn: col + 1, gridRow: row + 1,
                width:SZ, height:SZ, borderRadius:'5px',
                background: active ? color : highlighted ? `${color}28` : `${C.border}25`,
                border:`1px solid ${active ? color : highlighted ? `${color}60` : C.border}`,
                color: active ? '#0a0800' : highlighted ? color : C.textMuted,
                fontSize:'9px', fontWeight:'700', cursor:'pointer',
                transition:'all 0.15s', opacity: highlighted ? 1 : 0.25,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1px',
              }}>
              <span>{abbr}</span>
              {isPartner && <span style={{ width:'4px', height:'4px', borderRadius:'50%', background: isPartner === 'active' ? C.verified : C.caution }} />}
            </button>
          )
        })}
      </div>

      <p style={{ margin:'10px 0 0', fontSize:'10px', color:C.textMuted }}>
        <span style={{ color:C.verified }}>●</span> State bar partnership active &nbsp;
        <span style={{ color:C.caution }}>●</span> Discussions underway
      </p>
    </div>
  )
}

// ─── State detail panel ────────────────────────────────────────────────────────
function StatePanel({ abbr, onClose }) {
  const data = STATES_DATA[abbr]
  const circuit = STATE_CIRCUITS[abbr]
  const cd = CIRCUIT_DATA[circuit]
  if (!data || !cd) return null
  return (
    <div style={{
      background:C.bgCard, border:`1px solid ${cd.color}40`,
      borderRadius:'10px', padding:'22px', animation:'slideUp 0.25s ease',
      position:'sticky', top:'88px',
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
        <div>
          <div style={{
            display:'inline-block', background:`${cd.color}20`,
            border:`1px solid ${cd.color}50`, borderRadius:'6px',
            padding:'2px 8px', fontSize:'10px', color:cd.color, fontWeight:'700',
            marginBottom:'6px',
          }}>{cd.name}</div>
          <h3 style={{ margin:0, fontFamily:SERIF, fontSize:'22px', color:C.textPrimary }}>{data.name}</h3>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:C.textMuted, cursor:'pointer', fontSize:'18px' }}>✕</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
        {[
          { label:'Statutes Covered', val:data.statutes.toLocaleString() },
          { label:'Federal Circuit',  val:cd.name },
          { label:'Bar Partnership',  val: PARTNERSHIP_STATES[abbr] === 'active' ? '✓ Active' : PARTNERSHIP_STATES[abbr] ? '⟳ Discussions' : 'Not yet' },
          { label:'Accuracy Rate',    val:`${cd.accuracy}%` },
        ].map((s, i) => (
          <div key={i} style={{
            background:'rgba(255,255,255,0.02)', borderRadius:'6px',
            padding:'10px 12px', border:`1px solid ${C.border}`,
          }}>
            <div style={{ fontSize:'10px', color:C.textMuted, marginBottom:'3px', letterSpacing:'0.06em', textTransform:'uppercase' }}>{s.label}</div>
            <div style={{ fontSize:'14px', fontWeight:'700', color:C.gold }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:'14px' }}>
        <div style={{ fontSize:'10px', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'7px' }}>Common AI Hallucinations</div>
        {data.hallucinations.slice(0,3).map((h, i) => (
          <div key={i} style={{
            display:'flex', gap:'7px', alignItems:'flex-start',
            fontSize:'11px', color:C.textSecondary, padding:'4px 0',
            borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
          }}>
            <span style={{ color:C.danger, flexShrink:0, marginTop:'2px' }}>⚠</span>{h}
          </div>
        ))}
      </div>

      <div style={{ marginBottom:'14px' }}>
        <div style={{ fontSize:'10px', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'7px' }}>Recent Law Changes TrustLayer Caught</div>
        {data.recentCaught.map((r, i) => (
          <div key={i} style={{ fontSize:'11px', color:C.verified, padding:'3px 0', display:'flex', gap:'6px', alignItems:'flex-start' }}>
            <span style={{ flexShrink:0 }}>✓</span>{r}
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontSize:'10px', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'7px' }}>Notable Cases in Database</div>
        {data.cases.map((c, i) => (
          <div key={i} style={{ fontSize:'11px', color:C.textSecondary, fontFamily:MONO, padding:'3px 0' }}>• {c}</div>
        ))}
      </div>
    </div>
  )
}

// ─── Malpractice calculator ────────────────────────────────────────────────────
const CALC_RISK = { employment:0.0015, contract:0.0012, ip:0.0018, real_estate:0.0010, corporate:0.0013, criminal:0.0020, immigration:0.0016, family:0.0011 }
const CALC_STATE_MUL = { CA:1.45, NY:1.5, TX:1.25, FL:1.35, IL:1.2, PA:1.15, NJ:1.1, OH:1.05, GA:1.1, WA:1.1 }
const CALC_PLAN_COST = { solo:49, small:149, mid:399, large:799 }

function MalpracticeCalculator() {
  const [form, setForm] = useState({ state:'CA', practice:'contract', docs:40, caseValue:200000, plan:'mid' })
  const [result, setResult] = useState(null)

  function calculate() {
    const rate = CALC_RISK[form.practice] ?? 0.0012
    const mul  = CALC_STATE_MUL[form.state] ?? 1.0
    const annualExposure = form.docs * 12 * form.caseValue * rate * mul
    const withTL = annualExposure * 0.10
    const savings = annualExposure - withTL
    const planCost = CALC_PLAN_COST[form.plan] * 12
    const roi = savings / planCost
    setResult({ annualExposure, withTL, savings, planCost, roi })
  }

  const $ = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(2)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${Math.round(n)}`

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'28px', alignItems:'start' }}>
      {/* Inputs */}
      <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
        {[
          { label:'Your State', key:'state', type:'select', opts: Object.keys(CALC_STATE_MUL).map(s => ({ v:s, l:s })).concat([{v:'other',l:'Other (avg risk)'}]) },
          { label:'Primary Practice Area', key:'practice', type:'select', opts: PRACTICE_AREAS.map(p => ({ v:p.id, l:p.label })) },
          { label:'AI-Assisted Docs per Month', key:'docs', type:'number', min:1, max:2000, step:5 },
          { label:'Average Case Value ($)', key:'caseValue', type:'number', min:10000, max:50000000, step:10000 },
          { label:'TrustLayer Plan', key:'plan', type:'select', opts:[{v:'solo',l:'Solo — $49/mo'},{v:'small',l:'Small Firm — $149/mo'},{v:'mid',l:'Mid Firm — $399/mo'},{v:'large',l:'Large Firm — $799/mo'}] },
        ].map(field => (
          <div key={field.key}>
            <label style={{ display:'block', fontSize:'11px', color:C.textMuted, marginBottom:'5px', letterSpacing:'0.06em', textTransform:'uppercase' }}>
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                style={{ width:'100%', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:'7px', color:C.textPrimary, fontSize:'13px', padding:'9px 12px', outline:'none' }}>
                {field.opts.map(o => <option key={o.v} value={o.v} style={{ background:C.bgCard }}>{o.l}</option>)}
              </select>
            ) : (
              <input type="number" value={form[field.key]} min={field.min} max={field.max} step={field.step}
                onChange={e => setForm(f => ({ ...f, [field.key]: Number(e.target.value) }))}
                style={{ width:'100%', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:'7px', color:C.textPrimary, fontSize:'13px', padding:'9px 12px', outline:'none', boxSizing:'border-box' }}
              />
            )}
          </div>
        ))}
        <button onClick={calculate} style={{
          padding:'12px', borderRadius:'8px', border:'none',
          background:`linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
          color:'#0a0800', fontSize:'13px', fontWeight:'700',
          letterSpacing:'0.06em', cursor:'pointer',
          boxShadow:`0 4px 16px rgba(212,168,83,0.25)`,
        }}>Calculate My Exposure</button>
      </div>

      {/* Output */}
      <div>
        {!result ? (
          <div style={{ padding:'40px 20px', textAlign:'center', border:`1px dashed ${C.border}`, borderRadius:'10px' }}>
            <div style={{ fontSize:'32px', marginBottom:'12px', opacity:0.3 }}>⚖</div>
            <p style={{ fontSize:'13px', color:C.textMuted, margin:0 }}>Fill in your details and click Calculate to see your exposure estimate.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px', animation:'fadeIn 0.4s ease' }}>
            <div style={{ background:'rgba(239,68,68,0.08)', border:`1px solid rgba(239,68,68,0.2)`, borderRadius:'10px', padding:'18px' }}>
              <div style={{ fontSize:'10px', color:C.danger, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>Annual Exposure WITHOUT TrustLayer</div>
              <div style={{ fontSize:'28px', fontFamily:SERIF, fontWeight:'700', color:C.danger }}>{$(result.annualExposure)}</div>
              <div style={{ fontSize:'11px', color:C.textMuted, marginTop:'4px' }}>Estimated annual malpractice risk from AI hallucinations</div>
            </div>
            <div style={{ background:'rgba(34,197,94,0.08)', border:`1px solid rgba(34,197,94,0.2)`, borderRadius:'10px', padding:'18px' }}>
              <div style={{ fontSize:'10px', color:C.verified, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>Annual Exposure WITH TrustLayer</div>
              <div style={{ fontSize:'28px', fontFamily:SERIF, fontWeight:'700', color:C.verified }}>{$(result.withTL)}</div>
              <div style={{ fontSize:'11px', color:C.textMuted, marginTop:'4px' }}>90% risk reduction through pre-filing verification</div>
            </div>
            <div style={{ background:C.goldGlow2, border:`1px solid ${C.borderGold}`, borderRadius:'10px', padding:'18px' }}>
              <div style={{ fontSize:'10px', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>Annual Savings</div>
              <div style={{ fontSize:'28px', fontFamily:SERIF, fontWeight:'700', color:C.gold }}>{$(result.savings)}</div>
              <div style={{ fontSize:'11px', color:C.textSecondary, marginTop:'6px' }}>
                TrustLayer costs <strong style={{ color:C.textPrimary }}>{$(result.planCost)}/year</strong>.
                {' '}ROI: <strong style={{ color:C.gold }}>{result.roi.toFixed(0)}×</strong>
              </div>
            </div>
            <p style={{ fontSize:'10px', color:C.textMuted, margin:0, lineHeight:'1.5' }}>
              * Estimates based on industry malpractice claim frequency data and state litigation multipliers. Not legal or insurance advice. Consult your malpractice insurer.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section divider ──────────────────────────────────────────────────────────
function SealDivider({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'16px', margin:'0 0 32px' }}>
      <div style={{ flex:1, height:'1px', background:`linear-gradient(to right, transparent, ${C.borderGold})` }} />
      <div style={{
        display:'flex', alignItems:'center', gap:'8px',
        background:C.goldGlow2, border:`1px solid ${C.borderGold}`,
        borderRadius:'20px', padding:'5px 14px',
      }}>
        <span style={{ color:C.gold, fontSize:'11px' }}>⚖</span>
        <span style={{ fontSize:'10px', color:C.gold, letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:'700' }}>{label}</span>
      </div>
      <div style={{ flex:1, height:'1px', background:`linear-gradient(to left, transparent, ${C.borderGold})` }} />
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function EnterprisePage() {
  const [selCircuit, setSelCircuit] = useState(null)
  const [selState,   setSelState]   = useState(null)
  const [hallFilter, setHallFilter] = useState('all')
  const [expandedCase, setExpandedCase] = useState(null)

  const circuitInfo = selCircuit ? CIRCUIT_DATA[selCircuit] : null
  const stateInfo   = selState   ? STATES_DATA[selState]    : null

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:SANS, color:C.textPrimary }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 40px', height:'68px',
        background:'rgba(5,7,13,0.94)', backdropFilter:'blur(16px)',
        borderBottom:`1px solid ${C.border}`,
      }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'12px', textDecoration:'none' }}>
          <div style={{
            width:'36px', height:'36px', borderRadius:'8px',
            background:`linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:`0 0 16px ${C.goldGlow}`,
          }}>
            <span style={{ fontSize:'18px', fontFamily:SERIF, fontWeight:'700', color:'#0a0800' }}>T</span>
          </div>
          <span style={{ fontSize:'20px', fontFamily:SERIF, fontWeight:'700', color:C.textPrimary }}>
            Trust<span style={{ color:C.gold }}>Layer</span>
          </span>
        </Link>
        <div style={{ display:'flex', gap:'28px', alignItems:'center' }}>
          {[['/', 'Verify'], ['/research', 'Research'], ['/enterprise', 'Enterprise']].map(([href, label]) => (
            <Link key={href} href={href} style={{
              fontSize:'13px', textDecoration:'none', letterSpacing:'0.04em', transition:'color 0.2s',
              color: href === '/enterprise' ? C.gold : C.textSecondary,
              borderBottom: href === '/enterprise' ? `1px solid ${C.gold}` : 'none',
              paddingBottom: href === '/enterprise' ? '2px' : '0',
            }}
              onMouseEnter={e => e.currentTarget.style.color = C.gold}
              onMouseLeave={e => e.currentTarget.style.color = href === '/enterprise' ? C.gold : C.textSecondary}
            >{label}</Link>
          ))}
          <Link href="/request-access" style={{
            padding:'8px 20px', borderRadius:'6px',
            border:`1px solid ${C.borderGold}`, background:C.goldGlow2,
            color:C.gold, fontSize:'13px', textDecoration:'none',
            letterSpacing:'0.04em', transition:'all 0.2s', display:'inline-block',
          }}
            onMouseEnter={e => { e.currentTarget.style.background=C.goldGlow; e.currentTarget.style.borderColor=C.gold }}
            onMouseLeave={e => { e.currentTarget.style.background=C.goldGlow2; e.currentTarget.style.borderColor=C.borderGold }}
          >Request Access</Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        background:`linear-gradient(180deg, rgba(212,168,83,0.06) 0%, transparent 60%)`,
        borderBottom:`1px solid ${C.border}`,
        padding:'72px 40px 56px', textAlign:'center', position:'relative', overflow:'hidden',
      }}>
        {/* Decorative rings */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', width:'600px', height:'600px', borderRadius:'50%', border:`1px solid ${C.borderGold}`, opacity:0.3, pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', width:'800px', height:'800px', borderRadius:'50%', border:`1px solid ${C.borderGold}`, opacity:0.15, pointerEvents:'none' }} />

        <div style={{ position:'relative', maxWidth:'820px', margin:'0 auto' }}>
          {/* Seal badge */}
          <div style={{
            display:'inline-flex', flexDirection:'column', alignItems:'center',
            marginBottom:'24px',
          }}>
            <div style={{
              width:'72px', height:'72px', borderRadius:'50%',
              background:`radial-gradient(circle, ${C.goldGlow} 0%, ${C.bg} 70%)`,
              border:`2px solid ${C.gold}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:`0 0 32px ${C.goldGlow}, inset 0 0 16px ${C.goldGlow2}`,
              marginBottom:'10px',
            }}>
              <span style={{ fontSize:'30px' }}>⚖</span>
            </div>
            <div style={{
              background:C.goldGlow2, border:`1px solid ${C.borderGold}`,
              borderRadius:'20px', padding:'4px 14px',
              fontSize:'10px', color:C.gold, letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:'700',
            }}>Enterprise — US Law Firms</div>
          </div>

          <h1 style={{
            fontFamily:SERIF, fontSize:'clamp(34px, 4.5vw, 58px)', fontWeight:'700',
            lineHeight:'1.12', margin:'0 0 16px', color:C.textPrimary,
            letterSpacing:'-0.01em',
          }}>
            The Legal AI Verification Platform<br />
            <span style={{ color:C.gold }}>Built for US Courts</span>
          </h1>
          <p style={{
            fontFamily:SERIF, fontStyle:'italic', fontSize:'17px',
            color:C.textSecondary, maxWidth:'580px', margin:'0 auto 36px', lineHeight:'1.7',
          }}>
            Coverage across all 13 federal circuits, 50 state jurisdictions, and every federal agency. Not built by technologists — built by attorneys, for attorneys.
          </p>

          {/* Stats row */}
          <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', gap:'0' }}>
            {[
              { n:'1.2M+',   label:'Cases Verified' },
              { n:'50',      label:'State Jurisdictions' },
              { n:'13',      label:'Federal Circuits' },
              { n:'94',      label:'U.S. District Courts' },
              { n:'99%',     label:'SCOTUS Coverage' },
              { n:'96%',     label:'Avg Accuracy Rate' },
            ].map((s, i, arr) => (
              <div key={i} style={{
                padding:'16px 28px', textAlign:'center',
                borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{ fontFamily:SERIF, fontSize:'26px', fontWeight:'700', color:C.gold }}>{s.n}</div>
                <div style={{ fontSize:'11px', color:C.textMuted, letterSpacing:'0.06em', textTransform:'uppercase', marginTop:'2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'1240px', margin:'0 auto', padding:'52px 40px' }}>

        {/* ── Section 1: Federal Court Coverage Map ─────────────────────── */}
        <SealDivider label="Federal Court Coverage" />
        <div style={{ marginBottom:'60px' }}>
          <h2 style={{ fontFamily:SERIF, fontSize:'30px', fontWeight:'700', margin:'0 0 6px', color:C.textPrimary }}>
            Interactive Federal Circuit Map
          </h2>
          <p style={{ fontSize:'14px', color:C.textSecondary, margin:'0 0 28px', maxWidth:'640px', lineHeight:'1.6' }}>
            Click any circuit in the legend or any state tile to see verified case counts, district coverage, and state bar partnership status. Dots indicate bar partnership activity.
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'28px', alignItems:'start' }}>
            <div>
              <CircuitMap selCircuit={selCircuit} setSelCircuit={setSelCircuit} selState={selState} setSelState={setSelState} />
            </div>

            {/* Circuit / State panel */}
            <div>
              {selState && stateInfo ? (
                <StatePanel abbr={selState} onClose={() => setSelState(null)} />
              ) : selCircuit && circuitInfo ? (
                <div style={{
                  background:C.bgCard, border:`1px solid ${circuitInfo.color}40`,
                  borderRadius:'10px', padding:'22px', animation:'slideUp 0.25s ease',
                  position:'sticky', top:'88px',
                }}>
                  <div style={{
                    display:'inline-block', background:`${circuitInfo.color}20`,
                    border:`1px solid ${circuitInfo.color}50`, borderRadius:'6px',
                    padding:'2px 8px', fontSize:'10px', color:circuitInfo.color, fontWeight:'700',
                    marginBottom:'8px',
                  }}>{circuitInfo.name}</div>
                  <h3 style={{ margin:'0 0 4px', fontFamily:SERIF, fontSize:'20px', color:C.textPrimary }}>{circuitInfo.name}</h3>
                  <p style={{ margin:'0 0 16px', fontSize:'12px', color:C.textMuted }}>Seat: {circuitInfo.seat}</p>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
                    {[
                      { label:'Cases Verified',    val:circuitInfo.cases.toLocaleString() },
                      { label:'District Courts',   val:circuitInfo.districts },
                      { label:'Accuracy Rate',     val:`${circuitInfo.accuracy}%` },
                      { label:'States Covered',    val:circuitInfo.states.length },
                    ].map((s, i) => (
                      <div key={i} style={{ background:'rgba(255,255,255,0.02)', borderRadius:'6px', padding:'10px 12px', border:`1px solid ${C.border}` }}>
                        <div style={{ fontSize:'10px', color:C.textMuted, marginBottom:'2px', letterSpacing:'0.06em', textTransform:'uppercase' }}>{s.label}</div>
                        <div style={{ fontSize:'16px', fontWeight:'700', color:circuitInfo.color }}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ fontSize:'10px', color:C.gold, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>States in Circuit</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                      {circuitInfo.states.map(s => (
                        <button key={s} onClick={() => setSelState(s)} style={{
                          padding:'3px 9px', borderRadius:'4px', cursor:'pointer',
                          background:`${circuitInfo.color}15`, border:`1px solid ${circuitInfo.color}40`,
                          color:circuitInfo.color, fontSize:'11px', fontWeight:'600',
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background:C.bgCard, border:`1px dashed ${C.border}`,
                  borderRadius:'10px', padding:'32px 24px', textAlign:'center',
                }}>
                  <div style={{ fontSize:'28px', marginBottom:'10px', opacity:0.3 }}>⚖</div>
                  <p style={{ fontSize:'13px', color:C.textMuted, margin:0 }}>Click a circuit in the legend or a state tile to see coverage details.</p>
                </div>
              )}
            </div>
          </div>

          {/* Coverage stats row */}
          <div style={{
            display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'14px', marginTop:'28px',
          }}>
            {[
              { icon:'⚖', label:'Supreme Court', val:'All opinions 1950–present', sub:'5,200+ opinions' },
              { icon:'🏛', label:'Circuit Courts',val:'All 13 circuits covered',    sub:'982K+ published opinions' },
              { icon:'📋', label:'District Courts',val:'All 94 districts',          sub:'420K+ published opinions' },
              { icon:'📜', label:'State Courts',   val:'All 50 state systems',      sub:'Coverage varies by state' },
            ].map((item, i) => (
              <div key={i} style={{
                background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'8px', padding:'16px',
              }}>
                <div style={{ fontSize:'20px', marginBottom:'8px' }}>{item.icon}</div>
                <div style={{ fontSize:'12px', fontWeight:'700', color:C.textPrimary, marginBottom:'3px' }}>{item.label}</div>
                <div style={{ fontSize:'11px', color:C.gold, marginBottom:'2px' }}>{item.val}</div>
                <div style={{ fontSize:'10px', color:C.textMuted }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 2: Federal Agency Coverage ────────────────────────── */}
        <SealDivider label="Federal Agency Coverage" />
        <div style={{ marginBottom:'60px' }}>
          <h2 style={{ fontFamily:SERIF, fontSize:'30px', fontWeight:'700', margin:'0 0 6px', color:C.textPrimary }}>
            Federal Agency & Regulatory Coverage
          </h2>
          <p style={{ fontSize:'14px', color:C.textSecondary, margin:'0 0 24px', lineHeight:'1.6', maxWidth:'640px' }}>
            Every major federal regulatory body — from SEC no-action letters to EPA enforcement orders — verified and cross-referenced.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'12px' }}>
            {AGENCIES.map((ag, i) => (
              <div key={i} style={{
                background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'8px',
                padding:'16px 18px', display:'flex', gap:'14px', alignItems:'flex-start',
                transition:'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor=C.borderGold}
                onMouseLeave={e => e.currentTarget.style.borderColor=C.border}
              >
                <div style={{
                  width:'38px', height:'38px', borderRadius:'8px', flexShrink:0,
                  background:C.goldGlow, border:`1px solid ${C.borderGold}`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px',
                }}>{ag.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px', marginBottom:'3px' }}>
                    <div>
                      <span style={{ fontSize:'11px', fontWeight:'700', color:C.gold, fontFamily:MONO, marginRight:'6px' }}>{ag.abbr}</span>
                      <span style={{ fontSize:'12px', fontWeight:'600', color:C.textPrimary }}>{ag.name}</span>
                    </div>
                    <span style={{
                      fontSize:'11px', fontWeight:'700', color:C.verified, flexShrink:0,
                      background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)',
                      borderRadius:'4px', padding:'1px 6px',
                    }}>{ag.accuracy}%</span>
                  </div>
                  <p style={{ margin:'0 0 4px', fontSize:'11px', color:C.gold }}>{ag.coverage}</p>
                  <p style={{ margin:'0 0 4px', fontSize:'10px', color:C.textMuted }}>{ag.note}</p>
                  <div style={{ fontSize:'10px', color:C.textSecondary, fontFamily:MONO }}>
                    {ag.verified.toLocaleString()} documents verified
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: Practice Area Depth ────────────────────────────── */}
        <SealDivider label="Practice Area Accuracy" />
        <div style={{ marginBottom:'60px' }}>
          <h2 style={{ fontFamily:SERIF, fontSize:'30px', fontWeight:'700', margin:'0 0 6px', color:C.textPrimary }}>
            Accuracy Rates by Practice Area
          </h2>
          <p style={{ fontSize:'14px', color:C.textSecondary, margin:'0 0 24px', lineHeight:'1.6', maxWidth:'640px' }}>
            Independently measured accuracy across {PRACTICE_AREAS.reduce((sum, p) => sum + p.claims, 0).toLocaleString()} verified legal claims, updated quarterly.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'14px' }}>
            {PRACTICE_AREAS.map((pa, i) => (
              <div key={i} style={{
                background:C.bgCard, border:`1px solid ${C.border}`,
                borderRadius:'8px', padding:'18px 20px',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:'700', color:C.textPrimary }}>{pa.label}</div>
                    <div style={{ fontSize:'10px', color:C.textMuted, marginTop:'2px' }}>{pa.claims.toLocaleString()} claims verified · {pa.note}</div>
                  </div>
                  <span style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:'700', color:pa.color }}>{pa.accuracy}%</span>
                </div>
                <div style={{ height:'6px', background:C.border, borderRadius:'3px', overflow:'hidden' }}>
                  <div style={{
                    height:'100%', width:`${pa.accuracy}%`, borderRadius:'3px',
                    background:`linear-gradient(90deg, ${pa.color}80, ${pa.color})`,
                    animation:'barFill 1.2s ease both',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 4: Hallucination Database ─────────────────────────── */}
        <SealDivider label="Hallucination Database" />
        <div style={{ marginBottom:'60px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
            <div>
              <h2 style={{ fontFamily:SERIF, fontSize:'30px', fontWeight:'700', margin:'0 0 4px', color:C.textPrimary }}>
                The AI Legal Hallucination Database
              </h2>
              <p style={{ fontSize:'14px', color:C.textSecondary, margin:0, lineHeight:'1.6', maxWidth:'580px' }}>
                The most common AI hallucination patterns documented in real legal filings. Updated weekly. Bookmark this — every attorney using AI needs it.
              </p>
            </div>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {['all', ...new Set(HALLUCINATION_DB.map(h => h.area))].map(f => (
                <button key={f} onClick={() => setHallFilter(f)} style={{
                  padding:'5px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'11px',
                  border:`1px solid ${hallFilter === f ? C.borderGold : C.border}`,
                  background: hallFilter === f ? C.goldGlow2 : 'transparent',
                  color: hallFilter === f ? C.gold : C.textSecondary,
                  transition:'all 0.15s',
                }}>{f === 'all' ? 'All Areas' : f}</button>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {HALLUCINATION_DB.filter(h => hallFilter === 'all' || h.area === hallFilter).map((h, i) => (
              <div key={h.id} style={{
                background:C.bgCard, border:`1px solid ${C.border}`,
                borderRadius:'8px', padding:'18px 20px',
                animation:'slideUp 0.3s ease both',
                animationDelay:`${i * 40}ms`,
              }}>
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'10px' }}>
                  <span style={{
                    padding:'2px 7px', borderRadius:'4px', fontSize:'10px', fontWeight:'700',
                    background:'rgba(239,68,68,0.12)', color:C.danger,
                    border:'1px solid rgba(239,68,68,0.25)', flexShrink:0,
                  }}>{h.type}</span>
                  <span style={{
                    padding:'2px 7px', borderRadius:'4px', fontSize:'10px',
                    background:C.goldGlow2, color:C.gold, border:`1px solid ${C.borderGold}`, flexShrink:0,
                  }}>{h.area}</span>
                  <span style={{
                    padding:'2px 7px', borderRadius:'4px', fontSize:'10px',
                    background:'rgba(59,130,246,0.1)', color:C.blue, border:'1px solid rgba(59,130,246,0.2)', flexShrink:0,
                  }}>{h.jurisdiction}</span>
                  <span style={{
                    padding:'2px 7px', borderRadius:'4px', fontSize:'10px', marginLeft:'auto', flexShrink:0,
                    background: h.freq === 'High' ? 'rgba(239,68,68,0.1)' : h.freq === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                    color: h.freq === 'High' ? C.danger : h.freq === 'Medium' ? C.caution : C.verified,
                    border: `1px solid ${h.freq === 'High' ? 'rgba(239,68,68,0.25)' : h.freq === 'Medium' ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)'}`,
                  }}>{h.freq} frequency</span>
                </div>
                <p style={{ margin:'0 0 8px', fontSize:'12px', color:C.textSecondary, lineHeight:'1.55' }}>
                  <strong style={{ color:C.danger }}>AI Output: </strong>{h.ai}
                </p>
                <p style={{ margin:'0 0 8px', fontSize:'12px', color:C.textSecondary, lineHeight:'1.55' }}>
                  <strong style={{ color:C.verified }}>Correct: </strong>{h.correct}
                </p>
                <p style={{ margin:0, fontSize:'11px', color:C.gold }}>
                  ✓ TrustLayer detection: {h.caught}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 5: Bar Compliance ─────────────────────────────────── */}
        <SealDivider label="Bar Association Compliance" />
        <div style={{ marginBottom:'60px' }}>
          <h2 style={{ fontFamily:SERIF, fontSize:'30px', fontWeight:'700', margin:'0 0 4px', color:C.textPrimary }}>
            Professional Responsibility & AI Compliance
          </h2>
          <p style={{ fontSize:'14px', color:C.textSecondary, margin:'0 0 24px', lineHeight:'1.6', maxWidth:'640px' }}>
            TrustLayer is specifically designed to satisfy the professional responsibility obligations every US attorney faces when using AI tools. Here is exactly how.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginBottom:'28px' }}>
            {ABA_RULES.map((rule, i) => (
              <div key={i} style={{
                background:C.bgCard, border:`1px solid ${C.border}`,
                borderRadius:'10px', overflow:'hidden',
              }}>
                <div style={{
                  display:'flex', gap:'16px', padding:'20px 22px',
                  borderBottom:`1px solid ${C.border}`,
                  background:`linear-gradient(90deg, ${C.goldGlow2}, transparent)`,
                }}>
                  <div style={{
                    width:'56px', height:'56px', borderRadius:'8px', flexShrink:0,
                    background:C.goldGlow, border:`1px solid ${C.borderGold}`,
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  }}>
                    <span style={{ fontSize:'9px', color:C.gold, letterSpacing:'0.06em', textTransform:'uppercase' }}>ABA</span>
                    <span style={{ fontSize:'12px', fontWeight:'700', color:C.gold }}>{rule.rule.replace('Model Rule ','')}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:'12px', color:C.gold, fontWeight:'700', marginBottom:'2px' }}>{rule.rule}</div>
                    <div style={{ fontSize:'16px', fontWeight:'700', color:C.textPrimary, fontFamily:SERIF, marginBottom:'4px' }}>{rule.title}</div>
                    <p style={{ margin:0, fontSize:'12px', color:C.textSecondary, lineHeight:'1.5', fontStyle:'italic' }}>"{rule.text}"</p>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0' }}>
                  <div style={{ padding:'16px 22px', borderRight:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:'10px', color:C.danger, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>⚠ AI Risk</div>
                    <p style={{ margin:0, fontSize:'12px', color:C.textSecondary, lineHeight:'1.55' }}>{rule.aiRisk}</p>
                  </div>
                  <div style={{ padding:'16px 22px' }}>
                    <div style={{ fontSize:'10px', color:C.verified, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>✓ TrustLayer Solution</div>
                    <p style={{ margin:'0 0 10px', fontSize:'12px', color:C.textSecondary, lineHeight:'1.55' }}>{rule.trustlayerSolution}</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                      {rule.states.map((s, j) => (
                        <span key={j} style={{
                          fontSize:'10px', padding:'2px 7px', borderRadius:'4px',
                          background:'rgba(34,197,94,0.08)', color:C.verified,
                          border:'1px solid rgba(34,197,94,0.2)',
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* State bar ethics opinions */}
          <div style={{
            background:C.bgCard, border:`1px solid ${C.borderGold}`,
            borderRadius:'10px', padding:'22px',
          }}>
            <h3 style={{ fontFamily:SERIF, fontSize:'18px', margin:'0 0 16px', color:C.gold }}>
              State Bar Ethics Opinions on AI Use
            </h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'14px' }}>
              {[
                { bar:'California State Bar', op:'Formal Opinion 2023-204', key:'Attorneys must supervise AI output; cannot delegate review to AI. Competence requires understanding AI limitations.', color:'#f472b6' },
                { bar:'New York State Bar', op:'Ethics Opinion 1240 (2024)', key:'Use of AI is permissible but requires review. Client confidentiality applies to prompts sent to AI systems. Fee considerations apply.', color:'#c084fc' },
                { bar:'Florida Bar', op:'Ethics Opinion 24-1 (2024)', key:'AI-generated work product must be reviewed by a competent attorney. Disclosure to clients may be required. Billing for AI time governed by Rule 4-1.5.', color:'#60a5fa' },
                { bar:'Texas Professional Ethics Committee', op:'Opinion 699 (2023)', key:'AI tools constitute "assistance from others" under Rule 5.03. Supervising attorney responsible for AI output. Cannot bill as attorney time without review.', color:'#fb923c' },
              ].map((b, i) => (
                <div key={i} style={{
                  padding:'14px 16px', borderRadius:'8px',
                  background:'rgba(255,255,255,0.02)', border:`1px solid ${b.color}30`,
                }}>
                  <div style={{ fontSize:'11px', fontWeight:'700', color:b.color, marginBottom:'3px' }}>{b.bar}</div>
                  <div style={{ fontSize:'11px', color:C.textSecondary, fontFamily:MONO, marginBottom:'6px' }}>{b.op}</div>
                  <p style={{ margin:0, fontSize:'11px', color:C.textMuted, lineHeight:'1.5' }}>{b.key}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 6: Court Cases / Sanctions ───────────────────────── */}
        <SealDivider label="AI Sanctions — Real Cases" />
        <div style={{ marginBottom:'60px' }}>
          <h2 style={{ fontFamily:SERIF, fontSize:'30px', fontWeight:'700', margin:'0 0 4px', color:C.textPrimary }}>
            When AI Hallucinations Reached Federal Courts
          </h2>
          <p style={{ fontSize:'14px', color:C.textSecondary, margin:'0 0 28px', lineHeight:'1.6', maxWidth:'640px' }}>
            These are not hypotheticals. These are documented cases where AI-generated hallucinations caused real professional consequences — and how TrustLayer would have prevented each one.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {SANCTION_CASES.map((sc, i) => (
              <div key={sc.id} style={{
                background:C.bgCard, border:`1px solid ${sc.color}35`,
                borderRadius:'10px', overflow:'hidden',
              }}>
                {/* Header */}
                <div style={{
                  padding:'18px 22px', background:`${sc.color}08`,
                  borderBottom:`1px solid ${sc.color}25`,
                  display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px',
                }}>
                  <div>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap', marginBottom:'6px' }}>
                      <span style={{
                        padding:'2px 8px', borderRadius:'4px', fontSize:'10px', fontWeight:'700',
                        background:`${sc.color}15`, color:sc.color, border:`1px solid ${sc.color}35`,
                      }}>⚠ AI Sanction</span>
                      <span style={{ fontSize:'11px', color:C.textMuted, fontFamily:MONO }}>{sc.citation}</span>
                    </div>
                    <h3 style={{ margin:'0 0 3px', fontFamily:SERIF, fontSize:'18px', color:C.textPrimary, fontWeight:'700' }}>{sc.name}</h3>
                    <div style={{ fontSize:'12px', color:C.textSecondary }}>{sc.court} · {sc.judge}</div>
                  </div>
                  <div style={{
                    background:`${sc.color}12`, border:`1px solid ${sc.color}30`,
                    borderRadius:'8px', padding:'8px 12px', textAlign:'center', flexShrink:0,
                  }}>
                    <div style={{ fontSize:'10px', color:sc.color, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:'2px' }}>Sanction</div>
                    <div style={{ fontSize:'12px', fontWeight:'700', color:sc.color }}>{sc.sanction}</div>
                  </div>
                </div>

                <div style={{ padding:'18px 22px' }}>
                  <p style={{ margin:'0 0 14px', fontSize:'13px', color:C.textSecondary, lineHeight:'1.65' }}>{sc.summary}</p>

                  <button onClick={() => setExpandedCase(expandedCase === sc.id ? null : sc.id)} style={{
                    background:'none', border:`1px solid ${C.border}`, borderRadius:'6px',
                    color:C.textSecondary, fontSize:'11px', cursor:'pointer', padding:'6px 12px',
                    marginBottom: expandedCase === sc.id ? '14px' : '0',
                    transition:'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=C.borderGold; e.currentTarget.style.color=C.gold }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary }}
                  >
                    {expandedCase === sc.id ? '▲ Collapse' : '▼ See fake citations + how TrustLayer catches this'}
                  </button>

                  {expandedCase === sc.id && (
                    <div style={{ animation:'slideUp 0.2s ease' }}>
                      <div style={{ marginBottom:'14px' }}>
                        <div style={{ fontSize:'10px', color:C.danger, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'7px' }}>Hallucinated Citations</div>
                        {sc.fakeCitations.map((fc, j) => (
                          <div key={j} style={{
                            display:'flex', gap:'7px', alignItems:'flex-start',
                            fontSize:'12px', color:C.textMuted, padding:'5px 0',
                            borderBottom: j < sc.fakeCitations.length-1 ? `1px solid ${C.border}` : 'none',
                            fontFamily:MONO,
                          }}>
                            <span style={{ color:C.danger, flexShrink:0 }}>✗</span>{fc}
                          </div>
                        ))}
                      </div>
                      <div style={{
                        background:'rgba(34,197,94,0.06)', border:`1px solid rgba(34,197,94,0.2)`,
                        borderRadius:'8px', padding:'14px 16px',
                      }}>
                        <div style={{ fontSize:'10px', color:C.verified, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'7px' }}>✓ How TrustLayer Would Have Caught This</div>
                        <p style={{ margin:0, fontSize:'12px', color:C.textSecondary, lineHeight:'1.65' }}>{sc.howTrustLayerCatches}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 7: Malpractice Calculator ───────────────────────── */}
        <SealDivider label="Malpractice Exposure Calculator" />
        <div style={{ marginBottom:'60px' }}>
          <h2 style={{ fontFamily:SERIF, fontSize:'30px', fontWeight:'700', margin:'0 0 4px', color:C.textPrimary }}>
            Your AI Malpractice Exposure Calculator
          </h2>
          <p style={{ fontSize:'14px', color:C.textSecondary, margin:'0 0 24px', lineHeight:'1.6', maxWidth:'640px' }}>
            Input your firm's profile to see your estimated annual malpractice exposure from AI hallucinations — and the ROI of TrustLayer as a protective layer.
          </p>
          <div style={{
            background:C.bgCard, border:`1px solid ${C.border}`,
            borderRadius:'12px', padding:'28px 32px',
          }}>
            <MalpracticeCalculator />
          </div>
        </div>

        {/* ── Section 8: Pricing ────────────────────────────────────────── */}
        <SealDivider label="Firm Size Pricing" />
        <div style={{ marginBottom:'60px' }}>
          <h2 style={{ fontFamily:SERIF, fontSize:'30px', fontWeight:'700', margin:'0 0 4px', color:C.textPrimary, textAlign:'center' }}>
            Pricing for Every Firm Size
          </h2>
          <p style={{ fontSize:'14px', color:C.textSecondary, margin:'0 auto 28px', lineHeight:'1.6', maxWidth:'520px', textAlign:'center' }}>
            From solo practitioners to AmLaw 200 firms. No per-verification fees. No hidden costs.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'12px' }}>
            {PRICING.map((tier, i) => (
              <div key={i} style={{
                background: tier.featured ? `linear-gradient(160deg, ${C.goldGlow} 0%, ${C.bgCard} 100%)` : C.bgCard,
                border:`1px solid ${tier.featured ? C.gold : C.border}`,
                borderRadius:'10px', padding:'22px 18px',
                position:'relative', overflow:'hidden',
              }}>
                {tier.featured && (
                  <div style={{
                    position:'absolute', top:'10px', right:'10px',
                    background:C.gold, color:'#0a0800', fontSize:'9px',
                    fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase',
                    padding:'2px 7px', borderRadius:'4px',
                  }}>Most Popular</div>
                )}
                <div style={{ fontSize:'11px', color:tier.featured ? C.gold : C.textMuted, fontWeight:'600', marginBottom:'6px' }}>{tier.tier}</div>
                <div style={{ fontFamily:SERIF, fontSize:'28px', fontWeight:'700', color:tier.featured ? C.gold : C.textPrimary, lineHeight:1 }}>
                  {tier.price}<span style={{ fontSize:'13px', fontWeight:'400', color:C.textMuted }}>{tier.period}</span>
                </div>
                <div style={{ fontSize:'11px', color:C.textMuted, margin:'4px 0 14px' }}>{tier.size}</div>

                <div style={{ marginBottom:'18px' }}>
                  {tier.features.map((f, j) => (
                    <div key={j} style={{
                      display:'flex', gap:'6px', alignItems:'flex-start',
                      fontSize:'11px', color:C.textSecondary, padding:'4px 0',
                      borderBottom: j < tier.features.length-1 ? `1px solid ${C.border}` : 'none',
                    }}>
                      <span style={{ color:tier.featured ? C.gold : C.verified, fontSize:'9px', marginTop:'3px', flexShrink:0 }}>✦</span>
                      {f}
                    </div>
                  ))}
                </div>

                <Link href="/request-access" style={{
                  display:'block', textAlign:'center', padding:'10px',
                  borderRadius:'6px', textDecoration:'none', fontSize:'12px', fontWeight:'700',
                  letterSpacing:'0.05em', transition:'all 0.2s',
                  background: tier.featured ? `linear-gradient(135deg, ${C.gold}, ${C.goldDim})` : 'transparent',
                  border: tier.featured ? 'none' : `1px solid ${C.border}`,
                  color: tier.featured ? '#0a0800' : C.textSecondary,
                  boxSizing:'border-box',
                }}
                  onMouseEnter={e => { if (!tier.featured) { e.currentTarget.style.borderColor=C.borderGold; e.currentTarget.style.color=C.gold } }}
                  onMouseLeave={e => { if (!tier.featured) { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary } }}
                >
                  {tier.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 9: State Bar Partnership ────────────────────────── */}
        <SealDivider label="State Bar Partnerships" />
        <div style={{ marginBottom:'60px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'32px', alignItems:'start' }}>
            <div>
              <h2 style={{ fontFamily:SERIF, fontSize:'30px', fontWeight:'700', margin:'0 0 6px', color:C.textPrimary }}>
                State Bar Partnership Program
              </h2>
              <p style={{ fontSize:'14px', color:C.textSecondary, margin:'0 0 20px', lineHeight:'1.6' }}>
                TrustLayer is actively partnering with state bar associations to provide member discounts, CLE-eligible training on AI verification, and official guidance on ABA Rule 1.1 compliance.
              </p>
              <p style={{ fontSize:'13px', color:C.textSecondary, margin:'0 0 20px', lineHeight:'1.6' }}>
                Attorneys who are bar members in <strong style={{ color:C.gold }}>active partnership states</strong> receive 20% discounts. Attorneys in <strong style={{ color:C.caution }}>discussion states</strong> can join the waitlist for priority access when their bar partnership activates.
              </p>
              <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ width:'10px', height:'10px', borderRadius:'50%', background:C.verified, display:'inline-block' }} />
                  <span style={{ fontSize:'12px', color:C.textSecondary }}>Active partnership — member discount available</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ width:'10px', height:'10px', borderRadius:'50%', background:C.caution, display:'inline-block' }} />
                  <span style={{ fontSize:'12px', color:C.textSecondary }}>Discussions underway — join waitlist</span>
                </div>
              </div>

              <div style={{ marginTop:'24px' }}>
                <CircuitMap selCircuit={null} setSelCircuit={() => {}} selState={selState} setSelState={setSelState} />
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div style={{
                background:C.bgCard, border:`1px solid ${C.verified}30`,
                borderRadius:'10px', padding:'18px',
              }}>
                <div style={{ fontSize:'11px', color:C.verified, fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'10px' }}>
                  ● Active Partnerships
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
                  {Object.entries(PARTNERSHIP_STATES).filter(([,v]) => v === 'active').map(([s]) => (
                    <span key={s} style={{
                      padding:'3px 9px', borderRadius:'4px', fontSize:'11px', fontWeight:'600',
                      background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)',
                      color:C.verified,
                    }}>{s}</span>
                  ))}
                </div>
              </div>

              <div style={{
                background:C.bgCard, border:`1px solid ${C.caution}30`,
                borderRadius:'10px', padding:'18px',
              }}>
                <div style={{ fontSize:'11px', color:C.caution, fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'10px' }}>
                  ⟳ Discussions Underway
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
                  {Object.entries(PARTNERSHIP_STATES).filter(([,v]) => v === 'discussions').map(([s]) => (
                    <span key={s} style={{
                      padding:'3px 9px', borderRadius:'4px', fontSize:'11px', fontWeight:'600',
                      background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)',
                      color:C.caution,
                    }}>{s}</span>
                  ))}
                </div>
              </div>

              <div style={{
                background:C.bgCard, border:`1px solid ${C.border}`,
                borderRadius:'10px', padding:'18px',
              }}>
                <h4 style={{ fontFamily:SERIF, fontSize:'15px', margin:'0 0 10px', color:C.textPrimary }}>Partnership Benefits</h4>
                {['20% member discount on all plans','CLE-eligible AI verification training','Official ethics opinion guidance documents','Joint webinar series: AI & Professional Responsibility','Co-branded compliance materials for member attorneys'].map((b, i) => (
                  <div key={i} style={{ display:'flex', gap:'7px', fontSize:'12px', color:C.textSecondary, padding:'5px 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ color:C.gold, flexShrink:0 }}>✦</span>{b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Final CTA ─────────────────────────────────────────────────── */}
        <div style={{
          textAlign:'center', padding:'60px 40px',
          background:`radial-gradient(ellipse at center, ${C.goldGlow} 0%, transparent 70%)`,
          border:`1px solid ${C.borderGold}`, borderRadius:'16px',
          marginBottom:'40px', position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', width:'400px', height:'400px', borderRadius:'50%', border:`1px solid ${C.borderGold}`, opacity:0.3, pointerEvents:'none' }} />
          <div style={{ position:'relative' }}>
            <div style={{
              width:'60px', height:'60px', borderRadius:'50%',
              background:C.goldGlow, border:`1px solid ${C.gold}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 18px', fontSize:'24px',
            }}>⚖</div>
            <h2 style={{ fontFamily:SERIF, fontSize:'34px', fontWeight:'700', margin:'0 0 12px', color:C.textPrimary }}>
              Ready to Protect Your Practice?
            </h2>
            <p style={{ fontSize:'15px', color:C.textSecondary, margin:'0 auto 28px', maxWidth:'480px', lineHeight:'1.65', fontFamily:SERIF, fontStyle:'italic' }}>
              Join over 340 law firms already using TrustLayer to satisfy ABA Rule 1.1, protect against malpractice, and file with confidence.
            </p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/request-access" style={{
                padding:'14px 32px', borderRadius:'8px', border:'none',
                background:`linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                color:'#0a0800', fontSize:'14px', fontWeight:'700',
                letterSpacing:'0.06em', textDecoration:'none', display:'inline-block',
                boxShadow:`0 4px 24px rgba(212,168,83,0.3)`,
              }}>Request Enterprise Access</Link>
              <Link href="/" style={{
                padding:'14px 32px', borderRadius:'8px',
                border:`1px solid ${C.border}`,
                background:'transparent', color:C.textSecondary,
                fontSize:'14px', textDecoration:'none', display:'inline-block',
                transition:'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=C.borderGold; e.currentTarget.style.color=C.gold }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSecondary }}
              >Try the Verifier Free</Link>
            </div>
          </div>
        </div>

      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        padding:'24px 40px', borderTop:`1px solid ${C.border}`,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        flexWrap:'wrap', gap:'12px',
      }}>
        <span style={{ fontFamily:SERIF, fontSize:'15px', fontWeight:'700', color:C.textPrimary }}>
          Trust<span style={{ color:C.gold }}>Layer</span>
        </span>
        <p style={{ fontSize:'11px', color:C.textMuted, margin:0 }}>
          © 2026 TrustLayer Inc. · This page is for informational purposes only. Not legal or malpractice insurance advice.
        </p>
        <div style={{ display:'flex', gap:'20px' }}>
          {[['/', 'Verify'], ['/research', 'Research'], ['/request-access', 'Request Access']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontSize:'12px', color:C.textMuted, textDecoration:'none', transition:'color 0.2s' }}
              onMouseEnter={e => e.target.style.color=C.gold}
              onMouseLeave={e => e.target.style.color=C.textMuted}
            >{label}</Link>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes barFill { from { width: 0%; } to { width: var(--target-width, 100%); } }
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; }
        select option { background: #0a0d1a; color: #e8e0d0; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        ::-webkit-scrollbar { width: 7px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>
    </div>
  )
}

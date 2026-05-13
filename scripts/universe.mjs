// Hand-curated ~600-ticker universe across nine categories.
// To refresh S&P 500 constituents (changes ~25 names/year):
//   https://en.wikipedia.org/wiki/List_of_S%26P_500_companies
// Yahoo expects dashes (BRK-B, BF-B) where the symbol has a class designator.

// --- S&P 500 constituents (snapshot, 503 entries) ---------------------
// `stock` category. Names are looked up from Yahoo at fetch time.
const SP500 = [
  'MMM','AOS','ABT','ABBV','ACN','ADBE','AMD','AES','AFL','A',
  'APD','ABNB','AKAM','ALB','ARE','ALGN','ALLE','LNT','ALL','GOOGL',
  'GOOG','MO','AMZN','AMCR','AEE','AEP','AXP','AIG','AMT','AWK',
  'AMP','AME','AMGN','APH','ADI','AON','APA','APO','AAPL','AMAT',
  'APP','APTV','ACGL','ADM','ARES','ANET','AJG','AIZ','T','ATO',
  'ADSK','ADP','AZO','AVB','AVY','AXON','BKR','BALL','BAC','BAX',
  'BDX','BRK-B','BBY','TECH','BIIB','BLK','BX','XYZ','BK','BA',
  'BKNG','BSX','BMY','AVGO','BR','BRO','BF-B','BLDR','BG','BXP',
  'CHRW','CDNS','CPT','CPB','COF','CAH','CCL','CARR','CVNA','CASY',
  'CAT','CBOE','CBRE','CDW','COR','CNC','CNP','CF','CRL','SCHW',
  'CHTR','CVX','CMG','CB','CHD','CIEN','CI','CINF','CTAS','CSCO',
  'C','CFG','CLX','CME','CMS','KO','CTSH','COHR','COIN','CL',
  'CMCSA','FIX','CAG','COP','ED','STZ','CEG','COO','CPRT','GLW',
  'CPAY','CTVA','CSGP','COST','CRH','CRWD','CCI','CSX','CMI','CVS',
  'DHR','DRI','DDOG','DVA','DECK','DE','DELL','DAL','DVN','DXCM',
  'FANG','DLR','DG','DLTR','D','DPZ','DASH','DOV','DOW','DHI',
  'DTE','DUK','DD','ETN','EBAY','SATS','ECL','EIX','EW','EA',
  'ELV','EME','EMR','ETR','EOG','EPAM','EQT','EFX','EQIX','EQR',
  'ERIE','ESS','EL','EG','EVRG','ES','EXC','EXE','EXPE','EXPD',
  'EXR','XOM','FFIV','FDS','FICO','FAST','FRT','FDX','FIS','FITB',
  'FSLR','FE','FISV','F','FTNT','FTV','FOXA','FOX','BEN','FCX',
  'GRMN','IT','GE','GEHC','GEV','GEN','GNRC','GD','GIS','GM',
  'GPC','GILD','GPN','GL','GDDY','GS','HAL','HIG','HAS','HCA',
  'DOC','HSIC','HSY','HPE','HLT','HD','HON','HRL','HST','HWM',
  'HPQ','HUBB','HUM','HBAN','HII','IBM','IEX','IDXX','ITW','INCY',
  'IR','PODD','INTC','IBKR','ICE','IFF','IP','INTU','ISRG','IVZ',
  'INVH','IQV','IRM','JBHT','JBL','JKHY','J','JNJ','JCI','JPM',
  'KVUE','KDP','KEY','KEYS','KMB','KIM','KMI','KKR','KLAC','KHC',
  'KR','LHX','LH','LRCX','LVS','LDOS','LEN','LII','LLY','LIN',
  'LYV','LMT','L','LOW','LULU','LITE','LYB','MTB','MPC','MAR',
  'MRSH','MLM','MAS','MA','MKC','MCD','MCK','MDT','MRK','META',
  'MET','MTD','MGM','MCHP','MU','MSFT','MAA','MRNA','TAP','MDLZ',
  'MPWR','MNST','MCO','MS','MOS','MSI','MSCI','NDAQ','NTAP','NFLX',
  'NEM','NWSA','NWS','NEE','NKE','NI','NDSN','NSC','NTRS','NOC',
  'NCLH','NRG','NUE','NVDA','NVR','NXPI','ORLY','OXY','ODFL','OMC',
  'ON','OKE','ORCL','OTIS','PCAR','PKG','PLTR','PANW','PSKY','PH',
  'PAYX','PYPL','PNR','PEP','PFE','PCG','PM','PSX','PNW','PNC',
  'POOL','PPG','PPL','PFG','PG','PGR','PLD','PRU','PEG','PTC',
  'PSA','PHM','PWR','QCOM','DGX','Q','RL','RJF','RTX','O',
  'REG','REGN','RF','RSG','RMD','RVTY','HOOD','ROK','ROL','ROP',
  'ROST','RCL','SPGI','CRM','SNDK','SBAC','SLB','STX','SRE','NOW',
  'SHW','SPG','SWKS','SJM','SW','SNA','SOLV','SO','LUV','SWK',
  'SBUX','STT','STLD','STE','SYK','SMCI','SYF','SNPS','SYY','TMUS',
  'TROW','TTWO','TPR','TRGP','TGT','TEL','TDY','TER','TSLA','TXN',
  'TPL','TXT','TMO','TJX','TKO','TTD','TSCO','TT','TDG','TRV',
  'TRMB','TFC','TYL','TSN','USB','UBER','UDR','ULTA','UNP','UAL',
  'UPS','URI','UNH','UHS','VLO','VEEV','VTR','VLTO','VRSN','VRSK',
  'VZ','VRTX','VRT','VTRS','VICI','V','VST','VMC','WRB','GWW',
  'WAB','WMT','DIS','WBD','WM','WAT','WEC','WFC','WELL','WST',
  'WDC','WY','WSM','WMB','WTW','WDAY','WYNN','XEL','XYL','YUM',
  'ZBRA','ZBH','ZTS',
]

// --- Notable non-S&P stocks worth including ---------------------------
const STOCKS_EXTRA = [
  'TSM', 'ASML', 'NVO', 'SAP', 'BABA', 'JD', 'PDD', 'TM', 'SNY',
  'AZN', 'NVS', 'HSBC', 'UL', 'BTI', 'RIO', 'BHP', 'SHEL', 'BP',
  'RBLX', 'SOFI', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI',
  'O', 'MAIN', 'AGNC', 'NLY', 'STAG', 'BXMT',
  'MSTR', 'GBTC', 'IBIT',
  'SMCI', 'ARM', 'CRWV',
  'PANW', 'NET', 'OKTA', 'TEAM', 'ZS', 'MDB', 'SNOW',
]

// --- Broad-market ETFs ------------------------------------------------
const ETF_BROAD = [
  { symbol: 'SPY',  name: 'SPDR S&P 500 ETF' },
  { symbol: 'IVV',  name: 'iShares Core S&P 500 ETF' },
  { symbol: 'VOO',  name: 'Vanguard S&P 500 ETF' },
  { symbol: 'VTI',  name: 'Vanguard Total Stock Market ETF' },
  { symbol: 'QQQ',  name: 'Invesco QQQ Trust' },
  { symbol: 'DIA',  name: 'SPDR Dow Jones Industrial Average ETF' },
  { symbol: 'IWM',  name: 'iShares Russell 2000 ETF' },
  { symbol: 'MDY',  name: 'SPDR S&P MidCap 400 ETF' },
  { symbol: 'IJH',  name: 'iShares Core S&P Mid-Cap ETF' },
  { symbol: 'IJR',  name: 'iShares Core S&P Small-Cap ETF' },
  { symbol: 'OEF',  name: 'iShares S&P 100 ETF' },
  { symbol: 'XLG',  name: 'Invesco Top 50 ETF' },
  { symbol: 'SCHB', name: 'Schwab U.S. Broad Market ETF' },
  { symbol: 'VT',   name: 'Vanguard Total World Stock ETF' },
  { symbol: 'ACWI', name: 'iShares MSCI ACWI ETF' },
]

// --- Sector ETFs ------------------------------------------------------
const ETF_SECTOR = [
  { symbol: 'XLK',  name: 'Technology Select Sector SPDR' },
  { symbol: 'VGT',  name: 'Vanguard Information Technology ETF' },
  { symbol: 'XLV',  name: 'Health Care Select Sector SPDR' },
  { symbol: 'XLF',  name: 'Financial Select Sector SPDR' },
  { symbol: 'XLE',  name: 'Energy Select Sector SPDR' },
  { symbol: 'XLI',  name: 'Industrial Select Sector SPDR' },
  { symbol: 'XLY',  name: 'Consumer Discretionary Select Sector SPDR' },
  { symbol: 'XLP',  name: 'Consumer Staples Select Sector SPDR' },
  { symbol: 'XLC',  name: 'Communication Services Select Sector SPDR' },
  { symbol: 'XLU',  name: 'Utilities Select Sector SPDR' },
  { symbol: 'XLB',  name: 'Materials Select Sector SPDR' },
  { symbol: 'XLRE', name: 'Real Estate Select Sector SPDR' },
  { symbol: 'SOXX', name: 'iShares Semiconductor ETF' },
  { symbol: 'SMH',  name: 'VanEck Semiconductor ETF' },
  { symbol: 'IBB',  name: 'iShares Biotechnology ETF' },
  { symbol: 'IGV',  name: 'iShares Expanded Tech-Software Sector ETF' },
  { symbol: 'KRE',  name: 'SPDR S&P Regional Banking ETF' },
  { symbol: 'KBE',  name: 'SPDR S&P Bank ETF' },
  { symbol: 'XME',  name: 'SPDR S&P Metals & Mining ETF' },
  { symbol: 'XOP',  name: 'SPDR S&P Oil & Gas Exploration & Production ETF' },
  { symbol: 'ITB',  name: 'iShares U.S. Home Construction ETF' },
  { symbol: 'IYR',  name: 'iShares U.S. Real Estate ETF' },
  { symbol: 'VNQ',  name: 'Vanguard Real Estate ETF' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF' },
]

// --- Factor / style ETFs ---------------------------------------------
// Includes the iShares MSCI single-factor suite, Russell style splits,
// Vanguard size-and-style grid, the Avantis (AVUV et al.) and Dimensional
// (DFAC/DFSV) families that systematic-factor investors actually buy,
// and a handful of dividend / quality / cash-flow funds.
const ETF_FACTOR = [
  // iShares MSCI single-factor
  { symbol: 'MTUM', name: 'iShares MSCI USA Momentum Factor ETF' },
  { symbol: 'QUAL', name: 'iShares MSCI USA Quality Factor ETF' },
  { symbol: 'VLUE', name: 'iShares MSCI USA Value Factor ETF' },
  { symbol: 'USMV', name: 'iShares MSCI USA Min Vol Factor ETF' },
  { symbol: 'SIZE', name: 'iShares MSCI USA Size Factor ETF' },
  { symbol: 'ACWV', name: 'iShares MSCI Global Min Vol Factor ETF' },
  // Russell style splits
  { symbol: 'IWD',  name: 'iShares Russell 1000 Value ETF' },
  { symbol: 'IWF',  name: 'iShares Russell 1000 Growth ETF' },
  { symbol: 'IWN',  name: 'iShares Russell 2000 Value ETF' },
  { symbol: 'IWO',  name: 'iShares Russell 2000 Growth ETF' },
  // S&P 500 style splits
  { symbol: 'IVW',  name: 'iShares S&P 500 Growth ETF' },
  { symbol: 'IVE',  name: 'iShares S&P 500 Value ETF' },
  { symbol: 'SPYG', name: 'SPDR S&P 500 Growth ETF' },
  { symbol: 'SPYV', name: 'SPDR S&P 500 Value ETF' },
  { symbol: 'VOOG', name: 'Vanguard S&P 500 Growth ETF' },
  { symbol: 'VOOV', name: 'Vanguard S&P 500 Value ETF' },
  { symbol: 'RPG',  name: 'Invesco S&P 500 Pure Growth ETF' },
  { symbol: 'RPV',  name: 'Invesco S&P 500 Pure Value ETF' },
  { symbol: 'SPHQ', name: 'Invesco S&P 500 Quality ETF' },
  // Vanguard size + style grid
  { symbol: 'MGK',  name: 'Vanguard Mega Cap Growth ETF' },
  { symbol: 'MGV',  name: 'Vanguard Mega Cap Value ETF' },
  { symbol: 'VTV',  name: 'Vanguard Value ETF' },
  { symbol: 'VUG',  name: 'Vanguard Growth ETF' },
  { symbol: 'VOE',  name: 'Vanguard Mid-Cap Value ETF' },
  { symbol: 'VOT',  name: 'Vanguard Mid-Cap Growth ETF' },
  { symbol: 'VBR',  name: 'Vanguard Small-Cap Value ETF' },
  { symbol: 'VBK',  name: 'Vanguard Small-Cap Growth ETF' },
  // Dividend / cash-flow / quality
  { symbol: 'SCHD', name: 'Schwab U.S. Dividend Equity ETF' },
  { symbol: 'VIG',  name: 'Vanguard Dividend Appreciation ETF' },
  { symbol: 'VYM',  name: 'Vanguard High Dividend Yield ETF' },
  { symbol: 'DGRO', name: 'iShares Core Dividend Growth ETF' },
  { symbol: 'NOBL', name: 'ProShares S&P 500 Dividend Aristocrats ETF' },
  { symbol: 'SDY',  name: 'SPDR S&P Dividend ETF' },
  { symbol: 'COWZ', name: 'Pacer US Cash Cows 100 ETF' },
  { symbol: 'PRF',  name: 'Invesco FTSE RAFI US 1000 ETF' },
  // Avantis systematic-factor family
  { symbol: 'AVUV', name: 'Avantis U.S. Small Cap Value ETF' },
  { symbol: 'AVUS', name: 'Avantis U.S. Equity ETF' },
  { symbol: 'AVLV', name: 'Avantis U.S. Large Cap Value ETF' },
  { symbol: 'AVSC', name: 'Avantis Responsible U.S. Small Cap Equity ETF' },
  { symbol: 'AVDE', name: 'Avantis International Equity ETF' },
  { symbol: 'AVDV', name: 'Avantis International Small Cap Value ETF' },
  { symbol: 'AVIV', name: 'Avantis International Large Cap Value ETF' },
  { symbol: 'AVEM', name: 'Avantis Emerging Markets Equity ETF' },
  { symbol: 'AVES', name: 'Avantis Emerging Markets Value ETF' },
  { symbol: 'AVRE', name: 'Avantis Real Estate ETF' },
  // Dimensional ETF suite (factor-tilt OG)
  { symbol: 'DFAC', name: 'Dimensional U.S. Core Equity 2 ETF' },
  { symbol: 'DFUS', name: 'Dimensional U.S. Equity ETF' },
  { symbol: 'DFAS', name: 'Dimensional U.S. Small Cap ETF' },
  { symbol: 'DFAT', name: 'Dimensional U.S. Targeted Value ETF' },
  { symbol: 'DFLV', name: 'Dimensional U.S. Large Cap Value ETF' },
  { symbol: 'DFSV', name: 'Dimensional U.S. Small Cap Value ETF' },
  { symbol: 'DFIV', name: 'Dimensional International Value ETF' },
  { symbol: 'DFIS', name: 'Dimensional International Small Cap ETF' },
  { symbol: 'DFEM', name: 'Dimensional Emerging Markets Core Equity 2 ETF' },
]

// --- Country / regional ETFs -----------------------------------------
const ETF_COUNTRY = [
  { symbol: 'EWJ',  name: 'iShares MSCI Japan ETF' },
  { symbol: 'EWG',  name: 'iShares MSCI Germany ETF' },
  { symbol: 'EWU',  name: 'iShares MSCI United Kingdom ETF' },
  { symbol: 'INDA', name: 'iShares MSCI India ETF' },
  { symbol: 'MCHI', name: 'iShares MSCI China ETF' },
  { symbol: 'FXI',  name: 'iShares China Large-Cap ETF' },
  { symbol: 'EWZ',  name: 'iShares MSCI Brazil ETF' },
  { symbol: 'EEM',  name: 'iShares MSCI Emerging Markets ETF' },
  { symbol: 'VWO',  name: 'Vanguard FTSE Emerging Markets ETF' },
  { symbol: 'ILF',  name: 'iShares Latin America 40 ETF' },
  { symbol: 'EWY',  name: 'iShares MSCI South Korea ETF' },
  { symbol: 'EWT',  name: 'iShares MSCI Taiwan ETF' },
  { symbol: 'EWA',  name: 'iShares MSCI Australia ETF' },
  { symbol: 'EWC',  name: 'iShares MSCI Canada ETF' },
  { symbol: 'EWH',  name: 'iShares MSCI Hong Kong ETF' },
  { symbol: 'EWS',  name: 'iShares MSCI Singapore ETF' },
  { symbol: 'EWM',  name: 'iShares MSCI Malaysia ETF' },
  { symbol: 'EZA',  name: 'iShares MSCI South Africa ETF' },
  { symbol: 'EWQ',  name: 'iShares MSCI France ETF' },
  { symbol: 'EWI',  name: 'iShares MSCI Italy ETF' },
  { symbol: 'EWL',  name: 'iShares MSCI Switzerland ETF' },
  { symbol: 'EWP',  name: 'iShares MSCI Spain ETF' },
  { symbol: 'EWN',  name: 'iShares MSCI Netherlands ETF' },
  { symbol: 'EWD',  name: 'iShares MSCI Sweden ETF' },
  { symbol: 'IDX',  name: 'VanEck Indonesia Index ETF' },
  { symbol: 'EFA',  name: 'iShares MSCI EAFE ETF' },
  { symbol: 'VEA',  name: 'Vanguard FTSE Developed Markets ETF' },
  { symbol: 'EFV',  name: 'iShares MSCI EAFE Value ETF' },
]

// --- Bond ETFs -------------------------------------------------------
const ETF_BOND = [
  { symbol: 'BND',  name: 'Vanguard Total Bond Market ETF' },
  { symbol: 'AGG',  name: 'iShares Core U.S. Aggregate Bond ETF' },
  { symbol: 'TLT',  name: 'iShares 20+ Year Treasury Bond ETF' },
  { symbol: 'IEF',  name: 'iShares 7-10 Year Treasury Bond ETF' },
  { symbol: 'SHY',  name: 'iShares 1-3 Year Treasury Bond ETF' },
  { symbol: 'GOVT', name: 'iShares U.S. Treasury Bond ETF' },
  { symbol: 'HYG',  name: 'iShares iBoxx $ High Yield Corporate Bond ETF' },
  { symbol: 'JNK',  name: 'SPDR Bloomberg High Yield Bond ETF' },
  { symbol: 'LQD',  name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF' },
  { symbol: 'MUB',  name: 'iShares National Muni Bond ETF' },
  { symbol: 'TIP',  name: 'iShares TIPS Bond ETF' },
  { symbol: 'VTEB', name: 'Vanguard Tax-Exempt Bond ETF' },
  { symbol: 'BIV',  name: 'Vanguard Intermediate-Term Bond ETF' },
  { symbol: 'EMB',  name: 'iShares J.P. Morgan USD Emerging Markets Bond ETF' },
  { symbol: 'MBB',  name: 'iShares MBS ETF' },
  { symbol: 'BNDX', name: 'Vanguard Total International Bond ETF' },
  { symbol: 'BIL',  name: 'SPDR Bloomberg 1-3 Month T-Bill ETF' },
]

// --- Commodity ETFs --------------------------------------------------
const ETF_COMMODITY = [
  { symbol: 'GLD',  name: 'SPDR Gold Shares' },
  { symbol: 'IAU',  name: 'iShares Gold Trust' },
  { symbol: 'SLV',  name: 'iShares Silver Trust' },
  { symbol: 'SIVR', name: 'abrdn Physical Silver Shares ETF' },
  { symbol: 'USO',  name: 'United States Oil Fund' },
  { symbol: 'UNG',  name: 'United States Natural Gas Fund' },
  { symbol: 'DBC',  name: 'Invesco DB Commodity Index Tracking Fund' },
  { symbol: 'PDBC', name: 'Invesco Optimum Yield Diversified Commodity Strategy' },
  { symbol: 'DBA',  name: 'Invesco DB Agriculture Fund' },
  { symbol: 'PALL', name: 'abrdn Physical Palladium Shares ETF' },
  { symbol: 'PPLT', name: 'abrdn Physical Platinum Shares ETF' },
  { symbol: 'COPX', name: 'Global X Copper Miners ETF' },
  { symbol: 'URA',  name: 'Global X Uranium ETF' },
]

// --- Direct commodities (Yahoo continuous-contract futures) ----------
const COMMODITIES_DIRECT = [
  { symbol: 'GC=F', name: 'Gold (continuous)' },
  { symbol: 'SI=F', name: 'Silver (continuous)' },
  { symbol: 'CL=F', name: 'Crude Oil WTI (continuous)' },
  { symbol: 'NG=F', name: 'Natural Gas (continuous)' },
  { symbol: 'HG=F', name: 'Copper (continuous)' },
]

// --- Crypto ----------------------------------------------------------
const CRYPTO = [
  { symbol: 'BTC-USD', name: 'Bitcoin (USD)' },
  { symbol: 'ETH-USD', name: 'Ethereum (USD)' },
  { symbol: 'SOL-USD', name: 'Solana (USD)' },
  { symbol: 'LTC-USD', name: 'Litecoin (USD)' },
  { symbol: 'BCH-USD', name: 'Bitcoin Cash (USD)' },
  { symbol: 'DOGE-USD', name: 'Dogecoin (USD)' },
  { symbol: 'XRP-USD', name: 'XRP (USD)' },
  { symbol: 'ADA-USD', name: 'Cardano (USD)' },
]

function buildUniverse() {
  const seen = new Set()
  const out = []
  function push(symbol, name, category) {
    const sym = symbol.toUpperCase()
    if (seen.has(sym)) return
    seen.add(sym)
    out.push({ symbol: sym, name: name || null, category })
  }
  for (const s of SP500)              push(s, null, 'stock')
  for (const s of STOCKS_EXTRA)       push(s, null, 'stock')
  for (const e of ETF_BROAD)          push(e.symbol, e.name, 'etf-broad')
  for (const e of ETF_SECTOR)         push(e.symbol, e.name, 'etf-sector')
  for (const e of ETF_FACTOR)         push(e.symbol, e.name, 'etf-factor')
  for (const e of ETF_COUNTRY)        push(e.symbol, e.name, 'etf-country')
  for (const e of ETF_BOND)           push(e.symbol, e.name, 'etf-bond')
  for (const e of ETF_COMMODITY)      push(e.symbol, e.name, 'etf-commodity')
  for (const e of COMMODITIES_DIRECT) push(e.symbol, e.name, 'commodity')
  for (const e of CRYPTO)             push(e.symbol, e.name, 'crypto')
  return out
}

export const UNIVERSE = buildUniverse()

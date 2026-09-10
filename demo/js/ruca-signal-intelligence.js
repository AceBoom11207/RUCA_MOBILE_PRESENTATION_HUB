(function installRucaSignalIntelligence(root, factory){
  const api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  if(root) root.RUCASignalIntelligence = Object.freeze(api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function createRucaSignalIntelligence(){
  'use strict';

  const EVIDENCE_LABELS = Object.freeze([
    'POSSIBLE DRIVER',
    'RELATED SIGNAL',
    'CORRELATION OBSERVED',
    'CAUSE NOT VERIFIED'
  ]);

  const SYMBOL_PATTERNS = Object.freeze({
    NVDA:/\bnvidia\b|\bnvda\b/i,
    AMD:/\bamd\b|advanced micro devices/i,
    MSFT:/\bmicrosoft\b|\bmsft\b/i,
    AAPL:/\bapple\b|\baapl\b|iphone|macbook/i,
    'BTC-USD':/\bbitcoin\b|\bbtc\b|crypto/i,
    'ETH-USD':/\bethereum\b|\beth\b|crypto/i,
    TLT:/treasury|bond yields?|interest rates?|federal reserve|\bfed\b/i,
    UUP:/\bdollar\b|currency|foreign exchange|federal reserve|\bfed\b/i,
    GLD:/\bgold\b|precious metals?|inflation/i,
    USO:/\boil\b|crude|opec|petroleum|energy prices?/i
  });

  function finite(value){
    if(value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function statusOf(source={}){
    const value = String(source.status || source.state || source.source_status || '').toUpperCase().replace(/_/g, ' ');
    if(value === 'LIVE') return 'LIVE';
    if(value === 'PARTIAL') return 'PARTIAL';
    if(value === 'STALE') return 'STALE';
    if(value === 'OFFLINE') return 'OFFLINE';
    return 'UNAVAILABLE';
  }

  function itemsOf(source={}){
    if(Array.isArray(source.items)) return source.items.filter(Boolean);
    if(Array.isArray(source.symbols)) return source.symbols.filter(Boolean);
    return [];
  }

  function headlineText(item={}){
    return `${item.title || ''} ${item.summary || ''}`.trim();
  }

  function marketChange(item={}){
    return finite(item.changePercent ?? item.change_percent);
  }

  function relationship(symbol, market, headline, channel, labels){
    const change = marketChange(market);
    const movement = change === null ? 'movement not supplied' : `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    return {
      id:`${String(symbol).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${channel.toLowerCase()}`,
      symbol,
      market_change_percent:change,
      headline:String(headline.title || 'Verified headline'),
      source:String(headline.source || channel),
      url:String(headline.url || ''),
      channel,
      evidence_label:labels[0],
      relationship_label:labels[1],
      cause_label:'CAUSE NOT VERIFIED',
      labels:[...labels,'CAUSE NOT VERIFIED'],
      statement:`${symbol} ${movement} and the verified ${channel.toLowerCase()} headline share a named topic in the same refresh window.`,
      reason:'Timing, mechanism, and causality were not established by the available sources.',
      cause_verified:false
    };
  }

  function buildCorrelations(markets={}, technology={}, world={}){
    const marketItems = itemsOf(markets);
    const techItems = itemsOf(technology);
    const worldItems = itemsOf(world);
    const correlations = [];

    for(const market of marketItems){
      const symbol = String(market.symbol || market.title || '').toUpperCase();
      if(marketChange(market) === null) continue;
      const pattern = SYMBOL_PATTERNS[symbol];
      if(!pattern) continue;
      const techMatch = techItems.find(item=>pattern.test(headlineText(item)));
      const worldMatch = worldItems.find(item=>pattern.test(headlineText(item)));
      const match = techMatch || worldMatch;
      if(!match) continue;
      const channel = techMatch ? 'TECHNOLOGY' : 'WORLD';
      correlations.push(relationship(symbol, market, match, channel, ['POSSIBLE DRIVER','CORRELATION OBSERVED']));
      if(correlations.length >= 3) break;
    }

    if(!correlations.length){
      const moving = marketItems
        .filter(item=>marketChange(item) !== null)
        .sort((left,right)=>Math.abs(marketChange(right))-Math.abs(marketChange(left)))[0];
      const headline = techItems[0] || worldItems[0];
      if(moving && headline){
        correlations.push(relationship(
          String(moving.symbol || moving.title || 'MARKET').toUpperCase(),
          moving,
          headline,
          techItems[0] ? 'TECHNOLOGY' : 'WORLD',
          ['RELATED SIGNAL','RELATED SIGNAL']
        ));
      }
    }
    return correlations;
  }

  function aggregateStatus(values){
    if(values.every(value=>value === 'LIVE')) return 'LIVE';
    if(values.some(value=>value === 'LIVE' || value === 'PARTIAL')) return 'PARTIAL';
    if(values.some(value=>value === 'STALE')) return 'STALE';
    if(values.some(value=>value === 'OFFLINE')) return 'OFFLINE';
    return 'UNAVAILABLE';
  }

  function fuseSignalData({markets={}, technology={}, world={}}={}){
    const correlations = buildCorrelations(markets, technology, world);
    const channels = {
      market:{state:statusOf(markets), count:itemsOf(markets).length, data:markets},
      technology:{state:statusOf(technology), count:itemsOf(technology).length, data:technology},
      world:{state:statusOf(world), count:itemsOf(world).length, data:world},
      correlations:{state:correlations.length ? 'PARTIAL' : 'UNAVAILABLE', count:correlations.length, items:correlations}
    };
    return {
      schema_version:'RUCA_PASS26C_SIGNAL_INTELLIGENCE_V1',
      state:aggregateStatus([channels.market.state,channels.technology.state,channels.world.state]),
      channels,
      correlations,
      evidence_labels:EVIDENCE_LABELS,
      cause_verified:false
    };
  }

  return {EVIDENCE_LABELS, buildCorrelations, fuseSignalData, statusOf};
});

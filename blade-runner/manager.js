fs = require('fs');
const SMA = require('technicalindicators').SMA;
const pairsArray = ['DSHBTC', 'XMRBTC', 'ETHBTC'];

var pairs = {};

const maPeriods = 20;

function Manager(){

  for(pair of pairsArray){
    pairs[pair]={
      ma: new SMA({period : maPeriods, values :[]}),
      maValue: 0
    }
    console.log(pairs[pair]);
  }
}


Manager.prototype.runBot = function(){
  var marketData = {};
  for(pair of pairsArray){
    marketData[pair] = JSON.parse(fs.readFileSync(__dirname+'/datasets/BFX_'+pair+'_1m.json', 'utf8'));
  }
  for( pair in marketData){
    for(candle of marketData[pair]){
      calculateMA(pair, candle[2])
    }
  }
}
function calculateMA(pair, close){
  pairs[pair]['maValue'] = pairs[pair]['ma'].nextValue(close);
  //console.log(pair, pairs[pair]['maValue']);
}

module.exports = Manager;

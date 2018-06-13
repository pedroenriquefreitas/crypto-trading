fs = require('fs');
const SMA = require('technicalindicators').SMA;
const pairsArray = ['ETHBTC'];
const BFXTrade = require('./BfxTrade');

var bfx = new BFXTrade();

var pairs = {};

const maPeriods = 20;

var openedPositions = 0;
var success = 0;
var loss = 0;

function Manager(){

  for(pair of pairsArray){
    pairs[pair]={
      ma: new SMA({period : maPeriods, values :[]}),
      maValue: 0,
      prevMaValue: 0,
      prevClose: 0,
      long: false,
      short: false,
      stopLossPrice: 0,
      entryAmount: 0,
      entryPrice: 0
    }
  }
}


Manager.prototype.runBot = function(){
  var marketData = {};
  for(pair of pairsArray){
    marketData[pair] = JSON.parse(fs.readFileSync(__dirname+'/datasets/BFX_'+pair+'_1m.json', 'utf8'));
  }

for(i=0; i<marketData[pairsArray[0]].length; i++){
  for(pair in marketData){
    calculateMA(pair, marketData[pair][i][2])
  }
}

//  for( pair in marketData){
//    for(candle of marketData[pair]){
//      calculateMA(pair, candle[2])
//    }
//  }
}
function calculateMA(pair, close){
  pairs[pair]['maValue'] = pairs[pair]['ma'].nextValue(close);

  findTradeOpportunity(pair, close);
  pairs[pair]['prevMaValue'] = pairs[pair]['maValue'];
  pairs[pair]['prevClose'] = close;

}

function findTradeOpportunity(pair, close){
  if(!pairs[pair]['long'] && !pairs[pair]['short']){
    if(pairs[pair]['prevClose'] < pairs[pair]['prevMaValue'] &&
      close > pairs[pair]['maValue']){
      openLongPosition(pair, close);
    }else if(pairs[pair]['prevClose'] > pairs[pair]['prevMaValue'] &&
      close < pairs[pair]['maValue']){
      openShortPosition(pair, close);
    }
  }else if(pairs[pair]['long']){
    if(close < pairs[pair]['maValue'] &&
        close > pairs[pair]['entryPrice'] * 1.004){
      success++;
      closeLongPosition(pair, close);
    }else if(close < pairs[pair]['stopLossPrice']){
      loss++;
      closeLongPosition(pair, pairs[pair]['stopLossPrice']);
    }

  }else if(pairs[pair]['short']){
    if(close > pairs[pair]['maValue'] &&
        close < pairs[pair]['entryPrice'] * 0.996){
      success++;
      closeShortPosition(pair, close);
    }else if(close > pairs[pair]['stopLossPrice']){
      loss++;
      closeShortPosition(pair, pairs[pair]['stopLossPrice']);
    }
  }
}

function openLongPosition(pair, close){
  pairs[pair]['stopLossPrice'] = close * 0.98;
  pairs[pair]['entryAmount'] = getPositionSize(close);
  bfx.testTrade(pair, close, pairs[pair]['entryAmount'], 'buy', 'long', function(){
    pairs[pair]['long'] = true;
    pairs[pair]['entryPrice'] = close;
    openedPositions++;
    console.log(pair, ' Opened long position at ', close, ' amount', pairs[pair]['entryAmount']);
    console.log(pair, ' Stop loss price ', pairs[pair]['stopLossPrice']);
    console.log(pair, ' Opened positions ', openedPositions);
    console.log('-----------------------------------------------------');
  });
}

function openShortPosition(pair, close){
  pairs[pair]['stopLossPrice'] = close * 1.02;
  pairs[pair]['entryAmount'] = getPositionSize(close);
  bfx.testTrade(pair, close, pairs[pair]['entryAmount'], 'sell', 'short', function(){
    pairs[pair]['short'] = true;
    pairs[pair]['entryPrice'] = close;
    openedPositions++;
    console.log(pair, ' Opened short position at ', close, ' amount', pairs[pair]['entryAmount']);
    console.log(pair, ' Stop loss price ', pairs[pair]['stopLossPrice']);
    console.log(pair, ' Opened positions ', openedPositions);
    console.log('-----------------------------------------------------');
  });
}

function closeLongPosition(pair, close){
  bfx.testTrade(pair, close, pairs[pair]['entryAmount'], 'sell', 'long', function(){
    console.log(pair, ' Closed long position at ', close, ' amount', pairs[pair]['entryAmount']);
    console.log(pair, ' Result amount ', bfx.initAmount);
    console.log(pair, ' Success ', success, ' Loss ', loss);
    console.log('-----------------------------------------------------');
    pairs[pair]['stopLossPrice'] = 0;
    pairs[pair]['entryAmount'] = 0;
    pairs[pair]['entryPrice'] = 0;
    pairs[pair]['long'] = false;
    openedPositions--;
  });
}

function closeShortPosition(pair, close){
  bfx.testTrade(pair, close, pairs[pair]['entryAmount'], 'buy', 'short', function(){
    console.log(pair, ' Closed short position at ', close, ' amount', pairs[pair]['entryAmount']);
    console.log(pair, ' Result amount ', bfx.initAmount);
    console.log(pair, ' Success ', success, ' Loss ', loss);
    console.log('-----------------------------------------------------');
    pairs[pair]['stopLossPrice'] = 0;
    pairs[pair]['entryAmount'] = 0;
    pairs[pair]['entryPrice'] = 0;
    pairs[pair]['short'] = false;
    openedPositions--;
  });
}

function getPositionSize(close){
  return (bfx.initAmount/(pairsArray.length - openedPositions))/close;
}
module.exports = Manager;

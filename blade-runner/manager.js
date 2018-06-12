fs = require('fs');
const SMA = require('technicalindicators').SMA;
const pairsArray = ['ETHBTC'];

var pairs = {};

const maPeriods = 20;

function Manager(){

  for(pair of pairsArray){
    pairs[pair]={
      ma: new SMA({period : maPeriods, values :[]}),
      maValue: 0,
      prevMaValue: 0,
      prevClose: 0,
      long: false,
      short: false,
      stopLossPrice: 0
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
    if(close < pairs[pair]['maValue']){
      closeLongPosition(pair, close);
    }else if(close < pairs[pair]['stopLossPrice']){
      closeLongPosition(pair, close);
    }

  }else if(pairs[pair]['short']){
    if(close > pairs[pair]['maValue']){
      closeShortPosition(pair, close);
    }else if(close > pairs[pair]['stopLossPrice']){
      closeShortPosition(pair, close);
    }
  }
}

function openLongPosition(pair, close){
  pairs[pair]['stopLossPrice'] = close * 0.98;
  pairs[pair]['long'] = true;
  console.log(pair, ' Opened long position at ', close);
  console.log(pair, ' Stop loss price ', pairs[pair]['stopLossPrice']);
  console.log('-----------------------------------------------------');
}

function openShortPosition(pair, close){
  pairs[pair]['stopLossPrice'] = close * 1.02;
  pairs[pair]['short'] = true;
  console.log(pair, ' Opened short position at ', close);
  console.log(pair, ' Stop loss price ', pairs[pair]['stopLossPrice']);
  console.log('-----------------------------------------------------');
}

function closeLongPosition(pair, close){
  pairs[pair]['stopLossPrice'] = 0;
  pairs[pair]['long'] = false;
  console.log(pair, ' Closed long position at ', close);
  console.log('-----------------------------------------------------');
}

function closeShortPosition(pair, close){
  pairs[pair]['stopLossPrice'] = 0;
  pairs[pair]['short'] = false;
  console.log(pair, ' Closed short position at ', close);
  console.log('-----------------------------------------------------');
}

module.exports = Manager;

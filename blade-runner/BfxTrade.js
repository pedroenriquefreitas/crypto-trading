function BfxTrade(){
  this.initAmount = 100;
  this.reserve = {};
}

BfxTrade.prototype.testTrade = function(pair, price, amount, type, action, callback){
  switch(type){
    case 'buy':
      if(action == 'long'){
        this.initAmount -= 1.002 * price * amount;
      }else{
        this.initAmount += 0.998 * (2 * this.reserve[pair] - price * amount);
      }
      return callback();
    case 'sell':
      if(action == 'long'){
        this.initAmount += 0.998 * price * amount;
      }else{
        this.reserve[pair] = price * amount;
        this.initAmount -= 1.002 * this.reserve[pair];
      }
      return callback();
  }
}
module.exports = BfxTrade;

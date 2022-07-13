










var wax;
// const rpcEndpointList = ['https://api.wax.alohaeos.com/',
//                      'https://api.waxsweden.org', 
//                      'https://wax.pink.gg', 
//                      "https://wax.greymass.com", 
//                      'https://wax.cryptolions.io', 
//                      'https://chain.wax.io',
//                       'http://api.hivebp.io',
//                       'http://wax.eosphere.io']


async function login() {
  try {

    //const sRPC = rpcEndpointList[Math.floor(Math.random() * rpcEndpointList.length)]
    
    // wax = new waxjs.WaxJS({
    //   rpcEndpoint:"https://wax.greymass.com",
    //   userAccount: '4r1fy.wam',
    //   pubKeys: ['PUB_K1_8YLU9GiZ9dQ5SVtgvoNTbGt5MreQza6qqLfCpAggq3TRrhpFna'],
    // });
    wax = new waxjs.WaxJS({
      rpcEndpoint: "https://wax.greymass.com",
      tryAutoLogin: true,
      waxSigningURL: "https://all-access.wax.io",
      waxAutoSigningURL: "https://api-idm.wax.io/v1/accounts/auto-accept/"
    });
    const userAccount = await wax.login();
    if(userAccount == '4r1fy.wam'){
      console.log("LOGIN SUCCESS!",userAccount);
      console.log(wax)
      //getOrderHistory();
     }
    
  }
  catch(e) {
    console.log('error: ', e)
  }
}

async function getCurrentMessage() {
  const res = await wax.rpc.get_table_rows({
      json: true,
      code: 'test.wax',
      scope: 'test.wax',
      table: 'messages',
      lower_bound: wax.userAccount,
      upper_bound: wax.userAccount,
  });
  const message = res.rows[0] ? res.rows[0].message : `<No message is set for ${wax.userAccount}>`;
  console.log('current', message)
}

async function getUsage(){
  const get_account = await getAccount('4r1fy.wam');
  // try{
    console.log(get_account);
  //   get_account = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://api.waxsweden.org/v2/state/get_account?account='+wax.userAccount)}`)
  //                 .then(response => response.json());
  //   get_account = JSON.parse(get_account.contents);
  // }
  // catch{
  //   get_account = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('http://wax.eosphere.io/v2/state/get_account?account='+wax.userAccount)}`)
  //                 .then(response => response.json());
  //   get_account = JSON.parse(get_account.contents);
  // }
  const cpuUsage = Math.floor(100*get_account.cpu_limit.used/get_account.cpu_limit.max);
  const waxInWallet = get_account.core_liquid_balance.split(" ")[0];
  const waxInCPU = get_account.total_resources.cpu_weight;
  console.log(cpuUsage)
  console.log(waxInWallet)
  console.log(waxInCPU)

}
async function getAccount(accName='4r1fy.wam'){
  try {
    result = await wax.api.rpc.get_account(accName);
  } catch(e) {
    console.log("ERROR FOR: get_account");
    if (e.message == "Failed to fetch")
    {
      await getAccount(accName);
    }
  }
  return result;
}

async function getOrderHistory(market_id) {
  let deals = await fetch("https://wax.alcor.exchange/api/account/4r1fy.wam/deals");
  deals = await deals.json();
  console.log('history',deals[0]);
  get_spread(424,deals[0]);

}
// const count = 10;
// const timerMain = new TaskTimer(1000);
// timerMain.add([
//     {
//         //id: 'FarmingTales',       // unique ID of the task
//         // tickDelay: 1,       // 1 tick delay before first run
//         tickInterval: 10,   // run every 10 ticks (10 x interval = 10000 ms)
//         totalRuns: 0,       // run 2 times only. (set to 0 for unlimited times)
//         callback(task) {
//             // timerlogin.reset();
//             console.log(`${task.id} task has run ${task.currentRuns} times.`);
//         }
//     },
// ]);
//timerMain.start()
async function get_personal_buyorders() {
  try {
    const buy_orders = await getTableRows("alcordexmain", "account",wax.userAccount);
    return buy_orders;
  }catch (error) {
         console.log("Error in get_personal_buyorders: " + error);
  }
  return false;
}

async function get_buyorders(market_id) {
  try {
    const buy_orders = await getTableRows_byIndex("alcordexmain", "buyorder",'', market_id, '2', 'i128');
    return buy_orders;
  }catch (error) {
         console.log("Error in get_buyorders: " + error);
  }
  return false;
}

async function get_sellorders(market_id) {
  try {
    const buy_orders = await getTableRows_byIndex("alcordexmain", "sellorder",'', market_id, '2', 'i128');
    return buy_orders;
  }catch (error) {
         console.log("Error in get_sellorders: " + error);
  }
  return false;
}

function precise(x) {
  return x.toPrecision(5);
}

function precise_six(x) {
  return x.toPrecision(6);
}

async function get_spread_perc(buy_price,sell_price,side) {
  
  const spread = precise(((sell_price - buy_price)/sell_price) * 100);
  console.log('Spread: ', spread);
  //console.log('buy_amount: ', precise_six(1.01 / buy_price + buy_price*0.0000001) );
  if (spread > 0.1){
    if(side == "sellmatch"){
      place_limit_order(buy_price);
    }else if(side == "buymatch"){
      place_limit_order_sell(buy_price);
    }
    
  }
  return spread;
}


async function set_buy_sell(buy_p,sell_p,side) {
  let buy_price;
  let sell_price;
  buy_price = buy_p;
  sell_price = sell_p;
  console.log('Highest Bid: ' + precise(buy_price));
  console.log('Lowest Ask: ' + precise(sell_price));
  get_spread_perc(buy_price,sell_price,side)
}


async function get_spread(market_id,last_order) {
  let buy_price;
  let sell_price;
  let buy_orders;
  let sell_orders;
  const buy = await get_buyorders(market_id).then((responseJSON) => {
    // do stuff with responseJSON here...
    let bid = responseJSON[0].bid;
    let ask = responseJSON[0].ask;
    console.log(bid)
    console.log(ask)
    bid = bid.split(' ')[0]
    ask = ask.split(' ')[0]
    buy_price = bid / ask ;
    //console.log('Amount: ' + responseJSON[0].ask);
  });

  const sell = await get_sellorders(market_id).then((responseJSON) => {
    // do stuff with responseJSON here...
    let bid = responseJSON[0].bid;
    let ask = responseJSON[0].ask;
    bid = bid.split(' ')[0]
    ask = ask.split(' ')[0]
    sell_price = ask / bid ;
    //console.log('Amount: ' + responseJSON[0].ask);

  });
  const pers_buy = await get_personal_buyorders().then((responseJSON) => {
    // do stuff with responseJSON here...
    console.log(responseJSON['buyorders'])
    buy_orders = responseJSON['buyorders'].length;
    sell_orders = responseJSON['sellorders'].length;


  });
    if ((buy_price != undefined && sell_price != undefined) && (buy_orders == 0 && sell_orders == 0)){
    //console.log(buy_price)
    //console.log(sell_price)
    if(last_order.type =="buymatch"){
      set_buy_sell(buy_price,sell_price,buy);
    }
    
    }
}

async function place_limit_order(highest_bid){
  // Place buy limit order
  const buy_amount = precise_six((1.01 / highest_bid + highest_bid*0.000001))
  console.log('buy_price', precise_six(highest_bid + highest_bid*0.000001))
  console.log('buy_amount ',buy_amount)
  let config = {
    actions: [{
    account: 'eosio.token', // token contract
    name: 'transfer',
    authorization: [{
      actor: wax.userAccount, // account placing order (owner)
      permission: 'active',
    }],
    data: {
      from: wax.userAccount,
      to: 'alcordexmain',
      quantity: `1.01000000 WAX`,
      memo: `${buy_amount} BRWL@brawlertoken`
    },
  }]
};
  // Result of transaction
  console.log('config',config)
  let did_sign = await sign(config);
  //console.log('did_sign',did_sign)
  if (did_sign == true){
    console.log('Transaction signed');
  }else{
    console.log('Transaction failed');
  }
    try {
      
    }catch (e) {
      console.log('\nCaught exception: ' + e);
      if (e instanceof RpcError)
        console.log(JSON.stringify(e.json, null, 2));
    }
  
}

async function place_limit_order_sell(lowest_ask){
  // Place buy limit order
  const sell_amount = precise_six((1.01 / lowest_ask - lowest_ask*0.000001))
  console.log('sell_price', precise_six(lowest_ask - lowest_ask*0.000001))
  console.log('sell_amount ',sell_amount)
  let config = {
    actions: [{
    account: 'brawlertoken', // token contract
    name: 'transfer',
    authorization: [{
      actor: wax.userAccount, // account placing order (owner)
      permission: 'active',
    }],
    data: {
      from: wax.userAccount,
      to: 'alcordexmain',
      quantity: `1.0100 BRWL`,
      memo: `${sell_amount} 1.76000000 WAX@eosio.token`
    },
  }]
};
  // Result of transaction
  console.log('config',config)
  let did_sign = await sign(config);
  //console.log('did_sign',did_sign)
  if (did_sign == true){
    console.log('Transaction signed');
  }else{
    console.log('Transaction failed');
  }
    try {
      
    }catch (e) {
      console.log('\nCaught exception: ' + e);
      if (e instanceof RpcError)
        console.log(JSON.stringify(e.json, null, 2));
    }
  
}

async function sign(configTranscat) {
  if(!wax.api) {
    console.log('Not logged in')
  }
  console.log('logged in')
  
  try {
    const result = await wax.api.transact(configTranscat, {
      blocksBehind: 3,
      expireSeconds: 1200
    });
    console.log('Transaction Result: ', result);
    return true;
  } catch(e) {
    console.log('FAIL',e)
    return e;
  }
}

////////////////////INIT////////////////


login();











//Subscribe to deals
//socket.emit('subscribe', { room: 'deals', params: { chain: 'wax', market: 26 } })

// Unsubscribe from deals (will unsubscribe from all markets)
//socket.emit('unsubscribe', { room: 'deals', params: { chain: 'wax' } })

//Subscribe to buy orderbook of 26 (TLM on wax) market.
// socket.emit('subscribe', { room: 'orderbook', params: { chain: 'wax', market: 26, side: 'buy' } })
// socket.emit('subscribe', { room: 'orderbook', params: { chain: 'wax', market: 26, side: 'sell' } })

//console.log(socket);


// Unsubscribe from orderbook (all, buy and sell)
//socket.emit('unsubscribe', { room: 'orderbook', params: { chain: 'wax', market: 26 } })

// Subscribe to account updates
//socket.emit('subscribe', { room: 'account', params: { chain: 'wax', 'name': 'avra.pro' } })


// Listen for updates

// On account new match
//socket.on('match', match => { ... })

// On orderbook update (bid for example)
// socket.on('orderbook_buy', function (room) {
//   console.log(room);
//   console.log(room.data);
// });
// socket.on('connection', (socket) => {
//   console.log('client connected');
//   socket.on('orderbook_buy', bids => {
//     console.log(bids);
//   })

//   socket.on('orderbook_sell', asks => {
//     console.log(asks);
//   })
//   //On new deals of market
//   socket.on('new_deals', deals => { console.log(deals.data.toString()) })
// })
// socket.onmessage = function (event) {
//   console.log(event.data);
// }

async function getTableRows_byIndex(code, tableName, bound, scope, index, key_type){
  if (typeof(code) != "string" || 
      typeof(bound) != "string" || 
      typeof(tableName) != "string" || 
      typeof(index) != "string" || 
      typeof(key_type) != "string") {
    return false;
  }
  let result;
  try {
    result = await wax.api.rpc.get_table_rows({
      json: true,               // Get the response as json
      code: code,      // Contract that we target
      scope: scope,         // Account that owns the data
      table: tableName, 
      limit: 100,       // Table name
      index_position: index,
      key_type: key_type,
      lower_bound: bound,
      upper_bound: bound,
      reverse: false,           // Optional: Get reversed data
  });
  //console.log('RESULT',result)
  } catch(e) {
    console.log("ERROR FOR: " + code + ", " + tableName + ", " + bound + ", " + scope);
    console.log(e);
  }
  return result.rows;
}

async function getTableRows(code, tableName, bound, limit=1){
  if (typeof(code) != "string" || 
      typeof(bound) != "string" || 
      typeof(tableName) != "string") {
    return false;
  }
  let result;
  try {
    result = await wax.api.rpc.get_table_rows({
      json: true,               // Get the response as json
      code: code,      // Contract that we target
      scope: code,         // Account that owns the data
      table: tableName,        // Table name
      lower_bound: bound,
      upper_bound: bound,
      limit: limit,                // Maximum number of rows that we want to get
      reverse: false,           // Optional: Get reversed data
      show_payer: false          // Optional: Show ram payer
  });
  } catch(e) {
    console.log("ERROR FOR: " + code + ", " + tableName + ", " + bound);
  }
  return result.rows[0];
}

async function getTableAll(code, tableName, limit=100){
  let result;
  try {
    result = await wax.api.rpc.get_table_rows({
    json: true,               // Get the response as json
    code: code,      // Contract that we target
    scope: code,         // Account that owns the data
    table: tableName,        // Table name
    lower_bound: "",
    upper_bound: "",
    limit: limit,                // Maximum number of rows that we want to get
    reverse: false,           // Optional: Get reversed data
    show_payer: false          // Optional: Show ram payer
  });
  } catch(e) {
    console.log("ERROR FOR: " + code + ", " + tableName);
  }
  return result;
}

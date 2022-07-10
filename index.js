var io =  require('socket.io-client');
const socket = io('https://alcor.exchange');
const { TaskTimer } = require('tasktimer');
var express = require('express');
// var request = require('request');
var app = express();

app.use(express.static(__dirname + '/public')); //__dir and not _dir
app.use(express.urlencoded({extended: true}));
app.use(express.json())
var port = process.env.PORT || 6000; 

const rpcEndpointList = ['https://api.wax.alohaeos.com/',
                         'https://api.waxsweden.org', 
                         'https://wax.pink.gg', 
                         "https://wax.greymass.com", 
                         'https://wax.cryptolions.io', 
                         'https://chain.wax.io',
                          'http://api.hivebp.io',
                          'http://wax.eosphere.io']

async function login() {
  try {
    const sRPC = rpcEndpointList[Math.floor(Math.random() * rpcEndpointList.length)]
    
    wax = new waxjs.WaxJS({
      rpcEndpoint: sRPC,
      tryAutoLogin: true,
      waxSigningURL: "https://all-access.wax.io",
      waxAutoSigningURL: "https://api-idm.wax.io/v1/accounts/auto-accept/"
    });
    const userAccount = await wax.login();
    document.getElementById('updater').value = userAccount;
    await getCurrentMessage();
    console.log("LOGIN SUCCESS!");
    console.log("RPC: " + sRPC);
    //document.getElementById("RPC").innerHTML = sRPC;
    //await getTokensPrices();
  }
  catch(e) {
    //document.getElementById('response').append(e.message);
    console.log('error: ', e.message)
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
  //document.getElementById('current').textContent = message;
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
  //let get_token = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://lightapi.eosamsterdam.net/api/balances/wax/'+wax.userAccount)}`)
                  // .then(response => response.json()).then(response => JSON.parse(response.contents));
  // get_token = JSON.parse(get_token.contents);
  // walletFWF = get_token.balances.find(token => token.currency == "FWF").amount;
  // walletFWG = get_token.balances.find(token => token.currency == "FWG").amount;
  // walletFWW = get_token.balances.find(token => token.currency == "FWW").amount;
  // get_token.balances.forEach(token => {
  //     if(token.currency == "FWG")
  //       walletFWG = token.amount;
  //       // document.getElementById("fwDepositFWG").placeholder = "Your have " + token.amount.toString() + " FWG";
  //     else if(token.currency == "FWF")
  //       walletFWF = token.amount;
  //       // document.getElementById("fwDepositFWF").placeholder = "Your have " + token.amount.toString() + " FWF";
  //     else if(token.currency == "FWW")
  //       walletFWW = token.amount;
  //       // document.getElementById("fwDepositFWF").placeholder = "Your have " + token.amount.toString() + " FWF";
  // });
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



async function getTokensPrices() {
  // let SEST = await fetch("https://wax.alcor.exchange/api/markets/156");
  // SEST = await SEST.json();
  // console.log('SEST',SEST);
  let BRWL = await fetch("https://wax.alcor.exchange/api/markets/337");
  BRWL = await BRWL.json();
  //console.log('brwl',BRWL);

  last_price = BRWL.last_price
  console.log(last_price)

  symbol_name = BRWL.quote_token.symbol.name
  console.log(symbol_name)
  // let GME = await fetch("https://wax.alcor.exchange/api/markets/268/orderbook");
  // GME = await GME.json();
  // console.log('gme',GME);

  // let lowest_ask = GME.asks;
  //console.log('lowest_ask',lowest_ask);
}

async function getLastAsk() {
  let GME = await fetch("https://wax.alcor.exchange/api/markets/337/orderbook");
  GME = await GME.json();
  console.log('gme',GME);
  GME_map = parseFloat(GME.asks[0]);
  let arr = [];
  // GME_map = GME_map.map(function(elem){
  //   arr.append(elem.key)
  // })
  console.log(arr)

  let bids = GME.bids;
  //console.log('Bids', bids)
  let last_bid = bids[bids.length - 1]
  console.log('Last Bid', last_bid[0])
  //console.log('lowest_ask',lowest_ask);
}




async function getOrderBooks() {
  let SEST = await fetch("https://wax.alcor.exchange/api/markets/156/orderbook");
  SEST = await SEST.json();
  console.log('sest',SEST)
}
async function getCharts() {
  let SEST = await fetch("https://wax.alcor.exchange/api/markets/156/charts");
  SEST = await SEST.json();
  console.log('sest',SEST)
}


const count = 10;
const timerMain = new TaskTimer(1000);
timerMain.add([
    {
        //id: 'FarmingTales',       // unique ID of the task
        // tickDelay: 1,       // 1 tick delay before first run
        tickInterval: 10,   // run every 10 ticks (10 x interval = 10000 ms)
        totalRuns: 0,       // run 2 times only. (set to 0 for unlimited times)
        callback(task) {
            // timerlogin.reset();
            console.log(`${task.id} task has run ${task.currentRuns} times.`);
            getTokensPrices();
            getLastAsk();
        }
    },
]);
timerMain.start()
//app.listen(port, () => {console.log('server on' + port)});
// Get buy orderbook from conract table

// const { rows } = await rpc.get_table_rows({
//   code: 'alcordexmain',
//   table: 'buyorder',
//   limit: 1000,
//   scope: 424, // Market id from /api/markets
//   key_type: 'i128', // we are using it for getting order sorted by price.
//   index_position: 2
// })
// console.log('rows',rows)


//Subscribe to deals
// socket.emit('subscribe', { room: 'deals', params: { chain: 'wax', market: 26 } })

// Unsubscribe from deals (will unsubscribe from all markets)
//socket.emit('unsubscribe', { room: 'deals', params: { chain: 'wax' } })

// Subscribe to buy orderbook of 26 (TLM on wax) market.
// socket.emit('subscribe', { room: 'orderbook', params: { chain: 'wax', market: 26, side: 'buy' } })

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
// socket.on('orderbook_buy') = function (event) {
//   console.log(event.data);
// }
// On new deals of market
//socket.on('new_deals', deals => { ... })

// socket.onmessage = function (event) {
//   console.log(event.data);
// }
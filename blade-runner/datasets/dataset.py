import requests
import time

start_date = 1483228800 * 1000 #Jan 01 2017
pair = 'ETHBTC'
timeframe = '30m'
timeframe_int = int(timeframe.replace('m',''));
now_time = time.time() * 1000;
number_of_candles = 30;
start_date = now_time - timeframe_int * number_of_candles * 60 * 1000 * 1000;
final_data = []

for _ in range(0,number_of_candles):
    url = 'https://api.bitfinex.com/v2/candles/trade:' + timeframe + ':t' + pair + '/hist?sort=1&limit=1000&start=' + str(start_date)

    r = requests.get(url)

    temp_data = r.json()
    final_data = final_data + temp_data

    start_date = temp_data[len(temp_data)-1][0] + timeframe_int * 60 * 1000

    print(time.ctime() + " " + str(len(temp_data)))

    time.sleep(6)

print(final_data)

with open ('BFX_' + pair + '_' + timeframe + '.json', 'w') as f:
    f.write(str(final_data))

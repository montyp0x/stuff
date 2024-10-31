import requests
import os
from dotenv import load_dotenv

load_dotenv()

THEGRAPH_API_KEY = os.getenv('THEGRAPH_API_KEY')
INCH_API_KEY = os.getenv('INCH_API_KEY')
WALLET_ADDRESS = os.getenv('WALLET_ADDRESS')

WETH_ADDRESS = '0xC02aaA39b223FE8D0a0e5C4F27eAD9083C756Cc2'
USDC_ADDRESS = '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

UNISWAP_V2_PAIR_ADDRESS = '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc'

UNISWAP_V2_SUBGRAPH_URL = f'https://gateway.thegraph.com/api/{THEGRAPH_API_KEY}/subgraphs/id/EYCKATKGBKLWvSfwvBjzfCBmGwYNdVkduYXVivCsLRFu'

ONEINCH_API_URL = 'https://api.1inch.dev/swap/v6.0' + "1"

def get_uniswap_v2_price():
    query = '''
    {
      pair(id: "%s") {
        reserve0
        reserve1
        token0 {
          id
          symbol
          decimals
        }
        token1 {
          id
          symbol
          decimals
        }
      }
    }
    ''' % UNISWAP_V2_PAIR_ADDRESS.lower()

    url = UNISWAP_V2_SUBGRAPH_URL
    headers = {'Content-Type': 'application/json'}
    payload = {'query': query}

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        raise Exception(f'{response.status_code}: {response.text}')

    data = response.json()

    pair = data['data']['pair']
    reserve0 = float(pair['reserve0'])
    reserve1 = float(pair['reserve1'])

    token0 = pair['token0']
    token1 = pair['token1']

    decimals0 = int(token0['decimals'])
    decimals1 = int(token1['decimals'])

    adjusted_reserve0 = reserve0 #/ (10 ** decimals0)
    adjusted_reserve1 = reserve1 #/ (10 ** decimals1)

    if token0['symbol'] == 'USDC' and token1['symbol'] == 'WETH':
        price = adjusted_reserve0 / adjusted_reserve1
    elif token0['symbol'] == 'WETH' and token1['symbol'] == 'USDC':
        price = adjusted_reserve1 / adjusted_reserve0
    else:
        raise Exception('')

    return price, reserve0, reserve1

def simulate_sell_eth(reserve_eth, reserve_usdc, eth_sold, fee=30):
    amount_in_with_fee = eth_sold * (10000 - fee) / 10000 # fee in basis points

    usdc_out = reserve_usdc - (reserve_eth * reserve_usdc) / (reserve_eth + amount_in_with_fee)

    new_reserve_eth = reserve_eth + eth_sold
    new_reserve_usdc = reserve_usdc - usdc_out

    new_price = new_reserve_usdc / new_reserve_eth

    return new_price, usdc_out, new_reserve_eth, new_reserve_usdc

def get_1inch_quote():

    apiUrl = "https://api.1inch.dev/swap/v6.0/1/quote"
    requestOptions = {
        "headers": {
            'Authorization': f'Bearer {INCH_API_KEY}'
        },
        "body": "",
        "params": {
            "src": "0xC02aaA39b223FE8D0a0e5C4F27eAD9083C756Cc2",
            "dst": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "amount": str(int(1e18))
        }
    }

    # Prepare request components
    headers = requestOptions.get("headers", {})
    params = requestOptions.get("params", {})


    response = requests.get(apiUrl, headers=headers, params=params)
    data = response.json()

    return int(data['dstAmount']) * 1e-6


def main():

    uniswap_price, usdc_reserve, eth_reserve = get_uniswap_v2_price()

    try:
        inch_price = get_1inch_quote()
    except Exception as e:
        print(f'1inch: {e}')
        inch_price = None

    if uniswap_price is not None and inch_price is not None:
        print(f'uni v2 ETH/USDC before sell: {uniswap_price:.6f} USDC')
        new_uni_price, usdc_out, new_reserve_eth, new_reserve_usdc = simulate_sell_eth(eth_reserve, usdc_reserve, 10)
        print(f'uni v2 ETH/USDC after sell: {new_uni_price:.6f} USDC')

        print(f'1inch ETH/USDC quote: {inch_price:.6f} USDC')

        difference = abs(new_uni_price - inch_price)
        percentage_difference = (difference / ((new_uni_price + inch_price) / 2)) * 100

        print(f'price difference: {difference:.6f} USDC')
        print(f'percent difference: {percentage_difference:.5f}%')
    else:
        print('error')

if __name__ == '__main__':
    main()

import axios from 'axios';
import {
  BinanceInterval,
  BinanceResponse,
  BinanceResponseData,
  Kline,
} from './types';
import { calculateNumberOfCall, divideInterval } from './utils';

export async function getKline(
  pair: string,
  interval: BinanceInterval,
  startDate: Date,
  endDate: Date,
  source = 'api',
  version = 'v3',
  limit = 1000,
): Promise<Array<Kline>> {
  try {
    if (startDate.getTime() > endDate.getTime()) {
      throw new Error('Start date must be before end date');
    }
    const numberOfCall = calculateNumberOfCall(
      interval,
      startDate.getTime(),
      endDate.getTime(),
    );
    const numOfIterations = Math.ceil(numberOfCall / limit);
    const divisions = divideInterval(
      numOfIterations,
      startDate.getTime(),
      endDate.getTime(),
    );

    let data: Array<BinanceResponseData> = [];
    for (let i = 0; i < divisions.length; i++) {
      if (i + 1 !== divisions.length) {
        const start = divisions[i];
        const end = divisions[i + 1];
        const url = `https://${source}.binance.com/${source}/${version}/klines?symbol=${pair}&interval=${interval}&startTime=${start}&endTime=${end}&limit=${limit}`;
        const response: BinanceResponse = await axios.get(url);
        data = [...data, ...response.data];
      }
    }
  } catch (error: any) {
    throw new Error(JSON.stringify(error));
  }
}

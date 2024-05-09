import { makeCookiesString } from '../../../utils/cookies';

export interface GetMeters {
  current_meters: MeterValue[];
  readings_report: MeterValue[];
}

export interface MeterValue {
  id: string;
  type: string;
  serial_number: string;
  location: string;
  installation_date: string;
  working_finish_date: any;
  working_start_date: string;
  last_check_date: string;
  next_check_date: string;
  current_values: any;
  previous_values: number[];
  previous_date: string;
  last_readings_date: string;
  last_readings: number[];
  is_automatic: boolean;
  reverse: boolean;
  average_deltas: number[];
  readonly: boolean;
  digit_capacity: number;
  first_values: number[];
  readings: Reading[];
}

export interface Reading {
  period: string;
  values: number[];
  deltas: number[];
  created_at: string;
  points: number[];
}

export interface SendMetersBody {
  meters: MeterValue[];
}

export interface MeterValue {
  meter_id: string;
  values: number[];
}

type Cookies = {
  session_id: string;
};

class Api {
  constructor(private sessionId: string) {}

  private request(
    path: string,
    options?: RequestInit & {
      query?: URLSearchParams;
    },
  ) {
    const url = new URL(path, process.env.GS_BASE_URL);

    if (options?.query) {
      url.search = options.query.toString();
    }

    const cookies = makeCookiesString<Cookies>({
      session_id: this.sessionId,
    });

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        cookie: cookies,
      },
    });
  }

  fetchMeters() {
    return this.request('/api/v4/cabinet/meters');
  }

  sendMeters(values: SendMetersBody) {
    return this.request('/api/v4/cabinet/meters', {
      method: 'POST',
      body: JSON.stringify(values),
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}

export { Api };

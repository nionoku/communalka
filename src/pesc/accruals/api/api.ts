import { format } from 'date-fns';
import { TypedResponse } from 'src/declarations/typed-response';
import { Bill } from './api.types';

export class Api {
  constructor(private token: string) {}

  private request<T>(
    path: string,
    options?: RequestInit & {
      query?: URLSearchParams;
    },
  ) {
    const url = new URL(path, process.env.PESC_BASE_URl);

    if (options.query) {
      url.search = options.query.toString();
    }

    return fetch(url, options) as TypedResponse<T>;
  }

  /** @description fetch list of bills */
  getBills(from: Date, till: Date) {
    const query = new URLSearchParams();
    query.set('from', format(from, 'dd.MM.yyyy'));
    query.set('to', format(till, 'dd.MM.yyyy'));

    return this.request<string[]>('/v6/bills/payments', { query });
  }

  /** @description fetch bill by id */
  getBill(id: number) {
    return this.request<Bill>(`/v7/payments/bills/${id}`);
  }

  /** @description fetch bill receipt id */
  getReceiptId(id: number, accountId: number) {
    return this.request<undefined>(
      `/v7/accounts/${accountId}/bills/${id}/uuid`,
    );
  }

  /** @description fetch receipt by receipt uuid */
  getReceiptFile(uuid: string) {
    return this.request<undefined>(`/v1/file/${uuid}`);
  }
}

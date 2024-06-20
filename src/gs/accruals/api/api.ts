import { format } from 'date-fns';
import { makeCookiesString } from '../../../utils/cookies';

export interface AccrualResponse {
  accruals: Accrual[];
  debts: Debt[];
  balance: Balance;
}

export interface Accrual {
  allow_pdf: boolean;
  accrual_id: string;
  doc_id: string;
  pay_till: string;
  repaid_at?: string;
  date: string;
  month: string;
  month_str: string;
  value: number;
  debt: number;
  penalties: number;
  sector_code: string;
  status: 'debt' | 'paid';
  order: number;
}

export interface Debt {
  accrual_id: string;
  doc_id: string;
  month: string;
  month_str: string;
  value: number;
  debt: number;
  pay_till: string;
  days: number;
  sector_code: string;
}

export interface Balance {
  rent: number;
}

export type GenerateAccrualReceiptResponse = {
  task_id: string;
  sector_code: string;
};

export type CheckIsGeneratedAccrualReceiptResponse =
  | {
      status: 'wip';
    }
  | {
      status: 'success';
      url: string;
    };

type Cookies = {
  session_id: string;
};

class Api {
  constructor(private sessionId: string) {}

  private request(
    path: string,
    options: RequestInit & {
      query?: URLSearchParams;
    },
  ) {
    const url = new URL(path, process.env.GS_BASE_URL);

    if (options.query) {
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

  /** @description fetch list of accruals (with debts) */
  fetchAccruals(from: Date, till: Date) {
    const query = new URLSearchParams();
    query.set('sectors', 'rent');
    query.set('month_from', format(from, 'yyyy.MM.dd'));
    query.set('month_till', format(till, 'yyyy.MM.dd'));

    return this.request('/api/v4/cabinet/accruals', {
      query,
    });
  }

  /** @description request to creating task for generate accrual receipt */
  fetchGenerateAccrualReceiptById(id: string) {
    const body = {
      accrual: id,
      sector_code: 'rent',
    };

    return this.request('/api/v4/cabinet/receipt/', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
      },
    });
  }

  /** @description fetch status of task for generate accrual receipt */
  checkIsGeneratedAccrualReceipt(params: GenerateAccrualReceiptResponse) {
    const query = new URLSearchParams();
    query.set('task_id', params.task_id);
    query.set('sector_code', params.sector_code);

    return this.request('/api/v4/cabinet/receipt', {
      query,
    });
  }

  /** @description fetch link for download generated accrual receipt */
  fetchAccrualReceiptById(id: string, author: string) {
    const query = new URLSearchParams();
    query.set('file_id', id);
    query.set('author', author);

    return this.request('/api/v4/accruals/download_file', {
      query,
    });
  }
}

export { Api };

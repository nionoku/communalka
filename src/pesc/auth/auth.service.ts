import { Injectable } from '@nestjs/common';
import { PESC_Account } from '@prisma/client';
import { Api } from './api/api';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private databaseService: PrismaService) {}

  async getToken(account: PESC_Account) {
    let state = await this.databaseService.pESC_Session.findFirst({
      where: {
        accountId: account.id,
      },
    });

    if (state.expired.getTime() < Date.now()) {
      const api = new Api();
      const token = await api.getToken(account.creds);
      const expired = this.getExpired(token);

      state = await this.databaseService.pESC_Session.update({
        data: {
          token,
          expired,
        },
        where: {
          accountId: account.id,
        },
      });
    }

    return state.token;
  }

  private getExpired(token: string): Date {
    const decrypted: { exp: number } = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString(),
    );

    return new Date(decrypted.exp);
  }
}

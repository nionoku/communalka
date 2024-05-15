# Communalka

> Someday my meter readings will be sent automatically, but not today

Instance-like Nest.js service for notification of pay rent, meter reading, etc aka communalka

## GS
- Notification of the need to submit meter readings
- Sending meter readings
- Notice of rent receipt

# Install
1. Clone repository `git clone git@github.com:nionoku/communalka.git`;
2. Create bot `[https://t.me/BotFather](https://t.me/BotFather)`;
3. Create env file `touch .env` and configure it similar `.env.local`;
4. Create db file `npx prisma db push`;
5. Add your credentials in db `echo "INSERT INTO Account (area, gs_session, notify_to) VALUES (your_area, 'your_kabinet_jitelya_token', your_chatid_with_bot)" | npx prisma db execute --stdin --schema prisma/schema.prisma`;
6. Run service `npm build && npm run start:prod`;

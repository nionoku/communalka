import use from '../../lib/scope-extensions';

type Record = {
  id: string;
  area: string;
  from: string;
  chat: number;
};

const getSessions = () => {
  return use(process.env.GS_SESSIONS as string)
    .let<Record[]>(JSON.parse)
    .item()
    .map((session) => ({
      ...session,
      from: new Date(session.from),
    }));
};

export { getSessions };

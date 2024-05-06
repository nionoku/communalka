import use from '../../lib/scope-extensions';

type Record = {
  id: string;
  area: string;
  from: string;
};

const getSessions = () => {
  return use(process.env.GS_SESSIONS as string)
    .let<Record[]>(JSON.parse)
    .item()
    .map((session) => ({
      id: session.id,
      area: session.area,
      from: new Date(session.from),
    }));
};

export { getSessions };

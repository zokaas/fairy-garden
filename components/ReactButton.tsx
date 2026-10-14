import { comment, react } from '@/app/actions';

export type CommentView = { id: string; name: string; body: string };

/** Kimalle-reaktio (✨) ja lyhyet kommentit tekemisen alla. Omaan tekemiseen näytetään reaktiolaskuri, mutta siihen voi vastata kommentilla. */
export default function ReactButton({ target, names, mine, own, comments }: { target: string; names: string[]; mine: boolean; own: boolean; comments: CommentView[] }) {
  return (
    <>
      <div className="rx-row">
        {own ? (
          names.length > 0 && <span className="rx-own" title={names.join(', ')}>✨ {names.length}</span>
        ) : (
          <form action={react} className="rx">
            <input type="hidden" name="target" value={target} />
            <button type="submit" className={mine ? 'on' : ''} aria-pressed={mine} aria-label={mine ? 'Poista kimallus' : 'Lähetä kimallusta'}>✨{names.length ? ` ${names.length}` : ''}</button>
          </form>
        )}
        <details className="cm-open">
          <summary aria-label="Kommentoi">💬{comments.length ? ` ${comments.length}` : ''}</summary>
          <form action={comment} className="cm-form">
            <input type="hidden" name="target" value={target} />
            <input name="body" maxLength={140} placeholder="Kirjoita kommentti…" autoComplete="off" required />
            <button type="submit">Lähetä</button>
          </form>
        </details>
      </div>
      {(names.length > 0 || comments.length > 0) && (
        <div className="cm">
          {names.length > 0 && <small>✨ {names.join(', ')}</small>}
          {comments.map((c) => <p key={c.id}><b>{c.name}</b> {c.body}</p>)}
        </div>
      )}
    </>
  );
}

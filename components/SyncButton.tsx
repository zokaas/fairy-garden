export default function SyncButton({ site }: { site: string }) {
  const back = encodeURIComponent(`${site}/?synkattu=1`);
  const href = `shortcuts://x-callback-url/run-shortcut?name=Fairy%20Garden&x-success=${back}&x-cancel=${back}&x-error=${back}`;
  return (
    <a className="btn" href={href}>
      Synkkaa askeleet nyt
    </a>
  );
}

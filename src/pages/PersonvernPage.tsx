import { Link } from '@tanstack/react-router'

export default function PersonvernPage() {
  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <Link to="/logg-inn" className="text-[var(--accent)] text-sm hover:underline">← Tilbake</Link>

      <h1 className="text-3xl font-black mt-6 mb-4">Personvern</h1>
      <p className="text-[var(--muted)] text-sm mb-6">NorsNite — norsk lesespill for barn</p>

      <div className="flex flex-col gap-5 text-[var(--text)]">
        <section>
          <h2 className="font-bold text-lg mb-1">Hva samler vi inn?</h2>
          <p className="text-[var(--muted)]">
            E-postadresse (for innlogging), selvvalgt brukernavn og spilldata (XP, liganivå, fremgang).
            E-postadressen vises aldri til andre spillere.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-1">Hva brukes dataene til?</h2>
          <p className="text-[var(--muted)]">
            Utelukkende for å drive spillet — lagre fremgang, vise liganivå til venner og gi tilpasset
            vanskelighetsgrad. Vi selger ikke, deler ikke og analyserer ikke data for reklameformål.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-1">Informasjonskapsler</h2>
          <p className="text-[var(--muted)]">
            Vi bruker kun teknisk nødvendige informasjonskapsler for å holde deg innlogget.
            Ingen sporings- eller reklamecookies.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-1">Slette konto</h2>
          <p className="text-[var(--muted)]">
            Du kan slette kontoen og alle data via «Innstillinger → Slett konto» i appen.
            All data slettes permanent og kan ikke gjenopprettes.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-1">Kontakt</h2>
          <p className="text-[var(--muted)]">
            Spørsmål? Ta kontakt via GitHub-prosjektet. NorsNite er åpen kildekode.
          </p>
        </section>
      </div>
    </div>
  )
}

export const metadata = {
  title: "Home",
  description: "EV Installers Demo — sample site shell for demonstration.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Home() {
  return (
    <main className="page">
      <section className="hero compact-hero">
        <div className="hero-copy">
          <p className="code-kicker">ev.installers.demo</p>
          <h1>EV charging and electrical installs.</h1>
          <p className="lede">
            Sample installer website shell for demonstration. Use the configurator link in the
            footer to open the Andersen EV product preview.
          </p>
        </div>
      </section>
    </main>
  );
}

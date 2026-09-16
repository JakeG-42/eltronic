import { AndersenConfiguratorEmbed } from "@/components/site/andersen-configurator-embed";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Andersen",
  description: "Configure Andersen EV charge points with the Eltronic product configurator.",
  path: "/andersen",
});

export default function AndersenPage() {
  return (
    <main className="page">
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-number">01</span>
            <h2>Andersen EV Product Configurator</h2>
          </div>
        </div>
        <AndersenConfiguratorEmbed />
      </section>
    </main>
  );
}

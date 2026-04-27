import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/managed-data";
import { submitContactFormAction } from "@/app/contact/actions";

export const metadata = {
  title: "Contact | Eltronic",
  description: "Contact Eltronic for product and project enquiries.",
};

type ContactPageProps = {
  searchParams?: Promise<{
    error?: string;
    product?: string;
    sent?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const products = await getProducts();
  const selectedProduct = params?.product ?? "";
  const errorMessage =
    params?.error === "required"
      ? "Please add your name, email and message before sending."
      : params?.error === "storage"
        ? "The message could not be stored because persistent storage is not configured yet. Please email sales@eltronic.co.uk for now."
        : null;

  return (
    <main className="page">
      <section className="contact-hero">
        <div className="contact-copy">
          <p className="code-kicker">project.enquiry</p>
          <h1 className="contact-title">Talk through your technical project.</h1>
          <p className="lede">
            Tell us what you are building, replacing or trying to control.
            We will review the application and come back with a practical
            next step.
          </p>

          <div className="contact-card-grid">
            <a className="contact-card" href="tel:+447935239421">
              <span>Phone</span>
              <strong>+44(0) 79 3523 9421</strong>
            </a>
            <a className="contact-card" href="mailto:sales@eltronic.co.uk">
              <span>Email</span>
              <strong>sales@eltronic.co.uk</strong>
            </a>
          </div>

          <div className="contact-note">
            <span>Useful details</span>
            <p>
              Product name, equipment type, CAN protocol, environment and timing
              are enough to start. If you are not sure yet, send the rough idea.
            </p>
          </div>
        </div>

        <form action={submitContactFormAction} className="contact-form-panel">
          <div className="contact-form-header">
            <span>Quote request</span>
            <h2>Send an enquiry</h2>
            <p>We will use this to understand the project, not to add you to a mailing list.</p>
          </div>

          {params?.sent ? (
            <div className="success-message">Thanks, your enquiry has been saved. We will reply shortly.</div>
          ) : null}
          {errorMessage ? <div className="error-message">{errorMessage}</div> : null}

          <div className="form-row">
            <label className="field-label">
              <span>Name</span>
              <input aria-label="Name" name="name" placeholder="Your name" required />
            </label>
            <label className="field-label">
              <span>Company</span>
              <input aria-label="Company name" name="company" placeholder="Company name" />
            </label>
          </div>

          <label className="field-label">
            <span>Email</span>
            <input aria-label="Email" name="email" placeholder="you@example.com" required type="email" />
          </label>

          <label className="field-label">
            <span>Product or area</span>
            <select aria-label="Product" defaultValue={selectedProduct} name="productSlug">
              <option value="">Please select product (optional)</option>
              {products.map((product) => (
                <option key={product.slug} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            <span>Project details</span>
            <textarea
              aria-label="Message"
              name="message"
              placeholder="Tell us about the equipment, operating environment, control requirements or product you want to specify."
              required
            />
          </label>

          <Button type="submit" size="lg">
            Send enquiry
          </Button>
        </form>
      </section>
    </main>
  );
}

import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/managed-data";
import { submitContactFormAction } from "./actions";

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
      <section className="section contact-grid">
        <div>
          <p className="code-kicker">enquiry.create</p>
          <h1>Start the conversation.</h1>
          <p className="lede">
            The current WordPress form asks for name, company, email, message
            and an optional product selection. This is the same intended flow,
            now wired into Eltronic Studio so submissions are captured for review.
          </p>

          <div className="contact-list">
            <div className="contact-item">
              <span>phone</span>
              <a href="tel:+447935239421">+44(0) 79 3523 9421</a>
            </div>
            <div className="contact-item">
              <span>email</span>
              <a href="mailto:sales@eltronic.co.uk">sales@eltronic.co.uk</a>
            </div>
          </div>
        </div>

        <form action={submitContactFormAction} className="panel form-grid">
          {params?.sent ? (
            <div className="success-message">Thanks, your enquiry has been saved. We will reply shortly.</div>
          ) : null}
          {errorMessage ? <div className="error-message">{errorMessage}</div> : null}
          <input aria-label="Name" name="name" placeholder="Name" required />
          <input aria-label="Company name" name="company" placeholder="Company name" />
          <input aria-label="Email" name="email" placeholder="Email" required type="email" />
          <select aria-label="Product" defaultValue={selectedProduct} name="productSlug">
            <option value="">Please select product (optional)</option>
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name}
              </option>
            ))}
          </select>
          <textarea aria-label="Message" name="message" placeholder="Message" required />
          <Button type="submit" size="lg">
            Send enquiry
          </Button>
        </form>
      </section>
    </main>
  );
}

export default function AndersenPage() {
  return (
    <main style={{ margin: 0, padding: 0, minHeight: "100vh" }}>
      <iframe
        src="https://priceless-configurator.vercel.app/customiser/test?token=3sn6bjQxvZZ6BGXzrCaclscQSqPjeH5j"
        title="Test configurator"
        width="100%"
        height={1280}
        style={{ border: 0, borderRadius: 24, overflow: "hidden" }}
        loading="lazy"
      />
    </main>
  );
}

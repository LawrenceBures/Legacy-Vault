import EventVaultDemo from "../demo";

export default function EventVaultDemoPreviewPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <EventVaultDemo />
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

export default function EventVaultLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F3EF",
        color: "#2B1E1A",
      }}
    >
      <header
        style={{
          width: "100%",
          borderBottom: "1px solid rgba(43,30,26,0.08)",
          background: "#F5F3EF",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "26px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <a
            href="/events"
            style={{
              textDecoration: "none",
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "28px",
              lineHeight: 1,
              color: "#2B1E1A",
              fontWeight: 600,
            }}
          >
            Event<span style={{ color: "#D66A4E" }}>Vault</span>
          </a>

          <a
            href="/events/new"
            style={{
              textDecoration: "none",
              background: "#D66A4E",
              color: "#FFFFFF",
              padding: "12px 20px",
              borderRadius: "999px",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "15px",
              fontWeight: 700,
              boxShadow: "0 10px 24px rgba(214,106,78,0.18)",
            }}
          >
            Create Your Event
          </a>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

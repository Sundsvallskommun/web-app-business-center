export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <main id="content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

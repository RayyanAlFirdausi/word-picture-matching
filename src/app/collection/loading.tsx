const backgroundPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect x='1' y='1' width='118' height='118' rx='12' fill='%235f80f4'/%3E%3C/svg%3E\")";

export default function Loading() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#678cff] font-gasoek">
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: backgroundPattern }} />
    </main>
  );
}

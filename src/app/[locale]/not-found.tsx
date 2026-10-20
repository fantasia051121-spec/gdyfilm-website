import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[70vh] place-items-center text-center">
      <div>
        <h1 className="text-5xl font-bold text-ink">404</h1>
        <p className="mt-3 text-muted">Page not found.</p>
        <Link href="/" className="btn-primary mt-6">
          Home
        </Link>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-0">
          <Link href="/" className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-neutral-0">
              <Image
                src="/pilot.png"
                alt="Pilot"
                width={100}
                height={100}
                className="rounded"
              />
            </div>
          </Link>
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-white p-8 shadow-soft-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

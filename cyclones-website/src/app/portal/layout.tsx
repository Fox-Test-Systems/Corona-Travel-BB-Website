// Force all portal routes to be dynamic (not statically pre-rendered)
// Required because portal pages depend on Supabase auth at runtime
export const dynamic = "force-dynamic";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

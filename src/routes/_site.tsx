import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { siteQuery } from "@/lib/queries";

export const Route = createFileRoute("/_site")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQuery),
  component: SiteLayout,
});

function SiteLayout() {
  const { data } = useSuspenseQuery(siteQuery);
  return (
    <div className="flex min-h-screen flex-col">
      <Header brand={data.settings?.brand_name} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer settings={data.settings} />
    </div>
  );
}

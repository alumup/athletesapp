import { Layout } from "@/components/marketing/Layout";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}

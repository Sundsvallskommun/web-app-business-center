import AssetLayout from '@layouts/pages/mypages-sections/decicions-and-documents/asset-layout.component';

export default async function layout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
  return <AssetLayout id={id}>{children}</AssetLayout>;
}

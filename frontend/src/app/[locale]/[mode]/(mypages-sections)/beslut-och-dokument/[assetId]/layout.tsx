import AssetLayout from '@layouts/pages/mypages-sections/decicions-and-documents/asset-layout.component';

export default async function layout({
  params,
  children,
}: {
  params: Promise<{ assetId: string }>;
  children: React.ReactNode;
}) {
  const { assetId } = await params;
  return <AssetLayout assetId={assetId}>{children}</AssetLayout>;
}

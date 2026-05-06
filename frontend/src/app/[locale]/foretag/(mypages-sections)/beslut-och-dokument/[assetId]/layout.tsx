import AssetLayout from '@layouts/pages/mypages-sections/decicions-and-documents/asset-layout.component';

export default async function layout({ params, children }) {
  const { assetId } = await params;
  return <AssetLayout assetId={assetId}>{children}</AssetLayout>;
}

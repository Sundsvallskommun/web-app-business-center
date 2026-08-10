import CaseLayout from '@layouts/pages/mypages-sections/cases/case/case-layout.component';

export default async function layout({
  params,
  children,
}: {
  params: Promise<{ caseId: string }>;
  children: React.ReactNode;
}) {
  const { caseId } = await params;
  return <CaseLayout caseId={caseId}>{children}</CaseLayout>;
}

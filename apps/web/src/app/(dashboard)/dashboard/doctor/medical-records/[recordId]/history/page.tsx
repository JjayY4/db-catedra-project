import MedicalRecordHistoryView from "../../../../../../../views/medical-record-history";

export default async function HistoryPage({ params }: { params: Promise<{ recordId: string }> }) {
  const { recordId } = await params;

  return (
    <main className="p-6 md:p-8">
      <MedicalRecordHistoryView recordId={recordId} />
    </main>
  );
}
import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import { VocabularyTable } from "./vocabulary-table"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"
import { ExcelUploader } from "./excel-uploader"

export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  const supabase = await createClient()

  // Fetch all data in batches to bypass 1000-row Supabase limit
  let allVocabulary: any[] = [];
  let from = 0;
  const step = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("vocabulary")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + step - 1);

    if (error) {
      console.error("Error fetching vocabulary:", error);
      break;
    }

    if (!data || data.length === 0) break;

    allVocabulary = [...allVocabulary, ...data];

    // If we fetched fewer than 'step', we've reached the end
    if (data.length < step) break;

    from += step;
  }

  const vocabulary = allVocabulary;



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2E333D]">Quản lý từ vựng</h1>
          <p className="text-gray-500 mt-1">Danh sách từ vựng HSK 1-9</p>
        </div>
        <div className="flex items-center gap-3">
          <ExcelUploader />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>}>
          <VocabularyTable initialData={vocabulary || []} />
        </Suspense>
      </div>
    </div>
  )
}

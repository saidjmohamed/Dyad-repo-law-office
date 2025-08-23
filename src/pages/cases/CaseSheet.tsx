import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CaseForm } from "./CaseForm";
import { CaseFormData } from "./actions";

interface CaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData?: CaseFormData | null; // تم تعديل النوع للسماح بـ null
}

export const CaseSheet = ({ open, onOpenChange, caseData }: CaseSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{caseData ? "تعديل قضية" : "إضافة قضية جديدة"}</SheetTitle>
          <SheetDescription>
            {caseData ? "قم بتعديل تفاصيل القضية." : "أدخل تفاصيل القضية الجديدة هنا."}
          </SheetDescription>
        </SheetHeader>
        <CaseForm initialData={caseData} onSuccess={() => onOpenChange(false)} /> {/* تمرير caseData مباشرة وتصحيح onSuccess */}
      </SheetContent>
    </Sheet>
  );
};
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Define a more complete Hearing type
export type Hearing = {
  id: string;
  hearing_date: string;
  room: string | null;
  judge: string | null;
  result: string | null;
  notes: string | null;
  cases: {
    case_number: string;
  } | null;
};

interface HearingDetailsDialogProps {
  hearing: Hearing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HearingDetailsDialog = ({ hearing, isOpen, onClose }: HearingDetailsDialogProps) => {
  if (!hearing) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل الجلسة</DialogTitle>
          <DialogDescription>
            عرض تفصيلي لمعلومات الجلسة.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="flex justify-between items-center border-b pb-2">
            <p className="font-semibold text-gray-500">رقم القضية</p>
            <p>{hearing.cases?.case_number || 'غير متوفر'}</p>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <p className="font-semibold text-gray-500">تاريخ الجلسة</p>
            <p>{new Date(hearing.hearing_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <p className="font-semibold text-gray-500">القاعة</p>
            <p>{hearing.room || 'غير محدد'}</p>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <p className="font-semibold text-gray-500">القاضي</p>
            <p>{hearing.judge || 'غير محدد'}</p>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <p className="font-semibold text-gray-500">القرار</p>
            <p>{hearing.result || 'لم يصدر بعد'}</p>
          </div>
          <div className="flex justify-between items-start pt-2">
            <p className="font-semibold text-gray-500">ملاحظات</p>
            <p className="text-left max-w-[70%]">{hearing.notes || 'لا يوجد'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHearings } from "./actions";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { HearingSheet } from "./HearingSheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

type HearingData = {
  id: string;
  hearing_date: string;
  case_number?: string;
  client_name?: string;
  room?: string | null;
};

const Hearings = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { data: hearings, isLoading, isError } = useQuery<HearingData[]>({
    queryKey: ["hearings"],
    queryFn: getHearings,
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة الجلسات</h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض، إضافة، وتعديل بيانات الجلسات.
          </p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)}>
          <PlusCircle className="w-4 h-4 ml-2" />
          إضافة جلسة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الجلسات</CardTitle>
          <CardDescription>
            هنا قائمة بجميع الجلسات المسجلة في النظام.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center py-4">
              حدث خطأ أثناء جلب البيانات.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاريخ الجلسة</TableHead>
                  <TableHead>رقم القضية</TableHead>
                  <TableHead>الموكل</TableHead>
                  <TableHead>القاعة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hearings && hearings.length > 0 ? (
                  hearings.map((hearing) => (
                    <TableRow key={hearing.id}>
                      <TableCell>{format(new Date(hearing.hearing_date), "PPP")}</TableCell>
                      <TableCell className="font-medium">{hearing.case_number}</TableCell>
                      <TableCell>{hearing.client_name}</TableCell>
                      <TableCell>{hearing.room || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      لا يوجد جلسات لعرضها.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <HearingSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
};

export default Hearings;
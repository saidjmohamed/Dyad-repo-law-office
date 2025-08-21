import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCases } from "./actions";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CaseSheet } from "./CaseSheet";
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
import { Badge } from "@/components/ui/badge";

const Cases = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { data: cases, isLoading, isError } = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة القضايا</h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض، إضافة، وتعديل بيانات القضايا.
          </p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)}>
          <PlusCircle className="w-4 h-4 ml-2" />
          إضافة قضية
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة القضايا</CardTitle>
          <CardDescription>
            هنا قائمة بجميع القضايا المسجلة في النظام.
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
                  <TableHead>رقم القضية</TableHead>
                  <TableHead>الموكل</TableHead>
                  <TableHead>نوع القضية</TableHead>
                  <TableHead>المحكمة</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases && cases.length > 0 ? (
                  cases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">{caseItem.case_number}</TableCell>
                      <TableCell>{caseItem.client_name}</TableCell>
                      <TableCell>{caseItem.case_type}</TableCell>
                      <TableCell>{caseItem.court}</TableCell>
                      <TableCell>
                        <Badge>{caseItem.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      لا يوجد قضايا لعرضها.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CaseSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
};

export default Cases;
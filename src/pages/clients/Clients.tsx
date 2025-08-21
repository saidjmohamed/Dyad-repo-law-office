import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClients } from "./actions";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ClientSheet } from "./ClientSheet";
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

const Clients = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { data: clients, isLoading, isError } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة الموكلين</h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض، إضافة، وتعديل بيانات الموكلين.
          </p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)}>
          <PlusCircle className="w-4 h-4 ml-2" />
          إضافة موكل
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الموكلين</CardTitle>
          <CardDescription>
            هنا قائمة بجميع الموكلين المسجلين في النظام.
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
                  <TableHead>الاسم الكامل</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients && clients.length > 0 ? (
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.full_name}</TableCell>
                      <TableCell>{client.phone || "-"}</TableCell>
                      <TableCell>{client.email || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      لا يوجد موكلون لعرضهم.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ClientSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
};

export default Clients;
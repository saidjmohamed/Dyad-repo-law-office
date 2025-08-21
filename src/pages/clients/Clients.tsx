import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients, deleteClient } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";
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
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { showSuccess, showError } from "@/utils/toast";

type Client = {
  id: string;
  full_name: string;
  national_id?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
};

const Clients = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();
  const { data: clients, isLoading, isError } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    // Perform client-side filtering based on search term
    return clients.filter(client =>
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.includes(searchTerm)) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.national_id && client.national_id.includes(searchTerm)) ||
      (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.notes && client.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [clients, searchTerm]);

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      showSuccess("تم حذف الموكل بنجاح.");
      setIsDeleteDialogOpen(false);
      setDeletingClientId(null);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleAddClick = () => {
    setEditingClient(null);
    setIsSheetOpen(true);
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingClientId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingClientId) {
      deleteMutation.mutate(deletingClientId);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة الموكلين</h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض، إضافة، وتعديل بيانات الموكلين.
          </p>
        </div>
        <Button onClick={handleAddClick}>
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
          <div className="relative mt-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث بالاسم، الهاتف، أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-8"
            />
          </div>
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
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients && filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.full_name}</TableCell>
                      <TableCell>{client.phone || "-"}</TableCell>
                      <TableCell>{client.email || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(client)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(client.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      {searchTerm ? "لم يتم العثور على نتائج." : "لا يوجد موكلون لعرضهم."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ClientSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        client={editingClient}
      />
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
};

export default Clients;
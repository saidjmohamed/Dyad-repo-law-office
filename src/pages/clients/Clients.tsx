import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Added useMutation, useQueryClient
import { PlusCircle, Search, Pencil, Trash2 } from "lucide-react"; // Added Pencil, Trash2
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getClients, deleteClient } from "./actions";
import ClientSheet from "./ClientSheet"; // Corrected import
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Client } from "./ClientList"; // Import Client type

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const queryClient = useQueryClient(); // Initialized useQueryClient

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["clients", searchTerm],
    queryFn: ({ queryKey }) => getClients({ query: queryKey[1] as string }), // Corrected queryFn call
  });

  const filteredClients = clients?.filter((client: Client) => // Added null check and explicit type
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.national_id && client.national_id.includes(searchTerm)) ||
    (client.phone && client.phone.includes(searchTerm)) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success("تم حذف الموكل بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => { // Explicitly type error
      toast.error(`فشل حذف الموكل: ${error.message}`);
    },
  });

  // ... rest of the component remains the same
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">الموكلون</h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة قائمة الموكلين لديك.
          </p>
        </div>
        <Button onClick={() => { setEditingClient(undefined); setIsSheetOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          إضافة موكل جديد
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="البحث عن موكل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم الكامل</TableHead>
                  <TableHead>رقم التعريف الوطني</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients && filteredClients.length > 0 ? (
                  filteredClients.map((client: Client) => ( // Added null check and explicit type
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.full_name}</TableCell>
                      <TableCell>{client.national_id || "غير متوفر"}</TableCell>
                      <TableCell>{client.phone || "غير متوفر"}</TableCell>
                      <TableCell>{client.email || "غير متوفر"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingClient(client)}
                          className="ml-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setClientToDelete(client.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      لا يوجد موكلون.
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيؤدي هذا الإجراء إلى حذف الموكل بشكل دائم من سجلاتك.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (clientToDelete) {
                deleteClient(clientToDelete);
                toast.success("تم حذف الموكل بنجاح.");
                queryClient.invalidateQueries({ queryKey: ["clients"] });
              }
              setIsDeleteDialogOpen(false);
            }}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;
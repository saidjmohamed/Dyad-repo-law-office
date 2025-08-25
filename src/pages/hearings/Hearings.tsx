import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHearings } from './actions';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HearingDetailsDialog, Hearing } from './HearingDetailsDialog';

const HearingsPage = () => {
  const [selectedHearing, setSelectedHearing] = useState<Hearing | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: hearings, isLoading } = useQuery<Hearing[]>({
    queryKey: ['hearings'],
    queryFn: () => getHearings({}),
  });

  const handleViewDetails = (hearing: Hearing) => {
    setSelectedHearing(hearing);
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<Hearing>[] = [
    {
      accessorKey: 'cases.case_number',
      header: 'رقم القضية',
      cell: ({ row }) => row.original.cases?.case_number || 'غير متوفر',
    },
    {
      accessorKey: 'hearing_date',
      header: 'تاريخ الجلسة',
      cell: ({ row }) => new Date(row.original.hearing_date).toLocaleDateString('ar-EG'),
    },
    {
      accessorKey: 'room',
      header: 'القاعة',
      cell: ({ row }) => row.original.room || 'غير محدد',
    },
    {
      accessorKey: 'judge',
      header: 'القاضي',
      cell: ({ row }) => row.original.judge || 'غير محدد',
    },
    {
      accessorKey: 'result',
      header: 'القرار',
      cell: ({ row }) => row.original.result || 'لم يصدر',
    },
    {
      id: 'actions',
      header: 'عرض التفاصيل',
      cell: ({ row }) => {
        const hearing = row.original;
        return (
          <div className="text-center">
            <Button variant="ghost" size="icon" onClick={() => handleViewDetails(hearing)} className="rounded-full">
              <Eye className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">الجلسات</h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة وتتبع جميع جلسات القضايا.
          </p>
        </div>
        <Button asChild>
          <Link to="/hearings/new">
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة جلسة جديدة
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>قائمة الجلسات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <DataTable columns={columns} data={hearings || []} />
          )}
        </CardContent>
      </Card>

      <HearingDetailsDialog 
        hearing={selectedHearing} 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </div>
  );
};

export default HearingsPage;
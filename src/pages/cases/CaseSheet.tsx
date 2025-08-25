import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import CaseForm from "./CaseForm";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createCase, updateCase } from "./actions";
import { toast } from "sonner";
import { useEffect } from "react";
import { getClients } from "../clients/actions";
import { Client } from "../clients/ClientList"; // Import Client type

const formSchema = z.object({
  case_number: z.string().min(1, { message: "رقم القضية مطلوب" }),
  status: z.string().optional(),
  client_id: z.string().optional().nullable(),
  case_category: z.string().optional(),
  procedure_type: z.string().optional(),
  registered_at: z.date().optional().nullable(),
  court_name: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  jurisdiction_section: z.string().optional().nullable(),
  appeal_to_court: z.string().optional().nullable(),
  supreme_court_chamber: z.string().optional().nullable(),
  first_hearing_date: z.date().optional().nullable(),
  last_postponement_date: z.date().optional().nullable(),
  postponement_reason: z.string().optional().nullable(),
  next_hearing_date: z.date().optional().nullable(),
  judgment_text: z.string().optional().nullable(),
  statute_of_limitations: z.string().optional().nullable(),
  fees_amount: z.number().optional().nullable(),
  fees_status: z.string().optional().nullable(),
  fees_notes: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),
  public_summary: z.string().optional().nullable(),
  criminal_offense_type: z.string().optional().nullable(),
  complaint_filed_with: z.string().optional().nullable(),
  investigation_number: z.string().optional().nullable(),
  original_case_number: z.string().optional().nullable(),
  original_judgment_date: z.date().optional().nullable(),
  appellant_or_opponent: z.string().optional().nullable(),
  grounds_of_appeal: z.string().optional().nullable(),
  archived: z.boolean().optional(),
});

export type CaseFormValues = z.infer<typeof formSchema>;

interface CaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData?: CaseFormValues & { id: string };
}

const CaseSheet = ({ open, onOpenChange, caseData }: CaseSheetProps) => {
  const isEditMode = !!caseData;
  const queryClient = useQueryClient();

  const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: () => getClients({}), // Corrected queryFn call
  });

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      case_number: "",
      status: "جديدة",
      client_id: null,
      case_category: "مدني",
      procedure_type: "قضية جديدة",
      registered_at: new Date(),
      court_name: "",
      province: "",
      jurisdiction_section: "",
      extra_details: "",
      appeal_to_court: "",
      supreme_court_chamber: "",
      first_hearing_date: undefined,
      last_postponement_date: undefined,
      postponement_reason: "",
      next_hearing_date: undefined,
      judgment_text: "",
      statute_of_limitations: "",
      fees_amount: 0,
      fees_status: "غير مدفوع",
      fees_notes: "",
      internal_notes: "",
      public_summary: "",
      criminal_offense_type: "",
      complaint_filed_with: "",
      investigation_number: "",
      original_case_number: "",
      original_judgment_date: undefined,
      appellant_or_opponent: "",
      grounds_of_appeal: "",
      archived: false,
    },
  });

  useEffect(() => {
    if (caseData) {
      form.reset({
        ...caseData,
        registered_at: caseData.registered_at ? new Date(caseData.registered_at) : undefined,
        first_hearing_date: caseData.first_hearing_date ? new Date(caseData.first_hearing_date) : undefined,
        last_postponement_date: caseData.last_postponement_date ? new Date(caseData.last_postponement_date) : undefined,
        next_hearing_date: caseData.next_hearing_date ? new Date(caseData.next_hearing_date) : undefined,
        original_judgment_date: caseData.original_judgment_date ? new Date(caseData.original_judgment_date) : undefined,
      });
    } else {
      form.reset({
        case_number: "",
        status: "جديدة",
        client_id: null,
        case_category: "مدني",
        procedure_type: "قضية جديدة",
        registered_at: new Date(),
        court_name: "",
        province: "",
        jurisdiction_section: "",
        appeal_to_court: "",
        supreme_court_chamber: "",
        first_hearing_date: undefined,
        last_postponement_date: undefined,
        postponement_reason: "",
        next_hearing_date: undefined,
        judgment_text: "",
        statute_of_limitations: "",
        fees_amount: 0,
        fees_status: "غير مدفوع",
        fees_notes: "",
        internal_notes: "",
        public_summary: "",
        criminal_offense_type: "",
        complaint_filed_with: "",
        investigation_number: "",
        original_case_number: "",
        original_judgment_date: undefined,
        appellant_or_opponent: "",
        grounds_of_appeal: "",
        archived: false,
      });
    }
  }, [caseData, form]);

  const createMutation = useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      toast.success("تم إضافة القضية بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`فشل إضافة القضية: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCase,
    onSuccess: () => {
      toast.success("تم تحديث بيانات القضية بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`فشل تحديث بيانات القضية: ${error.message}`);
    },
  });

  const onSubmit = (values: CaseFormValues) => {
    const caseToSubmit = {
      ...values,
      registered_at: values.registered_at ? values.registered_at.toISOString() : null,
      first_hearing_date: values.first_hearing_date ? values.first_hearing_date.toISOString().split('T')[0] : null,
      last_postponement_date: values.last_postponement_date ? values.last_postponement_date.toISOString().split('T')[0] : null,
      next_hearing_date: values.next_hearing_date ? values.next_hearing_date.toISOString().split('T')[0] : null,
      original_judgment_date: values.original_judgment_date ? values.original_judgment_date.toISOString().split('T')[0] : null,
      client_id: values.client_id || null,
      court_name: values.court_name || null,
      province: values.province || null,
      jurisdiction_section: values.jurisdiction_section || null,
      appeal_to_court: values.appeal_to_court || null,
      supreme_court_chamber: values.supreme_court_chamber || null,
      postponement_reason: values.postponement_reason || null,
      judgment_text: values.judgment_text || null,
      statute_of_limitations: values.statute_of_limitations || null,
      fees_amount: values.fees_amount || 0,
      fees_status: values.fees_status || null,
      fees_notes: values.fees_notes || null,
      internal_notes: values.internal_notes || null,
      public_summary: values.public_summary || null,
      criminal_offense_type: values.criminal_offense_type || null,
      complaint_filed_with: values.complaint_filed_with || null,
      investigation_number: values.investigation_number || null,
      original_case_number: values.original_case_number || null,
      appellant_or_opponent: values.appellant_or_opponent || null,
      grounds_of_appeal: values.grounds_of_appeal || null,
    };

    if (isEditMode && caseData) {
      updateMutation.mutate({ id: caseData.id, ...caseToSubmit });
    } else {
      createMutation.mutate(caseToSubmit);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "تعديل بيانات القضية" : "إضافة قضية جديدة"}</SheetTitle>
          <SheetDescription>
            {isEditMode ? "قم بتعديل معلومات القضية الحالية." : "أدخل تفاصيل القضية الجديدة هنا."}
          </SheetDescription>
        </SheetHeader>
        <CaseForm
          form={form}
          onSubmit={onSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          clients={clients || []} // Explicitly type clients as Client[]
        />
      </SheetContent>
    </Sheet>
  );
};

export default CaseSheet;
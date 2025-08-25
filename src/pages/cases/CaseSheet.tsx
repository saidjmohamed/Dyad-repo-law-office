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
import { CaseForm } from "./CaseForm"; // Corrected import to named import
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createCase, updateCase } from "./actions";
import { toast } from "sonner";
import { useEffect } from "react";
import { getClients } from "../clients/actions";
import { Client } from "../clients/ClientList"; // Import Client type
import { caseFormSchema, CaseFormValues as CaseFormValuesSchema, PartyFormValues } from "./caseSchema"; // Import CaseFormValues from caseSchema

// Use the schema from caseSchema.ts directly
type CaseSheetFormValues = CaseFormValuesSchema;

interface CaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData?: CaseSheetFormValues & { id: string }; // Use CaseSheetFormValues
}

const CaseSheet = ({ open, onOpenChange, caseData }: CaseSheetProps) => {
  const isEditMode = !!caseData;
  const queryClient = useQueryClient();

  const { data: clients } = useQuery<Client[]>({ // Removed isLoadingClients as it's not used
    queryKey: ["clients"],
    queryFn: () => getClients({}),
  });

  const form = useForm<CaseSheetFormValues>({ // Use CaseSheetFormValues
    resolver: zodResolver(caseFormSchema), // Use the imported schema
    defaultValues: {
      case_category: "مدني",
      procedure_type: "قضية جديدة",
      case_number: "",
      registered_at: new Date(),
      court_name: null,
      province: null,
      jurisdiction_section: null,
      appeal_to_court: null,
      supreme_court_chamber: null,

      plaintiffs: [],
      defendants: [],
      other_parties: [],

      criminal_offense_type: null,
      complaint_filed_with: null,
      investigation_number: null,

      original_case_number: null,
      original_judgment_date: undefined,
      appellant_or_opponent: null,
      grounds_of_appeal: null,

      first_hearing_date: undefined,
      last_postponement_date: undefined,
      postponement_reason: null,
      next_hearing_date: undefined,
      judgment_text: null,
      statute_of_limitations: null,

      fees_amount: 0,
      fees_status: "غير مدفوع",
      fees_notes: null,

      internal_notes: null,
      public_summary: "",
      
      client_id: "", // Must be string for select, then converted to null if empty
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
        // Ensure parties are correctly mapped for form
        plaintiffs: caseData.plaintiffs || [],
        defendants: caseData.defendants || [],
        other_parties: caseData.other_parties || [],
        client_id: caseData.client_id || "", // Ensure client_id is string for select
      });
    } else {
      form.reset({
        case_category: "مدني",
        procedure_type: "قضية جديدة",
        case_number: "",
        registered_at: new Date(),
        court_name: null,
        province: null,
        jurisdiction_section: null,
        appeal_to_court: null,
        supreme_court_chamber: null,

        plaintiffs: [],
        defendants: [],
        other_parties: [],

        criminal_offense_type: null,
        complaint_filed_with: null,
        investigation_number: null,

        original_case_number: null,
        original_judgment_date: undefined,
        appellant_or_opponent: null,
        grounds_of_appeal: null,

        first_hearing_date: undefined,
        last_postponement_date: undefined,
        postponement_reason: null,
        next_hearing_date: undefined,
        judgment_text: null,
        statute_of_limitations: null,

        fees_amount: 0,
        fees_status: "غير مدفوع",
        fees_notes: null,

        internal_notes: null,
        public_summary: "",
        
        client_id: "",
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
    onError: (error: Error) => { // Explicitly type error
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
    onError: (error: Error) => { // Explicitly type error
      toast.error(`فشل تحديث بيانات القضية: ${error.message}`);
    },
  });

  const onSubmit = (values: CaseSheetFormValues) => { // Use CaseSheetFormValues
    const caseToSubmit = {
      ...values,
      registered_at: values.registered_at ? values.registered_at.toISOString() : null,
      first_hearing_date: values.first_hearing_date ? values.first_hearing_date.toISOString() : null, // Keep full ISO string for actions
      last_postponement_date: values.last_postponement_date ? values.last_postponement_date.toISOString() : null, // Keep full ISO string for actions
      next_hearing_date: values.next_hearing_date ? values.next_hearing_date.toISOString() : null, // Keep full ISO string for actions
      original_judgment_date: values.original_judgment_date ? values.original_judgment_date.toISOString() : null, // Keep full ISO string for actions
      client_id: values.client_id || null,
      court_name: values.court_name || null,
      province: values.province || null,
      jurisdiction_section: values.jurisdiction_section || null,
      appeal_to_court: values.appeal_to_court || null,
      supreme_court_chamber: values.supreme_court_chamber || null,
      postponement_reason: values.postponement_reason || null,
      judgment_text: values.judgment_text || null,
      statute_of_limitations: values.statute_of_limitations || null,
      fees_amount: values.fees_amount ?? 0, // Use nullish coalescing for number
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
      // Ensure parties are included in the submission
      plaintiffs: values.plaintiffs,
      defendants: values.defendants,
      other_parties: values.other_parties,
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
          initialData={caseData} // Pass initialData for edit mode
          onSubmit={onSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          clients={clients || []}
        />
      </SheetContent>
    </Sheet>
  );
};

export default CaseSheet;
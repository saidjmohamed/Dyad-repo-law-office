import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Case } from "./actions";
import { useEffect } from "react";
import { caseFormSchema, CaseFormValues } from "./caseSchema";
import { CasePartyFields } from "./CasePartyFields";
import { CaseGeneralInfoFormSection } from "./CaseGeneralInfoFormSection";
import { CaseCourtInfoFormSection } from "./CaseCourtInfoFormSection";
import { CaseCriminalDetailsFormSection } from "./CaseCriminalDetailsFormSection";
import { CaseAppealDetailsFormSection } from "./CaseAppealDetailsFormSection";
import { CaseProceduralDatesFormSection } from "./CaseProceduralDatesFormSection";
import { CaseFinancialsFormSection } from "./CaseFinancialsFormSection";
import { CaseNotesFormSection } from "./CaseNotesFormSection";
import { CaseAccessControlFormSection } from "./CaseAccessControlFormSection";

interface CaseFormProps {
  initialData?: Case;
  onSubmit: (data: CaseFormValues) => void;
  isLoading: boolean;
  clients: { id: string; full_name: string }[];
}

export const CaseForm = ({ initialData, onSubmit, isLoading, clients }: CaseFormProps) => {
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      case_category: initialData?.case_category || "",
      procedure_type: initialData?.procedure_type || "",
      case_number: initialData?.case_number || "",
      registered_at: initialData?.registered_at ? new Date(initialData.registered_at) : new Date(),
      court_name: initialData?.court_name || null,
      province: initialData?.province || null,
      jurisdiction_section: initialData?.jurisdiction_section || null,
      appeal_to_court: initialData?.appeal_to_court || null,
      supreme_court_chamber: initialData?.supreme_court_chamber || null,

      plaintiffs: initialData?.case_parties?.filter(p => p.party_type === 'plaintiff').map(p => ({ ...p, id: p.id })) || [],
      defendants: initialData?.case_parties?.filter(p => p.party_type === 'defendant').map(p => ({ ...p, id: p.id })) || [],
      other_parties: initialData?.case_parties?.filter(p => p.party_type === 'other').map(p => ({ ...p, id: p.id })) || [],

      criminal_offense_type: initialData?.criminal_offense_type || null,
      complaint_filed_with: initialData?.complaint_filed_with || null,
      investigation_number: initialData?.investigation_number || null,

      original_case_number: initialData?.original_case_number || null,
      original_judgment_date: initialData?.original_judgment_date ? new Date(initialData.original_judgment_date) : undefined,
      appellant_or_opponent: initialData?.appellant_or_opponent || null,
      grounds_of_appeal: initialData?.grounds_of_appeal || null,

      first_hearing_date: initialData?.first_hearing_date ? new Date(initialData.first_hearing_date) : undefined,
      last_postponement_date: initialData?.last_postponement_date ? new Date(initialData.last_postponement_date) : undefined,
      postponement_reason: initialData?.postponement_reason || null,
      next_hearing_date: initialData?.next_hearing_date ? new Date(initialData.next_hearing_date) : undefined,
      judgment_text: initialData?.judgment_text || null,
      statute_of_limitations: initialData?.statute_of_limitations || null,

      fees_amount: initialData?.fees_amount ?? null,
      fees_status: initialData?.fees_status || null,
      fees_notes: initialData?.fees_notes || null,

      internal_notes: initialData?.internal_notes || null,
      public_summary: initialData?.public_summary || null,

      created_by: initialData?.created_by || null,
      created_at: initialData?.created_at ? new Date(initialData.created_at) : new Date(),
      last_modified_by: initialData?.last_modified_by || null,
      updated_at: initialData?.updated_at ? new Date(initialData.updated_at) : undefined,
      access_control: initialData?.access_control || [],
      client_id: initialData?.client_id || null,
    },
  });

  const selectedCaseCategory = form.watch("case_category");
  const selectedProcedureType = form.watch("procedure_type");

  const showCriminalDetails = selectedCaseCategory === "جزائي";
  const showAppealDetails = ["استئناف", "معارضة", "طعن بالنقض", "إلتماس إعادة النظر"].includes(selectedProcedureType);

  // Reset conditional fields when conditions change
  useEffect(() => {
    if (!showCriminalDetails) {
      form.setValue("criminal_offense_type", null);
      form.setValue("complaint_filed_with", null);
      form.setValue("investigation_number", null);
    }
    if (!showAppealDetails) {
      form.setValue("original_case_number", null);
      form.setValue("original_judgment_date", null);
      form.setValue("appellant_or_opponent", null);
      form.setValue("grounds_of_appeal", null);
    }
  }, [showCriminalDetails, showAppealDetails, form]);

  // Log form validation errors for debugging
  useEffect(() => {
    if (form.formState.errors && Object.keys(form.formState.errors).length > 0) {
      console.log("Form validation errors:", form.formState.errors);
    }
  }, [form.formState.errors]);

  const handleFormSubmit = (data: CaseFormValues) => {
    console.log("Form data submitted:", data);
    onSubmit(data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <CaseGeneralInfoFormSection clients={clients} />
        <CaseCourtInfoFormSection />

        {/* بيانات الأطراف */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">بيانات الأطراف</h2>
          <CasePartyFields name="plaintiffs" label="المدعي/المدعون" partyType="plaintiff" />
          <CasePartyFields name="defendants" label="المدعى عليه/المدعى عليهم" partyType="defendant" />
          <CasePartyFields name="other_parties" label="أطراف أخرى" partyType="other" showRoleSelect={true} />
        </div>

        {showCriminalDetails && <CaseCriminalDetailsFormSection />}
        {showAppealDetails && <CaseAppealDetailsFormSection />}
        
        <CaseProceduralDatesFormSection />
        <CaseFinancialsFormSection />
        <CaseNotesFormSection />
        <CaseAccessControlFormSection />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "جاري الحفظ..." : "حفظ القضية"}
        </Button>
      </form>
    </FormProvider>
  );
};
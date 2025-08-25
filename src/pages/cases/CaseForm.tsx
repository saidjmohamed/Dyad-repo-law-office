import { useForm, FormProvider, UseFormReturn } from "react-hook-form"; // Added UseFormReturn
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
  form: UseFormReturn<CaseFormValues>; // Pass the form instance from parent
}

export const CaseForm = ({ initialData, onSubmit, isLoading, clients, form }: CaseFormProps) => {
  // The form instance is now passed as a prop, so we don't create it here.
  // We use form.reset in CaseSheet.tsx to set default values.

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
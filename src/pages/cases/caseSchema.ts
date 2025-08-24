import { z } from "zod";

// Schema for individual party
export const partySchema = z.object({
  id: z.string().uuid().optional(), // Added for existing parties during update
  name: z.string().min(1, "الاسم واللقب مطلوب"),
  role: z.string().optional().nullable(), // For 'other_parties'
  party_type: z.enum(['plaintiff', 'defendant', 'other'], { required_error: "نوع الطرف مطلوب" }), // Enforce specific types
  role_detail: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  id_number: z.string().optional().nullable(),
  contact: z.string().optional().nullable(),
  representative: z.string().optional().nullable(),
});

export type PartyFormValues = z.infer<typeof partySchema>; // Exported for use in actions.ts

export const caseFormSchema = z.object({
  case_category: z.string().min(1, "نوع القضية مطلوب"),
  procedure_type: z.string().min(1, "نوع الإجراء مطلوب"),
  case_number: z.string().min(1, "رقم القضية مطلوب").max(50, "رقم القضية لا يمكن أن يتجاوز 50 حرفًا"), // Made required
  registered_at: z.date({ required_error: "تاريخ تسجيل القضية مطلوب" }),
  court_name: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  jurisdiction_section: z.string().optional().nullable(),
  appeal_to_court: z.string().optional().nullable(),
  supreme_court_chamber: z.string().optional().nullable(),

  // Parties - these will be handled as arrays of partySchema
  plaintiffs: z.array(partySchema).min(1, "يجب إضافة مدعي واحد على الأقل"),
  defendants: z.array(partySchema).min(1, "يجب إضافة مدعى عليه واحد على الأقل"),
  other_parties: z.array(partySchema).optional(),

  // Criminal Details (Conditional)
  criminal_offense_type: z.string().optional().nullable(),
  complaint_filed_with: z.string().optional().nullable(),
  investigation_number: z.string().optional().nullable(),

  // Appeal Details (Conditional)
  original_case_number: z.string().optional().nullable(),
  original_judgment_date: z.date().optional().nullable(),
  appellant_or_opponent: z.string().optional().nullable(),
  grounds_of_appeal: z.string().max(4000, "أسباب الطعن لا يمكن أن تتجاوز 4000 حرفًا").optional().nullable(),

  // Procedural Dates
  first_hearing_date: z.date().optional().nullable(),
  last_postponement_date: z.date().optional().nullable(),
  postponement_reason: z.string().max(1000, "سبب التأجيل لا يمكن أن يتجاوز 1000 حرفًا").optional().nullable(),
  next_hearing_date: z.date().optional().nullable(),
  judgment_text: z.string().max(8000, "نص الحكم لا يمكن أن يتجاوز 8000 حرفًا").optional().nullable(),
  statute_of_limitations: z.string().optional().nullable(),

  // Finance
  fees_amount: z.coerce.number()
    .optional()
    .nullable()
    .refine((val) => val === null || (typeof val === 'number' && val >= 0), {
      message: "مبلغ الأتعاب يجب أن يكون رقمًا موجبًا",
    }),
  fees_status: z.string().optional().nullable(),
  fees_notes: z.string().optional().nullable(),

  // Notes
  internal_notes: z.string().optional().nullable(),
  public_summary: z.string().max(1000, "الملخص العام لا يمكن أن يتجاوز 1000 حرفًا").optional().nullable(),

  // Audit/Access Control (will be set by backend or pre-filled)
  created_by: z.string().uuid().optional().nullable(),
  created_at: z.date().optional().nullable(),
  last_modified_by: z.string().uuid().optional().nullable(),
  last_modified_at: z.date().optional().nullable(),
  access_control: z.array(z.string()).optional().nullable(),

  // Client ID for linking
  client_id: z.string().uuid().optional().nullable(), // Added client_id to schema
});

export type CaseFormValues = z.infer<typeof caseFormSchema>;

// Type for attachments (for file upload component)
export const attachmentSchema = z.object({
  file: z.instanceof(File, { message: "الملف مطلوب" }),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type AttachmentFormValues = z.infer<typeof attachmentSchema>;
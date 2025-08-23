import { z } from "zod";

export const caseFormSchema = z.object({
  case_type: z.string().min(1, "نوع القضية مطلوب"),
  court: z.string().optional().nullable(),
  division: z.string().optional().nullable(),
  criminal_subtype: z.string().optional().nullable(),
  case_number: z.string().min(1, "رقم القضية مطلوب"),
  filing_date: z.date().optional().nullable(),
  role_in_favor: z.string().optional().nullable(),
  role_against: z.string().optional().nullable(),
  last_adjournment_date: z.date().optional().nullable(),
  last_adjournment_reason: z.string().optional().nullable(),
  next_hearing_date: z.date().optional().nullable(),
  judgment_summary: z.string().optional().nullable(),
  status: z.string().min(1, "الحالة مطلوبة"),
  client_id: z.string().optional().nullable(),
  fees_estimated: z.coerce.number()
    .optional()
    .nullable()
    .refine((val) => val === null || (typeof val === 'number' && val >= 0), {
      message: "الرسوم المقدرة يجب أن تكون رقمًا موجبًا",
    }),
  notes: z.string().optional().nullable(),
});

export type CaseFormValues = z.infer<typeof caseFormSchema>;
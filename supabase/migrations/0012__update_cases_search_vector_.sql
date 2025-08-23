CREATE OR REPLACE FUNCTION public.update_cases_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.search_vector := to_tsvector('simple', unaccent(
    coalesce(NEW.case_category,'') || ' ' ||
    coalesce(NEW.procedure_type,'') || ' ' ||
    coalesce(NEW.court_name,'') || ' ' ||
    coalesce(NEW.province,'') || ' ' ||
    coalesce(NEW.jurisdiction_section,'') || ' ' ||
    coalesce(NEW.case_number,'') || ' ' ||
    coalesce(NEW.postponement_reason,'') || ' ' ||
    coalesce(NEW.judgment_text,'') || ' ' ||
    coalesce(NEW.status,'') || ' ' ||
    coalesce(NEW.internal_notes,'') || ' ' ||
    coalesce(NEW.public_summary,'') || ' ' ||
    coalesce(NEW.criminal_offense_type,'') || ' ' ||
    coalesce(NEW.complaint_filed_with,'') || ' ' ||
    coalesce(NEW.investigation_number,'') || ' ' ||
    coalesce(NEW.original_case_number,'') || ' ' ||
    coalesce(NEW.appellant_or_opponent,'') || ' ' ||
    coalesce(NEW.grounds_of_appeal,'')
  ));
  RETURN NEW;
END;
$function$;
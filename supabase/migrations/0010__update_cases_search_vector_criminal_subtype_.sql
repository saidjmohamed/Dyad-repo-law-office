CREATE OR REPLACE FUNCTION public.update_cases_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.search_vector := to_tsvector('simple', unaccent(
    coalesce(NEW.case_type,'') || ' ' ||
    coalesce(NEW.court,'') || ' ' ||
    coalesce(NEW.division,'') || ' ' ||
    coalesce(NEW.case_number,'') || ' ' ||
    coalesce(NEW.last_adjournment_reason,'') || ' ' ||
    coalesce(NEW.judgment_summary,'') || ' ' ||
    coalesce(NEW.status,'') || ' ' ||
    coalesce(NEW.notes,'') || ' ' ||
    coalesce(NEW.criminal_subtype,'')
  ));
  RETURN NEW;
END;
$function$;
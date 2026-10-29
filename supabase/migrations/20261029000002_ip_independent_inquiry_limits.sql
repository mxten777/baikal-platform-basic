CREATE FUNCTION public.consume_contact_challenge_budget() RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE n integer;
BEGIN
  INSERT INTO private.contact_request_windows
    VALUES ('challenge', date_trunc('minute', now()), 1, now() + interval '1 hour')
  ON CONFLICT (bucket_key, window_start) DO UPDATE
    SET request_count = LEAST(private.contact_request_windows.request_count + 1, 31)
  RETURNING request_count INTO n;
  RETURN n <= 30;
END $$;

CREATE FUNCTION public.create_contact_inquiry(
  p_key uuid, p_hmac text, p_name text, p_email text, p_company text, p_message text,
  p_project_slug text, p_type text, p_solution text, p_consent_version text,
  p_retention_version text, p_retention_days integer, p_email_hmac text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  row public.contact_inquiries;
  project uuid;
  bucket record;
  n integer;
BEGIN
  IF p_retention_days IS NULL OR p_retention_days NOT BETWEEN 1 AND 3650
    OR nullif(p_consent_version, '') IS NULL OR nullif(p_retention_version, '') IS NULL
    OR p_hmac IS NULL OR p_hmac !~ '^[a-f0-9]{64}$'
    OR p_email_hmac IS NULL OR p_email_hmac !~ '^[a-f0-9]{64}$'
    THEN RAISE EXCEPTION 'POLICY_NOT_CONFIGURED'; END IF;
  IF p_project_slug IS NOT NULL THEN
    SELECT id INTO project FROM public.projects WHERE slug = p_project_slug AND status = 'active';
    IF project IS NULL THEN RAISE EXCEPTION 'INVALID_PROJECT'; END IF;
  END IF;
  INSERT INTO public.contact_inquiries
    (idempotency_key, payload_hmac, name, email, company, message, project_id, inquiry_type,
      solution, consent_version, retention_policy_version, expires_at)
    VALUES (p_key, p_hmac, p_name, p_email, p_company, p_message, project, p_type,
      p_solution, p_consent_version, p_retention_version, now() + make_interval(days => p_retention_days))
    ON CONFLICT (idempotency_key) DO NOTHING RETURNING * INTO row;
  IF row.id IS NULL THEN
    SELECT * INTO STRICT row FROM public.contact_inquiries WHERE idempotency_key = p_key;
    IF row.payload_hmac <> p_hmac THEN RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT'; END IF;
    RETURN jsonb_build_object('receipt_number', row.receipt_number, 'received_at', row.created_at, 'replayed', true);
  END IF;
  FOR bucket IN SELECT * FROM (VALUES
    ('accepted', date_trunc('minute', now()), 30),
    ('email/' || p_email_hmac, date_trunc('hour', now()) +
      floor(extract(minute FROM now()) / 10) * interval '10 minutes', 5)
  ) AS b(key, start_at, max_count) ORDER BY key LOOP
    INSERT INTO private.contact_request_windows
      VALUES (bucket.key, bucket.start_at, 1, now() + interval '1 hour')
    ON CONFLICT (bucket_key, window_start) DO UPDATE
      SET request_count = private.contact_request_windows.request_count + 1
    RETURNING request_count INTO n;
    IF n > bucket.max_count THEN RAISE EXCEPTION 'RATE_LIMITED'; END IF;
  END LOOP;
  RETURN jsonb_build_object('receipt_number', row.receipt_number, 'received_at', row.created_at, 'replayed', false);
END $$;

REVOKE ALL ON FUNCTION public.consume_contact_challenge_budget(),
  public.create_contact_inquiry(uuid,text,text,text,text,text,text,text,text,text,text,integer,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_contact_challenge_budget(),
  public.create_contact_inquiry(uuid,text,text,text,text,text,text,text,text,text,text,integer,text)
  TO service_role;

DROP FUNCTION public.consume_contact_rate(text);
DROP FUNCTION public.create_contact_inquiry(uuid,text,text,text,text,text,text,text,text,text,text,integer);

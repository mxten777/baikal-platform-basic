CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE public.contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text NOT NULL UNIQUE DEFAULT ('BQ-' || upper(gen_random_uuid()::text)),
  idempotency_key uuid NOT NULL UNIQUE,
  payload_hmac text NOT NULL,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 80),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254 AND email !~ E'[\\r\\n]'),
  company text CHECK (char_length(company) <= 120),
  message text NOT NULL CHECK (char_length(btrim(message)) BETWEEN 10 AND 5000),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  inquiry_type text CHECK (inquiry_type IN ('demo', 'inquiry', 'brochure')),
  solution text CHECK (solution IN ('safelyn', 'private-ai', 'ai-automation', 'the-lit')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'spam')),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  handled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  consent_version text NOT NULL,
  consented_at timestamptz NOT NULL DEFAULT now(),
  retention_policy_version text NOT NULL,
  expires_at timestamptz NOT NULL CHECK (expires_at > created_at),
  notification_status text NOT NULL DEFAULT 'queued'
    CHECK (notification_status IN ('queued', 'processing', 'accepted', 'failed', 'unknown')),
  notification_attempts integer NOT NULL DEFAULT 0 CHECK (notification_attempts >= 0),
  notification_first_attempt_at timestamptz,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  lease_until timestamptz,
  notification_claim_id uuid,
  notification_generation integer NOT NULL DEFAULT 1,
  provider_message_id text,
  notification_last_code text,
  notified_at timestamptz
);
CREATE INDEX contact_inquiries_created ON public.contact_inquiries(created_at DESC, id DESC);
CREATE INDEX contact_inquiries_status ON public.contact_inquiries(status, created_at DESC, id DESC);
CREATE INDEX contact_inquiries_due ON public.contact_inquiries(next_attempt_at)
  WHERE notification_status IN ('queued', 'processing');
CREATE INDEX contact_inquiries_expiry ON public.contact_inquiries(expires_at);

CREATE TABLE public.contact_inquiry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.contact_inquiries(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  from_status text NOT NULL,
  to_status text NOT NULL,
  happened_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE private.contact_request_windows (
  bucket_key text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL CHECK (request_count > 0),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (bucket_key, window_start)
);
REVOKE ALL ON private.contact_request_windows FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.contact_request_windows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contact_inquiries, public.contact_inquiry_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.contact_inquiries, public.contact_inquiry_events TO authenticated;
GRANT ALL ON public.contact_inquiries, public.contact_inquiry_events TO service_role;
CREATE POLICY contact_admin_read ON public.contact_inquiries FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL AND COALESCE(auth.jwt()->'app_metadata'->>'role', '') = 'admin');
CREATE POLICY contact_events_admin_read ON public.contact_inquiry_events FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL AND COALESCE(auth.jwt()->'app_metadata'->>'role', '') = 'admin');

CREATE VIEW public.contact_inquiry_list WITH (security_invoker = true) AS
  SELECT id, receipt_number, company, project_id, status, version, created_at, updated_at,
    notification_status, notification_last_code, next_attempt_at
  FROM public.contact_inquiries;
REVOKE ALL ON public.contact_inquiry_list FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.contact_inquiry_list TO authenticated;

CREATE FUNCTION public.consume_contact_rate(p_ip_key text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  n integer;
  allowed boolean := true;
  bucket record;
BEGIN
  IF p_ip_key !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'INVALID_RATE_KEY'; END IF;
  FOR bucket IN SELECT * FROM (VALUES
    ('global', date_trunc('minute', now()), 30, interval '1 hour'),
    ('ip/' || p_ip_key, date_trunc('hour', now()) +
      floor(extract(minute FROM now()) / 10) * interval '10 minutes', 5, interval '1 hour')
  ) AS b(key, start_at, max_count, ttl) ORDER BY key LOOP
    INSERT INTO private.contact_request_windows VALUES (bucket.key, bucket.start_at, 1, now() + bucket.ttl)
    ON CONFLICT (bucket_key, window_start) DO UPDATE
      SET request_count = private.contact_request_windows.request_count + 1
    RETURNING request_count INTO n;
    allowed := allowed AND n <= bucket.max_count;
  END LOOP;
  RETURN allowed;
END $$;

CREATE FUNCTION public.create_contact_inquiry(
  p_key uuid, p_hmac text, p_name text, p_email text, p_company text, p_message text,
  p_project_slug text, p_type text, p_solution text, p_consent_version text,
  p_retention_version text, p_retention_days integer
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  row public.contact_inquiries;
  project uuid;
BEGIN
  IF p_retention_days NOT BETWEEN 1 AND 3650 OR nullif(p_consent_version, '') IS NULL
    OR nullif(p_retention_version, '') IS NULL OR p_hmac !~ '^[a-f0-9]{64}$'
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
  IF row.id IS NOT NULL THEN
    RETURN jsonb_build_object('receipt_number', row.receipt_number, 'received_at', row.created_at, 'replayed', false);
  END IF;
  SELECT * INTO STRICT row FROM public.contact_inquiries WHERE idempotency_key = p_key;
  IF row.payload_hmac <> p_hmac THEN RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT'; END IF;
  RETURN jsonb_build_object('receipt_number', row.receipt_number, 'received_at', row.created_at, 'replayed', true);
END $$;

CREATE FUNCTION public.admin_update_contact_inquiry(p_id uuid, p_version integer, p_status text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE row public.contact_inquiries; old_status text;
BEGIN
  IF auth.uid() IS NULL OR COALESCE(auth.jwt()->'app_metadata'->>'role', '') <> 'admin'
    THEN RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501'; END IF;
  SELECT * INTO row FROM public.contact_inquiries WHERE id = p_id FOR UPDATE;
  IF row.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  IF row.version <> p_version THEN RAISE EXCEPTION 'VERSION_CONFLICT'; END IF;
  IF NOT ((row.status = 'new' AND p_status IN ('in_progress','spam'))
    OR (row.status = 'in_progress' AND p_status IN ('resolved','spam'))
    OR (row.status IN ('resolved','spam') AND p_status = 'new'))
    THEN RAISE EXCEPTION 'INVALID_TRANSITION'; END IF;
  old_status := row.status;
  UPDATE public.contact_inquiries SET status = p_status, version = version + 1,
    updated_at = now(), handled_by = auth.uid() WHERE id = p_id RETURNING * INTO row;
  INSERT INTO public.contact_inquiry_events(inquiry_id, actor_id, from_status, to_status)
    VALUES (p_id, auth.uid(), old_status, p_status);
  RETURN jsonb_build_object('status', row.status, 'version', row.version, 'updated_at', row.updated_at);
END $$;

CREATE FUNCTION public.admin_retry_contact_notification(p_id uuid, p_version integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL OR COALESCE(auth.jwt()->'app_metadata'->>'role', '') <> 'admin'
    THEN RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501'; END IF;
  UPDATE public.contact_inquiries SET notification_status = 'queued',
    notification_generation = notification_generation + 1, notification_attempts = 0,
    notification_first_attempt_at = NULL, notification_last_code = NULL,
    next_attempt_at = now(), version = version + 1, updated_at = now()
    WHERE id = p_id AND version = p_version AND notification_status = 'failed' AND expires_at > now();
  IF NOT FOUND THEN RAISE EXCEPTION 'VERSION_OR_STATE_CONFLICT'; END IF;
END $$;

CREATE FUNCTION public.claim_contact_notifications() RETURNS SETOF public.contact_inquiries
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE row public.contact_inquiries; daily integer;
BEGIN
  UPDATE public.contact_inquiries SET notification_status = 'unknown', notification_last_code = 'RETRY_WINDOW_EXPIRED'
    WHERE notification_status IN ('queued','processing')
      AND (notification_first_attempt_at < now() - interval '23 hours' OR notification_attempts >= 5)
      AND (lease_until IS NULL OR lease_until < now());
  FOR row IN SELECT * FROM public.contact_inquiries
    WHERE expires_at > now() + interval '2 minutes' AND status <> 'spam' AND notification_attempts < 5
      AND ((notification_status = 'queued' AND next_attempt_at <= now())
        OR (notification_status = 'processing' AND lease_until < now()))
    ORDER BY next_attempt_at FOR UPDATE SKIP LOCKED LIMIT 10 LOOP
    INSERT INTO private.contact_request_windows VALUES ('mail', date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC', 1, now() + interval '2 days')
    ON CONFLICT (bucket_key,window_start) DO UPDATE SET request_count = private.contact_request_windows.request_count + 1
    RETURNING request_count INTO daily;
    IF daily > 90 THEN EXIT; END IF;
    UPDATE public.contact_inquiries SET notification_status = 'processing',
      notification_attempts = notification_attempts + 1,
      notification_first_attempt_at = COALESCE(notification_first_attempt_at, now()),
      notification_claim_id = gen_random_uuid(), lease_until = now() + interval '2 minutes'
      WHERE id = row.id RETURNING * INTO row;
    RETURN NEXT row;
  END LOOP;
END $$;

CREATE FUNCTION public.finish_contact_notification(
  p_id uuid, p_claim uuid, p_status text, p_code text, p_provider_id text, p_delay integer
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF p_status NOT IN ('accepted','queued','failed','unknown')
    OR p_code NOT IN ('ACCEPTED','RATE_LIMITED','PROVIDER_REJECTED','PROVIDER_UNAVAILABLE','DELIVERY_UNCERTAIN')
    OR p_delay NOT BETWEEN 1 AND 86400 THEN RAISE EXCEPTION 'INVALID_NOTIFICATION_RESULT'; END IF;
  UPDATE public.contact_inquiries SET
    notification_status = CASE WHEN p_status = 'queued' AND notification_attempts >= 5 THEN 'unknown' ELSE p_status END,
    notification_last_code = p_code, provider_message_id = left(p_provider_id, 200),
    notified_at = CASE WHEN p_status = 'accepted' THEN now() ELSE notified_at END,
    next_attempt_at = now() + make_interval(secs => p_delay), lease_until = NULL,
    notification_claim_id = NULL
    WHERE id = p_id AND notification_claim_id = p_claim AND notification_status = 'processing';
  RETURN FOUND;
END $$;

CREATE FUNCTION public.cleanup_contact_inquiries() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE removed integer;
BEGIN
  DELETE FROM public.contact_inquiries WHERE expires_at <= now()
    AND (lease_until IS NULL OR lease_until < now());
  GET DIAGNOSTICS removed = ROW_COUNT;
  DELETE FROM private.contact_request_windows WHERE expires_at <= now();
  RETURN removed;
END $$;

REVOKE ALL ON FUNCTION public.consume_contact_rate(text),
  public.create_contact_inquiry(uuid,text,text,text,text,text,text,text,text,text,text,integer),
  public.claim_contact_notifications(),
  public.finish_contact_notification(uuid,uuid,text,text,text,integer),
  public.cleanup_contact_inquiries(),
  public.admin_update_contact_inquiry(uuid,integer,text),
  public.admin_retry_contact_notification(uuid,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_contact_rate(text),
  public.create_contact_inquiry(uuid,text,text,text,text,text,text,text,text,text,text,integer),
  public.claim_contact_notifications(),
  public.finish_contact_notification(uuid,uuid,text,text,text,integer),
  public.cleanup_contact_inquiries() TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_contact_inquiry(uuid,integer,text),
  public.admin_retry_contact_notification(uuid,integer) TO authenticated;

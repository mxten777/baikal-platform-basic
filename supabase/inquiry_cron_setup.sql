-- Approval required: run only after Vault entries and the worker have been verified.
-- Required Vault names: inquiry_function_url (full function URL), inquiry_job_secret.
-- Existing jobs are never replaced by this script.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname IN ('contact-notifications', 'contact-cleanup')) THEN
    RAISE EXCEPTION 'Contact jobs already exist; inspect before changing them';
  END IF;
  IF (SELECT count(*) FROM vault.decrypted_secrets
      WHERE name IN ('inquiry_function_url','inquiry_job_secret')) <> 2 THEN
    RAISE EXCEPTION 'Required contact Vault configuration is missing or ambiguous';
  END IF;
  PERFORM cron.schedule('contact-notifications', '* * * * *', $job$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='inquiry_function_url'),
      headers := jsonb_build_object('Content-Type','application/json','Authorization',
        'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='inquiry_job_secret')),
      body := '{"action":"notifications"}'::jsonb);
  $job$);
  PERFORM cron.schedule('contact-cleanup', '17 3 * * *', $job$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='inquiry_function_url'),
      headers := jsonb_build_object('Content-Type','application/json','Authorization',
        'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='inquiry_job_secret')),
      body := '{"action":"cleanup"}'::jsonb);
  $job$);
END $$;
